// firebase-ui.js — Login/logout UI + 동기화 배지 + 용량 표시 (global scope)
function showUserBar(user){
  var bar=document.getElementById('userBar');
  var avatar=document.getElementById('userAvatar');
  var loginBtn=document.getElementById('loginBtn');
  if(bar) bar.style.display='flex';
  if(avatar){
    avatar.src=user.photoURL||'';
    avatar.title=user.displayName||user.email||'';
  }
  if(loginBtn) loginBtn.style.display='none';
  // 설정 패널 내 동기화 섹션 표시
  var wrap=document.getElementById('syncQuotaWrap');
  if(wrap) wrap.style.display='flex';
  var loginMsg=document.getElementById('stpSyncLogin');
  if(loginMsg) loginMsg.style.display='none';
}
function hideUserBar(){
  var bar=document.getElementById('userBar');
  if(bar) bar.style.display='none';
  var loginBtn=document.getElementById('loginBtn');
  if(loginBtn) loginBtn.style.display='flex';
  // 설정 패널: 동기화 숨기고 안내 표시
  var wrap=document.getElementById('syncQuotaWrap');
  if(wrap) wrap.style.display='none';
  var loginMsg=document.getElementById('stpSyncLogin');
  if(loginMsg) loginMsg.style.display='';
}
function updateSyncBadge(status){
  var badge=document.getElementById('syncBadge');
  var txt=document.getElementById('syncText');
  if(!badge) return;
  var m={syncing:{icon:'fa-sync fa-spin',text:'동기화 중...',cls:''},
    synced:{icon:'fa-cloud',text:'동기화 완료',cls:'sync-ok'},
    error:{icon:'fa-exclamation-triangle',text:'오류',cls:'sync-err'},
    offline:{icon:'fa-cloud-slash',text:'오프라인',cls:'sync-off'}};
  var c=m[status]||m.synced;
  badge.className='sync-badge'+(c.cls?' '+c.cls:'');
  badge.querySelector('i').className='fa '+c.icon;
  if(txt) txt.textContent=c.text;
}
