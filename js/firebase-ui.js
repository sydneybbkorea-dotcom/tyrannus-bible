// firebase-ui.js — Login/logout UI bar helpers (global scope)
function showUserBar(user){
  const bar = document.getElementById('userBar');
  const avatar = document.getElementById('userAvatar');
  const name   = document.getElementById('userName');
  if(bar)    bar.style.display = 'flex';
  if(avatar) avatar.src = user.photoURL || '';
  if(name)   name.textContent = user.displayName || user.email;
  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.style.display = 'none';
  const syncBadge = document.getElementById('syncBadge');
  if(syncBadge) syncBadge.style.display = 'flex';
}
function hideUserBar(){
  const bar = document.getElementById('userBar');
  if(bar) bar.style.display = 'none';
  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.style.display = 'flex';
  const syncBadge = document.getElementById('syncBadge');
  if(syncBadge) syncBadge.style.display = 'none';
}
