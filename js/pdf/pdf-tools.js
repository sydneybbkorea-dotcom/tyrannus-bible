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
  }

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

  // ── Text Memo (인라인 플로팅 — 블러 없음, 탭 위치 정확) ──
  function _showTextInput(layer, pt, pdfId, pageNum){
    // Remove any existing memo elements
    _closeMemo();

    var scale = _getViewport().scale;
    var pixelX = pt.x * scale;
    var pixelY = pt.y * scale;

    // ── Pin marker at exact tap point ──
    var pin = document.createElement('div');
    pin.className = 'pdf-memo-pin';
    pin.style.left = pixelX + 'px';
    pin.style.top  = pixelY + 'px';
    layer.appendChild(pin);

    // ── Floating popup positioned near tap point ──
    var popup = document.createElement('div');
    popup.className = 'pdf-memo-popup';

    // Position: slightly right and below the pin, keep within page
    var layerRect = layer.getBoundingClientRect();
    var popLeft = pixelX + 16;
    var popTop  = pixelY - 10;
    // Prevent overflow right
    if(popLeft + 260 > layerRect.width) popLeft = pixelX - 276;
    if(popLeft < 0) popLeft = 4;
    // Prevent overflow bottom
    if(popTop + 240 > layerRect.height) popTop = pixelY - 250;
    if(popTop < 0) popTop = 4;

    popup.style.left = popLeft + 'px';
    popup.style.top  = popTop  + 'px';

    // ── Header (draggable) ──
    var header = document.createElement('div');
    header.className = 'pdf-memo-header';
    header.innerHTML = '<i class="fa fa-pen-to-square"></i><span>메모 추가</span>';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pdf-memo-close';
    closeBtn.innerHTML = '<i class="fa fa-xmark"></i>';
    closeBtn.onclick = function(){ _closeMemo(); };
    header.appendChild(closeBtn);

    // Drag logic
    var dragState = { active: false, sx: 0, sy: 0, ox: 0, oy: 0 };
    header.addEventListener('pointerdown', function(e){
      if(e.target.closest('.pdf-memo-close')) return;
      dragState.active = true;
      dragState.sx = e.clientX;
      dragState.sy = e.clientY;
      dragState.ox = popup.offsetLeft;
      dragState.oy = popup.offsetTop;
      header.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    header.addEventListener('pointermove', function(e){
      if(!dragState.active) return;
      popup.style.left = (dragState.ox + e.clientX - dragState.sx) + 'px';
      popup.style.top  = (dragState.oy + e.clientY - dragState.sy) + 'px';
    });
    header.addEventListener('pointerup', function(e){
      dragState.active = false;
      try { header.releasePointerCapture(e.pointerId); } catch(err){}
    });

    // ── Textarea ──
    var textarea = document.createElement('textarea');
    textarea.className = 'pdf-memo-textarea';
    textarea.placeholder = '메모를 입력하세요...';

    // ── Footer: color dots + save button ──
    var footer = document.createElement('div');
    footer.className = 'pdf-memo-footer';

    var colors = ['#FACC15','#4ADE80','#60A5FA','#F87171','#C084FC','#FB923C'];
    var selectedColor = '#FACC15';
    colors.forEach(function(c){
      var dot = document.createElement('button');
      dot.className = 'pdf-memo-color-dot' + (c === '#FACC15' ? ' active' : '');
      dot.style.background = c;
      dot.onclick = function(){
        footer.querySelectorAll('.pdf-memo-color-dot').forEach(function(d){ d.classList.remove('active'); });
        dot.classList.add('active');
        selectedColor = c;
      };
      footer.appendChild(dot);
    });

    var saveBtn = document.createElement('button');
    saveBtn.className = 'pdf-memo-btn-save';
    saveBtn.innerHTML = '<i class="fa fa-check"></i> 저장';
    saveBtn.onclick = function(){
      var text = textarea.value.trim();
      if(text){
        var annot = PDFAnnotations.createAnnot('text', pdfId, pageNum, {
          rect: { x: pt.x, y: pt.y, width: 200 / scale, height: 80 / scale },
          text: text,
          color: selectedColor
        });
        PDFAnnotations.save(annot);
        _undoStack.push(annot.id);
        _redoStack = [];
        PDFAnnotations.renderPage(pageNum, layer, _getViewport());
      }
      _closeMemo();
    };
    footer.appendChild(saveBtn);

    // Assemble
    popup.appendChild(header);
    popup.appendChild(textarea);
    popup.appendChild(footer);
    layer.appendChild(popup);

    // Focus textarea
    requestAnimationFrame(function(){ textarea.focus(); });

    // Enter to save (Shift+Enter for newline)
    textarea.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        saveBtn.click();
      }
    });

    // Prevent pointer events on popup from triggering annotation tools
    popup.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointermove', function(e){ e.stopPropagation(); });
    popup.addEventListener('pointerup', function(e){ e.stopPropagation(); });
  }

  function _closeMemo(){
    document.querySelectorAll('.pdf-memo-pin').forEach(function(el){ el.remove(); });
    document.querySelectorAll('.pdf-memo-popup').forEach(function(el){ el.remove(); });
  }

  function _eraseAt(pt, pdfId, pageNum, layer){
    var annots = PDFAnnotations.getPage(pdfId, pageNum);
    for(var i = annots.length - 1; i >= 0; i--){
      var a = annots[i];
      if(a.rect){
        if(pt.x >= a.rect.x && pt.x <= a.rect.x + a.rect.width &&
           pt.y >= a.rect.y && pt.y <= a.rect.y + a.rect.height){
          PDFAnnotations.remove(a.id, pdfId, pageNum);
          PDFAnnotations.renderPage(pageNum, layer, _getViewport());
          return;
        }
      }
    }
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
    _redoStack.push(annotId);
    var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
    var pageNum = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
    if(pdfId) PDFAnnotations.remove(annotId, pdfId, pageNum);
    var layer = document.querySelector('.pdf-annot-layer[data-page="' + pageNum + '"]');
    if(layer) PDFAnnotations.renderPage(pageNum, layer, _getViewport());
  }

  function redo(){
    console.log('[PDFTools] Redo not yet implemented');
  }

  return {
    setTool: setTool,
    getTool: getTool,
    setColor: setColor,
    initPageEvents: initPageEvents,
    undo: undo,
    redo: redo
  };
})();
