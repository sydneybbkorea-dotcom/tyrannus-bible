// nav-picker-actions.js — 팝업 탭 전환, 책/장 선택, 라벨 동기화

function _npSwitchTab(tab){
  _npTab = tab;
  _npSelectedBook = null;
  renderNavPicker();
}

function _npSelectBook(book){
  _npSelectedBook = book;
  // 탭도 자동 맞춤
  _npTab = BOOKS.OT.includes(book) ? 'OT' : 'NT';
  renderNavPicker();
  // 장 영역으로 스크롤
  const chEl = document.querySelector('.np-chapters');
  if(chEl) chEl.scrollIntoView({behavior:'smooth'});
}

function _npSelectCh(ch){
  S.book = _npSelectedBook;
  S.ch = ch;
  S.selV = null; S.selVSet.clear();
  closeNavPicker();
  updateNavPickerLabel();
  renderAll();
}

function updateNavPickerLabel(){
  const el = document.getElementById('navPickerLabel');
  if(el){
    const short = BOOK_SHORT[S.book] || S.book;
    el.textContent = `${short} ${S.ch}장`;
  }
  // 숨겨진 select도 동기화
  const bs = document.getElementById('bookSel');
  const cs = document.getElementById('chSel');
  if(bs) bs.value = S.book;
  if(cs) cs.value = S.ch;
}
