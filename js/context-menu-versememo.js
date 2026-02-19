// Context menu verse memo: ctxVerseMemo, showVerseMemoPopup, closeVerseMemo, saveVerseMemo, deleteVerseMemo
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
      <div id="vmemoRef" style="font-size:12px;color:var(--text3);margin-bottom:8px;font-family:'JetBrains Mono',monospace"></div>
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
    document.body.appendChild(popup);
  }
  // 데이터 로드
  if(!S.verseMemo) S.verseMemo = {};
  document.getElementById('vmemoRef').textContent = `${S.book} ${S.ch}:${S.selV}`;
  document.getElementById('vmemoText').innerHTML = S.verseMemo[key] || '';
  popup.style.display = 'flex';
  setTimeout(()=>document.getElementById('vmemoText').focus(), 50);
}
function closeVerseMemo(){
  const p = document.getElementById('verseMemoPopup');
  if(p) p.style.display = 'none';
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
  toast('구절 주석이 저장됐어요 ✓');
}
function deleteVerseMemo(){
  const key = `${S.book}_${S.ch}_${S.selV}`;
  if(S.verseMemo) delete S.verseMemo[key];
  closeVerseMemo();
  updateDict();
  persist();
  toast('구절 주석이 삭제됐어요');
}
