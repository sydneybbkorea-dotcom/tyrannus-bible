// advanced-search.js — 원어 검색 (고급 검색) 로직
var _advMode='korean';
function _advSetMode(mode){
  _advMode=mode;
  document.querySelectorAll('.adv-tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===mode));
  document.getElementById('advSearchInput')?.focus();
  const ph={korean:'한글 검색어...',english:'English word...',original:'H1234 또는 G5678...'};
  const inp=document.getElementById('advSearchInput');
  if(inp) inp.placeholder=ph[mode]||'';
}
async function _advDoSearch(){
  const q=(document.getElementById('advSearchInput')?.value||'').trim();
  if(!q) return;
  const c=document.getElementById('advResults'); if(!c) return;
  c.innerHTML='<div style="padding:12px;text-align:center;color:var(--text3)"><i class="fa fa-spinner fa-spin"></i></div>';
  let results=[];
  if(_advMode==='korean') results=_advSearchKorean(q);
  else if(_advMode==='english') results=await _advSearchEnglish(q);
  else if(_advMode==='original') results=await _advSearchOriginal(q);
  _advRenderResults(results, q);
}
function _advSearchKorean(q){
  if(!BIBLE) return [];
  const r=[];
  Object.entries(BIBLE).forEach(([b,chs])=>{
    Object.entries(chs).forEach(([ch,vs])=>vs.forEach((t,i)=>{
      if(t.includes(q)) r.push({book:b,ch:+ch,v:i+1,text:t});
    }));
  });
  return r;
}
async function _advSearchEnglish(q){
  await loadBibleEN(); if(!KJV) return [];
  const lw=q.toLowerCase(), r=[];
  Object.entries(KJV).forEach(([b,chs])=>{
    Object.entries(chs).forEach(([ch,vs])=>vs.forEach((t,i)=>{
      if((t||'').toLowerCase().includes(lw)) r.push({book:b,ch:+ch,v:i+1,text:t});
    }));
  });
  return r;
}
