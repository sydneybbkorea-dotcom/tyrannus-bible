// highlight-memo-notelink.js — 메모 에디터 내 "/ " 노트 링크 검색
let _memoSlashPending = false;
function memoKeyHandler(e){
  const ta = document.getElementById('markMemoText');
  if(e.key==='/'){
    _memoSlashPending = true;
    return;
  }
  if(e.key===' ' && _memoSlashPending){
    e.preventDefault();
    _memoSlashPending = false;
    removeLastSlash(ta);
    const sel = window.getSelection();
    if(sel.rangeCount) _memoNlinkRange = sel.getRangeAt(0).cloneRange();
    showMemoNoteSearch();
    return;
  }
  _memoSlashPending = false;
}

function removeLastSlash(el){
  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if(node.nodeType === Node.TEXT_NODE && range.startOffset > 0){
    const txt = node.textContent;
    const pos = range.startOffset;
    if(txt[pos-1]==='/'){
      node.textContent = txt.slice(0,pos-1) + txt.slice(pos);
      range.setStart(node, pos-1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
