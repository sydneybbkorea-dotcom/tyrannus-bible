// notes-folders.js — 폴더 트리 렌더링, 폴더/노트 CRUD
// ═══════════════════════════════════════════════════
function renderFolderTree(){
  const cont=document.getElementById('folderTree'); cont.innerHTML='';
  S.folders.forEach(f=>{
    const subs=S.notes.filter(n=>n.folderId===f.id);
    const isOpen=S.openFolders.has(f.id);
    const isFSel=S.curFolder===f.id&&S.curNoteId===null;

    const fDiv=document.createElement('div'); fDiv.className='ftree-folder';
    const fHead=document.createElement('div');
    fHead.className='ftree-fhead'+(isFSel?' fsel':'');
    fHead.innerHTML=`<i class="ftree-arrow fa fa-chevron-right${isOpen?' open':''}"></i><i class="ftree-ficon fa fa-folder${isOpen?'-open':''}"></i><span class="ftree-fname">${f.name}</span><span class="ftree-count">${subs.length}</span>`;
    fHead.onclick=()=>{
      if(S.openFolders.has(f.id)) S.openFolders.delete(f.id);
      else S.openFolders.add(f.id);
      S.curFolder=f.id; S.curNoteId=null;
      renderFolderTree();
    };
    fHead.addEventListener('contextmenu', e=>{
      e.preventDefault(); e.stopPropagation();
      showFolderCtx(e, f.id, f.name, subs.length);
    });
    fDiv.appendChild(fHead);

    const noteList=document.createElement('div');
    noteList.className='ftree-notes'+(isOpen?' open':'');
    subs.sort((a,b)=>b.updatedAt-a.updatedAt).forEach(n=>{
      const ni=document.createElement('div');
      ni.className='ftree-note'+(S.curNoteId===n.id?' nsel':'');
      ni.innerHTML=`<i class="fa fa-file-alt"></i>${n.title||'제목 없음'}`;
      ni.title=n.title||'제목 없음';
      ni.onclick=e=>{e.stopPropagation();loadNote(n.id,false);closeExplorer();};
      ni.addEventListener('contextmenu', e=>{
        e.preventDefault(); e.stopPropagation();
        showNoteCtx(e, n.id, n.title);
      });
      noteList.appendChild(ni);
    });
    fDiv.appendChild(noteList);
    cont.appendChild(fDiv);
  });

  // update folder select
  const sel=document.getElementById('noteFolderSel');
  sel.innerHTML=S.folders.map(f=>`<option value="${f.id}"${f.id===S.curFolder?' selected':''}>${f.name}</option>`).join('');
}

// ── 폴더/노트 컨텍스트 메뉴 ──
function showFolderCtx(e, folderId, folderName, noteCount){
  hideFolderNoteCtx();
  const menu = document.createElement('div');
  menu.id = 'folderNoteCtx';
  menu.className = 'fn-ctx';
  menu.innerHTML = `
    <div class="fn-ctx-item" onclick="renameFolder('${folderId}')"><i class="fa fa-pen"></i> 이름 변경</div>
    <div class="fn-ctx-item fn-ctx-danger" onclick="deleteFolder('${folderId}','${folderName.replace(/'/g,"\\'")}',${noteCount})"><i class="fa fa-trash"></i> 폴더 삭제</div>
  `;
  document.body.appendChild(menu);
  positionCtx(menu, e);
  setTimeout(()=>document.addEventListener('click', hideFolderNoteCtx, {once:true}), 10);
}

function showNoteCtx(e, noteId, noteTitle){
  hideFolderNoteCtx();
  const safeTitle = (noteTitle||'제목 없음').replace(/'/g,"\\'");
  const menu = document.createElement('div');
  menu.id = 'folderNoteCtx';
  menu.className = 'fn-ctx';
  menu.innerHTML = `
    <div class="fn-ctx-item" onclick="loadNote('${noteId}',false);closeExplorer();hideFolderNoteCtx()"><i class="fa fa-edit"></i> 열기</div>
    <div class="fn-ctx-item fn-ctx-danger" onclick="deleteNote('${noteId}','${safeTitle}')"><i class="fa fa-trash"></i> 노트 삭제</div>
  `;
  document.body.appendChild(menu);
  positionCtx(menu, e);
  setTimeout(()=>document.addEventListener('click', hideFolderNoteCtx, {once:true}), 10);
}

function positionCtx(menu, e){
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  requestAnimationFrame(()=>{
    const r = menu.getBoundingClientRect();
    if(r.right > window.innerWidth) menu.style.left = (window.innerWidth - r.width - 8) + 'px';
    if(r.bottom > window.innerHeight) menu.style.top = (window.innerHeight - r.height - 8) + 'px';
  });
}

function hideFolderNoteCtx(){
  document.getElementById('folderNoteCtx')?.remove();
}

function deleteFolder(folderId, folderName, noteCount){
  hideFolderNoteCtx();
  const msg = noteCount > 0
    ? `"${folderName}" 폴더와 안에 있는 노트 ${noteCount}개를 모두 삭제할까요?`
    : `"${folderName}" 폴더를 삭제할까요?`;
  if(!confirm(msg)) return;
  // 폴더 안의 노트 모두 삭제
  S.notes = S.notes.filter(n => n.folderId !== folderId);
  S.folders = S.folders.filter(f => f.id !== folderId);
  if(S.curFolder === folderId){
    S.curFolder = S.folders[0]?.id || null;
    S.curNoteId = null;
  }
  persist(); renderFolderTree(); updateBreadcrumb();
  toast(`"${folderName}" 폴더가 삭제되었어요`);
}

function deleteNote(noteId, noteTitle){
  hideFolderNoteCtx();
  if(!confirm(`"${noteTitle}" 노트를 삭제할까요?`)) return;
  S.notes = S.notes.filter(n => n.id !== noteId);
  if(S.curNoteId === noteId) S.curNoteId = null;
  persist(); renderFolderTree(); renderBible(); updateBreadcrumb(); updateBacklinks();
  toast(`"${noteTitle}" 노트가 삭제되었어요`);
}

function renameFolder(folderId){
  hideFolderNoteCtx();
  const f = S.folders.find(x => x.id === folderId);
  if(!f) return;
  const newName = prompt('새 폴더 이름:', f.name);
  if(!newName || !newName.trim()) return;
  f.name = newName.trim();
  persist(); renderFolderTree();
  toast(`폴더 이름이 "${f.name}"으로 변경되었어요`);
}

function newFolder(){
  document.getElementById('mFolderName').value='';
  openM('mFolder');
  setTimeout(()=>document.getElementById('mFolderName').focus(),80);
}
function createFolder(){
  const nm=document.getElementById('mFolderName').value.trim();
  if(!nm){toast('폴더 이름을 입력하세요');return}
  S.folders.push({id:'f_'+Date.now(),name:nm});
  persist(); closeM('mFolder'); renderFolderTree();
  toast(`"${nm}" 폴더가 만들어졌어요`);
}

// ═══════════════════════════════════════════════════
// NOTE EDITOR
// ═══════════════════════════════════════════════════
window.newNote = function newNote(){
  S.curNoteId=null; S.curTags=[]; S.navHistory=[];
  document.getElementById('noteTitle').value='';
  document.getElementById('noteContent').innerHTML='';
  updateBacklinks(); // Show empty backlink state
  if(S.selV){
    const k=`${S.book}_${S.ch}_${S.selV}`;
    const vt=BIBLE[S.book]?.[S.ch]?.[S.selV-1]||'';
    document.getElementById('noteTitle').value=`${S.book} ${S.ch}:${S.selV} 묵상`;
    document.getElementById('noteContent').innerHTML=makVLink(k,`${S.book} ${S.ch}:${S.selV}`)+'&#8203; '+vt+'<br><br>';
  }
  document.getElementById('noteFolderSel').value=S.curFolder;
  updateBreadcrumb();
  renderTagChips();
  closeExplorer();
}
