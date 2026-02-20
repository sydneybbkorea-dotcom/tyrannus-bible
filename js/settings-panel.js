// settings-panel.js — 설정 패널 렌더링 (다크모드, 글꼴, 자간, 줄간, 동기화)
function renderSettingsPanel(){
  var el = document.getElementById('spSettingsBody');
  if(!el) return;
  var v = _getSettingsValues();
  var h = '<div class="stp-wrap">';
  // 다크모드 토글
  h += '<div class="stp-row stp-row-toggle">';
  h += '<span class="stp-label"><i class="fa fa-moon"></i> 다크 모드</span>';
  h += '<label class="stp-switch"><input type="checkbox" id="stpDarkToggle"'
     + (v.dark?' checked':'') + ' onchange="_stpToggleTheme(this.checked)">'
     + '<span class="stp-slider"></span></label>';
  h += '</div>';
  // 글꼴 크기
  h += _stpSliderRow('fontSize','글꼴 크기','fa-text-height',
       v.fontSize, 12, 28, 1, 'px');
  // 자간
  h += _stpSliderRow('letterSp','자간 간격','fa-text-width',
       v.letterSp, 0, 0.12, 0.01, 'em');
  // 줄간
  h += _stpSliderRow('lineH','줄 간격','fa-arrows-alt-v',
       v.lineH, 1.2, 3.0, 0.05, '');
  // 초기화 버튼
  h += '<div class="stp-reset"><button onclick="_stpReset()">기본값 복원</button></div>';
  // 클라우드 동기화 섹션
  h += _stpSyncSection();
  // 로그아웃 버튼 (로그인 상태일 때만 표시)
  h += '<div class="stp-logout" id="stpLogoutWrap" style="display:none">';
  h += '<button class="stp-logout-btn" onclick="signOutUser()">';
  h += '<i class="fa fa-sign-out-alt"></i> 로그아웃</button></div>';
  h += '</div>';
  el.innerHTML = h;
  // 로그인 상태면 로그아웃 버튼 표시
  var ub=document.getElementById('userBar');
  var lw=document.getElementById('stpLogoutWrap');
  if(lw&&ub&&ub.style.display!=='none') lw.style.display='';
}
