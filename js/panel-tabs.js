// panel-tabs.js — 패널 내부 탭(노트/사전/검색) 및 서브탭 전환
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
  document.getElementById('tbNotes')?.classList.toggle('on',name==='notes');
  document.getElementById('tbDict')?.classList.toggle('on',name==='dictionary');
  document.getElementById('tbSearch')?.classList.toggle('on',name==='search');
}

function switchSub(sub){
  const visibleGroup = document.querySelector('.rp-subtabs[style*="flex"]');
  if(visibleGroup){
    visibleGroup.querySelectorAll('.rp-tab').forEach(t=>t.classList.remove('act'));
    visibleGroup.querySelector(`[data-sub="${sub}"]`)?.classList.add('act');
  }

  if(sub==='notes'||sub==='commentary'||sub==='outline'){
    S._noteSubTab = sub;
    document.getElementById('sec-notes')?.classList.toggle('act', sub==='notes');
    document.getElementById('sec-commentary')?.classList.toggle('act', sub==='commentary');
    document.getElementById('sec-outline')?.classList.toggle('act', sub==='outline');
    if(sub==='outline' && typeof renderOutline==='function') renderOutline();
  }

  if(sub.startsWith('dict-')){
    S._dictSubTab = sub;
    document.getElementById('sec-dictionary')?.classList.add('act');
    ['dict-strongs','dict-webster','dict-enko','dict-korean'].forEach(id=>{
      const el=document.getElementById('sec-'+id);
      if(el){ el.style.display=(id===sub)?'flex':'none'; el.classList.toggle('act',id===sub); }
    });
  }
}
