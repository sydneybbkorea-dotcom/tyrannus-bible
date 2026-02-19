// adv-search-ui.js — 통합 검색 UI (기본+고급) + 상태 관리
var _advMode='auto', _advViewMode='list';
var _advCaseSensitive=false, _advSearchScope='verse';
var _advLastResults=null, _advLastQ='';
var _advAdvanced=false;

function renderUnifiedSearch(){
  const c=document.getElementById('spSearchBody');
  if(!c) return;
  c.innerHTML=_uniSearchHTML();
  _advRefreshFilterUI();
  _advRefreshOptions();
}

function _advToggleAdvanced(){
  _advAdvanced=!_advAdvanced;
  const panel=document.getElementById('advPanel');
  const btn=document.getElementById('advToggleBtn');
  if(panel) panel.style.display=_advAdvanced?'':'none';
  if(btn) btn.classList.toggle('on',_advAdvanced);
}

function _advToggleCase(){
  _advCaseSensitive=!_advCaseSensitive;
  const btn=document.getElementById('advCaseBtn');
  if(btn) btn.classList.toggle('on',_advCaseSensitive);
}

// 하위호환: renderAdvSearch 호출 시 통합 검색 렌더링
function renderAdvSearch(){
  renderUnifiedSearch();
}
