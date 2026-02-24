// pdf-live-sync.js — ES module: Firestore/Storage 라이브 강의 세션 동기화
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, increment,
  collection, query, where, orderBy, getDocs, limit }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, getBlob }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

let _db = null, _storage = null, _uid = null;
let _liveStrokeTimer = null;
let _pointerTimer = null;

// ── 초기화 / 정리 ──
export function initLiveSync(db, storage, uid){
  _db = db; _storage = storage; _uid = uid;
}
export function clearLiveSync(){
  _db = null; _storage = null; _uid = null;
}

// ── 6자리 코드 생성 ──
function _genCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let c = '';
  for(let i = 0; i < 6; i++) c += chars[Math.floor(Math.random()*chars.length)];
  return c;
}

// ── 세션 생성 ──
export async function createSession(pdfName, totalPages){
  if(!_db || !_uid) return null;
  const code = _genCode();
  let ownerName = '';
  try { ownerName = window._firebaseAuth?.currentUser?.displayName || ''; } catch(e){}
  const now = Date.now();
  await setDoc(doc(_db, 'sessions', code), {
    ownerUid: _uid,
    ownerName: ownerName,
    pdfName: pdfName || '',
    pdfStoragePath: '',
    currentPage: 1,
    totalPages: totalPages || 0,
    strokes: {},
    liveStroke: null,
    pointer: null,
    status: 'live',
    viewerCount: 0,
    createdAt: now,
    updatedAt: now
  });
  return code;
}

// ── 세션 참가 (데이터 조회) ──
export async function joinSession(code){
  if(!_db) return null;
  try {
    const snap = await getDoc(doc(_db, 'sessions', code));
    if(!snap.exists()) return null;
    return snap.data();
  } catch(e){
    console.error('[LiveSync] joinSession 실패:', e);
    return null;
  }
}

// ── PDF 업로드 ──
export async function uploadSessionPdf(code, blob){
  if(!_storage || !_db) return null;
  const path = 'sessions/' + code + '/slide.pdf';
  const storageRef = ref(_storage, path);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  await updateDoc(doc(_db, 'sessions', code), {
    pdfStoragePath: path,
    updatedAt: Date.now()
  });
  return url;
}

// ── PDF 다운로드 URL 가져오기 ──
export async function getSessionPdfUrl(code){
  if(!_storage || !_db) return null;
  try {
    const snap = await getDoc(doc(_db, 'sessions', code));
    if(!snap.exists()) return null;
    const data = snap.data();
    if(!data.pdfStoragePath) return null;
    return await getDownloadURL(ref(_storage, data.pdfStoragePath));
  } catch(e){
    console.error('[LiveSync] getSessionPdfUrl 실패:', e);
    return null;
  }
}

// ── PDF Blob 직접 다운로드 (CORS 우회) ──
export async function downloadSessionPdfBlob(code){
  if(!_storage || !_db) return null;
  try {
    const snap = await getDoc(doc(_db, 'sessions', code));
    if(!snap.exists()) return null;
    const data = snap.data();
    if(!data.pdfStoragePath) return null;
    const storageRef = ref(_storage, data.pdfStoragePath);
    return await getBlob(storageRef);
  } catch(e){
    console.error('[LiveSync] downloadSessionPdfBlob 실패:', e);
    return null;
  }
}

// ── 현재 페이지 업데이트 ──
export async function updatePage(code, pageNum){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), {
      currentPage: pageNum,
      updatedAt: Date.now()
    });
  } catch(e){ console.error('[LiveSync] updatePage:', e); }
}

// ── 완성 스트로크 추가 ──
export async function addStroke(code, pageNum, stroke){
  if(!_db) return;
  try {
    const snap = await getDoc(doc(_db, 'sessions', code));
    if(!snap.exists()) return;
    const data = snap.data();
    const strokes = data.strokes || {};
    const key = String(pageNum);
    if(!strokes[key]) strokes[key] = [];
    strokes[key].push(stroke);
    await updateDoc(doc(_db, 'sessions', code), {
      strokes: strokes,
      liveStroke: null,
      updatedAt: Date.now()
    });
  } catch(e){ console.error('[LiveSync] addStroke:', e); }
}

// ── 진행중 스트로크 업데이트 (300ms 쓰로틀) ──
export function updateLiveStroke(code, data){
  if(!_db) return;
  if(_liveStrokeTimer) return;
  _liveStrokeTimer = setTimeout(function(){ _liveStrokeTimer = null; }, 300);
  updateDoc(doc(_db, 'sessions', code), {
    liveStroke: data
  }).catch(function(e){ console.error('[LiveSync] updateLiveStroke:', e); });
}

// ── 진행중 스트로크 해제 ──
export async function clearLiveStroke(code){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), { liveStroke: null });
  } catch(e){ console.error('[LiveSync] clearLiveStroke:', e); }
}

// ── 레이저 포인터 위치 (300ms 쓰로틀) ──
export function updatePointer(code, pos){
  if(!_db) return;
  if(_pointerTimer) return;
  _pointerTimer = setTimeout(function(){ _pointerTimer = null; }, 300);
  updateDoc(doc(_db, 'sessions', code), {
    pointer: pos
  }).catch(function(e){ console.error('[LiveSync] updatePointer:', e); });
}

// ── 레이저 포인터 해제 ──
export async function clearPointer(code){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), { pointer: null });
  } catch(e){}
}

// ── 해당 페이지 스트로크 초기화 ──
export async function clearStrokes(code, pageNum){
  if(!_db) return;
  try {
    const snap = await getDoc(doc(_db, 'sessions', code));
    if(!snap.exists()) return;
    const data = snap.data();
    const strokes = data.strokes || {};
    delete strokes[String(pageNum)];
    await updateDoc(doc(_db, 'sessions', code), {
      strokes: strokes,
      updatedAt: Date.now()
    });
  } catch(e){ console.error('[LiveSync] clearStrokes:', e); }
}

// ── 세션 종료 ──
export async function endSession(code){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), {
      status: 'ended',
      updatedAt: Date.now()
    });
  } catch(e){ console.error('[LiveSync] endSession:', e); }
}

// ── 실시간 리스너 ──
export function listenSession(code, callbacks){
  if(!_db) return null;
  let prevPage = null;
  let prevStrokes = null;
  const unsub = onSnapshot(doc(_db, 'sessions', code), function(snap){
    if(!snap.exists()){
      if(callbacks.onEnd) callbacks.onEnd();
      return;
    }
    const data = snap.data();

    if(data.status === 'ended'){
      if(callbacks.onEnd) callbacks.onEnd();
      return;
    }

    // 페이지 변경
    if(data.currentPage !== prevPage){
      prevPage = data.currentPage;
      if(callbacks.onPageChange) callbacks.onPageChange(data.currentPage);
    }

    // 스트로크 업데이트
    const strokesStr = JSON.stringify(data.strokes || {});
    if(strokesStr !== prevStrokes){
      prevStrokes = strokesStr;
      if(callbacks.onStrokesUpdate) callbacks.onStrokesUpdate(data.strokes || {});
    }

    // 진행중 스트로크
    if(callbacks.onLiveStroke) callbacks.onLiveStroke(data.liveStroke);

    // 레이저 포인터
    if(callbacks.onPointer) callbacks.onPointer(data.pointer);

  }, function(err){
    console.error('[LiveSync] listenSession 오류:', err);
  });
  return unsub;
}

// ── 시청자 수 증감 ──
export async function incrementViewerCount(code){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), {
      viewerCount: increment(1)
    });
  } catch(e){ console.error('[LiveSync] incrementViewerCount:', e); }
}

export async function decrementViewerCount(code){
  if(!_db) return;
  try {
    await updateDoc(doc(_db, 'sessions', code), {
      viewerCount: increment(-1)
    });
  } catch(e){ console.error('[LiveSync] decrementViewerCount:', e); }
}

// ── 종료된 세션 목록 조회 (내가 만든 세션 + 내가 참여한 세션) ──
export async function listSessions(){
  if(!_db || !_uid) return [];
  try {
    const q = query(
      collection(_db, 'sessions'),
      where('ownerUid', '==', _uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach(function(d){
      results.push({ code: d.id, ...d.data() });
    });
    return results;
  } catch(e){
    console.error('[LiveSync] listSessions:', e);
    return [];
  }
}

// ── 세션 삭제 ──
export async function deleteSession(code){
  if(!_db || !_uid) return;
  try {
    await deleteDoc(doc(_db, 'sessions', code));
  } catch(e){ console.error('[LiveSync] deleteSession:', e); }
}

// ── window에 노출 (IIFE pdf-live.js에서 호출) ──
window._liveCreateSession       = createSession;
window._liveJoinSession         = joinSession;
window._liveUploadSessionPdf    = uploadSessionPdf;
window._liveGetSessionPdfUrl    = getSessionPdfUrl;
window._liveDownloadPdfBlob     = downloadSessionPdfBlob;
window._liveUpdatePage          = updatePage;
window._liveAddStroke           = addStroke;
window._liveUpdateLiveStroke    = updateLiveStroke;
window._liveClearLiveStroke     = clearLiveStroke;
window._liveUpdatePointer       = updatePointer;
window._liveClearPointer        = clearPointer;
window._liveClearStrokes        = clearStrokes;
window._liveEndSession          = endSession;
window._liveListenSession       = listenSession;
window._liveIncrementViewerCount = incrementViewerCount;
window._liveDecrementViewerCount = decrementViewerCount;
window._liveListSessions         = listSessions;
window._liveDeleteSession        = deleteSession;
