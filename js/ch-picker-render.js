// ch-picker-render.js — 장 선택 팝업 렌더링
function renderChPicker(){
  var el = document.getElementById('chPickerPopup');
  if(!el) return;
  var h = '<div class="cp-wrap">';
  // 좌측: 전체 성경 책 목록
  h += '<div class="cp-books"><div class="cp-sec-label">구약</div>';
  BOOKS.OT.forEach(function(b){ h += _cpBookItem(b); });
  h += '<div class="cp-sec-label cp-nt-label">신약</div>';
  BOOKS.NT.forEach(function(b){ h += _cpBookItem(b); });
  h += '</div>';
  // 우측: 선택된 책의 장 그리드
  h += '<div class="cp-chapters">';
  if(_cpSelBook){
    var cnt = CHCNT[_cpSelBook]||1;
    var short = BOOK_SHORT[_cpSelBook]||_cpSelBook;
    h += '<div class="cp-ch-title">' + short + '</div>';
    h += '<div class="cp-ch-grid">';
    for(var i=1;i<=cnt;i++){
      var act = (_cpSelBook===S.book && i===S.ch) ? ' cp-ch-act' : '';
      h += '<div class="cp-ch' + act + '" onclick="event.stopPropagation();_cpSelectCh(' + i + ')">' + i + '</div>';
    }
    h += '</div>';
  }
  h += '</div></div>';
  el.innerHTML = h;
  // 선택된 책으로 스크롤
  var actEl = el.querySelector('.cp-book-act');
  if(actEl) actEl.scrollIntoView({block:'center',behavior:'auto'});
}

function _cpBookItem(b){
  var short = BOOK_SHORT[b]||b.slice(0,2);
  var act = (b===_cpSelBook) ? ' cp-book-act' : '';
  var cur = (b===S.book) ? ' cp-book-cur' : '';
  return '<div class="cp-book' + act + cur + '" onclick="event.stopPropagation();_cpPickBook(\'' + b + '\')" title="' + b + '">' + short + '</div>';
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
