// notes-folders-crud.js — 폴더/노트 삭제, 이름변경, 생성
function deleteFolder(folderId, folderName, noteCount){
  hideFolderNoteCtx();
  const msg = noteCount > 0
    ? `"${folderName}" 폴더와 안에 있는 노트 ${noteCount}개를 모두 삭제할까요?`
    : `"${folderName}" 폴더를 삭제할까요?`;
  if(!confirm(msg)) return;
  // 폴더 안의 노트 모두 삭제
  S.notes = S.notes.filter(n => n.folderId !== folderId);
  S.folders = S.folders.filter(f => f.id !== folderId);
  if(S.curFolder === folderId){
    S.curFolder = S.folders[0]?.id || null;
    S.curNoteId = null;
  }
  persist(); renderFolderTree(); updateBreadcrumb();
  toast(`"${folderName}" 폴더가 삭제되었어요`);
}

function deleteNote(noteId, noteTitle){
  hideFolderNoteCtx();
  if(!confirm(`"${noteTitle}" 노트를 삭제할까요?`)) return;
  S.notes = S.notes.filter(n => n.id !== noteId);
  if(S.curNoteId === noteId) S.curNoteId = null;
  persist(); renderFolderTree(); renderBible(); updateBreadcrumb(); updateBacklinks();
  toast(`"${noteTitle}" 노트가 삭제되었어요`);
}

function renameFolder(folderId){
  hideFolderNoteCtx();
  const f = S.folders.find(x => x.id === folderId);
  if(!f) return;
  const newName = prompt('새 폴더 이름:', f.name);
  if(!newName || !newName.trim()) return;
  f.name = newName.trim();
  persist(); renderFolderTree();
  toast(`폴더 이름이 "${f.name}"으로 변경되었어요`);
}

function newFolder(){
  document.getElementById('mFolderName').value='';
  openM('mFolder');
  setTimeout(()=>document.getElementById('mFolderName').focus(),80);
}
function createFolder(){
  const nm=document.getElementById('mFolderName').value.trim();
  if(!nm){toast('폴더 이름을 입력하세요');return}
  S.folders.push({id:'f_'+Date.now(),name:nm});
  persist(); closeM('mFolder'); renderFolderTree();
  toast(`"${nm}" 폴더가 만들어졌어요`);
}

// ═══════════════════════════════════════════════════
// NOTE EDITOR
// ═══════════════════════════════════════════════════
window.newNote = function newNote(){
  S.curNoteId=null; S.curTags=[]; S.navHistory=[];
  document.getElementById('noteTitle').value='';
  document.getElementById('noteContent').innerHTML='';
  updateBacklinks(); // Show empty backlink state
  if(S.selV){
    const k=`${S.book}_${S.ch}_${S.selV}`;
    const vt=BIBLE[S.book]?.[S.ch]?.[S.selV-1]||'';
    document.getElementById('noteTitle').value=`${S.book} ${S.ch}:${S.selV} 묵상`;
    document.getElementById('noteContent').innerHTML=makVLink(k,`${S.book} ${S.ch}:${S.selV}`)+'&#8203; <span class="vtxt" style="font-family:\'KoPubWorld Batang\',\'Noto Serif KR\',serif;line-height:1.85;">'+vt+'</span><br><br>';
  }
  document.getElementById('noteFolderSel').value=S.curFolder;
  updateBreadcrumb();
  renderTagChips();
  closeExplorer();
}
