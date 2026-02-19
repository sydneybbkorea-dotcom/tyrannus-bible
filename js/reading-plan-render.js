// reading-plan-render.js — 읽기 계획 오늘/일별 카드 + 유틸
function _rpDayNum(){
  if(!S.readPlan?.start) return 0;
  const s=new Date(S.readPlan.start); const n=new Date();
  return Math.floor((n-s)/(86400000))+1;
}
function _rpTodayCard(sch,day,doneSet){
  if(day<1||day>sch.length) return '';
  const items=sch[day-1]||[];
  const done=doneSet.has(String(day));
  let h=`<div class="rp-today${done?' rp-done':''}">`;
  h+=`<div class="rp-today-head">${done?'✅':'📖'} ${day}일차 (오늘)</div>`;
  items.forEach(it=>{
    h+=`<div class="rp-today-item" onclick="S.book='${it.book}';S.ch=${it.ch};renderAll();closeSidePanel()">${it.book} ${it.ch}장</div>`;
  });
  if(!done) h+=`<button class="rp-check-btn" onclick="_rpCheck(${day})"><i class="fa fa-check"></i> 완료</button>`;
  h+=`</div>`;
  return h;
}
function _rpDayList(sch,curDay,doneSet){
  let h='<div style="margin-top:8px">';
  const start=Math.max(0,curDay-2); const end=Math.min(sch.length,curDay+5);
  for(let i=start;i<end;i++){
    const d=i+1; const done=doneSet.has(String(d));
    const items=sch[i]||[];
    const label=items.map(it=>`${it.book} ${it.ch}`).join(', ');
    const cls=d===curDay?'rp-day-cur':'';
    h+=`<div class="rp-day-row ${cls}${done?' rp-done':''}" onclick="_rpToggleDay(${d})">
      <span class="rp-day-num">${d}일</span>
      <span class="rp-day-label">${label}</span>
      <span class="rp-day-check">${done?'✅':'○'}</span>
    </div>`;
  }
  h+='</div>';
  return h;
}
function _rpCheck(d){
  if(!S.readPlan) return;
  if(!S.readPlan.done) S.readPlan.done=[];
  S.readPlan.done.push(String(d));
  persist(); renderReadingPlan();
}
function _rpToggleDay(d){
  if(!S.readPlan) return;
  if(!S.readPlan.done) S.readPlan.done=[];
  const idx=S.readPlan.done.indexOf(String(d));
  if(idx>=0) S.readPlan.done.splice(idx,1);
  else S.readPlan.done.push(String(d));
  persist(); renderReadingPlan();
}
function _rpReset(){
  S.readPlan=null; persist(); renderReadingPlan();
}
