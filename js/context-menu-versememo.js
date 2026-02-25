// Context menu verse memo: ctxVerseMemo, showVerseMemoPopup, closeVerseMemo, saveVerseMemo, deleteVerseMemo
// [[창1:1]] 구절 링크 + / 노트 첨부 지원

var _vmemoSlashPending = false;

function ctxVerseMemo(){
  closeCtx();
  if(!S.selV){ toast('먼저 구절을 클릭하세요'); return; }
  showVerseMemoPopup();
}

function showVerseMemoPopup(){
  const key = `${S.book}_${S.ch}_${S.selV}`;
  let popup = document.getElementById('verseMemoPopup');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'verseMemoPopup';
    popup.className = 'modal-bg';
    popup.innerHTML = `<div class="modal-box" style="width:420px;max-width:90vw">
      <div class="modal-title" style="display:flex;align-items:center;gap:8px">
        <i class="fa fa-comment-dots" style="color:rgba(120,100,230,.8)"></i>
        <span id="vmemoTitle">구절 주석</span>
      </div>
      <div id="vmemoRef" style="font-size:12px;color:var(--text3);margin-bottom:4px;font-family:'JetBrains Mono',monospace"></div>
      <div style="font-size:10px;color:var(--text-muted,var(--text3));margin-bottom:6px;opacity:.7">
        <code>[[창1:1]]</code> 구절 링크 &middot; <code>/</code> 노트 첨부
      </div>
      <div id="vmemoText" contenteditable="true" style="
        min-height:120px;max-height:260px;overflow-y:auto;
        background:var(--bg2);border:1px solid var(--border);border-radius:8px;
        padding:12px;font-size:13px;color:var(--text);line-height:1.8;
        outline:none;font-family:'KoPub Batang',serif;"
        data-placeholder="이 구절에 대한 주석을 작성하세요..."></div>
      <div class="modal-btns" style="margin-top:10px">
        <button class="mbtn mbtn-cancel" onclick="closeVerseMemo()">취소</button>
        <button class="mbtn" onclick="deleteVerseMemo()" style="color:var(--text3);border:1px solid var(--border);background:transparent"><i class="fa fa-trash"></i> 삭제</button>
        <button class="mbtn mbtn-ok" onclick="saveVerseMemo()">저장</button>
      </div>
    </div>`;

    // [[구절]] 링크 실시간 변환 + / 노트 첨부
    var textEl = popup.querySelector('#vmemoText');
    textEl.addEventListener('input', function(){
      if(typeof processVersLinks === 'function') processVersLinks(this);
    });
    textEl.addEventListener('keydown', function(e){ _vmemoKeyHandler(e); });

    document.body.appendChild(popup);
  }
  // 활성 메모 에디터 추적 (노트 삽입 위치용)
  window._activeMemoEditorId = 'vmemoText';
  window._activeMemoPopupId = 'verseMemoPopup';

  // 데이터 로드
  if(!S.verseMemo) S.verseMemo = {};
  document.getElementById('vmemoRef').textContent = `${S.book} ${S.ch}:${S.selV}`;
  document.getElementById('vmemoText').innerHTML = S.verseMemo[key] || '';
  popup.style.display = 'flex';
  setTimeout(()=>document.getElementById('vmemoText').focus(), 50);
}

// / + 스페이스 → 노트 검색
function _vmemoKeyHandler(e){
  if(e.key === '/'){
    _vmemoSlashPending = true;
    return;
  }
  if(e.key === ' ' && _vmemoSlashPending){
    e.preventDefault();
    _vmemoSlashPending = false;
    var ta = document.getElementById('vmemoText');
    if(typeof removeLastSlash === 'function') removeLastSlash(ta);
    var sel = window.getSelection();
    if(sel.rangeCount) _memoNlinkRange = sel.getRangeAt(0).cloneRange();
    if(typeof showMemoNoteSearch === 'function') showMemoNoteSearch();
    return;
  }
  _vmemoSlashPending = false;
}

function closeVerseMemo(){
  const p = document.getElementById('verseMemoPopup');
  if(p) p.style.display = 'none';
  window._activeMemoEditorId = 'markMemoText';
  window._activeMemoPopupId = 'markMemoPopup';
}
function saveVerseMemo(){
  const key = `${S.book}_${S.ch}_${S.selV}`;
  const text = document.getElementById('vmemoText')?.innerHTML?.trim() || '';
  if(!S.verseMemo) S.verseMemo = {};
  if(text) S.verseMemo[key] = text;
  else delete S.verseMemo[key];
  closeVerseMemo();
  updateDict();
  persist();
  toast('구절 주석이 저장됐어요');
}
function deleteVerseMemo(){
  const key = `${S.book}_${S.ch}_${S.selV}`;
  if(S.verseMemo) delete S.verseMemo[key];
  closeVerseMemo();
  updateDict();
  persist();
  toast('구절 주석이 삭제됐어요');
}
