// notes-manager-save.js — saveNote function
function saveNote(){
  const title=document.getElementById('noteTitle').value.trim();
  const content=document.getElementById('noteContent').innerHTML;
  const fId=document.getElementById('noteFolderSel').value;
  if(!title&&!content.replace(/<[^>]+>/g,'').trim()){toast('내용을 입력해주세요');return}

  // collect verse refs from vlinks inside content
  const tmp=document.createElement('div'); tmp.innerHTML=content;
  // vRefs: 노트 내 구절 링크만 (자동 연결 제거 - 우클릭 수동 연결로만)
  const vRefs=[...new Set([...tmp.querySelectorAll('.vlink')].map(el=>el.dataset.ref).filter(Boolean))];

  const note={
    id:S.curNoteId||'n_'+Date.now(),
    title:title||'제목 없음', content, tags:[...S.curTags],
    folderId:fId, vRefs:[...new Set(vRefs)],
    updatedAt:Date.now(),
    createdAt:S.curNoteId?(S.notes.find(n=>n.id===S.curNoteId)?.createdAt||Date.now()):Date.now()
  };
  const idx=S.notes.findIndex(n=>n.id===note.id);
  if(idx>=0) S.notes[idx]=note; else S.notes.push(note);
  S.curNoteId=note.id; S.curFolder=fId;
  persist(); renderBible(); renderFolderTree(); updateBreadcrumb(); updateBacklinks();
  toast('저장됨 ✓');
}
