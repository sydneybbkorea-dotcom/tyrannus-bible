// notes-manager.js — autoSaveCurrent, loadNote, goBack, jumpToHistory
function autoSaveCurrent(){
  // 링크 이동 전 현재 작성 중인 노트를 조용히 자동 저장
  if(!S.curNoteId) return;
  const title=document.getElementById('noteTitle').value.trim();
  const content=document.getElementById('noteContent').innerHTML;
  if(!title&&!content.replace(/<[^>]+>/g,'').trim()) return;
  const tmp=document.createElement('div'); tmp.innerHTML=content;
  // vRefs: 노트 내 구절 링크만 (자동 연결 제거 - 우클릭 수동 연결로만)
  const vRefs=[...new Set([...tmp.querySelectorAll('.vlink')].map(el=>el.dataset.ref).filter(Boolean))];
  const existing=S.notes.find(n=>n.id===S.curNoteId);
  const note={
    id:S.curNoteId,
    title:title||'제목 없음', content, tags:[...S.curTags],
    folderId:document.getElementById('noteFolderSel').value,
    vRefs:[...new Set(vRefs)],
    updatedAt:Date.now(),
    createdAt:existing?.createdAt||Date.now()
  };
  if(existing){ Object.assign(existing,note); }
  else{ S.notes.unshift(note); }
  persist();
}

function loadNote(id, pushHistory){
  const n=S.notes.find(x=>x.id===id); if(!n)return;
  // 다른 노트로 이동 전 현재 내용 자동 저장
  if(pushHistory && S.curNoteId && S.curNoteId!==id){
    autoSaveCurrent();
    S.navHistory.push(S.curNoteId);
  }
  S.curNoteId=id; S.curTags=[...(n.tags||[])]; S.curFolder=n.folderId||'default';
  document.getElementById('noteTitle').value=n.title||'';
  document.getElementById('noteContent').innerHTML=n.content||'';
  document.getElementById('noteFolderSel').value=n.folderId||'default';
  renderTagChips(); updateBreadcrumb(); renderFolderTree();
  updateBacklinks();
  openPanel('notes');
  switchSub('notes');
  closeExplorer();
}

function goBack(){
  if(!S.navHistory.length) return;
  autoSaveCurrent();  // 돌아가기 전 현재 내용 자동 저장
  const prevId = S.navHistory.pop();
  loadNote(prevId, false);  // don't push again when going back
}

function jumpToHistory(index){
  // 경로의 특정 지점으로 점프: 해당 인덱스까지만 히스토리 유지
  if(index < 0 || index >= S.navHistory.length) return;
  autoSaveCurrent();
  const targetId = S.navHistory[index];
  // 해당 인덱스까지의 히스토리만 유지 (해당 인덱스 자체는 제외)
  S.navHistory = S.navHistory.slice(0, index);
  loadNote(targetId, false);
}
