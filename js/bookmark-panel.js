// bookmark-panel.js — 사이드패널 북마크 목록 렌더링
function renderBookmarks(){
  const c=document.getElementById('spBookmarkList'); if(!c) return;
  if(!S.bk||!S.bk.size){
    c.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px"><i class="fa fa-bookmark" style="font-size:20px;margin-bottom:8px;display:block;opacity:.4"></i>'+t('bk.empty')+'</div>';
    return;
  }
  const arr=[...S.bk].map(k=>{
    const p=k.split('_'), book=p.slice(0,-2).join('_'), ch=+p[p.length-2], v=+p[p.length-1];
    return {key:k, book, ch, v};
  });
  const groups={}; arr.forEach(b=>{
    if(!groups[b.book]) groups[b.book]=[];
    groups[b.book].push(b);
  });
  let h='';
  Object.entries(groups).forEach(([book, items])=>{
    h+=`<div class="bk-group-head">${book}</div>`;
    items.sort((a,b)=>a.ch-b.ch||a.v-b.v).forEach(b=>{
      const txt=BIBLE?.[b.book]?.[b.ch]?.[b.v-1]||'';
      const plain=txt.replace(/<[^>]+>/g,'').slice(0,40);
      h+=`<div class="bk-item" onclick="_bkGo('${b.book}',${b.ch},${b.v})">`;
      h+=`<span class="bk-ref">${b.ch}:${b.v}</span>`;
      h+=`<span class="bk-txt">${plain}...</span>`;
      h+=`<i class="fa fa-times bk-del" onclick="event.stopPropagation();_bkDel('${b.key}')"></i></div>`;
    });
  });
  c.innerHTML=h;
}
function _bkGo(book,ch,v){
  S.book=book; S.ch=ch; S.selV=v; S.selVSet=new Set([v]);
  updateNavPickerLabel(); renderAll();
  setTimeout(()=>document.querySelector(`.vrow[data-v="${v}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),200);
}
function _bkDel(key){ S.bk.delete(key); persist(); renderBookmarks(); }
