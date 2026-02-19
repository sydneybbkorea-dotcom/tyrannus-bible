// word-study.js — 원어 단어 연구 (빈도/분포/구절 목록)
async function showWordStudy(code){
  await Promise.all([loadStrongs(), loadVerseStrongs()]);
  if(!VERSE_STRONGS) return;
  const results=[], otCount={cnt:0}, ntCount={cnt:0};
  Object.entries(VERSE_STRONGS).forEach(([key, words])=>{
    words.forEach(w=>{
      if(w.codes&&w.codes.includes(code)){
        const p=key.split('_'), book=p.slice(0,-2).join('_');
        const ch=+p[p.length-2], v=+p[p.length-1];
        const isOT=BOOKS.OT.includes(book);
        if(isOT) otCount.cnt++; else ntCount.cnt++;
        results.push({book,ch,v,word:w.word});
      }
    });
  });
  const total=otCount.cnt+ntCount.cnt;
  if(!total) return '';
  const otPct=total?Math.round(otCount.cnt/total*100):0;
  let h=`<div class="ws-section"><div class="ws-title"><i class="fa fa-chart-bar"></i> 단어 연구</div>`;
  h+=`<div class="ws-freq"><span class="ws-freq-num">${total}</span>회 출현</div>`;
  h+=`<div class="ws-dist"><div class="ws-bar"><div class="ws-bar-ot" style="width:${otPct}%"></div></div>`;
  h+=`<div class="ws-dist-labels"><span>구약 ${otCount.cnt}</span><span>신약 ${ntCount.cnt}</span></div></div>`;
  h+=`<div class="ws-verses">`;
  const shown=results.slice(0,20);
  shown.forEach(r=>{
    const txt=(BIBLE?.[r.book]?.[r.ch]?.[r.v-1]||'').replace(/<[^>]+>/g,'').slice(0,50);
    h+=`<div class="ws-verse" onclick="openBibleTab('${r.book}',${r.ch},${r.v})">`;
    h+=`<span class="ws-ref">${r.book} ${r.ch}:${r.v}</span>`;
    h+=`<span class="ws-txt">${txt}...</span></div>`;
  });
  if(results.length>20) h+=`<div class="ws-more">+ ${results.length-20}개 더</div>`;
  h+=`</div></div>`;
  return h;
}
