// Highlight core: applyHLtoText, mark click handler, copy handler, showCopyRef
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
      font-family:'KoPubWorld Dotum','Noto Sans KR',sans-serif;z-index:9990;
      box-shadow:var(--shadow);pointer-events:none;
      transition:opacity .3s;`;
    document.body.appendChild(el);
  }
  el.textContent = refStr + ' 복사됨 📋';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.style.opacity='0'; }, 2000);
}
