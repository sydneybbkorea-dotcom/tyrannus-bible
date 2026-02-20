// read-mode.js — 형광펜 표시/숨김 토글
function toggleHighlight(){
  var hidden = document.body.classList.toggle('hide-hl');
  if(typeof renderViewBar==='function') renderViewBar();
  toast(hidden ? '형광펜 숨김' : '형광펜 표시');
}

// ═══════════════════════════════════════════════════
// BIBLE TAB SYSTEM
// ═══════════════════════════════════════════════════
let _bibleTabs = [];
let _activeTabId = null;
