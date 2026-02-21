// pdf-tools.js — PDF annotation tools (select, highlight, draw, text, eraser)
// Uses PointerEvent API for unified mouse/touch/pen handling

var PDFTools = (function(){
  var _currentTool = 'select'; // 'select' | 'highlight' | 'draw' | 'text' | 'eraser'
  var _isDrawing = false;
  var _currentPath = [];
  var _currentColor = '#FACC15';
  var _undoStack = [];
  var _redoStack = [];
  var _startPoint = null;
  var _selectionRect = null;

  function setTool(tool){
    _currentTool = tool;

    // Update toolbar UI
    var tools = ['Select', 'HL', 'Draw', 'Text', 'Eraser'];
    tools.forEach(function(t){
      var btn = document.getElementById('pdfTool' + t);
      if(btn) btn.classList.toggle('active', t.toLowerCase() === tool.substr(0, t.length).toLowerCase());
    });
    document.querySelectorAll('#pdfToolbar .pdf-tool-btn').forEach(function(b){
      b.classList.remove('active');
    });
    var activeBtn = document.getElementById('pdfTool' + { select:'Select', highlight:'HL', draw:'Draw', text:'Text', eraser:'Eraser' }[tool]);
    if(activeBtn) activeBtn.classList.add('active');

    // Set annotation layers interactive/not
    document.querySelectorAll('.pdf-annot-layer').forEach(function(layer){
      layer.classList.toggle('interactive', tool !== 'select');
    });
  }

  function getTool(){ return _currentTool; }

  function setColor(color){
    _currentColor = color;
  }

  // Initialize event listeners on a page's annotation layer
  function initPageEvents(layerEl, pageNum){
    layerEl.addEventListener('pointerdown', function(e){ _onPointerDown(e, pageNum, layerEl); });
    layerEl.addEventListener('pointermove', function(e){ _onPointerMove(e, pageNum, layerEl); });
    layerEl.addEventListener('pointerup', function(e){ _onPointerUp(e, pageNum, layerEl); });
    layerEl.addEventListener('pointercancel', function(e){ _onPointerUp(e, pageNum, layerEl); });
  }

  function _onPointerDown(e, pageNum, layer){
    // Auto-switch to draw mode for pen
    if(e.pointerType === 'pen' && _currentTool === 'select'){
      setTool('draw');
    }

    // Palm rejection: ignore touch during pen use
    if(e.pointerType === 'touch' && typeof InputManager !== 'undefined' && InputManager.isPen()){
      return;
    }

    if(_currentTool === 'select') return;

    e.preventDefault();
    _isDrawing = true;
    var pt = _getPoint(e, layer);
    _startPoint = pt;

    if(_currentTool === 'draw'){
      var pressure = e.pressure || 0.5;
      _currentPath = [{ x: pt.x, y: pt.y, pressure: pressure }];
    }
  }

  function _onPointerMove(e, pageNum, layer){
    if(!_isDrawing) return;
    e.preventDefault();

    var pt = _getPoint(e, layer);

    if(_currentTool === 'draw'){
      var pressure = e.pressure || 0.5;
      _currentPath.push({ x: pt.x, y: pt.y, pressure: pressure });
      _drawLivePreview(layer);
    } else if(_currentTool === 'highlight'){
      _drawSelectionPreview(layer, pt);
    }
  }

  function _onPointerUp(e, pageNum, layer){
    if(!_isDrawing) return;
    _isDrawing = false;

    var pdfId = PDFViewer.getCurrentPdfId();
    if(!pdfId) return;

    var pt = _getPoint(e, layer);

    if(_currentTool === 'draw' && _currentPath.length > 1){
      // Calculate average pressure for stroke width
      var avgPressure = _currentPath.reduce(function(s, p){ return s + p.pressure; }, 0) / _currentPath.length;
      var strokeWidth = 1 + (avgPressure * 6); // 1-7px range

      var annot = PDFAnnotations.createAnnot('freehand', pdfId, pageNum, {
        points: _currentPath,
        color: _currentColor,
        strokeWidth: strokeWidth
      });
      PDFAnnotations.save(annot);
      _undoStack.push(annot.id);
      _redoStack = [];

      // Remove preview, re-render
      _clearPreview(layer);
      PDFAnnotations.renderPage(pageNum, layer, _getViewport());
    }
    else if(_currentTool === 'highlight' && _startPoint){
      var rect = _makeRect(_startPoint, pt);
      if(rect.width > 5 && rect.height > 5){
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
    var scale = PDFViewer.getScale() || 1;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  }

  function _getViewport(){
    return { scale: PDFViewer.getScale() || 1 };
  }

  function _drawLivePreview(layer){
    var preview = layer.querySelector('.pdf-draw-preview');
    if(!preview){
      preview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      preview.setAttribute('class', 'pdf-draw-preview');
      preview.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5';
      layer.appendChild(preview);
    }

    var scale = PDFViewer.getScale() || 1;
    if(_currentPath.length < 2) return;

    var d = 'M ' + (_currentPath[0].x * scale) + ' ' + (_currentPath[0].y * scale);
    for(var i = 1; i < _currentPath.length; i++){
      d += ' L ' + (_currentPath[i].x * scale) + ' ' + (_currentPath[i].y * scale);
    }

    var avgP = _currentPath.reduce(function(s, p){ return s + p.pressure; }, 0) / _currentPath.length;
    preview.innerHTML = '<path d="' + d + '" stroke="' + _currentColor + '" stroke-width="' + (1 + avgP * 6) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  function _drawSelectionPreview(layer, pt){
    var preview = layer.querySelector('.pdf-sel-preview');
    if(!preview){
      preview = document.createElement('div');
      preview.className = 'pdf-sel-preview';
      preview.style.cssText = 'position:absolute;border:1px dashed ' + _currentColor + ';background:' + _hexToRgba(_currentColor, 0.15) + ';pointer-events:none;z-index:5';
      layer.appendChild(preview);
    }
    var scale = PDFViewer.getScale() || 1;
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

  function _showTextInput(layer, pt, pdfId, pageNum){
    var scale = PDFViewer.getScale() || 1;
    var input = document.createElement('textarea');
    input.style.cssText = 'position:absolute;left:' + (pt.x * scale) + 'px;top:' + (pt.y * scale) + 'px;width:180px;height:60px;font-size:12px;padding:4px;border:1px solid var(--accent-color,#086DDD);border-radius:3px;background:rgba(255,255,200,.95);color:#333;z-index:10;resize:both;outline:none';
    input.placeholder = 'Enter text...';
    layer.appendChild(input);
    input.focus();

    input.addEventListener('blur', function(){
      var text = input.value.trim();
      if(text){
        var annot = PDFAnnotations.createAnnot('text', pdfId, pageNum, {
          rect: { x: pt.x, y: pt.y, width: 180 / scale, height: 60 / scale },
          text: text,
          color: '#FFFFA0'
        });
        PDFAnnotations.save(annot);
        _undoStack.push(annot.id);
        _redoStack = [];
      }
      input.remove();
      PDFAnnotations.renderPage(pageNum, layer, _getViewport());
    });
  }

  function _eraseAt(pt, pdfId, pageNum, layer){
    var annots = PDFAnnotations.getPage(pdfId, pageNum);
    var scale = PDFViewer.getScale() || 1;

    // Find annotation at click point
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

  // Undo/Redo
  function undo(){
    if(!_undoStack.length) return;
    var annotId = _undoStack.pop();
    _redoStack.push(annotId);
    var pdfId = PDFViewer.getCurrentPdfId();
    var pageNum = PDFViewer.getCurrentPage();
    PDFAnnotations.remove(annotId, pdfId, pageNum);
    var layer = document.querySelector('.pdf-annot-layer[data-page="' + pageNum + '"]');
    if(layer) PDFAnnotations.renderPage(pageNum, layer, _getViewport());
  }

  function redo(){
    // Simplified: would need to store full annotation for restore
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
