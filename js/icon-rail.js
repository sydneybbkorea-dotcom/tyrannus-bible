// icon-rail.js — Slack 스타일 아이콘 레일 클릭 → 확장 패널 토글
var _activeRail = null;

function toggleRail(name){
  if(_activeRail === name){ closeSidePanel(); return; }
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
    if(_activeRail) closeSidePanel();
    openPanel('notes'); switchSub('notes');
    if(noteBtn) noteBtn.classList.add('active');
  }
}

function _initSection(name){
  if(name==='bible') buildBookList();
  else if(name==='search') _focusSideSearch();
  else if(name==='bookmark') renderBookmarks();
  else if(name==='original'&&typeof renderAdvSearch==='function') renderAdvSearch();
  else if(name==='reading'&&typeof renderReadingPlan==='function') renderReadingPlan();
}

function _focusSideSearch(){
  setTimeout(()=>document.getElementById('spSearchInput')?.focus(), 100);
}
