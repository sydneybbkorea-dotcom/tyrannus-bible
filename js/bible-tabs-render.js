// bible-tabs-render.js — tab rendering & state sync
function saveActiveTabState(){
  const tab = _bibleTabs.find(t=>t.id===_activeTabId);
  if(!tab) return;
  tab.book = S.book;
  tab.ch = S.ch;
  tab.selV = S.selV;
  tab.showStrong = !!S.showStrong;
  tab.showParallel = !!S.showParallel;
  tab.showKorean = S.showKorean!==false;
  tab.showEnglish = !!S.showEnglish;
  tab.showRedLetter = !!S.showRedLetter;
  tab.hideHL = document.body.classList.contains('hide-hl');
  const bs = document.getElementById('bibleScroll');
  tab.scrollTop = bs ? bs.scrollTop : 0;
}

function restoreTabState(tab){
  S.book = tab.book;
  S.ch = tab.ch;
  S.selV = tab.selV;
  // 탭별 뷰 설정 복원
  S.showStrong = !!tab.showStrong;
  S.showKorean = tab.showKorean!==false;
  S.showEnglish = !!tab.showEnglish;
  S.showParallel = S.showKorean && S.showEnglish;
  S.showRedLetter = !!tab.showRedLetter;
  document.body.classList.toggle('hide-hl', !!tab.hideHL);
  renderAll();
  setTimeout(()=>{
    const bs = document.getElementById('bibleScroll');
    if(bs) bs.scrollTop = tab.scrollTop || 0;
    if(tab.selV){
      const r = document.querySelector(`.vrow[data-v="${tab.selV}"]`);
      if(r) r.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }, 100);
}

function renderBibleTabs(){
  const list = document.getElementById('bibleTabList');
  if(!list) return;
  list.innerHTML = _bibleTabs.map(t=>{
    const isActive = t.id === _activeTabId;
    const label = `${t.book} ${t.ch}장`;
    const canClose = _bibleTabs.length > 1;
    return `<div class="btab${isActive?' btab-active':''}" onclick="switchBibleTab('${t.id}')" title="${label}">
      <span class="btab-title">${label}</span>
      ${canClose ? `<span class="btab-close" onclick="closeBibleTab('${t.id}',event)">✕</span>` : ''}
    </div>`;
  }).join('');
}

// 일반 네비게이션(목차, 장 이동)에서도 현재 탭 상태 동기화
function syncCurrentTab(){
  const tab = _bibleTabs.find(t=>t.id===_activeTabId);
  if(tab){
    tab.book = S.book;
    tab.ch = S.ch;
    tab.selV = S.selV;
  }
  renderBibleTabs();
}

window.renderAll = function renderAll(){
  buildBookList(); buildSelects();
  renderBible(); renderFolderTree(); updateStat();
  document.getElementById('bookSel').value=S.book;
  document.getElementById('chSel').value=S.ch;
  if(typeof updateNavPickerLabel==='function') updateNavPickerLabel();
  if(typeof renderViewBar==='function') renderViewBar();
  syncCurrentTab();
}
