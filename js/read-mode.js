function toggleReadMode(){
  const isRead = document.body.classList.toggle('read-mode');
  const btn = document.getElementById('tbReadMode');
  if(btn){
    btn.classList.toggle('on', isRead);
    btn.innerHTML = isRead
      ? '<i class="fa fa-pen"></i> 쓰기'
      : '<i class="fa fa-book-reader"></i> 읽기';
  }
  toast(isRead ? '읽기 모드' : '쓰기 모드');
}
// ESC키로 읽기 모드 탈출
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && document.body.classList.contains('read-mode')){
    toggleReadMode();
  }
});

// ═══════════════════════════════════════════════════
// BIBLE TAB SYSTEM
// ═══════════════════════════════════════════════════
let _bibleTabs = [];
let _activeTabId = null;
