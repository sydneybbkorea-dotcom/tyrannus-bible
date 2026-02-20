// reading-plan-ui.js — 읽기 계획 진행률 + 일별 분량 UI
function _rpStart(planId){
  const plan=READING_PLANS[planId]; if(!plan) return;
  S.readPlan={id:planId,start:new Date().toISOString().slice(0,10),done:[]};
  persist(); renderReadingPlan();
}
function _rpShowProgress(el){
  const plan=READING_PLANS[S.readPlan.id];
  if(!plan){ _rpShowPicker(el); return; }
  const schedule=plan.gen();
  const dayNum=_rpDayNum();
  const doneSet=new Set(S.readPlan.done||[]);
  const pct=Math.round((doneSet.size/plan.days)*100);
  let h=`<div style="padding:10px">`;
  h+=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <span class="rp-title">${plan.name}</span>
    <button onclick="_rpReset()" style="font-size:10px;color:var(--text3);background:none;border:1px solid var(--border);border-radius:4px;padding:2px 8px;cursor:pointer">${t('rp.reset')}</button>
  </div>`;
  h+=`<div class="rp-progress"><div class="rp-progress-fill" style="width:${pct}%"></div></div>`;
  h+=`<div style="font-size:10px;color:var(--text3);margin-bottom:10px">${doneSet.size}/${plan.days}${t('rp.days')}${pct}%)</div>`;
  h+=_rpTodayCard(schedule,dayNum,doneSet);
  h+=_rpDayList(schedule,dayNum,doneSet);
  h+=`</div>`;
  el.innerHTML=h;
}
