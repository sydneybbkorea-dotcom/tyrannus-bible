// book-nav-actions.js — 책/장 선택 액션 + select 동기화
function _bnPickBook(b){
  _bnSelBook = b;
  _bnUpdateSelection();
}

/* 책 목록 선택 상태 + 장 패널만 갱신 (전체 리렌더 없이) */
function _bnUpdateSelection(){
  // 책 목록 하이라이트 갱신
  document.querySelectorAll('.bn-book-col .bn-book').forEach(el => {
    el.classList.toggle('sel', el.textContent === _bnSelBook);
  });
  const split = document.querySelector('.bn-split');
  if(!split) return;
  // 기존 장 컬럼 제거
  const old = split.querySelector('.bn-ch-col');
  if(old) old.remove();
  if(!_bnSelBook) return;
  // 새 장 컬럼 생성
  const col = document.createElement('div');
  col.className = 'bn-ch-col';
  const cnt = CHCNT[_bnSelBook] || 1;
  const short = BOOK_SHORT[_bnSelBook] || _bnSelBook;
  let h = `<div class="bn-ch-head">${short}</div>`;
  for(let i = 1; i <= cnt; i++){
    const act = (_bnSelBook === S.book && i === S.ch);
    h += `<div class="bn-ch${act ? ' act' : ''}" onclick="_bnPickCh(${i})">${i}</div>`;
  }
  col.innerHTML = h;
  split.appendChild(col);
}

function _bnPickCh(ch){
  S.book = _bnSelBook; S.ch = ch; S.selV = null; S.selVSet.clear();
  if(!_spPinned && typeof closeSidePanel === 'function') closeSidePanel();
  updateNavPickerLabel(); renderAll(); renderBookGrid();
}
function filterBooks(q){
  if(!q){ document.querySelectorAll('.bn-book-col .bn-book').forEach(el => el.style.display = ''); return; }
  document.querySelectorAll('.bn-book-col .bn-book').forEach(el => {
    el.style.display = el.textContent.includes(q) ? '' : 'none';
  });
}
function buildSelects(){
  const bs = document.getElementById('bookSel');
  if(bs) bs.innerHTML = [...BOOKS.OT,...BOOKS.NT].map(b => `<option value="${b}"${b===S.book?' selected':''}>${b}</option>`).join('');
  buildChSel();
}
function buildChSel(){
  const s = document.getElementById('chSel'); if(!s) return; const n = CHCNT[S.book]||1;
  s.innerHTML = Array.from({length:n},(_,i) => `<option value="${i+1}"${i+1===S.ch?' selected':''}>${i+1}장</option>`).join('');
}
function onBookChange(){ S.book=document.getElementById('bookSel').value; S.ch=1; S.selV=null;S.selVSet.clear(); buildChSel(); renderAll(); }
function onChChange(){ S.ch=parseInt(document.getElementById('chSel').value); S.selV=null;S.selVSet.clear(); renderAll(); }
function prevCh(){ if(S.ch>1){S.ch--;S.selV=null;S.selVSet.clear();renderAll();}else toast('첫 번째 장입니다') }
function nextCh(){ if(S.ch<(CHCNT[S.book]||1)){S.ch++;S.selV=null;S.selVSet.clear();renderAll();}else toast('마지막 장입니다') }
