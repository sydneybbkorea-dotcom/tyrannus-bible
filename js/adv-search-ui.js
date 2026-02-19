// adv-search-ui.js — 메인 UI 렌더링(renderAdvSearch) + 상태 관리
var _advMode='korean', _advViewMode='list';
var _advCaseSensitive=false, _advSearchScope='verse';
var _advLastResults=null, _advLastQ='';

function renderAdvSearch(){
  const c=document.getElementById('spOriginalContent');
  if(!c) return;
  c.innerHTML=_advBuildUI();
  _advRefreshFilterUI();
}

function _advBuildUI(){
  let h='<div class="adv-wrap">';
  h+=_advTabsHTML();
  h+=_advInputHTML();
  h+=_advFilterHTML();
  h+=_advOptionsHTML();
  h+='<div id="advStatsArea"></div>';
  h+='<div id="advResults" class="adv-results"></div>';
  h+='</div>';
  return h;
}

function _advSetMode(mode){
  _advMode=mode;
  document.querySelectorAll('.adv-tab').forEach(t=>{
    t.classList.toggle('active',t.dataset.mode===mode);
  });
  const inp=document.getElementById('advSearchInput');
  const ph={korean:'한글 검색어...',english:'English word...',original:'H1234 또는 G5678...'};
  if(inp){inp.placeholder=ph[mode]||'';inp.focus();}
  _advRefreshOptions();
}

function _advToggleCase(){
  _advCaseSensitive=!_advCaseSensitive;
  const btn=document.getElementById('advCaseBtn');
  if(btn) btn.classList.toggle('on',_advCaseSensitive);
}
