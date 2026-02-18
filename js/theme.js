function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('kjb2-theme', t);
  // 활성 버튼 강조
  ['dark','light'].forEach(n => {
    const btn = document.getElementById('themeBtn-'+n);
    if(btn) btn.style.background = (n===t) ? 'var(--gold-dim)' : 'transparent';
  });
}
function initTheme(){
  const saved = localStorage.getItem('kjb2-theme') || 'dark';
  setTheme(saved);
}
