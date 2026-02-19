// notes-autosave.js -- 디바운스 자동 저장 + 탭 제목 업데이트
var _noteAutoTimer=null;

function _noteScheduleSave(){
  if(_noteAutoTimer) clearTimeout(_noteAutoTimer);
  _noteAutoTimer=setTimeout(function(){
    if(typeof saveNote==='function') saveNote(true);
    _noteUpdateTabTitle();
  },1500);
}

function _noteUpdateTabTitle(){
  var h1=document.querySelector('#noteContent h1:first-child');
  var t=(h1?h1.textContent:'').trim()||'노트';
  if(t.length>16) t=t.slice(0,16)+'…';
  var tab=document.querySelector('.rp-tab[data-sub="notes"]');
  if(tab) tab.innerHTML='<i class="fa fa-pen"></i> '+t;
}

function _noteInitAutoSave(){
  var el=document.getElementById('noteContent');
  if(!el||el.dataset.autosave) return;
  el.dataset.autosave='1';
  el.addEventListener('input',_noteScheduleSave);
}
