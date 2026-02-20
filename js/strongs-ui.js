// strongs-ui.js — toggle Strong codes, language, parallel view
async function toggleStrongCodes(){
  S.showStrong = !S.showStrong;
  if(S.showStrong){
    var loads=[loadStrongs(), loadVerseStrongs()];
    if(typeof loadEnStrongsForBook==='function') loads.push(loadEnStrongsForBook(S.book));
    if(typeof loadStrongsDictForBook==='function') loads.push(loadStrongsDictForBook(S.book));
    if(S.showEnglish) loads.push(loadBibleEN());
    toast('원어 코드 데이터 로딩 중...');
    await Promise.all(loads);
  }
  renderBible(); restoreSel();
  if(typeof renderViewBar==='function') renderViewBar();
  toast(S.showStrong ? '원어 코드 표시 ON' : '원어 코드 표시 OFF');
}

// 한글/영어 개별 토글
async function toggleLang(lang){
  if(lang==='kr'){
    // 한글 끄기: 영어가 꺼져있으면 영어를 자동으로 켜줌
    if(S.showKorean && !S.showEnglish){ S.showEnglish=true; await _ensureEN(); }
    S.showKorean = !S.showKorean;
  } else {
    // 영어 끄기: 한글이 꺼져있으면 한글을 자동으로 켜줌
    if(S.showEnglish && !S.showKorean){ S.showKorean=true; }
    S.showEnglish = !S.showEnglish;
    if(S.showEnglish) await _ensureEN();
  }
  // showParallel 호환성: 둘 다 켜져있으면 대조 모드
  S.showParallel = S.showKorean && S.showEnglish;
  renderBible(); restoreSel();
  if(typeof renderViewBar==='function') renderViewBar();
}

async function _ensureEN(){
  var loads=[loadBibleEN()];
  if(S.showStrong&&typeof loadEnStrongsForBook==='function')
    loads.push(loadEnStrongsForBook(S.book));
  await Promise.all(loads);
}

// 레거시 호환
async function toggleParallel(){
  await toggleLang('en');
}
