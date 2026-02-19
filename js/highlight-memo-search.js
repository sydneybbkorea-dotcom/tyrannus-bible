// highlight-memo-search.js — 메모 내 노트 검색 팝업 UI
let _memoNlinkRange = null;
function showMemoNoteSearch(){
  let popup = document.getElementById('memoNoteSearchPopup');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'memoNoteSearchPopup';
    popup.style.cssText = `position:fixed;background:var(--bg3);border:1px solid var(--border2);
      border-radius:10px;width:280px;z-index:10100;box-shadow:var(--shadow);overflow:hidden;display:none;`;
    popup.innerHTML = `
      <div style="padding:8px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px">
        <i class="fa fa-link" style="font-size:11px;color:var(--gold)"></i>
        <input id="memoNoteSearchInp" type="text" placeholder="노트 이름 검색..."
          style="flex:1;background:transparent;border:none;color:var(--text);font-size:12px;outline:none"
          oninput="filterMemoNotes(this.value)"
          onkeydown="memoNoteSearchKey(event)">
      </div>
      <div id="memoNoteSearchList" style="max-height:200px;overflow-y:auto"></div>`;
    document.body.appendChild(popup);
  }
  const memoPop = document.getElementById('markMemoPopup');
  if(memoPop){
    const r = memoPop.getBoundingClientRect();
    popup.style.left = (r.left + 20) + 'px';
    popup.style.top = (r.top + 60) + 'px';
  }
  popup.style.display = 'block';
  document.getElementById('memoNoteSearchInp').value = '';
  filterMemoNotes('');
  setTimeout(()=>document.getElementById('memoNoteSearchInp').focus(), 30);
  setTimeout(()=>document.addEventListener('mousedown', _closeMemoNoteSearch), 100);
}

function _closeMemoNoteSearch(e){
  const p = document.getElementById('memoNoteSearchPopup');
  if(p && !p.contains(e.target)){
    p.style.display='none';
    document.removeEventListener('mousedown', _closeMemoNoteSearch);
  }
}
