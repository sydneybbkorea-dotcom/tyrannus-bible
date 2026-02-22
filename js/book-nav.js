// book-nav.js — 사이드바 책/장 2컬럼 렌더링
var _bnSelBook = null;

function buildBookList(){
  _bnSelBook = null;
  renderBookGrid();
}

function renderBookGrid(){
  const c = document.getElementById('bookList');
  if(!c) return;

  let h = '<div class="bn-split">';

  // 왼쪽: 책 목록 (스크롤)
  h += '<div class="bn-book-col">';
  h += '<div class="bn-section-head">구약</div>';
  BOOKS.OT.forEach(b => {
    const sel = (b === _bnSelBook);
    const cur = (b === S.book);
    h += `<div class="bn-book${sel ? ' sel' : ''}${cur ? ' current' : ''}" onclick="_bnPickBook('${b}')">${b}</div>`;
  });
  h += '<div class="bn-section-head">신약</div>';
  BOOKS.NT.forEach(b => {
    const sel = (b === _bnSelBook);
    const cur = (b === S.book);
    h += `<div class="bn-book${sel ? ' sel' : ''}${cur ? ' current' : ''}" onclick="_bnPickBook('${b}')">${b}</div>`;
  });
  h += '</div>';

  // 오른쪽: 장 번호 패널 (책 선택 시에만 표시)
  if(_bnSelBook){
    h += '<div class="bn-ch-col">';
    const cnt = CHCNT[_bnSelBook] || 1;
    const short = BOOK_SHORT[_bnSelBook] || _bnSelBook;
    h += `<div class="bn-ch-head">${short}</div>`;
    for(let i = 1; i <= cnt; i++){
      const act = (_bnSelBook === S.book && i === S.ch);
      h += `<div class="bn-ch${act ? ' act' : ''}" onclick="_bnPickCh(${i})">${i}</div>`;
    }
    h += '</div>';
  }

  h += '</div>';
  c.innerHTML = h;

  // 선택된 책으로 스크롤
  if(_bnSelBook){
    const el = c.querySelector('.bn-book.sel');
    if(el) setTimeout(() => el.scrollIntoView({block:'nearest', behavior:'smooth'}), 50);
  }
}
