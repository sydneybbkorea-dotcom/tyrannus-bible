// theme-switcher.js — Theme/Accent/Base switching with localStorage persistence
// Manages 3 themes + 8 preset colors + custom color picker

var ThemeSwitcher = (function(){
  var THEME_KEY  = 'kjb2-theme';
  var ACCENT_KEY = 'kjb2-accent';
  var BASE_KEY   = 'kjb2-base';
  var CUSTOM_ACCENT_KEY = 'kjb2-accent-custom';
  var CUSTOM_BASE_KEY   = 'kjb2-base-custom';
  var BOOK_ACCENT_KEY   = 'kjb2-book-accent';
  var CUSTOM_BOOK_ACCENT_KEY = 'kjb2-book-accent-custom';
  var CONTENT_COLOR_KEY = 'kjb2-content-color';
  var THEMES  = ['light', 'dark', 'sepia'];
  var ACCENTS = ['blue', 'red', 'orange', 'yellow', 'cyan', 'purple', 'pink', 'black'];
  var BASES   = ['blue', 'red', 'orange', 'yellow', 'cyan', 'purple', 'pink', 'black'];
  var DARK_DEFAULT_ACCENT  = '#bd8a00';
  var LIGHT_DEFAULT_ACCENT = '#f06f38';

  // bg 인라인 오버라이드 목록
  var BG_PROPS = ['--bg-primary','--bg-secondary','--bg-tertiary','--bg-surface',
                  '--border-color','--rail-bg-color'];

  function hexToHSL(hex){
    var r = parseInt(hex.slice(1,3),16)/255;
    var g = parseInt(hex.slice(3,5),16)/255;
    var b = parseInt(hex.slice(5,7),16)/255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var h=0, s=0, l=(max+min)/2;
    if(max !== min){
      var d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      if(max===r) h=((g-b)/d+(g<b?6:0))/6;
      else if(max===g) h=((b-r)/d+2)/6;
      else h=((r-g)/d+4)/6;
    }
    return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
  }

  function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }

  function getTheme(){ return localStorage.getItem(THEME_KEY) || 'dark'; }
  function getAccent(){ return localStorage.getItem(ACCENT_KEY) || 'custom'; }
  function getBase(){
    var stored = localStorage.getItem(BASE_KEY);
    if(stored) return stored;
    return 'custom';
  }
  function _defaultAccent(){ return getTheme() === 'light' ? LIGHT_DEFAULT_ACCENT : DARK_DEFAULT_ACCENT; }
  function getCustomAccent(){ return localStorage.getItem(CUSTOM_ACCENT_KEY) || _defaultAccent(); }
  function getCustomBase(){ return localStorage.getItem(CUSTOM_BASE_KEY) || '#04050b'; }

  // 커스텀 배경 bg-* 인라인 적용/해제
  function _applyCustomBg(){
    var root = document.documentElement;
    var base = localStorage.getItem(BASE_KEY);
    var theme = getTheme();
    // 먼저 전부 해제
    BG_PROPS.forEach(function(p){ root.style.removeProperty(p); });
    root.style.removeProperty('--base-h');
    root.style.removeProperty('--base-s');
    root.style.removeProperty('--base-l');
    // 커스텀 배경색 — 모든 테마 지원
    if(base === 'custom'){
      var hex = localStorage.getItem(CUSTOM_BASE_KEY) || '#086DDD';
      var c = hexToHSL(hex);
      var h=c.h, s=c.s, l=c.l;
      root.style.setProperty('--base-h', h);
      root.style.setProperty('--base-s', s + '%');
      root.style.setProperty('--base-l', l + '%');
      if(l > 50){
        // Light/Sepia (밝은 배경): 오프셋 아래로
        root.style.setProperty('--bg-primary',   'hsl('+h+','+s+'%,'+l+'%)');
        root.style.setProperty('--bg-secondary', 'hsl('+h+','+s+'%,'+clamp(l-4,0,100)+'%)');
        root.style.setProperty('--bg-tertiary',  'hsl('+h+','+s+'%,'+clamp(l-10,0,100)+'%)');
        root.style.setProperty('--bg-surface',   'hsl('+h+','+clamp(s+5,0,100)+'%,'+clamp(l+2,0,100)+'%)');
        root.style.setProperty('--border-color', 'hsl('+h+','+s+'%,'+clamp(l-12,0,100)+'%)');
        root.style.setProperty('--rail-bg-color','hsl('+h+','+s+'%,'+clamp(l-3,0,100)+'%)');
      } else {
        // Dark (어두운 배경): 기존 동작 (오프셋 위로)
        root.style.setProperty('--bg-primary',   'hsl('+h+','+s+'%,'+l+'%)');
        root.style.setProperty('--bg-secondary', 'hsl('+h+','+clamp(s-7,0,100)+'%,'+clamp(l+4,0,100)+'%)');
        root.style.setProperty('--bg-tertiary',  'hsl('+h+','+clamp(s-13,0,100)+'%,'+clamp(l+10,0,100)+'%)');
        root.style.setProperty('--bg-surface',   'hsl('+h+','+clamp(s-7,0,100)+'%,'+clamp(l+5,0,100)+'%)');
        root.style.setProperty('--border-color', 'hsl('+h+','+clamp(s-13,0,100)+'%,'+clamp(l+8,0,100)+'%)');
        root.style.setProperty('--rail-bg-color','hsl('+h+','+s+'%,'+clamp(l-1,0,100)+'%)');
      }
    }
  }

  function setTheme(theme){
    if(THEMES.indexOf(theme) === -1) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    _applyCustomBg();
    // 테마 기본 강조색 자동 적용 (사용자가 직접 지정하지 않은 경우)
    var accent = getAccent();
    if(accent === 'custom'){
      var cur = localStorage.getItem(CUSTOM_ACCENT_KEY);
      if(!cur || cur === DARK_DEFAULT_ACCENT || cur === LIGHT_DEFAULT_ACCENT){
        setCustomAccent(_defaultAccent());
      }
    }
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { theme: theme });
  }

  function setAccent(accent){
    if(ACCENTS.indexOf(accent) === -1) accent = 'red';
    var root = document.documentElement;
    root.setAttribute('data-accent', accent);
    root.style.removeProperty('--accent-h');
    root.style.removeProperty('--accent-s');
    root.style.removeProperty('--accent-l');
    localStorage.setItem(ACCENT_KEY, accent);
    localStorage.removeItem(CUSTOM_ACCENT_KEY);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { accent: accent });
  }

  function setCustomAccent(hex){
    var hsl = hexToHSL(hex);
    var root = document.documentElement;
    root.setAttribute('data-accent', 'custom');
    root.style.setProperty('--accent-h', hsl.h);
    root.style.setProperty('--accent-s', hsl.s + '%');
    root.style.setProperty('--accent-l', hsl.l + '%');
    localStorage.setItem(ACCENT_KEY, 'custom');
    localStorage.setItem(CUSTOM_ACCENT_KEY, hex);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { accent: 'custom' });
  }

  function setBase(base){
    if(BASES.indexOf(base) === -1) base = 'red';
    document.documentElement.setAttribute('data-base', base);
    localStorage.setItem(BASE_KEY, base);
    localStorage.removeItem(CUSTOM_BASE_KEY);
    _applyCustomBg();   // 인라인 전부 해제
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { base: base });
  }

  function setCustomBase(hex){
    document.documentElement.setAttribute('data-base', 'custom');
    localStorage.setItem(BASE_KEY, 'custom');
    localStorage.setItem(CUSTOM_BASE_KEY, hex);
    _applyCustomBg();   // 인라인 직접 세팅
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { base: 'custom' });
  }

  // 본문 텍스트 색상
  function getContentColor(){ return localStorage.getItem(CONTENT_COLOR_KEY) || ''; }
  function setContentColor(hex){
    var root = document.documentElement;
    if(!hex){
      root.style.removeProperty('--content-text');
      root.style.removeProperty('--content-text-sub');
      localStorage.removeItem(CONTENT_COLOR_KEY);
    } else {
      var c = hexToHSL(hex);
      root.style.setProperty('--content-text', hex);
      // sub 색상은 메인보다 약간 흐리게
      var subL = c.l > 50 ? clamp(c.l - 20, 0, 100) : clamp(c.l + 20, 0, 100);
      root.style.setProperty('--content-text-sub', 'hsl('+c.h+','+c.s+'%,'+subL+'%)');
      localStorage.setItem(CONTENT_COLOR_KEY, hex);
    }
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { contentColor: hex });
  }
  function resetContentColor(){ setContentColor(''); }

  // ── Book Accent (성경 본문 강조색) ──
  function getBookAccent(){ return localStorage.getItem(BOOK_ACCENT_KEY) || 'custom'; }
  function getCustomBookAccent(){ return localStorage.getItem(CUSTOM_BOOK_ACCENT_KEY) || '#bd8a00'; }

  function setBookAccent(preset){
    if(ACCENTS.indexOf(preset) === -1) preset = 'red';
    var root = document.documentElement;
    root.setAttribute('data-book-accent', preset);
    root.style.removeProperty('--book-h');
    root.style.removeProperty('--book-s');
    root.style.removeProperty('--book-l');
    localStorage.setItem(BOOK_ACCENT_KEY, preset);
    localStorage.removeItem(CUSTOM_BOOK_ACCENT_KEY);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { bookAccent: preset });
  }

  function setCustomBookAccent(hex){
    var hsl = hexToHSL(hex);
    var root = document.documentElement;
    root.setAttribute('data-book-accent', 'custom');
    root.style.setProperty('--book-h', hsl.h);
    root.style.setProperty('--book-s', hsl.s + '%');
    root.style.setProperty('--book-l', hsl.l + '%');
    localStorage.setItem(BOOK_ACCENT_KEY, 'custom');
    localStorage.setItem(CUSTOM_BOOK_ACCENT_KEY, hex);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { bookAccent: 'custom' });
  }

  function cycleTheme(){
    var cur = getTheme();
    var idx = THEMES.indexOf(cur);
    var next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
    return next;
  }

  function init(){
    // 기존 방문자 1회 마이그레이션: 이전 기본값(blue) → 새 기본값(#bd8a00/#04050b)
    if(!localStorage.getItem('kjb2-theme-v2')){
      // 사용자가 직접 바꾼 적 없으면(blue 기본값) 새 기본값으로 리셋
      var oldAccent = localStorage.getItem(ACCENT_KEY);
      var oldBase = localStorage.getItem(BASE_KEY);
      if(!oldAccent || oldAccent === 'blue' || oldAccent === 'red'){
        localStorage.removeItem(ACCENT_KEY);
        localStorage.removeItem(CUSTOM_ACCENT_KEY);
      }
      if(!oldBase || oldBase === 'blue' || oldBase === 'red'){
        localStorage.removeItem(BASE_KEY);
        localStorage.removeItem(CUSTOM_BASE_KEY);
      }
      localStorage.setItem('kjb2-theme-v2', '1');
    }

    setTheme(getTheme());
    var accent = getAccent();
    if(accent === 'custom') setCustomAccent(getCustomAccent());
    else setAccent(accent);
    var base = getBase();
    if(base === 'custom') setCustomBase(getCustomBase());
    else setBase(base);
    // Book accent 초기화
    var bookAcc = getBookAccent();
    if(bookAcc === 'custom') setCustomBookAccent(getCustomBookAccent());
    else setBookAccent(bookAcc);

    var cc = getContentColor();
    if(cc) setContentColor(cc);
  }

  return {
    THEMES: THEMES, ACCENTS: ACCENTS, BASES: BASES,
    DARK_DEFAULT_ACCENT: DARK_DEFAULT_ACCENT, LIGHT_DEFAULT_ACCENT: LIGHT_DEFAULT_ACCENT,
    hexToHSL: hexToHSL, defaultAccent: _defaultAccent,
    getTheme: getTheme, getAccent: getAccent, getBase: getBase,
    getCustomAccent: getCustomAccent, getCustomBase: getCustomBase,
    setTheme: setTheme, setAccent: setAccent, setBase: setBase,
    setCustomAccent: setCustomAccent, setCustomBase: setCustomBase,
    getContentColor: getContentColor, setContentColor: setContentColor, resetContentColor: resetContentColor,
    getBookAccent: getBookAccent, getCustomBookAccent: getCustomBookAccent,
    setBookAccent: setBookAccent, setCustomBookAccent: setCustomBookAccent,
    cycleTheme: cycleTheme, init: init
  };
})();
