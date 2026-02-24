// search-extra.js — 노트/주석/파일 검색 + 필터된 책 목록
function _schSearchExtra(q, results){
  // 노트 검색
  if(searchFilters.notes && Array.isArray(S.notes)){
    S.notes.forEach(n=>{
      if(!n) return;
      const p=(n.title||'')+' '+(n.content||'').replace(/<[^>]+>/g,' ');
      if(p.includes(q)) results.push({
        type:'note',ref:'📝 '+(n.title||'무제'),
        text:p,nid:n.id,b:'',ch:0,v:0,positions:[],occCount:1
      });
    });
  }
  // 파일 검색
  if(searchFilters.files && Array.isArray(S.notes)){
    S.notes.forEach(n=>{
      if(!n||!Array.isArray(n.files)) return;
      n.files.forEach(f=>{
        const name=f.name||f.filename||'';
        if(name.includes(q)) results.push({
          type:'file',ref:'📎 '+name,
          text:'노트: '+(n.title||'무제'),nid:n.id,b:'',ch:0,v:0,positions:[],occCount:1
        });
      });
    });
  }
}

function _schGetBooks(){
  const sel=(document.getElementById('sfBookSel')?.value)||'';
  if(sel) return [sel];
  const all=[...BOOKS.OT,...BOOKS.NT];
  if(searchFilters.OT && searchFilters.NT) return all;
  if(searchFilters.OT) return [...BOOKS.OT];
  if(searchFilters.NT) return [...BOOKS.NT];
  return all;
}
