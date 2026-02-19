// side-search.js — 사이드패널 검색 기능
function _spDoSearch(){
  const q=document.getElementById('spSearchInput')?.value.trim();
  if(!q) return;
  const c=document.getElementById('spSearchResults'); if(!c) return;
  const fOT=document.querySelector('.sp-sch-f[data-f="OT"]')?.checked;
  const fNT=document.querySelector('.sp-sch-f[data-f="NT"]')?.checked;
  const fN=document.querySelector('.sp-sch-f[data-f="notes"]')?.checked;
  const results=[];
  if(BIBLE&&(fOT||fNT)){
    Object.entries(BIBLE).forEach(([b,chs])=>{
      if(!fOT&&BOOKS.OT.includes(b))return;
      if(!fNT&&BOOKS.NT.includes(b))return;
      Object.entries(chs).forEach(([ch,vs])=>vs.forEach((t,i)=>{
        if(t.includes(q)) results.push({type:'bible',ref:`${b} ${ch}:${i+1}`,text:t,b,c:+ch,v:i+1});
      }));
    });
  }
  if(fN&&S.notes){
    S.notes.forEach(n=>{
      const p=(n.title+' '+n.content.replace(/<[^>]+>/g,' '));
      if(p.includes(q)) results.push({type:'note',ref:n.title||'제목 없음',text:p.slice(0,80),nid:n.id});
    });
  }
  if(!results.length){
    c.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3)">결과 없음</div>';
    return;
  }
  let h=`<div style="padding:6px 10px;font-size:10px;color:var(--text3)">${results.length}개 결과</div>`;
  results.slice(0,100).forEach(r=>{
    const hl=r.text.replace(/<[^>]+>/g,'').replace(new RegExp(q,'g'),`<b style="color:var(--gold)">${q}</b>`);
    h+=`<div class="sp-note-item" onclick="_spSchNav(${r.type==='bible'?`'${r.b}',${r.c},${r.v}`:`null,null,null,'${r.nid}'`})">`;
    h+=`<span style="font-size:10px;color:var(--gold);min-width:60px;flex-shrink:0">${r.ref}</span>`;
    h+=`<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text2)">${hl}</span></div>`;
  });
  c.innerHTML=h;
}
function _spSchNav(b,ch,v,nid){
  if(nid){ loadNote(nid,true); openPanel('notes'); switchSub('notes'); return; }
  S.book=b; S.ch=ch; S.selV=v; S.selVSet=new Set([v]);
  updateNavPickerLabel(); renderAll();
  setTimeout(()=>document.querySelector(`.vrow[data-v="${v}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),200);
}
