// highlight-memo-data.js — 메모 팝업 데이터 로딩 및 위치 조정
function highlightMemoGroup(mark){
  const gid = mark.dataset.gid;
  document.querySelectorAll('mark[data-gid]').forEach(m => m.classList.remove('hl-active'));
  if(gid){
    document.querySelectorAll(`mark[data-gid="${gid}"]`).forEach(m => m.classList.add('hl-active'));
  } else {
    mark.classList.add('hl-active');
  }
}

function loadMemoData(mark){
  const gid = mark.dataset.gid;
  const memoMark = gid ? document.querySelector(`mark[data-gid="${gid}"]`) : mark;
  const memoData = gid ? S.hlMemo?.[gid] : null;
  const nameInp = document.getElementById('markMemoName');
  const existingName = memoData?.name || '';
  nameInp.value = existingName || `하이라이트 메모 ${Object.keys(S.hlMemo||{}).length + 1}`;
  const ta = document.getElementById('markMemoText');
  const memoHtml = memoData?.html || memoMark?.dataset.memo || '';
  ta.innerHTML = memoHtml || '';
  _memoTags = [];
  if(memoData?.tags){ _memoTags = [...memoData.tags]; }
  renderMemoTags();
}

function positionMemoPopup(popup, x, y){
  const pw = 340, ph = 340;
  let lx = Math.min(x, window.innerWidth - pw - 12);
  let ly = Math.min(y + 8, window.innerHeight - ph - 12);
  if(ly < 10) ly = 10;
  popup.style.left = lx + 'px';
  popup.style.top  = ly + 'px';
  popup.style.display = 'flex';
  setTimeout(()=> document.getElementById('markMemoText')?.focus(), 50);
  setTimeout(()=> document.addEventListener('mousedown', _closeMemoOutside), 100);
}
