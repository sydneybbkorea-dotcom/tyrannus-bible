// theme.js — 다크/라이트 테마 토글
function toggleTheme(){
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('kjb2-theme', t);
}
function initTheme(){
  var saved = localStorage.getItem('kjb2-theme') || 'dark';
  setTheme(saved);
}
