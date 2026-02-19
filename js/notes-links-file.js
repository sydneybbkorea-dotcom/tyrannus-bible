// notes-links-file.js — 파일/이미지 첨부
function openFileAttach(){
  saveRange();
  let inp = document.getElementById('fileAttachInput');
  if(!inp){
    inp = document.createElement('input');
    inp.id = 'fileAttachInput';
    inp.type = 'file';
    inp.style.display = 'none';
    inp.multiple = true;
    inp.addEventListener('change', handleFileAttach);
    document.body.appendChild(inp);
  }
  inp.value = '';
  inp.click();
}
function handleFileAttach(e){
  const files = [...e.target.files];
  if(!files.length) return;
  restoreRange();
  files.forEach(file=>{
    const isImg = file.type.startsWith('image/');
    const isPdf = file.type==='application/pdf';
    const reader = new FileReader();
    reader.onload = ev=>{
      let h = '';
      if(isImg){
        h = `<div class="note-file-wrap" contenteditable="false">
          <img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;border-radius:6px;display:block;">
          <span class="note-file-label"><i class="fa fa-image"></i> ${file.name}</span>
        </div><p></p>`;
      } else {
        const icon = isPdf ? 'file-pdf' : (file.type.startsWith('audio') ? 'file-audio' : (file.type.startsWith('video') ? 'file-video' : 'file'));
        h = `<div class="note-file-item" contenteditable="false">
          <i class="fa fa-${icon}" style="font-size:20px;color:var(--gold);flex-shrink:0;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</div>
            <div style="font-size:11px;color:var(--text3);">${(file.size/1024).toFixed(1)} KB · ${file.type||'파일'}</div>
          </div>
          <a href="${ev.target.result}" download="${file.name}" onclick="event.stopPropagation()"
            style="font-size:11px;color:var(--gold);text-decoration:none;flex-shrink:0;">
            <i class="fa fa-download"></i>
          </a>
        </div>&#8203;`;
      }
      document.execCommand('insertHTML', false, h);
    };
    reader.readAsDataURL(file);
  });
}
