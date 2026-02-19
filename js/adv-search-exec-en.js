// adv-search-exec-en.js — 영어/원어 검색 실행 로직
async function _advSearchEN(q){
  if(typeof loadBibleEN==='function') await loadBibleEN();
  if(!KJV) return [];
  const parsed=_advParseQuery(q,_advCaseSensitive);
  if(!parsed) return [];
  const books=_advGetFilteredBooks(), r=[];
  books.forEach(b=>{
    const chs=KJV[b]; if(!chs) return;
    Object.entries(chs).forEach(([ch,vs])=>{
      vs.forEach((t,i)=>{
        if(!t) return;
        const clean=(t||'').replace(/<[^>]+>/g,'');
        const m=_advMatchVerse(clean,parsed);
        if(m) r.push({book:b,ch:+ch,v:i+1,text:clean,
          positions:m.positions,occCount:m.count});
      });
    });
  });
  return r;
}

async function _advSearchOrig(q){
  if(typeof loadStrongs==='function') await loadStrongs();
  if(typeof loadVerseStrongs==='function') await loadVerseStrongs();
  if(!VERSE_STRONGS) return [];
  const code=q.toUpperCase().trim(), r=[];
  const books=_advGetFilteredBooks();
  const bookSet=new Set(books);
  Object.entries(VERSE_STRONGS).forEach(([key,words])=>{
    const p=key.split('_'), book=p.slice(0,-2).join('_');
    if(!bookSet.has(book)) return;
    words.forEach(w=>{
      if(w.codes&&w.codes.includes(code)){
        r.push({book,ch:+p[p.length-2],v:+p[p.length-1],
          text:w.word,code,positions:[],occCount:1});
      }
    });
  });
  return r;
}
