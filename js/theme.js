// theme.js — Theme initialization + legacy compatibility layer
// New system: ThemeSwitcher (theme-switcher.js) handles 3 themes + accents
// This file maintains backward-compatible toggleTheme/setTheme/initTheme

function toggleTheme(){
  if(typeof ThemeSwitcher !== 'undefined'){
    var next = ThemeSwitcher.cycleTheme();
    return next;
  }
  // Legacy fallback
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

function setTheme(t){
  if(typeof ThemeSwitcher !== 'undefined'){
    ThemeSwitcher.setTheme(t);
  } else {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('kjb2-theme', t);
  }
}

function initTheme(){
  if(typeof ThemeSwitcher !== 'undefined'){
    ThemeSwitcher.init();
  } else {
    var saved = localStorage.getItem('kjb2-theme') || 'dark';
    setTheme(saved);
  }
}
