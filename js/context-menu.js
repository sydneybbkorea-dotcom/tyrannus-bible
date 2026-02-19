// Context menu: show/hide and global click-away handler
// ═══════════════════════════════════════════════════
function showCtx(e){
  try {
    const m=document.getElementById('ctxMenu');
    if(!m) {
      console.error('ctxMenu element not found');
      return;
    }

    // Position menu
    const x = e.clientX || e.pageX || 0;
    const y = e.clientY || e.pageY || 0;
    m.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    m.style.top = Math.min(y, window.innerHeight - 250) + 'px';

    // Show/hide clear highlight button
    const clearBtn=document.getElementById('ctxClearHLItem');
    if(clearBtn){
      const key=S.selV?`${S.book}_${S.ch}_${S.selV}`:'';
      clearBtn.style.display=(key && S.hl[key])?'':'none';
    }

    // Remove any existing 'show' class first
    m.classList.remove('show');

    // Force reflow
    void m.offsetWidth;

    // Add show class
    m.classList.add('show');

    console.log('Context menu displayed at', m.style.left, m.style.top);
  } catch(err) {
    console.error('Error in showCtx:', err);
  }
}
function closeCtx(){document.getElementById('ctxMenu').classList.remove('show')}
document.addEventListener('click',e=>{
  if(!e.target.closest('#ctxMenu')) closeCtx();
  if(!e.target.closest('#hlPicker')&&!e.target.closest('#bibleScroll')) hideHLPicker();
});
