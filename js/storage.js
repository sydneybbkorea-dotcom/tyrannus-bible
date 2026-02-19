function persist(){
  // localStorage (오프라인 백업)
  try { localStorage.setItem('kjb2',JSON.stringify({hl:S.hl,hlMemo:S.hlMemo||{},hlRanges:S.hlRanges||{},verseMemo:S.verseMemo||{},bk:[...S.bk],notes:S.notes,folders:S.folders,openFolders:[...S.openFolders]})); } catch(e){}
  // Firestore (로그인 시 클라우드 저장 — 용량 체크 후)
  if(window.persistToCloud && window._firebaseReady){
    if(window.checkQuotaBeforeSave && !window.checkQuotaBeforeSave()) return;
    window.persistToCloud();
  }
  updateStat();
}
window.restore = function restore(){
  try {
    const d=JSON.parse(localStorage.getItem('kjb2')||'{}');
    if(d.hl) S.hl=d.hl;
    if(d.hlMemo) S.hlMemo=d.hlMemo;
    if(d.hlRanges) S.hlRanges=d.hlRanges;
    if(d.verseMemo) S.verseMemo=d.verseMemo;
    if(d.bk) S.bk=new Set(d.bk);
    if(d.notes) S.notes=d.notes;
    if(d.folders) S.folders=d.folders;
    if(d.openFolders) S.openFolders=new Set(d.openFolders);
  } catch(e){}
}
