// pdf-tools.js — PDF annotation tools (select, highlight, draw, text, eraser)
// Touch/Pen/Mouse 통합 PointerEvent 핸들링

var PDFTools = (function(){
  var _currentTool = 'select';
  var _isDrawing = false;
  var _currentPath = [];
  var _currentColor = '#FACC15';
  var _undoStack = [];
  var _redoStack = [];
  var _startPoint = null;
  var _activePointerId = null;

  var _fontSize = 16;
  var _strokeWidth = 3;       // 펜 굵기 (1-10)
  var _opacity = 1.0;          // 불투명도 (0.1-1.0)
  var _penType = 'ballpen';    // 'ballpen' | 'pencil'
  var _penFlyoutExpanded = false; // 고급 옵션 확장 여부
  var _penFlyoutPos = null;    // 드래그 후 저장된 위치 {left, top}

  function setTool(tool){
    _currentTool = tool;
    _removeTextCursor();
    // 다른 도구로 전환 시 펜 플라이아웃 닫기
    if(tool !== 'draw') _closePenFlyout();

    // Update toolbar buttons
    document.querySelectorAll('#pdfToolbar .pdf-tool-btn').forEach(function(b){
      b.classList.remove('active');
    });
    var map = { select:'Select', highlight:'HL', draw:'Draw', text:'Text', memo:'Memo', eraser:'Eraser' };
    var activeBtn = document.getElementById('pdfTool' + map[tool]);
    if(activeBtn) activeBtn.classList.add('active');

    // Set annotation layers interactive
    document.querySelectorAll('.pdf-annot-layer').forEach(function(layer){
      if(tool !== 'select'){
        layer.classList.add('interactive');
      } else {
        layer.classList.remove('interactive');
      }
    });

    // 옵션바 업데이트
    _updateToolOptions(tool);
  }

  function _updateToolOptions(tool){
    var bar = document.getElementById('pdfToolOptions');
    if(!bar) return;
    bar.innerHTML = '';

    // 펜 플라이아웃 닫기
    _closePenFlyout();

    if(tool === 'select' || tool === 'eraser'){
      bar.style.display = 'none';
      return;
    }

    // draw 모드: 색상 바 + 세로 플라이아웃(펜 종류·굵기·투명도) 동시 표시
    if(tool === 'draw'){
      _showPenFlyout();
      // 아래에서 색상 바 그대로 표시 (fall through)
    }

    bar.style.display = 'flex';

    // 메모 도구: 색상만 표시 (사이즈 없음)
    if(tool === 'memo'){
      var memoColors = ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C'];
      memoColors.forEach(function(c){
        var dot = document.createElement('button');
        dot.className = 'pdf-opt-color' + (c === _currentColor ? ' active' : '');
        dot.style.background = c;
        dot.addEventListener('click', function(){
          _currentColor = c;
          bar.querySelectorAll('.pdf-opt-color').forEach(function(d){ d.classList.remove('active'); });
          dot.classList.add('active');
        });
        bar.appendChild(dot);
      });
      return;
    }

    // 색상 선택 (highlight, text, draw)
    var colors = ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C','#000000','#FFFFFF'];
    colors.forEach(function(c){
      var dot = document.createElement('button');
      dot.className = 'pdf-opt-color' + (c === _currentColor ? ' active' : '');
      dot.style.background = c;
      if(c === '#FFFFFF') dot.style.border = '1px solid var(--border,#444)';
      dot.addEventListener('click', function(){
        _currentColor = c;
        bar.querySelectorAll('.pdf-opt-color').forEach(function(d){ d.classList.remove('active'); });
        dot.classList.add('active');
      });
      bar.appendChild(dot);
    });

    // 텍스트 도구: 글자 크기 선택
    if(tool === 'text'){
      var sep = document.createElement('div');
      sep.className = 'pdf-tool-sep';
      bar.appendChild(sep);

      var label = document.createElement('span');
      label.className = 'pdf-opt-label';
      label.textContent = '크기';
      bar.appendChild(label);

      var sel = document.createElement('select');
      sel.className = 'pdf-opt-fontsize';
      [10, 12, 14, 16, 20, 24, 28, 32, 40].forEach(function(s){
        var opt = document.createElement('option');
        opt.value = s; opt.textContent = s + 'px';
        if(s === _fontSize) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function(){ _fontSize = parseInt(sel.value); });
      bar.appendChild(sel);
    }
  }

  // ── 세로 펜 플라이아웃 ──
  function _closePenFlyout(){
    document.querySelectorAll('.pdf-pen-flyout').forEach(function(el){ el.remove(); });
  }

  function _showPenFlyout(){
    _closePenFlyout();

    var flyout = document.createElement('div');
    flyout.className = 'pdf-pen-flyout';

    // ── 드래그 핸들 ──
    var handle = document.createElement('div');
    handle.className = 'pdf-pen-handle';
    handle.innerHTML = '<span class="pdf-pen-handle-grip"></span>';
    flyout.appendChild(handle);

    // ── 펜 종류 ──
    var typeSection = document.createElement('div');
    typeSection.className = 'pdf-pen-section pdf-pen-types';

    var penTypes = [
      { id: 'ballpen',      icon: 'fa-pen',        label: '볼펜' },
      { id: 'pencil',       icon: 'fa-pencil',     label: '연필' }
    ];
    penTypes.forEach(function(pt){
      var btn = document.createElement('button');
      btn.className = 'pdf-pen-type-btn' + (pt.id === _penType ? ' active' : '');
      btn.innerHTML = '<i class="fa ' + pt.icon + '"></i>';
      btn.title = pt.label;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        _penType = pt.id;
        if(pt.id === 'pencil'){ _opacity = 0.7; }
        else { _opacity = 1.0; }
        // 현재 위치 저장 후 리빌드
        _penFlyoutPos = { left: parseInt(flyout.style.left), top: parseInt(flyout.style.top) };
        _showPenFlyout();
      });
      typeSection.appendChild(btn);
    });
    flyout.appendChild(typeSection);

    // ── 확장 토글 버튼 ──
    flyout.appendChild(_makeDivider());
    var expandBtn = document.createElement('button');
    expandBtn.className = 'pdf-pen-expand-btn';
    expandBtn.innerHTML = _penFlyoutExpanded
      ? '<i class="fa fa-chevron-up"></i>'
      : '<i class="fa fa-sliders"></i>';
    expandBtn.title = _penFlyoutExpanded ? '접기' : '굵기 · 투명도';
    expandBtn.addEventListener('click', function(e){
      e.stopPropagation();
      _penFlyoutExpanded = !_penFlyoutExpanded;
      _penFlyoutPos = { left: parseInt(flyout.style.left), top: parseInt(flyout.style.top) };
      _showPenFlyout();
    });
    flyout.appendChild(expandBtn);

    // ── 고급 옵션 (확장 시만 표시) ──
    if(_penFlyoutExpanded){
      flyout.appendChild(_makeDivider());

      // 굵기
      var widthSection = document.createElement('div');
      widthSection.className = 'pdf-pen-section';
      var widths = [
        { val: 1, label: '가늘게' },
        { val: 3, label: '보통' },
        { val: 6, label: '굵게' }
      ];
      widths.forEach(function(w){
        var btn = document.createElement('button');
        btn.className = 'pdf-pen-width-btn' + (w.val === _strokeWidth ? ' active' : '');
        btn.title = w.label;
        var line = document.createElement('span');
        line.className = 'pdf-pen-width-preview';
        line.style.height = Math.max(1, w.val) + 'px';
        btn.appendChild(line);
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          _strokeWidth = w.val;
          widthSection.querySelectorAll('.pdf-pen-width-btn').forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
        });
        widthSection.appendChild(btn);
      });
      flyout.appendChild(widthSection);

      flyout.appendChild(_makeDivider());

      // 투명도
      var opSection = document.createElement('div');
      opSection.className = 'pdf-pen-section pdf-pen-opacity-section';
      var opLabel = document.createElement('span');
      opLabel.className = 'pdf-pen-opacity-label';
      opLabel.textContent = Math.round(_opacity * 100) + '%';
      var slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'pdf-pen-opacity-slider';
      slider.min = '10'; slider.max = '100'; slider.step = '5';
      slider.value = Math.round(_opacity * 100);
      slider.addEventListener('input', function(e){
        e.stopPropagation();
        _opacity = parseInt(slider.value) / 100;
        opLabel.textContent = slider.value + '%';
      });
      opSection.appendChild(slider);
      opSection.appendChild(opLabel);
      flyout.appendChild(opSection);
    }

    // 포인터 이벤트 차단 (드래그 핸들은 예외)
    flyout.addEventListener('pointerdown', function(e){
      if(!e.target.closest('.pdf-pen-handle')) e.stopPropagation();
    });

    // DOM 추가
    document.body.appendChild(flyout);

    // ── 위치: 저장된 위치 or PDF 뷰어 왼쪽 ──
    if(_penFlyoutPos && _penFlyoutPos.left != null){
      flyout.style.left = _penFlyoutPos.left + 'px';
      flyout.style.top = _penFlyoutPos.top + 'px';
    } else {
      var host = document.getElementById('pdfViewerHost');
      var container = document.getElementById('pdfViewerContainer');
      var ref = host || container;
      if(ref){
        var refRect = ref.getBoundingClientRect();
        flyout.style.left = (refRect.left + 8) + 'px';
        flyout.style.top = (refRect.top + 60) + 'px';
      } else {
        flyout.style.left = '12px';
        flyout.style.top = '120px';
      }
    }

    // 화면 밖 보정
    requestAnimationFrame(function(){
      var fRect = flyout.getBoundingClientRect();
      if(fRect.right > window.innerWidth - 4){
        flyout.style.left = (window.innerWidth - fRect.width - 4) + 'px';
      }
      if(fRect.bottom > window.innerHeight - 4){
        flyout.style.top = Math.max(4, window.innerHeight - fRect.height - 4) + 'px';
      }
      if(fRect.left < 0) flyout.style.left = '4px';
      if(fRect.top < 0) flyout.style.top = '4px';
    });

    // ── 드래그 이동 로직 ──
    _initFlyoutDrag(flyout, handle);
  }

  function _makeDivider(){
    var d = document.createElement('div');
    d.className = 'pdf-pen-divider';
    return d;
  }

  function _initFlyoutDrag(flyout, handle){
    var drag = { active: false, sx: 0, sy: 0, ox: 0, oy: 0 };
    handle.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      e.preventDefault();
      drag.active = true;
      drag.sx = e.clientX; drag.sy = e.clientY;
      drag.ox = parseInt(flyout.style.left) || 0;
      drag.oy = parseInt(flyout.style.top) || 0;
      handle.style.cursor = 'grabbing';
      try { handle.setPointerCapture(e.pointerId); } catch(err){}
    });
    handle.addEventListener('pointermove', function(e){
      if(!drag.active) return;
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      flyout.style.left = (drag.ox + dx) + 'px';
      flyout.style.top = (drag.oy + dy) + 'px';
    });
    handle.addEventListener('pointerup', function(e){
      if(!drag.active) return;
      drag.active = false;
      handle.style.cursor = '';
      try { handle.releasePointerCapture(e.pointerId); } catch(err){}
      _penFlyoutPos = { left: parseInt(flyout.style.left), top: parseInt(flyout.style.top) };
    });
  }

  function getFontSize(){ return _fontSize; }

  function getTool(){ return _currentTool; }
  function setColor(color){ _currentColor = color; }

  // Initialize event listeners on a page's annotation layer
  function initPageEvents(layerEl, pageNum){
    layerEl.addEventListener('pointerdown', function(e){ _onPointerDown(e, pageNum, layerEl); });
    layerEl.addEventListener('pointermove', function(e){ _onPointerMove(e, pageNum, layerEl); });
    layerEl.addEventListener('pointerup', function(e){ _onPointerUp(e, pageNum, layerEl); });
    layerEl.addEventListener('pointercancel', function(e){ _onPointerUp(e, pageNum, layerEl); });
    layerEl.addEventListener('pointerleave', function(){
      var c = layerEl.querySelector('.pdf-text-cursor');
      if(c) c.remove();
    });
  }

  function _onPointerDown(e, pageNum, layer){
    // Auto-switch to draw for pen
    if(e.pointerType === 'pen' && _currentTool === 'select'){
      setTool('draw');
    }

    // Palm rejection
    if(e.pointerType === 'touch' && typeof InputManager !== 'undefined' && InputManager.isPen()){
      return;
    }

    // Highlight mode: pass through existing highlights for drag&drop
    if(_currentTool === 'highlight' && e.target.closest('.pdf-annot-highlight')){
      return;
    }

    if(_currentTool === 'select') return;

    e.preventDefault();
    e.stopPropagation();

    // Capture pointer for reliable touch tracking
    _activePointerId = e.pointerId;
    try { layer.setPointerCapture(e.pointerId); } catch(err){}

    _isDrawing = true;
    var pt = _getPoint(e, layer);
    _startPoint = pt;

    if(_currentTool === 'draw'){
      _currentPath = [{ x: pt.x, y: pt.y, pressure: e.pressure || 0.5 }];
    } else if(_currentTool === 'eraser'){
      var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
      if(pdfId) _eraseAt(pt, pdfId, pageNum, layer);
    }
  }

  function _onPointerMove(e, pageNum, layer){
    // 텍스트/메모 도구: 입력 지점 커서 미리보기
    if((_currentTool === 'text' || _currentTool === 'memo') && !_isDrawing){
      _showTextCursor(e, layer);
      return;
    }

    if(!_isDrawing || e.pointerId !== _activePointerId) return;
    e.preventDefault();
    e.stopPropagation();

    var pt = _getPoint(e, layer);

    if(_currentTool === 'draw'){
      _currentPath.push({ x: pt.x, y: pt.y, pressure: e.pressure || 0.5 });
      _drawLivePreview(layer);
      // 라이브 강의: 진행중 스트로크 프리뷰 발행
      if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
        var effW = _strokeWidth;
        if(_penType === 'highlighter') effW = _strokeWidth * 2.5;
        else if(_penType === 'pencil') effW = _strokeWidth * 0.7;
        PDFLive.onStrokeProgress(pageNum, _currentPath, _currentColor, effW, _opacity, _penType);
      }
    } else if(_currentTool === 'highlight'){
      _drawSelectionPreview(layer, pt);
    } else if(_currentTool === 'eraser'){
      var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
      if(pdfId) _eraseAt(pt, pdfId, pageNum, layer);
    }
  }

  function _onPointerUp(e, pageNum, layer){
    if(!_isDrawing) return;
    _isDrawing = false;
    _activePointerId = null;

    try { layer.releasePointerCapture(e.pointerId); } catch(err){}

    var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
    if(!pdfId) return;

    var pt = _getPoint(e, layer);

    if(_currentTool === 'draw' && _currentPath.length > 1){
      var avgP = _currentPath.reduce(function(s, p){ return s + p.pressure; }, 0) / _currentPath.length;
      // 펜 종류별 실효 굵기 계산
      var effectiveWidth = _strokeWidth;
      if(_penType === 'highlighter') effectiveWidth = _strokeWidth * 2.5;
      else if(_penType === 'pencil') effectiveWidth = _strokeWidth * 0.7;
      // 압력 기반 미세 조정 (볼펜만)
      if(_penType === 'ballpen') effectiveWidth = effectiveWidth + (avgP * 3);
      var annot = PDFAnnotations.createAnnot('freehand', pdfId, pageNum, {
        points: _currentPath,
        color: _currentColor,
        strokeWidth: effectiveWidth,
        opacity: _opacity,
        penType: _penType
      });
      PDFAnnotations.save(annot);
      _undoStack.push(annot.id);
      _redoStack = [];
      _clearPreview(layer);
      PDFAnnotations.renderPage(pageNum, layer, _getViewport());
      // 라이브 강의: 스트로크 완성 훅
      if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
        PDFLive.onStrokeComplete(pageNum, annot);
      }
    }
    else if(_currentTool === 'highlight' && _startPoint){
      var rect = _makeRect(_startPoint, pt);
      if(rect.width > 3 && rect.height > 3){
        var annot2 = PDFAnnotations.createAnnot('highlight', pdfId, pageNum, {
          rect: rect,
          color: _hexToRgba(_currentColor, 0.35)
        });
        PDFAnnotations.save(annot2);
        _undoStack.push(annot2.id);
        _redoStack = [];
      }
      _clearPreview(layer);
      PDFAnnotations.renderPage(pageNum, layer, _getViewport());
    }
    else if(_currentTool === 'text'){
      _showTextInput(layer, pt, pdfId, pageNum);
    }
    else if(_currentTool === 'memo'){
      _showMemoInput(layer, pt, pdfId, pageNum);
    }
    else if(_currentTool === 'eraser'){
      _eraseAt(pt, pdfId, pageNum, layer);
    }

    _currentPath = [];
    _startPoint = null;
  }

  function _getPoint(e, layer){
    var rect = layer.getBoundingClientRect();
    var scale = (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() || 1 : 1;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  }

  function _getViewport(){
    return { scale: (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() || 1 : 1 };
  }

  // ── Live Preview (draw) ──
  function _drawLivePreview(layer){
    var preview = layer.querySelector('.pdf-draw-preview');
    if(!preview){
      preview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      preview.setAttribute('class', 'pdf-draw-preview');
      preview.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5';
      layer.appendChild(preview);
    }
    var scale = _getViewport().scale;
    if(_currentPath.length < 2) return;

    var d = 'M ' + (_currentPath[0].x * scale) + ' ' + (_currentPath[0].y * scale);
    for(var i = 1; i < _currentPath.length; i++){
      d += ' L ' + (_currentPath[i].x * scale) + ' ' + (_currentPath[i].y * scale);
    }
    var avgP = _currentPath.reduce(function(s, p){ return s + p.pressure; }, 0) / _currentPath.length;
    var prevW = _strokeWidth;
    if(_penType === 'highlighter') prevW = _strokeWidth * 2.5;
    else if(_penType === 'pencil') prevW = _strokeWidth * 0.7;
    if(_penType === 'ballpen') prevW = prevW + (avgP * 3);
    var prevCap = _penType === 'highlighter' ? 'square' : 'round';
    preview.innerHTML = '<path d="' + d + '" stroke="' + _currentColor + '" stroke-width="' + prevW
      + '" fill="none" stroke-linecap="' + prevCap + '" stroke-linejoin="round" stroke-opacity="' + _opacity + '"/>';
  }

  // ── Selection Preview (highlight) ──
  function _drawSelectionPreview(layer, pt){
    var preview = layer.querySelector('.pdf-sel-preview');
    if(!preview){
      preview = document.createElement('div');
      preview.className = 'pdf-sel-preview';
      preview.style.cssText = 'position:absolute;border:2px dashed ' + _currentColor + ';background:' + _hexToRgba(_currentColor, 0.18) + ';pointer-events:none;z-index:5;border-radius:3px';
      layer.appendChild(preview);
    }
    var scale = _getViewport().scale;
    var r = _makeRect(_startPoint, pt);
    preview.style.left = (r.x * scale) + 'px';
    preview.style.top = (r.y * scale) + 'px';
    preview.style.width = (r.width * scale) + 'px';
    preview.style.height = (r.height * scale) + 'px';
  }

  function _clearPreview(layer){
    var el = layer.querySelector('.pdf-draw-preview');
    if(el) el.remove();
    el = layer.querySelector('.pdf-sel-preview');
    if(el) el.remove();
  }

  function _makeRect(p1, p2){
    return {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
      width: Math.abs(p2.x - p1.x),
      height: Math.abs(p2.y - p1.y)
    };
  }

  // ── Text: 인라인 직접 입력 ──
  function _showTextInput(layer, pt, pdfId, pageNum){
    _removeTextCursor();
    _closeInlineEditor();

    var scale = _getViewport().scale;
    var pixelX = pt.x * scale;
    var pixelY = pt.y * scale;
    var fs = _fontSize;

    var editor = document.createElement('div');
    editor.className = 'pdf-inline-editor';
    editor.contentEditable = 'true';
    editor.style.left = pixelX + 'px';
    editor.style.top = pixelY + 'px';
    editor.style.fontSize = fs + 'px';
    editor.style.color = _currentColor;
    editor.dataset.pdfId = pdfId;
    editor.dataset.pageNum = pageNum;
    editor.dataset.ptX = pt.x;
    editor.dataset.ptY = pt.y;

    layer.appendChild(editor);

    // 포인터 이벤트 차단
    editor.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    editor.addEventListener('pointermove', function(e){ e.stopPropagation(); });
    editor.addEventListener('pointerup', function(e){ e.stopPropagation(); });

    requestAnimationFrame(function(){ editor.focus(); });

    // Escape → 취소, Enter(no shift) → 저장
    editor.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        _closeInlineEditor();
      } else if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        _saveInlineEditor(editor, layer);
      }
    });

    // 바깥 클릭 시 저장
    setTimeout(function(){
      document.addEventListener('pointerdown', function handler(e){
        if(editor.parentNode && !editor.contains(e.target)){
          _saveInlineEditor(editor, layer);
          document.removeEventListener('pointerdown', handler);
        }
      });
    }, 100);
  }

  function _saveInlineEditor(editor, layer){
    var text = (editor.innerText || '').trim();
    if(!text){ _closeInlineEditor(); return; }

    var pdfId = editor.dataset.pdfId;
    var pageNum = parseInt(editor.dataset.pageNum);
    var ptX = parseFloat(editor.dataset.ptX);
    var ptY = parseFloat(editor.dataset.ptY);
    var scale = _getViewport().scale;
    var fs = parseInt(editor.style.fontSize) || 16;
    var color = editor.style.color || _currentColor;

    var annot = PDFAnnotations.createAnnot('text', pdfId, pageNum, {
      rect: { x: ptX, y: ptY, width: editor.offsetWidth / scale, height: editor.offsetHeight / scale },
      text: text,
      color: color,
      fontSize: fs / scale  // PDF 좌표계 기준 크기
    });
    PDFAnnotations.save(annot);
    _undoStack.push(annot.id);
    _redoStack = [];
    _closeInlineEditor();
    PDFAnnotations.renderPage(pageNum, layer, _getViewport());
  }

  // ── Memo: 메모 입력 팝업 ──
  function _showMemoInput(layer, pt, pdfId, pageNum){
    _removeTextCursor();
    _closeMemoEditor();
    _closeInlineEditor();

    var scale = _getViewport().scale;
    var pixelX = pt.x * scale;
    var pixelY = pt.y * scale;

    var popup = document.createElement('div');
    popup.className = 'pdf-memo-editor';
    popup.style.left = pixelX + 'px';
    popup.style.top = pixelY + 'px';

    popup.innerHTML =
      '<div class="pdf-memo-editor-header">'
      + '<i class="fa fa-sticky-note"></i> 메모'
      + '</div>'
      + '<textarea class="pdf-memo-editor-textarea" placeholder="메모 입력..." rows="3"></textarea>'
      + '<div class="pdf-memo-editor-footer">'
      + '<button class="pdf-memo-editor-cancel">취소</button>'
      + '<button class="pdf-memo-editor-save">저장</button>'
      + '</div>';

    layer.appendChild(popup);

    var textarea = popup.querySelector('.pdf-memo-editor-textarea');
    requestAnimationFrame(function(){ textarea.focus(); });

    // 포인터 이벤트 차단
    popup.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointermove', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointerup', function(e){ e.stopPropagation(); });

    // 저장
    popup.querySelector('.pdf-memo-editor-save').addEventListener('click', function(){
      _saveMemo(textarea, pt, pdfId, pageNum, layer);
    });

    // 취소
    popup.querySelector('.pdf-memo-editor-cancel').addEventListener('click', function(){
      _closeMemoEditor();
    });

    // Ctrl+Enter → 저장, Escape → 취소
    textarea.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        _closeMemoEditor();
      } else if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
        e.preventDefault();
        _saveMemo(textarea, pt, pdfId, pageNum, layer);
      }
    });
  }

  function _saveMemo(textarea, pt, pdfId, pageNum, layer){
    var text = (textarea.value || '').trim();
    if(!text){ _closeMemoEditor(); return; }

    // fontSize를 null로 저장 → 메모 핀으로 렌더링됨
    var annot = PDFAnnotations.createAnnot('text', pdfId, pageNum, {
      rect: { x: pt.x, y: pt.y, width: 20, height: 20 },
      text: text,
      color: _currentColor
    });
    PDFAnnotations.save(annot);
    _undoStack.push(annot.id);
    _redoStack = [];
    _closeMemoEditor();
    PDFAnnotations.renderPage(pageNum, layer, _getViewport());
  }

  function _closeMemoEditor(){
    document.querySelectorAll('.pdf-memo-editor').forEach(function(el){ el.remove(); });
  }

  function _closeInlineEditor(){
    document.querySelectorAll('.pdf-inline-editor').forEach(function(el){ el.remove(); });
    // 레거시 메모 팝업도 정리
    document.querySelectorAll('.pdf-memo-pin').forEach(function(el){ el.remove(); });
    document.querySelectorAll('.pdf-memo-popup').forEach(function(el){ el.remove(); });
  }

  // ── 텍스트/메모 입력 지점 커서 ──
  function _showTextCursor(e, layer){
    var cursor = layer.querySelector('.pdf-text-cursor');
    if(!cursor){
      cursor = document.createElement('div');
      cursor.className = 'pdf-text-cursor';
      layer.appendChild(cursor);
    }
    var rect = layer.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    // 텍스트 도구일 때 글자 크기 미리보기
    if(_currentTool === 'text'){
      var scale = _getViewport().scale;
      var h = _fontSize * scale;
      cursor.style.height = h + 'px';
      cursor.dataset.label = _fontSize + 'px';
    } else {
      cursor.style.height = '16px';
      cursor.dataset.label = '';
    }
  }

  function _removeTextCursor(){
    document.querySelectorAll('.pdf-text-cursor').forEach(function(el){ el.remove(); });
  }

  function _eraseAt(pt, pdfId, pageNum, layer){
    var annots = PDFAnnotations.getPage(pdfId, pageNum);
    for(var i = annots.length - 1; i >= 0; i--){
      var a = annots[i];
      // 지우개는 freehand(펜 낙서)만 지움
      if(a.type !== 'freehand') continue;
      if(!a.points || a.points.length === 0) continue;

      if(_isNearPath(pt, a.points, (a.strokeWidth || 2) + 10)){
        PDFAnnotations.remove(a.id, pdfId, pageNum);
        PDFAnnotations.renderPage(pageNum, layer, _getViewport());
        return;
      }
    }
  }

  // 점 pt가 경로(points) 위의 어떤 선분에서 threshold 이내인지 확인
  function _isNearPath(pt, points, threshold){
    for(var i = 0; i < points.length - 1; i++){
      if(_distToSegment(pt, points[i], points[i + 1]) <= threshold) return true;
    }
    // 점이 하나뿐인 경우
    if(points.length === 1){
      var dx = pt.x - points[0].x, dy = pt.y - points[0].y;
      return Math.sqrt(dx * dx + dy * dy) <= threshold;
    }
    return false;
  }

  // 점 p에서 선분 v-w까지의 최소 거리
  function _distToSegment(p, v, w){
    var dx = w.x - v.x, dy = w.y - v.y;
    var lenSq = dx * dx + dy * dy;
    if(lenSq === 0){
      var d0 = p.x - v.x, d1 = p.y - v.y;
      return Math.sqrt(d0 * d0 + d1 * d1);
    }
    var t = ((p.x - v.x) * dx + (p.y - v.y) * dy) / lenSq;
    if(t < 0) t = 0; else if(t > 1) t = 1;
    var projX = v.x + t * dx, projY = v.y + t * dy;
    var ex = p.x - projX, ey = p.y - projY;
    return Math.sqrt(ex * ex + ey * ey);
  }

  function _hexToRgba(hex, alpha){
    if(hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    var r = parseInt(hex.slice(1,3), 16) || 0;
    var g = parseInt(hex.slice(3,5), 16) || 0;
    var b = parseInt(hex.slice(5,7), 16) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function undo(){
    if(!_undoStack.length) return;
    var annotId = _undoStack.pop();
    var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
    var pageNum = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
    if(!pdfId) return;
    // Save full annotation data before deleting (for redo)
    var annots = PDFAnnotations.getPage(pdfId, pageNum);
    var annotData = null;
    for(var i = 0; i < annots.length; i++){
      if(annots[i].id === annotId){ annotData = JSON.parse(JSON.stringify(annots[i])); break; }
    }
    if(annotData) _redoStack.push(annotData);
    PDFAnnotations.remove(annotId, pdfId, pageNum);
    var layer = document.querySelector('.pdf-annot-layer[data-page="' + pageNum + '"]');
    if(layer) PDFAnnotations.renderPage(pageNum, layer, _getViewport());
  }

  function redo(){
    if(!_redoStack.length) return;
    var annotData = _redoStack.pop();
    PDFAnnotations.save(annotData);
    _undoStack.push(annotData.id);
    var layer = document.querySelector('.pdf-annot-layer[data-page="' + annotData.pageNum + '"]');
    if(layer) PDFAnnotations.renderPage(annotData.pageNum, layer, _getViewport());
  }

  return {
    setTool: setTool,
    getTool: getTool,
    setColor: setColor,
    getFontSize: getFontSize,
    initPageEvents: initPageEvents,
    undo: undo,
    redo: redo
  };
})();
