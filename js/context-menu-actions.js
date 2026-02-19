// Context menu actions: ctxHL, ctxClearHL, ctxNote, ctxDict, ctxCopy, ctxCopyRef, ctxInsertLink
function ctxHL(){ closeCtx(); if(!S.selV){toast('구절을 클릭 후 드래그하세요');return} applyDragHL(S.hlColor); }
function ctxClearHL(){
  closeCtx();
  if(!S.selV) return;
  const key=`${S.book}_${S.ch}_${S.selV}`;
  const row=document.querySelector(`.vrow[data-v="${S.selV}"]`);
  if(row){
    row.querySelectorAll('mark').forEach(m=>m.replaceWith(...m.childNodes));
    row.className=row.className.replace(/hl-row-\S+/g,'').trim();
  }
  // hlRanges, hlMemo도 함께 삭제
  delete S.hl[key];
  if(S.hlRanges?.[key]){
    // 이 key의 모든 gid에 대한 메모도 삭제
    (S.hlRanges[key]||[]).forEach(r=>{ if(S.hlMemo?.[r.gid]) delete S.hlMemo[r.gid]; });
    delete S.hlRanges[key];
  }
  persist();
  toast('형광펜이 지워졌어요');
}
function ctxNote(){ closeCtx(); newNote(); switchTab('notes'); }
function ctxDict(){ closeCtx(); switchTab('dictionary'); updateDict(); togglePanel('dictionary'); }
/* 구절 복사: HTML 서식(명조/돋움/볼드/이탤릭) 보존 */
function ctxCopy(){
  closeCtx();
  if(!S.selV) return;
  const t = BIBLE[S.book]?.[S.ch]?.[S.selV-1] || '';
  const plain = t.replace(/<[^>]+>/g,'');
  const ref = `${S.book} ${S.ch}:${S.selV}`;
  const html = `<b style="font-family:'KoPubWorld Dotum',sans-serif;font-size:12px;color:#c9973a;">${ref}</b><br><span class="vtxt" style="font-family:'KoPubWorld Batang','Noto Serif KR',serif;">${t}</span>`;
  try {
    navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], {type:'text/html'}),
      'text/plain': new Blob([ref+'\n'+plain], {type:'text/plain'})
    })]).then(()=> showCopyRef(ref));
  } catch(e){ navigator.clipboard.writeText(ref+'\n'+plain).then(()=> showCopyRef(ref)); }
}
/* 참조 형식 복사: 서식 포함 */
function ctxCopyRef(){
  closeCtx();
  if(!S.selV) return;
  const t = BIBLE[S.book]?.[S.ch]?.[S.selV-1] || '';
  const plain = t.replace(/<[^>]+>/g,'');
  const ref = `${S.book} ${S.ch}:${S.selV}`;
  const html = `<span style="font-family:'KoPubWorld Dotum',sans-serif;font-size:12px;color:#c9973a;">${ref}</span> — <span class="vtxt" style="font-family:'KoPubWorld Batang','Noto Serif KR',serif;">${plain}</span>`;
  try {
    navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], {type:'text/html'}),
      'text/plain': new Blob([ref+' — '+plain], {type:'text/plain'})
    })]).then(()=> toast('참조 형식으로 복사됨'));
  } catch(e){ navigator.clipboard.writeText(ref+' — '+plain).then(()=> toast('참조 형식으로 복사됨')); }
}
function ctxInsertLink(){
  closeCtx();
  if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`, ref=`${S.book} ${S.ch}:${S.selV}`;
  const nc=document.getElementById('noteContent');
  const doInsert=()=>{
    // savedRange 복원 (모달/탭 전환 후에도 커서 위치 유지)
    if(_savedRange){
      const s=window.getSelection(); s.removeAllRanges(); s.addRange(_savedRange); _savedRange=null;
    }
    insertInlineHTML(makVLink(k,ref));
    toast('구절 링크가 삽입됐어요 🔗');
  };
  if(S.panelOpen!=='notes'){ switchTab('notes'); setTimeout(doInsert,80); }
  else doInsert();
}
