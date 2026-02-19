// firebase-sync.js — 디바운스 클라우드 저장 + persistToCloud 조율
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let _db=null, _uid=null, _timerMain=null, _timerNotes=null;

export function initSync(db, uid){ _db=db; _uid=uid; }
export function clearSync(){ _db=null; _uid=null; clearTimeout(_timerMain); clearTimeout(_timerNotes); }

async function _saveMain(){
  if(!_db||!_uid) return;
  const S=window.S;
  window._setSyncStatus?.('syncing');
  try {
    await setDoc(doc(_db,'users',_uid,'data','main'),{
      hl:S.hl||{}, hlMemo:S.hlMemo||{}, hlRanges:S.hlRanges||{}, verseMemo:S.verseMemo||{},
      bk:[...(S.bk||[])], folders:S.folders||[], openFolders:[...(S.openFolders||[])], updatedAt:Date.now()
    });
    window._setSyncStatus?.('synced');
    window._updateQuotaAfterSave?.();
  } catch(e){ console.error('main 저장 실패:',e); window._setSyncStatus?.('error'); }
}
async function _saveNotes(){
  if(!_db||!_uid) return;
  window._setSyncStatus?.('syncing');
  try {
    await setDoc(doc(_db,'users',_uid,'data','notes'),{notes:window.S.notes||[], updatedAt:Date.now()});
    window._setSyncStatus?.('synced');
  } catch(e){ console.error('notes 저장 실패:',e); window._setSyncStatus?.('error'); }
}

export function persistToCloud(){ clearTimeout(_timerMain); clearTimeout(_timerNotes); _timerMain=setTimeout(_saveMain,2000); _timerNotes=setTimeout(_saveNotes,2000); }
export function flushPendingSaves(){ clearTimeout(_timerMain); clearTimeout(_timerNotes); _saveMain(); _saveNotes(); }
