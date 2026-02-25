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
  var RAIL_ACCENT_KEY = 'kjb2-rail-accent';
  var CUSTOM_RAIL_ACCENT_KEY = 'kjb2-rail-accent-custom';
  var LAYOUT_COLOR_KEY = 'kjb2-layout-color';
  var CUSTOM_LAYOUT_COLOR_KEY = 'kjb2-layout-color-custom';
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

  // ── Rail Accent (레일 독립 강조색) ──
  function getRailAccent(){ return localStorage.getItem(RAIL_ACCENT_KEY) || ''; }
  function getCustomRailAccent(){ return localStorage.getItem(CUSTOM_RAIL_ACCENT_KEY) || ''; }

  function setRailAccent(preset){
    var root = document.documentElement;
    if(!preset || preset === 'default'){
      // 기본: 앱 accent 따라감
      root.style.removeProperty('--rail-accent');
      root.style.removeProperty('--rail-accent-dim');
      localStorage.removeItem(RAIL_ACCENT_KEY);
      localStorage.removeItem(CUSTOM_RAIL_ACCENT_KEY);
    } else if(ACCENTS.indexOf(preset) !== -1){
      // 프리셋: HSL 계산해서 인라인 적용
      var hslMap = {
        blue:{h:214,s:92,l:50}, red:{h:0,s:85,l:50}, orange:{h:30,s:90,l:50},
        yellow:{h:46,s:100,l:44}, cyan:{h:179,s:100,l:37}, purple:{h:256,s:83,l:63},
        pink:{h:330,s:65,l:53}, black:{h:0,s:0,l:65}
      };
      var c = hslMap[preset];
      root.style.setProperty('--rail-accent', 'hsl('+c.h+','+c.s+'%,'+c.l+'%)');
      root.style.setProperty('--rail-accent-dim', 'hsla('+c.h+','+c.s+'%,'+c.l+'%,0.15)');
      localStorage.setItem(RAIL_ACCENT_KEY, preset);
      localStorage.removeItem(CUSTOM_RAIL_ACCENT_KEY);
    }
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { railAccent: preset });
  }

  function setCustomRailAccent(hex){
    var hsl = hexToHSL(hex);
    var root = document.documentElement;
    root.style.setProperty('--rail-accent', 'hsl('+hsl.h+','+hsl.s+'%,'+hsl.l+'%)');
    root.style.setProperty('--rail-accent-dim', 'hsla('+hsl.h+','+hsl.s+'%,'+hsl.l+'%,0.15)');
    localStorage.setItem(RAIL_ACCENT_KEY, 'custom');
    localStorage.setItem(CUSTOM_RAIL_ACCENT_KEY, hex);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { railAccent: 'custom' });
  }

  // ── Layout Color (레이아웃/패널 배경색) ──
  function getLayoutColor(){ return localStorage.getItem(LAYOUT_COLOR_KEY) || ''; }
  function getCustomLayoutColor(){ return localStorage.getItem(CUSTOM_LAYOUT_COLOR_KEY) || ''; }

  function setLayoutColor(preset){
    var root = document.documentElement;
    if(!preset || preset === 'default'){
      root.style.removeProperty('--layout-bg');
      root.style.removeProperty('--layout-bg-header');
      localStorage.removeItem(LAYOUT_COLOR_KEY);
      localStorage.removeItem(CUSTOM_LAYOUT_COLOR_KEY);
    } else if(ACCENTS.indexOf(preset) !== -1){
      var hslMap = {
        blue:{h:214,s:30,l:12}, red:{h:0,s:25,l:10}, orange:{h:30,s:25,l:10},
        yellow:{h:46,s:25,l:10}, cyan:{h:179,s:25,l:10}, purple:{h:256,s:25,l:12},
        pink:{h:330,s:20,l:10}, black:{h:0,s:0,l:6}
      };
      var c = hslMap[preset];
      var theme = getTheme();
      if(theme === 'light'){
        root.style.setProperty('--layout-bg', 'hsla('+c.h+','+clamp(c.s+20,0,60)+'%,'+clamp(c.l+82,85,98)+'%,0.65)');
        root.style.setProperty('--layout-bg-header', 'hsla('+c.h+','+clamp(c.s+15,0,50)+'%,'+clamp(c.l+78,80,95)+'%,0.50)');
      } else if(theme === 'sepia'){
        root.style.setProperty('--layout-bg', 'hsla('+c.h+','+clamp(c.s+10,0,40)+'%,'+clamp(c.l+78,80,95)+'%,0.60)');
        root.style.setProperty('--layout-bg-header', 'hsla('+c.h+','+clamp(c.s+5,0,35)+'%,'+clamp(c.l+75,78,92)+'%,0.45)');
      } else {
        root.style.setProperty('--layout-bg', 'hsla('+c.h+','+c.s+'%,'+c.l+'%,0.65)');
        root.style.setProperty('--layout-bg-header', 'hsla('+c.h+','+clamp(c.s-5,0,100)+'%,'+clamp(c.l+3,0,100)+'%,0.30)');
      }
      localStorage.setItem(LAYOUT_COLOR_KEY, preset);
      localStorage.removeItem(CUSTOM_LAYOUT_COLOR_KEY);
    }
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { layoutColor: preset });
  }

  function setCustomLayoutColor(hex){
    var hsl = hexToHSL(hex);
    var root = document.documentElement;
    var theme = getTheme();
    var h=hsl.h, s=hsl.s, l=hsl.l;
    if(theme === 'light' || theme === 'sepia'){
      var bl = clamp(l > 50 ? l : l + 70, 80, 96);
      root.style.setProperty('--layout-bg', 'hsla('+h+','+clamp(s,5,50)+'%,'+bl+'%,0.65)');
      root.style.setProperty('--layout-bg-header', 'hsla('+h+','+clamp(s,5,45)+'%,'+clamp(bl-4,75,94)+'%,0.50)');
    } else {
      var dl = clamp(l < 30 ? l : l - 30, 3, 25);
      root.style.setProperty('--layout-bg', 'hsla('+h+','+clamp(s,5,40)+'%,'+dl+'%,0.65)');
      root.style.setProperty('--layout-bg-header', 'hsla('+h+','+clamp(s-5,0,35)+'%,'+clamp(dl+3,5,30)+'%,0.30)');
    }
    localStorage.setItem(LAYOUT_COLOR_KEY, 'custom');
    localStorage.setItem(CUSTOM_LAYOUT_COLOR_KEY, hex);
    if(typeof EventBus !== 'undefined') EventBus.emit('theme:changed', { layoutColor: 'custom' });
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
    // Rail accent 초기화
    var railAcc = getRailAccent();
    if(railAcc === 'custom') setCustomRailAccent(getCustomRailAccent());
    else if(railAcc) setRailAccent(railAcc);
    // Layout color 초기화
    var layoutC = getLayoutColor();
    if(layoutC === 'custom') setCustomLayoutColor(getCustomLayoutColor());
    else if(layoutC) setLayoutColor(layoutC);
  }

  // ── 서버 기본값 적용 (사용자 미커스텀 시) ──
  function applyServerDefaults(themeDefaults){
    if(!themeDefaults) return;
    var theme = getTheme();
    var def = themeDefaults[theme];
    if(!def) return;
    // 사용자가 직접 강조색을 설정하지 않은 경우에만 서버 기본값 적용
    var userAccent = localStorage.getItem(CUSTOM_ACCENT_KEY);
    if(!userAccent && def.accentColor){
      setCustomAccent(def.accentColor);
    }
    // 사용자가 직접 배경색을 설정하지 않은 경우에만
    var userBase = localStorage.getItem(CUSTOM_BASE_KEY);
    if(!userBase && def.baseColor){
      setCustomBase(def.baseColor);
    }
    // 사용자가 직접 본문색을 설정하지 않은 경우에만
    var userContent = localStorage.getItem(CONTENT_COLOR_KEY);
    if(!userContent && def.contentColor){
      setContentColor(def.contentColor);
    }
  }

  // Firestore에서 서버 기본값 fetch
  async function fetchServerDefaults(){
    var db = window._firebaseDB;
    var fn = window._fbFn;
    if(!db || !fn) return;
    try {
      var snap = await fn.getDoc(fn.doc(db, 'config', 'theme-defaults'));
      if(snap.exists()){
        applyServerDefaults(snap.data());
      }
    } catch(e){ /* 서버 기본값 없으면 무시 */ }
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
    getRailAccent: getRailAccent, getCustomRailAccent: getCustomRailAccent,
    setRailAccent: setRailAccent, setCustomRailAccent: setCustomRailAccent,
    getLayoutColor: getLayoutColor, getCustomLayoutColor: getCustomLayoutColor,
    setLayoutColor: setLayoutColor, setCustomLayoutColor: setCustomLayoutColor,
    cycleTheme: cycleTheme, init: init,
    applyServerDefaults: applyServerDefaults,
    fetchServerDefaults: fetchServerDefaults
  };
})();
