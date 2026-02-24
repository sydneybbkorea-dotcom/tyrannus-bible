// pdf-annotations.js — PDF annotation data model and rendering
// Stores annotations in IDB 'pdf-annots' store

var PDFAnnotations = (function(){

  var _annotsByPage = new Map(); // pdfId:pageNum → annotArray

  // Load annotations for a PDF
  function load(pdfId){
    return IDBStore.getAllByIndex('pdf-annots', 'pdfId', pdfId).then(function(annots){
      _annotsByPage.clear();
      annots.forEach(function(a){
        var key = a.pdfId + ':' + a.pageNum;
        if(!_annotsByPage.has(key)) _annotsByPage.set(key, []);
        _annotsByPage.get(key).push(a);
      });
      return annots;
    });
  }

  // Save an annotation
  function save(annot){
    if(!annot.id) annot.id = 'annot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    if(!annot.createdAt) annot.createdAt = Date.now();

    var key = annot.pdfId + ':' + annot.pageNum;
    if(!_annotsByPage.has(key)) _annotsByPage.set(key, []);

    var existing = _annotsByPage.get(key);
    var idx = existing.findIndex(function(a){ return a.id === annot.id; });
    if(idx >= 0) existing[idx] = annot;
    else existing.push(annot);

    // Register in LinkRegistry if annotation has a linked URI
    if(annot.linkedUri && typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady()){
      var annotUri = TyrannusURI.pdfAnnot(annot.pdfId, annot.id);
      LinkRegistry.addLink(annotUri, annot.linkedUri, 'annotation', {
        label: annot.text || 'PDF annotation',
        page: annot.pageNum
      });
    }

    if(typeof EventBus !== 'undefined') EventBus.emit('pdf:annotated', annot);

    return IDBStore.put('pdf-annots', annot).then(function(result){
      // 클라우드 동기화 트리거
      if(window.persistPdfAnnotsToCloud) window.persistPdfAnnotsToCloud();
      return result;
    });
  }

  // Delete an annotation
  function remove(annotId, pdfId, pageNum){
    var key = pdfId + ':' + pageNum;
    var arr = _annotsByPage.get(key);
    if(arr){
      _annotsByPage.set(key, arr.filter(function(a){ return a.id !== annotId; }));
    }
    return IDBStore.del('pdf-annots', annotId).then(function(){
      if(window.persistPdfAnnotsToCloud) window.persistPdfAnnotsToCloud();
    });
  }

  // Get annotations for a page
  function getPage(pdfId, pageNum){
    var key = pdfId + ':' + pageNum;
    return _annotsByPage.get(key) || [];
  }

  // 해당 페이지 모든 어노테이션 삭제
  function clearPage(pdfId, pageNum){
    var key = pdfId + ':' + pageNum;
    var annots = _annotsByPage.get(key) || [];
    var ids = annots.map(function(a){ return a.id; });
    _annotsByPage.set(key, []);
    // IDB에서 삭제
    var promises = ids.map(function(id){ return IDBStore.del('pdf-annots', id); });
    Promise.all(promises).then(function(){
      if(window.persistPdfAnnotsToCloud) window.persistPdfAnnotsToCloud();
    });
    // 레이어 리렌더
    var layer = document.querySelector('.pdf-annot-layer[data-page="' + pageNum + '"]');
    if(layer){
      var vp = { scale: (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() || 1 : 1 };
      renderPage(pageNum, layer, vp);
    }
  }

  // Render annotations on a page's annotation layer
  function renderPage(pageNum, layerEl, viewport){
    var pdfId = PDFViewer.getCurrentPdfId();
    if(!pdfId) return;

    var annots = getPage(pdfId, pageNum);
    layerEl.innerHTML = '';

    annots.forEach(function(annot){
      var el = _createAnnotElement(annot, viewport);
      if(el) layerEl.appendChild(el);
    });

    // 바깥 클릭 시 열린 버블 닫기 (1회 등록)
    if(!layerEl._bubbleListener){
      layerEl._bubbleListener = true;
      layerEl.addEventListener('click', function(){
        document.querySelectorAll('.pdf-memo-bubble.open').forEach(function(b){ b.classList.remove('open'); });
      });
    }
  }

  function _escHtml(s){
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function _insertMemoToNote(annot){
    var pdfId = annot.pdfId;
    var pageNum = annot.pageNum;
    var annotId = annot.id;
    var text = annot.text || '';
    var color = annot.color || '';

    // PDF 제목 조회
    var pdfTitle = '';
    if(typeof S !== 'undefined' && S.pdfFiles){
      var found = S.pdfFiles.find(function(f){ return f.id === pdfId; });
      if(found) pdfTitle = found.name || '';
    }
    // 하이라이트 색상 → border-left 색상
    var borderColor = '#f05050';
    if(color){
      if(color.charAt(0) === '#') borderColor = color;
      else {
        var m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if(m) borderColor = '#' + ((1<<24)+(parseInt(m[1])<<16)+(parseInt(m[2])<<8)+parseInt(m[3])).toString(16).slice(1);
      }
    }

    // 노트 에디터에 citation 블록 삽입
    var uri = TyrannusURI.pdf(pdfId, pageNum);
    var citationHTML = '<div class="pdf-cite" data-uri="' + TyrannusURI.pdfAnnot(pdfId, annotId) + '" data-color="' + _escHtml(borderColor) + '" contenteditable="false" '
      + 'style="border-left-color:' + _escHtml(borderColor) + '" '
      + 'onclick="NavigationRouter.navigateTo(\'' + uri + '\')">'
      + '<i class="fa fa-file-pdf"></i>'
      + '<div class="pdf-cite-body">'
      + (pdfTitle ? '<span class="pdf-cite-title" contenteditable="true" onclick="event.stopPropagation()">' + _escHtml(pdfTitle) + '</span>' : '')
      + '<span class="pdf-cite-text">' + _escHtml(text) + '</span>'
      + '</div>'
      + '<span class="pdf-cite-ref">p.' + pageNum + '</span>'
      + '</div>&#8203;';

    var nc = document.getElementById('noteContent');
    if(nc){
      nc.focus();
      document.execCommand('insertHTML', false, citationHTML);

      // LinkRegistry 등록
      if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady() && S.curNoteId){
        LinkRegistry.addLink(
          TyrannusURI.note(S.curNoteId),
          TyrannusURI.pdfAnnot(pdfId, annotId),
          'annotation',
          { label: text.slice(0, 50), page: pageNum }
        );
      }
      if(typeof toast === 'function') toast('메모가 노트에 추가됨 ✓');
    } else {
      if(typeof toast === 'function') toast('노트를 먼저 열어주세요');
    }
  }

  function _createAnnotElement(annot, viewport){
    var el;

    switch(annot.type){
      case 'highlight':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-highlight';
        _positionRect(el, annot.rect, viewport);
        if(annot.color) el.style.background = annot.color;

        // Drag-to-note: make highlight draggable
        el.setAttribute('draggable', 'true');
        (function(annotRef){
          el.addEventListener('dragstart', function(ev){
            if(typeof PDFDragToNote !== 'undefined' && PDFDragToNote.onAnnotDragStart){
              PDFDragToNote.onAnnotDragStart(ev, annotRef);
            }
          });
        })(annot);

        // Click → tag popup
        (function(annotRef, elRef){
          elRef.addEventListener('click', function(ev){
            ev.stopPropagation();
            _showTagPopup(annotRef, elRef, viewport);
          });
        })(annot, el);

        // Tag badge display
        if(annot.tags && annot.tags.length){
          var tagBadge = document.createElement('span');
          tagBadge.className = 'pdf-annot-tag-badge';
          tagBadge.textContent = annot.tags[0] + (annot.tags.length > 1 ? ' +' + (annot.tags.length-1) : '');
          el.appendChild(tagBadge);
        }

        // Note link badge (when linked to a note)
        if(annot.linkedNoteId){
          var badge = document.createElement('span');
          badge.className = 'pdf-annot-link-badge';
          badge.innerHTML = '<i class="fa fa-pen-to-square"></i>';
          badge.title = '연결된 노트로 이동';
          (function(linkedUri){
            badge.addEventListener('click', function(ev){
              ev.stopPropagation();
              if(typeof NavigationRouter !== 'undefined' && linkedUri){
                NavigationRouter.navigateTo(linkedUri);
              }
            });
          })(annot.linkedUri);
          el.appendChild(badge);
        }
        break;

      case 'underline':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-underline';
        _positionRect(el, annot.rect, viewport);
        if(annot.color) el.style.borderBottomColor = annot.color;

        // 클릭 → 삭제 버튼
        (function(annotRef, elRef, vp){
          elRef.addEventListener('click', function(e){
            e.stopPropagation();
            _showAnnotDeleteBtn(elRef, annotRef, vp);
          });
        })(annot, el, viewport);
        break;

      case 'freehand':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        el.setAttribute('class', 'pdf-annot pdf-annot-freehand');
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.overflow = 'visible';

        if(annot.points && annot.points.length > 1){
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          var d = 'M ' + _pdfToView(annot.points[0].x, viewport) + ' ' + _pdfToViewY(annot.points[0].y, viewport);
          for(var i = 1; i < annot.points.length; i++){
            d += ' L ' + _pdfToView(annot.points[i].x, viewport) + ' ' + _pdfToViewY(annot.points[i].y, viewport);
          }
          path.setAttribute('d', d);
          path.setAttribute('stroke', annot.color || '#000');
          path.setAttribute('stroke-width', annot.strokeWidth || '2');
          // opacity 적용
          var fhOpacity = annot.opacity != null ? annot.opacity : 1;
          path.setAttribute('stroke-opacity', fhOpacity);
          // 펜 종류별 linecap
          var fhPenType = annot.penType || 'ballpen';
          if(fhPenType === 'highlighter'){
            path.setAttribute('stroke-linecap', 'square');
          } else {
            path.setAttribute('stroke-linecap', 'round');
          }
          el.appendChild(path);
        }
        break;

      case 'text':
        var scale = viewport.scale || 1;

        // ── fontSize가 있으면 인라인 텍스트로 표시 ──
        if(annot.fontSize){
          el = document.createElement('div');
          el.className = 'pdf-annot pdf-annot-inline-text';
          el.style.left = (annot.rect.x * scale) + 'px';
          el.style.top  = (annot.rect.y * scale) + 'px';
          el.style.fontSize = (annot.fontSize * scale) + 'px';
          el.style.color = annot.color || '#000';
          el.textContent = annot.text;

          // 드래그 이동 + 클릭 인라인 편집
          (function(elRef, annotRef, vp){
            var DRAG_THRESHOLD = 5;
            var drag = { active:false, moved:false, sx:0, sy:0, ox:0, oy:0, pid:null };

            elRef.addEventListener('pointerdown', function(e){
              // 편집 모드일 때는 텍스트 선택/커서 이동 허용
              if(elRef.contentEditable === 'true') {
                e.stopPropagation();
                return;
              }
              e.stopPropagation();
              e.preventDefault();
              drag.pid = e.pointerId;
              drag.sx = e.clientX; drag.sy = e.clientY;
              drag.ox = elRef.offsetLeft; drag.oy = elRef.offsetTop;
              drag.moved = false; drag.active = true;
              try { elRef.setPointerCapture(e.pointerId); } catch(err){}
            });
            elRef.addEventListener('pointermove', function(e){
              if(!drag.active || e.pointerId !== drag.pid) return;
              var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
              if(!drag.moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
              drag.moved = true;
              elRef.style.left = (drag.ox + dx) + 'px';
              elRef.style.top  = (drag.oy + dy) + 'px';
            });
            elRef.addEventListener('pointerup', function(e){
              if(elRef.contentEditable === 'true') return;
              if(!drag.active || e.pointerId !== drag.pid) return;
              drag.active = false;
              try { elRef.releasePointerCapture(e.pointerId); } catch(err){}
              if(drag.moved){
                var s = vp.scale || 1;
                annotRef.rect.x = parseFloat(elRef.style.left) / s;
                annotRef.rect.y = parseFloat(elRef.style.top) / s;
                PDFAnnotations.save(annotRef);
              }
            });
            elRef.addEventListener('click', function(e){
              e.stopPropagation();
              if(elRef.contentEditable === 'true') return;
              if(!drag.moved){
                _startInlineEdit(elRef, annotRef, vp);
              }
            });
          })(el, annot, viewport);
          break;
        }

        // ── 레거시: fontSize 없으면 메모 아이콘 핀 ──
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-text-pin';
        el.style.left = (annot.rect.x * scale) + 'px';
        el.style.top  = (annot.rect.y * scale) + 'px';

        // 아이콘
        var icon = document.createElement('div');
        icon.className = 'pdf-memo-icon';
        icon.style.background = annot.color || '#FACC15';
        icon.innerHTML = '<i class="fa fa-sticky-note"></i>';
        el.appendChild(icon);

        // 확장 팝업 (숨김 상태)
        var bubble = document.createElement('div');
        bubble.className = 'pdf-memo-bubble';
        bubble.innerHTML = '<div class="pdf-memo-bubble-text">' + _escHtml(annot.text) + '</div>'
          + '<div class="pdf-memo-bubble-actions">'
          + '<button class="pdf-memo-bubble-btn" data-action="note" title="노트에 추가"><i class="fa fa-pen"></i></button>'
          + '<button class="pdf-memo-bubble-btn pdf-memo-bubble-del" data-action="del" title="삭제"><i class="fa fa-trash-can"></i></button>'
          + '</div>';
        el.appendChild(bubble);

        // 아이콘: 클릭(버블 토글) + 드래그(이동)
        (function(iconEl, bubbleEl, pinEl, annotRef, vp){
          var DRAG_THRESHOLD = 5;
          var drag = { active: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0, pid: null };

          iconEl.addEventListener('pointerdown', function(e){
            e.stopPropagation();
            e.preventDefault();
            drag.pid = e.pointerId;
            drag.sx = e.clientX;
            drag.sy = e.clientY;
            drag.ox = pinEl.offsetLeft;
            drag.oy = pinEl.offsetTop;
            drag.moved = false;
            drag.active = true;
            try { iconEl.setPointerCapture(e.pointerId); } catch(err){}
          });

          iconEl.addEventListener('pointermove', function(e){
            if(!drag.active || e.pointerId !== drag.pid) return;
            var dx = e.clientX - drag.sx;
            var dy = e.clientY - drag.sy;
            if(!drag.moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
            drag.moved = true;
            pinEl.classList.add('dragging');
            pinEl.style.left = (drag.ox + dx) + 'px';
            pinEl.style.top  = (drag.oy + dy) + 'px';
          });

          iconEl.addEventListener('pointerup', function(e){
            if(!drag.active || e.pointerId !== drag.pid) return;
            drag.active = false;
            try { iconEl.releasePointerCapture(e.pointerId); } catch(err){}
            pinEl.classList.remove('dragging');

            if(drag.moved){
              var s = vp.scale || 1;
              annotRef.rect.x = parseFloat(pinEl.style.left) / s;
              annotRef.rect.y = parseFloat(pinEl.style.top) / s;
              PDFAnnotations.save(annotRef);
            } else {
              var wasOpen = bubbleEl.classList.contains('open');
              document.querySelectorAll('.pdf-memo-bubble.open').forEach(function(b){ b.classList.remove('open'); });
              if(!wasOpen) bubbleEl.classList.add('open');
            }
          });

          iconEl.addEventListener('pointercancel', function(){
            drag.active = false;
            pinEl.classList.remove('dragging');
          });

          iconEl.addEventListener('click', function(e){ e.stopPropagation(); });
        })(icon, bubble, el, annot, viewport);

        // 노트에 추가 버튼
        (function(annotRef, bubbleEl){
          bubbleEl.querySelector('[data-action="note"]').addEventListener('click', function(e){
            e.stopPropagation();
            _insertMemoToNote(annotRef);
          });
        })(annot, bubble);

        // 삭제 버튼
        (function(annotRef, elRef){
          bubble.querySelector('[data-action="del"]').addEventListener('click', function(e){
            e.stopPropagation();
            PDFAnnotations.remove(annotRef.id, annotRef.pdfId, annotRef.pageNum);
            var layer = elRef.closest('.pdf-annot-layer');
            if(layer) PDFAnnotations.renderPage(annotRef.pageNum, layer, viewport);
          });
        })(annot, el);
        break;

      case 'shape':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        el.setAttribute('class', 'pdf-annot pdf-annot-shape');
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.overflow = 'visible';

        var shapeScale = viewport.scale || 1;
        var shapeColor = annot.color || '#000';
        var shapeW = annot.strokeWidth || 2;
        var shapeOp = annot.opacity != null ? annot.opacity : 1;

        // arrowhead marker defs
        if(annot.shapeType === 'arrow'){
          var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          var markerId = 'arrow-' + (annot.id || '').replace(/[^a-z0-9]/gi, '');
          var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
          marker.setAttribute('id', markerId);
          marker.setAttribute('markerWidth', '10');
          marker.setAttribute('markerHeight', '7');
          marker.setAttribute('refX', '10');
          marker.setAttribute('refY', '3.5');
          marker.setAttribute('orient', 'auto');
          var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          poly.setAttribute('points', '0 0, 10 3.5, 0 7');
          poly.setAttribute('fill', shapeColor);
          poly.setAttribute('fill-opacity', shapeOp);
          marker.appendChild(poly);
          defs.appendChild(marker);
          el.appendChild(defs);
        }

        var shapeEl;
        if(annot.shapeType === 'line' || annot.shapeType === 'arrow'){
          if(annot.points && annot.points.length >= 2){
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            shapeEl.setAttribute('x1', annot.points[0].x * shapeScale);
            shapeEl.setAttribute('y1', annot.points[0].y * shapeScale);
            shapeEl.setAttribute('x2', annot.points[1].x * shapeScale);
            shapeEl.setAttribute('y2', annot.points[1].y * shapeScale);
            shapeEl.setAttribute('stroke', shapeColor);
            shapeEl.setAttribute('stroke-width', shapeW);
            shapeEl.setAttribute('stroke-opacity', shapeOp);
            if(annot.shapeType === 'arrow'){
              shapeEl.setAttribute('marker-end', 'url(#' + markerId + ')');
            }
          }
        } else if(annot.shapeType === 'rect'){
          if(annot.rect){
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapeEl.setAttribute('x', annot.rect.x * shapeScale);
            shapeEl.setAttribute('y', annot.rect.y * shapeScale);
            shapeEl.setAttribute('width', annot.rect.width * shapeScale);
            shapeEl.setAttribute('height', annot.rect.height * shapeScale);
            shapeEl.setAttribute('stroke', shapeColor);
            shapeEl.setAttribute('stroke-width', shapeW);
            shapeEl.setAttribute('stroke-opacity', shapeOp);
            shapeEl.setAttribute('fill', 'none');
          }
        } else if(annot.shapeType === 'circle'){
          if(annot.rect){
            shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shapeEl.setAttribute('cx', (annot.rect.x + annot.rect.width / 2) * shapeScale);
            shapeEl.setAttribute('cy', (annot.rect.y + annot.rect.height / 2) * shapeScale);
            shapeEl.setAttribute('rx', (annot.rect.width / 2) * shapeScale);
            shapeEl.setAttribute('ry', (annot.rect.height / 2) * shapeScale);
            shapeEl.setAttribute('stroke', shapeColor);
            shapeEl.setAttribute('stroke-width', shapeW);
            shapeEl.setAttribute('stroke-opacity', shapeOp);
            shapeEl.setAttribute('fill', 'none');
          }
        }
        if(shapeEl) el.appendChild(shapeEl);
        break;

      case 'area-link':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-area-link';
        _positionRect(el, annot.rect, viewport);
        if(annot.linkedUri){
          el.onclick = function(){ NavigationRouter.navigateTo(annot.linkedUri); };
          el.style.cursor = 'pointer';
        }

        // hover 시 보이는 X 삭제 배지
        (function(annotRef, elRef, vp){
          var xBtn = document.createElement('button');
          xBtn.className = 'pdf-area-link-del';
          xBtn.innerHTML = '&times;';
          xBtn.title = '삭제';
          xBtn.addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            PDFAnnotations.remove(annotRef.id, annotRef.pdfId, annotRef.pageNum);
            var layer = elRef.closest('.pdf-annot-layer');
            if(layer) PDFAnnotations.renderPage(annotRef.pageNum, layer, vp);
          });
          elRef.appendChild(xBtn);
        })(annot, el, viewport);
        break;

      default:
        return null;
    }

    if(el){
      el.dataset.annotId = annot.id;
      el.title = annot.text || '';
    }

    return el;
  }

  // Convert PDF coordinates to viewport coordinates
  function _positionRect(el, rect, viewport){
    if(!rect || !viewport) return;
    var scale = viewport.scale || 1;
    el.style.left   = (rect.x * scale) + 'px';
    el.style.top    = (rect.y * scale) + 'px';
    el.style.width  = (rect.width * scale) + 'px';
    el.style.height = (rect.height * scale) + 'px';
  }

  function _pdfToView(x, viewport){
    return x * (viewport.scale || 1);
  }

  function _pdfToViewY(y, viewport){
    return y * (viewport.scale || 1);
  }

  // Create annotation data object
  function createAnnot(type, pdfId, pageNum, opts){
    return {
      id: 'annot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      pdfId: pdfId,
      pageNum: pageNum,
      type: type,
      rect: opts.rect || null,
      points: opts.points || null,
      text: opts.text || '',
      color: opts.color || '#FACC15',
      strokeWidth: opts.strokeWidth || 2,
      opacity: opts.opacity != null ? opts.opacity : 1,
      penType: opts.penType || null,
      fontSize: opts.fontSize || null,
      shapeType: opts.shapeType || null,
      linkedUri: opts.linkedUri || null,
      tags: opts.tags || [],
      createdAt: Date.now()
    };
  }

  // ── Inline text edit (클릭 → 바로 편집 + 삭제 버튼) ──
  function _startInlineEdit(elRef, annotRef, vp){
    // 기존 삭제 버튼 제거
    document.querySelectorAll('.pdf-annot-del-btn').forEach(function(b){ b.remove(); });

    var layer = elRef.closest('.pdf-annot-layer');

    // 편집 모드 진입
    elRef.contentEditable = 'true';
    elRef.classList.add('editing');
    elRef.focus();

    // 커서를 텍스트 끝으로 이동
    var range = document.createRange();
    var sel = window.getSelection();
    range.selectNodeContents(elRef);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    // 삭제 버튼 표시
    var delBtn = document.createElement('button');
    delBtn.className = 'pdf-annot-del-btn';
    delBtn.innerHTML = '<i class="fa fa-trash-can"></i>';
    delBtn.title = '삭제';

    var elRect = elRef.getBoundingClientRect();
    var layerRect = layer.getBoundingClientRect();
    delBtn.style.left = (elRect.right - layerRect.left + 4) + 'px';
    delBtn.style.top = (elRect.top - layerRect.top) + 'px';

    delBtn.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    delBtn.addEventListener('click', function(e){
      e.stopPropagation();
      delBtn.remove();
      elRef.contentEditable = 'false';
      elRef.classList.remove('editing');
      PDFAnnotations.remove(annotRef.id, annotRef.pdfId, annotRef.pageNum);
      if(layer) PDFAnnotations.renderPage(annotRef.pageNum, layer, vp);
    });
    layer.appendChild(delBtn);

    // blur 시 저장
    function onBlur(){
      // 삭제 버튼 클릭으로 인한 blur는 무시 (delBtn이 이미 처리)
      setTimeout(function(){
        if(!elRef.parentNode) return; // 이미 삭제됨
        elRef.contentEditable = 'false';
        elRef.classList.remove('editing');
        delBtn.remove();

        var newText = (elRef.innerText || '').trim();
        if(newText){
          annotRef.text = newText;
          annotRef.rect.width = elRef.offsetWidth / (vp.scale || 1);
          annotRef.rect.height = elRef.offsetHeight / (vp.scale || 1);
          PDFAnnotations.save(annotRef);
        } else {
          PDFAnnotations.remove(annotRef.id, annotRef.pdfId, annotRef.pageNum);
          if(layer) PDFAnnotations.renderPage(annotRef.pageNum, layer, vp);
        }
      }, 150);
    }

    elRef.addEventListener('blur', onBlur, { once: true });

    // Escape → 취소 (원래 텍스트 복원)
    elRef.addEventListener('keydown', function handler(e){
      if(e.key === 'Escape'){
        elRef.removeEventListener('blur', onBlur);
        elRef.contentEditable = 'false';
        elRef.classList.remove('editing');
        elRef.textContent = annotRef.text;
        delBtn.remove();
        elRef.removeEventListener('keydown', handler);
      }
    });
  }

  // ── Floating delete button for annotations ──
  function _showAnnotDeleteBtn(targetEl, annot, viewport){
    // Remove any existing delete button
    document.querySelectorAll('.pdf-annot-del-btn').forEach(function(b){ b.remove(); });

    var layer = targetEl.closest('.pdf-annot-layer');
    if(!layer) return;

    var btn = document.createElement('button');
    btn.className = 'pdf-annot-del-btn';
    btn.innerHTML = '&#128465;';
    btn.title = '삭제';

    // Position at top-right of the annotation element
    var elRect = targetEl.getBoundingClientRect();
    var layerRect = layer.getBoundingClientRect();
    btn.style.left = (elRect.right - layerRect.left - 2) + 'px';
    btn.style.top = (elRect.top - layerRect.top - 18) + 'px';

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      PDFAnnotations.remove(annot.id, annot.pdfId, annot.pageNum);
      btn.remove();
      PDFAnnotations.renderPage(annot.pageNum, layer, viewport);
    });

    layer.appendChild(btn);

    // Close on outside click
    setTimeout(function(){
      document.addEventListener('pointerdown', function handler(e){
        if(!btn.contains(e.target) && !targetEl.contains(e.target)){
          btn.remove();
          document.removeEventListener('pointerdown', handler);
        }
      });
    }, 50);
  }

  // ── Tag Popup UI ──
  function _showTagPopup(annot, targetEl, viewport){
    // Remove existing popup
    document.querySelectorAll('.pdf-tag-popup').forEach(function(p){ p.remove(); });

    var popup = document.createElement('div');
    popup.className = 'pdf-tag-popup';

    // Position below annotation element
    var rect = targetEl.getBoundingClientRect();
    var layer = targetEl.closest('.pdf-annot-layer');
    var layerRect = layer ? layer.getBoundingClientRect() : {left:0,top:0};
    popup.style.left = (rect.left - layerRect.left) + 'px';
    popup.style.top = (rect.bottom - layerRect.top + 4) + 'px';

    // Build existing tags chips
    var tagsHtml = (annot.tags||[]).map(function(tag){
      return '<span class="pdf-tag-chip">' + _escHtml(tag)
        + '<button class="pdf-tag-remove" data-tag="' + _escHtml(tag) + '">&times;</button></span>';
    }).join('');

    // ── 색상 선택 행 ──
    var colorRow = document.createElement('div');
    colorRow.className = 'pdf-tag-color-row';
    var hlColors = ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C'];
    hlColors.forEach(function(c){
      var dot = document.createElement('button');
      dot.className = 'pdf-tag-color-dot';
      dot.style.background = c;
      // 현재 색상과 매칭 여부 확인
      var r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
      if(annot.color && annot.color.indexOf(r + ',') !== -1 && annot.color.indexOf(g + ',') !== -1){
        dot.classList.add('active');
      }
      dot.addEventListener('click', function(e){
        e.stopPropagation();
        colorRow.querySelectorAll('.pdf-tag-color-dot').forEach(function(d){ d.classList.remove('active'); });
        dot.classList.add('active');
        annot.color = _hexToRgba(c, 0.35);
        PDFAnnotations.save(annot);
        if(targetEl) targetEl.style.background = annot.color;
      });
      colorRow.appendChild(dot);
    });
    popup.appendChild(colorRow);

    // 태그 칩 + 입력
    var chipsDiv = document.createElement('div');
    chipsDiv.className = 'pdf-tag-chips';
    chipsDiv.innerHTML = tagsHtml;
    popup.appendChild(chipsDiv);

    var inputRow = document.createElement('div');
    inputRow.className = 'pdf-tag-input-row';
    inputRow.innerHTML = '<input class="pdf-tag-input" placeholder="태그 추가..." />'
      + '<button class="pdf-tag-add-btn"><i class="fa fa-plus"></i></button>';
    popup.appendChild(inputRow);

    // ── 삭제 버튼 행 ──
    var delRow = document.createElement('div');
    delRow.className = 'pdf-tag-delete-row';
    var delBtn = document.createElement('button');
    delBtn.className = 'pdf-tag-delete-btn';
    delBtn.innerHTML = '<i class="fa fa-trash-can"></i> 하이라이트 삭제';
    delBtn.addEventListener('click', function(e){
      e.stopPropagation();
      PDFAnnotations.remove(annot.id, annot.pdfId, annot.pageNum);
      popup.remove();
      var layer2 = targetEl.closest('.pdf-annot-layer');
      if(layer2) PDFAnnotations.renderPage(annot.pageNum, layer2, viewport);
    });
    delRow.appendChild(delBtn);
    popup.appendChild(delRow);

    layer.appendChild(popup);

    // 팝업 위치 보정 (화면 밖 방지)
    requestAnimationFrame(function(){
      var pRect = popup.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      if(pRect.right > vw - 8){
        popup.style.left = (parseInt(popup.style.left) - (pRect.right - vw + 12)) + 'px';
      }
      if(pRect.bottom > vh - 8){
        // 위로 표시
        popup.style.top = (rect.top - layerRect.top - pRect.height - 4) + 'px';
      }
      if(pRect.left < 8){
        popup.style.left = '4px';
      }
    });

    // Add tag logic
    var input = popup.querySelector('.pdf-tag-input');
    var addBtn = popup.querySelector('.pdf-tag-add-btn');
    function addTag(){
      var tag = input.value.trim();
      if(!tag) return;
      if(!annot.tags) annot.tags = [];
      if(annot.tags.indexOf(tag) === -1){
        annot.tags.push(tag);
        PDFAnnotations.save(annot);
        _showTagPopup(annot, targetEl, viewport); // re-render popup
      }
      input.value = '';
    }
    addBtn.addEventListener('click', addTag);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); addTag(); }
    });

    // Remove tag logic
    popup.querySelectorAll('.pdf-tag-remove').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var tag = btn.dataset.tag;
        annot.tags = (annot.tags||[]).filter(function(t){ return t !== tag; });
        PDFAnnotations.save(annot);
        _showTagPopup(annot, targetEl, viewport);
      });
    });

    // Close on outside click
    setTimeout(function(){
      document.addEventListener('click', function handler(e){
        if(!popup.contains(e.target)){
          popup.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 50);

    input.focus();

    // Stop propagation to prevent layer events
    popup.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointermove', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointerup', function(e){ e.stopPropagation(); });
  }

  function _hexToRgba(hex, alpha){
    if(hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    var r = parseInt(hex.slice(1,3), 16) || 0;
    var g = parseInt(hex.slice(3,5), 16) || 0;
    var b = parseInt(hex.slice(5,7), 16) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  return {
    load: load,
    save: save,
    remove: remove,
    getPage: getPage,
    clearPage: clearPage,
    renderPage: renderPage,
    createAnnot: createAnnot,
    _insertMemoToNote: _insertMemoToNote
  };
})();
