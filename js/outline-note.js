// outline-note.js — 개별 노트의 아웃라인 항목 렌더링 + 헤딩 점프
function _renderOutlineNote(note){
  const isActive = note.id === S.curNoteId;
  const date = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('ko') : '';
  const tags = (note.tags||[]).map(t=>`<span class="ol-tag">#${t}</span>`).join('');
  const vRefCount = (note.vRefs||[]).length;
  const headings = extractHeadings(note.content||'');

  let h=`<div class="ol-note${isActive?' ol-sel':''}" onclick="loadNote('${note.id}',true);switchSub('notes')">
    <div class="ol-note-head">
      <i class="fa fa-file-alt" style="font-size:10px;color:${isActive?'var(--gold)':'var(--text3)'}"></i>
      <span class="ol-note-title">${note.title||'제목 없음'}</span>
      <span style="font-size:10px;color:var(--text3)">${date}</span>
    </div>`;

  if(headings.length){
    h+=`<div class="ol-headings">`;
    headings.forEach(hd=>{
      const indent = hd.level===1 ? 0 : hd.level===2 ? 12 : 24;
      const safe = hd.text.replace(/'/g,"\\'");
      h+=`<div class="ol-heading-item" style="padding-left:${20+indent}px" onclick="event.stopPropagation();jumpToNoteHeading('${note.id}','${safe}')">
        <span style="font-size:${hd.level===1?'10px':'8px'};color:var(--text3)">H${hd.level}</span>
        <span style="color:var(--text2)">${hd.text}</span>
      </div>`;
    });
    h+=`</div>`;
  }

  if(tags || vRefCount){
    h+=`<div class="ol-note-meta">${tags}`;
    if(vRefCount) h+=`<span class="ol-tag" style="color:var(--gold)"><i class="fa fa-book-open" style="font-size:8px"></i> ${vRefCount}구절</span>`;
    h+=`</div>`;
  }
  h+=`</div>`;
  return h;
}

function extractHeadings(content){
  if(!content) return [];
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  const result = [];
  tmp.querySelectorAll('h1,h2,h3').forEach(h=>{
    const text = h.textContent.trim();
    if(text) result.push({ level: parseInt(h.tagName[1]), text });
  });
  return result;
}

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
