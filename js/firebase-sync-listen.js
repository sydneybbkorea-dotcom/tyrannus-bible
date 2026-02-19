// firebase-sync-listen.js — Firestore 실시간 동기화 리스너 (다기기 지원)
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let _unsub1=null, _unsub2=null, _lastMainTs=0, _lastNotesTs=0;

export function startRealtimeSync(db, uid){
  stopRealtimeSync();
  _unsub1 = onSnapshot(doc(db,'users',uid,'data','main'), snap=>{
    if(!snap.exists() || snap.metadata.hasPendingWrites) return; // 자기 저장 무시
    const d=snap.data(); if(!d.updatedAt || d.updatedAt<=_lastMainTs) return;
    _lastMainTs=d.updatedAt; const S=window.S;
    if(d.hl) S.hl=d.hl; if(d.hlMemo) S.hlMemo=d.hlMemo;
    if(d.hlRanges) S.hlRanges=d.hlRanges; if(d.verseMemo) S.verseMemo=d.verseMemo;
    if(d.bk) S.bk=new Set(d.bk); if(d.folders) S.folders=d.folders;
    if(d.openFolders) S.openFolders=new Set(d.openFolders);
    window.renderAll?.(); window._setSyncStatus?.('synced');
  });
  _unsub2 = onSnapshot(doc(db,'users',uid,'data','notes'), snap=>{
    if(!snap.exists() || snap.metadata.hasPendingWrites) return;
    const d=snap.data(); if(!d.updatedAt || d.updatedAt<=_lastNotesTs) return;
    _lastNotesTs=d.updatedAt; window.S.notes=d.notes||[];
    window.renderAll?.(); window._setSyncStatus?.('synced');
  });
}

export function stopRealtimeSync(){ if(_unsub1){_unsub1();_unsub1=null;} if(_unsub2){_unsub2();_unsub2=null;} _lastMainTs=0; _lastNotesTs=0; }
export function setLastTimestamps(main,notes){ if(main!=null) _lastMainTs=main; if(notes!=null) _lastNotesTs=notes; }
