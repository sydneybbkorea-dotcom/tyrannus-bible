// ch-picker-render.js — 장 선택 팝업 렌더링 (세로 드롭다운, 풀네임)
function renderChPicker(){
  var el = document.getElementById('chPickerPopup');
  if(!el) return;
  var h = '<div class="cp-list">';
  h += '<div class="cp-sec-label">구약</div>';
  BOOKS.OT.forEach(function(b){ h += _cpBookRow(b); });
  h += '<div class="cp-sec-label cp-nt-label">신약</div>';
  BOOKS.NT.forEach(function(b){ h += _cpBookRow(b); });
  h += '</div>';
  el.innerHTML = h;
  // 선택된 책으로 스크롤
  var actEl = el.querySelector('.cp-book-act');
  if(actEl) actEl.scrollIntoView({block:'center',behavior:'auto'});
}

function _cpBookRow(b){
  var isSel = (b===_cpSelBook);
  var isCur = (b===S.book);
  var cls = 'cp-book' + (isSel?' cp-book-act':'') + (isCur?' cp-book-cur':'');
  var arrow = isSel ? 'fa-chevron-down' : 'fa-chevron-right';
  var h = '<div class="' + cls + '" onclick="event.stopPropagation();_cpPickBook(\'' + b + '\')">';
  h += '<i class="cp-arrow fa ' + arrow + '"></i>';
  h += '<span class="cp-book-name">' + b + '</span>';
  var cnt = CHCNT[b]||1;
  h += '<span class="cp-book-cnt">' + cnt + '장</span>';
  h += '</div>';
  if(isSel) h += _cpChapterGrid(b);
  return h;
}
