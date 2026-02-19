// panels.js — 우측 패널 열기/닫기/탭 전환 제어
function openPanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  rp.classList.remove('rp-hide'); S.panelOpen=name;
  switchTab(name);
  document.body.classList.add('panel-open');
}

function togglePanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  if(S.panelOpen===name&&!rp.classList.contains('rp-hide')){
    rp.classList.add('rp-hide'); S.panelOpen=null;
    document.body.classList.remove('panel-open');
  } else {
    openPanel(name);
  }
}
