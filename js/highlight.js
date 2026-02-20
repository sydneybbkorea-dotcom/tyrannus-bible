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
  if(document.body.classList.contains('hide-hl')) return;
  const mark = e.target.closest('.vtxt mark');
  if(!mark) return;
  e.stopPropagation();
  showMarkMemo(mark, e.clientX, e.clientY);
});

// 복사 이벤트: 성경 본문 서식(명조/돋움/볼드/이탤릭)을 HTML로 보존
document.addEventListener('copy', e=>{
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed) return;
  const anchorNode = sel.anchorNode;
  const vrow = anchorNode?.parentElement?.closest('.vrow');
  if(!vrow && !anchorNode?.closest?.('.vrow')) return;

  const selText = sel.toString().trim();
  if(!selText) return;

  /* 다중 선택 시: 각 구절에 책,장,절 표시 */
  const arr = _getSelVerses ? _getSelVerses() : (S.selV ? [S.selV] : []);
  if(arr.length > 1){
    const {html,plain} = _buildCopyData(arr);
    e.clipboardData.setData('text/html', html);
    e.clipboardData.setData('text/plain', plain);
    e.preventDefault();
    showCopyRef(`${arr.length}${t('ctx.verses')} ${t('copied')}`);
    return;
  }
  /* 단일 선택: 기존 방식(드래그 서식 보존) */
  const ref = S.selV ? `${S.book} ${S.ch}:${S.selV}` : '';
  const range = sel.getRangeAt(0);
  const frag = range.cloneContents();
  const wrap = document.createElement('span');
  wrap.className = 'vtxt';
  wrap.style.cssText = "font-family:'KoPubWorld Batang','Noto Serif KR',serif;";
  wrap.appendChild(frag);
  const refHtml = ref ? `<b style="font-family:'KoPubWorld Dotum','Noto Sans KR',sans-serif;font-size:12px;color:#c9973a;">${ref}</b><br>` : '';
  e.clipboardData.setData('text/html', refHtml + wrap.outerHTML);
  e.clipboardData.setData('text/plain', (ref ? ref + '\n' : '') + selText);
  e.preventDefault();
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
  el.textContent = refStr + ' ' + t('copied');
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.style.opacity='0'; }, 2000);
}
