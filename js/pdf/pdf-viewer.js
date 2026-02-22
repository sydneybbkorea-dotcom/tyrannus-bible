// pdf-viewer.js — PDF.js 기반 뷰어
// window.pdfjsLib (3.11.174 UMD) 가 index.html <script> 태그로 미리 로드됨

var PDFViewer = (function(){
  var WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  var _pdfDoc = null;
  var _currentPdfId = null;
  var _currentPage = 1;
  var _totalPages = 0;
  var _scale = 1.0;
  var _renderedPages = new Map();
  var _container = null;
  var _workerSet = false;

  function _ensureWorker(){
    if(_workerSet) return;
    if(window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions){
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      _workerSet = true;
    }
  }

  // ── Open PDF by IDB id ──
  function open(pdfId, page){
    _currentPdfId = pdfId;
    _currentPage = page || 1;
    _pdfDoc = null;
    _renderedPages.clear();
    _container = null;

    _showLoading();

    if(!window.pdfjsLib){
      _showError('PDF.js 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해 주세요.');
      return Promise.resolve();
    }

    _ensureWorker();

    // Ensure IDB is open (safety)
    var idbReady = (typeof IDBStore !== 'undefined' && IDBStore.open)
      ? IDBStore.open()
      : Promise.resolve();

    return idbReady.then(function(){
      return IDBStore.loadFile(pdfId);
    }).then(function(rec){
      if(rec && rec.data){
        // 로컬 IDB에서 찾음
        if(rec.data instanceof Blob || rec.data instanceof File){
          return rec.data.arrayBuffer();
        }
        if(rec.data instanceof ArrayBuffer) return rec.data;
        if(rec.data && rec.data.buffer instanceof ArrayBuffer) return rec.data.buffer;
        throw new Error('알 수 없는 데이터 형식');
      }
      // 로컬에 없으면 클라우드에서 다운로드 시도
      if(window.downloadPdfBlobFromCloud){
        _showCloudDownloading();
        return window.downloadPdfBlobFromCloud(pdfId).then(function(blob){
          if(!blob) throw new Error('PDF 파일을 찾을 수 없습니다 (로컬/클라우드 모두 없음)');
          // 다운로드한 blob을 IDB에 캐시
          IDBStore.saveFile(blob, { id: pdfId, name: pdfId, type: 'application/pdf' });
          return blob.arrayBuffer();
        });
      }
      throw new Error('PDF 파일을 찾을 수 없습니다 (ID: ' + pdfId + ')');
    }).then(function(buf){
      return window.pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    }).then(function(pdf){
      _pdfDoc = pdf;
      _totalPages = pdf.numPages;
      _buildViewerUI();
      // IDB에서 어노테이션 로드 (하이라이트, 메모 등)
      var annotReady = (typeof PDFAnnotations !== 'undefined')
        ? PDFAnnotations.load(pdfId)
        : Promise.resolve();
      return annotReady.then(function(){ return _fitScale(); });
    }).then(function(){
      _renderVisiblePages();
      _updatePageInfo();
      if(typeof EventBus !== 'undefined'){
        EventBus.emit('pdf:opened', { pdfId: pdfId, pages: _totalPages });
      }
    }).catch(function(e){
      console.error('[PDFViewer] open failed:', e);
      _showError(e.message || String(e));
    });
  }

  // ── Loading / Error ──
  function _showLoading(){
    var host = document.getElementById('pdfViewerHost');
    if(host) host.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;flex:1;' +
      'color:var(--text3);font-size:13px;gap:8px">' +
      '<i class="fa fa-spinner fa-spin"></i> PDF 로딩 중...</div>';
  }

  function _showCloudDownloading(){
    var host = document.getElementById('pdfViewerHost');
    if(host) host.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;flex:1;' +
      'color:var(--text3);font-size:13px;gap:8px;flex-direction:column">' +
      '<i class="fa fa-cloud-arrow-down fa-2x" style="opacity:.5"></i>' +
      '<span><i class="fa fa-spinner fa-spin"></i> 클라우드에서 PDF 다운로드 중...</span></div>';
  }

  function _showError(msg){
    var host = document.getElementById('pdfViewerHost');
    if(host) host.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'flex:1;color:var(--text3);font-size:12px;gap:8px;padding:20px;text-align:center">' +
      '<i class="fa fa-exclamation-triangle" style="font-size:24px;color:#f05050"></i>' +
      '<span>PDF를 열 수 없습니다</span>' +
      '<span style="font-size:11px;opacity:.7">' + msg + '</span></div>';
  }

  // ── Build toolbar + container inside #pdfViewerHost ──
  function _buildViewerUI(){
    var host = document.getElementById('pdfViewerHost');
    if(!host) return;

    host.innerHTML =
      '<div class="pdf-toolbar" id="pdfToolbar">'
      + '<button class="pdf-tool-btn" onclick="PDFViewer.prevPage()"><i class="fa fa-chevron-left"></i></button>'
      + '<span class="pdf-page-info" id="pdfPageInfo">1 / 1</span>'
      + '<button class="pdf-tool-btn" onclick="PDFViewer.nextPage()"><i class="fa fa-chevron-right"></i></button>'
      + '<div class="pdf-tool-sep"></div>'
      + '<button class="pdf-tool-btn" onclick="PDFViewer.zoomOut()"><i class="fa fa-search-minus"></i></button>'
      + '<span class="pdf-zoom-info" id="pdfZoomInfo">100%</span>'
      + '<button class="pdf-tool-btn" onclick="PDFViewer.zoomIn()"><i class="fa fa-search-plus"></i></button>'
      + '<div class="pdf-tool-sep"></div>'
      + '<button class="pdf-tool-btn" id="pdfToolSelect" onclick="PDFTools.setTool(\'select\')" title="선택"><i class="fa fa-mouse-pointer"></i></button>'
      + '<button class="pdf-tool-btn" id="pdfToolHL" onclick="PDFTools.setTool(\'highlight\')" title="하이라이트"><i class="fa fa-highlighter"></i></button>'
      + '<button class="pdf-tool-btn" id="pdfToolDraw" onclick="PDFTools.setTool(\'draw\')" title="그리기"><i class="fa fa-pen-fancy"></i></button>'
      + '<button class="pdf-tool-btn" id="pdfToolText" onclick="PDFTools.setTool(\'text\')" title="텍스트"><i class="fa fa-font"></i></button>'
      + '<button class="pdf-tool-btn" id="pdfToolEraser" onclick="PDFTools.setTool(\'eraser\')" title="지우기"><i class="fa fa-eraser"></i></button>'
      + '<div class="pdf-tool-sep"></div>'
      + '<button class="pdf-tool-btn" onclick="PDFTools.undo()" title="실행 취소"><i class="fa fa-rotate-left"></i></button>'
      + '<button class="pdf-tool-btn" onclick="PDFTools.redo()" title="다시 실행"><i class="fa fa-rotate-right"></i></button>'
      + '</div>'
      + '<div class="pdf-viewport" id="pdfViewerContainer"></div>';

    _container = document.getElementById('pdfViewerContainer');
    _initPanDrag();
  }

  // ── Pan/Drag (scroll by mouse drag when zoomed) ──
  function _initPanDrag(){
    var isDragging = false, startX, startY, scrollL, scrollT;
    _container.addEventListener('pointerdown', function(e){
      if(typeof PDFTools !== 'undefined' && PDFTools.getTool() !== 'select') return;
      if(e.target.closest('.pdf-annot')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      scrollL = _container.scrollLeft; scrollT = _container.scrollTop;
      _container.style.cursor = 'grabbing';
      e.preventDefault();
    });
    _container.addEventListener('pointermove', function(e){
      if(!isDragging) return;
      _container.scrollLeft = scrollL - (e.clientX - startX);
      _container.scrollTop  = scrollT - (e.clientY - startY);
    });
    _container.addEventListener('pointerup', function(){
      isDragging = false; _container.style.cursor = '';
    });
    _container.addEventListener('pointerleave', function(){
      isDragging = false; _container.style.cursor = '';
    });
  }

  // ── Fit scale to container width ──
  function _fitScale(){
    if(!_pdfDoc || !_container) return Promise.resolve();
    return new Promise(function(resolve){
      requestAnimationFrame(function(){
        _pdfDoc.getPage(1).then(function(page){
          var vp = page.getViewport({ scale: 1.0 });
          var w = _container.clientWidth;
          if(!w) w = _container.parentElement ? _container.parentElement.clientWidth : 0;
          if(w < 50) w = 380;
          var s = (w - 20) / vp.width;
          if(s > 0.25 && s < 4.0) _scale = s;
          resolve();
        }).catch(function(){ resolve(); });
      });
    });
  }

  // ── Render visible pages (current ±1) ──
  function _renderVisiblePages(){
    if(!_pdfDoc || !_container) return;

    var pages = [_currentPage];
    if(_currentPage > 1) pages.unshift(_currentPage - 1);
    if(_currentPage < _totalPages) pages.push(_currentPage + 1);

    // Remove out-of-range pages
    _renderedPages.forEach(function(_, num){
      if(pages.indexOf(num) === -1){
        var el = document.getElementById('pdf-page-' + num);
        if(el) el.remove();
        _renderedPages.delete(num);
      }
    });

    pages.forEach(function(num){
      if(!_renderedPages.has(num)) _renderPage(num);
    });

    // Scroll current page into view
    setTimeout(function(){
      var cur = document.getElementById('pdf-page-' + _currentPage);
      if(cur) cur.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function _renderPage(pageNum){
    if(!_pdfDoc || !_container) return;

    _pdfDoc.getPage(pageNum).then(function(page){
      if(!_container) return;

      var vp = page.getViewport({ scale: _scale });
      var dpr = window.devicePixelRatio || 1;

      var wrap = document.createElement('div');
      wrap.className = 'pdf-page-wrap';
      wrap.id = 'pdf-page-' + pageNum;
      wrap.style.width = Math.floor(vp.width) + 'px';
      wrap.style.height = Math.floor(vp.height) + 'px';

      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = Math.floor(vp.width) + 'px';
      canvas.style.height = Math.floor(vp.height) + 'px';

      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var annotLayer = document.createElement('div');
      annotLayer.className = 'pdf-annot-layer';
      annotLayer.dataset.page = pageNum;

      wrap.appendChild(canvas);
      wrap.appendChild(annotLayer);

      // Insert in page order
      var inserted = false;
      var existing = _container.querySelectorAll('.pdf-page-wrap');
      for(var i = 0; i < existing.length; i++){
        var existingNum = parseInt(existing[i].id.replace('pdf-page-', ''));
        if(pageNum < existingNum){
          _container.insertBefore(wrap, existing[i]);
          inserted = true;
          break;
        }
      }
      if(!inserted) _container.appendChild(wrap);

      _renderedPages.set(pageNum, true);

      page.render({ canvasContext: ctx, viewport: vp }).promise.then(function(){
        if(typeof PDFAnnotations !== 'undefined'){
          PDFAnnotations.renderPage(pageNum, annotLayer, vp);
        }
        if(typeof PDFTools !== 'undefined'){
          PDFTools.initPageEvents(annotLayer, pageNum);
        }
      }).catch(function(e){
        console.warn('[PDFViewer] render page ' + pageNum + ' failed:', e);
      });
    }).catch(function(e){
      console.warn('[PDFViewer] getPage ' + pageNum + ' failed:', e);
    });
  }

  function _updatePageInfo(){
    var el = document.getElementById('pdfPageInfo');
    if(el) el.textContent = _currentPage + ' / ' + _totalPages;
    var z = document.getElementById('pdfZoomInfo');
    if(z) z.textContent = Math.round(_scale * 100) + '%';
  }

  // ── Navigation ──
  function goToPage(n){
    if(n < 1 || n > _totalPages) return;
    _currentPage = n;
    _updatePageInfo();
    _renderVisiblePages();
  }
  function prevPage(){ goToPage(_currentPage - 1); }
  function nextPage(){ goToPage(_currentPage + 1); }

  // ── Zoom ──
  function zoomIn(){
    _scale = Math.min(_scale + 0.25, 4.0);
    _rerender();
  }
  function zoomOut(){
    _scale = Math.max(_scale - 0.25, 0.5);
    _rerender();
  }
  function zoom(val){
    _scale = Math.max(0.5, Math.min(4.0, val));
    _rerender();
  }
  function _rerender(){
    _renderedPages.clear();
    if(_container) _container.innerHTML = '';
    _updatePageInfo();
    _renderVisiblePages();
  }

  // ── Close ──
  function close(){
    _pdfDoc = null;
    _currentPdfId = null;
    _renderedPages.clear();
    if(_container) _container.innerHTML = '';
    _container = null;
    _scale = 1.0;
    // Tell panel to close this tab
    if(typeof PDFPanel !== 'undefined'){
      PDFPanel.closeActiveTab();
    }
  }

  function isViewerActive(){ return !!_pdfDoc; }
  function getCurrentPdfId(){ return _currentPdfId; }
  function getCurrentPage(){ return _currentPage; }
  function getTotalPages(){ return _totalPages; }
  function getScale(){ return _scale; }

  // 현재 렌더된 페이지들의 어노테이션 레이어 새로고침
  function rerenderAnnotations(){
    if(!_pdfDoc || !_container) return;
    _renderedPages.forEach(function(_, num){
      var wrap = document.getElementById('pdf-page-' + num);
      if(!wrap) return;
      var layer = wrap.querySelector('.pdf-annot-layer');
      if(!layer) return;
      _pdfDoc.getPage(num).then(function(page){
        var vp = page.getViewport({ scale: _scale });
        if(typeof PDFAnnotations !== 'undefined'){
          PDFAnnotations.renderPage(num, layer, vp);
        }
      });
    });
  }

  return {
    open: open,
    goToPage: goToPage,
    prevPage: prevPage,
    nextPage: nextPage,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    zoom: zoom,
    close: close,
    isViewerActive: isViewerActive,
    getCurrentPdfId: getCurrentPdfId,
    getCurrentPage: getCurrentPage,
    getTotalPages: getTotalPages,
    getScale: getScale,
    rerenderAnnotations: rerenderAnnotations
  };
})();
