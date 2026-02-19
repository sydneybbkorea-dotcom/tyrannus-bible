// theme.js — 다크/라이트 테마 토글 스위치
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('kjb2-theme', t);
  const tog = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  const icon = document.getElementById('themeIcon');
  if(tog) { tog.className = 'theme-toggle ' + t; }
  if(label) label.textContent = t === 'dark' ? 'DARK' : 'LIGHT';
  if(icon) icon.className = t === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
}
function initTheme(){
  const saved = localStorage.getItem('kjb2-theme') || 'dark';
  setTheme(saved);
}
