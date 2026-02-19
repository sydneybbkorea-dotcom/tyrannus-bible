// adv-search-ui-html.js — 통합 검색 UI HTML 생성
function _uniSearchHTML(){
  let h='<div class="adv-wrap">';
  h+=_uniInputHTML();
  h+=_uniToggleRow();
  h+='<div id="advPanel" style="display:'+(_advAdvanced?'block':'none')+'">';
  h+=_advFilterHTML();
  h+=_advOptionsHTML();
  h+='</div>';
  h+='<div id="advStatsArea"></div>';
  h+='<div id="advResults" class="adv-results"></div>';
  h+='</div>';
  return h;
}

function _uniInputHTML(){
  let h='<div class="adv-input-row">';
  h+='<input type="text" id="uniSearchInput" class="adv-input" placeholder="검색어 입력... (한글/영어/H1234)" onkeydown="if(event.key===\'Enter\')_advDoSearch()">';
  h+='<button class="adv-search-btn" onclick="_advDoSearch()"><i class="fa fa-search"></i></button>';
  h+='<button class="adv-help-btn" onclick="_advHelp()" title="검색 도움말"><i class="fa fa-question-circle"></i></button>';
  return h+'</div>';
}

function _uniToggleRow(){
  let h='<div class="adv-toggle-row">';
  h+='<span id="advToggleBtn" class="adv-toggle-btn'+(_advAdvanced?' on':'')+'" onclick="_advToggleAdvanced()">';
  h+='<i class="fa fa-sliders-h"></i> 고급</span>';
  h+='<span class="adv-opt-sep"></span>';
  const vms=[['list','fa-list','목록'],['ref','fa-th','참조'],['tree','fa-sitemap','트리']];
  vms.forEach(([m,ic,ti])=>{
    h+='<span class="adv-vm-btn'+(_advViewMode===m?' on':'')+'" onclick="_advSetView(\''+m+'\')" title="'+ti+'"><i class="fa '+ic+'"></i></span>';
  });
  return h+'</div>';
}
