// Quick search bar handler
function doQS(){
  const q=document.getElementById('qsInput').value.trim(); if(!q)return;
  document.getElementById('schInput').value=q;
  const rp=document.getElementById('rightPanel');
  rp.classList.remove('rp-hide');
  switchTab('search'); doSearch();
}
