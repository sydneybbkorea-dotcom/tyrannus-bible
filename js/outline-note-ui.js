// outline-note-ui.js — 아웃라인 노트 헤딩 점프, 토글 동작
function jumpToNoteHeading(noteId, headingText){
  if(typeof loadNote==='function') loadNote(noteId, true);
  if(typeof switchSub==='function') switchSub('notes');
  setTimeout(()=>{
    const nc = document.getElementById('noteContent');
    if(!nc) return;
    for(const h of nc.querySelectorAll('h1,h2,h3')){
      if(h.textContent.trim() === headingText){
        h.scrollIntoView({behavior:'smooth', block:'start'});
        h.style.background='var(--gold-dim)';
        setTimeout(()=>h.style.background='', 1500);
        break;
      }
    }
  }, 150);
}

function toggleOlPara(headEl){
  const body=headEl.nextElementSibling;
  const arrow=headEl.querySelector('.ol-arrow');
  if(body) body.classList.toggle('open');
  if(arrow) arrow.classList.toggle('open');
}

function toggleOutlineExpand(){
  _outlineExpanded=!_outlineExpanded;
  document.querySelectorAll('.ol-para-body').forEach(b=>b.classList.toggle('open',_outlineExpanded));
  document.querySelectorAll('.ol-arrow').forEach(a=>a.classList.toggle('open',_outlineExpanded));
}
