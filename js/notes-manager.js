// notes-manager.js — autoSaveCurrent, loadNote, goBack, jumpToHistory
function autoSaveCurrent(){
  if(!S.curNoteId) return;
  var h1=document.querySelector('#noteContent h1:first-child');
  var title=(h1?h1.textContent:'').trim();
  var content=document.getElementById('noteContent').innerHTML;
  if(!title&&!content.replace(/<[^>]+>/g,'').trim()) return;
  var tmp=document.createElement('div'); tmp.innerHTML=content;
  var vRefs=[...new Set([...tmp.querySelectorAll('.vlink')].map(function(el){return el.dataset.ref}).filter(Boolean))];
  var existing=S.notes.find(function(n){return n.id===S.curNoteId});
  var note={
    id:S.curNoteId,
    title:title||'제목 없음', content:content, tags:[...S.curTags],
    folderId:S.curFolder||'default',
    vRefs:[...new Set(vRefs)],
    updatedAt:Date.now(),
    createdAt:existing?.createdAt||Date.now()
  };
  if(existing){ Object.assign(existing,note); }
  else{ S.notes.unshift(note); }
  persist();
}

function loadNote(id, pushHistory){
  var n=S.notes.find(function(x){return x.id===id}); if(!n)return;
  if(pushHistory && S.curNoteId && S.curNoteId!==id){
    autoSaveCurrent();
    S.navHistory.push(S.curNoteId);
  }
  S.curNoteId=id; S.curTags=[...(n.tags||[])]; S.curFolder=n.folderId||'default';
  var el=document.getElementById('noteContent');
  if(el){
    var c=n.content||'';
    // content에 H1이 없으면 제목을 H1로 prepend
    if(n.title&&!c.match(/^<h1[ >]/i)) c='<h1>'+n.title+'</h1>'+c;
    el.innerHTML=c;
  }
  renderTagChips(); updateBreadcrumb(); renderFolderTree();
  updateBacklinks();
  if(S._noteSubTab==='childlinks' && typeof renderChildLinks==='function') renderChildLinks();
  openPanel('notes'); switchSub('notes');
  if(typeof NotePanel!=='undefined') NotePanel.showEditor(id);
  if(typeof _noteUpdateTabTitle==='function') _noteUpdateTabTitle();
  if(typeof _noteInitAutoSave==='function') _noteInitAutoSave();
}

function goBack(){
  if(!S.navHistory.length) return;
  autoSaveCurrent();
  var prevId = S.navHistory.pop();
  loadNote(prevId, false);
}

function jumpToHistory(index){
  if(index < 0 || index >= S.navHistory.length) return;
  autoSaveCurrent();
  var targetId = S.navHistory[index];
  S.navHistory = S.navHistory.slice(0, index);
  loadNote(targetId, false);
}
