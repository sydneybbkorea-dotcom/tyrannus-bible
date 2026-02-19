// commentary.js — commentary mode state, updateDict, setCommMode, navByRef
let _commMode = 'verse'; // 'verse' | 'chapter'

function updateDict(){
  if(_commMode === 'chapter') updateChapterCommentary();
  else updateCommentary();
}

function setCommMode(mode){
  _commMode = mode;
  document.getElementById('commModeVerse')?.classList.toggle('comm-mode-active', mode==='verse');
  document.getElementById('commModeChapter')?.classList.toggle('comm-mode-active', mode==='chapter');
  updateDict();
}

function navByRef(ref){
  const m=ref.match(/^(.+?)\s(\d+):(\d+)$/);
  if(!m) return;
  if(typeof openBibleTab==='function') openBibleTab(m[1], parseInt(m[2]), parseInt(m[3]));
}
