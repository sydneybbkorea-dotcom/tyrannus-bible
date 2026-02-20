// search-item.js — 통합 검색 네비게이션 + 하이라이트 헬퍼
function _schNav(b,ch,v,nid,type){
  if(type==='note'||type==='file'){
    if(nid&&typeof loadNote==='function') loadNote(nid,true);
    if(typeof switchTab==='function') switchTab('notes');
    return;
  }
  S.book=b; S.ch=ch; S.selV=v; S.selVSet=new Set([v]);
  if(typeof updateNavPickerLabel==='function') updateNavPickerLabel();
  if(typeof renderAll==='function') renderAll();
  setTimeout(()=>{
    const el=document.querySelector('.vrow[data-v="'+v+'"]');
    if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  },200);
}

function _schHighlight(text,q){
  if(!q||!text) return text||'';
  const safe=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  try{ return text.replace(new RegExp(safe,'gi'),'<mark class="adv-hl">$&</mark>'); }
  catch(e){ return text; }
}
