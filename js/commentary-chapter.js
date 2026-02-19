// commentary-chapter.js — chapter-level commentary rendering (updateChapterCommentary)
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
