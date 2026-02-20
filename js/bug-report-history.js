// bug-report-history.js — 제출된 버그 리포트 로컬 히스토리
function _bugSaveLocal(title,desc,url){
  try{
    const list=JSON.parse(localStorage.getItem('bugReports')||'[]');
    list.unshift({title,desc,url,date:new Date().toISOString()});
    if(list.length>20) list.length=20;
    localStorage.setItem('bugReports',JSON.stringify(list));
  }catch(e){}
}

function _bugLoadHistory(){
  const wrap=document.getElementById('bugHistory');
  if(!wrap) return;
  let list=[];
  try{ list=JSON.parse(localStorage.getItem('bugReports')||'[]'); }catch(e){}
  if(!list.length){ wrap.innerHTML=''; return; }
  let h='<div class="bug-hist-head">내가 제출한 리포트</div>';
  list.forEach(r=>{
    const d=new Date(r.date);
    const ds=(d.getMonth()+1)+'/'+d.getDate()+' '+d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');
    h+='<a class="bug-hist-item" href="'+r.url+'" target="_blank" rel="noopener">';
    h+='<span class="bug-hist-title">'+_bugEsc(r.title)+'</span>';
    h+='<span class="bug-hist-date">'+ds+'</span></a>';
  });
  wrap.innerHTML=h;
}

function _bugEsc(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
}
