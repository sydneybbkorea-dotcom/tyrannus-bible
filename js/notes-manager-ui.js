// notes-manager-ui.js — updateBacklinks, toggleBacklinks, updateBreadcrumb
function updateBacklinks(){
  const panel=document.getElementById('backlinkPanel');
  const listEl=document.getElementById('backlinkList');
  const countEl=document.getElementById('backlinkCount');

  if(!S.curNoteId){
    panel.style.display='none';
    countEl.textContent='';
    return;
  }

  var linked = [];

  // Use LinkRegistry for O(1) backlink lookup if available
  if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady()){
    var noteUri = TyrannusURI.note(S.curNoteId);
    var incomingLinks = LinkRegistry.getIncoming(noteUri);
    var linkedNoteIds = new Set();
    incomingLinks.forEach(function(link){
      var parsed = TyrannusURI.parse(link.sourceUri);
      if(parsed && parsed.type === 'note' && parsed.segments[0] !== S.curNoteId){
        linkedNoteIds.add(parsed.segments[0]);
      }
    });
    linked = S.notes.filter(function(n){ return linkedNoteIds.has(n.id); });
  } else {
    // Fallback: O(N*M) HTML parsing (legacy)
    linked = S.notes.filter(n => {
      if(n.id===S.curNoteId) return false;
      const tmp=document.createElement('div'); tmp.innerHTML=n.content||'';
      return [...tmp.querySelectorAll('.nlink')].some(el=>el.dataset.noteid===S.curNoteId);
    });
  }

  if(!linked.length){
    panel.style.display='none';
    countEl.textContent='(0)';
    return;
  }

  panel.style.display='';

  countEl.textContent=`(${linked.length})`;
  listEl.innerHTML='';
  linked.forEach(n=>{
    const f=S.folders.find(x=>x.id===n.folderId);
    const d=document.createElement('div'); d.className='bl-entry';
    d.innerHTML=`<i class="fa fa-file-alt"></i><span>${n.title||'제목 없음'}</span><span class="bl-entry-folder">${f?.name||''}</span>`;
    d.onclick=()=>loadNote(n.id, true);
    listEl.appendChild(d);
  });

  // 그래프 보기 버튼
  if(typeof KnowledgeGraph !== 'undefined'){
    var graphBtn = document.createElement('div');
    graphBtn.className = 'bl-graph-btn';
    graphBtn.innerHTML = '<i class="fa fa-project-diagram"></i> ' + (typeof t==='function'? t('graph.viewGraph','그래프 보기') : '그래프 보기');
    graphBtn.onclick = function(){
      var uri = typeof TyrannusURI!=='undefined' ? TyrannusURI.note(S.curNoteId) : null;
      KnowledgeGraph.show(uri, { depth: 3 });
    };
    listEl.appendChild(graphBtn);
  }

  // default expanded
  listEl.style.display='block';
  document.getElementById('blChevron').style.transform='';
}

// ── 자식링크 (Outgoing Links) ──
function renderChildLinks(){
  var listEl = document.getElementById('childLinksList');
  if(!listEl) return;

  if(!S.curNoteId){
    listEl.innerHTML = '<div class="cl-empty"><i class="fa fa-file-circle-question"></i>노트를 선택하면<br>자식링크를 볼 수 있어요</div>';
    return;
  }

  if(typeof LinkRegistry === 'undefined' || !LinkRegistry.isReady()){
    listEl.innerHTML = '<div class="cl-empty"><i class="fa fa-spinner fa-spin"></i>링크 데이터 로딩 중...</div>';
    return;
  }

  var noteUri = TyrannusURI.note(S.curNoteId);
  var outgoing = LinkRegistry.getOutgoing(noteUri);

  if(!outgoing.length){
    listEl.innerHTML = '<div class="cl-empty"><i class="fa fa-share-nodes" style="opacity:.4"></i>이 노트에서 나가는 링크가 없습니다</div>';
    return;
  }

  listEl.innerHTML = '';
  outgoing.forEach(function(link){
    var parsed = TyrannusURI.parse(link.targetUri);
    if(!parsed) return;

    var icon = 'fa-link';
    var label = link.metadata && link.metadata.label ? link.metadata.label : link.targetUri;
    var subtitle = '';

    if(parsed.type === 'note'){
      icon = 'fa-file-alt';
      var targetNote = S.notes.find(function(n){ return n.id === parsed.segments[0]; });
      if(targetNote){
        label = targetNote.title || '제목 없음';
        var folder = S.folders.find(function(f){ return f.id === targetNote.folderId; });
        subtitle = folder ? folder.name : '';
      }
    } else if(parsed.type === 'verse'){
      icon = 'fa-bible';
      label = parsed.segments.join(' ');
    } else if(parsed.type === 'pdf'){
      icon = 'fa-file-pdf';
    }

    var entry = document.createElement('div');
    entry.className = 'cl-entry';
    entry.innerHTML = '<i class="fa ' + icon + '"></i>' +
      '<span class="cl-label">' + label + '</span>' +
      (subtitle ? '<span class="cl-folder">' + subtitle + '</span>' : '');
    entry.onclick = function(){
      NavigationRouter.navigateTo(link.targetUri);
    };
    listEl.appendChild(entry);
  });
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
