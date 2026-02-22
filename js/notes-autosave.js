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
  if(typeof NotePanel!=='undefined') NotePanel.updateTabTitle();
}

function _noteInitAutoSave(){
  var el=document.getElementById('noteContent');
  if(!el||el.dataset.autosave) return;
  el.dataset.autosave='1';
  el.addEventListener('input',_noteScheduleSave);
}
