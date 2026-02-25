// icon-rail.js — 아이콘 레일: 패널 토글 + 사이드패널 섹션 토글 (PaneManager 연동)
var _activeRail = null;
var _spPinned = false;
var _railHidden = false;

function _toggleIconRail(){
  // LayoutManager가 로드되었으면 레이아웃 피커로 리다이렉트
  if(typeof LayoutManager !== 'undefined'){
    LayoutManager.openPicker();
    return;
  }
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

// 사전 아이콘: 사이드패널에서 독립 표시
function toggleDictPanel(){
  _closeTypingIfOpen();
  toggleRail('dictionary');
}

// 사이드패널 사전 탭 전환
function _spSwitchDict(sub){
  document.querySelectorAll('.sp-dict-tab').forEach(function(t){
    t.classList.toggle('active', t.dataset.dict === sub);
  });
  // 기존 노트패널 사전 기능 활용
  if(typeof switchSub === 'function') switchSub(sub);
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
    // 그래프 끄면 노트 탭으로 복귀 (패널 숨기지 않음)
    switchSub('notes');
    document.querySelector('.rail-icon[data-rail="graph"]')?.classList.remove('active');
  } else {
    if(_activeRail && !_spPinned) closeSidePanel();
    if(typeof PaneManager !== 'undefined') PaneManager.show('notes');
    openPanel('notes');
    switchSub('graph');
    document.querySelector('.rail-icon[data-rail="graph"]')?.classList.add('active');
  }
}

/* ═══ 검색 패널 토글 (PDF 패널 위치에 표시) ═══ */
var _searchInPdf = false;
var _searchOrigParent = null;
var _pdfWasVisible = false;

function toggleSearchPane(){
  _closeTypingIfOpen();

  var secSearch = document.getElementById('sec-search');
  var pdfSearchView = document.getElementById('pdfSearchView');
  var pdfLibView = document.getElementById('pdfLibraryView');
  var pdfViewerView = document.getElementById('pdfViewerView');
  var pdfTabBar = document.getElementById('pdfTabBar');
  var pdfHeader = document.getElementById('pdfPaneHeader');
  var railBtn = document.getElementById('railSearchBtn');

  if(!secSearch || !pdfSearchView) return;

  if(_searchInPdf){
    // ── 검색 비활성화: 원래 위치로 복원 ──
    if(_searchOrigParent) _searchOrigParent.appendChild(secSearch);
    secSearch.style.display = '';
    pdfSearchView.style.display = 'none';

    // PDF 콘텐츠 복원
    if(pdfLibView) pdfLibView.style.display = '';
    if(pdfViewerView) pdfViewerView.style.display = '';

    // PDF 헤더 복원
    if(pdfHeader){
      var titleEl = pdfHeader.querySelector('.pane-header-title');
      if(titleEl) titleEl.innerHTML = '<i class="fa fa-file-pdf"></i> <span class="pane-tag">PDF</span>';
    }

    // PDF 패널이 원래 안 보이던 상태였으면 숨김
    if(!_pdfWasVisible && typeof PaneManager !== 'undefined'){
      PaneManager.hide('pdf');
    }

    _searchInPdf = false;
    if(railBtn) railBtn.classList.remove('active');
  } else {
    // ── 검색 활성화: PDF 패널 위치에 표시 ──

    // PDF 패널 원래 표시 상태 기억
    _pdfWasVisible = typeof PaneManager !== 'undefined' && PaneManager.isVisible('pdf');

    // PDF 패널 표시
    if(typeof PaneManager !== 'undefined' && !PaneManager.isVisible('pdf')){
      PaneManager.show('pdf');
    }

    // PDF 콘텐츠 숨김
    if(pdfLibView) pdfLibView.style.display = 'none';
    if(pdfViewerView) pdfViewerView.style.display = 'none';
    if(pdfTabBar) pdfTabBar.style.display = 'none';

    // #sec-search를 pdfSearchView로 이동
    _searchOrigParent = secSearch.parentNode;
    pdfSearchView.appendChild(secSearch);
    secSearch.style.display = 'flex';
    pdfSearchView.style.display = 'flex';

    // PDF 헤더를 "검색"으로 변경
    if(pdfHeader){
      var titleEl = pdfHeader.querySelector('.pane-header-title');
      if(titleEl) titleEl.innerHTML = '<i class="fa fa-search"></i> <span class="pane-tag">검색</span>';
    }

    _searchInPdf = true;
    if(railBtn) railBtn.classList.add('active');

    // 검색 입력에 포커스
    var inp = document.getElementById('schInput');
    if(inp) setTimeout(function(){ inp.focus(); }, 100);
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
  else if(name==='dictionary') { /* 사전 초기화 — 기존 사전 탭 데이터 활용 */ }
}

// ── PaneManager 상태 변경 시 레일 아이콘 동기화 ──
if(typeof EventBus !== 'undefined'){
  EventBus.on('pane:changed', function(data){
    var visible = data.visible || [];
    document.querySelectorAll('.rail-pane-toggle').forEach(function(btn){
      var paneId = btn.dataset.pane;
      btn.classList.toggle('active', visible.indexOf(paneId) !== -1);
    });
  });
}
