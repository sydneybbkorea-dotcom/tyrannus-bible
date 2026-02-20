// bug-report-file.js — 스크린샷 파일 선택/드래그 + 미리보기
var _bugFiles=[];

function bugFilePicked(input){
  if(!input.files) return;
  Array.from(input.files).forEach(f=>_bugAddFile(f));
  input.value='';
}

function _bugAddFile(file){
  if(!file.type.startsWith('image/')){ toast&&toast('이미지만 첨부 가능합니다'); return; }
  if(_bugFiles.length>=5){ toast&&toast('최대 5장까지 첨부 가능합니다'); return; }
  _bugFiles.push(file);
  _bugRenderPreviews();
}

function _bugRenderPreviews(){
  const wrap=document.getElementById('bugPreviews');
  if(!wrap) return;
  wrap.innerHTML='';
  _bugFiles.forEach((f,i)=>{
    const div=document.createElement('div');
    div.className='bug-thumb';
    const img=document.createElement('img');
    img.src=URL.createObjectURL(f);
    const rm=document.createElement('button');
    rm.className='bug-thumb-rm';
    rm.innerHTML='<i class="fa fa-times"></i>';
    rm.onclick=(e)=>{ e.stopPropagation(); _bugFiles.splice(i,1); _bugRenderPreviews(); };
    div.appendChild(img); div.appendChild(rm);
    wrap.appendChild(div);
  });
}

// 드래그앤드롭 초기화
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    const dz=document.getElementById('bugDropZone');
    if(!dz) return;
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
    dz.addEventListener('drop',e=>{
      e.preventDefault(); dz.classList.remove('drag-over');
      if(e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(f=>_bugAddFile(f));
    });
  },500);
});
