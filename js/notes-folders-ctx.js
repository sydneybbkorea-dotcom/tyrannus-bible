// notes-folders-ctx.js — 폴더/노트 컨텍스트 메뉴 (중첩 지원)
function showFolderCtx(e, folderId, folderName, noteCount){
  hideFolderNoteCtx();
  const menu=document.createElement('div');
  menu.id='folderNoteCtx'; menu.className='fn-ctx';
  const safeName=folderName.replace(/'/g,"\\'");
  menu.innerHTML=`
    <div class="fn-ctx-item" onclick="newFolder('${folderId}');hideFolderNoteCtx()"><i class="fa fa-folder-plus"></i> 하위 폴더</div>
    <div class="fn-ctx-item" onclick="renameFolder('${folderId}')"><i class="fa fa-pen"></i> 이름 변경</div>
    <div class="fn-ctx-item fn-ctx-danger" onclick="deleteFolder('${folderId}','${safeName}',${noteCount})"><i class="fa fa-trash"></i> 폴더 삭제</div>
  `;
  document.body.appendChild(menu);
  positionCtx(menu,e);
  setTimeout(()=>document.addEventListener('click',hideFolderNoteCtx,{once:true}),10);
}

function showNoteCtx(e, noteId, noteTitle){
  hideFolderNoteCtx();
  const safe=(noteTitle||'제목 없음').replace(/'/g,"\\'");
  const menu=document.createElement('div');
  menu.id='folderNoteCtx'; menu.className='fn-ctx';
  menu.innerHTML=`
    <div class="fn-ctx-item" onclick="loadNote('${noteId}',false);closeExplorer();hideFolderNoteCtx()"><i class="fa fa-edit"></i> 열기</div>
    <div class="fn-ctx-item fn-ctx-danger" onclick="deleteNote('${noteId}','${safe}')"><i class="fa fa-trash"></i> 노트 삭제</div>
  `;
  document.body.appendChild(menu);
  positionCtx(menu,e);
  setTimeout(()=>document.addEventListener('click',hideFolderNoteCtx,{once:true}),10);
}

function positionCtx(menu,e){
  menu.style.left=e.clientX+'px'; menu.style.top=e.clientY+'px';
  requestAnimationFrame(()=>{
    const r=menu.getBoundingClientRect();
    if(r.right>window.innerWidth) menu.style.left=(window.innerWidth-r.width-8)+'px';
    if(r.bottom>window.innerHeight) menu.style.top=(window.innerHeight-r.height-8)+'px';
  });
}

function hideFolderNoteCtx(){
  document.getElementById('folderNoteCtx')?.remove();
}
