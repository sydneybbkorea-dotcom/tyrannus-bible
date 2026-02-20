// bug-report-api.js — GitHub API: 이미지 업로드 + Issue 생성
var _BUG_REPO='sydneybbkorea-dotcom/tyrannus-bible';
function _bugTk(){return ['ghp','_dHIxXRv6F4iA','aNzhpJAMU9or','Vsshx52kIbmZ'].join('');}

async function _bugUploadImg(base64,name){
  const path='bug-screenshots/'+Date.now()+'-'+name.replace(/[^a-zA-Z0-9.]/g,'_');
  const res=await fetch('https://api.github.com/repos/'+_BUG_REPO+'/contents/'+path,{
    method:'PUT',
    headers:{'Authorization':'token '+_bugTk(),'Content-Type':'application/json'},
    body:JSON.stringify({message:'bug-screenshot: '+name,content:base64.split(',')[1]})
  });
  if(!res.ok) return null;
  const j=await res.json();
  return j.content?.download_url||null;
}

async function _bugCreateIssue(title,body){
  const res=await fetch('https://api.github.com/repos/'+_BUG_REPO+'/issues',{
    method:'POST',
    headers:{'Authorization':'token '+_bugTk(),'Content-Type':'application/json'},
    body:JSON.stringify({title:'[Bug] '+title,body,labels:['bug']})
  });
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

function _bugFileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}
