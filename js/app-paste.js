// app-paste.js — 노트 붙여넣기 핸들러 (내부 서식 보존)
document.addEventListener('DOMContentLoaded', ()=>{
  const nc=document.getElementById('noteContent');
  if(!nc) return;
  nc.addEventListener('paste', e=>{
    e.preventDefault();
    const cd=e.clipboardData||window.clipboardData;
    const html=cd.getData('text/html');
    // 앱 내부 복사 (성경 본문 글꼴 포함) → 서식 보존
    if(html && html.indexOf('KoPubWorld')!==-1){
      document.execCommand('insertHTML',false,html);
      return;
    }
    // 외부 붙여넣기 → plain text만
    let text=cd.getData('text/plain');
    if(!text && html){
      const tmp=document.createElement('div'); tmp.innerHTML=html;
      text=tmp.textContent||tmp.innerText||'';
    }
    document.execCommand('insertText',false,text);
  });
});
