function restoreSel(){if(S.selV){const r=document.querySelector(`.vrow[data-v="${S.selV}"]`);if(r)r.classList.add('vsel')}}

// ═══════════════════════════════════════════════════
// VERSE SELECT & STATUS
// ═══════════════════════════════════════════════════
function selVerse(vn, e){
  S.selV=vn;
  document.querySelectorAll('.vrow').forEach(r=>r.classList.remove('vsel'));
  const row=document.querySelector(`.vrow[data-v="${vn}"]`);
  if(row) row.classList.add('vsel');
  const statV = document.getElementById('statV');
  if(statV) {
    statV.innerHTML=`<i class="fa fa-map-pin" style="color:var(--gold)"></i> ${S.book} ${S.ch}:${vn}`;
  }
  updateDict();
}

// ═══════════════════════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════════════════════
function addBookmark(){
  if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`;
  if(S.bk.has(k)){S.bk.delete(k);toast('북마크 해제됨')}
  else{S.bk.add(k);toast('북마크 추가됨 🔖')}
  persist(); renderBible(); restoreSel();
}

