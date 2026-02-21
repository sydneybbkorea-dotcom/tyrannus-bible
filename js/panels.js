// panels.js — 우측 패널 열기/닫기/탭 전환 제어
function openPanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  rp.classList.remove('rp-hide'); S.panelOpen=name;
  switchTab(name);
  document.body.classList.add('panel-open');
  if(typeof EventBus !== 'undefined') EventBus.emit('panel:opened', { name: name });
}

function togglePanel(name){
  const rp=document.getElementById('rightPanel');
  if(!rp) return;
  if(S.panelOpen===name&&!rp.classList.contains('rp-hide')){
    rp.classList.add('rp-hide'); S.panelOpen=null;
    document.body.classList.remove('panel-open');
    document.querySelector('.rail-icon[data-rail="notes"]')?.classList.remove('active');
    document.querySelector('.rail-icon[data-rail="dictionary"]')?.classList.remove('active');
    var commBtn = document.getElementById('vbComm');
    if(commBtn) commBtn.classList.remove('vb-on');
    if(typeof EventBus !== 'undefined') EventBus.emit('panel:closed', { name: name });
  } else {
    openPanel(name);
  }
}

// 성경 본문 뷰바에서 주석 토글
function toggleCommentaryBtn(){
  var rp = document.getElementById('rightPanel');
  var btn = document.getElementById('vbComm');
  var isShowing = S.panelOpen === 'notes' && S._noteSubTab === 'commentary'
                  && rp && !rp.classList.contains('rp-hide');

  if(isShowing){
    // 주석이 열려있으면 → 패널 닫기
    rp.classList.add('rp-hide');
    S.panelOpen = null;
    document.body.classList.remove('panel-open');
    if(btn) btn.classList.remove('vb-on');
  } else {
    // 주석 열기
    openPanel('notes');
    switchSub('commentary');
    if(typeof updateDict === 'function') updateDict();
    if(btn) btn.classList.add('vb-on');
  }
}
