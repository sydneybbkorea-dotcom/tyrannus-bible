// settings-panel.js — 설정 패널 렌더링 (메뉴 + 서브페이지)
var _stpView = 'main';
function _stpGoTheme(){ _stpView='theme'; renderSettingsPanel(); }
function _stpGoMain(){ _stpView='main'; renderSettingsPanel(); }

function renderSettingsPanel(){
  var el = document.getElementById('spSettingsBody');
  if(!el) return;
  var v = _getSettingsValues();
  var h = '<div class="stp-wrap">';

  if(_stpView === 'theme'){
    // ━━━━━━ 테마 서브페이지 ━━━━━━
    h += '<div class="stp-subpage-header" onclick="_stpGoMain()">';
    h += '<i class="fa fa-arrow-left"></i>';
    h += '<span>테마 설정</span>';
    h += '</div>';

    // ━━━━━━ 섹션 1: 테마 & 색상 ━━━━━━
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-swatchbook"></i> 테마 & 색상</div>';

    var curTheme = (typeof ThemeSwitcher !== 'undefined') ? ThemeSwitcher.getTheme() : (document.documentElement.getAttribute('data-theme') || 'dark');
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-palette"></i> <span data-i18n="settings.theme">' + t('settings.theme', '테마') + '</span></div>';
    h += '<div class="stp-theme-btns">';
    var themes = [
      { id:'light', label: t('settings.themeLight', '라이트'), icon:'fa-sun' },
      { id:'dark',  label: t('settings.themeDark', '다크'),   icon:'fa-moon' },
      { id:'sepia', label: t('settings.themeSepia', '세피아'), icon:'fa-book-open' }
    ];
    themes.forEach(function(tm){
      var active = curTheme === tm.id ? ' stp-theme-active' : '';
      h += '<button class="stp-theme-btn' + active + '" onclick="_stpSetTheme(\'' + tm.id + '\')">'
         + '<i class="fa ' + tm.icon + '"></i> ' + tm.label + '</button>';
    });
    h += '</div></div>';

    var curAccent = (typeof ThemeSwitcher !== 'undefined') ? ThemeSwitcher.getAccent() : 'blue';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-eye-dropper"></i> <span data-i18n="settings.accent">' + t('settings.accent', '강조 색상') + '</span></div>';
    h += '<div class="stp-accent-dots">';
    var accents = [
      { id:'black',  color:'#a0a0a0' }, { id:'blue',   color:'#086DDD' },
      { id:'red',    color:'#E93147' }, { id:'orange', color:'#ec7500' },
      { id:'yellow', color:'#e0ac00' }, { id:'cyan',   color:'#00bfbc' },
      { id:'purple', color:'#7852EE' }, { id:'pink',   color:'#D53984' }
    ];
    accents.forEach(function(ac){
      var active = curAccent === ac.id ? ' stp-dot-active' : '';
      h += '<button class="stp-accent-dot' + active + '" style="background:' + ac.color + '"'
         + ' onclick="_stpSetAccent(\'' + ac.id + '\')" title="' + ac.id + '"></button>';
    });
    var customAccHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomAccent) ? ThemeSwitcher.getCustomAccent() : '#086DDD';
    var accPickActive = curAccent === 'custom' ? ' stp-dot-active' : '';
    var accPickBg = curAccent === 'custom' ? customAccHex : 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
    h += '<label class="stp-accent-dot stp-dot-picker' + accPickActive + '" style="background:' + accPickBg + '" title="커스텀">';
    h += '<input type="color" class="stp-pick-input" value="' + customAccHex + '"'
       + ' oninput="_stpPickAccentLive(this.value)" onchange="_stpPickAccent(this.value)">';
    h += '</label>';
    h += '</div></div>';

    var curBase = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getBase) ? ThemeSwitcher.getBase() : 'blue';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-fill-drip"></i> <span data-i18n="settings.base">배경 색상</span></div>';
    h += '<div class="stp-base-dots">';
    var bases = [
      { id:'black',  color:'#a0a0a0' }, { id:'blue',   color:'#086DDD' },
      { id:'red',    color:'#E93147' }, { id:'orange', color:'#ec7500' },
      { id:'yellow', color:'#e0ac00' }, { id:'cyan',   color:'#00bfbc' },
      { id:'purple', color:'#7852EE' }, { id:'pink',   color:'#D53984' }
    ];
    bases.forEach(function(bs){
      var active = curBase === bs.id ? ' stp-dot-active' : '';
      h += '<button class="stp-base-dot' + active + '" style="background:' + bs.color + '"'
         + ' onclick="_stpSetBase(\'' + bs.id + '\')" title="' + bs.id + '"></button>';
    });
    var customBaseHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomBase) ? ThemeSwitcher.getCustomBase() : '#086DDD';
    var basePickActive = curBase === 'custom' ? ' stp-dot-active' : '';
    var basePickBg = curBase === 'custom' ? customBaseHex : 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
    h += '<label class="stp-base-dot stp-dot-picker' + basePickActive + '" style="background:' + basePickBg + '" title="커스텀">';
    h += '<input type="color" class="stp-pick-input" value="' + customBaseHex + '"'
       + ' oninput="_stpPickBaseLive(this.value)" onchange="_stpPickBase(this.value)">';
    h += '</label>';
    h += '</div></div>';

    var curContentColor = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getContentColor) ? ThemeSwitcher.getContentColor() : '';
    var isColorDefault = curAccent === 'blue' && curBase === 'blue' && curTheme === 'dark' && !curContentColor;
    if(!isColorDefault){
      h += '<button class="stp-color-reset" onclick="_stpResetColors()">'
         + '<i class="fa fa-undo"></i> 색상 초기화</button>';
    }

    h += '</div>'; // end 섹션 1

    // ━━━━━━ 섹션 2: 본문 설정 ━━━━━━
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-font"></i> 본문 설정</div>';

    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-pen-fancy"></i> 텍스트 색상</div>';
    h += '<div class="stp-accent-dots">';
    var textColors = [
      { id:'', color:'', label:'기본' },
      { id:'#EDEDED', color:'#EDEDED' }, { id:'#D4D4D4', color:'#D4D4D4' },
      { id:'#BFBFBF', color:'#BFBFBF' }, { id:'#F5E6C8', color:'#F5E6C8' },
      { id:'#C8E6C9', color:'#C8E6C9' }, { id:'#BBDEFB', color:'#BBDEFB' },
      { id:'#F8BBD0', color:'#F8BBD0' }
    ];
    textColors.forEach(function(tc){
      var active = curContentColor === tc.id ? ' stp-dot-active' : '';
      if(tc.id === ''){
        var defActive = !curContentColor ? ' stp-dot-active' : '';
        h += '<button class="stp-txtc-dot stp-txtc-default' + defActive + '"'
           + ' onclick="_stpSetContentColor(\'\')" title="기본">A</button>';
      } else {
        h += '<button class="stp-txtc-dot' + active + '" style="background:' + tc.color + '"'
           + ' onclick="_stpSetContentColor(\'' + tc.id + '\')" title="' + tc.id + '"></button>';
      }
    });
    var txtPickHex = curContentColor || '#EDEDED';
    var txtPickActive = curContentColor && textColors.every(function(tc){ return tc.id !== curContentColor; }) ? ' stp-dot-active' : '';
    var txtPickBg = txtPickActive ? curContentColor : 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
    h += '<label class="stp-txtc-dot stp-dot-picker' + txtPickActive + '" style="background:' + txtPickBg + '" title="커스텀">';
    h += '<input type="color" class="stp-pick-input" value="' + txtPickHex + '"'
       + ' oninput="_stpPickContentColorLive(this.value)" onchange="_stpPickContentColor(this.value)">';
    h += '</label>';
    h += '</div></div>';

    h += _stpSliderRow('fontSize', t('settings.fontSize', '글꼴 크기'), 'fa-text-height',
         v.fontSize, 12, 28, 1, 'px');
    h += _stpSliderRow('letterSp', t('settings.letterSpacing', '자간 간격'), 'fa-text-width',
         v.letterSp, 0, 0.12, 0.01, 'em');
    h += _stpSliderRow('lineH', t('settings.lineHeight', '줄 간격'), 'fa-arrows-alt-v',
         v.lineH, 1.2, 3.0, 0.05, '');
    h += '<div class="stp-reset"><button onclick="_stpResetText()" data-i18n="settings.resetDefaults">'
       + '<i class="fa fa-undo"></i> ' + t('settings.resetDefaults', '기본값 복원') + '</button></div>';
    h += '</div>'; // end 섹션 2

  } else {
    // ━━━━━━ 메인 메뉴 뷰 ━━━━━━

    // 메뉴 카드: 테마
    h += '<div class="stp-menu-item" onclick="_stpGoTheme()">';
    h += '<div class="stp-menu-icon"><i class="fa fa-palette"></i></div>';
    h += '<div class="stp-menu-text">';
    h += '<div class="stp-menu-title">테마</div>';
    h += '<div class="stp-menu-desc">색상, 글꼴, 배경 설정</div>';
    h += '</div>';
    h += '<i class="fa fa-chevron-right stp-menu-arrow"></i>';
    h += '</div>';


    // ━━━━━━ 섹션 3: 일반 ━━━━━━
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-cog"></i> 일반</div>';
    var curLang = (typeof I18N !== 'undefined') ? I18N.getLang() : 'ko';
    h += '<div class="stp-row stp-row-toggle">';
    h += '<span class="stp-label"><i class="fa fa-globe"></i> <span data-i18n="settings.language">' + t('settings.language', '언어') + '</span></span>';
    h += '<select class="stp-lang-sel" onchange="_stpSetLang(this.value)">';
    h += '<option value="ko"' + (curLang==='ko'?' selected':'') + '>한국어</option>';
    h += '<option value="en"' + (curLang==='en'?' selected':'') + '>English</option>';
    h += '</select>';
    h += '</div>';
    h += '</div>'; // end 섹션 3

    // ━━━━━━ 섹션 4: 클라우드 동기화 ━━━━━━
    h += _stpSyncSection();

    // 로그아웃 버튼 (로그인 상태일 때만 표시)
    h += '<div class="stp-logout" id="stpLogoutWrap" style="display:none">';
    h += '<button class="stp-logout-btn" onclick="signOutUser()">';
    h += '<i class="fa fa-sign-out-alt"></i> <span data-i18n="settings.logout">' + t('settings.logout', '로그아웃') + '</span></button></div>';
  }

  h += '</div>';
  el.innerHTML = h;
  var ub=document.getElementById('userBar');
  var lw=document.getElementById('stpLogoutWrap');
  if(lw&&ub&&ub.style.display!=='none') lw.style.display='';
}
