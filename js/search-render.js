// search-render.js — 통합 검색 결과 렌더링 (목록/참조/트리)
function _schRenderAll(results, q){
  const cnt=document.getElementById('schCount');
  if(cnt) cnt.textContent=results.length+t('sch.results');
  const list=document.getElementById('schList');
  if(!list) return;
  if(!results.length){
    list.innerHTML='<div class="adv-empty">'+t('sch.empty')+'</div>';
    return;
  }
  const slice=results.slice(0,(_schPage+1)*_schPageSize);
  let h='';
  if(_schViewMode==='list') h=_schListView(slice,q);
  else if(_schViewMode==='ref') h=_schRefView(slice);
  else h=_schTreeView(slice,q);
  if(results.length>slice.length){
    h+='<button class="adv-more" onclick="_schMore()">'+t('sch.more')+' ('+slice.length+'/'+results.length+')</button>';
  }
  list.innerHTML=h;
}

function _schMore(){
  _schPage++;
  if(_schLastResults) _schRenderAll(_schLastResults,_schLastQ);
}
