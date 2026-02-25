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
    // PaneManager가 핸들을 동적 생성하므로 별도 가시성 관리 불필요
    // 레거시 핸들만 숨김
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
    // 레이아웃 모드에서 드래그 리사이즈 비활성
    if(typeof LayoutManager !== 'undefined' && LayoutManager.isActive()) return;

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

    // 컨테이너 가용 폭 초과 방지
    var container = document.getElementById('paneContainer');
    if(container){
      var containerW = container.clientWidth;
      var gap = 4;
      var otherPanesW = 0;
      container.querySelectorAll('.pane[data-visible="true"]').forEach(function(p){
        if(p !== dragging.leftPane && p !== dragging.rightPane){
          otherPanesW += p.getBoundingClientRect().width;
        }
      });
      var handles = container.querySelectorAll('.pane-resize-handle').length;
      var maxForPair = containerW - (gap * 2) - (handles * gap) - otherPanesW;
      if(newLeftW + newRightW > maxForPair){
        var scale = maxForPair / (newLeftW + newRightW);
        newLeftW = Math.max(MIN_WIDTH, Math.round(newLeftW * scale));
        newRightW = Math.max(MIN_WIDTH, Math.round(newRightW * scale));
      }
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
