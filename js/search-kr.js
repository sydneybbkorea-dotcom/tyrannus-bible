// search-kr.js — 한글 성경 검색 (와일드카드/고급 쿼리 지원)
function _schSearchKR(q){
  if(!BIBLE) return [];
  const books=_schGetBooks(), r=[];
  const parsed=(typeof _advParseQuery==='function')?_advParseQuery(q,false):null;
  books.forEach(b=>{
    const chs=BIBLE[b]; if(!chs) return;
    Object.entries(chs).forEach(([ch,vs])=>{
      vs.forEach((t,i)=>{
        const clean=t.replace(/<[^>]+>/g,'');
        let matched=false, positions=[], cnt=0;
        if(parsed && typeof _advMatchVerse==='function'){
          const m=_advMatchVerse(clean,parsed);
          if(m){ matched=true; positions=m.positions; cnt=m.count; }
        } else if(clean.includes(q)){
          matched=true; cnt=1;
        }
        if(matched) r.push({type:'bible',book:b,b,ch:+ch,v:i+1,c:+ch,
          ref:b+' '+ch+':'+(i+1),text:clean,positions,occCount:cnt});
      });
    });
  });
  return r;
}
