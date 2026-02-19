// nav-picker-render.js — 팝업 내부 콘텐츠 렌더링

function renderNavPicker(){
  const popup = document.getElementById('navPickerPopup');
  if(!popup) return;

  let h = '';
  // 구약/신약 탭
  h += `<div class="np-tabs">`;
  h += `<div class="np-tab${_npTab==='OT'?' act':''}" onclick="event.stopPropagation();_npSwitchTab('OT')">구약</div>`;
  h += `<div class="np-tab${_npTab==='NT'?' act':''}" onclick="event.stopPropagation();_npSwitchTab('NT')">신약</div>`;
  h += `</div>`;

  // 책 그리드
  const books = _npTab === 'OT' ? BOOKS.OT : BOOKS.NT;
  h += `<div class="np-books"><div class="np-book-grid">`;
  books.forEach(b => {
    const short = BOOK_SHORT[b] || b.slice(0,2);
    const isAct = (b === _npSelectedBook);
    h += `<div class="np-book${isAct?' act':''}" onclick="event.stopPropagation();_npSelectBook('${b}')" title="${b}">${short}</div>`;
  });
  h += `</div></div>`;

  // 선택된 책의 장 그리드
  if(_npSelectedBook){
    const cnt = CHCNT[_npSelectedBook] || 1;
    const short = BOOK_SHORT[_npSelectedBook] || _npSelectedBook;
    h += `<div class="np-chapters">`;
    h += `<div class="np-ch-label"><span>${short}</span> 장 선택</div>`;
    h += `<div class="np-ch-grid">`;
    for(let i=1; i<=cnt; i++){
      const isAct = (_npSelectedBook===S.book && i===S.ch);
      h += `<div class="np-ch${isAct?' act':''}" onclick="event.stopPropagation();_npSelectCh(${i})">${i}</div>`;
    }
    h += `</div></div>`;
  }

  popup.innerHTML = h;
}
