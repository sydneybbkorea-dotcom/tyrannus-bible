// app-paste.js — DOMContentLoaded 순수 텍스트 붙여넣기 핸들러
document.addEventListener('DOMContentLoaded', ()=>{
  const nc=document.getElementById('noteContent');
  if(!nc) return;
  nc.addEventListener('paste', e=>{
    e.preventDefault();
    let text=(e.clipboardData||window.clipboardData).getData('text/plain');
    if(!text){
      const h=(e.clipboardData||window.clipboardData).getData('text/html');
      const tmp=document.createElement('div'); tmp.innerHTML=h;
      text=tmp.textContent||tmp.innerText||'';
    }
    document.execCommand('insertText',false,text);
  });
});
