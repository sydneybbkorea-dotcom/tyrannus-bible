// panel-tabs.js — 패널 내부 메인 탭(노트/사전/검색) 전환
function switchTab(name){
  document.querySelectorAll('.rp-subtabs').forEach(s=>s.style.display='none');
  document.querySelectorAll('.rp-body > .rp-sec').forEach(s=>s.classList.remove('act'));

  if(name==='notes'){
    const el=document.getElementById('subtabs-notes');
    if(el) el.style.display='flex';
    switchSub(S._noteSubTab || 'notes');
  } else if(name==='dictionary'){
    const el=document.getElementById('subtabs-dict');
    if(el) el.style.display='flex';
    document.getElementById('sec-dictionary')?.classList.add('act');
    switchSub(S._dictSubTab || 'dict-webster');
  } else if(name==='search'){
    const el=document.getElementById('subtabs-search');
    if(el) el.style.display='flex';
    document.getElementById('sec-search')?.classList.add('act');
  }

  S.panelOpen=name;
}
