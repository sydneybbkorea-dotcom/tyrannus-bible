// notes-links-verse.js — 구절 링크 삽입 모달 (노트 에디터)
function openVersePick(){
  saveRange();
  buildVLSelects();
  openM('mVerse');
}
function buildVLSelects(){
  const bs=document.getElementById('vlB');
  bs.innerHTML=[...BOOKS.OT,...BOOKS.NT].map(b=>`<option value="${b}"${b===S.book?' selected':''}>${b}</option>`).join('');
  vlChBuild(); vlPrev();
}
function vlChBuild(){
  const b=document.getElementById('vlB').value, s=document.getElementById('vlC');
  s.innerHTML=Array.from({length:CHCNT[b]||1},(_,i)=>`<option value="${i+1}"${i+1===S.ch?' selected':''}>${i+1}장</option>`).join('');
  vlPrev();
}
function vlPrev(){
  const b=document.getElementById('vlB').value, c=document.getElementById('vlC').value, v=document.getElementById('vlV').value;
  document.getElementById('vlPrev').textContent=v?`${b} ${c}:${v}`:`${b} ${c}장`;
}
function confirmVL(){
  const b=document.getElementById('vlB').value, c=parseInt(document.getElementById('vlC').value), v=parseInt(document.getElementById('vlV').value)||null;
  const key=v?`${b}_${c}_${v}`:`${b}_${c}_`;
  const ref=v?`${b} ${c}:${v}`:`${b} ${c}장`;
  const nc=document.getElementById('noteContent'); nc.focus();
  if(_savedRange){
    const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(_savedRange);
    _savedRange=null;
  }
  insertInlineHTML(makVLink(key,ref));
  closeM('mVerse');
  toast(`${ref} 링크가 삽입됐어요 📖`);
}
