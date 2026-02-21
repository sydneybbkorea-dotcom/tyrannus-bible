// notes-links-notelink.js — 노트 링크 삽입 (커서 저장/복원 포함)
let _savedRange = null;
function saveRange(){
  const sel=window.getSelection();
  if(sel && sel.rangeCount>0){
    const r=sel.getRangeAt(0);
    if(document.getElementById('noteContent')?.contains(r.commonAncestorContainer))
      _savedRange=r.cloneRange();
  }
}
function restoreRange(){
  if(_savedRange){
    const nc = document.getElementById('noteContent');
    if(!nc) return;
    nc.focus();
    const sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(_savedRange);
    _savedRange=null;
  }
}

function openNoteLink(){
  saveRange();
  renderNotePicker('');
  openM('mNoteLink');
  document.getElementById('nlSearch').value='';
  setTimeout(()=>document.getElementById('nlSearch').focus(), 80);
}
function filterNoteLinks(q){renderNotePicker(q)}
function renderNotePicker(q){
  const cont=document.getElementById('notePicker'); cont.innerHTML='';
  const filtered=S.notes.filter(n=>n.id!==S.curNoteId&&(!q||n.title.includes(q)));
  if(!filtered.length){cont.innerHTML=`<div style="color:var(--text3);font-size:12px;padding:12px;text-align:center">${q?'일치하는 노트가 없어요':'저장된 노트가 없어요'}</div>`;return}
  filtered.sort((a,b)=>b.updatedAt-a.updatedAt).forEach(n=>{
    const f=S.folders.find(x=>x.id===n.folderId);
    const d=document.createElement('div'); d.className='npick-item';
    d.innerHTML=`<i class="fa fa-file-alt"></i><div><div>${n.title||'제목 없음'}</div><div class="npick-folder">${f?.name||'기본 폴더'}</div></div>`;
    d.onclick=()=>{ closeM('mNoteLink'); insertNoteLink(n.id, n.title||'제목 없음'); };
    cont.appendChild(d);
  });
}
function insertNoteLink(noteId, noteTitle){
  const nc=document.getElementById('noteContent');
  nc.focus();
  if(_savedRange){
    const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(_savedRange);
    _savedRange=null;
  }
  const linkHTML=`<span class="nlink" data-noteid="${noteId}" contenteditable="false" title="${noteTitle}"><i class="fa fa-file-alt"></i> ${noteTitle}</span>&#8203;`;
  insertInlineHTML(linkHTML);

  // Register link in LinkRegistry
  if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady() && S.curNoteId){
    LinkRegistry.addLink(
      TyrannusURI.note(S.curNoteId),
      TyrannusURI.note(noteId),
      'reference',
      { label: noteTitle }
    );
  }

  toast(`"${noteTitle}" 노트 링크가 삽입됐어요 🔗`);
}
