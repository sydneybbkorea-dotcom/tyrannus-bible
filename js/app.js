// ═══════════════════════════════════════════════════
// INIT — 비동기 데이터 로딩 후 초기화
// ═══════════════════════════════════════════════════

// PASTE — 순수 텍스트만 붙여넣기
document.addEventListener('DOMContentLoaded', ()=>{
  const nc=document.getElementById('noteContent');
  if(!nc) return;
  nc.addEventListener('paste', e=>{
    e.preventDefault();
    let text=(e.clipboardData||window.clipboardData).getData('text/plain');
    if(!text){
      const h=(e.clipboardData||window.clipboardData).getData('text/html');
      const tmp=document.createElement('div'); tmp.innerHTML=h;
      text=tmp.textContent||tmp.innerText||'';
    }
    document.execCommand('insertText',false,text);
  });
});

// 메인 초기화 (async — 성경 데이터 로드 후 렌더링)
(async function init(){
  // 1) 동기 초기화 (데이터 불필요)
  restore();
  initTheme();

  // 테스트 하이라이트 초기화 (v10)
  if(localStorage.getItem('kjb2-hl-cleaned') !== 'v10'){
    S.hl = {}; S.hlRanges = {}; S.hlMemo = {};
    try{
      const d = JSON.parse(localStorage.getItem('kjb2') || '{}');
      d.hl = {}; d.hlRanges = {}; d.hlMemo = {};
      localStorage.setItem('kjb2', JSON.stringify(d));
    }catch(e){}
    localStorage.setItem('kjb2-hl-cleaned', 'v10');
  }

  S.explorerOpen = false;

  // 2) 필수 데이터 비동기 로드 (한국어 성경 + 주석)
  await Promise.all([loadBibleKR(), loadCommentary()]);

  // 3) 데이터 로드 완료 후 UI 렌더링
  setupVTip();
  initBibleTabs();
  renderAll();
  updateBreadcrumb();

  // noteContent: contenteditable=false 블록 삭제 핸들러
  const nc = document.getElementById('noteContent');
  if(nc) nc.addEventListener('keydown', function(e){
    if(e.key !== 'Backspace' && e.key !== 'Delete') return;
    const sel = window.getSelection();
    if(!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if(!range.collapsed) return;
    let node = range.startContainer;
    let offset = range.startOffset;
    let target = null;
    if(e.key === 'Backspace' && offset === 0){
      const prev = node.previousSibling || node.parentNode?.previousSibling;
      if(prev && prev.contentEditable === 'false') target = prev;
    } else if(e.key === 'Delete'){
      const next = node.nextSibling || node.parentNode?.nextSibling;
      if(next && next.contentEditable === 'false') target = next;
    }
    if(target){ e.preventDefault(); target.parentNode?.removeChild(target); }
  });

  // ESC 키 핸들러
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ closeCtx(); closeExplorer(); hideHLPicker(); }
  });
})();
