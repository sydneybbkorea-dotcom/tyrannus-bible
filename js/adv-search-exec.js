// adv-search-exec.js — 검색 실행 로직 (한글/영어/원어)
async function _advDoSearch(){
  const q=(document.getElementById('advSearchInput')?.value||'').trim();
  if(!q) return;
  _advLastQ=q; _advPage=0;
  const c=document.getElementById('advResults');
  if(c) c.innerHTML='<div class="adv-loading"><i class="fa fa-spinner fa-spin"></i></div>';
  let results=[];
  try{
    if(_advMode==='korean') results=_advSearchKR(q);
    else if(_advMode==='english') results=await _advSearchEN(q);
    else results=await _advSearchOrig(q);
  }catch(e){console.error('advSearch error',e);}
  _advLastResults=results;
  const sa=document.getElementById('advStatsArea');
  if(sa) sa.innerHTML=_advRenderStats(_advCalcStats(results));
  _advRenderResultList(results,q);
}

function _advSearchKR(q){
  if(!BIBLE) return [];
  const parsed=_advParseQuery(q,false);
  if(!parsed) return [];
  const books=_advGetFilteredBooks(), r=[];
  books.forEach(b=>{
    const chs=BIBLE[b]; if(!chs) return;
    Object.entries(chs).forEach(([ch,vs])=>{
      vs.forEach((t,i)=>{
        const m=_advMatchVerse(t,parsed);
        if(m) r.push({book:b,ch:+ch,v:i+1,text:t,
          positions:m.positions,occCount:m.count});
      });
    });
  });
  return r;
}
