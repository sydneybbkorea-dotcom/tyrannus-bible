// strongs-ui.js — toggle Strong codes and parallel view
async function toggleStrongCodes(){
  S.showStrong = !S.showStrong;
  if(S.showStrong){
    var loads=[loadStrongs(), loadVerseStrongs()];
    if(typeof loadEnStrongsForBook==='function') loads.push(loadEnStrongsForBook(S.book));
    if(typeof loadStrongsDictForBook==='function') loads.push(loadStrongsDictForBook(S.book));
    if(S.showParallel) loads.push(loadBibleEN());
    toast('원어 코드 데이터 로딩 중...');
    await Promise.all(loads);
  }
  renderBible(); restoreSel();
  if(typeof renderViewBar==='function') renderViewBar();
  toast(S.showStrong ? '원어 코드 표시 ON' : '원어 코드 표시 OFF');
}

async function toggleParallel(){
  S.showParallel = !S.showParallel;
  if(S.showParallel){
    var loads=[loadBibleEN()];
    if(S.showStrong&&typeof loadEnStrongsForBook==='function') loads.push(loadEnStrongsForBook(S.book));
    await Promise.all(loads);
  }
  renderBible(); restoreSel();
  if(typeof renderViewBar==='function') renderViewBar();
  toast(S.showParallel ? '영한 대조 ON' : '영한 대조 OFF');
}
