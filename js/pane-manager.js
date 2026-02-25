// pane-manager.js — 3-Pane 레이아웃 매니저 (Obsidian/Antigravity 스타일)
// 성경/PDF/노트 독립 패널: show/hide/toggle/maximize/restore + 상태 persist

var PaneManager = (function(){
  'use strict';

  var PANE_IDS = ['bible', 'pdf', 'notes'];
  var STORAGE_KEY = 'kjb2-pane-state';

  // 기본 상태: 성경만 표시
  var _state = {
    bible: { visible: true, width: null },
    pdf:   { visible: false, width: null },
    notes: { visible: false, width: null },
    maximized: null  // 최대화된 패널 ID (null = 없음)
  };

  // ── 초기화 ──
  function init(){
    _restoreState();
    _applyState();
    _syncLegacyClasses();
    _emitChange();
  }

  // ── 패널 표시 ──
  function show(id){
    if(PANE_IDS.indexOf(id) === -1) return;
    if(_state.maximized && _state.maximized !== id){
      // 최대화 해제 후 표시
      _state.maximized = null;
    }
    _state[id].visible = true;
    _applyState();
    _syncLegacyClasses();
    _saveState();
    _emitChange();
  }

  // ── 패널 숨기기 ──
  function hide(id){
    if(PANE_IDS.indexOf(id) === -1) return;
    // 최소 1개 패널은 유지
    var visibleCount = _getVisibleCount();
    if(visibleCount <= 1 && _state[id].visible) return;

    _state[id].visible = false;
    if(_state.maximized === id) _state.maximized = null;
    _applyState();
    _syncLegacyClasses();
    _saveState();
    _emitChange();
  }

  // ── 패널 토글 ──
  function toggle(id){
    if(PANE_IDS.indexOf(id) === -1) return;
    if(_state[id].visible) hide(id);
    else show(id);
  }

  // ── 패널 최대화 ──
  function maximize(id){
    if(PANE_IDS.indexOf(id) === -1) return;
    if(!_state[id].visible) show(id);
    _state.maximized = id;
    _applyState();
    _saveState();
    _emitChange();
  }

  // ── 최대화 해제 ──
  function restore(){
    _state.maximized = null;
    _applyState();
    _saveState();
    _emitChange();
  }

  // ── 최대화 토글 ──
  function toggleMaximize(id){
    if(_state.maximized === id) restore();
    else maximize(id);
  }

  // ── 상태 조회 ──
  function isVisible(id){ return _state[id] && _state[id].visible; }
  function isMaximized(id){ return _state.maximized === id; }
  function getVisiblePanes(){
    return PANE_IDS.filter(function(id){ return _state[id].visible; });
  }

  // ── 너비 저장 (리사이즈 후 호출) ──
  function setWidth(id, w){
    if(_state[id]) _state[id].width = w;
    _saveState();
  }

  function getWidth(id){
    return _state[id] ? _state[id].width : null;
  }

  // ── 내부: DOM 반영 ──
  function _applyState(){
    var container = document.getElementById('paneContainer');

    PANE_IDS.forEach(function(id){
      var pane = document.getElementById('pane-' + id);
      if(!pane) return;

      var vis = _state[id].visible;
      pane.setAttribute('data-visible', vis ? 'true' : 'false');

      // 최대화 상태
      if(_state.maximized === id){
        pane.setAttribute('data-maximized', 'true');
      } else {
        pane.removeAttribute('data-maximized');
      }

      // 저장된 너비 복원 (최대화 아닐 때만)
      if(vis && !_state.maximized && _state[id].width){
        pane.style.flex = '0 0 ' + _state[id].width + 'px';
      } else if(vis && !_state.maximized) {
        pane.style.flex = '';  // CSS 기본값 (flex:1)
      }
    });

    // 컨테이너 클래스
    if(container){
      container.classList.toggle('has-maximized', !!_state.maximized);
    }

    // 리사이즈 핸들 갱신
    _updateResizeHandles();
  }

  // ── 기존 코드 호환: 레거시 클래스 동기화 ──
  function _syncLegacyClasses(){
    // PDF 패널 레거시
    var pdfEl = document.getElementById('pdfPanel');
    if(pdfEl){
      pdfEl.classList.toggle('pdf-panel-hide', !_state.pdf.visible);
    }
    document.body.classList.toggle('pdf-open', _state.pdf.visible);

    // 노트 패널 레거시
    var rpEl = document.getElementById('rightPanel');
    if(rpEl){
      rpEl.classList.toggle('rp-hide', !_state.notes.visible);
    }
    document.body.classList.toggle('panel-open', _state.notes.visible);

    // 아이콘 레일 active 상태
    var pdfBtn = document.querySelector('.rail-icon[data-rail="pdf"]');
    if(pdfBtn) pdfBtn.classList.toggle('active', _state.pdf.visible);

    var noteBtn = document.querySelector('.rail-icon[data-rail="notes"]');
    if(noteBtn) noteBtn.classList.toggle('active', _state.notes.visible);
  }

  // ── 리사이즈 핸들 가시성 업데이트 ──
  function _updateResizeHandles(){
    var handles = document.querySelectorAll('.pane-resize-handle');
    handles.forEach(function(h){
      var leftId = h.dataset.leftPane;
      var rightId = h.dataset.rightPane;
      var leftVis = _state[leftId] && _state[leftId].visible;
      var rightVis = _state[rightId] && _state[rightId].visible;
      h.style.display = (leftVis && rightVis && !_state.maximized) ? '' : 'none';
    });
  }

  // ── 상태 저장/복원 ──
  function _saveState(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch(e){}
  }

  function _restoreState(){
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved){
        PANE_IDS.forEach(function(id){
          if(saved[id]){
            _state[id].visible = !!saved[id].visible;
            _state[id].width = saved[id].width || null;
          }
        });
        _state.maximized = saved.maximized || null;
      }
    } catch(e){}

    // 최소 1개 패널 보장
    if(_getVisibleCount() === 0) _state.bible.visible = true;
  }

  function _getVisibleCount(){
    var c = 0;
    PANE_IDS.forEach(function(id){ if(_state[id].visible) c++; });
    return c;
  }

  function _emitChange(){
    if(typeof EventBus !== 'undefined'){
      EventBus.emit('pane:changed', {
        visible: getVisiblePanes(),
        maximized: _state.maximized
      });
    }
  }

  // ── DOM Ready ──
  function _onReady(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  _onReady();

  return {
    show: show,
    hide: hide,
    toggle: toggle,
    maximize: maximize,
    restore: restore,
    toggleMaximize: toggleMaximize,
    isVisible: isVisible,
    isMaximized: isMaximized,
    getVisiblePanes: getVisiblePanes,
    setWidth: setWidth,
    getWidth: getWidth,
    init: init
  };
})();
