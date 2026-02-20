// vb-search.js — 뷰바 검색창: 입력 → 오른쪽 패널 슬라이드로 결과 표시
function vbDoSearch(){
  const q=(document.getElementById('vbSchInput')?.value||'').trim();
  if(!q) return;
  // 기존 검색 입력창에도 동기화
  const schInput=document.getElementById('schInput');
  if(schInput) schInput.value=q;
  // 오른쪽 패널 열기 + 검색 탭 전환
  const rp=document.getElementById('rightPanel');
  if(rp) rp.classList.remove('rp-hide');
  document.body.classList.add('panel-open');
  S.panelOpen='search';
  if(typeof switchTab==='function') switchTab('search');
  // 검색 실행
  if(typeof doSearch==='function') doSearch();
}

function vbSchKey(e){
  if(e.key==='Enter') vbDoSearch();
  if(e.key==='Escape'){
    const inp=document.getElementById('vbSchInput');
    if(inp){ inp.value=''; inp.blur(); }
  }
}
