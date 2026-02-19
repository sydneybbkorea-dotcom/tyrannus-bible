// notes-folders-render.js — 폴더/노트 노드 HTML 생성
function _ftHeadHTML(f,isOpen,hasKids){
  const arrow=hasKids
    ?`<i class="ft-arrow fa fa-chevron-right${isOpen?' open':''}"></i>`
    :'<span class="ft-arrow-sp"></span>';
  const icon=`<i class="ft-icon fa fa-folder${isOpen?'-open':''}" style="color:${isOpen?'var(--gold)':'var(--text3)'}"></i>`;
  return `${arrow}${icon}<span class="ft-name">${f.name}</span>`;
}

function _buildNoteNode(n,depth){
  const el=document.createElement('div');
  el.className='ft-note'+(S.curNoteId===n.id?' ft-nsel':'');
  el.style.paddingLeft=(8+depth*16+16)+'px';
  el.innerHTML=`<i class="fa fa-file-alt ft-note-icon"></i><span class="ft-note-name">${n.title||'제목 없음'}</span>`;
  el.title=n.title||'제목 없음';
  el.onclick=e=>{e.stopPropagation();loadNote(n.id,false);closeExplorer();};
  el.addEventListener('contextmenu',e=>{
    e.preventDefault(); e.stopPropagation();
    showNoteCtx(e,n.id,n.title);
  });
  return el;
}

function _ftToggle(fid){
  if(S.openFolders.has(fid)) S.openFolders.delete(fid);
  else S.openFolders.add(fid);
  S.curFolder=fid; S.curNoteId=null;
  renderFolderTree();
}

function _updateFolderSel(){
  const sel=document.getElementById('noteFolderSel'); if(!sel) return;
  sel.innerHTML=_flatFolderOpts(null,0);
}

function _ftCollapseAll(){
  S.openFolders.clear(); renderFolderTree();
}

function _flatFolderOpts(parentId,depth){
  const kids=S.folders.filter(f=>(f.parentId||null)===(parentId||null));
  let h='';
  kids.forEach(f=>{
    const pre='─'.repeat(depth);
    const label=depth>0?pre+' '+f.name:f.name;
    h+=`<option value="${f.id}"${f.id===S.curFolder?' selected':''}>${label}</option>`;
    h+=_flatFolderOpts(f.id,depth+1);
  });
  return h;
}
