// search-exec.js — 통합 검색 실행 (기본+고급: 언어 감지, 와일드카드)
var _schViewMode='list', _schCaseSensitive=false, _schScope='verse';
var _schLastResults=null, _schLastQ='', _schPage=0, _schPageSize=200;

async function uniSearch(){
  const q=(document.getElementById('schInput')?.value||'').trim();
  if(!q) return;
  _schLastQ=q; _schPage=0;
  const list=document.getElementById('schList');
  if(list) list.innerHTML='<div class="adv-loading"><i class="fa fa-spinner fa-spin"></i></div>';
  const mode=_schDetectMode(q);
  let results=[];
  try{
    if(mode==='original') results=await _schSearchOrig(q);
    else if(mode==='english') results=await _schSearchEN(q);
    else results=_schSearchKR(q);
  }catch(e){ console.error('uniSearch error',e); }
  // 노트/주석/파일도 검색
  _schSearchExtra(q, results);
  _schLastResults=results;
  _schRenderStats(results);
  _schRenderAll(results, q);
}

// 하위호환: 기존 doSearch 호출 시에도 동작
function doSearch(){ uniSearch(); }
