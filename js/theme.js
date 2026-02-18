// theme.js — 다크/라이트 테마 전환
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('kjb2-theme', t);
  ['dark','light'].forEach(n => {
    const btn = document.getElementById('themeBtn-'+n);
    if(!btn) return;
    const active = (n === t);
    btn.style.background = active ? 'var(--gold-dim)' : 'transparent';
    btn.style.color = active ? (n==='dark' ? '#fff' : 'var(--gold)') : 'var(--text3)';
  });
}
function initTheme(){
  const saved = localStorage.getItem('kjb2-theme') || 'dark';
  setTheme(saved);
}
