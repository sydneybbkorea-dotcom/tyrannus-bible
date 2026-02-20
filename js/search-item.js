// search-item.js — 검색 결과 아이템 DOM 생성
function _sriEl(r, q){
  const d=document.createElement('div');
  d.className='sri';
  const safe=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const hl=r.text.replace(new RegExp(safe,'g'),`<em>${q}</em>`);
  d.innerHTML=`<div class="sri-ref">${r.ref}</div><div class="sri-txt">${hl}</div>`;

  if(r.type==='bible') d.onclick=()=>{
    S.book=r.b; S.ch=r.c; S.selV=r.v;
    S.selVSet=new Set([r.v]); renderAll();
    setTimeout(()=>{
      const row=document.querySelector(`.vrow[data-v="${r.v}"]`);
      if(row) row.scrollIntoView({behavior:'smooth',block:'center'});
    },200);
  };
  else if(r.type==='note'||r.type==='file'){
    d.onclick=()=>{
      if(typeof loadNote==='function') loadNote(r.nid,true);
      if(typeof switchTab==='function') switchTab('notes');
    };
  }
  return d;
}
