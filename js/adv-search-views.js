// adv-search-views.js — 목록/참조/트리 뷰 렌더링 함수
function _advListView(items,q){
  let h='';
  items.forEach(r=>{
    const ref=r.book+' '+r.ch+':'+r.v;
    const txt=_advHighlight(r.text,r.positions);
    h+='<div class="adv-item" onclick="_advNav(\''+r.book+'\','+r.ch+','+r.v+')">';
    h+='<span class="adv-ref">'+ref+'</span>';
    h+='<span class="adv-txt">'+txt+'</span></div>';
  });
  return h;
}

function _advRefView(items){
  let h='<div class="adv-ref-grid">';
  items.forEach(r=>{
    const short=_advShortRef(r.book,r.ch,r.v);
    h+='<span class="adv-ref-chip" onclick="_advNav(\''+r.book+'\','+r.ch+','+r.v+')" title="'+r.book+' '+r.ch+':'+r.v+'">'+short+'</span>';
  });
  return h+'</div>';
}

function _advTreeView(items,q){
  const groups={};
  items.forEach(r=>{
    if(!groups[r.book]) groups[r.book]=[];
    groups[r.book].push(r);
  });
  let h='';
  Object.keys(groups).forEach(bk=>{
    const arr=groups[bk];
    h+='<div class="adv-tree-node">';
    h+='<div class="adv-tree-head" onclick="this.parentElement.classList.toggle(\'open\')">';
    h+='<i class="fa fa-chevron-right adv-tree-arr"></i> ';
    h+=bk+' <span class="adv-tree-cnt">('+arr.length+')</span></div>';
    h+='<div class="adv-tree-body">';
    arr.forEach(r=>{
      const ref=r.ch+':'+r.v;
      const txt=_advHighlight(r.text,r.positions);
      h+='<div class="adv-item adv-tree-item" onclick="_advNav(\''+r.book+'\','+r.ch+','+r.v+')">';
      h+='<span class="adv-ref">'+ref+'</span>';
      h+='<span class="adv-txt">'+txt+'</span></div>';
    });
    h+='</div></div>';
  });
  return h;
}
