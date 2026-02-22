// firebase-sync-load.js — Firestore 데이터 로드 + 첫 로그인 마이그레이션
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { setLastTimestamps } from './firebase-sync-listen.js';

export async function loadFromFirestore(db, uid){
  try {
    const [mainSnap, notesSnap] = await Promise.all([
      getDoc(doc(db,'users',uid,'data','main')),
      getDoc(doc(db,'users',uid,'data','notes'))
    ]);
    const S=window.S;
    if(mainSnap.exists()){
      const d=mainSnap.data();
      if(d.hl) S.hl=d.hl; if(d.hlMemo) S.hlMemo=d.hlMemo;
      if(d.hlRanges) S.hlRanges=d.hlRanges; if(d.verseMemo) S.verseMemo=d.verseMemo;
      if(d.bk) S.bk=new Set(d.bk); if(d.folders) S.folders=d.folders;
      if(d.openFolders) S.openFolders=new Set(d.openFolders);
      setLastTimestamps(d.updatedAt, 0);
    }
    if(notesSnap.exists()){
      const d=notesSnap.data();
      if(d.notes) S.notes=d.notes;
      setLastTimestamps(null, d.updatedAt);
    }
    if(!mainSnap.exists() && !notesSnap.exists()){
      // 첫 로그인: localStorage → Firestore 마이그레이션
      const now=Date.now();
      await setDoc(doc(db,'users',uid,'data','main'),{
        hl:S.hl||{},hlMemo:S.hlMemo||{},hlRanges:S.hlRanges||{},verseMemo:S.verseMemo||{},
        bk:[...(S.bk||[])],folders:S.folders||[],openFolders:[...(S.openFolders||[])],updatedAt:now
      });
      await setDoc(doc(db,'users',uid,'data','notes'),{notes:S.notes||[],updatedAt:now});
    }
    window._firebaseReady=true;
    window.renderAll?.();
    return true;
  } catch(e){ console.error('Firestore 로드 실패:',e); return false; }
}
