// adv-search-ctrl.js — 뷰 모드/스코프 전환 컨트롤
function _advSetView(mode){
  _advViewMode=mode;
  document.querySelectorAll('.adv-vm-btn').forEach(b=>{
    b.classList.toggle('on',b.title==={list:'목록',ref:'참조',tree:'트리'}[mode]);
  });
  if(_advLastResults) _advRenderResultList(_advLastResults,_advLastQ);
}

function _advSetScope(scope){
  _advSearchScope=scope;
  document.querySelectorAll('.adv-scope-btn').forEach(b=>{
    b.classList.toggle('on',b.dataset.scope===scope);
  });
}

function _advClearResults(){
  _advLastResults=null; _advLastQ=''; _advPage=0;
  const c=document.getElementById('advResults');
  if(c) c.innerHTML='';
  const sa=document.getElementById('advStatsArea');
  if(sa) sa.innerHTML='';
}

function _advHelp(){
  const tips=[
    '한글 → 한글 성경 검색',
    'English → KJV 영어 검색',
    'H1234/G5678 → 스트롱 원어 검색',
    '* : 0개 이상 문자 (예: 사랑*)',
    '? : 1개 문자 (예: 하?님)',
    '| : OR (예: 믿음 | 신앙)',
    '"..." : 정확한 구문 (예: "성령의 열매")',
    '-단어 : 제외 (예: 주 -"주의 천사")',
    '공백 : AND (예: 하나님 사랑)'
  ];
  const c=document.getElementById('advResults');
  if(!c) return;
  let h='<div class="adv-help"><div class="adv-help-title"><i class="fa fa-info-circle"></i> 검색 도움말</div>';
  tips.forEach(t=>{h+='<div class="adv-help-item">'+t+'</div>';});
  h+='</div>';
  c.innerHTML=h;
}
