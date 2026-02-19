// panel-tabs-sub.js — 서브탭(노트/주석/아웃라인, 사전 하위) 전환
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
