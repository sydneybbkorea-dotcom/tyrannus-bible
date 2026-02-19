// notes-folders.js — 옵시디언 스타일 폴더 트리 (중첩 지원)
function renderFolderTree(){
  const cont=document.getElementById('folderTree'); if(!cont) return;
  cont.innerHTML='';
  const roots=S.folders.filter(f=>!f.parentId);
  roots.forEach(f=>cont.appendChild(_buildFolderNode(f,0)));
  _updateFolderSel();
}

function _buildFolderNode(f,depth){
  const children=S.folders.filter(c=>c.parentId===f.id);
  const notes=S.notes.filter(n=>n.folderId===f.id);
  const isOpen=S.openFolders.has(f.id);
  const isSel=S.curFolder===f.id&&!S.curNoteId;
  const hasKids=children.length>0||notes.length>0;

  const wrap=document.createElement('div');
  wrap.className='ft-node';

  const head=document.createElement('div');
  head.className='ft-head'+(isSel?' ft-sel':'');
  head.style.paddingLeft=(8+depth*16)+'px';
  head.innerHTML=_ftHeadHTML(f,isOpen,hasKids);
  head.onclick=()=>_ftToggle(f.id);
  head.addEventListener('contextmenu',e=>{
    e.preventDefault(); e.stopPropagation();
    showFolderCtx(e,f.id,f.name,notes.length);
  });
  wrap.appendChild(head);

  if(isOpen){
    children.forEach(c=>wrap.appendChild(_buildFolderNode(c,depth+1)));
    notes.sort((a,b)=>b.updatedAt-a.updatedAt).forEach(n=>{
      wrap.appendChild(_buildNoteNode(n,depth+1));
    });
  }
  return wrap;
}
