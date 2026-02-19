// notes-links-embed.js — DOM 노드 삽입 및 팝오버 유틸
function insertNodeAtCursor(node){
  const nc = document.getElementById('noteContent');
  if(!nc) return;
  nc.focus();
  let range;
  if(_savedRange){
    range = _savedRange.cloneRange();
    _savedRange = null;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    const sel = window.getSelection();
    if(sel && sel.rangeCount > 0) range = sel.getRangeAt(0);
  }
  if(!range) { nc.appendChild(node); return; }
  range.deleteContents();
  range.insertNode(node);
  const after = document.createTextNode('​');
  node.parentNode.insertBefore(after, node.nextSibling);
  const newRange = document.createRange();
  newRange.setStartAfter(after);
  newRange.collapse(true);
  const sel2 = window.getSelection();
  sel2.removeAllRanges();
  sel2.addRange(newRange);
}

function showPopover(id, btnEl){
  const pop = document.getElementById(id);
  if(!pop) return;
  const rect = btnEl.getBoundingClientRect();
  pop.style.position = 'fixed';
  pop.style.zIndex = '10100';
  pop.style.display = 'block';
  const pw = pop.offsetWidth || 300;
  const ph = pop.offsetHeight || 180;
  let top = rect.bottom + 6;
  let left = rect.left;
  if(top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
  if(left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
  if(left < 6) left = 6;
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
  setTimeout(()=>{
    function outside(e){
      if(!pop.contains(e.target) && e.target !== btnEl){
        pop.style.display = 'none';
        document.removeEventListener('mousedown', outside);
      }
    }
    document.addEventListener('mousedown', outside);
  }, 10);
}
function hidePopover(id){ const p=document.getElementById(id); if(p) p.style.display='none'; }
