// context-menu-actions.js — 컨텍스트 메뉴 액션 (다중 선택 복사 지원)
function ctxHL(){ closeCtx(); if(!S.selV){toast('구절을 클릭 후 드래그하세요');return} applyDragHL(S.hlColor); }
function ctxClearHL(){
  closeCtx(); if(!S.selV) return;
  const key=`${S.book}_${S.ch}_${S.selV}`;
  const row=document.querySelector(`.vrow[data-v="${S.selV}"]`);
  if(row){ row.querySelectorAll('mark').forEach(m=>m.replaceWith(...m.childNodes)); row.className=row.className.replace(/hl-row-\S+/g,'').trim(); }
  delete S.hl[key];
  if(S.hlRanges?.[key]){ (S.hlRanges[key]||[]).forEach(r=>{if(S.hlMemo?.[r.gid]) delete S.hlMemo[r.gid];}); delete S.hlRanges[key]; }
  persist(); toast('형광펜이 지워졌어요');
}
function ctxNote(){ closeCtx(); newNote(); switchTab('notes'); }
function ctxDict(){ closeCtx(); switchTab('dictionary'); updateDict(); togglePanel('dictionary'); }
function ctxCopy(){
  closeCtx(); const arr=_getSelVerses(); if(!arr.length) return;
  const {html,plain}=_buildCopyData(arr);
  _writeClip(html,plain,(arr.length>1?arr.length+'개 구절':`${S.book} ${S.ch}:${arr[0]}`)+' 복사됨 📋');
}
function ctxCopyRef(){
  closeCtx(); const arr=_getSelVerses(); if(!arr.length) return;
  const {html,plain}=_buildCopyRefData(arr);
  _writeClip(html,plain,'참조 형식으로 복사됨');
}
function ctxInsertLink(){
  closeCtx(); if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`, ref=`${S.book} ${S.ch}:${S.selV}`;
  const doInsert=()=>{
    if(_savedRange){const s=window.getSelection();s.removeAllRanges();s.addRange(_savedRange);_savedRange=null;}
    insertInlineHTML(makVLink(k,ref)); toast('구절 링크가 삽입됐어요 🔗');
  };
  if(S.panelOpen!=='notes'){switchTab('notes');setTimeout(doInsert,80);} else doInsert();
}
