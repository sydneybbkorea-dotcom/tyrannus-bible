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

function updateBacklinks(){
  const panel=document.getElementById('backlinkPanel');
  const listEl=document.getElementById('backlinkList');
  const countEl=document.getElementById('backlinkCount');
  
  // Always show panel
  panel.style.display='';
  
  if(!S.curNoteId){ 
    listEl.innerHTML='<div class="bl-empty" style="padding:12px;text-align:center;color:var(--text3);font-size:11px;">노트를 선택하세요</div>';
    countEl.textContent='';
    return; 
  }
  
  // Find all notes that have an nlink pointing to current note
  const linked = S.notes.filter(n => {
    if(n.id===S.curNoteId) return false;
    const tmp=document.createElement('div'); tmp.innerHTML=n.content||'';
    return [...tmp.querySelectorAll('.nlink')].some(el=>el.dataset.noteid===S.curNoteId);
  });
  
  if(!linked.length){ 
    listEl.innerHTML='<div class="bl-empty" style="padding:12px;text-align:center;color:var(--text3);font-size:11px;">이 노트로 연결된 다른 노트가 없습니다</div>';
    countEl.textContent='(0)';
    return; 
  }
  
  countEl.textContent=`(${linked.length})`;
  listEl.innerHTML='';
  linked.forEach(n=>{
    const f=S.folders.find(x=>x.id===n.folderId);
    const d=document.createElement('div'); d.className='bl-entry';
    d.innerHTML=`<i class="fa fa-file-alt"></i><span>${n.title||'제목 없음'}</span><span class="bl-entry-folder">${f?.name||''}</span>`;
    d.onclick=()=>loadNote(n.id, true);
    listEl.appendChild(d);
  });
  
  // default expanded
  listEl.style.display='block';
  document.getElementById('blChevron').style.transform='';
}

let _blOpen=true;
function toggleBacklinks(){
  _blOpen=!_blOpen;
  document.getElementById('backlinkList').style.display=_blOpen?'block':'none';
  document.getElementById('blChevron').style.transform=_blOpen?'':'rotate(-90deg)';
}

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

function updateBreadcrumb(){
  const el=document.getElementById('nedBreadcrumb');
  const navBar=document.getElementById('noteNavBar');
  const pathEl=document.getElementById('navPath');
  const backBtn=document.getElementById('backBtn');
  
  if(!S.curNoteId){
    el.innerHTML=`<span style="color:var(--text3);font-style:italic">노트를 선택하거나 새로 만드세요</span>`;
    navBar.style.display='none';
    return;
  }
  
  // breadcrumb (현재 폴더 > 노트 이름)
  const n=S.notes.find(x=>x.id===S.curNoteId);
  const f=S.folders.find(x=>x.id===(n?.folderId));
  el.innerHTML=`<span class="bc-folder"><i class="fa fa-folder" style="font-size:9px"></i> ${f?.name||'기본 폴더'}</span><span class="bc-sep"><i class="fa fa-chevron-right" style="font-size:9px"></i></span><span class="bc-note">${n?.title||'제목 없음'}</span>`;
  
  // 네비게이션 경로 바 (히스토리 있을 때만 표시)
  if(S.navHistory.length > 0){
    navBar.style.display='flex';
    backBtn.style.display='';
    
    // 경로 빌드: 히스토리 스택의 노트들 → 현재 노트
    let pathHTML = '';
    // 히스토리가 길면 최근 3개만 + ... 표시
    const hist = S.navHistory;
    const showHist = hist.length > 3 ? hist.slice(-3) : hist;
    const hasEllipsis = hist.length > 3;
    
    if(hasEllipsis){
      pathHTML += `<span class="np-item" style="opacity:.4;cursor:default">···</span>`;
      pathHTML += `<span class="np-sep"><i class="fa fa-chevron-right"></i></span>`;
    }
    
    showHist.forEach((noteId, i) => {
      const hn = S.notes.find(x=>x.id===noteId);
      const title = hn?.title || '제목 없음';
      pathHTML += `<span class="np-item" onclick="jumpToHistory(${hist.length - showHist.length + i})" title="${title}">${title}</span>`;
      pathHTML += `<span class="np-sep"><i class="fa fa-chevron-right"></i></span>`;
    });
    
    // 현재 노트
    pathHTML += `<span class="np-current" title="${n?.title||'제목 없음'}">${n?.title||'제목 없음'}</span>`;
    pathEl.innerHTML = pathHTML;
    
    // 스크롤을 오른쪽 끝으로
    requestAnimationFrame(()=>{ pathEl.scrollLeft = pathEl.scrollWidth; });
  } else {
    navBar.style.display='none';
    backBtn.style.display='none';
  }
}

