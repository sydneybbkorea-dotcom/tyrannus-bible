// share.js — 공유 핵심 로직 (ES module)
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, updateDoc, arrayUnion, arrayRemove }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let _db = null, _uid = null, _userName = '';
let _listeners = [];        // onSnapshot unsubscribe 핸들
let _publishTimer = null;

window._sharedCache = {};   // shareCode → data

// ── 초기화 / 정리 ──────────────────────────────
export function initShare(db, uid){
  _db = db; _uid = uid;
  // 사용자 이름 (Google displayName)
  try { _userName = window._firebaseAuth?.currentUser?.displayName || ''; } catch(e){}
}
export function clearShare(){
  _db = null; _uid = null; _userName = '';
  stopSharedListeners();
  window._sharedCache = {};
}

// ── 6자리 영숫자 코드 생성 ─────────────────────
function _genCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let c = '';
  for(let i = 0; i < 6; i++) c += chars[Math.floor(Math.random()*chars.length)];
  return c;
}

// ── 폴더 공유 생성 ─────────────────────────────
export async function createFolderShare(folderId){
  if(!_db || !_uid) return null;
  const folder = (S.folders||[]).find(f=>f.id===folderId);
  if(!folder) return null;

  const code = _genCode();
  const notes = (S.notes||[]).filter(n=>n.folderId===folderId).map(n=>({
    id:n.id, title:n.title||'', content:n.content||'', tags:n.tags||[]
  }));
  const now = Date.now();

  await setDoc(doc(_db,'shares',code),{
    type:'folder', ownerUid:_uid, ownerName:_userName,
    folderName:folder.name, notes, allowedEmails:[],
    createdAt:now, updatedAt:now
  });

  if(!S.sharedByMe) S.sharedByMe = [];
  S.sharedByMe.push({ shareCode:code, type:'folder', sourceId:folderId, sourceName:folder.name });
  persist();
  return code;
}

// ── 하이라이트 주제 공유 생성 ──────────────────
export async function createHighlightShare(topicId){
  if(!_db || !_uid) return null;
  const topic = (S.hlTopics||[]).find(t=>t.id===topicId);
  if(!topic) return null;

  const code = _genCode();
  // 해당 주제의 hlRanges, hlMemo 추출
  const filteredRanges = {};
  Object.entries(S.hlRanges||{}).forEach(([key, ranges])=>{
    const topicRanges = ranges.filter(r=>r.topicId===topicId);
    if(topicRanges.length) filteredRanges[key] = topicRanges;
  });
  const filteredMemo = {};
  Object.entries(S.hlMemo||{}).forEach(([key, m])=>{
    if(m.topicId===topicId) filteredMemo[key] = m;
  });
  const now = Date.now();

  await setDoc(doc(_db,'shares',code),{
    type:'highlights', ownerUid:_uid, ownerName:_userName,
    topicName:topic.name, hlRanges:filteredRanges, hlMemo:filteredMemo,
    allowedEmails:[], createdAt:now, updatedAt:now
  });

  if(!S.sharedByMe) S.sharedByMe = [];
  S.sharedByMe.push({ shareCode:code, type:'highlights', sourceId:topicId, sourceName:topic.name });
  persist();
  return code;
}

// ── 공유 해제 (Firestore 삭제) ─────────────────
export async function revokeShare(shareCode){
  if(!_db || !_uid) return;
  try { await deleteDoc(doc(_db,'shares',shareCode)); } catch(e){ console.error('공유 해제 실패:',e); }
  S.sharedByMe = (S.sharedByMe||[]).filter(s=>s.shareCode!==shareCode);
  persist();
}

// ── 소유자: 폴더 스냅샷 갱신 ───────────────────
export async function publishSharedFolder(code, folderId){
  if(!_db || !_uid) return;
  const folder = (S.folders||[]).find(f=>f.id===folderId);
  if(!folder) return;
  const notes = (S.notes||[]).filter(n=>n.folderId===folderId).map(n=>({
    id:n.id, title:n.title||'', content:n.content||'', tags:n.tags||[]
  }));
  try {
    await setDoc(doc(_db,'shares',code),{
      type:'folder', ownerUid:_uid, ownerName:_userName,
      folderName:folder.name, notes, updatedAt:Date.now()
    },{ merge:true });
  } catch(e){ console.error('폴더 공유 갱신 실패:',e); }
}

// ── 소유자: 하이라이트 스냅샷 갱신 ─────────────
export async function publishSharedHighlights(code, topicId){
  if(!_db || !_uid) return;
  const topic = (S.hlTopics||[]).find(t=>t.id===topicId);
  if(!topic) return;
  const filteredRanges = {};
  Object.entries(S.hlRanges||{}).forEach(([key, ranges])=>{
    const topicRanges = ranges.filter(r=>r.topicId===topicId);
    if(topicRanges.length) filteredRanges[key] = topicRanges;
  });
  const filteredMemo = {};
  Object.entries(S.hlMemo||{}).forEach(([key, m])=>{
    if(m.topicId===topicId) filteredMemo[key] = m;
  });
  try {
    await setDoc(doc(_db,'shares',code),{
      type:'highlights', ownerUid:_uid, ownerName:_userName,
      topicName:topic.name, hlRanges:filteredRanges, hlMemo:filteredMemo,
      updatedAt:Date.now()
    },{ merge:true });
  } catch(e){ console.error('하이라이트 공유 갱신 실패:',e); }
}

// ── 소유자: persist 시 모든 공유 자동 갱신 ─────
export function _publishAllShares(){
  if(!_db || !_uid) return;
  (S.sharedByMe||[]).forEach(s=>{
    if(s.type==='folder') publishSharedFolder(s.shareCode, s.sourceId);
    else if(s.type==='highlights') publishSharedHighlights(s.shareCode, s.sourceId);
  });
}

// ── 디바운스 자동 갱신 (firebase-sync에서 호출) ──
export function schedulePublishShares(){
  clearTimeout(_publishTimer);
  _publishTimer = setTimeout(_publishAllShares, 3000);
}
window._schedulePublishShares = schedulePublishShares;

// ── 공유 데이터 로드 (캐시 채움) ─────────────────
export async function fetchShareData(shareCode){
  if(!_db) return null;
  if(window._sharedCache[shareCode]) return window._sharedCache[shareCode];
  try {
    const snap = await getDoc(doc(_db,'shares',shareCode));
    if(!snap.exists()) return null;
    window._sharedCache[shareCode] = snap.data();
    return snap.data();
  } catch(e){ console.error('공유 데이터 로드 실패:',e); return null; }
}

// ── 허용 이메일 관리 ─────────────────────────────
export async function addAllowedEmail(shareCode, email){
  if(!_db || !_uid) return;
  const ref = doc(_db,'shares',shareCode);
  await updateDoc(ref, { allowedEmails: arrayUnion(email) });
  // 캐시 동기화
  const cached = window._sharedCache[shareCode];
  if(cached){
    if(!cached.allowedEmails) cached.allowedEmails = [];
    if(!cached.allowedEmails.includes(email)) cached.allowedEmails.push(email);
  }
}

export async function removeAllowedEmail(shareCode, email){
  if(!_db || !_uid) return;
  const ref = doc(_db,'shares',shareCode);
  await updateDoc(ref, { allowedEmails: arrayRemove(email) });
  // 캐시 동기화
  const cached = window._sharedCache[shareCode];
  if(cached && cached.allowedEmails){
    cached.allowedEmails = cached.allowedEmails.filter(e=>e!==email);
  }
}

export function getAllowedEmails(shareCode){
  const cached = window._sharedCache[shareCode];
  return cached?.allowedEmails || [];
}

// ── window에 노출 (share-ui.js 등 일반 script에서 호출) ──
window._shareCreateFolder    = createFolderShare;
window._shareCreateHighlight = createHighlightShare;
window._shareRevoke          = revokeShare;
window._shareConfirmJoin     = confirmJoin;
window._shareLeave           = leaveShare;
window._shareStartListeners  = startSharedListeners;
window._shareFetchData           = fetchShareData;
window._shareAddAllowedEmail    = addAllowedEmail;
window._shareRemoveAllowedEmail = removeAllowedEmail;
window._shareGetAllowedEmails   = getAllowedEmails;

// ── 수신자: 공유 가입 ──────────────────────────
export async function joinShare(shareCode){
  if(!_db) return null;
  try {
    const snap = await getDoc(doc(_db,'shares',shareCode));
    if(!snap.exists()) return null;
    const data = snap.data();
    // 이미 가입했는지 체크
    if((S.sharedWithMe||[]).some(s=>s.shareCode===shareCode)) return data;
    return data; // UI에서 확인 후 _shareAcceptJoin 호출
  } catch(e){ console.error('공유 조회 실패:',e); return null; }
}

// ── 수신자: 가입 확정 ──────────────────────────
export function confirmJoin(shareCode, data){
  if(!S.sharedWithMe) S.sharedWithMe = [];
  if(S.sharedWithMe.some(s=>s.shareCode===shareCode)) return;
  S.sharedWithMe.push({
    shareCode,
    ownerName: data.ownerName||'',
    type: data.type,
    label: data.type==='folder' ? data.folderName : data.topicName
  });
  window._sharedCache[shareCode] = data;
  persist();
}

// ── 수신자: 공유 탈퇴 ──────────────────────────
export function leaveShare(shareCode){
  S.sharedWithMe = (S.sharedWithMe||[]).filter(s=>s.shareCode!==shareCode);
  delete window._sharedCache[shareCode];
  persist();
}

// ── 실시간 리스너 (sharedWithMe 구독) ──────────
export function startSharedListeners(){
  stopSharedListeners();
  if(!_db) return;
  (S.sharedWithMe||[]).forEach(s=>{
    const unsub = onSnapshot(doc(_db,'shares',s.shareCode), snap=>{
      if(!snap.exists()){
        // 소유자가 공유 해제함
        S.sharedWithMe = (S.sharedWithMe||[]).filter(x=>x.shareCode!==s.shareCode);
        delete window._sharedCache[s.shareCode];
        persist();
        window.renderAll?.();
        return;
      }
      window._sharedCache[s.shareCode] = snap.data();
      window.renderAll?.();
    },err=>{
      console.error('공유 리스너 오류:',err);
    });
    _listeners.push(unsub);
  });
}

export function stopSharedListeners(){
  _listeners.forEach(fn=>fn());
  _listeners = [];
}

// ── URL 파라미터 공유 가입 핸들러 ───────────────
window._handleShareJoin = async function(code){
  if(!code || !_db) return;
  const data = await joinShare(code);
  if(!data) {
    window.toast?.('유효하지 않은 공유 링크입니다.');
    return;
  }
  if((S.sharedWithMe||[]).some(s=>s.shareCode===code)){
    window.toast?.('이미 가입된 공유입니다.');
    return;
  }
  // 가입 프롬프트 표시
  if(typeof _shareShowJoinPrompt === 'function'){
    _shareShowJoinPrompt(code, data);
  }
};
