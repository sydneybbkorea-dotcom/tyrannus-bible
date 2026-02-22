// panel-resize.js — 패널 경계 드래그 리사이즈
(function(){
  'use strict';

  var MIN_PDF   = 250;
  var MIN_RIGHT = 280;
  var DEFAULT_PDF   = 420;
  var DEFAULT_RIGHT = 640;

  var handles = [];       // [{el, leftId, rightId}]
  var dragging = null;    // {handle, startX, startWidth, target, side}

  // ── 핸들 생성 ──
  function createHandle(leftId, rightId){
    var h = document.createElement('div');
    h.className = 'panel-resize-handle';
    h.dataset.left  = leftId;
    h.dataset.right = rightId;
    return { el: h, leftId: leftId, rightId: rightId };
  }

  // ── 초기화 ──
  function init(){
    if(window.innerWidth < 600) return;

    var main = document.getElementById('main');
    if(!main) return;

    // biblePane 뒤 핸들 (bible ↔ pdfPanel 또는 bible ↔ rightPanel)
    var biblePane = document.getElementById('biblePane');
    var pdfPanel  = document.getElementById('pdfPanel');
    var rightPanel = document.getElementById('rightPanel');

    if(biblePane && pdfPanel){
      var h1 = createHandle('biblePane', 'pdfPanel');
      biblePane.after(h1.el);
      handles.push(h1);
    }
    if(pdfPanel && rightPanel){
      var h2 = createHandle('pdfPanel', 'rightPanel');
      pdfPanel.after(h2.el);
      handles.push(h2);
    }

    updateHandleVisibility();
    observePanelChanges();
    bindEvents();
  }

  // ── 핸들 가시성 업데이트 ──
  function updateHandleVisibility(){
    for(var i = 0; i < handles.length; i++){
      var h = handles[i];
      var leftVisible  = isPanelVisible(h.leftId);
      var rightVisible = isPanelVisible(h.rightId);
      h.el.style.display = (leftVisible && rightVisible) ? '' : 'none';
    }
  }

  function isPanelVisible(id){
    var el = document.getElementById(id);
    if(!el) return false;
    if(id === 'biblePane') return true; // 항상 보임
    if(id === 'pdfPanel')  return !el.classList.contains('pdf-panel-hide');
    if(id === 'rightPanel') return !el.classList.contains('rp-hide');
    return el.offsetWidth > 0;
  }

  // ── 패널 변경 관찰 (class 토글 감지) ──
  function observePanelChanges(){
    var targets = ['pdfPanel','rightPanel'];
    var observer = new MutationObserver(function(){
      updateHandleVisibility();
    });
    for(var i = 0; i < targets.length; i++){
      var el = document.getElementById(targets[i]);
      if(el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ── 이벤트 바인딩 ──
  function bindEvents(){
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    // 더블클릭: 기본 너비 복원
    document.addEventListener('dblclick', onDblClick);
  }

  function onMouseDown(e){
    if(e.button !== 0) return;
    var handle = e.target.closest('.panel-resize-handle');
    if(!handle || handle.style.display === 'none') return;

    e.preventDefault();

    var leftId  = handle.dataset.left;
    var rightId = handle.dataset.right;

    // 오른쪽 패널의 현재 너비를 조절 대상으로 삼음
    // biblePane은 flex:1이므로 직접 건드리지 않음
    var target, side;
    if(rightId === 'pdfPanel' || rightId === 'rightPanel'){
      target = document.getElementById(rightId);
      side = 'right';  // 핸들 오른쪽 패널의 너비를 줄이거나 늘림
    } else if(leftId === 'pdfPanel'){
      target = document.getElementById(leftId);
      side = 'left';
    }

    if(!target) return;

    dragging = {
      handle: handle,
      startX: e.clientX,
      startWidth: target.getBoundingClientRect().width,
      target: target,
      targetId: side === 'right' ? rightId : leftId,
      side: side
    };

    document.body.classList.add('resizing');
    handle.classList.add('active');
  }

  function onMouseMove(e){
    if(!dragging) return;
    e.preventDefault();

    var dx = e.clientX - dragging.startX;
    var newWidth;

    if(dragging.side === 'right'){
      // 핸들 오른쪽 패널: 마우스 오른쪽→패널 줄어듦, 왼쪽→늘어남
      newWidth = dragging.startWidth - dx;
    } else {
      // 핸들 왼쪽 패널: 마우스 오른쪽→패널 늘어남, 왼쪽→줄어듦
      newWidth = dragging.startWidth + dx;
    }

    // min-width 제한
    var minW = getMinWidth(dragging.targetId);
    if(newWidth < minW) newWidth = minW;

    // max-width: 전체 main의 60%를 넘지 않도록
    var main = document.getElementById('main');
    if(main){
      var maxW = main.getBoundingClientRect().width * 0.6;
      if(newWidth > maxW) newWidth = maxW;
    }

    dragging.target.style.width = newWidth + 'px';
  }

  function onMouseUp(){
    if(!dragging) return;
    document.body.classList.remove('resizing');
    dragging.handle.classList.remove('active');
    dragging = null;
  }

  function onDblClick(e){
    var handle = e.target.closest('.panel-resize-handle');
    if(!handle || handle.style.display === 'none') return;

    var rightId = handle.dataset.right;
    var leftId  = handle.dataset.left;

    // 오른쪽 패널 기본 너비 복원
    if(rightId === 'pdfPanel'){
      var el = document.getElementById('pdfPanel');
      if(el) el.style.width = '';
    } else if(rightId === 'rightPanel'){
      var el2 = document.getElementById('rightPanel');
      if(el2) el2.style.width = '';
    }
    // 왼쪽이 pdfPanel인 경우
    if(leftId === 'pdfPanel'){
      var el3 = document.getElementById('pdfPanel');
      if(el3) el3.style.width = '';
    }
  }

  function getMinWidth(id){
    if(id === 'pdfPanel')  return MIN_PDF;
    if(id === 'rightPanel') return MIN_RIGHT;
    return 200;
  }

  // ── DOM Ready ──
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 리사이즈 시 모바일이면 핸들 숨김
  window.addEventListener('resize', function(){
    if(window.innerWidth < 600){
      for(var i = 0; i < handles.length; i++){
        handles[i].el.style.display = 'none';
      }
    } else {
      updateHandleVisibility();
    }
  });

})();
