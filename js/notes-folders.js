// notes-folders.js — 폴더 트리 렌더링
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
