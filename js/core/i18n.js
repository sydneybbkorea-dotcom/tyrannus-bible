// i18n.js — Internationalization system (Korean/English UI switching)
// JSON-based translation with DOM attribute replacement

var I18N = (function(){
  var LANG_KEY = 'kjb2-lang';
  var _lang = 'ko';
  var _data = {};

  function init(){
    _lang = localStorage.getItem(LANG_KEY) || 'ko';
    document.documentElement.setAttribute('lang', _lang);
    return _loadData(_lang).then(function(){
      applyI18N();
    });
  }

  function _loadData(lang){
    // Try loading from embedded data first, then fetch JSON
    if(window._i18nData && window._i18nData[lang]){
      _data = window._i18nData[lang];
      return Promise.resolve();
    }
    return fetch('data/i18n-' + lang + '.json')
      .then(function(r){ return r.json(); })
      .then(function(d){ _data = d; })
      .catch(function(){
        console.warn('[i18n] Failed to load ' + lang + ', falling back to ko');
        if(lang !== 'ko'){
          return fetch('data/i18n-ko.json')
            .then(function(r){ return r.json(); })
            .then(function(d){ _data = d; });
        }
      });
  }

  // Translate a key path like "nav.bible" → value
  function t(key, fallback){
    var parts = key.split('.');
    var val = _data;
    for(var i = 0; i < parts.length; i++){
      if(val == null) return fallback || key;
      val = val[parts[i]];
    }
    return val || fallback || key;
  }

  // Apply translations to all elements with data-i18n attribute
  function applyI18N(){
    var els = document.querySelectorAll('[data-i18n]');
    for(var i = 0; i < els.length; i++){
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if(val && val !== key){
        // Check for attribute targets: data-i18n-attr="placeholder"
        var attr = el.getAttribute('data-i18n-attr');
        if(attr){
          el.setAttribute(attr, val);
        } else {
          // Preserve child elements (like icons)
          var firstIcon = el.querySelector('i, svg');
          if(firstIcon && el.childNodes.length <= 3){
            // Icon + text pattern: replace text node only
            var textNode = null;
            for(var j = 0; j < el.childNodes.length; j++){
              if(el.childNodes[j].nodeType === 3 && el.childNodes[j].textContent.trim()){
                textNode = el.childNodes[j];
                break;
              }
            }
            if(textNode){
              textNode.textContent = ' ' + val;
            } else {
              // Append text after icon
              el.appendChild(document.createTextNode(' ' + val));
            }
          } else if(!el.children.length){
            el.textContent = val;
          } else {
            // Complex element: use data-i18n-target for specific child
            var target = el.querySelector('.i18n-text');
            if(target) target.textContent = val;
            else el.textContent = val;
          }
        }
      }
    }
  }

  function setLang(lang){
    if(lang !== 'ko' && lang !== 'en') lang = 'ko';
    _lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    return _loadData(lang).then(function(){
      applyI18N();
      if(typeof EventBus !== 'undefined') EventBus.emit('locale:changed', { lang: lang });
    });
  }

  function getLang(){ return _lang; }

  return {
    init: init,
    t: t,
    applyI18N: applyI18N,
    setLang: setLang,
    getLang: getLang
  };
})();

// Global shortcut
function t(key, fallback){ return I18N.t(key, fallback); }
