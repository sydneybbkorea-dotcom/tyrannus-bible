// bible-view-bar.js — 본문 내 장 네비게이션 + 탭별 뷰 토글 동기화
function renderViewBar(){
  // 장 라벨 업데이트
  var lbl = document.getElementById('vbChLabel');
  if(lbl) lbl.textContent = S.book + ' ' + S.ch + '장';
  // 토글 버튼 on/off 동기화
  _syncVbBtn('vbKorean', S.showKorean!==false);
  _syncVbBtn('vbEnglish', !!S.showEnglish);
  _syncVbBtn('vbRead', document.body.classList.contains('read-mode'));
  _syncVbBtn('vbRed', !!S.showRedLetter);
  _syncVbBtn('vbStrong', !!S.showStrong);
}

function _syncVbBtn(id, on){
  var el = document.getElementById(id);
  if(el) el.classList.toggle('vb-on', on);
}
