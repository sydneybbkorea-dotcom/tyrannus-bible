// settings-panel-ctrl.js — 설정 패널 슬라이더/토글 핸들러 + localStorage 저장
var _stpDefaults = { fontSize:17, letterSp:0.02, lineH:1.85 };
var _STP_KEY = 'kjb2-text-settings';

function _stpSliderRow(id, label, icon, val, min, max, step, unit){
  var display = (step<1) ? val.toFixed(2) : val;
  return '<div class="stp-row">'
    + '<div class="stp-row-head"><i class="fa ' + icon + '"></i> '
    + label + '<span class="stp-val" id="stpVal_' + id + '">' + display + unit + '</span></div>'
    + '<input type="range" class="stp-range" id="stpR_' + id + '"'
    + ' min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"'
    + ' oninput="_stpChange(\'' + id + '\',this.value,\'' + unit + '\')">'
    + '</div>';
}

function _getSettingsValues(){
  var saved = null;
  try{ saved = JSON.parse(localStorage.getItem(_STP_KEY)); } catch(e){}
  var d = _stpDefaults;
  return {
    dark: (document.documentElement.getAttribute('data-theme')||'dark')==='dark',
    fontSize: (saved && saved.fontSize) || d.fontSize,
    letterSp: (saved && saved.letterSp!=null) ? saved.letterSp : d.letterSp,
    lineH: (saved && saved.lineH) || d.lineH
  };
}

function _stpChange(id, val, unit){
  val = parseFloat(val);
  var lbl = document.getElementById('stpVal_' + id);
  if(lbl) lbl.textContent = (unit==='em'||id==='lineH') ? val.toFixed(2)+unit : val+unit;
  _stpApply(id, val);
  _stpSave();
}
