// pane-manager.js — 3-Pane 레이아웃 매니저 (Obsidian/Antigravity 스타일)
// 성경/PDF/노트 독립 패널: show/hide/toggle/maximize/restore + 상태 persist

var PaneManager = (function () {
  'use strict';

  var PANE_IDS = ['bible', 'pdf', 'notes'];
  var STORAGE_KEY = 'kjb2-pane-state';

  // 기본 상태: 성경만 표시
  var _state = {
    bible: { visible: true, width: null },
    pdf: { visible: false, width: null },
    notes: { visible: false, width: null },
    maximized: null  // 최대화된 패널 ID (null = 없음)
  };

  // ── 초기화 ──
  function init() {
    _restoreState();
    _applyState();
    _syncLegacyClasses();
    _emitChange();
  }

  // ── 패널 표시 ──
  function show(id) {
    if (PANE_IDS.indexOf(id) === -1) return;
    if (_state.maximized && _state.maximized !== id) {
      // 최대화 해제 후 표시
      _state.maximized = null;
    }
    _state[id].visible = true;
    _applyState();
    _syncLegacyClasses();
    _saveState();
    _emitChange();
    // PDF pane 표시 시 라이브러리 트리 렌더링 보장
    if (id === 'pdf' && typeof PDFLibrary !== 'undefined') PDFLibrary.render();
  }

  // ── 패널 숨기기 ──
  function hide(id) {
    if (PANE_IDS.indexOf(id) === -1) return;
    _state[id].visible = false;
    if (_state.maximized === id) _state.maximized = null;
    _applyState();
    _syncLegacyClasses();
    _saveState();
    _emitChange();
  }

  // ── 패널 토글 ──
  function toggle(id) {
    if (PANE_IDS.indexOf(id) === -1) return;
    if (_state[id].visible) hide(id);
    else show(id);
  }

  // ── 패널 최대화 ──
  function maximize(id) {
    if (PANE_IDS.indexOf(id) === -1) return;
    if (!_state[id].visible) show(id);
    _state.maximized = id;
    _applyState();
    _saveState();
    _emitChange();
  }

  // ── 최대화 해제 ──
  function restore() {
    _state.maximized = null;
    _applyState();
    _saveState();
    _emitChange();
  }

  // ── 최대화 토글 ──
  function toggleMaximize(id) {
    if (_state.maximized === id) restore();
    else maximize(id);
  }

  // ── 상태 조회 ──
  function isVisible(id) { return _state[id] && _state[id].visible; }
  function isMaximized(id) { return _state.maximized === id; }
  function getVisiblePanes() {
    return PANE_IDS.filter(function (id) { return _state[id].visible; });
  }

  // ── 너비 저장 (리사이즈 후 호출) ──
  function setWidth(id, w) {
    if (_state[id]) _state[id].width = w;
    _saveState();
  }

  function getWidth(id) {
    return _state[id] ? _state[id].width : null;
  }

  // ── 내부: DOM 반영 ──
  function _applyState() {
    var container = document.getElementById('paneContainer');
    var visibleCount = _getVisibleCount();

    // 컨테이너 가용 폭 계산 (패딩, 간격, 핸들 고려)
    var containerW = container ? container.clientWidth : window.innerWidth;
    var gap = 4; // --pane-gap default
    var padding = gap * 2; // 좌우 padding
    var handleW = 4; // 핸들 폭
    var handleCount = Math.max(0, visibleCount - 1);
    var gapTotal = Math.max(0, visibleCount - 1) * gap;
    var available = containerW - padding - gapTotal - (handleCount * handleW);

    // 저장된 고정 너비 합산 체크 + 비율 축소
    if (visibleCount >= 2 && !_state.maximized) {
      var totalFixed = 0;
      var fixedIds = [];
      PANE_IDS.forEach(function (id) {
        if (_state[id].visible && _state[id].width) {
          totalFixed += _state[id].width;
          fixedIds.push(id);
        }
      });
      // 고정 너비 합산이 가용 폭 초과 시 비율 축소
      if (totalFixed > available && totalFixed > 0) {
        var ratio = available / totalFixed;
        fixedIds.forEach(function (id) {
          _state[id].width = Math.max(200, Math.round(_state[id].width * ratio));
        });
      }
      // 모든 visible 패널에 저장 너비가 있는데 합산 < 가용 폭이면 비율 확대 (빈 공간 방지)
      if (totalFixed > 0 && totalFixed < available && fixedIds.length === visibleCount) {
        var ratioUp = available / totalFixed;
        fixedIds.forEach(function (id) {
          _state[id].width = Math.round(_state[id].width * ratioUp);
        });
      }
    }

    PANE_IDS.forEach(function (id) {
      var pane = document.getElementById('pane-' + id);
      if (!pane) return;

      var vis = _state[id].visible;
      pane.setAttribute('data-visible', vis ? 'true' : 'false');

      // 최대화 상태
      if (_state.maximized === id) {
        pane.setAttribute('data-maximized', 'true');
      } else {
        pane.removeAttribute('data-maximized');
      }

      if (vis && !_state.maximized) {
        // 저장된 너비가 있으면 고정 너비 사용 (2개 이상)
        if (_state[id].width && visibleCount >= 2) {
          // 개별 패널이 가용 폭을 넘지 않도록
          var w = Math.min(_state[id].width, available - (visibleCount - 1) * 200);
          w = Math.max(200, w);
          pane.style.flex = '0 0 ' + w + 'px';
        } else {
          pane.style.flex = '1 1 0%';  // 균등 배분
        }
      } else {
        pane.style.flex = '';
      }
    });

    // 컨테이너 클래스
    if (container) {
      container.classList.toggle('has-maximized', !!_state.maximized);
    }

    // 리사이즈 핸들 갱신
    _updateResizeHandles();
  }

  // ── 기존 코드 호환: 레거시 클래스 동기화 ──
  function _syncLegacyClasses() {
    // PDF 패널 레거시
    var pdfEl = document.getElementById('pdfPanel');
    if (pdfEl) {
      pdfEl.classList.toggle('pdf-panel-hide', !_state.pdf.visible);
    }
    document.body.classList.toggle('pdf-open', _state.pdf.visible);

    // 노트 패널 레거시
    var rpEl = document.getElementById('rightPanel');
    if (rpEl) {
      rpEl.classList.toggle('rp-hide', !_state.notes.visible);
    }
    document.body.classList.toggle('panel-open', _state.notes.visible);

    // 아이콘 레일 active 상태
    var pdfBtn = document.querySelector('.rail-icon[data-rail="pdf"]');
    if (pdfBtn) pdfBtn.classList.toggle('active', _state.pdf.visible);

    var noteBtn = document.querySelector('.rail-icon[data-rail="notes"]');
    if (noteBtn) noteBtn.classList.toggle('active', _state.notes.visible);
  }

  // ── 리사이즈 핸들 동적 생성 (visible 패널 사이에만, DOM 순서 기반) ──
  function _updateResizeHandles() {
    var container = document.getElementById('paneContainer');
    if (!container) return;

    // 기존 핸들 제거
    container.querySelectorAll('.pane-resize-handle').forEach(function (h) { h.remove(); });

    if (_state.maximized) return;

    // DOM 순서 기반으로 visible 패널 수집
    var allPanes = container.querySelectorAll('.pane[data-visible="true"]');
    var visiblePanes = [];
    for (var i = 0; i < allPanes.length; i++) {
      visiblePanes.push(allPanes[i]);
    }

    // 인접한 visible 패널 사이에 핸들 삽입
    for (var j = 0; j < visiblePanes.length - 1; j++) {
      var leftPane = visiblePanes[j];
      var leftId = leftPane.id.replace('pane-', '');
      var rightId = visiblePanes[j + 1].id.replace('pane-', '');
      var handle = document.createElement('div');
      handle.className = 'pane-resize-handle';
      handle.dataset.leftPane = leftId;
      handle.dataset.rightPane = rightId;
      leftPane.after(handle);
    }
  }

  // ── 상태 저장/복원 ──
  function _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (e) { }
  }

  function _restoreState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        PANE_IDS.forEach(function (id) {
          if (saved[id]) {
            _state[id].visible = !!saved[id].visible;
            _state[id].width = saved[id].width || null;
          }
        });
        _state.maximized = saved.maximized || null;
      }
    } catch (e) { }

    // 0개 패널도 허용 (모든 패널 닫기 가능)
  }

  function _getVisibleCount() {
    var c = 0;
    PANE_IDS.forEach(function (id) { if (_state[id].visible) c++; });
    return c;
  }

  function _emitChange() {
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('pane:changed', {
        visible: getVisiblePanes(),
        maximized: _state.maximized
      });
    }
  }

  // ── 브라우저 리사이즈 시 패널 폭 재조정 ──
  var _resizeTimer = null;
  function _onWindowResize() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      _applyState();
      _saveState();
    }, 100);
  }

  // ── DOM Ready ──
  function _onReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        init();
        window.addEventListener('resize', _onWindowResize);
      });
    } else {
      init();
      window.addEventListener('resize', _onWindowResize);
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
    init: init,
    refreshHandles: _updateResizeHandles
  };
})();
