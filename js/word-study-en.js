// word-study-en.js — 영어 KJV 단어 연구 (빈도/분포/구절 목록)
async function showWordStudyEN(word){
  await loadBibleEN(); if(!KJV) return '';
  const lw=word.toLowerCase(), results=[];
  let otC=0, ntC=0;
  Object.entries(KJV).forEach(([book, chs])=>{
    const isOT=BOOKS.OT.includes(book);
    Object.entries(chs).forEach(([ch, vs])=>{
      vs.forEach((t,i)=>{
        const plain=(t||'').replace(/<[^>]+>/g,'').toLowerCase();
        if(plain.includes(lw)){
          if(isOT) otC++; else ntC++;
          results.push({book,ch:+ch,v:i+1,text:t});
        }
      });
    });
  });
  const total=otC+ntC;
  if(!total) return '';
  const otPct=total?Math.round(otC/total*100):0;
  let h=`<div class="ws-section"><div class="ws-title"><i class="fa fa-chart-bar"></i> English Word Study: "${word}"</div>`;
  h+=`<div class="ws-freq"><span class="ws-freq-num">${total}</span> occurrences</div>`;
  h+=`<div class="ws-dist"><div class="ws-bar"><div class="ws-bar-ot" style="width:${otPct}%"></div></div>`;
  h+=`<div class="ws-dist-labels"><span>OT ${otC}</span><span>NT ${ntC}</span></div></div>`;
  h+=`<div class="ws-verses">`;
  results.slice(0,20).forEach(r=>{
    const txt=(r.text||'').replace(/<[^>]+>/g,'').slice(0,50);
    h+=`<div class="ws-verse" onclick="openBibleTab('${r.book}',${r.ch},${r.v})">`;
    h+=`<span class="ws-ref">${BOOK_EN[r.book]||r.book} ${r.ch}:${r.v}</span>`;
    h+=`<span class="ws-txt">${txt}...</span></div>`;
  });
  if(results.length>20) h+=`<div class="ws-more">+ ${results.length-20} more</div>`;
  h+=`</div></div>`;
  return h;
}
