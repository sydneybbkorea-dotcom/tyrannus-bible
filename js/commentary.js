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
    el.innerHTML=`<div class="comm-verse-group"><div class="comm-verse-header"><i class="fa fa-bookmark"></i><span>${S.book} ${S.ch}:${vn}</span></div>
      <div class="comm-hint" style="padding:30px 16px"><i class="fa fa-feather-alt" style="font-size:16px;opacity:.4"></i><br>이 구절에 대한<br>주석이나 메모가 없어요</div></div>`;
    return;
  }

  let h = `<div class="comm-verse-group">`;
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
    const hlBgMap = {'hl-y':'rgba(255,215,64,.1)','hl-o':'rgba(255,171,64,.1)','hl-g':'rgba(105,240,174,.08)','hl-b':'rgba(64,196,255,.08)','hl-p':'rgba(206,147,216,.08)'};

    h += `<div class="comm-sec-card comm-sec-hl">
      <div class="comm-sec-head"><i class="fa fa-highlighter"></i> 하이라이트 메모</div>
      <div class="comm-sec-inner">`;

    [...memoMap.entries()].forEach(([gid, {memo, text, color}])=>{
      const cls = color.split(' ').find(c=>c.startsWith('hl-'))||'hl-y';
      const dot = colorDot[cls]||'var(--gold)';
      const hlBg = hlBgMap[cls]||'rgba(255,215,64,.1)';
      const mData = S.hlMemo?.[gid];
      const mName = mData?.name || '메모';
      const mTags = (mData?.tags||[]).map(t=>`<span class="comm-memo-tag">#${t}</span>`).join('');
      const mHtml = mData?.html || memo;

      h += `<div class="comm-hl-card">
        <div class="comm-hl-quote" style="background:${hlBg};border-left:3px solid ${dot}">
          <span>❝</span> ${text}
        </div>
        <div class="comm-hl-body">${mHtml}</div>
        ${mTags?`<div class="comm-hl-tags">${mTags}</div>`:''}
      </div>`;
    });
    h += `</div></div>`;
  }

  // 5) 참고 주석
  if(comm){
    h += `<div class="comm-sec-card comm-sec-ref-note">
      <div class="comm-sec-head"><i class="fa fa-scroll" style="color:var(--gold)"></i> 참고 주석</div>
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

// updateDict — 기존 호출 호환용 (주석 탭 + 사전 탭 동시 업데이트)
let _commMode = 'verse'; // 'verse' | 'chapter'
function updateDict(){
  if(_commMode === 'chapter') updateChapterCommentary();
  else updateCommentary();
}

function setCommMode(mode){
  _commMode = mode;
  document.getElementById('commModeVerse')?.classList.toggle('comm-mode-active', mode==='verse');
  document.getElementById('commModeChapter')?.classList.toggle('comm-mode-active', mode==='chapter');
  updateDict();
}

function updateChapterCommentary(){
  const el = document.getElementById('commentaryContent');
  if(!el) return;

  const verses = BIBLE[S.book]?.[S.ch];
  if(!verses){ el.innerHTML='<div class="comm-hint">이 장에 대한 데이터가 없습니다</div>'; return; }

  let h = `<div class="comm-ch-title">${S.book} ${S.ch}장 전체 주석</div>`;
  const totalVerses = Object.keys(verses).length;
  let hasAny = false;

  for(let vn = 1; vn <= totalVerses; vn++){
    const key = `${S.book}_${S.ch}_${vn}`;
    const comm = COMMENTARY[S.book]?.[S.ch]?.[vn];
    const refs = XREFS[key] || [];
    const linked = S.notes.filter(n=>n.vRefs?.includes(key));

    // 하이라이트 메모
    const vtxtEl = document.querySelector(`.vtxt[data-key="${key}"]`);
    const memoList = [];
    if(vtxtEl){
      const seen = new Set();
      vtxtEl.querySelectorAll('mark[data-memo]').forEach(m=>{
        const memo = m.dataset.memo?.trim();
        if(!memo) return;
        const gid = m.dataset.gid || '';
        if(seen.has(gid)) return; seen.add(gid);
        const allText = gid ? [...vtxtEl.querySelectorAll(`mark[data-gid="${gid}"]`)].map(x=>x.textContent).join('') : m.textContent;
        const color = m.className.replace('hl-active','').trim();
        memoList.push({ gid, memo, text:allText, color });
      });
    }

    const hasContent = comm || refs.length || linked.length || memoList.length;
    if(!hasContent) continue;
    hasAny = true;

    // 구절 텍스트
    const verseText = verses[vn] || '';
    const plainText = verseText.replace(/<[^>]+>/g, '');

    h += `<div class="comm-ch-verse" data-v="${vn}" onclick="selVerse(${vn})">`;
    h += `<div class="comm-ch-vhead">
      <span class="comm-ch-vnum">${vn}</span>
      <span class="comm-ch-vtxt">${plainText.length > 60 ? plainText.slice(0,60)+'…' : plainText}</span>
    </div>`;

    // 주석
    if(comm){
      h += `<div class="comm-ch-item"><span class="comm-ch-icon"><i class="fa fa-scroll"></i></span><div class="comm-ch-body">${comm}</div></div>`;
    }

    // 교차 참조
    if(refs.length){
      h += `<div class="comm-ch-item"><span class="comm-ch-icon"><i class="fa fa-link"></i></span><div class="comm-ch-body"><div class="cross-refs">${refs.map(r=>`<span class="cref" onclick="event.stopPropagation();navByRef('${r}')">${r}</span>`).join('')}</div></div></div>`;
    }

    // 연결된 노트
    if(linked.length){
      h += `<div class="comm-ch-item"><span class="comm-ch-icon"><i class="fa fa-pen"></i></span><div class="comm-ch-body">${linked.map(n=>`<span class="comm-ch-note" onclick="event.stopPropagation();loadNote('${n.id}',true);openPanel('notes');switchSub('notes')">${n.title||'제목 없음'}</span>`).join('')}</div></div>`;
    }

    // 하이라이트 메모
    if(memoList.length){
      const colorDot = {'hl-y':'rgba(255,215,64,.8)','hl-o':'rgba(255,171,64,.8)','hl-g':'rgba(105,240,174,.8)','hl-b':'rgba(64,196,255,.8)','hl-p':'rgba(206,147,216,.8)'};
      memoList.forEach(({gid, memo, text, color})=>{
        const cls = color.split(' ').find(c=>c.startsWith('hl-'))||'hl-y';
        const dot = colorDot[cls]||'var(--gold)';
        const mData = S.hlMemo?.[gid];
        const mName = mData?.name || '메모';
        const mHtml = mData?.html || memo;
        h += `<div class="comm-ch-item"><span class="comm-ch-icon"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dot}"></span></span><div class="comm-ch-body"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">${mName}</div><div style="font-size:12px;color:var(--text2);line-height:1.6">${mHtml}</div></div></div>`;
      });
    }

    h += `</div>`;
  }

  if(!hasAny){
    h += '<div class="comm-hint" style="margin-top:20px">이 장에 주석이나 메모가 없습니다</div>';
  }

  el.innerHTML = h;

  // 선택된 구절 강조
  if(S.selV){
    const sel = el.querySelector(`.comm-ch-verse[data-v="${S.selV}"]`);
    if(sel) sel.classList.add('comm-ch-sel');
  }
}

function navByRef(ref){
  const m=ref.match(/^(.+?)\s(\d+):(\d+)$/);
  if(!m) return;
  if(typeof openBibleTab==='function') openBibleTab(m[1], parseInt(m[2]), parseInt(m[3]));
}
