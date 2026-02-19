// notes-manager-ui.js — updateBacklinks, toggleBacklinks, updateBreadcrumb
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
