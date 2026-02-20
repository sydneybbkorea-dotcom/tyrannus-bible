// search-views.js — 목록/참조/트리 뷰 렌더링 (통합 검색용)
function _schListView(items,q){
  let h='';
  items.forEach(r=>{
    const ref=r.ref||r.book+' '+r.ch+':'+r.v;
    const txt=(r.positions&&r.positions.length&&typeof _advHighlight==='function')
      ? _advHighlight(r.text,r.positions)
      : _schHighlight(r.text,q);
    h+='<div class="adv-item" onclick="_schNav(\''+_esc(r.b||r.book)+'\','+r.ch+','+r.v+','+(r.nid?'\''+r.nid+'\'':'null')+',\''+_esc(r.type)+'\')">';
    h+='<span class="adv-ref">'+ref+'</span>';
    h+='<span class="adv-txt">'+txt+'</span></div>';
  });
  return h;
}

function _schRefView(items){
  let h='<div class="adv-ref-grid">';
  items.forEach(r=>{
    const short=(typeof _advShortRef==='function')?_advShortRef(r.b||r.book,r.ch,r.v):(r.ref||'');
    h+='<span class="adv-ref-chip" onclick="_schNav(\''+_esc(r.b||r.book)+'\','+r.ch+','+r.v+',null,\'bible\')" title="'+(r.ref||'')+'">'+short+'</span>';
  });
  return h+'</div>';
}

function _schTreeView(items,q){
  const groups={};
  items.forEach(r=>{ const bk=r.b||r.book; if(!groups[bk]) groups[bk]=[]; groups[bk].push(r); });
  let h='';
  Object.keys(groups).forEach(bk=>{
    const arr=groups[bk];
    h+='<div class="adv-tree-node">';
    h+='<div class="adv-tree-head" onclick="this.parentElement.classList.toggle(\'open\')">';
    h+='<i class="fa fa-chevron-right adv-tree-arr"></i> '+bk;
    h+=' <span class="adv-tree-cnt">('+arr.length+')</span></div>';
    h+='<div class="adv-tree-body">';
    arr.forEach(r=>{
      const ref=r.ch+':'+r.v;
      const txt=(r.positions&&r.positions.length&&typeof _advHighlight==='function')?_advHighlight(r.text,r.positions):_schHighlight(r.text,q);
      h+='<div class="adv-item adv-tree-item" onclick="_schNav(\''+_esc(r.b||r.book)+'\','+r.ch+','+r.v+',null,\'bible\')">';
      h+='<span class="adv-ref">'+ref+'</span><span class="adv-txt">'+txt+'</span></div>';
    });
    h+='</div></div>';
  });
  return h;
}

function _esc(s){ return (s||'').replace(/'/g,"\\'"); }
