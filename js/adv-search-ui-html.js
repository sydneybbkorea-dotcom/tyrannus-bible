// adv-search-ui-html.js — UI HTML 조각 생성 함수들
function _advTabsHTML(){
  let h='<div class="adv-tabs">';
  const tabs=[['korean','한글'],['english','영어'],['original','원어']];
  tabs.forEach(([m,l])=>{
    h+='<div class="adv-tab ws-tab'+(_advMode===m?' active':'')+'" data-mode="'+m+'" onclick="_advSetMode(\''+m+'\')">'+l+'</div>';
  });
  return h+'</div>';
}

function _advInputHTML(){
  const ph={korean:'한글 검색어...',english:'English word...',original:'H1234 또는 G5678...'};
  let h='<div class="adv-input-row">';
  h+='<input type="text" id="advSearchInput" class="adv-input" placeholder="'+(ph[_advMode]||'')+'" onkeydown="if(event.key===\'Enter\')_advDoSearch()">';
  h+='<button class="adv-search-btn" onclick="_advDoSearch()"><i class="fa fa-search"></i></button>';
  h+='<button class="adv-help-btn" onclick="_advHelp()" title="검색 도움말"><i class="fa fa-question-circle"></i></button>';
  return h+'</div>';
}

function _advFilterHTML(){
  let h='<div class="adv-filter-row">';
  ['all','ot','nt'].forEach(t=>{
    const label={all:'전체',ot:'구약',nt:'신약'}[t];
    const on=_advFilter.testament===t?' on':'';
    h+='<span class="adv-tst-chip'+on+'" data-tst="'+t+'" onclick="_advSetTestament(\''+t+'\')">'+label+'</span>';
  });
  h+='<select id="advBookSel" class="adv-book-sel" onchange="if(this.value)_advToggleBook(this.value)">';
  h+=_advBuildBookOptions();
  h+='</select>';
  return h+'</div>';
}

function _advOptionsHTML(){
  let h='<div class="adv-opt-row">';
  h+='<span id="advCaseBtn" class="adv-opt-btn'+(_advCaseSensitive?' on':'')+'" onclick="_advToggleCase()" title="대소문자 구분">Aa</span>';
  h+='<span class="adv-opt-sep"></span>';
  ['verse','chapter','book'].forEach(s=>{
    const lb={verse:'절',chapter:'장',book:'권'}[s];
    h+='<span class="adv-scope-btn'+(_advSearchScope===s?' on':'')+'" data-scope="'+s+'" onclick="_advSetScope(\''+s+'\')">'+lb+'</span>';
  });
  h+='<span class="adv-opt-sep"></span>';
  const vms=[['list','fa-list','목록'],['ref','fa-th','참조'],['tree','fa-sitemap','트리']];
  vms.forEach(([m,ic,ti])=>{
    h+='<span class="adv-vm-btn'+(_advViewMode===m?' on':'')+'" onclick="_advSetView(\''+m+'\')" title="'+ti+'"><i class="fa '+ic+'"></i></span>';
  });
  return h+'</div>';
}

function _advRefreshOptions(){
  const cb=document.getElementById('advCaseBtn');
  if(cb) cb.style.display=_advMode==='english'?'':'none';
}
