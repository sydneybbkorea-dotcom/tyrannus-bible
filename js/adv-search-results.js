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
  const sorted=[...positions].sort((a,b)=>a.s-b.s);
  const merged=_advMergePos(sorted);
  let r='',last=0;
  merged.forEach(p=>{
    if(p.s>last) r+=_advSafe(text.slice(last,p.s));
    r+='<mark class="adv-hl">'+_advSafe(text.slice(p.s,p.e))+'</mark>';
    last=p.e;
  });
  if(last<text.length) r+=_advSafe(text.slice(last));
  return r;
}

function _advMergePos(sorted){
  if(!sorted.length) return [];
  const m=[{...sorted[0]}];
  for(let i=1;i<sorted.length;i++){
    const last=m[m.length-1];
    if(sorted[i].s<=last.e) last.e=Math.max(last.e,sorted[i].e);
    else m.push({...sorted[i]});
  }
  return m;
}

function _advSafe(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
