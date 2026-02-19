// ch-picker.js — 전체 성경 장 선택 팝업
var _cpOpen = false;
var _cpSelBook = null;

function openChPicker(){
  if(_cpOpen){ closeChPicker(); return; }
  _cpOpen = true;
  _cpSelBook = S.book;
  renderChPicker();
  var el = document.getElementById('chPickerPopup');
  if(el) el.style.display = '';
  setTimeout(()=> document.addEventListener('click', _cpOutClick), 10);
}

function closeChPicker(){
  _cpOpen = false;
  var el = document.getElementById('chPickerPopup');
  if(el) el.style.display = 'none';
  document.removeEventListener('click', _cpOutClick);
}

function _cpOutClick(e){
  var el = document.getElementById('chPickerPopup');
  var btn = document.getElementById('vbBookSel');
  if(!el||!btn) return;
  if(!el.contains(e.target)&&!btn.contains(e.target)) closeChPicker();
}

function _cpScrollToActive(el){
  var ab = el.querySelector('.cp-bk-act');
  if(ab) ab.scrollIntoView({block:'center',behavior:'auto'});
  var ac = el.querySelector('.cp-ci-act');
  if(ac) ac.scrollIntoView({block:'center',behavior:'auto'});
}
