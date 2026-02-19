// reading-plan.js — 읽기 계획 UI 렌더링 + 로직
function renderReadingPlan(){
  const el=document.getElementById('spReadingContent');
  if(!el) return;
  if(!S.readPlan||!S.readPlan.id){
    _rpShowPicker(el); return;
  }
  _rpShowProgress(el);
}
function _rpShowPicker(el){
  let h='<div style="padding:12px">';
  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:10px">읽기 계획을 선택하세요</div>';
  Object.entries(READING_PLANS).forEach(([id,p])=>{
    h+=`<div class="rp-plan-card" onclick="_rpStart('${id}')">
      <div class="rp-plan-name"><i class="fa fa-book-open"></i> ${p.name}</div>
      <div class="rp-plan-desc">${p.desc}</div>
      <div class="rp-plan-days">${p.days}일</div>
    </div>`;
  });
  h+='</div>';
  el.innerHTML=h;
}
