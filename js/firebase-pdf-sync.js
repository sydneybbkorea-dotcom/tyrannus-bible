// firebase-pdf-sync.js — PDF 데이터 클라우드 동기화 (메타데이터 + 어노테이션 + 파일 blob)
import { doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { ref, uploadBytes, getBytes, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

let _db = null, _storage = null, _uid = null;
let _timerMeta = null, _timerAnnots = null;
let _unsubMeta = null, _unsubAnnots = null;
let _lastMetaTs = 0, _lastAnnotsTs = 0;

// ── Init / Clear ──
export function initPdfSync(db, storage, uid){
  _db = db; _storage = storage; _uid = uid;
}
export function clearPdfSync(){
  _db = null; _storage = null; _uid = null;
  clearTimeout(_timerMeta); clearTimeout(_timerAnnots);
}

// ══════════════════════════════════════════════════════
//  SAVE TO FIRESTORE (디바운스)
// ══════════════════════════════════════════════════════

// ── PDF 메타데이터 (폴더, 파일 목록) ──
async function _savePdfMeta(){
  if(!_db || !_uid) return;
  window._setSyncStatus?.('syncing');
  try {
    const S = window.S;
    await setDoc(doc(_db, 'users', _uid, 'data', 'pdf-meta'), {
      pdfFolders: S.pdfFolders || [],
      pdfFiles: S.pdfFiles || [],
      curPdfFolder: S.curPdfFolder || 'pdf-default',
      openPdfFolders: [...(S.openPdfFolders || [])],
      updatedAt: Date.now()
    });
    window._setSyncStatus?.('synced');
  } catch(e){
    console.error('[PdfSync] meta 저장 실패:', e);
    window._setSyncStatus?.('error');
  }
}

// ── PDF 어노테이션 ──
async function _savePdfAnnots(){
  if(!_db || !_uid) return;
  window._setSyncStatus?.('syncing');
  try {
    // IDB에서 모든 어노테이션 로드
    if(typeof IDBStore === 'undefined') return;
    await IDBStore.open();
    const annots = await IDBStore.getAll('pdf-annots');
    // points 등 큰 데이터는 직렬화 가능한 형태로 정리
    const clean = annots.map(function(a){
      var c = {};
      for(var k in a) if(a.hasOwnProperty(k)) c[k] = a[k];
      return c;
    });
    await setDoc(doc(_db, 'users', _uid, 'data', 'pdf-annots'), {
      annots: clean,
      updatedAt: Date.now()
    });
    window._setSyncStatus?.('synced');
  } catch(e){
    console.error('[PdfSync] annots 저장 실패:', e);
    window._setSyncStatus?.('error');
  }
}

// ── 디바운스 persist ──
export function persistPdfMetaToCloud(){
  if(!_db || !_uid) return;
  clearTimeout(_timerMeta);
  _timerMeta = setTimeout(_savePdfMeta, 2000);
}
export function persistPdfAnnotsToCloud(){
  if(!_db || !_uid) return;
  clearTimeout(_timerAnnots);
  _timerAnnots = setTimeout(_savePdfAnnots, 2000);
}
export function flushPdfSaves(){
  clearTimeout(_timerMeta); clearTimeout(_timerAnnots);
  _savePdfMeta(); _savePdfAnnots();
}

// ══════════════════════════════════════════════════════
//  LOAD FROM FIRESTORE (로그인 시)
// ══════════════════════════════════════════════════════
export async function loadPdfFromFirestore(db, uid){
  try {
    const [metaSnap, annotsSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid, 'data', 'pdf-meta')),
      getDoc(doc(db, 'users', uid, 'data', 'pdf-annots'))
    ]);
    const S = window.S;

    if(metaSnap.exists()){
      const d = metaSnap.data();
      if(d.pdfFolders && d.pdfFolders.length > 0) S.pdfFolders = d.pdfFolders;
      if(d.pdfFiles) S.pdfFiles = d.pdfFiles;
      if(d.curPdfFolder) S.curPdfFolder = d.curPdfFolder;
      if(d.openPdfFolders) S.openPdfFolders = new Set(d.openPdfFolders);
      _lastMetaTs = d.updatedAt || 0;
      // localStorage 오프라인 백업 갱신
      if(typeof PDFLibrary !== 'undefined') PDFLibrary.persistPdf();
    }

    if(annotsSnap.exists()){
      const d = annotsSnap.data();
      if(d.annots && d.annots.length > 0){
        if(typeof IDBStore !== 'undefined'){
          await IDBStore.open();
          await IDBStore.clear('pdf-annots');
          await IDBStore.putBulk('pdf-annots', d.annots);
        }
      }
      _lastAnnotsTs = d.updatedAt || 0;
    }

    // 첫 로그인: 로컬 데이터 → 클라우드 마이그레이션
    if(!metaSnap.exists() && !annotsSnap.exists()){
      await _savePdfMeta();
      await _savePdfAnnots();
      // 로컬 PDF blob도 클라우드에 업로드
      _migrateLocalBlobsToCloud();
    }

    // PDF 패널 UI 갱신
    if(typeof PDFLibrary !== 'undefined') PDFLibrary.render();
    return true;
  } catch(e){
    console.error('[PdfSync] Firestore 로드 실패:', e);
    return false;
  }
}

// 첫 로그인 시 로컬 IDB에 있는 PDF blob을 클라우드에 업로드
async function _migrateLocalBlobsToCloud(){
  if(!_storage || !_uid) return;
  const S = window.S;
  if(!S.pdfFiles || S.pdfFiles.length === 0) return;
  for(var i = 0; i < S.pdfFiles.length; i++){
    try {
      var f = S.pdfFiles[i];
      var rec = await IDBStore.loadFile(f.id);
      if(rec && rec.data){
        var blob = (rec.data instanceof Blob) ? rec.data : new Blob([rec.data], {type:'application/pdf'});
        await uploadPdfBlob(f.id, blob);
      }
    } catch(e){
      console.warn('[PdfSync] blob 마이그레이션 실패:', S.pdfFiles[i].id, e);
    }
  }
}

// ══════════════════════════════════════════════════════
//  REALTIME SYNC (다기기 실시간 동기화)
// ══════════════════════════════════════════════════════
export function startPdfRealtimeSync(db, uid){
  stopPdfRealtimeSync();

  // 메타데이터 리스너
  _unsubMeta = onSnapshot(doc(db, 'users', uid, 'data', 'pdf-meta'), function(snap){
    if(!snap.exists() || snap.metadata.hasPendingWrites) return;
    const d = snap.data();
    if(!d.updatedAt || d.updatedAt <= _lastMetaTs) return;
    _lastMetaTs = d.updatedAt;
    const S = window.S;
    if(d.pdfFolders && d.pdfFolders.length > 0) S.pdfFolders = d.pdfFolders;
    if(d.pdfFiles) S.pdfFiles = d.pdfFiles;
    if(d.curPdfFolder) S.curPdfFolder = d.curPdfFolder;
    if(d.openPdfFolders) S.openPdfFolders = new Set(d.openPdfFolders);
    if(typeof PDFLibrary !== 'undefined'){
      PDFLibrary.persistPdf();
      PDFLibrary.render();
    }
    window._setSyncStatus?.('synced');
  });

  // 어노테이션 리스너
  _unsubAnnots = onSnapshot(doc(db, 'users', uid, 'data', 'pdf-annots'), async function(snap){
    if(!snap.exists() || snap.metadata.hasPendingWrites) return;
    const d = snap.data();
    if(!d.updatedAt || d.updatedAt <= _lastAnnotsTs) return;
    _lastAnnotsTs = d.updatedAt;
    if(d.annots && d.annots.length >= 0){
      if(typeof IDBStore !== 'undefined'){
        await IDBStore.open();
        await IDBStore.clear('pdf-annots');
        if(d.annots.length > 0) await IDBStore.putBulk('pdf-annots', d.annots);
      }
    }
    // 현재 열린 PDF 어노테이션 새로고침
    if(typeof PDFViewer !== 'undefined' && PDFViewer.getCurrentPdfId()){
      if(typeof PDFAnnotations !== 'undefined'){
        await PDFAnnotations.load(PDFViewer.getCurrentPdfId());
      }
      if(PDFViewer.rerenderAnnotations) PDFViewer.rerenderAnnotations();
    }
    window._setSyncStatus?.('synced');
  });
}

export function stopPdfRealtimeSync(){
  if(_unsubMeta){ _unsubMeta(); _unsubMeta = null; }
  if(_unsubAnnots){ _unsubAnnots(); _unsubAnnots = null; }
  _lastMetaTs = 0; _lastAnnotsTs = 0;
}

// ══════════════════════════════════════════════════════
//  PDF BLOB — Firebase Storage 업로드/다운로드/삭제
// ══════════════════════════════════════════════════════
export async function uploadPdfBlob(pdfId, blob){
  if(!_storage || !_uid) return;
  try {
    const storageRef = ref(_storage, 'users/' + _uid + '/pdfs/' + pdfId);
    await uploadBytes(storageRef, blob);
  } catch(e){
    console.error('[PdfSync] blob 업로드 실패:', pdfId, e);
  }
}

export async function downloadPdfBlob(pdfId){
  if(!_storage || !_uid) return null;
  try {
    const storageRef = ref(_storage, 'users/' + _uid + '/pdfs/' + pdfId);
    const bytes = await getBytes(storageRef);
    return new Blob([bytes], { type: 'application/pdf' });
  } catch(e){
    console.warn('[PdfSync] blob 다운로드 실패:', pdfId, e);
    return null;
  }
}

export async function deletePdfBlob(pdfId){
  if(!_storage || !_uid) return;
  try {
    const storageRef = ref(_storage, 'users/' + _uid + '/pdfs/' + pdfId);
    await deleteObject(storageRef);
  } catch(e){
    // 클라우드에 없는 파일일 수 있음 — 무시
  }
}

// ══════════════════════════════════════════════════════
//  WINDOW 노출 (비모듈 스크립트에서 호출용)
// ══════════════════════════════════════════════════════
window.persistPdfMetaToCloud  = persistPdfMetaToCloud;
window.persistPdfAnnotsToCloud = persistPdfAnnotsToCloud;
window.uploadPdfBlobToCloud    = uploadPdfBlob;
window.downloadPdfBlobFromCloud = downloadPdfBlob;
window.deletePdfBlobFromCloud  = deletePdfBlob;
