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

function _stpReset(){
  var d = _stpDefaults;
  _stpApply('fontSize', d.fontSize);
  _stpApply('letterSp', d.letterSp);
  _stpApply('lineH', d.lineH);
  try{ localStorage.removeItem(_STP_KEY); }catch(e){}
  renderSettingsPanel();
}

function _stpRestoreOnLoad(){
  var v = _getSettingsValues();
  _stpApply('fontSize', v.fontSize);
  _stpApply('letterSp', v.letterSp);
  _stpApply('lineH', v.lineH);
}
