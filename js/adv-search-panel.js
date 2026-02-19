// adv-search-panel.js — 고급 검색 패널 HTML (필터 + 옵션)
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
  h+='<span id="advCaseBtn" class="adv-opt-btn'+(_advCaseSensitive?' on':'')+'" onclick="_advToggleCase()" title="대소문자 구분 (영어)">Aa</span>';
  h+='<span class="adv-opt-sep"></span>';
  ['verse','chapter','book'].forEach(s=>{
    const lb={verse:'절',chapter:'장',book:'권'}[s];
    h+='<span class="adv-scope-btn'+(_advSearchScope===s?' on':'')+'" data-scope="'+s+'" onclick="_advSetScope(\''+s+'\')">'+lb+'</span>';
  });
  return h+'</div>';
}

function _advRefreshOptions(){
  // 고급 패널이 닫혀있으면 건너뜀
  if(!_advAdvanced) return;
  const cb=document.getElementById('advCaseBtn');
  if(cb) cb.style.display='';
}
