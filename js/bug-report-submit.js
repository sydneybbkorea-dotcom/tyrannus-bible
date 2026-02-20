// bug-report-submit.js — GitHub Issues API로 버그 리포트 제출
async function bugSubmit(){
  const title=(document.getElementById('bugTitle')?.value||'').trim();
  const desc=(document.getElementById('bugDesc')?.value||'').trim();
  const status=document.getElementById('bugStatus');
  if(!title){ _bugMsg(status,'제목을 입력해주세요','warn'); return; }
  _bugMsg(status,'<i class="fa fa-spinner fa-spin"></i> 제출 중...','info');

  // 이미지 → base64 → GitHub에 업로드 후 URL 수집
  let imgMd='';
  try{
    for(let i=0;i<_bugFiles.length;i++){
      const b64=await _bugFileToBase64(_bugFiles[i]);
      const url=await _bugUploadImg(b64,_bugFiles[i].name);
      if(url) imgMd+='\n![screenshot-'+(i+1)+']('+url+')';
    }
  }catch(e){ console.error('img upload',e); }

  const ua=navigator.userAgent;
  const page=S.book+' '+S.ch+'장';
  let body='## 설명\n'+(desc||'(없음)')+'\n\n';
  body+='## 환경\n- 페이지: '+page+'\n- UA: `'+ua+'`\n';
  if(imgMd) body+='\n## 스크린샷'+imgMd+'\n';

  try{
    const res=await _bugCreateIssue(title,body);
    if(res&&res.html_url){
      _bugMsg(status,'✅ 제출 완료!','ok');
      _bugSaveLocal(title,desc,res.html_url);
      document.getElementById('bugTitle').value='';
      document.getElementById('bugDesc').value='';
      _bugFiles=[]; _bugRenderPreviews(); _bugLoadHistory();
    } else { _bugMsg(status,'제출 실패: 다시 시도해주세요','warn'); }
  }catch(e){ _bugMsg(status,'제출 실패: '+e.message,'warn'); }
}

function _bugMsg(el,html,cls){
  if(!el) return;
  el.className='bug-status bug-status-'+cls;
  el.innerHTML=html;
}
