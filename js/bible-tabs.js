// bible-tabs.js — tab management (open, add, switch, close)
let _tabCounter = 0;

function _genTabId(){ return 'btab_' + (++_tabCounter); }

function initBibleTabs(){
  // 초기 탭 1개 생성 (현재 S.book/S.ch 기준)
  const id = _genTabId();
  _bibleTabs = [{ id, book:S.book, ch:S.ch, selV:S.selV, scrollTop:0 }];
  _activeTabId = id;
  renderBibleTabs();
}

const MAX_BIBLE_TABS = 10;

function openBibleTab(book, ch, selV){
  saveActiveTabState();
  // 같은 위치 탭이 이미 있으면 그 탭으로 전환
  const existing = _bibleTabs.find(t=> t.book===book && t.ch===ch);
  if(existing){
    _activeTabId = existing.id;
    existing.selV = selV;
    restoreTabState(existing);
    renderBibleTabs();
    return;
  }
  // 최대 탭 수 초과 시 가장 오래된 비활성 탭 닫기
  if(_bibleTabs.length >= MAX_BIBLE_TABS){
    const oldest = _bibleTabs.find(t=>t.id!==_activeTabId);
    if(oldest) _bibleTabs.splice(_bibleTabs.indexOf(oldest), 1);
  }
  const id = _genTabId();
  const newTab = { id, book, ch, selV, scrollTop:0 };
  const curIdx = _bibleTabs.findIndex(t=>t.id===_activeTabId);
  _bibleTabs.splice(curIdx+1, 0, newTab);
  _activeTabId = id;
  restoreTabState(newTab);
  renderBibleTabs();
}

function addBibleTab(){
  if(_bibleTabs.length >= MAX_BIBLE_TABS){ toast(`탭은 최대 ${MAX_BIBLE_TABS}개까지 열 수 있어요`); return; }
  saveActiveTabState();
  const id = _genTabId();
  const newTab = { id, book:S.book, ch:S.ch, selV:null, scrollTop:0 };
  _bibleTabs.push(newTab);
  _activeTabId = id;
  renderBibleTabs();
  const bs = document.getElementById('bibleScroll');
  if(bs) bs.scrollTop = 0;
}

function switchBibleTab(id){
  if(id === _activeTabId) return;
  saveActiveTabState();
  _activeTabId = id;
  const tab = _bibleTabs.find(t=>t.id===id);
  if(tab) restoreTabState(tab);
  renderBibleTabs();
}

function closeBibleTab(id, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(_bibleTabs.length <= 1) return; // 최소 1개 유지
  const idx = _bibleTabs.findIndex(t=>t.id===id);
  if(idx < 0) return;
  _bibleTabs.splice(idx, 1);
  if(_activeTabId === id){
    // 닫힌 탭이 활성이면 가까운 탭으로 전환
    const newIdx = Math.min(idx, _bibleTabs.length-1);
    _activeTabId = _bibleTabs[newIdx].id;
    restoreTabState(_bibleTabs[newIdx]);
  }
  renderBibleTabs();
}
