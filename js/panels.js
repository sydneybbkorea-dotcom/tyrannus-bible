// panels.js — 우측 패널 열기/닫기/탭 전환 제어
function openPanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  rp.classList.remove('rp-hide'); S.panelOpen=name;
  switchTab(name);
  document.getElementById('tbNotes')?.classList.toggle('on',name==='notes');
  document.getElementById('tbDict')?.classList.toggle('on',name==='dictionary');
  document.getElementById('tbSearch')?.classList.toggle('on',name==='search');
  document.body.classList.add('panel-open');
}

function togglePanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  if(S.panelOpen===name&&!rp.classList.contains('rp-hide')){
    rp.classList.add('rp-hide'); S.panelOpen=null;
    document.querySelectorAll('.tb-btn').forEach(b=>b.classList.remove('on'));
    document.body.classList.remove('panel-open');
  } else {
    openPanel(name);
  }
}
