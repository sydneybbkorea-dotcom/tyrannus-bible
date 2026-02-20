// verse-select.js — 구절 선택/해제 + 다중 선택 + 북마크
function restoreSel(){
  (S.selVSet||[]).forEach(v=>{
    const r=document.querySelector(`.vrow[data-v="${v}"]`); if(r) r.classList.add('vsel');
  });
}
function selVerse(vn, e){
  if(!S.selVSet) S.selVSet=new Set();
  if(S.selVSet.has(vn)){
    S.selVSet.delete(vn);
    document.querySelector(`.vrow[data-v="${vn}"]`)?.classList.remove('vsel');
    S.selV=S.selVSet.size?Math.max(...S.selVSet):null;
  } else {
    S.selVSet.add(vn);
    document.querySelector(`.vrow[data-v="${vn}"]`)?.classList.add('vsel');
    S.selV=vn;
  }
  _updateStatV(); updateDict();
  if(typeof showXrefBar==='function'){ S.selV ? showXrefBar(S.selV) : hideXrefBar(); }
}
function _updateStatV(){
  const statV=document.getElementById('statV'); if(!statV) return;
  const arr=[...(S.selVSet||[])].sort((a,b)=>a-b);
  if(!arr.length){ statV.innerHTML=''; return; }
  statV.innerHTML=`<i class="fa fa-map-pin" style="color:var(--gold)"></i> ${S.book} ${arr.map(v=>S.ch+':'+v).join(', ')}`;
}
function clearAllSel(){
  document.querySelectorAll('.vrow.vsel').forEach(r=>r.classList.remove('vsel'));
  if(S.selVSet) S.selVSet.clear(); S.selV=null; _updateStatV();
  if(typeof hideXrefBar==='function') hideXrefBar();
}
document.addEventListener('click',e=>{
  const bs=document.getElementById('bibleScroll');
  if(!bs||!bs.contains(e.target)) return;
  if(!e.target.closest('.vrow')&&!e.target.closest('#ctxMenu')&&!e.target.closest('#hlPicker')){
    clearAllSel();
  }
});
function addBookmark(){
  if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`;
  if(S.bk.has(k)){S.bk.delete(k);toast('북마크 해제됨')}
  else{S.bk.add(k);toast('북마크 추가됨 🔖')}
  persist(); renderBible(); restoreSel();
}
