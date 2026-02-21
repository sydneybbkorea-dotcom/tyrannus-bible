// notes-manager-save.js — saveNote function (H1에서 제목 추출, 자동저장 지원)
function saveNote(silent){
  var h1=document.querySelector('#noteContent h1:first-child');
  var title=(h1?h1.textContent:'').trim();
  var content=document.getElementById('noteContent').innerHTML;
  var fId=S.curFolder||'default';
  if(!title&&!content.replace(/<[^>]+>/g,'').trim()){if(!silent)toast('내용을 입력해주세요');return}

  var tmp=document.createElement('div'); tmp.innerHTML=content;
  var vRefs=[...new Set([...tmp.querySelectorAll('.vlink')].map(function(el){return el.dataset.ref}).filter(Boolean))];

  var note={
    id:S.curNoteId||'n_'+Date.now(),
    title:title||'제목 없음', content:content, tags:[...S.curTags],
    folderId:fId, vRefs:[...new Set(vRefs)],
    updatedAt:Date.now(),
    createdAt:S.curNoteId?(S.notes.find(function(n){return n.id===S.curNoteId})?.createdAt||Date.now()):Date.now()
  };
  var idx=S.notes.findIndex(function(n){return n.id===note.id});
  if(idx>=0) S.notes[idx]=note; else S.notes.push(note);
  S.curNoteId=note.id; S.curFolder=fId;
  persist(); renderBible(); renderFolderTree(); updateBreadcrumb(); updateBacklinks();

  // Sync links to LinkRegistry (async)
  if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady()){
    LinkRegistry.syncFromNote(note.id, content);
  }

  if(typeof EventBus !== 'undefined') EventBus.emit('note:saved', { id: note.id });

  if(!silent) toast('저장됨 ✓');
  if(typeof _noteUpdateTabTitle==='function') _noteUpdateTabTitle();
}
