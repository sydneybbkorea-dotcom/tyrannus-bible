// side-notes.js — 사이드패널 노트 목록 렌더링
function renderSideNotes(){
  const c = document.getElementById('spNoteList'); if(!c) return;
  if(!S.notes||!S.notes.length){
    c.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px"><i class="fa fa-pen" style="font-size:20px;margin-bottom:8px;display:block;opacity:.4"></i>'+t('note.empty')+'</div>';
    return;
  }
  const sorted=[...S.notes].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  let h=''; sorted.forEach(n=>{
    const d=n.updatedAt?_fmtDate(n.updatedAt):'';
    const act=S.curNoteId===n.id?' active':'';
    h+=`<div class="sp-note-item${act}" onclick="_spOpenNote('${n.id}')">`;
    h+=`<i class="fa fa-file-alt"></i>`;
    h+=`<span class="sp-note-title">${n.title||t('note.untitled')}</span>`;
    h+=`<span class="sp-note-date">${d}</span></div>`;
  });
  c.innerHTML=h;
}
function _fmtDate(ts){
  const d=new Date(ts), m=d.getMonth()+1, day=d.getDate();
  return m+'/'+day;
}
function _spOpenNote(id){
  loadNote(id, true);
  openPanel('notes'); switchSub('notes');
}
function _spFilterNotes(q){
  if(!q){ renderSideNotes(); return; }
  const c=document.getElementById('spNoteList'); if(!c) return;
  const f=S.notes.filter(n=>(n.title||'').includes(q)||(n.content||'').includes(q));
  if(!f.length){ c.innerHTML='<div style="padding:16px;text-align:center;color:var(--text3);font-size:11px">'+t('outline.no')+'</div>'; return; }
  let h=''; f.forEach(n=>{
    h+=`<div class="sp-note-item" onclick="_spOpenNote('${n.id}')"><i class="fa fa-file-alt"></i><span class="sp-note-title">${n.title||t('note.untitled')}</span></div>`;
  });
  c.innerHTML=h;
}
