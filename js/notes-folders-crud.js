// notes-folders-crud.js — 폴더/노트 삭제, 이름변경, 생성 (중첩 지원)
function deleteFolder(folderId, folderName, noteCount){
  hideFolderNoteCtx();
  const all=_getDescendantIds(folderId);
  const totalNotes=S.notes.filter(n=>all.includes(n.folderId)).length;
  const msg=totalNotes>0
    ?`"${folderName}" 폴더와 하위 노트 ${totalNotes}개를 모두 삭제할까요?`
    :`"${folderName}" 폴더를 삭제할까요?`;
  if(!confirm(msg)) return;
  S.notes=S.notes.filter(n=>!all.includes(n.folderId));
  S.folders=S.folders.filter(f=>!all.includes(f.id));
  if(all.includes(S.curFolder)){
    S.curFolder=S.folders[0]?.id||null;
    S.curNoteId=null;
  }
  persist(); renderFolderTree(); updateBreadcrumb();
  toast(`"${folderName}" 폴더가 삭제되었어요`);
}

function _getDescendantIds(fid){
  const ids=[fid];
  S.folders.filter(f=>f.parentId===fid).forEach(c=>{
    ids.push(..._getDescendantIds(c.id));
  });
  return ids;
}

function deleteNote(noteId, noteTitle){
  hideFolderNoteCtx();
  if(!confirm(`"${noteTitle}" 노트를 삭제할까요?`)) return;
  S.notes=S.notes.filter(n=>n.id!==noteId);
  if(S.curNoteId===noteId) S.curNoteId=null;
  persist(); renderFolderTree(); renderBible();
  updateBreadcrumb(); updateBacklinks();
  toast(`"${noteTitle}" 노트가 삭제되었어요`);
}
