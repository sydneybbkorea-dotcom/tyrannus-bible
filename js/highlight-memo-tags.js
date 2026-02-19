// highlight-memo-tags.js — 메모 태그 칩 관리
let _memoTags = [];
function addMemoTag(e){
  if(e.key!=='Enter'&&e.key!==',') return;
  e.preventDefault();
  const v=e.target.value.trim().replace(/^#/,'');
  if(v&&!_memoTags.includes(v)){ _memoTags.push(v); renderMemoTags(); }
  e.target.value='';
}
function removeMemoTag(i){ _memoTags.splice(i,1); renderMemoTags(); }
function renderMemoTags(){
  const chips=document.getElementById('memoTagChips');
  if(!chips) return;
  chips.innerHTML='';
  if(!_memoTags.length){ chips.style.display='none'; return; }
  chips.style.display='flex';
  _memoTags.forEach((t,i)=>{
    const c=document.createElement('span');
    c.className='memo-tag-chip';
    c.innerHTML=`#${t} <span onclick="removeMemoTag(${i})" style="cursor:pointer;opacity:.6;margin-left:2px">✕</span>`;
    chips.appendChild(c);
  });
}
