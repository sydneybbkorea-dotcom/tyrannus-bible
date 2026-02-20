// i18n.js — 다국어 코어: t() 함수, setLang(), applyI18n()
window._LANGS = { ko:{}, en:{} };
window._lang = localStorage.getItem('kjb2-lang') || 'ko';

// 번역 키 조회 (fallback: 키 그대로 반환)
window.t = function(key){
  var dict = window._LANGS[window._lang];
  if(dict && dict[key] !== undefined) return dict[key];
  var fb = window._LANGS['ko'];
  if(fb && fb[key] !== undefined) return fb[key];
  return key;
};

// 언어 변경 + 전체 리렌더
window.setLang = function(lang){
  window._lang = lang;
  try{ localStorage.setItem('kjb2-lang', lang); }catch(e){}
  if(typeof renderAll === 'function') renderAll();
  if(typeof renderSettingsPanel === 'function') renderSettingsPanel();
  applyI18n();
};

// DOM data-i18n 속성 일괄 적용
window.applyI18n = function(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el){
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    if(el.placeholder !== undefined) el.placeholder = t(el.getAttribute('data-i18n-ph'));
    else if(el.dataset && el.dataset.ph !== undefined) el.dataset.ph = t(el.getAttribute('data-i18n-ph'));
  });
};

// 책 이름 다국어 반환 헬퍼
window.bookName = function(kr){
  if(window._lang==='en' && window.BOOK_EN && BOOK_EN[kr]) return BOOK_EN[kr];
  return kr;
};
