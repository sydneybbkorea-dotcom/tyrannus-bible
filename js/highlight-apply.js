// Highlight apply logic: wrapRangeWithMark, applyDragHL, pickHL

// 텍스트 노드를 mark로 감싸는 핵심 함수 (교차 태그에도 안전)
function wrapRangeWithMark(range, cls, groupId){
  const treeWalker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    { acceptNode: n => range.intersectsNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
  );
  const nodes = [];
  if(range.commonAncestorContainer.nodeType === Node.TEXT_NODE){
    nodes.push(range.commonAncestorContainer);
  } else {
    let n = treeWalker.nextNode();
    while(n){ nodes.push(n); n = treeWalker.nextNode(); }
  }

  nodes.forEach(textNode => {
    if(textNode.parentNode?.nodeName === 'MARK') return;

    let start = 0, end = textNode.length;
    if(textNode === range.startContainer) start = range.startOffset;
    if(textNode === range.endContainer)   end   = range.endOffset;
    if(start >= end) return;

    const selected = textNode.splitText(start);
    if(end - start < selected.length) selected.splitText(end - start);

    const mark = document.createElement('mark');
    mark.className = cls;
    // 같은 드래그로 생성된 mark를 그룹으로 묶음
    if(groupId) mark.dataset.gid = groupId;
    selected.parentNode.insertBefore(mark, selected);
    mark.appendChild(selected);
  });
}

function applyDragHL(color){
  const savedSel = _lastSel; // hideHLPicker 호출 전에 저장
  hideHLPicker();
  window.getSelection()?.removeAllRanges();
  if(!_hlPickerV){ _lastSel = null; return; }

  const key = `${S.book}_${S.ch}_${_hlPickerV}`;
  const cls = {Y:'hl-y',O:'hl-o',G:'hl-g',B:'hl-b',P:'hl-p'}[color] || '';

  if(color === 'E'){
    // 지우기: 해당 vrow 안의 모든 mark 태그 제거
    const row = document.querySelector(`.vrow[data-v="${_hlPickerV}"]`);
    if(row){
      row.querySelectorAll('mark').forEach(m => {
        m.replaceWith(...m.childNodes);
      });
    }
    delete S.hl[key];
  } else if(savedSel && cls){
    // 드래그 범위만 mark로 감싸기
    try{
      const gid = 'g' + Date.now();
      // ★ wrapRangeWithMark 전에 오프셋 저장 (DOM 변경 전이어야 정확)
      const vtxtEl = document.querySelector(`.vtxt[data-key="${key}"]`);
      let rangeStart = -1, rangeEnd = -1;
      if(vtxtEl){
        rangeStart = getTextOffset(vtxtEl, savedSel.startContainer, savedSel.startOffset);
        rangeEnd   = getTextOffset(vtxtEl, savedSel.endContainer,   savedSel.endOffset);
      }
      wrapRangeWithMark(savedSel, cls, gid);
      S.hl[key] = 'MARK:' + color;
      // 오프셋 저장
      if(rangeStart >= 0 && rangeEnd > rangeStart){
        if(!S.hlRanges[key]) S.hlRanges[key] = [];
        S.hlRanges[key] = S.hlRanges[key].filter(r=>r.gid!==gid);
        S.hlRanges[key].push({gid, color, start:rangeStart, end:rangeEnd});
      }
    } catch(err){
      // 실패 시 vrow 전체 배경 fallback
      const row = document.querySelector(`.vrow[data-v="${_hlPickerV}"]`);
      if(row){ row.className = row.className.replace(/hl-row-\S+/g,'').trim(); row.classList.add('hl-row-'+color.toLowerCase()); }
      S.hl[key] = color;
    }
  }

  _lastSel = null;
  _hlPickerV = null;
  persist();
  toast(color==='E'?'형광펜이 지워졌어요':'형광펜이 적용됐어요 ✓');
}

// fallback: color picker buttons in topbar still work on selected verse
function pickHL(c, el){
  S.hlColor=c;
  document.querySelectorAll('.hldot').forEach(d=>d.classList.remove('on'));
  el.classList.add('on');
  // if a verse is selected, apply immediately
  if(S.selV){
    applyDragHL(c);
    return;
  }
  toast('구절을 클릭하거나 드래그하여 형광펜을 적용하세요');
}
