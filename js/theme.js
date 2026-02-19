// theme.js — 다크/라이트 테마 토글 스위치
var _sunSVG='<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="12" r="4"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="4.57" y1="4.57" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.43" y2="19.43"/><line x1="4.57" y1="19.43" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.43" y2="4.57"/></g></svg>';
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
  if(icon) icon.innerHTML = t === 'dark' ? _sunSVG : '<i class="fa fa-moon"></i>';
}
function initTheme(){
  const saved = localStorage.getItem('kjb2-theme') || 'dark';
  setTheme(saved);
}
