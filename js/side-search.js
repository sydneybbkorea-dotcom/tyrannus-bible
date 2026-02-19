// side-search.js — 사이드패널 검색 네비게이션 (통합 검색에서 사용)
function _spSchNav(b,ch,v,nid){
  if(nid){ loadNote(nid,true); openPanel('notes'); switchSub('notes'); return; }
  S.book=b; S.ch=ch; S.selV=v; S.selVSet=new Set([v]);
  updateNavPickerLabel(); renderAll();
  setTimeout(()=>{
    const el=document.querySelector('.vrow[data-v="'+v+'"]');
    if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  },200);
}
