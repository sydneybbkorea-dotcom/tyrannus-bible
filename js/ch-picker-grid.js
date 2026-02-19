// ch-picker-grid.js — 장 선택 그리드 + 액션 헬퍼
function _cpChapterGrid(b){
  var cnt = CHCNT[b]||1;
  var h = '<div class="cp-ch-grid">';
  for(var i=1;i<=cnt;i++){
    var act = (b===S.book && i===S.ch) ? ' cp-ch-act' : '';
    h += '<div class="cp-ch' + act + '" onclick="event.stopPropagation();_cpSelectCh(' + i + ')">' + i + '</div>';
  }
  h += '</div>';
  return h;
}

function _cpPickBook(b){
  _cpSelBook = (_cpSelBook===b) ? null : b;
  renderChPicker();
}

function _cpSelectCh(ch){
  S.book = _cpSelBook;
  S.ch = ch;
  S.selV = null; S.selVSet.clear();
  closeChPicker();
  renderAll();
}
