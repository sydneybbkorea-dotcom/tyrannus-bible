// firebase-ui.js — Login/logout UI + 동기화 배지 + 용량 표시 (global scope)
function showUserBar(user){
  const bar=document.getElementById('userBar'), avatar=document.getElementById('userAvatar'), name=document.getElementById('userName');
  if(bar) bar.style.display='flex';
  if(avatar) avatar.src=user.photoURL||'';
  if(name) name.textContent=user.displayName||user.email;
  const loginBtn=document.getElementById('loginBtn');
  if(loginBtn) loginBtn.style.display='none';
  const badge=document.getElementById('syncBadge');
  if(badge) badge.style.display='flex';
  const qbar=document.getElementById('quotaBar');
  if(qbar) qbar.style.display='flex';
}
function hideUserBar(){
  const bar=document.getElementById('userBar');
  if(bar) bar.style.display='none';
  const loginBtn=document.getElementById('loginBtn');
  if(loginBtn) loginBtn.style.display='flex';
}
function updateSyncBadge(status){
  const badge=document.getElementById('syncBadge'), txt=document.getElementById('syncText');
  if(!badge) return;
  const m={syncing:{icon:'fa-sync fa-spin',text:'동기화 중...',cls:''},
    synced:{icon:'fa-cloud',text:'동기화 완료',cls:'sync-ok'},
    error:{icon:'fa-exclamation-triangle',text:'동기화 오류',cls:'sync-err'},
    offline:{icon:'fa-cloud-slash',text:'오프라인',cls:'sync-off'}};
  const c=m[status]||m.synced;
  badge.className='sync-badge'+(c.cls?' '+c.cls:'');
  badge.querySelector('i').className='fa '+c.icon;
  if(txt) txt.textContent=c.text;
}
