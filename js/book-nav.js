// book-nav.js — 사이드바 책/장 그리드 렌더링
var _bnTab='OT', _bnSelBook=null;

function buildBookList(){
  _bnSelBook=S.book; _bnTab=BOOKS.OT.includes(S.book)?'OT':'NT';
  renderBookGrid();
}
function renderBookGrid(){
  const c=document.getElementById('bookList'); if(!c) return;
  const books=_bnTab==='OT'?BOOKS.OT:BOOKS.NT;
  let h=`<div class="bn-tabs">`;
  h+=`<div class="bn-tab${_bnTab==='OT'?' act':''}" onclick="_bnSwitchTab('OT')">구약</div>`;
  h+=`<div class="bn-tab${_bnTab==='NT'?' act':''}" onclick="_bnSwitchTab('NT')">신약</div></div>`;
  h+=`<div class="bn-books"><div class="bn-book-grid">`;
  books.forEach(b=>{
    const short=BOOK_SHORT[b]||b.slice(0,2), act=(b===_bnSelBook);
    h+=`<div class="bn-book${act?' act':''}" onclick="_bnPickBook('${b}')" title="${b}">${short}</div>`;
  });
  h+=`</div></div>`;
  if(_bnSelBook){
    const cnt=CHCNT[_bnSelBook]||1, short=BOOK_SHORT[_bnSelBook]||_bnSelBook;
    h+=`<div class="bn-chapters"><div class="bn-ch-label"><span>${short}</span> 장 선택</div><div class="bn-ch-grid">`;
    for(let i=1;i<=cnt;i++){
      const act=(_bnSelBook===S.book&&i===S.ch);
      h+=`<div class="bn-ch${act?' act':''}" onclick="_bnPickCh(${i})">${i}</div>`;
    }
    h+=`</div></div>`;
  }
  c.innerHTML=h;
}
