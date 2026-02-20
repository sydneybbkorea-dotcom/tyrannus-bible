// search-stats.js — 검색 결과 통계 바 렌더링
function _schRenderStats(results){
  const area=document.getElementById('schStatsArea');
  if(!area) return;
  if(!results||!results.length){ area.innerHTML=''; return; }
  const bibleR=results.filter(r=>r.type==='bible');
  if(!bibleR.length){ area.innerHTML=''; return; }
  let otV=0,ntV=0,totalOcc=0;
  const vSet=new Set(),chSet=new Set(),bkSet=new Set();
  bibleR.forEach(r=>{
    vSet.add(r.b+'_'+r.ch+'_'+r.v);
    chSet.add(r.b+'_'+r.ch);
    bkSet.add(r.b);
    totalOcc+=r.occCount||1;
    if(BOOKS.OT.includes(r.b)) otV++; else ntV++;
  });
  const total=otV+ntV, otPct=total?Math.round(otV/total*100):0;
  let h='<div class="adv-stats">';
  h+='<span class="adv-stat-num">'+totalOcc+'</span> 출현 · ';
  h+='<span class="adv-stat-num">'+vSet.size+'</span> 절 · ';
  h+='<span class="adv-stat-num">'+chSet.size+'</span> 장 · ';
  h+='<span class="adv-stat-num">'+bkSet.size+'</span> 권</div>';
  h+='<div class="adv-bar-wrap"><div class="adv-bar">';
  h+='<div class="adv-bar-ot" style="width:'+otPct+'%"></div></div>';
  h+='<div class="adv-bar-labels"><span>구약 '+otV+'</span>';
  h+='<span>신약 '+ntV+'</span></div></div>';
  area.innerHTML=h;
}
