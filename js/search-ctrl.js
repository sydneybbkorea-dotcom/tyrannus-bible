// search-ctrl.js — 뷰모드/스코프/고급 토글/도움말 컨트롤
function schToggleAdv(){
  const panel=document.getElementById('schAdvPanel');
  const btn=document.getElementById('schAdvToggle');
  if(!panel) return;
  const show=panel.style.display==='none';
  panel.style.display=show?'':'none';
  if(btn) btn.classList.toggle('on',show);
}

function schSetView(mode){
  _schViewMode=mode;
  document.querySelectorAll('.sch-vm-btn').forEach(b=>{
    b.classList.toggle('on',b.dataset.vm===mode);
  });
  if(_schLastResults) _schRenderAll(_schLastResults,_schLastQ);
}

function schToggleCase(){
  _schCaseSensitive=!_schCaseSensitive;
  const btn=document.getElementById('schCaseBtn');
  if(btn) btn.classList.toggle('on',_schCaseSensitive);
}

function schSetScope(scope){
  _schScope=scope;
  document.querySelectorAll('.sch-scope-btn').forEach(b=>{
    b.classList.toggle('on',b.dataset.scope===scope);
  });
}

function uniHelp(){
  const tips=['한글 → 한글 성경 검색','English → KJV 영어 검색',
    'H1234/G5678 → 스트롱 원어 검색','* : 0개 이상 문자 (예: 사랑*)',
    '? : 1개 문자 (예: 하?님)','| : OR (예: 믿음 | 신앙)',
    '"..." : 정확한 구문 (예: "성령의 열매")',
    '-단어 : 제외 (예: 주 -"주의 천사")',
    '공백 : AND (예: 하나님 사랑)'];
  const list=document.getElementById('schList');
  if(!list) return;
  let h='<div class="adv-help"><div class="adv-help-title"><i class="fa fa-info-circle"></i> 검색 도움말</div>';
  tips.forEach(t=>{ h+='<div class="adv-help-item">'+t+'</div>'; });
  list.innerHTML=h+'</div>';
}
