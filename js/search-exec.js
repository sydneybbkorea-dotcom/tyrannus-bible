// search-exec.js — Full search (Bible, notes, commentary, files)
function doSearch(){
  const q=document.getElementById('schInput').value.trim();
  if(!q) return;
  const results=[];
  const bookSel=(document.getElementById('sfBookSel')?.value)||'';

  // Bible search (OT/NT, optional book filter)
  if(searchFilters.OT || searchFilters.NT){
    Object.entries(BIBLE).forEach(([b,chs])=>{
      if(!searchFilters.OT && BOOKS.OT.includes(b)) return;
      if(!searchFilters.NT && BOOKS.NT.includes(b)) return;
      if(bookSel && b!==bookSel) return;
      Object.entries(chs).forEach(([c,vs])=>vs.forEach((t,i)=>{
        if(t.includes(q)) results.push({
          type:'bible', ref:`${b} ${c}:${i+1}`,
          text:t, b, c:+c, v:i+1
        });
      }));
    });
  }

  // Notes search
  if(searchFilters.notes && Array.isArray(S.notes)){
    S.notes.forEach(n=>{
      if(!n) return;
      const p=(n.title||'')+' '+(n.content||'').replace(/<[^>]+>/g,' ');
      if(p.includes(q)) results.push({
        type:'note', ref:`📝 ${n.title||'무제'}`,
        text:p.slice(0,120), nid:n.id
      });
    });
  }

  // Commentary search
  if(searchFilters.commentary){
    // TODO: commentary data 사용 가능 시 구현
  }

  // Files search (노트 첨부파일)
  _searchFiles(q, results);

  _renderResults(q, results);
}
