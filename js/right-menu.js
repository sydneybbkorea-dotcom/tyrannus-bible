// right-menu.js — 우상단 Antigravity 스타일 드롭다운 메뉴
var RMenu = (function(){
  'use strict';

  var _isOpen = false;
  var _dropdown = null;
  var _backdrop = null;
  var _trigger = null;

  function init(){
    _dropdown = document.getElementById('rmenuDropdown');
    _backdrop = document.getElementById('rmenuBackdrop');
    _trigger  = document.getElementById('rmenuTrigger');

    if(_backdrop){
      _backdrop.addEventListener('click', close);
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && _isOpen) close();
    });

    // PaneManager 상태 변경 시 토글 상태 갱신
    if(typeof EventBus !== 'undefined'){
      EventBus.on('pane:changed', _updateToggles);
    }
  }

  function toggle(){
    if(_isOpen) close();
    else open();
  }

  function open(){
    _isOpen = true;
    if(_dropdown) _dropdown.classList.add('open');
    if(_backdrop) _backdrop.classList.add('open');
    if(_trigger)  _trigger.classList.add('open');
    _updateToggles();
  }

  function close(){
    _isOpen = false;
    if(_dropdown) _dropdown.classList.remove('open');
    if(_backdrop) _backdrop.classList.remove('open');
    if(_trigger)  _trigger.classList.remove('open');
  }

  // 패널 토글 상태 UI 갱신
  function _updateToggles(){
    if(typeof PaneManager === 'undefined') return;
    var items = document.querySelectorAll('.rmenu-item[data-pane-toggle]');
    items.forEach(function(item){
      var paneId = item.dataset.paneToggle;
      var toggle = item.querySelector('.rmenu-toggle');
      var isVis = PaneManager.isVisible(paneId);
      if(toggle) toggle.classList.toggle('on', isVis);
      item.classList.toggle('active', isVis);
    });
  }

  // 패널 토글 클릭 핸들러
  function togglePane(paneId){
    if(typeof PaneManager !== 'undefined'){
      PaneManager.toggle(paneId);
      _updateToggles();
    }
  }

  // DOM Ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    toggle: toggle,
    open: open,
    close: close,
    togglePane: togglePane
  };
})();
