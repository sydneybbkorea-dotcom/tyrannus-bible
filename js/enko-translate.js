// enko-translate.js -- 독립 번역 함수 (컨텍스트 메뉴 연동용)
async function translateToKorean(text){
  if(!text) return;
  const el=document.getElementById('dictEnko');
  if(!el) return;
  el.innerHTML='<div class="dict-loading"><i class="fa fa-spinner fa-spin"></i> 번역 중...</div>';
  try{
    const t=await fetchEnkoTranslation(text);
    if(t){
      let h='<div class="comm-ref-lbl"><i class="fa fa-language"></i> 번역</div>';
      h+=`<div class="dict-ko-card"><span class="dict-ko-text">${t}</span></div>`;
      el.innerHTML=h;
    }else{
      el.innerHTML='<div class="comm-hint"><i class="fa fa-exchange-alt"></i>번역 결과가 없습니다</div>';
    }
  }catch(e){
    el.innerHTML='<div class="comm-hint"><i class="fa fa-exclamation-triangle"></i>번역 서버 연결 실패</div>';
  }
}
