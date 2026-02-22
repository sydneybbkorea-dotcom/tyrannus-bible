// firebase-quota.js — 클라우드 저장 용량 계산, 제한 검사, quota 문서 관리
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let _quota = { limit:10485760, used:0, tier:'free' }; // 기본 10MB
let _db=null, _uid=null;

export function initQuota(db,uid){ _db=db; _uid=uid; }
export function getQuota(){ return {..._quota}; }

export function calculateDataSize(){
  const S=window.S;
  const all={hl:S.hl||{},hlMemo:S.hlMemo||{},hlRanges:S.hlRanges||{},verseMemo:S.verseMemo||{},
    bk:[...(S.bk||[])],notes:S.notes||[],folders:S.folders||[],openFolders:[...(S.openFolders||[])],
    pdfFolders:S.pdfFolders||[],pdfFiles:S.pdfFiles||[]};
  return new Blob([JSON.stringify(all)]).size;
}

export async function loadQuota(db,uid){
  _db=db; _uid=uid;
  try {
    const snap=await getDoc(doc(db,'users',uid,'profile','quota'));
    if(snap.exists()){ const d=snap.data(); _quota={limit:d.limit||10485760,used:d.used||0,tier:d.tier||'free'}; }
    else { await setDoc(doc(db,'users',uid,'profile','quota'),{limit:10485760,used:0,tier:'free',updatedAt:Date.now()}); }
  } catch(e){ console.error('quota 로드 실패:',e); }
}

export async function updateQuotaUsage(){
  if(!_db||!_uid) return;
  _quota.used=calculateDataSize();
  try { await setDoc(doc(_db,'users',_uid,'profile','quota'),{..._quota,updatedAt:Date.now()}); } catch(e){}
  window.updateQuotaDisplay?.(_quota.used,_quota.limit);
}

export function checkQuotaBeforeSave(){
  const size=calculateDataSize();
  if(size>_quota.limit){ window.toast?.('저장 공간이 부족합니다. 데이터를 정리하거나 업그레이드하세요.'); window._setSyncStatus?.('error'); return false; }
  return true;
}

window._updateQuotaAfterSave = updateQuotaUsage;
window.checkQuotaBeforeSave = checkQuotaBeforeSave;
window.getQuotaInfo = getQuota;
window.calculateDataSize = calculateDataSize;
