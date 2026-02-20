// bible-renderer-hl.js — highlight restoration: restoreHL(), applyRangeToEl(), getTextOffset()

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
  // .vnum 내부 텍스트는 건너뜀 (구절번호는 하이라이트 대상 아님)
  const nodes = [];
  let offset = 0;
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if(node.parentNode && node.parentNode.classList && node.parentNode.classList.contains('vnum')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
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
// .vnum 내부는 건너뜀
function getTextOffset(el, targetNode, targetOffset){
  let total = 0;
  function walk(node){
    if(node === targetNode){
      total += targetOffset;
      return true;
    }
    // .vnum 내부는 건너뜀
    if(node.classList && node.classList.contains('vnum')) return false;
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
