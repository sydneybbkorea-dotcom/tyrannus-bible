// firebase-sync-status.js — 동기화 상태 관리 + 온라인/오프라인 감지
let _status = 'synced';

export function setSyncStatus(s){
  _status = s;
  window.updateSyncBadge?.(s);
}

export function getSyncStatus(){ return _status; }

export function initOnlineListener(flushFn){
  window.addEventListener('online', ()=>{ setSyncStatus('syncing'); if(flushFn) flushFn(); });
  window.addEventListener('offline', ()=>{ setSyncStatus('offline'); });
  if(!navigator.onLine) setSyncStatus('offline');
}

window._setSyncStatus = setSyncStatus;
