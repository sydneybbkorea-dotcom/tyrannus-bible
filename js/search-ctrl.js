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
  const tips=[t('sch.help.kr'),t('sch.help.en'),
    t('sch.help.strongs'),t('sch.help.wild'),
    t('sch.help.single'),t('sch.help.or'),
    t('sch.help.phrase'),
    t('sch.help.exclude'),
    t('sch.help.and')];
  const list=document.getElementById('schList');
  if(!list) return;
  let h='<div class="adv-help"><div class="adv-help-title"><i class="fa fa-info-circle"></i> '+t('sch.help.title')+'</div>';
  tips.forEach(t=>{ h+='<div class="adv-help-item">'+t+'</div>'; });
  list.innerHTML=h+'</div>';
}
