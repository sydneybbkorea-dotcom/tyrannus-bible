// ch-picker-render.js — 2-panel 장 선택기 렌더링 (왼쪽 책 + 오른쪽 장)
function renderChPicker(){
  var el = document.getElementById('chPickerPopup');
  if(!el) return;
  var h = '<div class="cp-wrap">';
  h += '<div class="cp-books"><div class="cp-books-inner">';
  h += _cpBookList(BOOKS.OT, '구약');
  h += _cpBookList(BOOKS.NT, '신약');
  h += '</div></div>';
  h += '<div class="cp-chs" id="cpChList">';
  h += _cpSelBook ? _cpChList(_cpSelBook) : '';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
  _cpScrollToActive(el);
}
