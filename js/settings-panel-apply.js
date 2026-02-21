// settings-panel-apply.js — 설정값을 본문 스타일에 적용 + 저장/복원
function _stpApply(id, val){
  var root = document.documentElement;
  if(id==='fontSize')  root.style.setProperty('--vtxt-size', val+'px');
  if(id==='letterSp')  root.style.setProperty('--vtxt-ls', val+'em');
  if(id==='lineH')     root.style.setProperty('--vtxt-lh', val);
}

function _stpSave(){
  var o = {};
  var fs = document.getElementById('stpR_fontSize');
  var ls = document.getElementById('stpR_letterSp');
  var lh = document.getElementById('stpR_lineH');
  if(fs) o.fontSize = parseFloat(fs.value);
  if(ls) o.letterSp = parseFloat(ls.value);
  if(lh) o.lineH    = parseFloat(lh.value);
  try{ localStorage.setItem(_STP_KEY, JSON.stringify(o)); }catch(e){}
}

function _stpToggleTheme(dark){
  setTheme(dark ? 'dark' : 'light');
}

function _stpSetTheme(theme){
  if(typeof ThemeSwitcher !== 'undefined') ThemeSwitcher.setTheme(theme);
  else setTheme(theme);
  renderSettingsPanel();
}

function _stpSetAccent(accent){
  if(typeof ThemeSwitcher !== 'undefined') ThemeSwitcher.setAccent(accent);
  renderSettingsPanel();
}

function _stpSetBase(base){
  if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.setBase) ThemeSwitcher.setBase(base);
  renderSettingsPanel();
}

// 커스텀 강조색 — 라이브(드래그 중) + 확정
function _stpPickAccentLive(hex){
  if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.setCustomAccent) ThemeSwitcher.setCustomAccent(hex);
}
function _stpPickAccent(hex){
  _stpPickAccentLive(hex);
  renderSettingsPanel();
}

// 커스텀 배경색 — 라이브(드래그 중) + 확정
function _stpPickBaseLive(hex){
  if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.setCustomBase) ThemeSwitcher.setCustomBase(hex);
}
function _stpPickBase(hex){
  _stpPickBaseLive(hex);
  renderSettingsPanel();
}

// 본문 텍스트 색상
function _stpSetContentColor(hex){
  if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.setContentColor) ThemeSwitcher.setContentColor(hex);
  renderSettingsPanel();
}
function _stpPickContentColorLive(hex){
  if(typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.setContentColor) ThemeSwitcher.setContentColor(hex);
}
function _stpPickContentColor(hex){
  _stpPickContentColorLive(hex);
  renderSettingsPanel();
}

function _stpSetLang(lang){
  if(typeof I18N !== 'undefined'){
    I18N.setLang(lang).then(function(){
      renderSettingsPanel();
    });
  }
}

// 색상 초기화 (테마 다크 + 강조 블루 + 배경 블루)
function _stpResetColors(){
  if(typeof ThemeSwitcher !== 'undefined'){
    ThemeSwitcher.setTheme('dark');
    ThemeSwitcher.setAccent('blue');
    if(ThemeSwitcher.setBase) ThemeSwitcher.setBase('blue');
    if(ThemeSwitcher.resetContentColor) ThemeSwitcher.resetContentColor();
  }
  renderSettingsPanel();
}

// 본문 설정 초기화 (글꼴 크기, 자간, 줄간)
function _stpResetText(){
  var d = _stpDefaults;
  _stpApply('fontSize', d.fontSize);
  _stpApply('letterSp', d.letterSp);
  _stpApply('lineH', d.lineH);
  try{ localStorage.removeItem(_STP_KEY); }catch(e){}
  renderSettingsPanel();
}

// 전체 초기화 (하위 호환)
function _stpReset(){
  _stpResetColors();
  _stpResetText();
}

function _stpRestoreOnLoad(){
  var v = _getSettingsValues();
  _stpApply('fontSize', v.fontSize);
  _stpApply('letterSp', v.letterSp);
  _stpApply('lineH', v.lineH);
}
