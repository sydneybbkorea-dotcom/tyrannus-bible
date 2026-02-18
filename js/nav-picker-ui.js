// nav-picker-ui.js — 팝업 열기/닫기 및 렌더링 로직

function toggleNavPicker(){
  _npOpen ? closeNavPicker() : openNavPicker();
}

function openNavPicker(){
  _npOpen = true;
  _npSelectedBook = S.book;
  _npTab = BOOKS.OT.includes(S.book) ? 'OT' : 'NT';
  const popup = document.getElementById('navPickerPopup');
  const btn = document.getElementById('navPickerBtn');
  if(!popup || !btn) return;
  btn.classList.add('open');
  renderNavPicker();
  popup.classList.add('show');
  // 바깥 클릭 닫기
  setTimeout(()=> document.addEventListener('click', _npOutsideClick), 10);
}

function closeNavPicker(){
  _npOpen = false;
  const popup = document.getElementById('navPickerPopup');
  const btn = document.getElementById('navPickerBtn');
  if(popup) popup.classList.remove('show');
  if(btn) btn.classList.remove('open');
  document.removeEventListener('click', _npOutsideClick);
}

function _npOutsideClick(e){
  const popup = document.getElementById('navPickerPopup');
  const btn = document.getElementById('navPickerBtn');
  if(!popup || !btn) return;
  if(!popup.contains(e.target) && !btn.contains(e.target)){
    closeNavPicker();
  }
}
