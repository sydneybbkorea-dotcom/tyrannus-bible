// passage-guide.js — Passage Guide 요약 카드 (주석 패널 상단)
function buildPassageGuide(vn){
  if(!vn) return '';
  const key=`${S.book}_${S.ch}_${vn}`;
  const krTxt=(BIBLE?.[S.book]?.[S.ch]?.[vn-1]||'').replace(/<[^>]+>/g,'').slice(0,80);
  const enTxt=(KJV?.[S.book]?.[S.ch]?.[vn-1]||'').replace(/<[^>]+>/g,'').slice(0,80);
  const refs=XREFS?.[key]||[];
  const linked=S.notes?S.notes.filter(n=>n.vRefs?.includes(key)):[];
  const hasHL=!!S.hl[key];
  let h='<div class="pg-card">';
  h+=`<div class="pg-ref">${S.book} ${S.ch}:${vn}</div>`;
  if(krTxt) h+=`<div class="pg-txt">${krTxt}</div>`;
  if(enTxt) h+=`<div class="pg-en">${enTxt}</div>`;
  h+=`<div class="pg-stats">`;
  if(refs.length) h+=`<span class="pg-stat"><i class="fa fa-link"></i> ${refs.length} 참조</span>`;
  if(linked.length) h+=`<span class="pg-stat"><i class="fa fa-pen"></i> ${linked.length} 노트</span>`;
  if(hasHL) h+=`<span class="pg-stat"><i class="fa fa-highlighter"></i> 하이라이트</span>`;
  h+=`</div>`;
  if(refs.length){
    h+=`<div class="pg-refs">`;
    refs.slice(0,3).forEach(r=>{
      const m=r.match(/^(.+?)\s(\d+):(\d+)$/);
      if(!m) return;
      const rTxt=(BIBLE?.[m[1]]?.[+m[2]]?.[+m[3]-1]||'').replace(/<[^>]+>/g,'').slice(0,50);
      h+=`<div class="pg-ref-item" onclick="navByRef('${r}')"><span class="pg-ref-lbl">${r}</span><span class="pg-ref-txt">${rTxt}</span></div>`;
    });
    h+=`</div>`;
  }
  h+='</div>';
  return h;
}
