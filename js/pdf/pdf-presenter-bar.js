// pdf-presenter-bar.js — 프리젠터 플로팅 툴바 (IIFE → PDFPresenterBar)
// 발표자 모드에서만 표시, 드래그 가능한 세로 플로팅 툴바

var PDFPresenterBar = (function(){
  var _el = null;
  var _visible = false;
  var _activeTool = 'pen';
  var _activeColor = '#EF4444';
  var _whiteboardPages = {};   // 페이지별 화이트보드 상태
  var _laserActive = false;
  var _laserEl = null;         // 발표자 로컬 레이저 커서
  var _shapeFlyoutEl = null;
  var POS_KEY = 'kjb2-presenter-bar-pos';

  var COLORS = [
    { hex: '#EF4444', name: '빨강' },
    { hex: '#3B82F6', name: '파랑' },
    { hex: '#10B981', name: '초록' },
    { hex: '#FACC15', name: '노랑' },
    { hex: '#FFFFFF', name: '흰색' }
  ];

  // ═══════════════════════════════════════
  //  공개 API
  // ═══════════════════════════════════════
  function show(){
    if(_visible) return;
    _visible = true;
    _buildDOM();
    _loadPos();
    // 포인터 이벤트 차단
    _el.addEventListener('pointerdown', function(e){
      if(!e.target.closest('.pdf-pb-handle')) e.stopPropagation();
    });
    document.body.appendChild(_el);
  }

  function hide(){
    _visible = false;
    _disableLaser();
    _hideShapeFlyout();
    // 화이트보드 정리
    Object.keys(_whiteboardPages).forEach(function(pn){
      _removeWhiteboard(parseInt(pn));
    });
    _whiteboardPages = {};
    if(_el && _el.parentElement) _el.remove();
    _el = null;
  }

  function isVisible(){ return _visible; }

  // ═══════════════════════════════════════
  //  DOM 생성
  // ═══════════════════════════════════════
  function _buildDOM(){
    if(_el) _el.remove();
    _el = document.createElement('div');
    _el.className = 'pdf-presenter-bar';

    // 드래그 핸들
    var handle = document.createElement('div');
    handle.className = 'pdf-pb-handle';
    handle.innerHTML = '<span class="pdf-pb-handle-grip"></span>';
    _el.appendChild(handle);

    // ── 도구 버튼들 ──
    _addBtn('pen', 'fa-pen', '펜', _onPen);
    _addBtn('highlighter', 'fa-highlighter', '형광펜', _onHighlighter);
    _addBtn('eraser', 'fa-eraser', '지우개', _onEraser);
    _addBtn('shape', 'fa-shapes', '도형', _onShapes);
    _addBtn('text', 'fa-font', '텍스트', _onText);
    _addBtn('laser', 'fa-bullseye', '레이저', _onLaser);

    _addDivider();

    // ── 실행 취소/다시 실행/삭제 ──
    _addBtn('undo', 'fa-rotate-left', '실행 취소', _onUndo);
    _addBtn('redo', 'fa-rotate-right', '다시 실행', _onRedo);
    _addBtn('clearPage', 'fa-trash-can', '페이지 삭제', _onClearPage);

    _addDivider();

    // ── 화이트보드/페이지/전체화면 ──
    _addBtn('whiteboard', 'fa-chalkboard', '화이트보드', _onWhiteboard);
    _addBtn('prevPage', 'fa-chevron-left', '이전 페이지', _onPrevPage);
    _addBtn('nextPage', 'fa-chevron-right', '다음 페이지', _onNextPage);
    _addBtn('fullscreen', 'fa-expand', '전체 화면', _onFullscreen);

    _addDivider();

    // ── 색상 선택 ──
    var colorGrid = document.createElement('div');
    colorGrid.className = 'pdf-pb-colors';
    COLORS.forEach(function(c){
      var dot = document.createElement('button');
      dot.className = 'pdf-pb-color-dot' + (c.hex === _activeColor ? ' active' : '');
      dot.style.background = c.hex;
      dot.dataset.color = c.hex;
      dot.title = c.name;
      dot.addEventListener('click', function(e){
        e.stopPropagation();
        _onColorSelect(c.hex);
      });
      colorGrid.appendChild(dot);
    });
    _el.appendChild(colorGrid);

    // 드래그 초기화
    _initDrag(handle);

    // 기본 도구 활성화
    _setActiveTool('pen');
  }

  function _addBtn(id, iconClass, title, handler){
    var btn = document.createElement('button');
    btn.className = 'pdf-pb-btn';
    btn.dataset.tool = id;
    btn.title = title;
    btn.innerHTML = '<i class="fa ' + iconClass + '"></i>';
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      handler();
    });
    _el.appendChild(btn);
  }

  function _addDivider(){
    var d = document.createElement('div');
    d.className = 'pdf-pb-divider';
    _el.appendChild(d);
  }

  function _setActiveTool(toolId){
    _activeTool = toolId;
    if(!_el) return;
    _el.querySelectorAll('.pdf-pb-btn').forEach(function(b){
      // undo, redo, clearPage, prevPage, nextPage, fullscreen, whiteboard 는 토글 안함
      var skip = ['undo','redo','clearPage','prevPage','nextPage','fullscreen'];
      if(skip.indexOf(b.dataset.tool) >= 0) return;
      // whiteboard는 별도 토글
      if(b.dataset.tool === 'whiteboard'){
        var curPage = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
        b.classList.toggle('active', !!_whiteboardPages[curPage]);
        return;
      }
      b.classList.toggle('active', b.dataset.tool === toolId);
    });
  }

  // ═══════════════════════════════════════
  //  도구 액션
  // ═══════════════════════════════════════
  function _onPen(){
    _disableLaser();
    _hideShapeFlyout();
    if(typeof PDFTools !== 'undefined'){
      PDFTools.setTool('draw');
      if(PDFTools.setPenType) PDFTools.setPenType('ballpen');
    }
    _setActiveTool('pen');
  }

  function _onHighlighter(){
    _disableLaser();
    _hideShapeFlyout();
    if(typeof PDFTools !== 'undefined'){
      PDFTools.setTool('draw');
      if(PDFTools.setPenType) PDFTools.setPenType('highlighter');
    }
    _setActiveTool('highlighter');
  }

  function _onEraser(){
    _disableLaser();
    _hideShapeFlyout();
    if(typeof PDFTools !== 'undefined') PDFTools.setTool('eraser');
    _setActiveTool('eraser');
  }

  function _onShapes(){
    _disableLaser();
    if(_shapeFlyoutEl){
      _hideShapeFlyout();
      return;
    }
    _showShapeFlyout();
    _setActiveTool('shape');
  }

  function _onText(){
    _disableLaser();
    _hideShapeFlyout();
    if(typeof PDFTools !== 'undefined') PDFTools.setTool('text');
    _setActiveTool('text');
  }

  function _onLaser(){
    _hideShapeFlyout();
    if(_laserActive){
      _disableLaser();
      _onPen(); // 펜으로 복귀
    } else {
      _enableLaser();
      _setActiveTool('laser');
      // select 모드로 전환 (드로잉 방지)
      if(typeof PDFTools !== 'undefined') PDFTools.setTool('select');
    }
  }

  function _onUndo(){
    if(typeof PDFTools !== 'undefined') PDFTools.undo();
  }

  function _onRedo(){
    if(typeof PDFTools !== 'undefined') PDFTools.redo();
  }

  function _onClearPage(){
    if(!confirm('현재 페이지의 모든 어노테이션을 삭제하시겠습니까?')) return;
    var pdfId = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : null;
    var pageNum = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
    if(!pdfId) return;
    if(typeof PDFAnnotations !== 'undefined' && PDFAnnotations.clearPage){
      PDFAnnotations.clearPage(pdfId, pageNum);
    }
    // 라이브 동기화: 스트로크 삭제
    if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
      var code = PDFLive.getSessionCode();
      if(code && typeof _liveClearStrokes === 'function') _liveClearStrokes(code, pageNum);
    }
  }

  function _onWhiteboard(){
    var pageNum = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
    if(_whiteboardPages[pageNum]){
      _removeWhiteboard(pageNum);
      delete _whiteboardPages[pageNum];
    } else {
      _addWhiteboard(pageNum);
      _whiteboardPages[pageNum] = true;
    }
    _setActiveTool(_activeTool); // whiteboard 버튼 상태 갱신

    // 라이브 동기화
    if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
      var code = PDFLive.getSessionCode();
      if(code && typeof _liveUpdateWhiteboard === 'function'){
        _liveUpdateWhiteboard(code, pageNum, !!_whiteboardPages[pageNum]);
      }
    }
  }

  function _onPrevPage(){
    if(typeof PDFViewer !== 'undefined') PDFViewer.prevPage();
  }

  function _onNextPage(){
    if(typeof PDFViewer !== 'undefined') PDFViewer.nextPage();
  }

  function _onFullscreen(){
    if(document.fullscreenElement){
      document.exitFullscreen().catch(function(){});
    } else {
      var target = document.getElementById('pdfViewerHost') || document.getElementById('pdfViewerView') || document.documentElement;
      target.requestFullscreen().catch(function(){});
    }
  }

  function _onColorSelect(hex){
    _activeColor = hex;
    if(typeof PDFTools !== 'undefined') PDFTools.setColor(hex);
    // UI 업데이트
    if(!_el) return;
    _el.querySelectorAll('.pdf-pb-color-dot').forEach(function(d){
      d.classList.toggle('active', d.dataset.color === hex);
    });
  }

  // ═══════════════════════════════════════
  //  화이트보드
  // ═══════════════════════════════════════
  function _addWhiteboard(pageNum){
    var wrap = document.getElementById('pdf-page-' + pageNum);
    if(!wrap) return;
    if(wrap.querySelector('.pdf-whiteboard-overlay')) return;
    var overlay = document.createElement('div');
    overlay.className = 'pdf-whiteboard-overlay';
    // 텍스트 레이어 뒤, 어노테이션 레이어 앞에 삽입
    var annotLayer = wrap.querySelector('.pdf-annot-layer');
    if(annotLayer){
      wrap.insertBefore(overlay, annotLayer);
    } else {
      wrap.appendChild(overlay);
    }
  }

  function _removeWhiteboard(pageNum){
    var wrap = document.getElementById('pdf-page-' + pageNum);
    if(!wrap) return;
    var overlay = wrap.querySelector('.pdf-whiteboard-overlay');
    if(overlay) overlay.remove();
  }

  // 시청자용: 외부에서 화이트보드 상태 설정
  function setWhiteboard(pageNum, isOn){
    if(isOn){
      _addWhiteboard(pageNum);
      _whiteboardPages[pageNum] = true;
    } else {
      _removeWhiteboard(pageNum);
      delete _whiteboardPages[pageNum];
    }
  }

  // ═══════════════════════════════════════
  //  레이저 포인터 (발표자 로컬)
  // ═══════════════════════════════════════
  function _enableLaser(){
    if(_laserActive) return;
    _laserActive = true;

    _laserEl = document.createElement('div');
    _laserEl.className = 'pdf-presenter-laser';
    _laserEl.id = 'pdfPresenterLaser';
    _laserEl.style.display = 'none';

    var host = document.getElementById('pdfViewerHost');
    if(host) host.appendChild(_laserEl);

    // pointermove 리스너
    document.addEventListener('pointermove', _onLaserMove);
  }

  function _disableLaser(){
    if(!_laserActive) return;
    _laserActive = false;
    document.removeEventListener('pointermove', _onLaserMove);
    if(_laserEl && _laserEl.parentElement) _laserEl.remove();
    _laserEl = null;

    // 포인터 해제
    if(typeof PDFLive !== 'undefined' && PDFLive.isPresenting()){
      var code = PDFLive.getSessionCode();
      if(code && typeof _liveClearPointer === 'function') _liveClearPointer(code);
    }
  }

  function _onLaserMove(e){
    if(!_laserActive || !_laserEl) return;

    // PDF 뷰어 호스트 내부인지 확인
    var host = document.getElementById('pdfViewerHost');
    if(!host) return;

    var hostRect = host.getBoundingClientRect();
    if(e.clientX < hostRect.left || e.clientX > hostRect.right ||
       e.clientY < hostRect.top || e.clientY > hostRect.bottom){
      _laserEl.style.display = 'none';
      return;
    }

    // 로컬 빨간 점 위치
    _laserEl.style.display = '';
    _laserEl.style.left = (e.clientX - hostRect.left) + 'px';
    _laserEl.style.top = (e.clientY - hostRect.top) + 'px';

    // 현재 페이지의 pdf-page 래퍼 찾기
    var pageNum = typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPage() : 1;
    var wrap = document.getElementById('pdf-page-' + pageNum);
    if(!wrap) return;

    var wrapRect = wrap.getBoundingClientRect();
    var scale = typeof PDFViewer !== 'undefined' ? PDFViewer.getScale() || 1 : 1;
    var x = (e.clientX - wrapRect.left) / scale;
    var y = (e.clientY - wrapRect.top) / scale;

    // 라이브 전송 (PDFLive.onPointerMove는 이미 300ms 쓰로틀)
    if(typeof PDFLive !== 'undefined') PDFLive.onPointerMove(pageNum, x, y);
  }

  // ═══════════════════════════════════════
  //  도형 플라이아웃
  // ═══════════════════════════════════════
  function _showShapeFlyout(){
    _hideShapeFlyout();

    var shapeBtn = _el ? _el.querySelector('[data-tool="shape"]') : null;
    if(!shapeBtn) return;

    _shapeFlyoutEl = document.createElement('div');
    _shapeFlyoutEl.className = 'pdf-pb-shape-flyout';

    var shapes = [
      { type: 'line',   icon: 'fa-minus',         label: '선' },
      { type: 'arrow',  icon: 'fa-arrow-right',   label: '화살표' },
      { type: 'rect',   icon: 'fa-square',         label: '사각형' },
      { type: 'circle', icon: 'fa-circle',         label: '원' }
    ];

    shapes.forEach(function(s){
      var btn = document.createElement('button');
      btn.className = 'pdf-pb-btn';
      btn.title = s.label;
      btn.innerHTML = '<i class="fa ' + s.icon + '"></i>';
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        _selectShape(s.type);
      });
      _shapeFlyoutEl.appendChild(btn);
    });

    // 이벤트 전파 차단
    _shapeFlyoutEl.addEventListener('pointerdown', function(e){ e.stopPropagation(); });

    shapeBtn.style.position = 'relative';
    shapeBtn.appendChild(_shapeFlyoutEl);
  }

  function _hideShapeFlyout(){
    if(_shapeFlyoutEl && _shapeFlyoutEl.parentElement) _shapeFlyoutEl.remove();
    _shapeFlyoutEl = null;
  }

  function _selectShape(shapeType){
    _hideShapeFlyout();
    if(typeof PDFTools !== 'undefined'){
      PDFTools.setTool('shape');
      if(PDFTools.setShapeType) PDFTools.setShapeType(shapeType);
    }
    _setActiveTool('shape');
  }

  // ═══════════════════════════════════════
  //  드래그
  // ═══════════════════════════════════════
  function _initDrag(handle){
    var drag = { active: false, sx: 0, sy: 0, ox: 0, oy: 0 };

    handle.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      e.preventDefault();
      drag.active = true;
      drag.sx = e.clientX;
      drag.sy = e.clientY;
      drag.ox = parseInt(_el.style.left) || 0;
      drag.oy = parseInt(_el.style.top) || 0;
      handle.style.cursor = 'grabbing';
      try { handle.setPointerCapture(e.pointerId); } catch(err){}
    });

    handle.addEventListener('pointermove', function(e){
      if(!drag.active) return;
      var dx = e.clientX - drag.sx;
      var dy = e.clientY - drag.sy;
      _el.style.left = (drag.ox + dx) + 'px';
      _el.style.top = (drag.oy + dy) + 'px';
    });

    handle.addEventListener('pointerup', function(e){
      if(!drag.active) return;
      drag.active = false;
      handle.style.cursor = '';
      try { handle.releasePointerCapture(e.pointerId); } catch(err){}
      _savePos();
      // 화면 밖 보정
      _clampToViewport();
    });
  }

  function _savePos(){
    if(!_el) return;
    var pos = { left: parseInt(_el.style.left), top: parseInt(_el.style.top) };
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch(e){}
  }

  function _loadPos(){
    if(!_el) return;
    try {
      var saved = localStorage.getItem(POS_KEY);
      if(saved){
        var pos = JSON.parse(saved);
        _el.style.left = pos.left + 'px';
        _el.style.top = pos.top + 'px';
      } else {
        // 기본: 오른쪽 가장자리, 세로 중앙
        _el.style.left = (window.innerWidth - 62) + 'px';
        _el.style.top = Math.max(60, (window.innerHeight - 500) / 2) + 'px';
      }
    } catch(e){
      _el.style.left = (window.innerWidth - 62) + 'px';
      _el.style.top = '100px';
    }
    // 화면 밖 보정
    requestAnimationFrame(_clampToViewport);
  }

  function _clampToViewport(){
    if(!_el) return;
    var rect = _el.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    if(rect.right > vw - 4) _el.style.left = Math.max(4, vw - rect.width - 4) + 'px';
    if(rect.bottom > vh - 4) _el.style.top = Math.max(4, vh - rect.height - 4) + 'px';
    if(rect.left < 4) _el.style.left = '4px';
    if(rect.top < 4) _el.style.top = '4px';
  }

  // ═══════════════════════════════════════
  //  공개 인터페이스
  // ═══════════════════════════════════════
  return {
    show: show,
    hide: hide,
    isVisible: isVisible,
    setWhiteboard: setWhiteboard
  };
})();
