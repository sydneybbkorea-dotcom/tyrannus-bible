// firebase-quota-ui.js — 용량 모달, 진행 바, 업그레이드 안내 UI (global scope)
function updateQuotaDisplay(used, limit){
  const fill=document.getElementById('quotaFill');
  const label=document.getElementById('quotaLabel');
  if(!fill||!limit) return;
  const pct=Math.min((used/limit)*100,100);
  fill.style.width=pct+'%';
  fill.className='stp-quota-fill'+(pct>=90?' quota-red':pct>=70?' quota-yellow':'');
  if(label) label.textContent=fmtMB(used)+' / '+fmtMB(limit);
  // 용량 값 색상 업데이트
  var valEl=document.querySelector('.stp-quota-val');
  if(valEl) valEl.style.color=pct>=90?'#ef4444':pct>=70?'var(--gold)':'#34d399';
}

function fmtMB(b){ return b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB'; }

function showQuotaModal(){
  const q=window.getQuotaInfo?.() || {limit:10485760,used:0,tier:'free'};
  const S=window.S, sz=window.calculateDataSize?.() || 0;
  const nSz=new Blob([JSON.stringify(S.notes||[])]).size;
  const hSz=new Blob([JSON.stringify({hl:S.hl||{},hlRanges:S.hlRanges||{},hlMemo:S.hlMemo||{}})]).size;
  const mSz=new Blob([JSON.stringify(S.verseMemo||{})]).size;
  const pct=Math.min((sz/q.limit)*100,100);
  const color=pct>=90?'var(--red)':pct>=70?'var(--gold)':'var(--green)';
  const det=document.getElementById('quotaDetail');
  if(det) det.innerHTML=`
    <div class="q-bar-wrap"><div class="q-bar-bg"><div class="q-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <div class="q-bar-text">${fmtMB(sz)} / ${fmtMB(q.limit)} (${pct.toFixed(1)}%)</div></div>
    <div class="q-breakdown"><div class="q-row"><span>${t('q.notes')}</span><span>${fmtMB(nSz)}</span></div>
    <div class="q-row"><span>${t('q.hl')}</span><span>${fmtMB(hSz)}</span></div>
    <div class="q-row"><span>${t('q.memo')}</span><span>${fmtMB(mSz)}</span></div></div>
    <div class="q-tier">${t('plan.current')} <b>${q.tier==='free'?t('plan.free'):t('plan.premium')}</b></div>`;
  openM('mQuota');
}
function showUpgradeMsg(){ toast(t('upgrade.msg')); }
