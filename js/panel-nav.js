// panel-nav.js — 좌측 성경 목록 사이드바 + 노트 탐색기 토글

/* ── 성경 목록 사이드바 (본문을 밀어내는 고정 패널) ── */
function openBookNav(){
  document.getElementById('bookNav')?.classList.add('open');
}
function closeBookNav(){
  document.getElementById('bookNav')?.classList.remove('open');
}
function toggleBookNav(){
  const nav = document.getElementById('bookNav');
  if(nav?.classList.contains('open')) closeBookNav();
  else openBookNav();
}

/* ── 노트 탐색기 토글 ── */
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
