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

    return IDBStore.put('pdf-annots', annot);
  }

  // Delete an annotation
  function remove(annotId, pdfId, pageNum){
    var key = pdfId + ':' + pageNum;
    var arr = _annotsByPage.get(key);
    if(arr){
      _annotsByPage.set(key, arr.filter(function(a){ return a.id !== annotId; }));
    }
    return IDBStore.del('pdf-annots', annotId);
  }

  // Get annotations for a page
  function getPage(pdfId, pageNum){
    var key = pdfId + ':' + pageNum;
    return _annotsByPage.get(key) || [];
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
  }

  function _createAnnotElement(annot, viewport){
    var el;

    switch(annot.type){
      case 'highlight':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-highlight';
        _positionRect(el, annot.rect, viewport);
        if(annot.color) el.style.background = annot.color;
        break;

      case 'underline':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-underline';
        _positionRect(el, annot.rect, viewport);
        if(annot.color) el.style.borderBottomColor = annot.color;
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
          el.appendChild(path);
        }
        break;

      case 'text':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-text';
        _positionRect(el, annot.rect, viewport);
        el.textContent = annot.text || '';
        break;

      case 'area-link':
        el = document.createElement('div');
        el.className = 'pdf-annot pdf-annot-area-link';
        _positionRect(el, annot.rect, viewport);
        if(annot.linkedUri){
          el.onclick = function(){ NavigationRouter.navigateTo(annot.linkedUri); };
          el.style.cursor = 'pointer';
        }
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
      linkedUri: opts.linkedUri || null,
      createdAt: Date.now()
    };
  }

  return {
    load: load,
    save: save,
    remove: remove,
    getPage: getPage,
    renderPage: renderPage,
    createAnnot: createAnnot
  };
})();
