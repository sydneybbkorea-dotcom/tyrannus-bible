// strongs-ui.js — toggle Strong codes and parallel view
async function toggleStrongCodes(){
  S.showStrong = !S.showStrong;
  document.getElementById('tbStrong')?.classList.toggle('on', S.showStrong);
  if(S.showStrong){
    await Promise.all([loadStrongs(), loadVerseStrongs()]);
  }
  renderBible(); restoreSel();
  toast(S.showStrong ? '원어 코드 표시 ON' : '원어 코드 표시 OFF');
}

async function toggleParallel(){
  S.showParallel = !S.showParallel;
  document.getElementById('tbParallel')?.classList.toggle('on', S.showParallel);
  if(S.showParallel){
    await loadBibleEN();
  }
  renderBible(); restoreSel();
  toast(S.showParallel ? '영한 대조 ON' : '영한 대조 OFF');
}
