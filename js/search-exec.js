// Full search execution (Bible, notes, commentary)
function doSearch(){
  const q=document.getElementById('schInput').value.trim(); if(!q)return;
  const results=[];

  // Search in Bible (OT/NT)
  if(searchFilters.OT || searchFilters.NT){
    Object.entries(BIBLE).forEach(([b,chs])=>{
      if(!searchFilters.OT && BOOKS.OT.includes(b))return;
      if(!searchFilters.NT && BOOKS.NT.includes(b))return;
      Object.entries(chs).forEach(([c,vs])=>vs.forEach((t,i)=>{
        if(t.includes(q))results.push({type:'bible',ref:`${b} ${c}:${i+1}`,text:t,b,c:+c,v:i+1})
      }));
    });
  }

  // Search in notes
  if(searchFilters.notes){
    S.notes.forEach(n=>{
      const p=(n.title+' '+n.content.replace(/<[^>]+>/g,' '));
      if(p.includes(q))results.push({type:'note',ref:`📝 ${n.title}`,text:p.slice(0,100),nid:n.id})
    });
  }

  // Search in commentary (placeholder - will be implemented later)
  if(searchFilters.commentary){
    // TODO: Add commentary search when commentary data is available
  }

  document.getElementById('schCount').textContent=`${results.length}개의 결과`;
  const list=document.getElementById('schList'); list.innerHTML='';
  if(!results.length){
    list.innerHTML=`<div style="text-align:center;color:var(--text3);padding:24px;font-size:12px">검색 결과가 없어요</div>`;
    return;
  }
  results.forEach(r=>{
    const d=document.createElement('div'); d.className='sri';
    const hl=r.text.replace(new RegExp(q,'g'),`<em>${q}</em>`);
    d.innerHTML=`<div class="sri-ref">${r.ref}</div><div class="sri-txt">${hl}</div>`;
    if(r.type==='bible') d.onclick=()=>{
      S.book=r.b;S.ch=r.c;S.selV=r.v;renderAll();
      setTimeout(()=>{
        const row=document.querySelector(`.vrow[data-v="${r.v}"]`);
        if(row)row.scrollIntoView({behavior:'smooth',block:'center'})
      },200)
    };
    else d.onclick=()=>{loadNote(r.nid,true);switchTab('notes')};
    list.appendChild(d);
  });
}
