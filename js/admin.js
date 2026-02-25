// admin.js — 관리자 패널 (테마 기본값 편집, 찬양 가사 편집)
// 조건: window._isAdmin === true 일 때만 초기화

(function(){
  'use strict';

  var _adminInited = false;
  var _activeTab = 'theme'; // 'theme' | 'lyrics'

  /* ── 초기화 (firebase.js에서 호출) ── */
  window._initAdminPanel = function(){
    if(_adminInited) return;
    _adminInited = true;
    _injectAdminBtn();
    _buildModal();
    console.log('[Admin] 관리자 패널 초기화 완료');
  };

  /* ── 레일에 관리자 버튼 삽입 ── */
  function _injectAdminBtn(){
    var railBottom = document.querySelector('#iconRail .rail-bottom');
    if(!railBottom) return;
    // 설정 버튼 앞에 삽입
    var settingsBtn = railBottom.querySelector('[data-rail="settings"]');
    var btn = document.createElement('button');
    btn.className = 'rail-icon rail-admin-btn';
    btn.setAttribute('data-rail','admin');
    btn.title = '관리자';
    btn.onclick = _toggleAdmin;
    btn.innerHTML = '<i class="fa fa-shield-halved"></i><span class="rail-label">관리자</span>';
    if(settingsBtn) railBottom.insertBefore(btn, settingsBtn);
    else railBottom.appendChild(btn);
  }

  /* ── 모달 DOM 생성 ── */
  function _buildModal(){
    var el = document.createElement('div');
    el.id = 'adminBackdrop';
    el.className = 'admin-backdrop';
    el.onclick = function(e){ if(e.target === el) _closeAdmin(); };
    el.innerHTML = [
      '<div class="admin-modal">',
        '<div class="admin-header">',
          '<i class="fa fa-shield-halved"></i>',
          '<span class="admin-header-title">관리자 패널</span>',
          '<button class="admin-close" onclick="_closeAdminPanel()"><i class="fa fa-times"></i></button>',
        '</div>',
        '<div class="admin-tabs">',
          '<button class="admin-tab active" data-tab="theme" onclick="_adminSwitchTab(\'theme\')"><i class="fa fa-palette"></i> 테마 기본값</button>',
          '<button class="admin-tab" data-tab="lyrics" onclick="_adminSwitchTab(\'lyrics\')"><i class="fa fa-music"></i> 찬양 가사</button>',
        '</div>',
        '<div class="admin-body">',
          // 테마 섹션
          '<div class="admin-section active" id="adminSecTheme">',
            '<div class="admin-section-title"><i class="fa fa-palette"></i> 테마별 기본 색상</div>',
            '<div class="admin-field">',
              '<label class="admin-label">적용 테마</label>',
              '<select class="admin-select" id="adminThemeSel" onchange="_adminLoadThemeDefaults()">',
                '<option value="dark">다크</option>',
                '<option value="light">라이트</option>',
                '<option value="sepia">세피아</option>',
              '</select>',
            '</div>',
            '<div class="admin-color-grid" id="adminColorGrid"></div>',
            '<div id="adminThemeMsg" class="admin-msg"></div>',
            '<div class="admin-btn-row">',
              '<button class="admin-btn admin-btn-primary" onclick="_adminSaveThemeDefaults()"><i class="fa fa-save"></i> 저장</button>',
              '<button class="admin-btn" onclick="_adminLoadThemeDefaults()"><i class="fa fa-undo"></i> 초기화</button>',
            '</div>',
          '</div>',
          // 가사 섹션
          '<div class="admin-section" id="adminSecLyrics">',
            '<div class="admin-section-title"><i class="fa fa-music"></i> 찬양 가사 편집</div>',
            '<div class="admin-field">',
              '<label class="admin-label">찬양 번호</label>',
              '<div style="display:flex;gap:6px">',
                '<input class="admin-input" id="adminLyricsNum" type="number" min="1" max="600" placeholder="번호 입력..." style="width:100px">',
                '<button class="admin-btn" onclick="_adminLoadLyrics()"><i class="fa fa-search"></i> 불러오기</button>',
              '</div>',
            '</div>',
            '<div class="admin-field">',
              '<label class="admin-label">가사 내용 (줄바꿈 구분)</label>',
              '<textarea class="admin-textarea" id="adminLyricsText" placeholder="가사를 입력하세요..."></textarea>',
            '</div>',
            '<div id="adminLyricsMsg" class="admin-msg"></div>',
            '<div class="admin-btn-row">',
              '<button class="admin-btn admin-btn-primary" onclick="_adminSaveLyrics()"><i class="fa fa-save"></i> 저장</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
    _adminLoadThemeDefaults();
  }

  /* ── 열기/닫기 ── */
  function _toggleAdmin(){
    var el = document.getElementById('adminBackdrop');
    if(!el) return;
    el.classList.toggle('open');
  }
  window._closeAdminPanel = function(){
    var el = document.getElementById('adminBackdrop');
    if(el) el.classList.remove('open');
  };
  function _closeAdmin(){
    var el = document.getElementById('adminBackdrop');
    if(el) el.classList.remove('open');
  }

  /* ── 탭 전환 ── */
  window._adminSwitchTab = function(tab){
    _activeTab = tab;
    var tabs = document.querySelectorAll('.admin-tab');
    for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle('active', tabs[i].dataset.tab===tab);
    var secs = document.querySelectorAll('.admin-section');
    for(var j=0;j<secs.length;j++) secs[j].classList.remove('active');
    if(tab==='theme') document.getElementById('adminSecTheme')?.classList.add('active');
    if(tab==='lyrics') document.getElementById('adminSecLyrics')?.classList.add('active');
  };

  /* ══════════════════════════════════════
     테마 기본값 (Firestore: config/theme-defaults)
  ══════════════════════════════════════ */
  var THEME_COLOR_FIELDS = [
    { key:'accentColor', label:'강조색', default:'#bd8a00' },
    { key:'baseColor',   label:'배경색', default:'#04050b' },
    { key:'contentColor',label:'본문색', default:'' },
  ];

  window._adminLoadThemeDefaults = async function(){
    var grid = document.getElementById('adminColorGrid');
    if(!grid) return;
    var theme = document.getElementById('adminThemeSel')?.value || 'dark';
    var db = window._firebaseDB;
    var fn = window._fbFn;
    if(!db || !fn) return;
    var data = {};
    try {
      var snap = await fn.getDoc(fn.doc(db, 'config', 'theme-defaults'));
      if(snap.exists()) data = snap.data()[theme] || {};
    } catch(e){ console.warn('[Admin] 테마 기본값 로드 실패:', e); }
    var h = '';
    THEME_COLOR_FIELDS.forEach(function(f){
      var val = data[f.key] || f.default;
      h += '<div class="admin-color-item">';
      h += '<label>'+f.label+'</label>';
      h += '<input type="color" data-key="'+f.key+'" value="'+(val||'#000000')+'">';
      h += '</div>';
    });
    grid.innerHTML = h;
    _showMsg('adminThemeMsg','');
  };

  window._adminSaveThemeDefaults = async function(){
    var db = window._firebaseDB;
    var fn = window._fbFn;
    if(!db || !fn) return;
    var theme = document.getElementById('adminThemeSel')?.value || 'dark';
    var grid = document.getElementById('adminColorGrid');
    if(!grid) return;
    var inputs = grid.querySelectorAll('input[type="color"]');
    var vals = {};
    for(var i=0;i<inputs.length;i++){
      vals[inputs[i].dataset.key] = inputs[i].value;
    }
    try {
      var ref = fn.doc(db, 'config', 'theme-defaults');
      var update = {};
      update[theme] = vals;
      await fn.setDoc(ref, update, { merge:true });
      _showMsg('adminThemeMsg','저장 완료!','success');
    } catch(e){
      _showMsg('adminThemeMsg','저장 실패: '+e.message,'error');
    }
  };

  /* ══════════════════════════════════════
     찬양 가사 편집 (Firestore: hymn-lyrics/{id})
  ══════════════════════════════════════ */
  window._adminLoadLyrics = async function(){
    var num = parseInt(document.getElementById('adminLyricsNum')?.value);
    if(!num || num<1) return _showMsg('adminLyricsMsg','유효한 번호를 입력하세요','error');
    var db = window._firebaseDB;
    var fn = window._fbFn;
    if(!db || !fn) return;
    try {
      var snap = await fn.getDoc(fn.doc(db, 'hymn-lyrics', String(num)));
      var text = snap.exists() ? (snap.data().text || '') : '';
      document.getElementById('adminLyricsText').value = text;
      _showMsg('adminLyricsMsg', snap.exists() ? '가사 불러옴 (#'+num+')' : '저장된 가사 없음 (새로 입력)', snap.exists()?'success':'');
    } catch(e){
      _showMsg('adminLyricsMsg','불러오기 실패: '+e.message,'error');
    }
  };

  window._adminSaveLyrics = async function(){
    var num = parseInt(document.getElementById('adminLyricsNum')?.value);
    if(!num || num<1) return _showMsg('adminLyricsMsg','유효한 번호를 입력하세요','error');
    var text = document.getElementById('adminLyricsText')?.value || '';
    var db = window._firebaseDB;
    var fn = window._fbFn;
    if(!db || !fn) return;
    try {
      await fn.setDoc(fn.doc(db, 'hymn-lyrics', String(num)), {
        text: text,
        updatedAt: Date.now(),
        updatedBy: window._firebaseUid || 'unknown'
      });
      _showMsg('adminLyricsMsg','가사 저장 완료! (#'+num+')','success');
    } catch(e){
      _showMsg('adminLyricsMsg','저장 실패: '+e.message,'error');
    }
  };

  /* ── 유틸 ── */
  function _showMsg(id, msg, type){
    var el = document.getElementById(id);
    if(!el) return;
    el.textContent = msg;
    el.className = 'admin-msg' + (type ? ' '+type : '');
    if(type==='success'){
      setTimeout(function(){ if(el.textContent===msg){ el.className='admin-msg'; } }, 3000);
    }
  }

})();
