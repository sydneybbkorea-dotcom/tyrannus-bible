// visual-filter.js — 비주얼 필터: 예수님 말씀 (Red Letter)
var RED_LETTER = null;

async function loadRedLetter(){
  if(RED_LETTER) return;
  try {
    const res = await fetch('data/red-letter.json');
    const arr = await res.json();
    RED_LETTER = new Set(arr);
  } catch(e){ RED_LETTER = new Set(); }
}

function toggleRedLetter(){
  S.showRedLetter = !S.showRedLetter;
  persist(); renderBible(); restoreSel();
  if(typeof renderViewBar==='function') renderViewBar();
  toast(S.showRedLetter ? '예수님 말씀 표시' : '예수님 말씀 해제');
}

function isRedLetter(key){
  return S.showRedLetter && RED_LETTER && RED_LETTER.has(key);
}
