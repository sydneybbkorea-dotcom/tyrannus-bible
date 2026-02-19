// ═══════════════════════════════════════════════════
// BOOK / CHAPTER UI
// ═══════════════════════════════════════════════════
function buildBookList(){
  const c=document.getElementById('bookList'); c.innerHTML='';
  const mkGrp=l=>{const d=document.createElement('div');d.className='bl-grp';d.textContent=l;c.appendChild(d)};
  const mkItem=b=>{const d=document.createElement('div');d.className='bl-item'+(b===S.book?' act':'');d.dataset.b=b;d.innerHTML=`<span>${b}</span><span class="bl-dot"></span>`;d.onclick=()=>{S.book=b;S.ch=1;S.selV=null;renderAll();closeBookNav()};return d};
  mkGrp('구약'); BOOKS.OT.forEach(b=>c.appendChild(mkItem(b)));
  mkGrp('신약'); BOOKS.NT.forEach(b=>c.appendChild(mkItem(b)));
}
function filterBooks(q){document.querySelectorAll('.bl-item').forEach(el=>el.style.display=q&&!el.dataset.b.includes(q)?'none':'')}

function buildSelects(){
  const bs=document.getElementById('bookSel');
  bs.innerHTML=[...BOOKS.OT,...BOOKS.NT].map(b=>`<option value="${b}"${b===S.book?' selected':''}>${b}</option>`).join('');
  buildChSel();
}
function buildChSel(){
  const s=document.getElementById('chSel'); const n=CHCNT[S.book]||1;
  s.innerHTML=Array.from({length:n},(_,i)=>`<option value="${i+1}"${i+1===S.ch?' selected':''}>${i+1}장</option>`).join('');
}
function onBookChange(){ S.book=document.getElementById('bookSel').value; S.ch=1; S.selV=null; buildChSel(); renderAll(); }
function onChChange(){ S.ch=parseInt(document.getElementById('chSel').value); S.selV=null; renderAll(); }
function prevCh(){ if(S.ch>1){S.ch--;S.selV=null;renderAll();}else toast('첫 번째 장입니다') }
function nextCh(){ if(S.ch<(CHCNT[S.book]||1)){S.ch++;S.selV=null;renderAll();}else toast('마지막 장입니다') }
