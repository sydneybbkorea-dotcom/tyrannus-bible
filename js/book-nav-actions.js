// book-nav-actions.js — 책/장 선택 액션 + select 동기화
function _bnSwitchTab(tab){ _bnTab=tab; _bnSelBook=null; renderBookGrid(); }
function _bnPickBook(b){
  _bnSelBook=b; _bnTab=BOOKS.OT.includes(b)?'OT':'NT'; renderBookGrid();
  const ch=document.querySelector('.bn-chapters');
  if(ch) ch.scrollIntoView({behavior:'smooth'});
}
function _bnPickCh(ch){
  S.book=_bnSelBook; S.ch=ch; S.selV=null;S.selVSet.clear();
  updateNavPickerLabel(); renderAll(); renderBookGrid();
}
function filterBooks(q){
  document.querySelectorAll('.bn-book').forEach(el=>{
    el.style.display=q&&!(el.getAttribute('title')||'').includes(q)?'none':'';
  });
}
function buildSelects(){
  const bs=document.getElementById('bookSel');
  if(bs) bs.innerHTML=[...BOOKS.OT,...BOOKS.NT].map(b=>`<option value="${b}"${b===S.book?' selected':''}>${b}</option>`).join('');
  buildChSel();
}
function buildChSel(){
  const s=document.getElementById('chSel'); if(!s) return; const n=CHCNT[S.book]||1;
  s.innerHTML=Array.from({length:n},(_,i)=>`<option value="${i+1}"${i+1===S.ch?' selected':''}>${i+1}장</option>`).join('');
}
function onBookChange(){ S.book=document.getElementById('bookSel').value; S.ch=1; S.selV=null;S.selVSet.clear(); buildChSel(); renderAll(); }
function onChChange(){ S.ch=parseInt(document.getElementById('chSel').value); S.selV=null;S.selVSet.clear(); renderAll(); }
function prevCh(){ if(S.ch>1){S.ch--;S.selV=null;S.selVSet.clear();renderAll();}else toast('첫 번째 장입니다') }
function nextCh(){ if(S.ch<(CHCNT[S.book]||1)){S.ch++;S.selV=null;S.selVSet.clear();renderAll();}else toast('마지막 장입니다') }
