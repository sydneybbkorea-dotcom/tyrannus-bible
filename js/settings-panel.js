// settings-panel.js — 설정 패널 렌더링 (메뉴 + 서브페이지)
var _stpView = 'main';
var _stpAdvOpen = false;
function _stpGoTheme(){ _stpView='theme'; renderSettingsPanel(); }
function _stpGoTopics(){ _stpView='topics'; renderSettingsPanel(); }
function _stpGoSharing(){ _stpView='sharing'; renderSettingsPanel(); }
function _stpGoMain(){ _stpView='main'; renderSettingsPanel(); }
function _stpToggleAdvanced(){
  var body = document.getElementById('stpAdvBody');
  var arrow = document.querySelector('.stp-adv-arrow');
  if(!body) return;
  _stpAdvOpen = !_stpAdvOpen;
  body.classList.toggle('stp-adv-open', _stpAdvOpen);
  if(arrow) arrow.classList.toggle('open', _stpAdvOpen);
}

function renderSettingsPanel(){
  var el = document.getElementById('spSettingsBody');
  if(!el) return;
  var v = _getSettingsValues();
  var h = '<div class="stp-wrap">';

  if(_stpView === 'sharing'){
    // ━━━━━━ 공유 관리 서브페이지 ━━━━━━
    h += '<div class="stp-subpage-header" onclick="_stpGoMain()">';
    h += '<i class="fa fa-arrow-left"></i>';
    h += '<span>공유 관리</span>';
    h += '</div>';
    h += '<div class="stp-section">';
    h += '<div class="share-section-title"><i class="fa fa-upload"></i> 내가 공유 중</div>';
    h += typeof _shareRenderMyShares === 'function' ? _shareRenderMyShares() : '<div class="share-empty">로딩 중...</div>';
    h += '<hr class="share-divider">';
    h += '<div class="share-section-title"><i class="fa fa-download"></i> 나에게 공유된</div>';
    h += typeof _shareRenderSharedWithMe === 'function' ? _shareRenderSharedWithMe() : '<div class="share-empty">로딩 중...</div>';
    h += '</div>';

  } else if(_stpView === 'topics'){
    // ━━━━━━ 주제별 하이라이트 서브페이지 ━━━━━━
    h += '<div class="stp-subpage-header" onclick="_stpGoMain()">';
    h += '<i class="fa fa-arrow-left"></i>';
    h += '<span>주제별 하이라이트</span>';
    h += '</div>';
    h += '<div class="stp-section">';
    h += typeof _htRenderManager === 'function' ? _htRenderManager() : '';
    h += '</div>';

  } else if(_stpView === 'theme'){
    // ━━━━━━ 테마 서브페이지 ━━━━━━
    h += '<div class="stp-subpage-header" onclick="_stpGoMain()">';
    h += '<i class="fa fa-arrow-left"></i>';
    h += '<span>테마 설정</span>';
    h += '</div>';

    // ━━━━━━ 섹션 1: 테마 & 색상 ━━━━━━
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-swatchbook"></i> 테마</div>';

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
    h += '</div>'; // end 테마 섹션

    // ── 색상 고급설정 토글 ──
    h += '<div class="stp-adv-toggle" onclick="_stpToggleAdvanced()">';
    h += '<i class="fa fa-chevron-right stp-adv-arrow' + (_stpAdvOpen ? ' open' : '') + '"></i>';
    h += '<span>색상 고급설정</span>';
    h += '</div>';
    h += '<div class="stp-adv-body' + (_stpAdvOpen ? ' stp-adv-open' : '') + '" id="stpAdvBody">';

    h += '<div class="stp-section">';

    // ── 공통 프리셋 컬러 배열 ──
    var accents = [
      { id:'black',  color:'#a0a0a0' }, { id:'blue',   color:'#086DDD' },
      { id:'red',    color:'#E93147' }, { id:'orange', color:'#ec7500' },
      { id:'yellow', color:'#e0ac00' }, { id:'cyan',   color:'#00bfbc' },
      { id:'purple', color:'#7852EE' }, { id:'pink',   color:'#D53984' }
    ];

    // ── 헬퍼: 프리셋 dot + 커스텀 버튼 생성 ──
    function _colorRow(opts){
      var r = '<div class="' + (opts.dotClass || 'stp-accent-dots') + '">';
      // "기본" 버튼 (선택적)
      if(opts.hasDefault){
        var da = opts.current === '' || !opts.current ? ' stp-dot-active' : '';
        r += '<button class="stp-txtc-dot stp-txtc-default' + da + '"'
           + ' onclick="' + opts.defaultFn + '" title="기본">A</button>';
      }
      // 프리셋 dot
      (opts.presets || accents).forEach(function(p){
        var a = opts.current === p.id ? ' stp-dot-active' : '';
        var cls = opts.isDot === 'square' ? 'stp-base-dot' : 'stp-accent-dot';
        r += '<button class="' + cls + a + '" style="background:' + p.color + '"'
           + ' onclick="' + opts.setFn + '(\'' + p.id + '\')" title="' + p.id + '"></button>';
      });
      // 커스텀 버튼
      var isCustom = opts.current === 'custom';
      var cHex = opts.customHex || '#086DDD';
      var cColor = isCustom ? ';color:' + cHex : '';
      r += '<label class="stp-custom-btn' + (isCustom ? ' stp-custom-active' : '') + '" style="' + cColor + '">';
      r += '<i class="fa fa-eyedropper"></i>';
      r += '<input type="color" class="stp-pick-input" value="' + cHex + '"'
         + ' oninput="' + opts.liveFn + '(this.value)" onchange="' + opts.changeFn + '(this.value)">';
      r += '</label>';
      r += '</div>';
      return r;
    }

    // ━━ 강조 색상 ━━
    var curAccent = (typeof ThemeSwitcher !== 'undefined') ? ThemeSwitcher.getAccent() : 'blue';
    var customAccHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomAccent) ? ThemeSwitcher.getCustomAccent() : '#086DDD';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-eye-dropper"></i> <span data-i18n="settings.accent">' + t('settings.accent', '강조 색상') + '</span></div>';
    h += _colorRow({ current:curAccent, customHex:customAccHex, setFn:'_stpSetAccent', liveFn:'_stpPickAccentLive', changeFn:'_stpPickAccent' });
    h += '</div>';

    // ━━ 레일 강조 색상 ━━
    var curRailAccent = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getRailAccent) ? ThemeSwitcher.getRailAccent() : '';
    var customRailHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomRailAccent) ? ThemeSwitcher.getCustomRailAccent() : '#086DDD';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-bars"></i> 레일 강조 색상</div>';
    h += _colorRow({ current:curRailAccent, customHex:customRailHex||'#086DDD', hasDefault:true, defaultFn:"_stpSetRailAccent('')", setFn:'_stpSetRailAccent', liveFn:'_stpPickRailAccentLive', changeFn:'_stpPickRailAccent' });
    h += '</div>';

    // ━━ 성경 글씨 색상 ━━
    var curBookAccent = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getBookAccent) ? ThemeSwitcher.getBookAccent() : 'custom';
    var customBookHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomBookAccent) ? ThemeSwitcher.getCustomBookAccent() : '#bd8a00';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-book-bible"></i> 성경 글씨 색상</div>';
    h += _colorRow({ current:curBookAccent, customHex:customBookHex, setFn:'_stpSetBookAccent', liveFn:'_stpPickBookAccentLive', changeFn:'_stpPickBookAccent' });
    h += '</div>';

    // ━━ 배경 색상 ━━
    var curBase = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getBase) ? ThemeSwitcher.getBase() : 'blue';
    var customBaseHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomBase) ? ThemeSwitcher.getCustomBase() : '#086DDD';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-fill-drip"></i> <span data-i18n="settings.base">배경 색상</span></div>';
    h += _colorRow({ current:curBase, customHex:customBaseHex, isDot:'square', dotClass:'stp-base-dots', setFn:'_stpSetBase', liveFn:'_stpPickBaseLive', changeFn:'_stpPickBase' });
    h += '</div>';

    // ━━ 레이아웃 (패널) 색상 ━━
    var curLayout = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getLayoutColor) ? ThemeSwitcher.getLayoutColor() : '';
    var customLayoutHex = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getCustomLayoutColor) ? ThemeSwitcher.getCustomLayoutColor() : '#1a1a2e';
    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-columns"></i> 레이아웃 색상</div>';
    h += _colorRow({ current:curLayout, customHex:customLayoutHex||'#1a1a2e', hasDefault:true, defaultFn:"_stpSetLayoutColor('')", isDot:'square', dotClass:'stp-base-dots', setFn:'_stpSetLayoutColor', liveFn:'_stpPickLayoutColorLive', changeFn:'_stpPickLayoutColor' });
    h += '</div>';

    var curContentColor = (typeof ThemeSwitcher !== 'undefined' && ThemeSwitcher.getContentColor) ? ThemeSwitcher.getContentColor() : '';
    var isBookDefault = !curBookAccent || curBookAccent === 'custom';
    var isRailDefault = !curRailAccent;
    var isLayoutDefault = !curLayout;
    var isColorDefault = curAccent === 'blue' && curBase === 'blue' && curTheme === 'dark' && !curContentColor && isBookDefault && isRailDefault && isLayoutDefault;
    if(!isColorDefault){
      h += '<button class="stp-color-reset" onclick="_stpResetColors()">'
         + '<i class="fa fa-undo"></i> 색상 초기화</button>';
    }

    h += '</div>'; // end 색상 섹션

    // ━━━━━━ 섹션 1.5: 배경 이미지 ━━━━━━
    var bgEnabled = localStorage.getItem('kjb2-bg-image-enabled') === '1';
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-image"></i> 배경 이미지</div>';

    // 이미지 선택 + 제거 버튼
    h += '<div class="stp-row">';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<button class="stp-theme-btn" onclick="_stpPickBgImage()" style="flex:1">'
       + '<i class="fa fa-image"></i> 이미지 선택</button>';
    if(bgEnabled){
      h += '<button class="stp-theme-btn" onclick="_stpRemoveBgImage()" style="flex:0 0 auto;color:#ef4444">'
         + '<i class="fa fa-times"></i> 제거</button>';
    }
    h += '</div>';
    h += '</div>';

    // 미리보기 썸네일
    h += '<div id="stpBgPreview" class="stp-bg-preview"' + (bgEnabled ? '' : ' style="display:none"') + '></div>';

    // 적용 버튼 (이미지 선택 후 표시)
    h += '<button id="stpBgApplyBtn" class="stp-bg-apply" style="display:none" onclick="_stpApplyBgImageBtn()">'
       + '<i class="fa fa-check"></i> 적용</button>';

    h += '</div>'; // end 배경 이미지 섹션

    // 미리보기 썸네일 로드 (비동기)
    setTimeout(function(){ _stpLoadBgPreview(); }, 50);

    // ━━━━━━ 섹션 2: 본문 설정 ━━━━━━
    h += '<div class="stp-section">';
    h += '<div class="stp-sec-title"><i class="fa fa-font"></i> 본문 설정</div>';

    h += '<div class="stp-row">';
    h += '<div class="stp-row-head"><i class="fa fa-pen-fancy"></i> 텍스트 색상</div>';
    h += '<div class="stp-accent-dots">';
    var textColors = [
      { id:'#EDEDED', color:'#EDEDED' }, { id:'#D4D4D4', color:'#D4D4D4' },
      { id:'#BFBFBF', color:'#BFBFBF' }, { id:'#F5E6C8', color:'#F5E6C8' },
      { id:'#C8E6C9', color:'#C8E6C9' }, { id:'#BBDEFB', color:'#BBDEFB' },
      { id:'#F8BBD0', color:'#F8BBD0' }
    ];
    // "기본" 버튼
    var defActive = !curContentColor ? ' stp-dot-active' : '';
    h += '<button class="stp-txtc-dot stp-txtc-default' + defActive + '"'
       + ' onclick="_stpSetContentColor(\'\')" title="기본">A</button>';
    // 프리셋 dot
    textColors.forEach(function(tc){
      var active = curContentColor === tc.id ? ' stp-dot-active' : '';
      h += '<button class="stp-txtc-dot' + active + '" style="background:' + tc.color + '"'
         + ' onclick="_stpSetContentColor(\'' + tc.id + '\')" title="' + tc.id + '"></button>';
    });
    // 커스텀 버튼
    var txtPickHex = curContentColor || '#EDEDED';
    var txtIsCustom = curContentColor && textColors.every(function(tc){ return tc.id !== curContentColor; });
    var txtCColor = txtIsCustom ? ';color:' + curContentColor : '';
    h += '<label class="stp-custom-btn' + (txtIsCustom ? ' stp-custom-active' : '') + '" style="' + txtCColor + '">';
    h += '<i class="fa fa-eyedropper"></i>';
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
    h += '</div>'; // end 섹션 2 (본문 설정)
    h += '</div>'; // end stp-adv-body

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

    // 메뉴 카드: 주제별 하이라이트
    h += '<div class="stp-menu-item" onclick="_stpGoTopics()">';
    h += '<div class="stp-menu-icon"><i class="fa fa-highlighter"></i></div>';
    h += '<div class="stp-menu-text">';
    h += '<div class="stp-menu-title">주제별 하이라이트</div>';
    h += '<div class="stp-menu-desc">주제 생성, 표시/숨김 관리</div>';
    h += '</div>';
    h += '<i class="fa fa-chevron-right stp-menu-arrow"></i>';
    h += '</div>';

    // 메뉴 카드: 공유 관리 (로그인 시만)
    if(window._firebaseUid){
      h += '<div class="stp-menu-item" onclick="_stpGoSharing()">';
      h += '<div class="stp-menu-icon"><i class="fa fa-share-alt"></i></div>';
      h += '<div class="stp-menu-text">';
      h += '<div class="stp-menu-title">공유 관리</div>';
      h += '<div class="stp-menu-desc">폴더·하이라이트 공유, 수신 관리</div>';
      h += '</div>';
      h += '<i class="fa fa-chevron-right stp-menu-arrow"></i>';
      h += '</div>';
    }


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

    // 버전 표시
    var ver = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '';
    if(ver){
      h += '<div class="stp-version">투란누스 v' + ver + '</div>';
    }
  }

  h += '</div>';
  // 스크롤 위치 보존
  var scrollParent = el.closest('.sp-body') || el.parentElement;
  var scrollTop = scrollParent ? scrollParent.scrollTop : 0;
  el.innerHTML = h;
  if(scrollParent) scrollParent.scrollTop = scrollTop;
  var ub=document.getElementById('userBar');
  var lw=document.getElementById('stpLogoutWrap');
  if(lw&&ub&&ub.style.display!=='none') lw.style.display='';
}
