// layout-manager.js — CSS Grid 기반 화면 분할 시스템
// 8종 프리셋 + 슬롯별 10가지 기능 선택 + 위/아래 스왑
var APP_VERSION = '1.0.9';

var LayoutManager = (function(){
  'use strict';

  var STORAGE_KEY = 'kjb2-layout-state';

  // ═══ 프리셋 정의 ═══
  var PRESETS = {
    '1L-2R': { label:'1L-2R', areas:['a','b','c'], slots:3 },
    '2T-1B': { label:'2T-1B', areas:['a','b','c'], slots:3 },
    '2x2':   { label:'2×2',   areas:['a','b','c','d'], slots:4 },
    '2L-1R': { label:'2L-1R', areas:['a','b','c'], slots:3 },
    '1T-2B': { label:'1T-2B', areas:['a','b','c'], slots:3 },
    '3-col': { label:'3열',   areas:['a','b','c'], slots:3 },
    '3T-1B': { label:'3T-1B', areas:['a','b','c','d'], slots:4 },
    '1T-3B': { label:'1T-3B', areas:['a','b','c','d'], slots:4 }
  };

  // 프리셋 순서 (피커 표시용)
  var PRESET_ORDER = ['1L-2R','2T-1B','2x2','2L-1R','1T-2B','3-col','3T-1B','1T-3B'];

  // 썸네일 슬롯 수
  var THUMB_SLOTS = {
    '1L-2R':3, '2T-1B':3, '2x2':4, '2L-1R':3,
    '1T-2B':3, '3-col':3, '3T-1B':4, '1T-3B':4
  };

  // 행 매핑 (스왑용)
  var ROW_MAP = {
    '1L-2R': { top:['b'], bottom:['c'] },
    '2T-1B': { top:['a','b'], bottom:['c'] },
    '2x2':   { top:['a','b'], bottom:['c','d'] },
    '2L-1R': { top:['a'], bottom:['b'] },
    '1T-2B': { top:['a'], bottom:['b','c'] },
    '3-col': null,
    '3T-1B': { top:['a','b','c'], bottom:['d'] },
    '1T-3B': { top:['a'], bottom:['b','c','d'] }
  };

  // ═══ 기능 정의 ═══
  var FEATURES = {
    bible:   { label:'성경',     icon:'fa-book-bible',       type:'singleton', domId:'biblePane' },
    pdf:     { label:'PDF',      icon:'fa-file-pdf',         type:'singleton', domId:null },
    notes:   { label:'노트',     icon:'fa-pen',              type:'singleton', domId:'rightPanel' },
    dict:    { label:'사전',     icon:'fa-spell-check',      type:'render' },
    search:  { label:'검색',     icon:'fa-search',           type:'render' },
    library: { label:'도서관',   icon:'fa-book-open-reader',  type:'placeholder' },
    qna:     { label:'Q&A',     icon:'fa-comments',          type:'placeholder' },
    graph:   { label:'그래프',   icon:'fa-project-diagram',   type:'render' },
    reading: { label:'읽기',     icon:'fa-calendar-check',    type:'render' },
    hymns:   { label:'찬양',     icon:'fa-music',             type:'render' }
  };

  var FEATURE_ORDER = ['bible','pdf','notes','dict','search','library','qna','graph','reading','hymns'];
  var SINGLETONS = ['bible','pdf','notes'];

  // ═══ 상태 ═══
  var _state = {
    layout: '3-col',
    slots: { a:'bible', b:'pdf', c:'notes', d:null },
    active: false
  };
  var _slotElements = {};
  var _pickerEl = null;
  var _backdropEl = null;
  var _originalParents = {}; // 싱글톤 DOM 원래 부모 저장

  // ═══ 초기화 ═══
  function init(){
    _restoreState();
    if(_state.active){
      _activate();
    }
  }

  // ═══ 활성화 ═══
  function _activate(){
    _state.active = true;
    var container = document.getElementById('paneContainer');
    if(!container) return;

    // 기존 슬롯 정리
    _clearSlots();

    // data-layout 속성 설정
    container.setAttribute('data-layout', _state.layout);

    // 프리셋 슬롯 생성
    var preset = PRESETS[_state.layout];
    if(!preset) return;

    preset.areas.forEach(function(area){
      var slot = _buildSlot(area);
      container.appendChild(slot);
      _slotElements[area] = slot;
    });

    // 기능 마운트
    preset.areas.forEach(function(area){
      var feat = _state.slots[area];
      if(feat) _mountFeature(area, feat);
    });

    _saveState();
  }

  // ═══ 비활성화 ═══
  function deactivate(){
    _state.active = false;
    var container = document.getElementById('paneContainer');
    if(!container) return;

    // 모든 기능 언마운트 (싱글톤 복귀)
    var preset = PRESETS[_state.layout];
    if(preset){
      preset.areas.forEach(function(area){
        _unmountFeature(area);
      });
    }

    // 슬롯 제거
    _clearSlots();

    // data-layout 제거
    container.removeAttribute('data-layout');

    // PaneManager 상태 복원
    if(typeof PaneManager !== 'undefined'){
      PaneManager._applyState && PaneManager._applyState();
    }

    _saveState();
  }

  // ═══ 슬롯 정리 ═══
  function _clearSlots(){
    Object.keys(_slotElements).forEach(function(area){
      var el = _slotElements[area];
      if(el && el.parentNode) el.parentNode.removeChild(el);
    });
    _slotElements = {};
  }

  // ═══ 슬롯 DOM 생성 ═══
  function _buildSlot(area){
    var div = document.createElement('div');
    div.className = 'layout-slot';
    div.dataset.area = area;
    var feat = _state.slots[area] || '';
    if(feat) div.dataset.feature = feat;

    // 헤더
    var header = document.createElement('div');
    header.className = 'ls-header';

    // 기능 아이콘 바
    var featBar = document.createElement('div');
    featBar.className = 'ls-feat-bar';

    FEATURE_ORDER.forEach(function(fid){
      var f = FEATURES[fid];
      var btn = document.createElement('button');
      btn.className = 'ls-feat-btn' + (fid === feat ? ' active' : '');
      btn.dataset.feat = fid;
      btn.title = f.label;
      btn.innerHTML = '<i class="fa ' + f.icon + '"></i>';
      btn.addEventListener('click', function(){
        setFeature(area, fid);
      });
      featBar.appendChild(btn);
    });

    header.appendChild(featBar);

    // 스왑 버튼 (단일 행 프리셋이면 숨김)
    var rowMap = ROW_MAP[_state.layout];
    if(rowMap){
      var swapBtn = document.createElement('button');
      swapBtn.className = 'ls-swap-btn';
      swapBtn.title = '위/아래 교환';
      swapBtn.innerHTML = '<i class="fa fa-exchange-alt fa-rotate-90"></i>';
      swapBtn.addEventListener('click', function(){ swapRows(); });
      header.appendChild(swapBtn);
    }

    div.appendChild(header);

    // 본문
    var body = document.createElement('div');
    body.className = 'ls-body';
    div.appendChild(body);

    return div;
  }

  // ═══ 프리셋 변경 ═══
  function setLayout(id){
    if(!PRESETS[id]) return;

    var oldPreset = PRESETS[_state.layout];
    var newPreset = PRESETS[id];

    // 기존 슬롯 기능 수집
    var oldFeats = {};
    if(oldPreset){
      oldPreset.areas.forEach(function(area){
        oldFeats[area] = _state.slots[area];
      });
    }

    // 기존 언마운트
    if(oldPreset){
      oldPreset.areas.forEach(function(area){
        _unmountFeature(area);
      });
    }

    _state.layout = id;

    // 새 프리셋 슬롯에 기능 매핑 (영역 순서대로)
    var featsArr = [];
    ['a','b','c','d'].forEach(function(a){
      if(oldFeats[a]) featsArr.push(oldFeats[a]);
    });

    newPreset.areas.forEach(function(area, i){
      _state.slots[area] = featsArr[i] || null;
    });

    // 사용 안 하는 슬롯 정리
    ['a','b','c','d'].forEach(function(a){
      if(newPreset.areas.indexOf(a) === -1) _state.slots[a] = null;
    });

    _activate();
    _updatePicker();
  }

  // ═══ 슬롯 기능 변경 ═══
  function setFeature(area, feat){
    if(!FEATURES[feat]) return;
    var currentFeat = _state.slots[area];
    if(currentFeat === feat) return; // 이미 같은 기능

    // 싱글톤 충돌 확인 → 스왑
    if(SINGLETONS.indexOf(feat) !== -1){
      var conflictArea = _findSlotByFeature(feat);
      if(conflictArea && conflictArea !== area){
        // 스왑: 충돌 슬롯에 현재 기능 할당
        _unmountFeature(conflictArea);
        _unmountFeature(area);
        _state.slots[conflictArea] = currentFeat;
        _state.slots[area] = feat;
        _mountFeature(area, feat);
        if(currentFeat) _mountFeature(conflictArea, currentFeat);
        _updateSlotUI(area);
        _updateSlotUI(conflictArea);
        _saveState();
        return;
      }
    }

    // 일반 변경
    _unmountFeature(area);
    _state.slots[area] = feat;
    _mountFeature(area, feat);
    _updateSlotUI(area);
    _saveState();
  }

  // ═══ 기능 마운트 ═══
  function _mountFeature(area, feat){
    var slot = _slotElements[area];
    if(!slot) return;
    var body = slot.querySelector('.ls-body');
    if(!body) return;
    body.innerHTML = '';

    var f = FEATURES[feat];
    if(!f) return;

    slot.dataset.feature = feat;

    if(f.type === 'singleton'){
      _mountSingleton(body, feat);
    } else if(f.type === 'render'){
      _mountRender(body, feat);
    } else if(f.type === 'placeholder'){
      _mountPlaceholder(body, feat);
    }
  }

  // ── 싱글톤 DOM 이동 ──
  function _mountSingleton(body, feat){
    var el = null;
    if(feat === 'bible'){
      el = document.getElementById('biblePane');
    } else if(feat === 'pdf'){
      el = document.querySelector('#pane-pdf > .pane-inner');
    } else if(feat === 'notes'){
      el = document.getElementById('rightPanel');
    }
    if(!el) return;

    // 원래 부모 저장
    if(!_originalParents[feat]){
      _originalParents[feat] = el.parentNode;
    }
    body.appendChild(el);
  }

  // ── 싱글톤 DOM 원래 위치로 복귀 ──
  function _parkSingleton(feat){
    var el = null;
    if(feat === 'bible') el = document.getElementById('biblePane');
    else if(feat === 'pdf') el = document.querySelector('#pane-pdf > .pane-inner') || document.querySelector('.pane-inner[id]');
    else if(feat === 'notes') el = document.getElementById('rightPanel');

    if(!el) return;

    var parent = _originalParents[feat];
    if(parent && el.parentNode !== parent){
      parent.appendChild(el);
    } else {
      // 폴백: 원래 pane에 복귀
      var paneId = feat === 'bible' ? 'pane-bible' : (feat === 'pdf' ? 'pane-pdf' : 'pane-notes');
      var pane = document.getElementById(paneId);
      if(pane && el.parentNode !== pane) pane.appendChild(el);
    }
  }

  // ── 렌더링 기능 마운트 ──
  function _mountRender(body, feat){
    var container = document.createElement('div');
    container.className = 'ls-render-' + feat;
    container.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0;';

    if(feat === 'dict') _renderDict(container);
    else if(feat === 'search') _renderSearch(container);
    else if(feat === 'graph') _renderGraph(container);
    else if(feat === 'reading') _renderReading(container);
    else if(feat === 'hymns') _renderHymns(container);

    body.appendChild(container);
  }

  // ── 플레이스홀더 마운트 ──
  function _mountPlaceholder(body, feat){
    var f = FEATURES[feat];
    var div = document.createElement('div');
    div.className = 'ls-placeholder';
    div.innerHTML = '<i class="fa ' + f.icon + '"></i><span>준비 중입니다</span>';
    body.appendChild(div);
  }

  // ═══ 기능 언마운트 ═══
  function _unmountFeature(area){
    var feat = _state.slots[area];
    if(!feat) return;

    var f = FEATURES[feat];
    if(!f) return;

    if(f.type === 'singleton'){
      _parkSingleton(feat);
    }
    // render/placeholder는 innerHTML=''로 정리 (다음 마운트에서)

    var slot = _slotElements[area];
    if(slot){
      var body = slot.querySelector('.ls-body');
      if(body && f.type !== 'singleton') body.innerHTML = '';
    }
  }

  // ═══ 렌더 함수들 ═══

  function _renderDict(container){
    var html = '<div style="display:flex;flex-direction:column;flex:1;overflow:hidden;">';
    html += '<div style="display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid var(--border);flex-shrink:0;">';
    var tabs = [
      { id:'dict-strongs', icon:'fa-language', label:'스트롱' },
      { id:'dict-webster', icon:'fa-spell-check', label:'웹스터' },
      { id:'dict-enko', icon:'fa-exchange-alt', label:'영한' },
      { id:'dict-korean', icon:'fa-font', label:'국어' }
    ];
    tabs.forEach(function(t, i){
      html += '<button class="ls-dict-tab' + (i===0?' active':'') + '" data-dict="' + t.id + '" '
        + 'style="padding:4px 8px;border:none;background:' + (i===0?'var(--accent-dim)':'transparent') + ';'
        + 'color:' + (i===0?'var(--accent-color)':'var(--text3)') + ';border-radius:4px;cursor:pointer;font-size:11px;">'
        + '<i class="fa ' + t.icon + '"></i> ' + t.label + '</button>';
    });
    html += '</div>';
    html += '<div style="padding:8px;border-bottom:1px solid var(--border);flex-shrink:0;display:flex;gap:4px;">';
    html += '<input type="text" class="ls-dict-input" placeholder="검색어 입력..." '
      + 'style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;">';
    html += '<button style="padding:4px 10px;border-radius:5px;font-size:11px;font-weight:700;background:var(--gold);color:var(--bg);border:none;cursor:pointer;">'
      + '<i class="fa fa-search"></i></button>';
    html += '</div>';
    html += '<div style="flex:1;overflow-y:auto;padding:12px;display:flex;align-items:center;justify-content:center;">'
      + '<div style="text-align:center;color:var(--text3);font-size:12px;">'
      + '<i class="fa fa-spell-check" style="font-size:24px;opacity:.4;display:block;margin-bottom:8px;"></i>'
      + '단어를 검색하세요</div></div>';
    html += '</div>';
    container.innerHTML = html;

    // 탭 클릭 이벤트
    container.querySelectorAll('.ls-dict-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        container.querySelectorAll('.ls-dict-tab').forEach(function(b){
          b.style.background = 'transparent';
          b.style.color = 'var(--text3)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--accent-dim)';
        btn.style.color = 'var(--accent-color)';
        btn.classList.add('active');
        if(typeof switchSub === 'function') switchSub(btn.dataset.dict);
      });
    });

    // 검색 이벤트
    var input = container.querySelector('.ls-dict-input');
    var searchBtn = container.querySelector('button:last-of-type');
    function doSearch(){
      var activeTab = container.querySelector('.ls-dict-tab.active');
      var dict = activeTab ? activeTab.dataset.dict : 'dict-strongs';
      var val = input ? input.value.trim() : '';
      if(!val) return;
      if(dict === 'dict-strongs' && typeof searchStrongs === 'function'){
        var inp = document.getElementById('strongsSearchInput');
        if(inp){ inp.value = val; searchStrongs(); }
      } else if(dict === 'dict-webster' && typeof searchWebster === 'function'){
        var inp2 = document.getElementById('websterSearchInput');
        if(inp2){ inp2.value = val; searchWebster(); }
      } else if(dict === 'dict-enko' && typeof searchEnko === 'function'){
        var inp3 = document.getElementById('enkoSearchInput');
        if(inp3){ inp3.value = val; searchEnko(); }
      } else if(dict === 'dict-korean' && typeof searchKorean === 'function'){
        var inp4 = document.getElementById('koreanSearchInput');
        if(inp4){ inp4.value = val; searchKorean(); }
      }
    }
    if(input) input.addEventListener('keydown', function(e){ if(e.key==='Enter') doSearch(); });
    if(searchBtn) searchBtn.addEventListener('click', doSearch);
  }

  function _renderSearch(container){
    var html = '<div style="display:flex;flex-direction:column;flex:1;overflow:hidden;">';
    html += '<div style="padding:8px;border-bottom:1px solid var(--border);flex-shrink:0;display:flex;gap:4px;">';
    html += '<input type="text" class="ls-search-input" placeholder="검색어 입력... (한글/영어/H1234)" '
      + 'style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;">';
    html += '<button class="ls-search-btn" style="padding:4px 10px;border-radius:5px;font-size:11px;font-weight:700;background:var(--gold);color:var(--bg);border:none;cursor:pointer;">'
      + '<i class="fa fa-search"></i></button>';
    html += '</div>';
    html += '<div style="flex:1;overflow-y:auto;padding:12px;display:flex;align-items:center;justify-content:center;">'
      + '<div style="text-align:center;color:var(--text3);font-size:12px;">'
      + '<i class="fa fa-search" style="font-size:24px;opacity:.4;display:block;margin-bottom:8px;"></i>'
      + '성경 검색</div></div>';
    html += '</div>';
    container.innerHTML = html;

    var input = container.querySelector('.ls-search-input');
    var btn = container.querySelector('.ls-search-btn');
    function doSearch(){
      var val = input ? input.value.trim() : '';
      if(!val) return;
      var mainInput = document.getElementById('schInput');
      if(mainInput){ mainInput.value = val; }
      if(typeof uniSearch === 'function') uniSearch();
    }
    if(input) input.addEventListener('keydown', function(e){ if(e.key==='Enter') doSearch(); });
    if(btn) btn.addEventListener('click', doSearch);
  }

  function _renderGraph(container){
    var html = '<div style="flex:1;overflow:hidden;position:relative;">';
    html += '<div class="ls-graph-host" style="width:100%;height:100%;"></div>';
    html += '</div>';
    container.innerHTML = html;

    // KnowledgeGraph 초기화
    if(typeof KnowledgeGraph !== 'undefined'){
      var host = container.querySelector('.ls-graph-host');
      if(host && KnowledgeGraph.renderInto){
        KnowledgeGraph.renderInto(host);
      }
    }
  }

  function _renderReading(container){
    var html = '<div style="flex:1;overflow-y:auto;padding:12px;">';
    html += '<div style="text-align:center;color:var(--text3);font-size:12px;">'
      + '<i class="fa fa-calendar-check" style="font-size:24px;opacity:.4;display:block;margin-bottom:8px;"></i>'
      + '읽기 계획</div>';
    html += '</div>';
    container.innerHTML = html;

    // 읽기 계획 렌더링
    if(typeof renderReadingPlan === 'function'){
      var body = container.querySelector('div');
      if(body) renderReadingPlan(body);
    }
  }

  function _renderHymns(container){
    var html = '<div style="display:flex;flex-direction:column;flex:1;overflow:hidden;">';
    // 검색 바
    html += '<div style="padding:6px 8px;border-bottom:1px solid var(--border);flex-shrink:0;">';
    html += '<div style="display:flex;gap:4px;align-items:center;">';
    html += '<i class="fa fa-search" style="color:var(--text3);font-size:11px;"></i>';
    html += '<input type="text" class="ls-hymn-search" placeholder="번호 또는 제목 검색..." '
      + 'style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:12px;color:var(--text);outline:none;">';
    html += '</div></div>';
    // 찬양 목록
    html += '<div class="ls-hymn-list" style="flex:1;overflow-y:auto;padding:4px;"></div>';
    html += '</div>';
    container.innerHTML = html;

    // 찬양 검색
    var input = container.querySelector('.ls-hymn-search');
    if(input){
      input.addEventListener('input', function(){
        if(typeof _hymOnSearch === 'function') _hymOnSearch(this.value);
      });
    }

    // 찬양 목록 초기화
    if(typeof _hymInitSidePanel === 'function'){
      _hymInitSidePanel();
    }
  }

  // ═══ 슬롯 UI 업데이트 ═══
  function _updateSlotUI(area){
    var slot = _slotElements[area];
    if(!slot) return;
    var feat = _state.slots[area] || '';
    slot.dataset.feature = feat;

    // 활성 버튼 업데이트
    slot.querySelectorAll('.ls-feat-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.feat === feat);
    });
  }

  // ═══ 기능이 이미 할당된 슬롯 찾기 ═══
  function _findSlotByFeature(feat){
    var preset = PRESETS[_state.layout];
    if(!preset) return null;
    for(var i = 0; i < preset.areas.length; i++){
      if(_state.slots[preset.areas[i]] === feat) return preset.areas[i];
    }
    return null;
  }

  // ═══ 스왑 (위/아래 행 교환) ═══
  function swapRows(){
    var rowMap = ROW_MAP[_state.layout];
    if(!rowMap) return; // 단일 행 프리셋

    var topAreas = rowMap.top;
    var bottomAreas = rowMap.bottom;

    // 위/아래 행의 기능 수집
    var topFeats = topAreas.map(function(a){ return _state.slots[a]; });
    var bottomFeats = bottomAreas.map(function(a){ return _state.slots[a]; });

    // 모든 기능 언마운트
    topAreas.concat(bottomAreas).forEach(function(area){
      _unmountFeature(area);
    });

    // 교환: 위 → 아래, 아래 → 위
    // 개수가 다를 수 있으므로 가능한 만큼 매핑
    var maxTop = Math.max(topAreas.length, bottomAreas.length);
    for(var i = 0; i < topAreas.length; i++){
      _state.slots[topAreas[i]] = bottomFeats[i] || null;
    }
    for(var j = 0; j < bottomAreas.length; j++){
      _state.slots[bottomAreas[j]] = topFeats[j] || null;
    }

    // 리마운트
    topAreas.concat(bottomAreas).forEach(function(area){
      var feat = _state.slots[area];
      if(feat) _mountFeature(area, feat);
      _updateSlotUI(area);
    });

    _saveState();
  }

  // ═══ 레이아웃 피커 팝업 (준비 중) ═══
  function openPicker(){
    if(typeof toast === 'function') toast('화면 분할 기능은 준비 중입니다');
    return;

    /* ── 아래는 추후 활성화 예정 ── */
    if(_pickerEl){
      closePicker();
      return;
    }

    // 백드롭
    _backdropEl = document.createElement('div');
    _backdropEl.className = 'layout-picker-backdrop';
    _backdropEl.addEventListener('click', closePicker);
    document.body.appendChild(_backdropEl);

    // 피커
    _pickerEl = document.createElement('div');
    _pickerEl.className = 'layout-picker';

    // 위치: 레일 토글 버튼 기준
    var btn = document.getElementById('railToggleBtn');
    if(btn){
      var rect = btn.getBoundingClientRect();
      _pickerEl.style.top = rect.top + 'px';
      _pickerEl.style.left = (rect.right + 8) + 'px';
    } else {
      _pickerEl.style.top = '50px';
      _pickerEl.style.left = '60px';
    }

    // 타이틀
    var title = document.createElement('div');
    title.className = 'layout-picker-title';
    title.innerHTML = '<i class="fa fa-grip"></i> 레이아웃 선택';
    _pickerEl.appendChild(title);

    // 프리셋 그리드
    var grid = document.createElement('div');
    grid.className = 'lp-grid';

    PRESET_ORDER.forEach(function(pid){
      var p = PRESETS[pid];
      var item = document.createElement('div');
      item.className = 'lp-item' + (_state.active && _state.layout === pid ? ' active' : '');
      item.dataset.preset = pid;

      // 썸네일
      var thumb = document.createElement('div');
      thumb.className = 'lp-thumb';
      thumb.dataset.preset = pid;
      var numSlots = THUMB_SLOTS[pid];
      for(var i = 0; i < numSlots; i++){
        thumb.appendChild(document.createElement('div'));
      }
      item.appendChild(thumb);

      // 라벨
      var label = document.createElement('div');
      label.className = 'lp-label';
      label.textContent = p.label;
      item.appendChild(label);

      item.addEventListener('click', function(){
        if(!_state.active){
          _state.layout = pid;
          _activate();
        } else {
          setLayout(pid);
        }
        _updatePicker();
      });

      grid.appendChild(item);
    });

    _pickerEl.appendChild(grid);

    // 하단: 스왑 + 비활성화 버튼
    var bottomRow = document.createElement('div');
    bottomRow.className = 'lp-swap-row';
    bottomRow.style.gap = '6px';

    // 스왑 버튼
    var swapBtn = document.createElement('button');
    swapBtn.className = 'lp-swap-btn';
    swapBtn.innerHTML = '<i class="fa fa-exchange-alt fa-rotate-90"></i> 위/아래 교환';
    swapBtn.addEventListener('click', function(){
      swapRows();
    });
    bottomRow.appendChild(swapBtn);

    // 비활성화 버튼 (레이아웃 끄기)
    if(_state.active){
      var offBtn = document.createElement('button');
      offBtn.className = 'lp-swap-btn';
      offBtn.innerHTML = '<i class="fa fa-times"></i> 레이아웃 끄기';
      offBtn.addEventListener('click', function(){
        deactivate();
        closePicker();
      });
      bottomRow.appendChild(offBtn);
    }

    _pickerEl.appendChild(bottomRow);
    document.body.appendChild(_pickerEl);

    // ESC 키로 닫기
    document.addEventListener('keydown', _onPickerEsc);
  }

  function closePicker(){
    if(_pickerEl){
      _pickerEl.remove();
      _pickerEl = null;
    }
    if(_backdropEl){
      _backdropEl.remove();
      _backdropEl = null;
    }
    document.removeEventListener('keydown', _onPickerEsc);
  }

  function _onPickerEsc(e){
    if(e.key === 'Escape') closePicker();
  }

  function _updatePicker(){
    if(!_pickerEl) return;
    _pickerEl.querySelectorAll('.lp-item').forEach(function(item){
      item.classList.toggle('active', _state.active && item.dataset.preset === _state.layout);
    });
  }

  // ═══ 상태 저장/복원 ═══
  function _saveState(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        layout: _state.layout,
        slots: _state.slots,
        active: _state.active
      }));
    } catch(e){}
  }

  function _restoreState(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      var data = JSON.parse(raw);
      if(data.layout && PRESETS[data.layout]) _state.layout = data.layout;
      if(data.slots) _state.slots = data.slots;
      if(typeof data.active === 'boolean') _state.active = data.active;
    } catch(e){}
  }

  // ═══ 상태 조회 ═══
  function isActive(){
    return _state.active;
  }

  function getState(){
    return { layout: _state.layout, slots: _state.slots, active: _state.active };
  }

  // ═══ DOMContentLoaded에서 초기화 ═══
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  return {
    init: init,
    setLayout: setLayout,
    setFeature: setFeature,
    swapRows: swapRows,
    openPicker: openPicker,
    closePicker: closePicker,
    isActive: isActive,
    getState: getState,
    deactivate: deactivate
  };
})();
