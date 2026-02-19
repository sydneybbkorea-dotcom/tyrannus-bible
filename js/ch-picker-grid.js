// ch-picker-grid.js — 책 목록 / 장 목록 생성 + 선택 액션
function _cpBookList(arr, label){
  var h = '<div class="cp-sec">' + label + '</div>';
  arr.forEach(function(b){
    var cls = 'cp-bk';
    if(b===_cpSelBook) cls += ' cp-bk-act';
    if(b===S.book) cls += ' cp-bk-cur';
    h += '<div class="'+cls+'" onclick="event.stopPropagation();_cpPickBook(\''+b+'\')">';
    h += b + '</div>';
  });
  return h;
}

function _cpChList(book){
  var cnt = CHCNT[book]||1;
  var h = '';
  for(var i=1;i<=cnt;i++){
    var cls = 'cp-ci';
    if(book===S.book && i===S.ch) cls += ' cp-ci-act';
    h += '<div class="'+cls+'" onclick="event.stopPropagation();_cpSelectCh('+i+')">';
    h += i + ' 장</div>';
  }
  return h;
}

function _cpPickBook(b){
  _cpSelBook = b;
  renderChPicker();
}

function _cpSelectCh(ch){
  S.book = _cpSelBook;
  S.ch = ch;
  S.selV = null; S.selVSet.clear();
  closeChPicker();
  renderAll();
}
