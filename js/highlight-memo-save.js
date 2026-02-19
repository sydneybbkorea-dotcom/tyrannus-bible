// highlight-memo-save.js — 메모 저장/삭제/닫기
function _closeMemoOutside(e){
  const popup = document.getElementById('markMemoPopup');
  const noteSearch = document.getElementById('memoNoteSearchPopup');
  if(noteSearch && noteSearch.contains(e.target)) return;
  if(popup && !popup.contains(e.target)){
    closeMarkMemo();
    document.removeEventListener('mousedown', _closeMemoOutside);
  }
}
function closeMarkMemo(){
  const popup = document.getElementById('markMemoPopup');
  if(popup) popup.style.display = 'none';
  if(_activeMark){
    document.querySelectorAll('mark.hl-active').forEach(m => m.classList.remove('hl-active'));
    _activeMark = null;
  }
  document.removeEventListener('mousedown', _closeMemoOutside);
}
function saveMarkMemo(){
  if(!_activeMark) return;
  const ta = document.getElementById('markMemoText');
  const text = ta?.textContent?.trim() || '';
  const html = ta?.innerHTML || '';
  const name = document.getElementById('markMemoName')?.value?.trim() || '';
  const gid = _activeMark.dataset.gid;
  const targets = gid
    ? [...document.querySelectorAll(`mark[data-gid="${gid}"]`)]
    : [_activeMark];
  targets.forEach(m => {
    m.dataset.memo = text;
    m.style.borderBottom = text ? '2px dotted var(--gold)' : '';
  });
  const vrow = _activeMark.closest('.vrow');
  if(vrow){
    const vn = parseInt(vrow.dataset.v);
    const key = `${S.book}_${S.ch}_${vn}`;
    if(!S.hlMemo) S.hlMemo = {};
    if(gid){
      if(text || _memoTags.length || name){
        S.hlMemo[gid] = { key, text, html, gid, tags:[..._memoTags], name };
      } else {
        delete S.hlMemo[gid];
      }
    }
  }
  closeMarkMemo();
  if(S.panelOpen === 'commentary') updateComm();
  persist();
  toast('메모가 저장됐어요 ✓');
}
function deleteMarkHL(){
  if(!_activeMark) return;
  const gid = _activeMark.dataset.gid;
  const vrow = _activeMark.closest('.vrow');
  const targets = gid
    ? [...document.querySelectorAll(`mark[data-gid="${gid}"]`)]
    : [_activeMark];
  targets.forEach(m => m.replaceWith(...m.childNodes));
  if(S.hlRanges){
    Object.keys(S.hlRanges).forEach(k=>{
      S.hlRanges[k] = (S.hlRanges[k]||[]).filter(r=>r.gid!==gid);
      if(!S.hlRanges[k].length) delete S.hlRanges[k];
    });
  }
  if(vrow){
    const key = `${S.book}_${S.ch}_${vrow.dataset.v}`;
    if(!S.hlRanges?.[key]?.length) delete S.hl[key];
  }
  closeMarkMemo();
  persist();
  toast('하이라이트가 지워졌어요');
}
