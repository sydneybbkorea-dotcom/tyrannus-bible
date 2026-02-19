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
    /* 성경 본문 서식(명조/돋움/볼드/이탤릭)을 보존하여 표시 */
    const vtipTxt = document.getElementById('vtip-txt');
    vtipTxt.innerHTML = `<span class="vtxt" style="font-family:'KoPubWorld Batang','Noto Serif KR',serif;font-size:13px;line-height:1.75;">${txt}</span>`;
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
