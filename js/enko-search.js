// enko-search.js -- 영한 검색 오케스트레이션 (Promise.all 병렬)
async function searchEnko(){
  const inp=document.getElementById('enkoSearchInput');
  if(!inp) return;
  const q=inp.value.trim();
  if(!q){ toast('검색어를 입력하세요'); return; }
  const el=document.getElementById('dictEnko');
  if(!el) return;
  el.innerHTML='<div class="dict-loading"><i class="fa fa-spinner fa-spin"></i> 검색 중...</div>';
  try{
    const [data,trans]=await Promise.all([fetchEnkoDef(q),fetchEnkoTranslation(q)]);
    el.innerHTML=renderEnkoDef(data,trans);
  }catch(e){
    el.innerHTML='<div class="comm-hint"><i class="fa fa-exclamation-triangle"></i>사전 서버에 연결할 수 없습니다</div>';
  }
}
