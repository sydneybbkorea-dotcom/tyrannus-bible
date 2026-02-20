// search-en.js — 영어(KJV) + 원어(스트롱) 검색
async function _schSearchEN(q){
  if(typeof loadBibleEN==='function') await loadBibleEN();
  if(!KJV) return [];
  const parsed=(typeof _advParseQuery==='function')?_advParseQuery(q,_schCaseSensitive):null;
  const books=_schGetBooks(), r=[];
  books.forEach(b=>{
    const enKey=(typeof _advKrToEnBook==='function')?_advKrToEnBook(b):b;
    const chs=KJV[enKey]; if(!chs) return;
    Object.entries(chs).forEach(([ch,vs])=>{
      vs.forEach((t,i)=>{
        if(!t) return;
        const clean=(t||'').replace(/<[^>]+>/g,'');
        let matched=false, positions=[], cnt=0;
        if(parsed && typeof _advMatchVerse==='function'){
          const m=_advMatchVerse(clean,parsed);
          if(m){ matched=true; positions=m.positions; cnt=m.count; }
        } else if(clean.toLowerCase().includes(q.toLowerCase())){
          matched=true; cnt=1;
        }
        if(matched) r.push({type:'bible',book:b,b,ch:+ch,v:i+1,c:+ch,
          ref:b+' '+ch+':'+(i+1),text:clean,positions,occCount:cnt});
      });
    });
  });
  return r;
}

async function _schSearchOrig(q){
  if(typeof loadStrongs==='function') await loadStrongs();
  if(typeof loadVerseStrongs==='function') await loadVerseStrongs();
  if(!VERSE_STRONGS) return [];
  const code=q.toUpperCase().trim(), r=[];
  const bookSet=new Set(_schGetBooks());
  Object.entries(VERSE_STRONGS).forEach(([key,words])=>{
    const p=key.split('_'), book=p.slice(0,-2).join('_');
    if(!bookSet.has(book)) return;
    words.forEach(w=>{
      if(w.codes&&w.codes.includes(code)){
        r.push({type:'bible',book,b:book,ch:+p[p.length-2],v:+p[p.length-1],
          c:+p[p.length-2],ref:book+' '+p[p.length-2]+':'+p[p.length-1],
          text:w.word,code,positions:[],occCount:1});
      }
    });
  });
  return r;
}
