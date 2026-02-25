// panel-resize.js — 3-Pane 패널 경계 드래그 리사이즈 (PaneManager 연동)
(function(){
  'use strict';

  var MIN_WIDTH = 240;
  var dragging = null;

  function init(){
    if(window.innerWidth < 600) return;
    bindEvents();
    // PaneManager 상태 변경 시 핸들 가시성 갱신
    if(typeof EventBus !== 'undefined'){
      EventBus.on('pane:changed', updateHandleVisibility);
    }
    updateHandleVisibility();
  }

  function updateHandleVisibility(){
    var handles = document.querySelectorAll('.pane-resize-handle');
    handles.forEach(function(h){
      var leftId = h.dataset.leftPane;
      var rightId = h.dataset.rightPane;
      var leftVis = typeof PaneManager !== 'undefined' && PaneManager.isVisible(leftId);
      var rightVis = typeof PaneManager !== 'undefined' && PaneManager.isVisible(rightId);
      var noMax = typeof PaneManager !== 'undefined' && !PaneManager.isMaximized(leftId) && !PaneManager.isMaximized(rightId);
      h.style.display = (leftVis && rightVis && noMax) ? '' : 'none';
    });

    // 레거시 핸들도 숨김 (이전 버전 호환)
    var legacyHandles = document.querySelectorAll('.panel-resize-handle');
    legacyHandles.forEach(function(h){ h.style.display = 'none'; });
  }

  function bindEvents(){
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    // 터치 지원
    document.addEventListener('touchstart', onTouchStart, {passive: false});
    document.addEventListener('touchmove', onTouchMove, {passive: false});
    document.addEventListener('touchend', onTouchEnd);
    // 더블클릭: 균등 분배 복원
    document.addEventListener('dblclick', onDblClick);
  }

  function onMouseDown(e){
    if(e.button !== 0) return;
    var handle = e.target.closest('.pane-resize-handle');
    if(!handle || handle.style.display === 'none') return;
    e.preventDefault();
    startDrag(handle, e.clientX);
  }

  function onTouchStart(e){
    var handle = e.target.closest('.pane-resize-handle');
    if(!handle || handle.style.display === 'none') return;
    if(e.touches.length !== 1) return;
    e.preventDefault();
    startDrag(handle, e.touches[0].clientX);
  }

  function startDrag(handle, startX){
    var leftId = handle.dataset.leftPane;
    var rightId = handle.dataset.rightPane;
    var leftPane = document.getElementById('pane-' + leftId);
    var rightPane = document.getElementById('pane-' + rightId);
    if(!leftPane || !rightPane) return;

    dragging = {
      handle: handle,
      startX: startX,
      leftPane: leftPane,
      rightPane: rightPane,
      leftId: leftId,
      rightId: rightId,
      leftStartW: leftPane.getBoundingClientRect().width,
      rightStartW: rightPane.getBoundingClientRect().width
    };

    document.body.classList.add('pane-resizing');
    handle.classList.add('active');
  }

  function onMouseMove(e){
    if(!dragging) return;
    e.preventDefault();
    doDrag(e.clientX);
  }

  function onTouchMove(e){
    if(!dragging) return;
    if(e.touches.length !== 1) return;
    e.preventDefault();
    doDrag(e.touches[0].clientX);
  }

  function doDrag(clientX){
    var dx = clientX - dragging.startX;
    var newLeftW = dragging.leftStartW + dx;
    var newRightW = dragging.rightStartW - dx;

    // 최소 너비 제한
    if(newLeftW < MIN_WIDTH){
      newLeftW = MIN_WIDTH;
      newRightW = dragging.leftStartW + dragging.rightStartW - MIN_WIDTH;
    }
    if(newRightW < MIN_WIDTH){
      newRightW = MIN_WIDTH;
      newLeftW = dragging.leftStartW + dragging.rightStartW - MIN_WIDTH;
    }

    dragging.leftPane.style.flex = '0 0 ' + newLeftW + 'px';
    dragging.rightPane.style.flex = '0 0 ' + newRightW + 'px';
  }

  function onMouseUp(){
    finishDrag();
  }

  function onTouchEnd(){
    finishDrag();
  }

  function finishDrag(){
    if(!dragging) return;
    document.body.classList.remove('pane-resizing');
    dragging.handle.classList.remove('active');

    // PaneManager에 너비 저장
    if(typeof PaneManager !== 'undefined'){
      PaneManager.setWidth(dragging.leftId, dragging.leftPane.getBoundingClientRect().width);
      PaneManager.setWidth(dragging.rightId, dragging.rightPane.getBoundingClientRect().width);
    }

    dragging = null;
  }

  function onDblClick(e){
    var handle = e.target.closest('.pane-resize-handle');
    if(!handle || handle.style.display === 'none') return;

    // 균등 분배 복원
    var leftId = handle.dataset.leftPane;
    var rightId = handle.dataset.rightPane;
    var leftPane = document.getElementById('pane-' + leftId);
    var rightPane = document.getElementById('pane-' + rightId);
    if(leftPane) leftPane.style.flex = '';
    if(rightPane) rightPane.style.flex = '';

    if(typeof PaneManager !== 'undefined'){
      PaneManager.setWidth(leftId, null);
      PaneManager.setWidth(rightId, null);
    }
  }

  // DOM Ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 리사이즈 시 모바일이면 핸들 숨김
  window.addEventListener('resize', function(){
    if(window.innerWidth < 600){
      var handles = document.querySelectorAll('.pane-resize-handle');
      handles.forEach(function(h){ h.style.display = 'none'; });
    } else {
      updateHandleVisibility();
    }
  });
})();
