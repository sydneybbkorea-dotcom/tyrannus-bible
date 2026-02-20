// read-mode.js — 형광펜 표시/숨김 토글
function toggleHighlight(){
  var hidden = document.body.classList.toggle('hide-hl');
  if(typeof renderViewBar==='function') renderViewBar();
  toast(hidden ? t('hl.hide') : t('hl.show'));
}

// ═══════════════════════════════════════════════════
// BIBLE TAB SYSTEM
// ═══════════════════════════════════════════════════
let _bibleTabs = [];
let _activeTabId = null;
