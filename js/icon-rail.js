// icon-rail.js — 아이콘 레일: 패널 토글 + 사이드패널 섹션 토글 (PaneManager 연동)
var _activeRail = null;
var _spPinned = false;
var _railHidden = false;

function _toggleIconRail(){
  _railHidden = !_railHidden;
  var rail = document.getElementById('iconRail');
  var btn = document.getElementById('railToggleBtn');
  if(rail) rail.classList.toggle('rail-collapsed', _railHidden);
  if(btn) btn.classList.toggle('active', !_railHidden);
  if(_railHidden && _activeRail && !_spPinned) closeSidePanel();
}

function toggleRail(name){
  if(_activeRail === name && !_spPinned){ closeSidePanel(); return; }
  if(_activeRail === name && _spPinned) return;
  openSidePanel(name);
}

function _closeTypingIfOpen(){
  var tpEl = document.getElementById('typingOverlay');
  if(tpEl && tpEl.style.display !== 'none' && typeof toggleTypingPanel==='function') toggleTypingPanel();
}

function openSidePanel(name){
  _closeTypingIfOpen();
  _activeRail = name;
  // 섹션 아이콘 활성 상태 (패널 토글 아이콘 제외)
  document.querySelectorAll('.rail-icon:not(.rail-pane-toggle)').forEach(function(b){
    b.classList.toggle('active', b.dataset.rail===name);
  });
  const sp = document.getElementById('sidePanel');
  if(sp) sp.classList.add('open');
  document.querySelectorAll('.sp-section').forEach(function(s){ s.classList.remove('active'); });
  const sec = document.getElementById('sp-'+name);
  if(sec) sec.classList.add('active');
  _initSection(name);
  _updateBibleBars();
}

function closeSidePanel(){
  if(_spPinned && _activeRail==='bible') return;
  _activeRail = null;
  document.querySelectorAll('.rail-icon:not(.rail-pane-toggle)').forEach(function(b){
    b.classList.remove('active');
  });
  const sp = document.getElementById('sidePanel');
  if(sp) sp.classList.remove('open');
  _updateBibleBars();
}

// Show/hide bible tab & view bars depending on active section
function _updateBibleBars(){
  var tabBar = document.getElementById('bibleTabBar');
  var viewBar = document.getElementById('bibleViewBar');
  var hymnsActive = _activeRail === 'hymns';
  var hymOvl = document.getElementById('hymnsOverlay');
  var overlayOpen = hymOvl && hymOvl.style.display !== 'none';
  var tpEl = document.getElementById('typingOverlay');
  var typingOpen = tpEl && tpEl.style.display !== 'none';
  var hide = hymnsActive || overlayOpen || typingOpen;
  if(tabBar) tabBar.style.display = hide ? 'none' : '';
  if(viewBar) viewBar.style.display = hide ? 'none' : '';
}

// 노트 아이콘: PaneManager 통해 노트 pane 토글
function toggleNotePanel(){
  _closeTypingIfOpen();
  if(typeof PaneManager !== 'undefined'){
    PaneManager.toggle('notes');
    // 노트가 표시되면 기본 탭 활성화
    if(PaneManager.isVisible('notes')){
      openPanel('notes'); switchSub('notes');
      if(typeof NotePanel!=='undefined' && !NotePanel.isInEditor()){
        if(typeof renderFolderTree==='function') renderFolderTree();
      }
    }
  } else {
    // PaneManager 미로드 시 레거시 동작
    const noteBtn = document.querySelector('.rail-icon[data-rail="notes"]');
    if(S.panelOpen==='notes' && !document.getElementById('rightPanel')?.classList.contains('rp-hide')){
      togglePanel('notes');
      if(noteBtn) noteBtn.classList.remove('active');
    } else {
      if(_activeRail && !_spPinned) closeSidePanel();
      openPanel('notes'); switchSub('notes');
      if(noteBtn) noteBtn.classList.add('active');
      if(typeof NotePanel!=='undefined' && !NotePanel.isInEditor()){
        if(typeof renderFolderTree==='function') renderFolderTree();
      }
    }
  }
}

// 사전 아이콘: PaneManager 통해 노트 pane에서 사전 탭 표시
function toggleDictPanel(){
  _closeTypingIfOpen();
  const btn=document.querySelector('.rail-icon[data-rail="dictionary"]');
  if(S.panelOpen==='dictionary'&&!document.getElementById('rightPanel')?.classList.contains('rp-hide')){
    togglePanel('dictionary');
    if(btn) btn.classList.remove('active');
  }else{
    if(_activeRail&&!_spPinned) closeSidePanel();
    // PaneManager로 노트 pane 표시 (사전은 노트 pane 안에 있음)
    if(typeof PaneManager !== 'undefined') PaneManager.show('notes');
    openPanel('dictionary'); switchTab('dictionary');
    if(btn) btn.classList.add('active');
  }
}

function _spTogglePin(){
  _spPinned = !_spPinned;
  const btn = document.getElementById('spPinBtn');
  const sp = document.getElementById('sidePanel');
  if(btn) btn.classList.toggle('pinned', _spPinned);
  if(sp) sp.classList.toggle('sp-pinned', _spPinned);
}

// 지식 그래프 토글 — 우측 패널 인라인 그래프 탭으로 전환
function toggleKnowledgeGraph(){
  _closeTypingIfOpen();
  if(typeof KnowledgeGraph==='undefined') return;
  var rp = document.getElementById('rightPanel');
  var isGraphShowing = S.panelOpen === 'notes' && S._noteSubTab === 'graph'
                       && rp && !rp.classList.contains('rp-hide');
  if(isGraphShowing){
    togglePanel('notes');
    document.querySelector('.rail-icon[data-rail="graph"]')?.classList.remove('active');
  } else {
    if(_activeRail && !_spPinned) closeSidePanel();
    if(typeof PaneManager !== 'undefined') PaneManager.show('notes');
    openPanel('notes');
    switchSub('graph');
    document.querySelector('.rail-icon[data-rail="graph"]')?.classList.add('active');
  }
}

/* ═══ 찬양 오버레이 토글 (상세뷰 열기/닫기) ═══ */
function toggleHymnsOverlay(){
  _closeTypingIfOpen();
  var el = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  if(!el) return;
  var show = el.style.display === 'none';
  el.style.display = show ? 'flex' : 'none';
  if(scroll) scroll.style.display = show ? 'none' : '';
  _updateBibleBars();
  if(typeof _hymShowGlobalPlayer==='function') _hymShowGlobalPlayer();
}

function _initSection(name){
  if(name==='bible') buildBookList();
  else if(name==='bookmark') renderBookmarks();
  else if(name==='reading'&&typeof renderReadingPlan==='function') renderReadingPlan();
  else if(name==='bugreport'&&typeof renderBugReport==='function') renderBugReport();
  else if(name==='settings'&&typeof renderSettingsPanel==='function') renderSettingsPanel();
  else if(name==='hymns'&&typeof _hymInitSidePanel==='function') _hymInitSidePanel();
  else if(name==='live'&&typeof PDFLive!=='undefined') PDFLive.renderPanel();
}

// ── PaneManager 상태 변경 시 레일 아이콘 동기화 ──
if(typeof EventBus !== 'undefined'){
  EventBus.on('pane:changed', function(data){
    var visible = data.visible || [];
    document.querySelectorAll('.rail-pane-toggle').forEach(function(btn){
      var paneId = btn.dataset.pane;
      btn.classList.toggle('active', visible.indexOf(paneId) !== -1);
    });
    // 성경 목록 서브 버튼: 성경 패널 열림 시만 표시
    var bibleListBtn = document.getElementById('railBibleList');
    if(bibleListBtn) bibleListBtn.style.display = visible.indexOf('bible') !== -1 ? '' : 'none';
  });
}
