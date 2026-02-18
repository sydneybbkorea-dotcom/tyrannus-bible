// ui-utils.js — 모달, 토스트, 상태 표시줄, 검색필터 유틸리티
function setFilter(el,f){
  S.schFilter=f;
  document.querySelectorAll('.sch-chip').forEach(c=>c.classList.remove('on'));
  if(el) el.classList.add('on');
}

function openM(id){
  const el=document.getElementById(id);
  if(el) el.classList.add('show');
}
function closeM(id){
  const el=document.getElementById(id);
  if(el) el.classList.remove('show');
}

// 모달 바깥 클릭으로 닫기
document.querySelectorAll('.modal-bg').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('show'); });
});

// 폴더 생성 모달 Enter 키
const _mFolder=document.getElementById('mFolderName');
if(_mFolder) _mFolder.addEventListener('keydown',e=>{ if(e.key==='Enter' && typeof createFolder==='function') createFolder(); });

function updateStat(){
  const hlEl = document.getElementById('stHL');
  const nEl = document.getElementById('stN');
  if(hlEl) hlEl.textContent = Object.keys(S.hl||{}).length;
  if(nEl) nEl.textContent = (S.notes||[]).length;
}

let _tt;
function toast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'),2500);
}
