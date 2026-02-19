// adv-search-results.js — 3가지 뷰 모드 렌더링 + 하이라이트 + 네비게이션
var _advPage=0, _advPageSize=200;

function _advRenderResultList(results,q){
  const c=document.getElementById('advResults');
  if(!c) return;
  if(!results||!results.length){
    c.innerHTML='<div class="adv-empty">검색 결과가 없습니다</div>';
    return;
  }
  const slice=results.slice(0,(_advPage+1)*_advPageSize);
  let h='';
  if(_advViewMode==='list') h=_advListView(slice,q);
  else if(_advViewMode==='ref') h=_advRefView(slice);
  else h=_advTreeView(slice,q);
  if(results.length>slice.length){
    h+='<button class="adv-more" onclick="_advLoadMore()">';
    h+='더 보기 ('+slice.length+'/'+results.length+')</button>';
  }
  c.innerHTML=h;
}

function _advLoadMore(){
  _advPage++;
  if(_advLastResults) _advRenderResultList(_advLastResults,_advLastQ);
}

function _advHighlight(text,positions){
  if(!positions||!positions.length) return _advSafe(text);
  const s=_advSafe(text);
  const sorted=[...positions].sort((a,b)=>a.s-b.s);
  let r='',last=0;
  sorted.forEach(p=>{
    if(p.s>last) r+=s.slice(last,p.s);
    r+='<mark class="adv-hl">'+s.slice(p.s,p.e)+'</mark>';
    last=p.e;
  });
  if(last<s.length) r+=s.slice(last);
  return r;
}

function _advSafe(s){
  return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
