// ═══════════════════════════════════════════════════
// RENDER BIBLE
// ═══════════════════════════════════════════════════
function renderBible(){
  const vs=BIBLE[S.book]?.[S.ch]||[];
  const chTitle = document.getElementById('chTitle');
  const chSub = document.getElementById('chSub');
  const chNavLbl = document.getElementById('chNavLbl');
  const cont=document.getElementById('vCont');
  
  if(chTitle) chTitle.textContent=`${S.book} ${S.ch}장`;
  if(chSub) chSub.textContent='표준킹제임스성경 (SKJB)';
  if(chNavLbl) chNavLbl.textContent=`${S.ch} / ${CHCNT[S.book]||'?'}장`;
  
  if(!cont) return;

  if(!vs.length){
    cont.innerHTML=`<div style="text-align:center;color:var(--text3);padding:60px 0;font-size:14px;line-height:2.2"><i class="fa fa-book-open" style="font-size:36px;display:block;margin-bottom:16px"></i>이 장의 성경 데이터가 준비 중이에요.<br><span style="font-size:12px">표준킹제임스성경 66권 전권 수록</span></div>`;
    return;
  }
  cont.innerHTML='';
  vs.forEach((txt,i)=>{
    const vn=i+1; const key=`${S.book}_${S.ch}_${vn}`;
    const hlC=S.hl[key];
    const hasNote=S.notes.some(n=>n.vRefs&&n.vRefs.includes(key));
    const hasBk=S.bk.has(key);
    const hasComm=!!(COMMENTARY[S.book]?.[S.ch]?.[vn]);

    const row=document.createElement('div');
    // hlC가 있어도 mark 방식(드래그)이면 hl-row 클래스 안 붙임
    // S.hl[key]가 'MARK:색상' 형태면 mark 방식, 단순 색상이면 row 방식
    const isMarkHL = hlC && String(hlC).startsWith('MARK:');
    const hlCls = (hlC && !isMarkHL) ? ` hl-row-${hlC.toLowerCase()}` : '';
    row.className='vrow'+(S.selV===vn?' vsel':'')+hlCls;
    row.dataset.v=vn;

    // 스트롱 코드 인라인 추가
    let displayTxt = txt;
    if(S.showStrong){
      const vs = VERSE_STRONGS[key];
      if(vs){
        vs.forEach(({word, codes})=>{
          const codeSpans = codes.map(c=>`<span class="str-code" onclick="event.stopPropagation();showStrongDef('${c}')" title="${c}">${c}</span>`).join('');
          // 첫 번째 매치만 교체 (중복 방지)
          const idx = displayTxt.indexOf(word);
          if(idx >= 0){
            displayTxt = displayTxt.substring(0, idx) + word + codeSpans + displayTxt.substring(idx + word.length);
          }
        });
      }
    }

    const kjvTxt = S.showParallel ? (KJV[S.book]?.[S.ch]?.[i] || '') : '';
    if(S.showParallel && kjvTxt){
      row.className='vrow vrow-parallel'+(S.selV===vn?' vsel':'')+hlCls;
      row.innerHTML=`<span class="vnum">${vn}</span><span class="vtxt vtxt-kr" data-key="${key}">${displayTxt}</span><span class="vtxt-en-side"><span class="en-vnum">${vn}</span>${kjvTxt}</span><span class="vindic">${hasNote?'<span class="vd vd-n" title="노트 있음"></span>':''}${hasBk?'<span class="vd vd-b" title="북마크"></span>':''}${hasComm?'<span class="vd vd-c" title="주석 있음"></span>':''}</span>`;
    } else {
      row.innerHTML=`<span class="vnum">${vn}</span><span class="vtxt" data-key="${key}">${displayTxt}</span><span class="vindic">${hasNote?'<span class="vd vd-n" title="노트 있음"></span>':''}${hasBk?'<span class="vd vd-b" title="북마크"></span>':''}${hasComm?'<span class="vd vd-c" title="주석 있음"></span>':''}</span>`;
    }
    row.onclick=e=>selVerse(vn,e);
    row.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      selVerse(vn,e);
      setTimeout(()=>showCtx(e), 10);
    });
    cont.appendChild(row);
  });
  // 저장된 하이라이트 범위 복원
  requestAnimationFrame(()=>restoreHL());
}

// ── 하이라이트 복원 ──────────────────────────────────
function restoreHL(){
  const prefix = `${S.book}_${S.ch}_`;
  const entries = Object.entries(S.hlRanges||{}).filter(([k])=>k.startsWith(prefix));
  if(!entries.length) return;

  entries.forEach(([key, ranges])=>{
    const vtxtEl = document.querySelector(`.vtxt[data-key="${key}"]`);
    if(!vtxtEl) return;
    // 한 절에 여러 range: start 역순으로 적용해야 offset 불변
    const sorted = [...ranges].sort((a,b)=>b.start - a.start);
    sorted.forEach(({gid, color, start, end})=>{
      const cls = {Y:'hl-y',O:'hl-o',G:'hl-g',B:'hl-b',P:'hl-p'}[color]||'hl-y';
      applyRangeToEl(vtxtEl, start, end, cls, gid);
      // 메모 복원
      const memo = S.hlMemo?.[gid]?.text;
      if(memo){
        vtxtEl.querySelectorAll(`mark[data-gid="${gid}"]`).forEach(m=>{
          m.dataset.memo = memo;
          m.style.borderBottom = '2px dotted var(--gold)';
        });
      }
    });
  });
}

function applyRangeToEl(el, start, end, cls, gid){
  // 1단계: 텍스트 노드 목록과 각 노드의 시작 오프셋을 미리 수집
  const nodes = [];
  let offset = 0;
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n = tw.nextNode();
  while(n){
    nodes.push({node: n, from: offset});
    offset += n.length;
    n = tw.nextNode();
  }

  // 2단계: 범위에 걸치는 노드만 추출
  const targets = nodes.filter(({node, from}) => {
    const to = from + node.length;
    return to > start && from < end && node.parentNode?.nodeName !== 'MARK';
  });
  if(!targets.length) return;

  // 3단계: 역순으로 처리 (splitText가 뒷 노드 오프셋에 영향 없게)
  [...targets].reverse().forEach(({node, from}) => {
    const localStart = Math.max(0, start - from);
    const localEnd   = Math.min(node.length, end - from);
    if(localStart >= localEnd) return;

    let target = node;
    if(localStart > 0) target = node.splitText(localStart);
    if(localEnd - localStart < target.length) target.splitText(localEnd - localStart);

    const mark = document.createElement('mark');
    mark.className = cls;
    mark.dataset.gid = gid;
    target.parentNode.insertBefore(mark, target);
    mark.appendChild(target);
  });
}
// ─────────────────────────────────────────────────────

// el 내부에서 targetNode의 targetOffset까지 textContent 오프셋 계산
function getTextOffset(el, targetNode, targetOffset){
  let total = 0;
  function walk(node){
    if(node === targetNode){
      total += targetOffset;
      return true; // 완료
    }
    if(node.nodeType === Node.TEXT_NODE){
      total += node.length;
    } else {
      for(const child of node.childNodes){
        if(walk(child)) return true;
      }
    }
    return false;
  }
  return walk(el) ? total : -1;
}

// ═══════════════════════════════════════════════════
