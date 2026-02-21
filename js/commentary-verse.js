// commentary-verse.js — verse-level commentary rendering (updateCommentary)
function updateCommentary(){
  const vn=S.selV; const el=document.getElementById('commentaryContent');
  if(!el) return;
  if(!vn){el.innerHTML='<div class="comm-hint"><i class="fa fa-scroll"></i>구절을 클릭하면<br>주석과 메모를 볼 수 있어요</div>';return}

  const key=`${S.book}_${S.ch}_${vn}`;
  const comm=COMMENTARY[S.book]?.[S.ch]?.[vn];
  const refs=XREFS[key]||[];
  const linked=S.notes.filter(n=>n.vRefs?.includes(key));
  const vMemo = S.verseMemo?.[key]; // 구절 전체 주석 메모

  // 하이라이트 메모 수집
  const vtxtEl = document.querySelector(`.vtxt[data-key="${key}"]`);
  const memoMap = new Map();
  if(vtxtEl){
    vtxtEl.querySelectorAll('mark[data-memo]').forEach(m => {
      const memo = m.dataset.memo?.trim();
      if(!memo) return;
      const gid = m.dataset.gid || ('_'+m.textContent.trim().slice(0,8));
      if(!memoMap.has(gid)){
        const allText = vtxtEl.querySelectorAll(`mark[data-gid="${m.dataset.gid}"]`);
        const rangeText = allText.length > 0 ? [...allText].map(x=>x.textContent).join('') : m.textContent;
        const color = m.className.replace('hl-active','').trim();
        memoMap.set(gid, { memo, text: rangeText, color });
      }
    });
  }

  const hasContent = comm || refs.length || linked.length || memoMap.size || vMemo;
  if(!hasContent){
    const pgEmpty = (typeof buildPassageGuide==='function') ? buildPassageGuide(vn) : '';
    el.innerHTML=pgEmpty+`<div class="comm-verse-group"><div class="comm-verse-header"><i class="fa fa-bookmark"></i><span>${S.book} ${S.ch}:${vn}</span></div>
      <div class="comm-hint" style="padding:30px 16px"><i class="fa fa-feather-alt" style="font-size:16px;opacity:.4"></i><br>이 구절에 대한<br>주석이나 메모가 없어요</div></div>`;
    return;
  }

  // Passage Guide 카드 삽입
  const pgCard = (typeof buildPassageGuide==='function') ? buildPassageGuide(vn) : '';

  let h = `<div class="comm-verse-group">`;
  h += pgCard;
  h += `<div class="comm-verse-header"><div style="display:flex;align-items:center;gap:8px"><i class="fa fa-bookmark"></i><span>${S.book} ${S.ch}:${vn}</span></div></div>`;
  h += `<div class="comm-verse-body">`;

  // 1) 구절 주석 메모 (보라)
  if(vMemo){
    h += `<div class="comm-sec-card comm-sec-note">
      <div class="comm-sec-head"><i class="fa fa-comment-dots"></i> 구절 주석</div>
      <div class="comm-sec-inner"><div class="comm-vmemo-body">${vMemo}</div></div>
    </div>`;
  }

  // 2) 연결된 구절 (블루)
  if(refs.length){
    h += `<div class="comm-sec-card comm-sec-refs">
      <div class="comm-sec-head"><i class="fa fa-link"></i> 연결된 구절</div>
      <div class="comm-sec-inner"><div class="cross-refs">${refs.map(r=>`<span class="cref" onclick="navByRef('${r}')">${r}</span>`).join('')}</div></div>
    </div>`;
  }

  // 3) 연결된 노트 (틸)
  if(linked.length){
    h += `<div class="comm-sec-card comm-sec-notes">
      <div class="comm-sec-head"><i class="fa fa-pen"></i> 연결된 노트</div>
      <div class="comm-sec-inner">${linked.map(n=>{
        const folder = S.folders.find(f=>f.id===n.folderId);
        return `<div class="comm-note-item" onclick="loadNote('${n.id}',true);openPanel('notes');switchSub('notes')">
          <div class="comm-note-main">
            <i class="fa fa-file-alt" style="font-size:10px"></i>
            <span>${n.title||'제목 없음'}</span>
          </div>
          ${folder?`<span class="comm-note-folder"><i class="fa fa-folder" style="font-size:8px"></i> ${folder.name}</span>`:''}
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  // 4) 하이라이트 메모 (앰버)
  if(memoMap.size > 0){
    const colorDot = {'hl-y':'rgba(255,215,64,.9)','hl-o':'rgba(255,171,64,.9)','hl-g':'rgba(105,240,174,.9)','hl-b':'rgba(64,196,255,.9)','hl-p':'rgba(206,147,216,.9)'};

    h += `<div class="comm-sec-card comm-sec-hl">
      <div class="comm-sec-head"><i class="fa fa-highlighter"></i> 하이라이트 메모</div>
      <div class="comm-sec-inner">`;

    let memoIdx = 0;
    [...memoMap.entries()].forEach(([gid, {memo, text, color}])=>{
      const cls = color.split(' ').find(c=>c.startsWith('hl-'))||'hl-y';
      const dot = colorDot[cls]||'var(--gold)';
      const mData = S.hlMemo?.[gid];
      const mName = mData?.name || '메모';
      const mTags = (mData?.tags||[]).map(t=>`<span class="comm-memo-tag">#${t}</span>`).join('');
      const mHtml = mData?.html || memo;

      if(memoIdx > 0) h += `<div class="comm-hl-divider"></div>`;
      h += `<div class="comm-hl-card">
        <div class="comm-hl-quote" style="border-left-color:${dot}">
          ${text}
        </div>
        <div class="comm-hl-body">${mHtml}</div>
        ${mTags?`<div class="comm-hl-tags">${mTags}</div>`:''}
      </div>`;
      memoIdx++;
    });
    h += `</div></div>`;
  }

  // 5) 참고 주석
  if(comm){
    h += `<div class="comm-sec-card comm-sec-ref-note">
      <div class="comm-sec-head"><i class="fa fa-scroll"></i> 참고 주석</div>
      <div class="comm-sec-inner">${comm}</div>
    </div>`;
  }

  h += `</div></div>`;
  el.innerHTML = h;

  // delegation
  el.querySelectorAll('.memo-vlink').forEach(lnk=>{
    if(!lnk.getAttribute('onclick')){
      const ref = lnk.dataset.ref;
      if(ref) lnk.setAttribute('onclick', `event.stopPropagation();navByKey('${ref}')`);
    }
  });
  el.querySelectorAll('.memo-nlink').forEach(lnk=>{
    if(!lnk.getAttribute('onclick')){
      const nid = lnk.dataset.noteid;
      if(nid) lnk.setAttribute('onclick', `event.stopPropagation();loadNote('${nid}',true);switchTab('notes')`);
    }
  });
}
