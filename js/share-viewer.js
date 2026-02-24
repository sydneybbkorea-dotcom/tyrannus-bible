// share-viewer.js — 공유받은 콘텐츠 뷰어 (일반 script)

// ── 폴더 트리에 공유받은 폴더 렌더 ─────────────
function _svRenderSharedFolders(cont){
  if(!cont) return;
  const items = (S.sharedWithMe||[]).filter(s=>s.type==='folder');
  if(!items.length) return;

  // 구분선
  const sep = document.createElement('div');
  sep.className = 'sv-separator';
  sep.innerHTML = '<span class="sv-sep-line"></span><span class="sv-sep-label">공유받은 폴더</span><span class="sv-sep-line"></span>';
  cont.appendChild(sep);

  items.forEach(s=>{
    const data = window._sharedCache[s.shareCode];
    if(!data) return;

    const wrap = document.createElement('div');
    wrap.className = 'ft-node sv-shared-node';

    // 폴더 헤드
    const head = document.createElement('div');
    head.className = 'ft-head sv-shared-head';
    head.style.paddingLeft = '8px';
    head.innerHTML = '<span class="ft-arrow-sp"></span>'
      + '<i class="fa fa-folder-open sv-folder-icon"></i>'
      + '<span class="ft-name">' + _escHtml(data.folderName||s.label) + '</span>'
      + '<span class="sv-owner-badge">' + _escHtml(s.ownerName) + '</span>';
    head.onclick = function(){ _svToggleSharedFolder(s.shareCode); };
    wrap.appendChild(head);

    // 노트 목록 (토글)
    if(wrap.classList.contains('sv-open') || document.querySelector('.sv-shared-node[data-code="'+s.shareCode+'"].sv-open')){
      _svAppendNotes(wrap, data, s);
    }
    wrap.dataset.code = s.shareCode;
    cont.appendChild(wrap);
  });

  // 열려있는 폴더 복원
  cont.querySelectorAll('.sv-shared-node').forEach(node=>{
    const code = node.dataset.code;
    if(window._svOpenFolders && window._svOpenFolders.has(code)){
      node.classList.add('sv-open');
      const data = window._sharedCache[code];
      const s = (S.sharedWithMe||[]).find(x=>x.shareCode===code);
      if(data && s) _svAppendNotes(node, data, s);
    }
  });
}

// 열린 공유 폴더 상태
window._svOpenFolders = window._svOpenFolders || new Set();

function _svToggleSharedFolder(code){
  if(window._svOpenFolders.has(code)){
    window._svOpenFolders.delete(code);
  } else {
    window._svOpenFolders.add(code);
  }
  if(typeof renderFolderTree === 'function') renderFolderTree();
}

function _svAppendNotes(wrap, data, shareInfo){
  const notes = data.notes || [];
  if(!notes.length){
    const empty = document.createElement('div');
    empty.className = 'sv-empty-note';
    empty.textContent = '(노트 없음)';
    empty.style.paddingLeft = '32px';
    wrap.appendChild(empty);
    return;
  }
  notes.forEach(n=>{
    const nEl = document.createElement('div');
    nEl.className = 'ft-note-row sv-shared-note';
    nEl.style.paddingLeft = '32px';
    nEl.innerHTML = '<i class="fa fa-file-alt sv-note-icon"></i>'
      + '<span class="ft-note-title">' + _escHtml(n.title||'제목 없음') + '</span>'
      + '<i class="fa fa-lock sv-lock-icon"></i>';
    nEl.onclick = function(){ _svShowSharedNote(n, shareInfo.ownerName); };
    wrap.appendChild(nEl);
  });
}

// ── 읽기 전용 노트 뷰어 ────────────────────────
function _svShowSharedNote(note, ownerName){
  // 노트 에디터를 읽기 전용으로 열기
  const editor = document.getElementById('noteContent');
  const titleEl = document.getElementById('noteTitle');
  const tagsEl = document.getElementById('tagContainer');

  if(titleEl) titleEl.value = note.title || '제목 없음';
  if(editor) editor.innerHTML = note.content || '';

  // 읽기 전용 배너 추가
  let banner = document.getElementById('svReadOnlyBanner');
  if(!banner){
    banner = document.createElement('div');
    banner.id = 'svReadOnlyBanner';
    banner.className = 'sv-readonly-banner';
    const editorWrap = editor?.parentElement;
    if(editorWrap) editorWrap.insertBefore(banner, editorWrap.firstChild);
  }
  banner.innerHTML = '<i class="fa fa-lock"></i> 읽기 전용 — ' + _escHtml(ownerName) + '님의 공유 노트';
  banner.style.display = 'flex';

  // 편집 비활성화
  if(editor) editor.contentEditable = 'false';
  if(titleEl) titleEl.readOnly = true;

  // 태그 숨기기
  if(tagsEl) tagsEl.style.display = 'none';

  // 노트 패널로 전환
  S._noteSubTab = 'notes';
  S.curNoteId = null; // 내 노트가 아님
  window._svReadOnly = true;

  // 노트 패널 열기
  if(typeof openPanel === 'function') openPanel('notes');
}

// 읽기 전용 해제 (내 노트로 돌아갈 때)
function _svClearReadOnly(){
  window._svReadOnly = false;
  const banner = document.getElementById('svReadOnlyBanner');
  if(banner) banner.style.display = 'none';
  const editor = document.getElementById('noteContent');
  const titleEl = document.getElementById('noteTitle');
  const tagsEl = document.getElementById('tagContainer');
  if(editor) editor.contentEditable = 'true';
  if(titleEl) titleEl.readOnly = false;
  if(tagsEl) tagsEl.style.display = '';
}

// ── 공유 하이라이트를 성경 본문에 오버레이 ─────
function _svApplySharedHighlights(){
  const cont = document.getElementById('vCont');
  if(!cont) return;

  // 기존 공유 오버레이 제거
  cont.querySelectorAll('.sv-hl-overlay').forEach(el=>el.remove());

  const sharedHL = (S.sharedWithMe||[]).filter(s=>s.type==='highlights');
  if(!sharedHL.length) return;

  sharedHL.forEach(s=>{
    const data = window._sharedCache[s.shareCode];
    if(!data || !data.hlRanges) return;

    const chKey = S.book + '_' + S.ch;
    // hlRanges 순회: key 형식은 "book_ch_v" 또는 range 형태
    Object.entries(data.hlRanges).forEach(([key, ranges])=>{
      if(!key.startsWith(chKey + '_')) return;
      ranges.forEach(r=>{
        const vn = key.split('_')[2];
        if(!vn) return;
        const row = cont.querySelector('.vrow[data-v="' + vn + '"]');
        if(!row) return;
        // 이미 내 HL과 겹치면 점선만 추가
        if(!row.querySelector('.sv-hl-overlay')){
          const overlay = document.createElement('span');
          overlay.className = 'sv-hl-overlay';
          overlay.title = s.ownerName + '의 하이라이트';
          if(r.color) overlay.dataset.color = r.color.toLowerCase();
          row.appendChild(overlay);
        }
      });
    });
  });
}
