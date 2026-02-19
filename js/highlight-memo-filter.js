// highlight-memo-filter.js — 메모 내 노트 필터/키보드/삽입
function filterMemoNotes(q){
  const list = document.getElementById('memoNoteSearchList');
  if(!list) return;
  q = q.toLowerCase();
  const matched = S.notes.filter(n=>!q || (n.title||'').toLowerCase().includes(q)).slice(0,15);
  if(!matched.length){
    list.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--text3)">노트를 찾을 수 없습니다</div>';
    return;
  }
  list.innerHTML = matched.map((n,i)=>{
    const f = S.folders.find(x=>x.id===n.folderId);
    return `<div class="mnsl-item${i===0?' mnsl-active':''}" data-nid="${n.id}" onclick="insertMemoNoteLink('${n.id}')">
      <i class="fa fa-file-alt" style="font-size:10px;color:var(--text3)"></i>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.title||'제목 없음'}</span>
      <span style="font-size:9px;color:var(--text3)">${f?.name||''}</span>
    </div>`;
  }).join('');
}

function memoNoteSearchKey(e){
  const list = document.getElementById('memoNoteSearchList');
  const items = list?.querySelectorAll('.mnsl-item');
  if(!items?.length) return;
  let cur = list.querySelector('.mnsl-active');
  let idx = cur ? [...items].indexOf(cur) : 0;
  if(e.key==='ArrowDown'){
    e.preventDefault(); cur?.classList.remove('mnsl-active');
    idx = (idx+1)%items.length; items[idx].classList.add('mnsl-active');
    items[idx].scrollIntoView({block:'nearest'});
  } else if(e.key==='ArrowUp'){
    e.preventDefault(); cur?.classList.remove('mnsl-active');
    idx = (idx-1+items.length)%items.length; items[idx].classList.add('mnsl-active');
    items[idx].scrollIntoView({block:'nearest'});
  } else if(e.key==='Enter'){
    e.preventDefault();
    const active = list.querySelector('.mnsl-active');
    if(active) insertMemoNoteLink(active.dataset.nid);
  } else if(e.key==='Escape'){
    document.getElementById('memoNoteSearchPopup').style.display='none';
    document.removeEventListener('mousedown', _closeMemoNoteSearch);
    document.getElementById('markMemoText')?.focus();
  }
}

function insertMemoNoteLink(noteId){
  const p = document.getElementById('memoNoteSearchPopup');
  if(p) p.style.display='none';
  document.removeEventListener('mousedown', _closeMemoNoteSearch);
  const note = S.notes.find(n=>n.id===noteId);
  if(!note) return;
  const ta = document.getElementById('markMemoText');
  if(!ta) return;
  ta.focus();
  const sel = window.getSelection();
  if(_memoNlinkRange){ sel.removeAllRanges(); sel.addRange(_memoNlinkRange); }
  const link = document.createElement('span');
  link.className = 'memo-nlink';
  link.dataset.noteid = noteId;
  link.contentEditable = 'false';
  link.setAttribute('onclick', `event.stopPropagation();loadNote('${noteId}',true);switchTab('notes')`);
  link.innerHTML = `<i class="fa fa-file-alt" style="font-size:9px"></i> ${note.title||'제목 없음'}`;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(link);
  const space = document.createTextNode('\u00A0');
  link.after(space);
  range.setStartAfter(space); range.collapse(true);
  sel.removeAllRanges(); sel.addRange(range);
  _memoNlinkRange = null;
}
