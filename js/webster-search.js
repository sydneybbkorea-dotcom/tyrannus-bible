// webster-search.js -- 웹스터 검색 오케스트레이션
async function searchWebster(){
  const inp=document.getElementById('websterSearchInput');
  if(!inp) return;
  const q=inp.value.trim();
  if(!q){ toast('검색어를 입력하세요'); return; }
  const el=document.getElementById('dictWebster');
  if(!el) return;
  el.innerHTML='<div class="dict-loading"><i class="fa fa-spinner fa-spin"></i> 검색 중...</div>';
  try{
    const data=await fetchWebsterDef(q);
    el.innerHTML=renderWebsterDef(data);
  }catch(e){
    el.innerHTML='<div class="comm-hint"><i class="fa fa-exclamation-triangle"></i>사전 서버에 연결할 수 없습니다<br><span style="font-size:11px;color:var(--text3)">인터넷 연결을 확인하세요</span></div>';
  }
}
