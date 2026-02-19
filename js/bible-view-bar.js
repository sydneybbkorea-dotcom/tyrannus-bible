// bible-view-bar.js — 뷰바 렌더링 + 장 선택 팝업
function renderViewBar(){
  var bl = document.getElementById('vbBookLabel');
  var cn = document.getElementById('vbChNum');
  var vc = document.getElementById('vbVerseCount');
  if(bl) bl.textContent = S.book;
  if(cn) cn.textContent = S.ch;
  if(vc){
    var cnt = BIBLE[S.book]?.[S.ch]?.length || 0;
    vc.textContent = cnt + '절';
  }
  _syncVbBtn('vbKorean', S.showKorean!==false);
  _syncVbBtn('vbEnglish', !!S.showEnglish);
  _syncVbBtn('vbHL', !document.body.classList.contains('hide-hl'));
  _syncVbBtn('vbRed', !!S.showRedLetter);
  _syncVbBtn('vbStrong', !!S.showStrong);
}

function _syncVbBtn(id, on){
  var el = document.getElementById(id);
  if(el) el.classList.toggle('vb-on', on);
}
