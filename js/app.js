// app.js — 메인 비동기 초기화 + noteContent keydown + ESC 핸들러

// 메인 초기화 (async — 성경 데이터 로드 후 렌더링)
(async function init(){
  // 1) 동기 초기화 (데이터 불필요)
  restore();
  initTheme();
  if(typeof _stpRestoreOnLoad==='function') _stpRestoreOnLoad();
  if(typeof InputManager !== 'undefined') InputManager.init();

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

  // 2) 필수 데이터 비동기 로드 (한국어 성경 + 주석 + 레드레터 + i18n)
  var loaders = [loadBibleKR(), loadCommentary(), (typeof loadRedLetter==='function'?loadRedLetter():Promise.resolve())];
  if(typeof I18N !== 'undefined') loaders.push(I18N.init());
  await Promise.all(loaders);

  // 3) Initialize IndexedDB + StorageAdapter + LinkRegistry (non-blocking)
  if(typeof IDBStore !== 'undefined'){
    try {
      await IDBStore.open();
      if(typeof StorageAdapter !== 'undefined') await StorageAdapter.init();
      if(typeof LinkRegistry !== 'undefined'){
        await LinkRegistry.init();
        // Bulk migrate on first run if links are empty
        if(LinkRegistry.getLinkCount() === 0 && S.notes && S.notes.length > 0){
          await LinkRegistry.bulkMigrate(S.notes);
        }
      }
    } catch(e){
      console.warn('[App] IDB/LinkRegistry init failed:', e);
    }
  }

  // 3.5) Restore PDF library data
  if(typeof PDFLibrary !== 'undefined') PDFLibrary.restorePdf();

  // 4) 데이터 로드 완료 후 UI 렌더링
  setupVTip();
  initBibleTabs();
  renderAll();
  updateBreadcrumb();

  // i18n 적용 (데이터 로드 후 DOM 업데이트)
  if(typeof I18N !== 'undefined') I18N.applyI18N();

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

  // Service Worker 등록 (오프라인 지원)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').catch(function(e){
      console.warn('[SW] Registration failed:', e);
    });
  }
})();
