// adv-search-exec.js — 통합 검색 실행 (언어 자동 감지)
async function _advDoSearch(){
  const inp=document.getElementById('uniSearchInput');
  const q=(inp?.value||'').trim();
  if(!q) return;
  _advLastQ=q; _advPage=0;
  const c=document.getElementById('advResults');
  if(c) c.innerHTML='<div class="adv-loading"><i class="fa fa-spinner fa-spin"></i></div>';
  const mode=_advDetectMode(q);
  let results=[];
  try{
    if(mode==='original') results=await _advSearchOrig(q);
    else if(mode==='english') results=await _advSearchEN(q);
    else results=_advSearchKR(q);
  }catch(e){console.error('advSearch error',e);}
  _advLastResults=results;
  const sa=document.getElementById('advStatsArea');
  if(sa) sa.innerHTML=_advRenderStats(_advCalcStats(results));
  _advRenderResultList(results,q);
}

function _advDetectMode(q){
  const t=q.replace(/[\s"*?|\-]/g,'');
  if(!t) return 'korean';
  // H1234, G5678, H43* 등 스트롱 코드 패턴
  if(/^[HG]\d/i.test(t)) return 'original';
  // 영어만 포함 (숫자 허용)
  if(/^[a-zA-Z0-9]+$/.test(t)) return 'english';
  return 'korean';
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
        const clean=t.replace(/<[^>]+>/g,'');
        const m=_advMatchVerse(clean,parsed);
        if(m) r.push({book:b,ch:+ch,v:i+1,text:clean,
          positions:m.positions,occCount:m.count});
      });
    });
  });
  return r;
}
