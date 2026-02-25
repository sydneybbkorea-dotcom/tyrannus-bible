// pdf-tools.js — PDF annotation tools (select, highlight, draw, straightLine, text, shape, eraser)
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
  var _shapeType = 'rect';     // 'line' | 'arrow' | 'rect' | 'circle'
  var _shapePreview = null;    // 도형 프리뷰 SVG 요소

  // ══════════════════════════════════════════════
  //  setTool: 도구 전환 + 플라이아웃 관리
  // ══════════════════════════════════════════════
  function setTool(tool){
    var prevTool = _currentTool;
    var hasFlyout = (tool !== 'select' && tool !== 'eraser');
    var flyoutOpen = !!document.getElementById('pdfToolFlyout');

    // 같은 도구 재클릭 → 플라이아웃 토글
    if(tool === prevTool && hasFlyout){
      if(flyoutOpen) _closeToolFlyout();
      else _showToolFlyout(tool);
      return;
    }

    _currentTool = tool;
    _removeTextCursor();
    _closeToolFlyout();

    // 툴바 버튼 active 상태 업데이트
    document.querySelectorAll('#pdfFloatToolbar .pdf-tool-btn').forEach(function(b){
      b.classList.remove('active');
    });
    var map = {
      select:'Select', highlight:'HL', draw:'Draw', straightLine:'Straight',
      text:'Text', memo:'Memo', eraser:'Eraser', shape:'Shape'
    };
    var activeBtn = document.getElementById('pdfTool' + map[tool]);
    if(activeBtn) activeBtn.classList.add('active');

    // 어노테이션 레이어 인터랙티브 설정
    document.querySelectorAll('.pdf-annot-layer').forEach(function(layer){
      if(tool !== 'select') layer.classList.add('interactive');
      else layer.classList.remove('interactive');
    });

    // 뷰포트에 touch-action:none 토글 (iPad 펜슬 스크롤 방지)
    document.querySelectorAll('.pdf-viewport').forEach(function(vp){
      vp.classList.toggle('pdf-tool-active', tool !== 'select');
    });

    // 플라이아웃 표시
    if(hasFlyout) _showToolFlyout(tool);
  }

  // ══════════════════════════════════════════════
  //  플라이아웃 시스템 (버튼 옆 팝업)
  // ══════════════════════════════════════════════
  function _closeToolFlyout(){
    var f = document.getElementById('pdfToolFlyout');
    if(f) f.remove();
    document.removeEventListener('pointerdown', _onFlyoutOutside);
  }

  function _onFlyoutOutside(e){
    var flyout = document.getElementById('pdfToolFlyout');
    if(!flyout){ document.removeEventListener('pointerdown', _onFlyoutOutside); return; }
    // 플로팅 툴바 내부 클릭은 무시
    if(e.target.closest('#pdfFloatToolbar')) return;
    _closeToolFlyout();
  }

  function _showToolFlyout(tool){
    _closeToolFlyout();

    var idMap = { highlight:'HL', draw:'Draw', straightLine:'Straight', text:'Text', shape:'Shape' };
    var btnId = 'pdfTool' + (idMap[tool] || '');
    var btn = document.getElementById(btnId);
    if(!btn) return;

    var toolbar = document.getElementById('pdfFloatToolbar');
    if(!toolbar) return;

    var opts = document.createElement('div');
    opts.className = 'pdf-tool-flyout-side';
    opts.id = 'pdfToolFlyout';

    switch(tool){
      case 'highlight':    _buildHLFlyout(opts); break;
      case 'draw':         _buildDrawFlyout(opts); break;
      case 'straightLine': _buildStraightFlyout(opts); break;
      case 'text':         _buildTextFlyout(opts); break;
      case 'shape':        _buildShapeFlyout(opts); break;
    }

    opts.addEventListener('pointerdown', function(e){ e.stopPropagation(); });

    // 툴바 옆에 절대 위치로 배치
    toolbar.appendChild(opts);

    // 버튼 위치에 맞춰 세로 정렬
    var btnRect = btn.getBoundingClientRect();
    var tbRect = toolbar.getBoundingClientRect();
    var topOffset = btnRect.top - tbRect.top;
    opts.style.top = topOffset + 'px';

    // 화면 밖 보정
    requestAnimationFrame(function(){
      var oRect = opts.getBoundingClientRect();
      if(oRect.bottom > window.innerHeight - 8){
        opts.style.top = Math.max(0, (window.innerHeight - 8 - oRect.height) - tbRect.top) + 'px';
      }
    });

    // 바깥 클릭 닫기
    setTimeout(function(){
      document.addEventListener('pointerdown', _onFlyoutOutside);
    }, 10);
  }

  // ── 공통 헬퍼 ──
  function _buildColorRow(parent, colors){
    var row = document.createElement('div');
    row.className = 'pdf-flyout-colors';  /* 항상 펼쳐진 상태 */
    colors.forEach(function(c){
      var dot = document.createElement('button');
      dot.className = 'pdf-opt-color' + (c === _currentColor ? ' active' : '');
      dot.style.background = c;
      if(c === '#FFFFFF') dot.style.border = '1px solid var(--border,#444)';
      dot.addEventListener('click', function(e){
        e.stopPropagation();
        _currentColor = c;
        row.querySelectorAll('.pdf-opt-color').forEach(function(d){ d.classList.remove('active'); });
        dot.classList.add('active');
      });
      row.appendChild(dot);
    });
    parent.appendChild(row);
  }

  function _buildSliderRow(parent, label, min, max, step, value, suffix, onChange, extraClass){
    var section = document.createElement('div');
    section.className = 'pdf-flyout-slider-section';

    var header = document.createElement('div');
    header.className = 'pdf-flyout-slider-header';
    var lbl = document.createElement('label');
    lbl.textContent = label;
    header.appendChild(lbl);
    var valSpan = document.createElement('span');
    valSpan.className = 'pdf-flyout-val';
    valSpan.textContent = value + (suffix || '');
    header.appendChild(valSpan);
    section.appendChild(header);

    var slider = document.createElement('input');
    slider.type = 'range'; slider.min = min; slider.max = max;
    slider.step = step; slider.value = value;
    if(extraClass) slider.className = extraClass;

    slider.addEventListener('input', function(e){
      e.stopPropagation();
      valSpan.textContent = slider.value + (suffix || '');
      onChange(parseFloat(slider.value));
    });

    section.appendChild(slider);
    parent.appendChild(section);
    return { slider: slider, valSpan: valSpan };
  }

  // ── 형광펜 ──
  function _buildHLFlyout(flyout){
    _buildColorRow(flyout, ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C']);
  }

  // ── 펜 (Draw) ──
  function _buildDrawFlyout(flyout){
    // 펜 종류
    var typeRow = document.createElement('div');
    typeRow.className = 'pdf-flyout-pen-types';
    [
      { id:'ballpen', icon:'fa-pen',    label:'볼펜' },
      { id:'pencil',  icon:'fa-pencil', label:'연필' }
    ].forEach(function(pt){
      var btn = document.createElement('button');
      btn.className = 'pdf-flyout-shape-btn' + (pt.id === _penType ? ' active' : '');
      btn.innerHTML = '<i class="fa ' + pt.icon + '"></i>';
      btn.title = pt.label;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        _penType = pt.id;
        _opacity = pt.id === 'pencil' ? 0.7 : 1.0;
        typeRow.querySelectorAll('.pdf-flyout-shape-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var opEl = flyout.querySelector('.pdf-flyout-op-slider');
        if(opEl){
          opEl.value = Math.round(_opacity * 100);
          var vs = opEl.parentNode.querySelector('.pdf-flyout-val');
          if(vs) vs.textContent = Math.round(_opacity * 100) + '%';
        }
      });
      typeRow.appendChild(btn);
    });
    flyout.appendChild(typeRow);

    // 색상
    _buildColorRow(flyout, ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C','#000000','#FFFFFF']);

    // 굵기
    _buildSliderRow(flyout, '굵기', 1, 10, 1, _strokeWidth, '', function(v){ _strokeWidth = v; });

    // 투명도
    _buildSliderRow(flyout, '투명도', 10, 100, 5, Math.round(_opacity * 100), '%', function(v){
      _opacity = v / 100;
    }, 'pdf-flyout-op-slider');
  }

  // ── 직선 ──
  function _buildStraightFlyout(flyout){
    _buildColorRow(flyout, ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C','#000000','#FFFFFF']);
    _buildSliderRow(flyout, '굵기', 1, 10, 1, _strokeWidth, '', function(v){ _strokeWidth = v; });
  }

  // ── 텍스트 ──
  function _buildTextFlyout(flyout){
    _buildColorRow(flyout, ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C','#000000','#FFFFFF']);
    _buildSliderRow(flyout, '크기', 10, 40, 2, _fontSize, 'px', function(v){ _fontSize = v; });
  }

  // ── 도형 ──
  function _buildShapeFlyout(flyout){
    var shapeRow = document.createElement('div');
    shapeRow.className = 'pdf-flyout-shapes';
    [
      { id:'line',   icon:'─', label:'직선' },
      { id:'arrow',  icon:'→', label:'화살표' },
      { id:'rect',   icon:'□', label:'사각형' },
      { id:'circle', icon:'○', label:'원' }
    ].forEach(function(s){
      var btn = document.createElement('button');
      btn.className = 'pdf-flyout-shape-btn' + (s.id === _shapeType ? ' active' : '');
      btn.textContent = s.icon;
      btn.title = s.label;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        _shapeType = s.id;
        shapeRow.querySelectorAll('.pdf-flyout-shape-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      });
      shapeRow.appendChild(btn);
    });
    flyout.appendChild(shapeRow);

    _buildColorRow(flyout, ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C','#000000','#FFFFFF']);
    _buildSliderRow(flyout, '굵기', 1, 10, 1, _strokeWidth, '', function(v){ _strokeWidth = v; });
  }

  // ══════════════════════════════════════════════
  //  기본 API
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  포인터 이벤트 핸들러
  // ══════════════════════════════════════════════
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
    } else if(_currentTool === 'shape'){
      _startPoint = pt;
      _shapePreview = _createShapePreviewSvg(layer);
    } else if(_currentTool === 'straightLine'){
      _startPoint = pt;
      _shapePreview = _createShapePreviewSvg(layer);
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
    } else if(_currentTool === 'shape'){
      _updateShapePreview(pt);
    } else if(_currentTool === 'straightLine'){
      // 가로/세로 스냅
      var dx = Math.abs(pt.x - _startPoint.x);
      var dy = Math.abs(pt.y - _startPoint.y);
      var snapped;
      if(dx >= dy){
        snapped = { x: pt.x, y: _startPoint.y }; // 가로
      } else {
        snapped = { x: _startPoint.x, y: pt.y }; // 세로
      }
      _updateStraightLinePreview(snapped);
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
    else if(_currentTool === 'shape' && _startPoint){
      _finalizeShape(pt, pdfId, pageNum, layer);
    }
    else if(_currentTool === 'straightLine' && _startPoint){
      _finalizeStraightLine(pt, pdfId, pageNum, layer);
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

  // ══════════════════════════════════════════════
  //  좌표/뷰포트 유틸
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  라이브 프리뷰 (draw)
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  텍스트 입력 (인라인)
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  메모 입력 팝업
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  도형 프리뷰 + 완성
  // ══════════════════════════════════════════════
  function _createShapePreviewSvg(layer){
    var svg = layer.querySelector('.pdf-shape-preview');
    if(!svg){
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'pdf-shape-preview');
      svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;overflow:visible';
      layer.appendChild(svg);
    }
    // arrowhead marker 추가
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'pb-arrow-preview');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '0 0, 10 3.5, 0 7');
    poly.setAttribute('fill', _currentColor);
    marker.appendChild(poly);
    defs.appendChild(marker);
    svg.appendChild(defs);
    return svg;
  }

  function _updateShapePreview(pt){
    if(!_shapePreview || !_startPoint) return;
    var scale = _getViewport().scale;
    var sx = _startPoint.x * scale, sy = _startPoint.y * scale;
    var ex = pt.x * scale, ey = pt.y * scale;

    // 기존 프리뷰 도형 제거 (defs는 유지)
    var old = _shapePreview.querySelector('.pb-shape-el');
    if(old) old.remove();

    var el;
    switch(_shapeType){
      case 'line':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', sx); el.setAttribute('y1', sy);
        el.setAttribute('x2', ex); el.setAttribute('y2', ey);
        el.setAttribute('stroke', _currentColor);
        el.setAttribute('stroke-width', _strokeWidth);
        el.setAttribute('stroke-opacity', _opacity);
        break;
      case 'arrow':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', sx); el.setAttribute('y1', sy);
        el.setAttribute('x2', ex); el.setAttribute('y2', ey);
        el.setAttribute('stroke', _currentColor);
        el.setAttribute('stroke-width', _strokeWidth);
        el.setAttribute('stroke-opacity', _opacity);
        el.setAttribute('marker-end', 'url(#pb-arrow-preview)');
        break;
      case 'rect':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttribute('x', Math.min(sx, ex));
        el.setAttribute('y', Math.min(sy, ey));
        el.setAttribute('width', Math.abs(ex - sx));
        el.setAttribute('height', Math.abs(ey - sy));
        el.setAttribute('stroke', _currentColor);
        el.setAttribute('stroke-width', _strokeWidth);
        el.setAttribute('stroke-opacity', _opacity);
        el.setAttribute('fill', 'none');
        break;
      case 'circle':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        el.setAttribute('cx', (sx + ex) / 2);
        el.setAttribute('cy', (sy + ey) / 2);
        el.setAttribute('rx', Math.abs(ex - sx) / 2);
        el.setAttribute('ry', Math.abs(ey - sy) / 2);
        el.setAttribute('stroke', _currentColor);
        el.setAttribute('stroke-width', _strokeWidth);
        el.setAttribute('stroke-opacity', _opacity);
        el.setAttribute('fill', 'none');
        break;
    }
    if(el){
      el.setAttribute('class', 'pb-shape-el');
      _shapePreview.appendChild(el);
    }
  }

  function _finalizeShape(pt, pdfId, pageNum, layer){
    // 프리뷰 제거
    if(_shapePreview && _shapePreview.parentElement) _shapePreview.remove();
    _shapePreview = null;

    if(!_startPoint) return;
    var dx = Math.abs(pt.x - _startPoint.x), dy = Math.abs(pt.y - _startPoint.y);
    if(dx < 3 && dy < 3) return; // 너무 작으면 무시

    var opts = {
      color: _currentColor,
      strokeWidth: _strokeWidth,
      opacity: _opacity,
      shapeType: _shapeType
    };

    if(_shapeType === 'line' || _shapeType === 'arrow'){
      opts.points = [
        { x: _startPoint.x, y: _startPoint.y },
        { x: pt.x, y: pt.y }
      ];
    } else {
      opts.rect = _makeRect(_startPoint, pt);
    }

    var annot = PDFAnnotations.createAnnot('shape', pdfId, pageNum, opts);
    PDFAnnotations.save(annot);
    _undoStack.push(annot.id);
    _redoStack = [];
    PDFAnnotations.renderPage(pageNum, layer, _getViewport());

    // 라이브 강의: 스트로크 완성 훅
    if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
      PDFLive.onStrokeComplete(pageNum, annot);
    }
  }

  // ══════════════════════════════════════════════
  //  직선 펜 (가로/세로 스냅)
  // ══════════════════════════════════════════════
  function _updateStraightLinePreview(snapped){
    if(!_shapePreview || !_startPoint) return;
    var scale = _getViewport().scale;
    var sx = _startPoint.x * scale, sy = _startPoint.y * scale;
    var ex = snapped.x * scale, ey = snapped.y * scale;

    var old = _shapePreview.querySelector('.pb-shape-el');
    if(old) old.remove();

    var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', sx); el.setAttribute('y1', sy);
    el.setAttribute('x2', ex); el.setAttribute('y2', ey);
    el.setAttribute('stroke', _currentColor);
    el.setAttribute('stroke-width', _strokeWidth);
    el.setAttribute('stroke-opacity', _opacity);
    el.setAttribute('class', 'pb-shape-el');
    _shapePreview.appendChild(el);
  }

  function _finalizeStraightLine(pt, pdfId, pageNum, layer){
    // 프리뷰 제거
    if(_shapePreview && _shapePreview.parentElement) _shapePreview.remove();
    _shapePreview = null;

    if(!_startPoint) return;
    var dx = Math.abs(pt.x - _startPoint.x);
    var dy = Math.abs(pt.y - _startPoint.y);
    if(dx < 3 && dy < 3) return;

    // 가로/세로 스냅
    var snapped;
    if(dx >= dy){
      snapped = { x: pt.x, y: _startPoint.y };
    } else {
      snapped = { x: _startPoint.x, y: pt.y };
    }

    var annot = PDFAnnotations.createAnnot('shape', pdfId, pageNum, {
      color: _currentColor,
      strokeWidth: _strokeWidth,
      opacity: _opacity,
      shapeType: 'line',
      points: [
        { x: _startPoint.x, y: _startPoint.y },
        { x: snapped.x, y: snapped.y }
      ]
    });
    PDFAnnotations.save(annot);
    _undoStack.push(annot.id);
    _redoStack = [];
    PDFAnnotations.renderPage(pageNum, layer, _getViewport());

    if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
      PDFLive.onStrokeComplete(pageNum, annot);
    }
  }

  // ══════════════════════════════════════════════
  //  지우개
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  Undo / Redo
  // ══════════════════════════════════════════════
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

  // ══════════════════════════════════════════════
  //  공개 API 확장 (프리젠터바에서 사용)
  // ══════════════════════════════════════════════
  function setPenType(type){
    if(type === 'highlighter'){
      _penType = 'highlighter';
      _opacity = 0.4;
    } else if(type === 'pencil'){
      _penType = 'pencil';
      _opacity = 0.7;
    } else {
      _penType = 'ballpen';
      _opacity = 1.0;
    }
  }
  function getPenType(){ return _penType; }
  function setStrokeWidth(w){ _strokeWidth = w; }
  function getStrokeWidth(){ return _strokeWidth; }
  function setOpacity(o){ _opacity = o; }
  function getOpacity(){ return _opacity; }
  function getColor(){ return _currentColor; }
  function setShapeType(t){ _shapeType = t; }
  function getShapeType(){ return _shapeType; }

  return {
    setTool: setTool,
    getTool: getTool,
    setColor: setColor,
    getColor: getColor,
    getFontSize: getFontSize,
    setPenType: setPenType,
    getPenType: getPenType,
    setStrokeWidth: setStrokeWidth,
    getStrokeWidth: getStrokeWidth,
    setOpacity: setOpacity,
    getOpacity: getOpacity,
    setShapeType: setShapeType,
    getShapeType: getShapeType,
    initPageEvents: initPageEvents,
    undo: undo,
    redo: redo
  };
})();
