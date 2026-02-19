// ch-picker-render.js — 책 드롭다운 렌더링
function renderBookDrop(){
  var el = document.getElementById('bookDropdown');
  if(!el) return;
  var h = '';
  BOOKS.OT.forEach(function(b){ h += _cpBkItem(b); });
  h += '<div class="cp-div"></div>';
  BOOKS.NT.forEach(function(b){ h += _cpBkItem(b); });
  el.innerHTML = h;
  var act = el.querySelector('.cp-item-act');
  if(act) act.scrollIntoView({block:'center',behavior:'auto'});
}

function _cpBkItem(b){
  var cls = 'cp-item';
  if(b === S.book) cls += ' cp-item-act';
  return '<div class="' + cls + '" onclick="_pickBook(\'' + b + '\')">' + b + '</div>';
}
