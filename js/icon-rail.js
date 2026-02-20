// icon-rail.js — Slack 스타일 아이콘 레일 클릭 → 확장 패널 토글
var _activeRail = null;
var _spPinned = false;
var _railHidden = false;

function _toggleIconRail(){
  _railHidden = !_railHidden;
  const rail = document.getElementById('iconRail');
  const btn = document.getElementById('railToggleBtn');
  if(rail) rail.classList.toggle('rail-collapsed', _railHidden);
  if(btn) btn.classList.toggle('rail-hidden', _railHidden);
  if(_railHidden && _activeRail && !_spPinned) closeSidePanel();
}

function toggleRail(name){
  if(_activeRail === name && !_spPinned){ closeSidePanel(); return; }
  if(_activeRail === name && _spPinned) return;
  openSidePanel(name);
}

function openSidePanel(name){
  _activeRail = name;
  document.querySelectorAll('.rail-icon').forEach(b=>{
    b.classList.toggle('active', b.dataset.rail===name);
  });
  const sp = document.getElementById('sidePanel');
  if(sp) sp.classList.add('open');
  document.querySelectorAll('.sp-section').forEach(s=>s.classList.remove('active'));
  const sec = document.getElementById('sp-'+name);
  if(sec) sec.classList.add('active');
  _initSection(name);
}

function closeSidePanel(){
  if(_spPinned && _activeRail==='bible') return;
  _activeRail = null;
  document.querySelectorAll('.rail-icon').forEach(b=>b.classList.remove('active'));
  const sp = document.getElementById('sidePanel');
  if(sp) sp.classList.remove('open');
}

// 노트 아이콘: 사이드 카테고리 없이 오른쪽 패널 직접 토글
function toggleNotePanel(){
  const noteBtn = document.querySelector('.rail-icon[data-rail="notes"]');
  if(S.panelOpen==='notes' && !document.getElementById('rightPanel')?.classList.contains('rp-hide')){
    togglePanel('notes');
    if(noteBtn) noteBtn.classList.remove('active');
  } else {
    if(_activeRail && !_spPinned) closeSidePanel();
    openPanel('notes'); switchSub('notes');
    if(noteBtn) noteBtn.classList.add('active');
  }
}

// 사전 아이콘: 오른쪽 패널 사전 탭 직접 토글
function toggleDictPanel(){
  const btn=document.querySelector('.rail-icon[data-rail="dictionary"]');
  if(S.panelOpen==='dictionary'&&!document.getElementById('rightPanel')?.classList.contains('rp-hide')){
    togglePanel('dictionary');
    if(btn) btn.classList.remove('active');
  }else{
    if(_activeRail&&!_spPinned) closeSidePanel();
    openPanel('dictionary'); switchTab('dictionary');
    if(btn) btn.classList.add('active');
  }
}

function _spTogglePin(){
  _spPinned = !_spPinned;
  const btn = document.getElementById('spPinBtn');
  if(btn) btn.classList.toggle('pinned', _spPinned);
}

function _initSection(name){
  if(name==='bible') buildBookList();
  else if(name==='bookmark') renderBookmarks();
  else if(name==='reading'&&typeof renderReadingPlan==='function') renderReadingPlan();
  else if(name==='settings'&&typeof renderSettingsPanel==='function') renderSettingsPanel();
}
