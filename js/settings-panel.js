// settings-panel.js — 설정 패널 렌더링 (언어, 다크모드, 글꼴, 자간, 줄간, 동기화)
function renderSettingsPanel(){
  var el = document.getElementById('spSettingsBody');
  if(!el) return;
  var v = _getSettingsValues();
  var lang = window._lang || 'ko';
  var h = '<div class="stp-wrap">';
  // 언어 선택
  h += '<div class="stp-row stp-row-toggle">';
  h += '<span class="stp-label"><i class="fa fa-globe"></i> Language</span>';
  h += '<div class="stp-lang-btns">';
  h += '<button class="stp-lang-btn'+(lang==='ko'?' on':'')+'" onclick="setLang(\'ko\')">한국어</button>';
  h += '<button class="stp-lang-btn'+(lang==='en'?' on':'')+'" onclick="setLang(\'en\')">English</button>';
  h += '</div></div>';
  // 다크모드 토글
  h += '<div class="stp-row stp-row-toggle">';
  h += '<span class="stp-label"><i class="fa fa-moon"></i> '+t('dark.mode')+'</span>';
  h += '<label class="stp-switch"><input type="checkbox" id="stpDarkToggle"'
     + (v.dark?' checked':'') + ' onchange="_stpToggleTheme(this.checked)">'
     + '<span class="stp-slider"></span></label>';
  h += '</div>';
  h += _stpSliderRow('fontSize',t('font.size'),'fa-text-height', v.fontSize, 12, 28, 1, 'px');
  h += _stpSliderRow('letterSp',t('letter.sp'),'fa-text-width', v.letterSp, 0, 0.12, 0.01, 'em');
  h += _stpSliderRow('lineH',t('line.h'),'fa-arrows-alt-v', v.lineH, 1.2, 3.0, 0.05, '');
  h += '<div class="stp-reset"><button onclick="_stpReset()">'+t('reset')+'</button></div>';
  h += _stpSyncSection();
  // 로그아웃 버튼 (로그인 상태일 때만 표시)
  h += '<div class="stp-logout" id="stpLogoutWrap" style="display:none">';
  h += '<button class="stp-logout-btn" onclick="signOutUser()">';
  h += '<i class="fa fa-sign-out-alt"></i> '+t('logout')+'</button></div>';
  h += '</div>';
  el.innerHTML = h;
  var ub=document.getElementById('userBar');
  var lw=document.getElementById('stpLogoutWrap');
  if(lw&&ub&&ub.style.display!=='none') lw.style.display='';
}
