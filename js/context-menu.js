// CONTEXT MENU
// ═══════════════════════════════════════════════════
function showCtx(e){
  try {
    const m=document.getElementById('ctxMenu');
    if(!m) { 
      console.error('ctxMenu element not found');
      return; 
    }
    
    // Position menu
    const x = e.clientX || e.pageX || 0;
    const y = e.clientY || e.pageY || 0;
    m.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    m.style.top = Math.min(y, window.innerHeight - 250) + 'px';
    
    // Show/hide clear highlight button
    const clearBtn=document.getElementById('ctxClearHLItem');
    if(clearBtn){
      const key=S.selV?`${S.book}_${S.ch}_${S.selV}`:'';
      clearBtn.style.display=(key && S.hl[key])?'':'none';
    }
    
    // Remove any existing 'show' class first
    m.classList.remove('show');
    
    // Force reflow
    void m.offsetWidth;
    
    // Add show class
    m.classList.add('show');
    
    console.log('Context menu displayed at', m.style.left, m.style.top);
  } catch(err) {
    console.error('Error in showCtx:', err);
  }
}
function closeCtx(){document.getElementById('ctxMenu').classList.remove('show')}
document.addEventListener('click',e=>{
  if(!e.target.closest('#ctxMenu')) closeCtx();
  if(!e.target.closest('#hlPicker')&&!e.target.closest('#bibleScroll')) hideHLPicker();
});

// ── 노트 연결 모달 ─────────────────────────────────
function ctxLinkNote(){
  closeCtx();
  if(!S.selV){ toast('구절을 먼저 클릭하세요'); return; }
  const key = `${S.book}_${S.ch}_${S.selV}`;
  const verseText = BIBLE[S.book]?.[S.ch]?.[S.selV-1] || '';

  let modal = document.getElementById('noteLinkModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'noteLinkModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10000;
      display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
      <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:12px;
        width:340px;max-height:80vh;display:flex;flex-direction:column;box-shadow:var(--shadow);">
        <div style="padding:14px 16px 10px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:13px;font-weight:600;color:var(--text);">
            <i class="fa fa-link" style="color:var(--gold);margin-right:6px;"></i>노트 연결
          </div>
          <span onclick="closeNoteLinkModal()" style="cursor:pointer;color:var(--text3);font-size:16px;">✕</span>
        </div>
        <div id="noteLinkVerse" style="padding:8px 16px;font-size:12px;color:var(--text3);
          border-bottom:1px solid var(--border);font-family:'KoPub Batang',serif;"></div>
        <div style="padding:8px 12px;border-bottom:1px solid var(--border);">
          <input id="noteLinkSearch" type="text" placeholder="노트 검색..."
            oninput="renderNoteLinkList()"
            style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;
              padding:6px 10px;font-size:12px;color:var(--text);outline:none;">
        </div>
        <div id="noteLinkList" style="overflow-y:auto;flex:1;padding:8px 0;"></div>
        <div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">
          <button onclick="closeNoteLinkModal()" style="padding:5px 14px;border-radius:6px;
            border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:12px;cursor:pointer;">취소</button>
          <button onclick="confirmNoteLink()" style="padding:5px 14px;border-radius:6px;
            border:none;background:var(--gold);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">연결</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  // 구절 텍스트 표시
  const verseEl = document.getElementById('noteLinkVerse');
  const plain = verseText.replace(/<[^>]+>/g,'');
  verseEl.textContent = `${S.book} ${S.ch}:${S.selV} — "${plain.slice(0,40)}${plain.length>40?'…':''}"`;

  // 현재 연결된 노트 초기화
  window._noteLinkKey = key;
  window._noteLinkSelected = new Set(
    S.notes.filter(n=>n.vRefs?.includes(key)).map(n=>n.id)
  );

  document.getElementById('noteLinkSearch').value = '';
  renderNoteLinkList();
  modal.style.display = 'flex';
}

// 폴더 접기 상태
window._nlFolderOpen = window._nlFolderOpen || new Set(['default']);

function renderNoteLinkList(){
  const q = document.getElementById('noteLinkSearch')?.value.toLowerCase() || '';
  const list = document.getElementById('noteLinkList');
  if(!list) return;

  // 폴더별로 그룹화
  const folderMap = new Map();
  S.folders.forEach(f => folderMap.set(f.id, {name:f.name, id:f.id, notes:[]}));

  S.notes.forEach(n => {
    if(q && !n.title.toLowerCase().includes(q) && !n.content?.replace(/<[^>]+>/g,'').toLowerCase().includes(q)) return;
    const bucket = folderMap.get(n.folderId);
    if(bucket) bucket.notes.push(n);
  });

  // 검색 중이면 모든 폴더 자동 펼치기
  if(q) folderMap.forEach(({id})=> window._nlFolderOpen.add(id));

  let h = '';
  let total = 0;
  folderMap.forEach(({name, id, notes}) => {
    if(!notes.length && !q) return; // 검색 아닐 때 빈 폴더 숨김
    total += notes.length;
    const isOpen = window._nlFolderOpen.has(id);
    const linkedCount = notes.filter(n=>window._noteLinkSelected?.has(n.id)).length;
    // 폴더 헤더
    h += `<div onclick="toggleNLFolder('${id}')"
      style="display:flex;align-items:center;gap:6px;padding:7px 14px;cursor:pointer;
        background:var(--bg2);border-bottom:1px solid var(--border);user-select:none;"
      onmouseenter="this.style.background='var(--bg4)'"
      onmouseleave="this.style.background='var(--bg2)'">
      <i class="fa fa-folder${isOpen?'-open':''}" style="color:var(--gold);font-size:12px;width:14px;"></i>
      <span style="font-size:12px;font-weight:600;color:var(--text);flex:1;">${name}</span>
      ${linkedCount?`<span style="font-size:10px;background:var(--gold);color:#fff;border-radius:8px;padding:1px 6px;">${linkedCount}</span>`:''}
      <span style="font-size:10px;color:var(--text3);">${notes.length}개</span>
      <i class="fa fa-chevron-${isOpen?'up':'down'}" style="font-size:10px;color:var(--text3);"></i>
    </div>`;
    // 노트 목록 (펼쳐진 경우)
    if(isOpen){
      if(!notes.length){
        h += `<div style="padding:8px 20px;font-size:12px;color:var(--text3);">노트 없음</div>`;
      } else {
        notes.forEach(n => {
          const linked = window._noteLinkSelected?.has(n.id);
          h += `<div onclick="toggleNoteLink('${n.id}')"
            style="display:flex;align-items:center;gap:8px;padding:7px 20px;cursor:pointer;
              background:${linked?'var(--gold-dim)':'transparent'};border-bottom:1px solid var(--border);"
            onmouseenter="this.style.background='var(--bg3)'"
            onmouseleave="this.style.background='${linked?'var(--gold-dim)':'transparent'}'">
            <div style="width:15px;height:15px;border-radius:3px;flex-shrink:0;
              border:1.5px solid ${linked?'var(--gold)':'var(--border2)'};
              background:${linked?'var(--gold)':'transparent'};
              display:flex;align-items:center;justify-content:center;">
              ${linked?'<i class="fa fa-check" style="font-size:8px;color:#fff;"></i>':''}
            </div>
            <span style="font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.title}</span>
          </div>`;
        });
      }
    }
  });
  if(!total && q) h = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">검색 결과 없음</div>';
  else if(!total)  h = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">작성된 노트가 없어요</div>';
  list.innerHTML = h;
}

function toggleNLFolder(folderId){
  if(window._nlFolderOpen.has(folderId)) window._nlFolderOpen.delete(folderId);
  else window._nlFolderOpen.add(folderId);
  renderNoteLinkList();
}

function toggleNoteLink(noteId){
  if(!window._noteLinkSelected) return;
  if(window._noteLinkSelected.has(noteId)){
    window._noteLinkSelected.delete(noteId);
  } else {
    window._noteLinkSelected.add(noteId);
  }
  renderNoteLinkList();
}

function confirmNoteLink(){
  const key = window._noteLinkKey;
  if(!key) return;
  // 선택된 노트에 key 추가, 해제된 노트에서 key 제거
  S.notes.forEach(n => {
    if(!n.vRefs) n.vRefs = [];
    if(window._noteLinkSelected.has(n.id)){
      if(!n.vRefs.includes(key)) n.vRefs.push(key);
    } else {
      n.vRefs = n.vRefs.filter(r => r !== key);
    }
  });
  closeNoteLinkModal();
  persist();
  renderBible();
  if(S.panelOpen==='commentary') updateComm();
  toast('노트가 연결됐어요 ✓');
}

function closeNoteLinkModal(){
  const m = document.getElementById('noteLinkModal');
  if(m) m.style.display = 'none';
}
// ─────────────────────────────────────────────────

function ctxHL(){ closeCtx(); if(!S.selV){toast('구절을 클릭 후 드래그하세요');return} applyDragHL(S.hlColor); }
function ctxClearHL(){
  closeCtx();
  if(!S.selV) return;
  const key=`${S.book}_${S.ch}_${S.selV}`;
  const row=document.querySelector(`.vrow[data-v="${S.selV}"]`);
  if(row){
    row.querySelectorAll('mark').forEach(m=>m.replaceWith(...m.childNodes));
    row.className=row.className.replace(/hl-row-\S+/g,'').trim();
  }
  // hlRanges, hlMemo도 함께 삭제
  delete S.hl[key];
  if(S.hlRanges?.[key]){
    // 이 key의 모든 gid에 대한 메모도 삭제
    (S.hlRanges[key]||[]).forEach(r=>{ if(S.hlMemo?.[r.gid]) delete S.hlMemo[r.gid]; });
    delete S.hlRanges[key];
  }
  persist();
  toast('형광펜이 지워졌어요');
}
function ctxNote(){ closeCtx(); newNote(); switchTab('notes'); }
function ctxDict(){ closeCtx(); switchTab('dictionary'); updateDict(); togglePanel('dictionary'); }

// 구절 전체 주석 작성
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
function ctxCopy(){
  closeCtx();
  if(!S.selV) return;
  const t = BIBLE[S.book]?.[S.ch]?.[S.selV-1] || '';
  const plain = t.replace(/<[^>]+>/g,'');
  const ref = `${S.book} ${S.ch}:${S.selV}`;
  navigator.clipboard.writeText(ref + '\n' + plain).then(()=>{
    showCopyRef(ref);
  });
}
function ctxCopyRef(){ closeCtx(); if(!S.selV)return; const t=BIBLE[S.book]?.[S.ch]?.[S.selV-1]||''; navigator.clipboard.writeText(`${S.book} ${S.ch}:${S.selV} — ${t}`).then(()=>toast('참조 형식으로 복사됨')); }
function ctxInsertLink(){
  closeCtx();
  if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`, ref=`${S.book} ${S.ch}:${S.selV}`;
  const nc=document.getElementById('noteContent');
  const doInsert=()=>{
    // savedRange 복원 (모달/탭 전환 후에도 커서 위치 유지)
    if(_savedRange){
      const s=window.getSelection(); s.removeAllRanges(); s.addRange(_savedRange); _savedRange=null;
    }
    insertInlineHTML(makVLink(k,ref));
    toast('구절 링크가 삽입됐어요 🔗');
  };
  if(S.panelOpen!=='notes'){ switchTab('notes'); setTimeout(doInsert,80); }
  else doInsert();
}

// ═══════════════════════════════════════════════════
