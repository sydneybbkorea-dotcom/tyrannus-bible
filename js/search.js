// search.js — 검색 필터 칩 토글 + 책 선택 드롭다운 제어
window.searchFilters = {OT:true, NT:true, notes:true, commentary:true, files:true};

function sfToggle(btn){
  const f = btn.dataset.f;
  if(f==='all'){ _sfSetAll(!btn.classList.contains('on')); return; }
  btn.classList.toggle('on');
  searchFilters[f] = btn.classList.contains('on');
  _sfSyncAll();
}

function _sfSetAll(on){
  document.querySelectorAll('.sf-chip').forEach(c=>{
    if(on) c.classList.add('on'); else c.classList.remove('on');
    const k=c.dataset.f; if(k!=='all') searchFilters[k]=on;
  });
}

function _sfSyncAll(){
  const chips=document.querySelectorAll('.sf-chip:not([data-f="all"])');
  const allOn=Array.from(chips).every(c=>c.classList.contains('on'));
  const allBtn=document.querySelector('.sf-chip[data-f="all"]');
  if(allBtn) allBtn.classList.toggle('on', allOn);
}

function sfBookChange(){
  // 책 선택 시 자동 검색 (선택값이 있으면)
  const sel=document.getElementById('sfBookSel');
  if(sel && sel.value && typeof doSearch==='function') doSearch();
}
