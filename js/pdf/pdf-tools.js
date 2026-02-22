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

  function setTool(tool){
    _currentTool = tool;

    // Update toolbar buttons
    document.querySelectorAll('#pdfToolbar .pdf-tool-btn').forEach(function(b){
      b.classList.remove('active');
    });
    var map = { select:'Select', highlight:'HL', draw:'Draw', text:'Text', eraser:'Eraser' };
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

    if(tool === 'select' || tool === 'eraser'){
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';

    // 색상 선택 (draw, highlight, text 모두)
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

  function getFontSize(){ return _fontSize; }

  function getTool(){ return _currentTool; }
  function setColor(color){ _currentColor = color; }

  // Initialize event listeners on a page's annotation layer
  function initPageEvents(layerEl, pageNum){
    layerEl.addEventListener('pointerdown', function(e){ _onPointerDown(e, pageNum, layerEl); });
    layerEl.addEventListener('pointermove', function(e){ _onPointerMove(e, pageNum, layerEl); });
    layerEl.addEventListener('pointerup', function(e){ _onPointerUp(e, pageNum, layerEl); });
    layerEl.addEventListener('pointercancel', function(e){ _onPointerUp(e, pageNum, layerEl); });
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
    if(!_isDrawing || e.pointerId !== _activePointerId) return;
    e.preventDefault();
    e.stopPropagation();

    var pt = _getPoint(e, layer);

    if(_currentTool === 'draw'){
      _currentPath.push({ x: pt.x, y: pt.y, pressure: e.pressure || 0.5 });
      _drawLivePreview(layer);
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
      var annot = PDFAnnotations.createAnnot('freehand', pdfId, pageNum, {
        points: _currentPath,
        color: _currentColor,
        strokeWidth: 1 + (avgP * 6)
      });
      PDFAnnotations.save(annot);
      _undoStack.push(annot.id);
      _redoStack = [];
      _clearPreview(layer);
      PDFAnnotations.renderPage(pageNum, layer, _getViewport());
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
    preview.innerHTML = '<path d="' + d + '" stroke="' + _currentColor + '" stroke-width="' + (1 + avgP * 6) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
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

  function _closeInlineEditor(){
    document.querySelectorAll('.pdf-inline-editor').forEach(function(el){ el.remove(); });
    // 레거시 메모 팝업도 정리
    document.querySelectorAll('.pdf-memo-pin').forEach(function(el){ el.remove(); });
    document.querySelectorAll('.pdf-memo-popup').forEach(function(el){ el.remove(); });
  }

  function _eraseAt(pt, pdfId, pageNum, layer){
    var annots = PDFAnnotations.getPage(pdfId, pageNum);
    for(var i = annots.length - 1; i >= 0; i--){
      var a = annots[i];
      var hit = false;

      if(a.type === 'freehand' && a.points && a.points.length > 0){
        // freehand: 클릭 지점과 경로 선분 사이 최소 거리 확인
        hit = _isNearPath(pt, a.points, (a.strokeWidth || 2) + 10);
      } else if(a.rect){
        // rect 기반 (highlight, text, underline, area-link)
        hit = pt.x >= a.rect.x && pt.x <= a.rect.x + (a.rect.width || 20) &&
              pt.y >= a.rect.y && pt.y <= a.rect.y + (a.rect.height || 20);
      }

      if(hit){
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
