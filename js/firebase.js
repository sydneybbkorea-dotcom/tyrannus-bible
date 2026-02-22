// firebase.js — Firebase core: 초기화, 인증, 모듈 조율 (sync/quota는 별도 모듈)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { initSync, persistToCloud, flushPendingSaves, clearSync } from './firebase-sync.js';
import { startRealtimeSync, stopRealtimeSync } from './firebase-sync-listen.js';
import { loadFromFirestore } from './firebase-sync-load.js';
import { setSyncStatus, initOnlineListener } from './firebase-sync-status.js';
import { loadQuota, initQuota, updateQuotaUsage } from './firebase-quota.js';
import { initPdfSync, clearPdfSync, loadPdfFromFirestore, startPdfRealtimeSync, stopPdfRealtimeSync, flushPdfSaves } from './firebase-pdf-sync.js';

const app = initializeApp({
  apiKey:"AIzaSyDMeWQk6o39IcctkLERX7b6uWWXXTJST30", authDomain:"tyrannus-kjb1611.firebaseapp.com",
  projectId:"tyrannus-kjb1611", storageBucket:"tyrannus-kjb1611.firebasestorage.app",
  messagingSenderId:"86251720686", appId:"1:86251720686:web:bac7cde382e99dcfe588ff"
});
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// 온라인/오프라인 감지 초기화
initOnlineListener(function(){ flushPendingSaves(); flushPdfSaves(); });

// ── 로그인 상태 감지
onAuthStateChanged(auth, async user => {
  if(user){
    initSync(db, user.uid);
    initPdfSync(db, storage, user.uid);
    initQuota(db, user.uid);
    window.showUserBar?.(user);
    await loadQuota(db, user.uid);
    await loadFromFirestore(db, user.uid);
    await loadPdfFromFirestore(db, user.uid);
    startRealtimeSync(db, user.uid);
    startPdfRealtimeSync(db, user.uid);
    await updateQuotaUsage();
    window.updateQuotaDisplay?.(window.getQuotaInfo?.().used, window.getQuotaInfo?.().limit);
    setSyncStatus('synced');
  } else {
    clearSync(); clearPdfSync(); stopRealtimeSync(); stopPdfRealtimeSync();
    window._firebaseReady = false;
    window.hideUserBar?.();
    if(window.restore) window.restore();
    if(window.renderAll) window.renderAll();
    setSyncStatus('offline');
  }
});

// ── persistToCloud를 window에 노출 (storage.js에서 호출)
window.persistToCloud = persistToCloud;

// ── Google 로그인 / 로그아웃
window.signInWithGoogle = async () => {
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch(e){ console.error('로그인 실패:', e); }
};
window.signOutUser = async () => { await signOut(auth); };
