// firebase.js — Firebase core: auth, Firestore sync, login/logout
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyDMeWQk6o39IcctkLERX7b6uWWXXTJST30",
  authDomain:        "tyrannus-kjb1611.firebaseapp.com",
  projectId:         "tyrannus-kjb1611",
  storageBucket:     "tyrannus-kjb1611.firebasestorage.app",
  messagingSenderId: "86251720686",
  appId:             "1:86251720686:web:bac7cde382e99dcfe588ff"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let _uid = null;
let _unsubscribe = null;

// ── 로그인 상태 감지
onAuthStateChanged(auth, async user => {
  if(user){
    _uid = user.uid;
    window.showUserBar(user);
    await loadFromFirestore();
    startRealtimeSync();
  } else {
    _uid = null;
    window.hideUserBar();
    if(_unsubscribe){ _unsubscribe(); _unsubscribe = null; }
    // 로그아웃 시 로컬 데이터로 복원
    window._firebaseReady = false;
    if(window.restore) window.restore();
    if(window.renderAll) window.renderAll();
  }
});

// ── Firestore에서 불러오기
async function loadFromFirestore(){
  try {
    const ref = doc(db, 'users', _uid, 'data', 'main');
    const snap = await getDoc(ref);
    if(snap.exists()){
      const d = snap.data();
      const S = window.S;
      if(d.hl)      S.hl = d.hl;
      if(d.bk)      S.bk = new Set(d.bk);
      if(d.notes)   S.notes = d.notes;
      if(d.folders) S.folders = d.folders;
      if(d.openFolders) S.openFolders = new Set(d.openFolders);
      window._firebaseReady = true;
      if(window.renderAll) window.renderAll();
      if(window.newNote)   window.newNote();
    } else {
      // 첫 로그인 - localStorage 데이터 마이그레이션
      window._firebaseReady = true;
      await saveToFirestore();
    }
  } catch(e){ console.error('Firestore 로드 실패:', e); }
}

// ── Firestore에 저장 (window.persistToCloud로 노출)
async function saveToFirestore(){
  if(!_uid) return;
  try {
    const S = window.S;
    const ref = doc(db, 'users', _uid, 'data', 'main');
    await setDoc(ref, {
      hl: S.hl,
      bk: [...S.bk],
      notes: S.notes,
      folders: S.folders,
      openFolders: [...S.openFolders],
      updatedAt: Date.now()
    });
  } catch(e){ console.error('Firestore 저장 실패:', e); }
}
window.persistToCloud = saveToFirestore;

// ── 실시간 동기화 (다기기 지원)
function startRealtimeSync(){
  if(_unsubscribe) _unsubscribe();
  const ref = doc(db, 'users', _uid, 'data', 'main');
  _unsubscribe = onSnapshot(ref, snap => {
    if(!snap.exists() || !snap.metadata.hasPendingWrites) return;
    // 다른 기기에서 변경됐을 때만 반영 (자신의 저장은 무시)
  });
}

// ── Google 로그인
window.signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch(e){ console.error('로그인 실패:', e); }
};

// ── 로그아웃
window.signOutUser = async () => {
  await signOut(auth);
};
