// context-menu-actions.js — 컨텍스트 메뉴 액션 (다중 선택 복사 지원)
function ctxHL(){ closeCtx(); if(!S.selV){toast(t('ctx.drag'));return} applyDragHL(S.hlColor); }
function ctxClearHL(){
  closeCtx(); if(!S.selV) return;
  const key=`${S.book}_${S.ch}_${S.selV}`;
  const row=document.querySelector(`.vrow[data-v="${S.selV}"]`);
  if(row){ row.querySelectorAll('mark').forEach(m=>m.replaceWith(...m.childNodes)); row.className=row.className.replace(/hl-row-\S+/g,'').trim(); }
  delete S.hl[key];
  if(S.hlRanges?.[key]){ (S.hlRanges[key]||[]).forEach(r=>{if(S.hlMemo?.[r.gid]) delete S.hlMemo[r.gid];}); delete S.hlRanges[key]; }
  persist(); toast(t('ctx.hl.del'));
}
function ctxNote(){ closeCtx(); newNote(); switchTab('notes'); }
function ctxDict(){ closeCtx(); switchTab('dictionary'); updateDict(); togglePanel('dictionary'); }
function ctxCopy(){
  closeCtx(); const arr=_getSelVerses(); if(!arr.length) return;
  const {html,plain}=_buildCopyData(arr);
  _writeClip(html,plain,(arr.length>1?arr.length+t('ctx.verses'):`${S.book} ${S.ch}:${arr[0]}`)+' '+t('copied'));
}
function ctxCopyRef(){
  closeCtx(); const arr=_getSelVerses(); if(!arr.length) return;
  const {html,plain}=_buildCopyRefData(arr);
  _writeClip(html,plain,t('ctx.ref.copied'));
}
function ctxInsertLink(){
  closeCtx(); if(!S.selV){toast(t('ctx.click.first'));return}
  const k=`${S.book}_${S.ch}_${S.selV}`, ref=`${S.book} ${S.ch}:${S.selV}`;
  const doInsert=()=>{
    if(_savedRange){const s=window.getSelection();s.removeAllRanges();s.addRange(_savedRange);_savedRange=null;}
    insertInlineHTML(makVLink(k,ref)); toast(t('ctx.link.done'));
  };
  if(S.panelOpen!=='notes'){switchTab('notes');setTimeout(doInsert,80);} else doInsert();
}
