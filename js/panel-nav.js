// panel-nav.js — 좌측 목차/탐색기 토글 제어
function toggleBookNav(){
  S.bookNavOpen=!S.bookNavOpen;
  const el=document.getElementById('bookNav');
  if(el) el.classList.toggle('hide',!S.bookNavOpen);
  document.getElementById('tbBook')?.classList.toggle('on',S.bookNavOpen);
}

function toggleExplorer(){
  S.explorerOpen=!S.explorerOpen;
  document.getElementById('noteExplorer')?.classList.toggle('exp-open',S.explorerOpen);
  document.getElementById('explorerOverlay')?.classList.toggle('show',S.explorerOpen);
  document.getElementById('drawerBtn')?.classList.toggle('drawer-on',S.explorerOpen);
}

function openExplorer(){
  if(S.explorerOpen) return;
  S.explorerOpen=true;
  document.getElementById('noteExplorer')?.classList.add('exp-open');
  document.getElementById('explorerOverlay')?.classList.add('show');
  document.getElementById('drawerBtn')?.classList.add('drawer-on');
}

function closeExplorer(){
  S.explorerOpen=false;
  document.getElementById('noteExplorer')?.classList.remove('exp-open');
  document.getElementById('explorerOverlay')?.classList.remove('show');
  document.getElementById('drawerBtn')?.classList.remove('drawer-on');
}
