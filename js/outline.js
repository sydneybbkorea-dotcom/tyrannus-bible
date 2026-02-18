// outline.js — 노트 아웃라인 트리 렌더링
let _outlineExpanded = true;

function renderOutline(){
  const el=document.getElementById('outlineTree');
  if(!el) return;

  if(!S.notes || !S.notes.length){
    el.innerHTML='<div class="comm-hint"><i class="fa fa-sitemap"></i>저장된 노트가 없습니다</div>';
    return;
  }

  let html='';
  (S.folders||[]).forEach(folder=>{
    const fNotes = S.notes.filter(n=>(n.folderId||'default')===folder.id);
    if(!fNotes.length) return;
    html += _renderFolderGroup(folder, fNotes);
  });
  el.innerHTML=html;
}

function _renderFolderGroup(folder, fNotes){
  let h=`<div class="ol-folder-group">
    <div class="ol-folder-head" onclick="toggleOlPara(this)">
      <i class="fa fa-chevron-right ol-arrow${_outlineExpanded?' open':''}"></i>
      <i class="fa fa-folder" style="font-size:10px;color:var(--text3)"></i>
      <span style="font-weight:600;color:var(--text2)">${folder.name}</span>
      <span class="ol-badge">${fNotes.length}</span>
    </div>
    <div class="ol-para-body${_outlineExpanded?' open':''}">`;

  fNotes.forEach(note=>{ h += _renderOutlineNote(note); });
  h+=`</div></div>`;
  return h;
}
