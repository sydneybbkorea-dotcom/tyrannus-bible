// firebase.js — Firebase core: 초기화, 인증, 모듈 조율 (sync/quota는 별도 모듈)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { initSync, persistToCloud, flushPendingSaves, clearSync } from './firebase-sync.js';
import { startRealtimeSync, stopRealtimeSync } from './firebase-sync-listen.js';
import { loadFromFirestore } from './firebase-sync-load.js';
import { setSyncStatus, initOnlineListener } from './firebase-sync-status.js';
import { loadQuota, initQuota, updateQuotaUsage } from './firebase-quota.js';
import { initPdfSync, clearPdfSync, loadPdfFromFirestore, startPdfRealtimeSync, stopPdfRealtimeSync, flushPdfSaves } from './firebase-pdf-sync.js';
import { initShare, clearShare, startSharedListeners, stopSharedListeners } from './share.js';
import { initLiveSync, clearLiveSync } from './pdf-live-sync.js';

const app = initializeApp({
  apiKey:"AIzaSyDMeWQk6o39IcctkLERX7b6uWWXXTJST30", authDomain:"tyrannus-kjb1611.firebaseapp.com",
  projectId:"tyrannus-kjb1611", storageBucket:"tyrannus-kjb1611.firebasestorage.app",
  messagingSenderId:"86251720686", appId:"1:86251720686:web:bac7cde382e99dcfe588ff"
});
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);
window._firebaseAuth = auth;

// ── Firestore DB 브릿지 (관리자 패널 등 외부에서 사용)
window._firebaseDB = db;
window._fbFn = { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, onSnapshot };

// 온라인/오프라인 감지 초기화
initOnlineListener(function(){ flushPendingSaves(); flushPdfSaves(); });

// ── 로그인 상태 감지
onAuthStateChanged(auth, async user => {
  if(user){
    initSync(db, user.uid);
    initPdfSync(db, storage, user.uid);
    initQuota(db, user.uid);
    initShare(db, user.uid);
    initLiveSync(db, storage, user.uid);
    window._firebaseUid = user.uid;
    console.log('[Admin] Your UID:', user.uid);
    window.showUserBar?.(user);
    await loadQuota(db, user.uid);
    await loadFromFirestore(db, user.uid);
    await loadPdfFromFirestore(db, user.uid);
    startRealtimeSync(db, user.uid);
    startPdfRealtimeSync(db, user.uid);
    startSharedListeners();
    await updateQuotaUsage();
    window.updateQuotaDisplay?.(window.getQuotaInfo?.().used, window.getQuotaInfo?.().limit);
    setSyncStatus('synced');
    // ── 서버 테마 기본값 적용 (사용자 미커스텀 시)
    if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.fetchServerDefaults){
      ThemeSwitcher.fetchServerDefaults();
    }
    // ── 관리자 감지: admins/{uid} 문서 존재 확인
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if(adminDoc.exists()){
        window._isAdmin = true;
        console.log('[Admin] 관리자 권한 확인됨');
        if(typeof window._initAdminPanel === 'function') window._initAdminPanel();
      } else {
        window._isAdmin = false;
      }
    } catch(e){ window._isAdmin = false; }
    // URL 파라미터 ?share= 감지
    const shareParam = new URLSearchParams(window.location.search).get('share');
    if(shareParam) {
      window._handleShareJoin?.(shareParam);
      // URL에서 share 파라미터 제거
      const url = new URL(window.location);
      url.searchParams.delete('share');
      window.history.replaceState({}, '', url);
    }
    // URL 파라미터 ?live= 감지
    const liveParam = new URLSearchParams(window.location.search).get('live');
    if(liveParam) {
      if(typeof PDFLive !== 'undefined') PDFLive.handleLiveParam(liveParam);
      const url2 = new URL(window.location);
      url2.searchParams.delete('live');
      window.history.replaceState({}, '', url2);
    }
  } else {
    clearSync(); clearPdfSync(); clearShare(); clearLiveSync(); stopRealtimeSync(); stopPdfRealtimeSync(); stopSharedListeners();
    window._firebaseReady = false;
    window._firebaseUid = null;
    window._isAdmin = false;
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
