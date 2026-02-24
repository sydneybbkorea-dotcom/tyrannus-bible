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

// ── 배경 이미지 핸들러 ──
var _stpBgPending = null; // 선택 후 적용 전 임시 dataUrl

function _stpPickBgImage(){
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = function(){
    var file = inp.files && inp.files[0];
    if(!file) return;
    if(file.size > 10 * 1024 * 1024){
      alert('이미지 크기는 10MB 이하로 선택해주세요.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(){
      _stpBgPending = reader.result;
      // 미리보기 표시
      var prev = document.getElementById('stpBgPreview');
      if(prev){ prev.style.display = ''; prev.style.backgroundImage = 'url("' + _stpBgPending + '")'; }
      // 적용 버튼 표시
      var btn = document.getElementById('stpBgApplyBtn');
      if(btn) btn.style.display = '';
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function _stpApplyBgImageBtn(){
  var dataUrl = _stpBgPending;
  if(!dataUrl) return;
  IDBStore.open().then(function(){
    return IDBStore.put('settings', { key: 'bg-image-data', value: dataUrl });
  }).then(function(){
    localStorage.setItem('kjb2-bg-image-enabled', '1');
    _stpApplyBgImage(dataUrl);
    _stpBgPending = null;
    renderSettingsPanel();
  });
}

function _stpRemoveBgImage(){
  _stpBgPending = null;
  IDBStore.open().then(function(){
    return IDBStore.del('settings', 'bg-image-data');
  }).then(function(){
    localStorage.removeItem('kjb2-bg-image-enabled');
    _stpApplyBgImage(null);
    renderSettingsPanel();
  });
}

// 미리보기 썸네일 로드
function _stpLoadBgPreview(){
  var previewEl = document.getElementById('stpBgPreview');
  if(!previewEl) return;
  var enabled = localStorage.getItem('kjb2-bg-image-enabled') === '1';
  if(!enabled){ previewEl.style.display = 'none'; return; }
  IDBStore.open().then(function(){
    return IDBStore.get('settings', 'bg-image-data');
  }).then(function(rec){
    if(rec && rec.value){
      previewEl.style.display = '';
      previewEl.style.backgroundImage = 'url("' + rec.value + '")';
    } else {
      previewEl.style.display = 'none';
    }
  });
}
