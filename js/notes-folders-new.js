// notes-folders-new.js — 새 폴더/노트 생성 + 이름 변경
var _newFolderParent=null;

function newFolder(parentId){
  _newFolderParent=parentId||S.curFolder||null;
  document.getElementById('mFolderName').value='';
  openM('mFolder');
  setTimeout(()=>document.getElementById('mFolderName').focus(),80);
}

function createFolder(){
  const nm=document.getElementById('mFolderName').value.trim();
  if(!nm){toast('폴더 이름을 입력하세요');return}
  const f={id:'f_'+Date.now(),name:nm};
  if(_newFolderParent) f.parentId=_newFolderParent;
  S.folders.push(f);
  S.openFolders.add(_newFolderParent||'__root');
  _newFolderParent=null;
  persist(); closeM('mFolder'); renderFolderTree();
  toast(`"${nm}" 폴더가 만들어졌어요`);
}

function renameFolder(folderId){
  hideFolderNoteCtx();
  const f=S.folders.find(x=>x.id===folderId); if(!f) return;
  const newName=prompt('새 폴더 이름:',f.name);
  if(!newName||!newName.trim()) return;
  f.name=newName.trim();
  persist(); renderFolderTree();
  toast(`폴더 이름이 "${f.name}"으로 변경되었어요`);
}

window.newNote=function newNote(){
  S.curNoteId=null; S.curTags=[]; S.navHistory=[];
  const el=document.getElementById('noteContent');
  if(!el) return;
  if(S.selV){
    const k=`${S.book}_${S.ch}_${S.selV}`;
    const vt=BIBLE[S.book]?.[S.ch]?.[S.selV-1]||'';
    const title=`${S.book} ${S.ch}:${S.selV} 묵상`;
    el.innerHTML='<h1>'+title+'</h1>'+makVLink(k,`${S.book} ${S.ch}:${S.selV}`)+'&#8203; <span class="vtxt" style="font-family:\'KoPubWorld Batang\',\'Noto Serif KR\',serif;line-height:1.85;">'+vt+'</span><br><br>';
  }else{
    el.innerHTML='<h1></h1><br>';
    setTimeout(()=>{const h=el.querySelector('h1');if(h){const r=document.createRange();r.setStart(h,0);r.collapse(true);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}},50);
  }
  updateBacklinks(); updateBreadcrumb(); renderTagChips(); closeExplorer();
  if(typeof _noteUpdateTabTitle==='function') _noteUpdateTabTitle();
  if(typeof _noteInitAutoSave==='function') _noteInitAutoSave();
}
