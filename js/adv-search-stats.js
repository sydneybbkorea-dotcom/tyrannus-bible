// adv-search-stats.js — 통계 계산(출현수, 절/장/권, OT/NT) + 통계 HTML
function _advCalcStats(results){
  if(!results||!results.length) return null;
  const vSet=new Set(), chSet=new Set(), bkSet=new Set();
  let otV=0, ntV=0, totalOcc=0;
  results.forEach(r=>{
    const vk=r.book+'_'+r.ch+'_'+r.v;
    vSet.add(vk);
    chSet.add(r.book+'_'+r.ch);
    bkSet.add(r.book);
    totalOcc+=r.occCount||1;
    if(BOOKS.OT.includes(r.book)) otV++;
    else ntV++;
  });
  return {
    totalOcc, verseCount:vSet.size,
    chapterCount:chSet.size, bookCount:bkSet.size,
    otV, ntV
  };
}

function _advRenderStats(stats){
  if(!stats) return '';
  const total=stats.otV+stats.ntV;
  const otPct=total?Math.round(stats.otV/total*100):0;
  let h='<div class="adv-stats">';
  h+='<span class="adv-stat-num">'+stats.totalOcc+'</span> 출현 · ';
  h+='<span class="adv-stat-num">'+stats.verseCount+'</span> 절 · ';
  h+='<span class="adv-stat-num">'+stats.chapterCount+'</span> 장 · ';
  h+='<span class="adv-stat-num">'+stats.bookCount+'</span> 권';
  h+='</div>';
  h+=_advBarHTML(otPct,stats.otV,stats.ntV);
  return h;
}

function _advBarHTML(otPct,otV,ntV){
  let h='<div class="adv-bar-wrap">';
  h+='<div class="adv-bar">';
  h+='<div class="adv-bar-ot" style="width:'+otPct+'%"></div>';
  h+='</div>';
  h+='<div class="adv-bar-labels">';
  h+='<span>구약 '+otV+'</span><span>신약 '+ntV+'</span>';
  h+='</div></div>';
  return h;
}
