// DRAG-SELECTION HIGHLIGHT (key feature)
// ═══════════════════════════════════════════════════
// Instead of whole-verse highlight, we store per-verse color and render
// with a span wrapping the verse text.
function applyHLtoText(txt, color){
  const cls = {Y:'hl-y',O:'hl-o',G:'hl-g',B:'hl-b',P:'hl-p'}[color]||'';
  if(!cls) return txt;
  // vtxt 전체에 배경색 오버레이 방식 (내부 HTML 태그 보존)
  return txt; // 배경은 vrow CSS로 처리
}

// Drag-selection: on mouseup in the bible pane, if user has dragged,
// ask which color and wrap the selected range.
// 하이라이트 mark 클릭 → 메모 팝업
document.addEventListener('click', e=>{
  if(document.body.classList.contains('read-mode')) return;
  const mark = e.target.closest('.vtxt mark');
  if(!mark) return;
  e.stopPropagation();
  showMarkMemo(mark, e.clientX, e.clientY);
});

// 복사 이벤트: 선택된 구절이 있으면 주소 앞에 붙여서 클립보드에
document.addEventListener('copy', e=>{
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed) return;
  // vrow 안에서의 복사인지 확인
  const anchorNode = sel.anchorNode;
  const vrow = anchorNode?.parentElement?.closest('.vrow');
  if(!vrow && !anchorNode?.closest?.('.vrow')) return;

  const ref = S.selV ? `${S.book} ${S.ch}:${S.selV}\n` : '';
  const selText = sel.toString().trim();
  if(!selText) return;

  e.clipboardData.setData('text/plain', ref + selText);
  e.preventDefault();

  // 주소 토스트 표시
  if(S.selV) showCopyRef(`${S.book} ${S.ch}:${S.selV}`);
});

function showCopyRef(refStr){
  let el = document.getElementById('copyRefBadge');
  if(!el){
    el = document.createElement('div');
    el.id = 'copyRefBadge';
    el.style.cssText = `position:fixed;top:60px;left:50%;transform:translateX(-50%);
      background:var(--bg3);border:1px solid var(--gold);border-radius:8px;
      padding:6px 16px;font-size:13px;color:var(--gold);font-weight:600;
      font-family:'KoPub Batang',serif;z-index:9990;
      box-shadow:var(--shadow);pointer-events:none;
      transition:opacity .3s;`;
    document.body.appendChild(el);
  }
  el.textContent = refStr + ' 복사됨 📋';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.style.opacity='0'; }, 2000);
}

let _lastSel = null;
document.addEventListener('mouseup', e=>{
  // 읽기 모드에서는 하이라이트 비활성
  if(document.body.classList.contains('read-mode')) return;
  // Only act if inside biblePane and there's an actual selection
  const bp = document.getElementById('bibleScroll');
  if(!bp.contains(e.target)) return;

  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()) {
    _lastSel = null;
    return;
  }
  _lastSel = sel.getRangeAt(0).cloneRange();

  // Find which verse row the selection started in
  let node = sel.anchorNode;
  while(node && node.nodeType !== 1) node = node.parentNode;
  const row = node?.closest('.vrow');
  if(!row) { _lastSel = null; return; }

  // Show mini toolbar near selection
  showHLPicker(e.clientX, e.clientY, row.dataset.v);
});

// Mini HL picker popup (appears near drag selection)
let _hlPickerV = null;
// ── 하이라이트 메모 팝업 ─────────────────────────────
let _activeMark = null;
// HL Picker & Drag HL
function showHLPicker(x, y, vn){
  _hlPickerV = parseInt(vn);
  let p = document.getElementById('hlPicker');
  if(!p){
    p = document.createElement('div');
    p.id = 'hlPicker';
    p.style.cssText = `position:fixed;z-index:9998;`;
    p.innerHTML = `
      <div id="hlTrigger" style="
        width:30px;height:30px;border-radius:50%;
        background:var(--bg3);border:1px solid var(--border2);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;box-shadow:var(--shadow);transition:all .18s;
        color:var(--gold);font-size:13px;
      "><i class="fa fa-highlighter"></i></div>
      <div id="hlColors" style="
        position:absolute;left:0;top:0;
        display:flex;gap:5px;align-items:center;
        background:var(--bg3);border:1px solid var(--border2);border-radius:20px;
        padding:5px 10px;box-shadow:var(--shadow);
        opacity:0;pointer-events:none;transform:scale(.8);
        transition:opacity .15s,transform .15s;white-space:nowrap;
      ">
        <i class="fa fa-highlighter" style="font-size:11px;color:var(--gold);margin-right:2px"></i>
        <div class="hlc-dot" style="background:#FFD740" onclick="applyDragHL('Y')" title="노랑"></div>
        <div class="hlc-dot" style="background:#FFAB40" onclick="applyDragHL('O')" title="주황"></div>
        <div class="hlc-dot" style="background:#69F0AE" onclick="applyDragHL('G')" title="초록"></div>
        <div class="hlc-dot" style="background:#40C4FF" onclick="applyDragHL('B')" title="파랑"></div>
        <div class="hlc-dot" style="background:#CE93D8" onclick="applyDragHL('P')" title="보라"></div>
        <div class="hlc-dot hlc-erase" onclick="applyDragHL('E')" title="지우기">✕</div>
      </div>
    `;
    document.body.appendChild(p);

    // 호버 로직
    const trigger = p.querySelector('#hlTrigger');
    const colors = p.querySelector('#hlColors');
    let _hoverTimeout = null;

    function showColors(){
      clearTimeout(_hoverTimeout);
      trigger.style.opacity='0'; trigger.style.pointerEvents='none';
      colors.style.opacity='1'; colors.style.pointerEvents='auto'; colors.style.transform='scale(1)';
    }
    function hideColors(){
      _hoverTimeout = setTimeout(()=>{
        colors.style.opacity='0'; colors.style.pointerEvents='none'; colors.style.transform='scale(.8)';
        trigger.style.opacity='1'; trigger.style.pointerEvents='auto';
      }, 300);
    }

    trigger.addEventListener('mouseenter', showColors);
    trigger.addEventListener('click', showColors);
    colors.addEventListener('mouseenter', ()=>clearTimeout(_hoverTimeout));
    colors.addEventListener('mouseleave', hideColors);
    p.addEventListener('mouseleave', hideColors);
  }

  // 리셋: 트리거 보이기, 색상 숨기기
  const trigger = p.querySelector('#hlTrigger');
  const colors = p.querySelector('#hlColors');
  trigger.style.opacity='1'; trigger.style.pointerEvents='auto';
  colors.style.opacity='0'; colors.style.pointerEvents='none'; colors.style.transform='scale(.8)';

  p.style.left = Math.min(x, window.innerWidth-200)+'px';
  p.style.top = Math.max(y - 58, 10)+'px';
  p.style.display = 'block';

  clearTimeout(p._t);
  p._t = setTimeout(hideHLPicker, 5000);
}

// 드래그 해제(셀렉션 없어짐) 시 즉시 숨김 — 단, 피커 위 호버 중이면 유지
document.addEventListener('selectionchange', ()=>{
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()){
    const p = document.getElementById('hlPicker');
    if(p && p.style.display==='block'){
      // 피커 위에 마우스가 있으면 숨기지 않음
      if(p.matches(':hover')) return;
      hideHLPicker();
    }
  }
});

function hideHLPicker(){
  const p = document.getElementById('hlPicker');
  if(p) p.style.display='none';
  // _hlPickerV는 applyDragHL에서 사용 후 직접 초기화
}

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
