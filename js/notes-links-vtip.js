// notes-links-vtip.js — 노트 내 구절 링크 호버 툴팁 + nlink 클릭
function setupVTip(){
  const nc = document.getElementById('noteContent');
  const tip = document.getElementById('vtip');
  if(!nc || !tip) return;
  let _tipEl = null;

  function hideTip(){ tip.style.display='none'; _tipEl=null; }

  nc.addEventListener('mouseover', e=>{
    const el = e.target.closest('.vlink');
    if(!el) return;
    if(el === _tipEl) return;
    _tipEl = el;
    const k = el.dataset.ref; if(!k) return;
    const p = k.split('_');
    const txt = BIBLE[p[0]]?.[parseInt(p[1])]?.[parseInt(p[2])-1] || '';
    document.getElementById('vtip-ref').textContent = el.dataset.refLabel || k;
    document.getElementById('vtip-txt').textContent = txt;
    const rect = el.getBoundingClientRect();
    const tipW = 280;
    let left = rect.left;
    if(left + tipW > window.innerWidth - 10) left = window.innerWidth - tipW - 10;
    tip.style.left = left + 'px';
    tip.style.top  = (rect.bottom + 6) + 'px';
    tip.style.display = 'block';
  });

  nc.addEventListener('mouseleave', ()=>hideTip());
  nc.addEventListener('mouseout', e=>{
    if(!_tipEl) return;
    if(!_tipEl.contains(e.relatedTarget)) hideTip();
  });

  nc.addEventListener('click', e=>{
    const nl = e.target.closest('.nlink');
    if(!nl) return;
    e.preventDefault(); e.stopPropagation();
    const nid = nl.dataset.noteid;
    if(!nid) return;
    loadNote(nid, true);
    switchTab('notes');
  });
}
