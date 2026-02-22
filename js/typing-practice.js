/* ═══════════════════════════════════════════
   typing-practice.js — 성경 타자 연습
   ═══════════════════════════════════════════ */

// ── State ──
var _tp = {
  lang: 'kr',
  source: 'all',        // 'all'|'book'|'chapter'|'hearts'|'folder'
  book: null,
  ch: null,
  folderName: null,
  hearts: {},            // { "book_ch_v": true }
  folders: {},           // { "name": ["book_ch_v", ...] }
  verse: null,           // { book, ch, v, text, key, ref, fullBookName }
  typed: '',
  composing: false,
  startTime: 0,
  timerInterval: null,
  finished: false,
  started: false,
  history: [],
  audioCtx: null,
  prevCpm: null,
  bestCpm: 0,
  sessionVerses: 0,
  sessionAccSum: 0,
  sessionTime: 0,
  tpTheme: 'dark',
  recentKeys: [],
  lastInputTime: 0,
  speedGauge: 0,
  speedInterval: null
};

/* ═══ Typing Sound — 리얼 타자기 샘플 (Hermes Precisa 305) ═══ */
var _tpBufs = { key:null, space:null, bell:null };
var _tpSndLoaded = false;

function _tpGetAudioCtx(){
  if(!_tp.audioCtx){
    _tp.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(_tp.audioCtx.state === 'suspended') _tp.audioCtx.resume();
  return _tp.audioCtx;
}

function _tpLoadSounds(){
  if(_tpSndLoaded) return;
  _tpSndLoaded = true;
  var ctx = _tpGetAudioCtx();
  function load(url, key){
    fetch(url).then(function(r){ return r.arrayBuffer(); }).then(function(buf){
      ctx.decodeAudioData(buf, function(decoded){ _tpBufs[key] = decoded; });
    }).catch(function(){});
  }
  load('sounds/tw-key.mp3', 'key');
  load('sounds/tw-return.mp3', 'space');
  load('sounds/tw-bell.mp3', 'bell');
}

function _tpPlayBuf(buf, rate, vol){
  if(!buf) return;
  try {
    var ctx = _tpGetAudioCtx();
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate || 1;
    var g = ctx.createGain();
    g.gain.value = vol || 1;
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
  } catch(e){}
}

/* 키 타격: 리얼 타자기 활자 사운드 (랜덤 피치/볼륨) */
function _tpPlayKeySound(){
  _tpPlayBuf(_tpBufs.key, 0.94 + Math.random() * 0.12, 0.7 + Math.random() * 0.2);
}

/* 오타: 키 사운드 + 낮은 피치 변조 (걸린 느낌) */
function _tpPlayErrorSound(){
  _tpPlayBuf(_tpBufs.key, 0.7 + Math.random() * 0.1, 0.9);
}

/* 스페이스: 타자기 스페이스바 + 벨 (줄바꿈 캐리지 느낌) */
function _tpPlaySpaceSound(){
  _tpPlayBuf(_tpBufs.space, 0.96 + Math.random() * 0.08, 0.8);
  _tpPlayBuf(_tpBufs.bell, 1.0, 0.15);
}

/* 엔터: 레버 — 스페이스 저피치 + 벨 크게 (풀 캐리지 리턴) */
function _tpPlayEnterSound(){
  _tpPlayBuf(_tpBufs.space, 0.65 + Math.random() * 0.08, 1.0);
  setTimeout(function(){
    _tpPlayBuf(_tpBufs.bell, 0.95 + Math.random() * 0.1, 0.45);
  }, 60);
}

/* ═══ Punctuation skip helper ═══ */
var _tpPunctuation = /^[,.\-;:!?'"''""·…「」『』《》〈〉\(\)\[\]\/\\~@#$%^&*+=|`{}«»‹›〝〞〟＂＇]$/;
function _tpIsPunct(ch){ return _tpPunctuation.test(ch); }

/* ═══ Character normalization (curly quotes → straight, etc.) ═══ */
var _tpNormMap = {
  '\u2018':"'", '\u2019':"'", '\u201A':"'",
  '\u2039':"'", '\u203A':"'",
  '\uFF07':"'", '\u0060':"'",
  '\u201C':'"', '\u201D':'"', '\u201E':'"',
  '\u00AB':'"', '\u00BB':'"',
  '\u301D':'"', '\u301E':'"', '\u301F':'"',
  '\uFF02':'"',
  '\u300C':'"', '\u300D':'"', '\u300E':'"', '\u300F':'"',
  '\u2014':'-', '\u2013':'-', '\uFF0D':'-',
  '\u00B7':'.', '\u2027':'.'
};
function _tpNorm(ch){ return _tpNormMap[ch] || ch; }
function _tpMatch(a, b){ return _tpNorm(a) === _tpNorm(b); }

/* Build a mapping from typed position → target position, skipping punctuation */
function _tpBuildMapping(target, typed){
  var map = [];         // map[typedIdx] = targetIdx
  var targetSkip = [];  // which target chars are skipped (punctuation, auto-matched)
  var ti = 0;           // target index

  for(var pi = 0; pi < typed.length; pi++){
    // Skip over target punctuation that user didn't type
    while(ti < target.length && _tpIsPunct(target[ti]) && !_tpMatch(typed[pi], target[ti])){
      targetSkip.push(ti);
      ti++;
    }
    map.push(ti < target.length ? ti : -1);
    if(ti < target.length) ti++;
  }
  // Remaining target punctuation at end
  while(ti < target.length && _tpIsPunct(target[ti])){
    targetSkip.push(ti);
    ti++;
  }
  return { map: map, nextTarget: ti, skipped: targetSkip };
}

/* ═══ Toggle ═══ */
function toggleTypingPanel(){
  var el = document.getElementById('typingOverlay');
  if(!el) return;
  var show = !el.classList.contains('tp-show');
  el.classList.toggle('tp-show', show);
  var ri = document.querySelector('.rail-icon[data-rail="typing"]');
  if(ri) ri.classList.toggle('active', show);
  if(show){
    if(_activeRail && !_spPinned) closeSidePanel();
    _tpInit();
  } else {
    _tpStopTimer();
    if(_tp._resultKeyHandler){
      document.removeEventListener('keydown', _tp._resultKeyHandler);
      _tp._resultKeyHandler = null;
    }
  }
}

/* ═══ Init ═══ */
function _tpInit(){
  _tpLoadSounds();
  _tpLoadStorage();
  _tpApplyTheme();
  _tpRenderSettings();
  if(!_tp.started) _tpRenderBody();
}

/* ═══ Storage ═══ */
function _tpLoadStorage(){
  try {
    var h = localStorage.getItem('tp_hearts');
    if(h) _tp.hearts = JSON.parse(h);
    var f = localStorage.getItem('tp_folders');
    if(f) _tp.folders = JSON.parse(f);
    var bc = localStorage.getItem('tp_bestCpm');
    if(bc) _tp.bestCpm = parseInt(bc) || 0;
    var tt = localStorage.getItem('tp_theme');
    if(tt) _tp.tpTheme = tt;
  } catch(e){}
}
function _tpSaveHearts(){
  try { localStorage.setItem('tp_hearts', JSON.stringify(_tp.hearts)); } catch(e){}
}
function _tpSaveFolders(){
  try { localStorage.setItem('tp_folders', JSON.stringify(_tp.folders)); } catch(e){}
}
function _tpSaveBestCpm(){
  try { localStorage.setItem('tp_bestCpm', String(_tp.bestCpm)); } catch(e){}
}

/* ═══ Theme Toggle (Dark / Light) ═══ */
function _tpToggleTheme(){
  _tp.tpTheme = _tp.tpTheme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('tp_theme', _tp.tpTheme); } catch(e){}
  _tpApplyTheme();
}
function _tpApplyTheme(){
  var el = document.getElementById('typingOverlay');
  if(!el) return;
  el.classList.toggle('tp-light', _tp.tpTheme === 'light');
  var btn = document.getElementById('tpThemeBtn');
  if(btn){
    btn.innerHTML = _tp.tpTheme === 'dark'
      ? '<i class="fa fa-sun"></i>'
      : '<i class="fa fa-moon"></i>';
    btn.title = _tp.tpTheme === 'dark' ? '라이트 모드' : '다크 모드';
  }
}

/* ═══ Language ═══ */
function _tpSetLang(lang){
  _tp.lang = lang;
  document.getElementById('tpLangKr')?.classList.toggle('active', lang==='kr');
  document.getElementById('tpLangEn')?.classList.toggle('active', lang==='en');
  if(lang === 'en' && !KJV && typeof loadBibleEN === 'function'){
    loadBibleEN().then(function(){
      _tp.verse = null; _tp.started = false; _tpStopTimer(); _tpRenderBody();
    });
    return;
  }
  _tp.verse = null; _tp.started = false; _tpStopTimer(); _tpRenderBody();
}

/* ═══ Source ═══ */
function _tpSetSource(src){
  _tp.source = src;
  _tp.verse = null; _tp.started = false; _tpStopTimer();
  _tpRenderSettings();
  _tpRenderBody();
}
function _tpOnBookChange(){
  _tp.book = document.getElementById('tpBookSel')?.value || null;
  _tp.ch = null;
  _tpRenderSettings();
}
function _tpOnChChange(){
  _tp.ch = parseInt(document.getElementById('tpChSel')?.value) || null;
}
function _tpOnFolderChange(){
  _tp.folderName = document.getElementById('tpFolderSel')?.value || null;
  _tpRenderSettings();
}

/* ═══ Settings Render ═══ */
function _tpRenderSettings(){
  var el = document.getElementById('tpSettings');
  if(!el) return;

  var sources = [
    {id:'all',     label:'전체 성경', icon:'fa-bible'},
    {id:'book',    label:'책',       icon:'fa-book'},
    {id:'chapter', label:'장',       icon:'fa-file-alt'},
    {id:'hearts',  label:'즐겨찾기', icon:'fa-heart'},
    {id:'folder',  label:'폴더',     icon:'fa-folder'}
  ];
  var h = '<div class="tp-source-row">';
  sources.forEach(function(s){
    h += '<button class="tp-src-btn'+(_tp.source===s.id?' active':'')+'" onclick="_tpSetSource(\''+s.id+'\')"><i class="fa '+s.icon+'"></i> '+s.label+'</button>';
  });
  h += '</div>';

  // Book / Chapter selectors
  if(_tp.source === 'book' || _tp.source === 'chapter'){
    h += '<div class="tp-sel-row">';
    h += '<select class="tp-select" id="tpBookSel" onchange="_tpOnBookChange()"><option value="">책 선택...</option>';
    var allBooks = BOOKS.OT.concat(BOOKS.NT);
    allBooks.forEach(function(b){
      h += '<option value="'+b+'"'+(_tp.book===b?' selected':'')+'>'+b+'</option>';
    });
    h += '</select>';
    if(_tp.source === 'chapter' && _tp.book){
      var cnt = CHCNT[_tp.book] || 1;
      h += '<select class="tp-select" id="tpChSel" onchange="_tpOnChChange()"><option value="">장 선택...</option>';
      for(var i=1; i<=cnt; i++){
        h += '<option value="'+i+'"'+(_tp.ch===i?' selected':'')+'>'+i+'장</option>';
      }
      h += '</select>';
    }
    h += '</div>';
  }

  // Folder UI
  if(_tp.source === 'folder'){
    h += '<div class="tp-sel-row">';
    var fnames = Object.keys(_tp.folders);
    if(fnames.length > 0){
      h += '<select class="tp-select" id="tpFolderSel" onchange="_tpOnFolderChange()"><option value="">폴더 선택...</option>';
      fnames.forEach(function(n){
        var c = _tp.folders[n].length;
        h += '<option value="'+n+'"'+(_tp.folderName===n?' selected':'')+'>'+n+' ('+c+')</option>';
      });
      h += '</select>';
    }
    h += '<button class="tp-small-btn" onclick="_tpCreateFolder()"><i class="fa fa-plus"></i> 새 폴더</button>';
    if(_tp.folderName && _tp.folders[_tp.folderName]){
      h += '<button class="tp-small-btn tp-del" onclick="_tpDeleteFolder()"><i class="fa fa-trash"></i></button>';
    }
    h += '</div>';
    // Folder contents
    if(_tp.folderName && _tp.folders[_tp.folderName] && _tp.folders[_tp.folderName].length > 0){
      var verses = _tp.folders[_tp.folderName];
      h += '<div class="tp-folder-list">';
      verses.forEach(function(key, idx){
        var p = key.split('_');
        var short = BOOK_SHORT[p[0]] || p[0];
        h += '<span class="tp-folder-tag">'+short+' '+p[1]+':'+p[2]+' <i class="fa fa-times" onclick="_tpRemoveFromFolder('+idx+')"></i></span>';
      });
      h += '</div>';
    }
  }

  el.innerHTML = h;
}

/* ═══ Folder CRUD ═══ */
function _tpCreateFolder(){
  var name = prompt('폴더 이름을 입력하세요:');
  if(!name || !name.trim()) return;
  var n = name.trim();
  if(_tp.folders[n]){ toast('이미 존재하는 폴더입니다'); return; }
  _tp.folders[n] = [];
  _tp.folderName = n;
  _tpSaveFolders();
  _tpRenderSettings();
}
function _tpDeleteFolder(){
  if(!_tp.folderName) return;
  if(!confirm('"'+_tp.folderName+'" 폴더를 삭제하시겠습니까?')) return;
  delete _tp.folders[_tp.folderName];
  _tp.folderName = null;
  _tpSaveFolders();
  _tpRenderSettings();
}
function _tpAddToFolder(name){
  if(!_tp.verse || !name) return;
  var key = _tp.verse.key;
  if(!_tp.folders[name]) _tp.folders[name] = [];
  if(_tp.folders[name].indexOf(key) >= 0){ toast('이미 추가된 구절입니다'); return; }
  _tp.folders[name].push(key);
  _tpSaveFolders();
  toast(_tp.verse.ref + ' → "'+name+'" 폴더에 추가됨');
}
function _tpRemoveFromFolder(idx){
  if(!_tp.folderName || !_tp.folders[_tp.folderName]) return;
  _tp.folders[_tp.folderName].splice(idx, 1);
  _tpSaveFolders();
  _tpRenderSettings();
}

/* ═══ Verse Selection ═══ */
function _tpNextVerse(){
  var data = _tp.lang === 'en' ? KJV : BIBLE;
  if(!data){
    if(_tp.lang === 'en' && typeof loadBibleEN === 'function'){
      loadBibleEN().then(_tpNextVerse);
    } else {
      toast('성경 데이터를 불러오는 중입니다...');
    }
    return;
  }

  // Hearts source
  if(_tp.source === 'hearts'){
    var hkeys = Object.keys(_tp.hearts);
    if(hkeys.length === 0){ toast('즐겨찾기가 비어있습니다. 구절에 하트를 눌러주세요.'); return; }
    var hk = hkeys[Math.floor(Math.random() * hkeys.length)];
    _tp.verse = _tpVerseFromKey(hk);
    if(!_tp.verse){ toast('구절을 불러올 수 없습니다'); return; }
    _tpBeginTyping(); return;
  }

  // Folder source
  if(_tp.source === 'folder'){
    if(!_tp.folderName || !_tp.folders[_tp.folderName] || _tp.folders[_tp.folderName].length === 0){
      toast('폴더를 선택하고 구절을 추가해주세요'); return;
    }
    var fkeys = _tp.folders[_tp.folderName];
    var pool = fkeys.slice();
    // Heart weighting
    fkeys.forEach(function(k){ if(_tp.hearts[k]) for(var i=0;i<3;i++) pool.push(k); });
    var fk = pool[Math.floor(Math.random() * pool.length)];
    _tp.verse = _tpVerseFromKey(fk);
    if(!_tp.verse){ toast('구절을 불러올 수 없습니다'); return; }
    _tpBeginTyping(); return;
  }

  // All / Book / Chapter source
  if((_tp.source === 'book' || _tp.source === 'chapter') && !_tp.book){
    toast('책을 선택해주세요'); return;
  }
  if(_tp.source === 'chapter' && !_tp.ch){
    toast('장을 선택해주세요'); return;
  }

  var books;
  if(_tp.source === 'book' || _tp.source === 'chapter') books = [_tp.book];
  else books = BOOKS.OT.concat(BOOKS.NT);

  // 30% chance: pick from hearts in scope
  if(Math.random() < 0.3){
    var scopeHearts = Object.keys(_tp.hearts).filter(function(k){
      var p = k.split('_');
      if(books.indexOf(p[0]) < 0) return false;
      if(_tp.source === 'chapter' && _tp.ch && parseInt(p[1]) !== _tp.ch) return false;
      return true;
    });
    if(scopeHearts.length > 0){
      var sk = scopeHearts[Math.floor(Math.random() * scopeHearts.length)];
      var sv = _tpVerseFromKey(sk);
      if(sv){ _tp.verse = sv; _tpBeginTyping(); return; }
    }
  }

  // Random pick
  for(var attempt = 0; attempt < 40; attempt++){
    var book = books[Math.floor(Math.random() * books.length)];
    var chs = data[book];
    if(!chs) continue;
    var chKeys;
    if(_tp.source === 'chapter' && _tp.ch) chKeys = [String(_tp.ch)];
    else chKeys = Object.keys(chs);
    if(chKeys.length === 0) continue;

    var ch = chKeys[Math.floor(Math.random() * chKeys.length)];
    var vs = chs[ch];
    if(!vs || vs.length === 0) continue;

    var vIdx = Math.floor(Math.random() * vs.length);
    var key = book + '_' + ch + '_' + (vIdx+1);

    if(_tp.history.indexOf(key) >= 0 && attempt < 25) continue;

    var text = vs[vIdx].replace(/<[^>]+>/g, '').replace(/¶\s*/g, '').trim();
    if(!text || text.length < 3) continue;

    _tp.history.push(key);
    if(_tp.history.length > 20) _tp.history.shift();

    var short = BOOK_SHORT[book] || book;
    _tp.verse = { book:book, ch:ch, v:vIdx+1, text:text, key:key, ref:short+' '+ch+':'+(vIdx+1), fullBook:book };
    _tpBeginTyping();
    return;
  }

  toast('구절을 찾을 수 없습니다. 범위를 확인해주세요.');
}

function _tpVerseFromKey(key){
  var p = key.split('_');
  if(p.length < 3) return null;
  var book = p[0], ch = p[1], v = parseInt(p[2]);
  var data = _tp.lang === 'en' ? KJV : BIBLE;
  var raw = data && data[book] && data[book][ch] && data[book][ch][v-1];
  if(!raw) return null;
  var text = raw.replace(/<[^>]+>/g, '').replace(/¶\s*/g, '').trim();
  if(!text) return null;
  var short = BOOK_SHORT[book] || book;
  return { book:book, ch:ch, v:v, text:text, key:key, ref:short+' '+ch+':'+v, fullBook:book };
}

/* ═══ Typing Session ═══ */
function _tpBeginTyping(){
  if(_tp._resultKeyHandler){
    document.removeEventListener('keydown', _tp._resultKeyHandler);
    _tp._resultKeyHandler = null;
  }
  _tp.typed = '';
  _tp.finished = false;
  _tp.startTime = 0;
  _tp.started = true;
  _tp.composing = false;
  _tp.recentKeys = [];
  _tp.lastInputTime = 0;
  _tp.speedGauge = 0;
  _tpStopTimer();
  _tpRenderBody();
  setTimeout(function(){
    var ta = document.getElementById('tpInput');
    if(ta) ta.focus();
  }, 80);
}

function _tpOnInput(){
  var ta = document.getElementById('tpInput');
  if(!ta || !_tp.verse) return;

  var prev = _tp.typed;
  _tp.typed = ta.value;

  // Error sound + speed tracking: check after value settles (non-composing, new char added)
  if(!_tp.composing && _tp.typed.length > prev.length){
    var now = Date.now();
    for(var ki = 0; ki < _tp.typed.length - prev.length; ki++) _tp.recentKeys.push(now);
    _tp.lastInputTime = now;
    var result = _tpBuildMapping(_tp.verse.text, _tp.typed);
    var lastIdx = _tp.typed.length - 1;
    var mappedTarget = result.map[lastIdx];
    if(mappedTarget >= 0 && !_tpMatch(_tp.typed[lastIdx], _tp.verse.text[mappedTarget])){
      _tpPlayErrorSound();
    }
  }

  // Start timer on first keystroke
  if(!_tp.startTime && _tp.typed.length > 0){
    _tp.startTime = Date.now();
    _tpStartTimer();
    _tp.speedInterval = setInterval(_tpTickSpeedGauge, 80);
  }

  _tpUpdateChars();

  // Check completion (even during composition for Korean last-char)
  if(!_tp.finished){
    var mapping = _tpBuildMapping(_tp.verse.text, _tp.typed);
    if(mapping.nextTarget >= _tp.verse.text.length){
      _tp.finished = true;
      _tp.composing = false;
      _tpStopTimer();
      _tpShowResults();
    }
  }
}

function _tpUpdateChars(){
  var container = document.getElementById('tpChars');
  if(!container || !_tp.verse) return;

  var target = _tp.verse.text;
  var typed = _tp.typed;
  var spans = container.querySelectorAll('.tp-char');
  var evalLen = _tp.composing ? Math.max(0, typed.length - 1) : typed.length;

  var result = _tpBuildMapping(target, typed.slice(0, evalLen));
  var matchedSet = {};  // targetIdx → 'correct' | 'wrong'
  var skippedSet = {};  // targetIdx → true (auto-skipped punctuation)

  for(var p = 0; p < result.map.length; p++){
    var ti = result.map[p];
    if(ti >= 0){
      matchedSet[ti] = _tpMatch(typed[p], target[ti]) ? 'correct' : 'wrong';
    }
  }
  for(var s = 0; s < result.skipped.length; s++){
    skippedSet[result.skipped[s]] = true;
  }

  var cursorTarget = result.nextTarget;

  // 조합 중인 글자 추출
  var composingText = (_tp.composing && typed.length > evalLen) ? typed.slice(evalLen) : '';

  for(var i = 0; i < spans.length; i++){
    var span = spans[i];
    var origChar = target[i] === ' ' ? '\u00a0' : target[i];

    if(matchedSet[i] === 'correct'){
      var wasCorrect = span.classList.contains('tp-correct');
      span.className = 'tp-char tp-correct' + (!wasCorrect ? ' tp-punch' : '');
      span.textContent = origChar;
    } else if(matchedSet[i] === 'wrong'){
      var wasWrong = span.classList.contains('tp-wrong');
      span.className = 'tp-char tp-wrong' + (!wasWrong ? ' tp-punch-err' : '');
      span.textContent = origChar;
    } else if(skippedSet[i]){
      var wasSkip = span.classList.contains('tp-correct');
      span.className = 'tp-char tp-correct' + (!wasSkip ? ' tp-punch' : '');
      span.textContent = origChar;
    } else if(_tp.composing && i === cursorTarget && composingText){
      // 실시간 자음/모음 조합 표시
      span.className = 'tp-char tp-composing';
      span.textContent = composingText;
    } else if(!_tp.composing && i === cursorTarget){
      span.className = 'tp-char tp-cursor';
      span.textContent = origChar;
    } else {
      span.className = 'tp-char';
      span.textContent = origChar;
    }
  }
}

/* ═══ Timer & Stats ═══ */
function _tpStartTimer(){ _tp.timerInterval = setInterval(_tpRenderStats, 500); }
function _tpStopTimer(){
  if(_tp.timerInterval){ clearInterval(_tp.timerInterval); _tp.timerInterval = null; }
  if(_tp.speedInterval){ clearInterval(_tp.speedInterval); _tp.speedInterval = null; }
}

/* ═══ Real-time Speed Gauge ═══ */
function _tpTickSpeedGauge(){
  if(!_tp.started || _tp.finished) return;
  var now = Date.now();
  // Overall CPM = correct chars only / total elapsed minutes
  var target = 0;
  if(_tp.startTime && _tp.typed.length > 0 && _tp.verse){
    var elapsed = (now - _tp.startTime) / 60000; // minutes
    if(elapsed > 0){
      var r = _tpBuildMapping(_tp.verse.text, _tp.typed);
      var corr = 0;
      for(var ci = 0; ci < r.map.length; ci++){
        if(r.map[ci] >= 0 && _tpMatch(_tp.typed[ci], _tp.verse.text[r.map[ci]])) corr++;
      }
      target = Math.round(corr / elapsed);
    }
  }
  // Smooth interpolation
  _tp.speedGauge += (target - _tp.speedGauge) * 0.15;
  if(Math.abs(_tp.speedGauge - target) < 1) _tp.speedGauge = target;
  // Update visual
  var bar = document.getElementById('tpSpeedBar');
  var num = document.getElementById('tpSpeedNum');
  if(bar){
    var pct = Math.min(100, _tp.speedGauge / 600 * 100);
    bar.style.width = pct + '%';
    if(_tp.speedGauge >= 600){
      bar.style.background = 'linear-gradient(90deg, #ff0000, #ff8800, #ffee00, #00ff44, #00ccff, #8844ff, #ff00cc)';
      bar.style.boxShadow = '0 0 20px rgba(255,0,200,0.5), 0 0 40px rgba(100,50,255,0.3)';
    } else if(_tp.speedGauge > 400){
      bar.style.background = 'linear-gradient(90deg, #e83030, #ff4040, #ff6050)';
      bar.style.boxShadow = '0 0 16px rgba(255,50,50,0.5)';
    } else if(_tp.speedGauge > 200){
      bar.style.background = 'linear-gradient(90deg, #e8a020, #ff8c00)';
      bar.style.boxShadow = '0 0 12px rgba(232,160,32,0.4)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #4a8fe8, #e8a020)';
      bar.style.boxShadow = '0 0 8px rgba(96,143,232,0.3)';
    }
  }
  if(num){
    var spd = Math.round(_tp.speedGauge);
    num.textContent = spd;
    // Dynamic scale: 1.0 at 0 → 3.0 at 600+
    var ratio = Math.min(_tp.speedGauge, 600) / 600;
    var scale = 1 + ratio * 2.0;
    num.style.transform = 'scale(' + scale.toFixed(2) + ')';
    if(_tp.speedGauge >= 600){
      num.style.background = 'linear-gradient(90deg, #ff0000, #ff8800, #ffe600, #00ff44, #00ccff, #8844ff, #ff00cc)';
      num.style.webkitBackgroundClip = 'text';
      num.style.webkitTextFillColor = 'transparent';
      num.style.backgroundClip = 'text';
      num.style.filter = 'drop-shadow(0 0 24px rgba(255,0,200,0.7)) drop-shadow(0 0 48px rgba(100,50,255,0.4))';
      num.style.textShadow = 'none';
    } else if(_tp.speedGauge > 400){
      num.style.background = 'none';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
      num.style.filter = 'none';
      num.style.color = '#ff3030';
      num.style.textShadow = '0 0 30px rgba(255,48,48,0.8), 0 0 60px rgba(255,0,0,0.35), 0 2px 6px rgba(0,0,0,0.4)';
    } else if(_tp.speedGauge > 200){
      num.style.background = 'none';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
      num.style.filter = 'none';
      num.style.color = '#e8a020';
      num.style.textShadow = '0 0 20px rgba(232,160,32,0.6), 0 0 40px rgba(232,160,32,0.2), 0 2px 4px rgba(0,0,0,0.25)';
    } else if(_tp.speedGauge > 50){
      num.style.background = 'none';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
      num.style.filter = 'none';
      num.style.color = '#60a5fa';
      num.style.textShadow = '0 0 14px rgba(96,165,250,0.4), 0 2px 4px rgba(0,0,0,0.15)';
    } else if(_tp.speedGauge > 0){
      num.style.background = 'none';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
      num.style.filter = 'none';
      num.style.color = '#60a5fa';
      num.style.textShadow = 'none';
    } else {
      num.style.background = 'none';
      num.style.webkitTextFillColor = '';
      num.style.backgroundClip = '';
      num.style.filter = 'none';
      num.style.color = '#3a4060';
      num.style.textShadow = 'none';
      num.style.transform = 'scale(1)';
    }
  }
}

function _tpRenderStats(){
  var el = document.getElementById('tpStats');
  if(!el || !_tp.verse) return;

  var typed = _tp.typed, target = _tp.verse.text;
  var elapsed = _tp.startTime ? (Date.now() - _tp.startTime) / 1000 : 0;
  var minutes = elapsed / 60;

  var result = _tpBuildMapping(target, typed);
  var correct = 0;
  for(var i = 0; i < result.map.length; i++){
    var ti = result.map[i];
    if(ti >= 0 && _tpMatch(typed[i], target[ti])) correct++;
  }

  var accuracy = typed.length > 0 ? Math.round(correct / typed.length * 100) : 100;
  var cpm = minutes > 0 ? Math.round(typed.length / minutes) : 0;
  var progress = Math.min(100, Math.round(result.nextTarget / target.length * 100));
  var m = Math.floor(elapsed/60);
  var sec = Math.floor(elapsed%60);
  var timeStr = m + ':' + (sec < 10 ? '0' : '') + sec;

  el.innerHTML =
    '<span><i class="fa fa-clock"></i> ' + timeStr + '</span>' +
    '<span><i class="fa fa-tachometer-alt"></i> ' + cpm + ' 타/분</span>' +
    '<span><i class="fa fa-bullseye"></i> ' + accuracy + '%</span>' +
    '<span><i class="fa fa-tasks"></i> ' + progress + '%</span>';
}

/* ═══ Results Screen ═══ */
function _tpShowResults(){
  var el = document.getElementById('tpBody');
  if(!el || !_tp.verse) return;

  var target = _tp.verse.text;
  var typed = _tp.typed;
  var elapsed = _tp.startTime ? (Date.now() - _tp.startTime) / 1000 : 0;
  var minutes = elapsed / 60;

  var result = _tpBuildMapping(target, typed);
  var correct = 0, wrong = 0;
  for(var i = 0; i < result.map.length; i++){
    var ti = result.map[i];
    if(ti >= 0){
      if(_tpMatch(typed[i], target[ti])) correct++;
      else wrong++;
    }
  }
  var skipped = result.skipped.length;
  var totalChars = target.length;
  var accuracy = typed.length > 0 ? Math.round(correct / typed.length * 100) : 100;
  var cpm = minutes > 0 ? Math.round(typed.length / minutes) : 0;
  var wpm = minutes > 0 ? Math.round((typed.length / 5) / minutes) : 0;

  // Previous CPM comparison
  var prevCpm = _tp.prevCpm;
  _tp.prevCpm = cpm;

  // Best CPM tracking
  if(cpm > _tp.bestCpm){ _tp.bestCpm = cpm; _tpSaveBestCpm(); }
  var bestCpm = _tp.bestCpm;

  // Session stats
  _tp.sessionVerses++;
  _tp.sessionAccSum += accuracy;
  _tp.sessionTime += elapsed;
  var sessionAvgAcc = Math.round(_tp.sessionAccSum / _tp.sessionVerses);
  var sessionTimeM = Math.floor(_tp.sessionTime / 60);
  var sessionTimeS = Math.floor(_tp.sessionTime % 60);
  var sessionTimeStr = sessionTimeM + ':' + (sessionTimeS < 10 ? '0' : '') + sessionTimeS;

  var m = Math.floor(elapsed / 60);
  var sec = Math.floor(elapsed % 60);
  var timeStr = m + ':' + (sec < 10 ? '0' : '') + sec;

  // Speed rating
  var speedLabel, speedClass;
  if(cpm >= 500){ speedLabel = '매우 빠름'; speedClass = 'tp-spd-fast'; }
  else if(cpm >= 300){ speedLabel = '빠름'; speedClass = 'tp-spd-good'; }
  else if(cpm >= 150){ speedLabel = '보통'; speedClass = 'tp-spd-normal'; }
  else { speedLabel = '느림'; speedClass = 'tp-spd-slow'; }

  // Accuracy rating
  var accLabel;
  if(accuracy >= 98) accLabel = '완벽!';
  else if(accuracy >= 95) accLabel = '우수';
  else if(accuracy >= 90) accLabel = '양호';
  else accLabel = '연습 필요';

  var v = _tp.verse;
  var isHearted = !!_tp.hearts[v.key];

  // Bar percentages
  var correctPct = totalChars > 0 ? (correct / totalChars * 100).toFixed(1) : 0;
  var wrongPct = totalChars > 0 ? (wrong / totalChars * 100).toFixed(1) : 0;
  var skipPct = totalChars > 0 ? (skipped / totalChars * 100).toFixed(1) : 0;
  var speedPct = Math.min(100, Math.round(cpm / 600 * 100));

  // SVG ring
  var circ = 2 * Math.PI * 52;
  var ringOffset = circ - (circ * accuracy / 100);

  // Folder button (항상 표시)
  var fnames = Object.keys(_tp.folders);

  el.innerHTML =
    '<div class="tp-result">' +
      '<div class="tp-result-head">' +
        '<div class="tp-result-icon"><i class="fa fa-check-circle"></i></div>' +
        '<div class="tp-result-title">타이핑 완료!</div>' +
        '<div class="tp-result-ref">' + (v.fullBook || v.book) + ' ' + v.ch + ':' + v.v + '</div>' +
      '</div>' +

      '<div class="tp-result-cards">' +
        '<div class="tp-rcard">' +
          '<div class="tp-ring-wrap">' +
            '<svg class="tp-ring-svg" viewBox="0 0 120 120">' +
              '<circle class="tp-ring-bg" cx="60" cy="60" r="52"/>' +
              '<circle class="tp-ring-fill" cx="60" cy="60" r="52" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + ringOffset.toFixed(1) + '"/>' +
            '</svg>' +
            '<div class="tp-ring-text">' +
              '<span class="tp-ring-num">' + accuracy + '<small>%</small></span>' +
              '<span class="tp-ring-lbl">' + accLabel + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="tp-rcard-title">정확도</div>' +
        '</div>' +

        '<div class="tp-rcard">' +
          '<div class="tp-rcard-big">' + cpm + '</div>' +
          '<div class="tp-rcard-unit">타/분</div>' +
          '<div class="tp-rcard-bar-wrap"><div class="tp-rcard-bar" style="width:' + speedPct + '%"></div></div>' +
          '<div class="tp-rcard-tag ' + speedClass + '">' + speedLabel + '</div>' +
          (prevCpm !== null ? (function(){
            var delta = cpm - prevCpm;
            var sign = delta > 0 ? '+' : '';
            var cls = delta > 0 ? 'tp-delta-up' : (delta < 0 ? 'tp-delta-down' : 'tp-delta-same');
            var icon = delta > 0 ? 'fa-arrow-up' : (delta < 0 ? 'fa-arrow-down' : 'fa-equals');
            return '<div class="tp-rcard-delta ' + cls + '">' +
              '<i class="fa ' + icon + '"></i> ' + sign + delta +
              ' <span class="tp-delta-prev">(이전: ' + prevCpm + ')</span></div>';
          })() : '') +
          '<div class="tp-rcard-best"><i class="fa fa-trophy"></i> 최고: ' + bestCpm + '</div>' +
        '</div>' +

        '<div class="tp-rcard">' +
          '<div class="tp-rcard-big">' + timeStr + '</div>' +
          '<div class="tp-rcard-unit">소요 시간</div>' +
          '<div class="tp-rcard-wpm">' + wpm + ' WPM</div>' +
        '</div>' +
      '</div>' +

      '<div class="tp-result-chart">' +
        '<div class="tp-chart-title"><i class="fa fa-chart-bar"></i> 문자 분석</div>' +
        '<div class="tp-chart-bar">' +
          (correct > 0 ? '<div class="tp-cbar-ok" style="width:' + correctPct + '%"></div>' : '') +
          (wrong > 0 ? '<div class="tp-cbar-err" style="width:' + wrongPct + '%"></div>' : '') +
          (skipped > 0 ? '<div class="tp-cbar-skip" style="width:' + skipPct + '%"></div>' : '') +
        '</div>' +
        '<div class="tp-chart-legend">' +
          '<span><span class="tp-dot" style="background:var(--gold)"></span>정확 ' + correct + '자</span>' +
          '<span><span class="tp-dot" style="background:#ff4757"></span>오류 ' + wrong + '자</span>' +
          (skipped > 0 ? '<span><span class="tp-dot" style="background:var(--text3);opacity:.5"></span>구두점 ' + skipped + '자</span>' : '') +
          '<span><span class="tp-dot" style="background:var(--text2)"></span>전체 ' + totalChars + '자</span>' +
        '</div>' +
      '</div>' +

      '<div class="tp-session-bar">' +
        '<span><i class="fa fa-file-alt"></i> ' + _tp.sessionVerses + '구절</span>' +
        '<span><i class="fa fa-bullseye"></i> 평균 ' + sessionAvgAcc + '%</span>' +
        '<span><i class="fa fa-trophy"></i> 최고 ' + bestCpm + ' 타/분</span>' +
        '<span><i class="fa fa-clock"></i> 총 ' + sessionTimeStr + '</span>' +
      '</div>' +

      '<div class="tp-result-acts">' +
        '<button class="tp-next-btn" onclick="_tpNextVerse()"><i class="fa fa-arrow-right"></i> 다음 구절</button>' +
        '<button class="tp-heart-btn' + (isHearted ? ' tp-hearted' : '') + '" id="tpHeartBtn" onclick="_tpToggleHeart()">' +
          '<i class="fa' + (isHearted ? 's' : 'r') + ' fa-heart"></i>' +
        '</button>' +
        '<div class="tp-folder-wrap">' +
          '<button class="tp-folder-btn" id="tpFolderBtn" onclick="_tpToggleFolderMenu()" title="폴더에 추가">' +
            '<i class="fa fa-folder-plus"></i>' +
          '</button>' +
          '<div class="tp-folder-menu" id="tpFolderMenu"></div>' +
        '</div>' +
      '</div>' +
      '<div class="tp-result-enter"><i class="fa fa-level-down-alt fa-rotate-90"></i> Enter 키를 눌러 다음 구절로</div>' +
    '</div>';

  // Document-level Enter key listener
  _tp._resultKeyHandler = function(e){
    if(e.key === 'Enter'){ e.preventDefault(); _tpPlayEnterSound(); _tpNextVerse(); }
    else if(e.key === 'Escape'){ e.preventDefault(); toggleTypingPanel(); }
  };
  document.addEventListener('keydown', _tp._resultKeyHandler);
}

/* ═══ Folder Menu (결과 화면) ═══ */
function _tpToggleFolderMenu(){
  var menu = document.getElementById('tpFolderMenu');
  if(!menu) return;
  var isOpen = menu.classList.contains('tp-fm-open');
  if(isOpen){ _tpCloseFolderMenu(); return; }
  _tpRenderFolderMenu();
  menu.classList.add('tp-fm-open');
  // 바깥 클릭 닫기
  setTimeout(function(){
    document.addEventListener('click', _tpFolderOutside);
  }, 10);
}
function _tpCloseFolderMenu(){
  var menu = document.getElementById('tpFolderMenu');
  if(menu) menu.classList.remove('tp-fm-open');
  document.removeEventListener('click', _tpFolderOutside);
}
function _tpFolderOutside(e){
  var wraps = document.querySelectorAll('.tp-folder-wrap');
  for(var i = 0; i < wraps.length; i++){
    if(wraps[i].contains(e.target)) return;
  }
  _tpCloseFolderMenu();
}
function _tpRenderFolderMenu(){
  var menu = document.getElementById('tpFolderMenu');
  if(!menu || !_tp.verse) return;
  var key = _tp.verse.key;
  var fnames = Object.keys(_tp.folders);
  var h = '';
  if(fnames.length > 0){
    h += '<div class="tp-fm-label">폴더 선택</div>';
    fnames.forEach(function(n){
      var inFolder = _tp.folders[n] && _tp.folders[n].indexOf(key) >= 0;
      h += '<div class="tp-fm-item' + (inFolder ? ' tp-fm-added' : '') + '" onclick="_tpToggleFolderItem(\'' + n.replace(/'/g, "\\'") + '\')">';
      h += '<i class="fa ' + (inFolder ? 'fa-check-circle' : 'fa-circle') + '"></i>';
      h += '<span>' + n + '</span>';
      if(inFolder) h += '<span class="tp-fm-badge">추가됨</span>';
      h += '</div>';
    });
    h += '<div class="tp-fm-divider"></div>';
  }
  h += '<div class="tp-fm-item tp-fm-create" onclick="_tpCreateFolderFromMenu()">';
  h += '<i class="fa fa-plus"></i><span>새 폴더 만들기</span>';
  h += '</div>';
  menu.innerHTML = h;
}
function _tpToggleFolderItem(name){
  if(!_tp.verse) return;
  var key = _tp.verse.key;
  if(!_tp.folders[name]) _tp.folders[name] = [];
  var idx = _tp.folders[name].indexOf(key);
  if(idx >= 0){
    _tp.folders[name].splice(idx, 1);
    toast(_tp.verse.ref + ' → "' + name + '" 에서 제거됨');
  } else {
    _tp.folders[name].push(key);
    toast(_tp.verse.ref + ' → "' + name + '" 폴더에 추가됨');
  }
  _tpSaveFolders();
  _tpRenderFolderMenu();
}
function _tpCreateFolderFromMenu(){
  var name = prompt('새 폴더 이름을 입력하세요:');
  if(!name || !name.trim()) return;
  var n = name.trim();
  if(_tp.folders[n]){ toast('이미 존재하는 폴더입니다'); return; }
  _tp.folders[n] = [];
  if(_tp.verse) _tp.folders[n].push(_tp.verse.key);
  _tpSaveFolders();
  _tpRenderFolderMenu();
  toast('"' + n + '" 폴더 생성' + (_tp.verse ? ' + 구절 추가됨' : ''));
}

/* ═══ Hearts ═══ */
function _tpToggleHeart(){
  if(!_tp.verse) return;
  var key = _tp.verse.key;
  if(_tp.hearts[key]) delete _tp.hearts[key];
  else _tp.hearts[key] = true;
  _tpSaveHearts();
  var btn = document.getElementById('tpHeartBtn');
  if(btn){
    var on = !!_tp.hearts[key];
    btn.innerHTML = '<i class="fa'+(on?'s':'r')+' fa-heart"></i>';
    btn.classList.toggle('tp-hearted', on);
    if(on) btn.style.animation = 'tp-heartPop .3s ease';
    else btn.style.animation = '';
  }
}

/* ═══ Render Body ═══ */
function _tpRenderBody(){
  var el = document.getElementById('tpBody');
  if(!el) return;

  if(!_tp.started || !_tp.verse){
    el.innerHTML =
      '<div class="tp-start-screen">' +
        '<div class="tp-start-icon"><i class="fa fa-keyboard"></i></div>' +
        '<p class="tp-start-msg">설정을 선택한 후 시작 버튼을 눌러주세요</p>' +
        '<button class="tp-start-btn" onclick="_tpNextVerse()"><i class="fa fa-play"></i> 시작</button>' +
      '</div>';
    return;
  }

  var v = _tp.verse;
  var isHearted = !!_tp.hearts[v.key];

  // Character spans
  var charSpans = '';
  for(var i = 0; i < v.text.length; i++){
    var c = v.text[i];
    var display = c === ' ' ? '&nbsp;' : c.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    charSpans += '<span class="tp-char'+(i===0?' tp-cursor':'')+'">' + display + '</span>';
  }

  el.innerHTML =
    '<div class="tp-verse-area">' +
      '<div class="tp-verse-header">' +
        '<div class="tp-verse-ref"><span class="tp-ref-book">' + (v.fullBook || v.book) + '</span> <span class="tp-ref-chv">' + v.ch + ':' + v.v + '</span></div>' +
        '<div class="tp-verse-acts">' +
          '<button class="tp-heart-btn'+(isHearted?' tp-hearted':'')+'" id="tpHeartBtn" onclick="_tpToggleHeart()">' +
            '<i class="fa'+(isHearted?'s':'r')+' fa-heart"></i>' +
          '</button>' +
          '<div class="tp-folder-wrap">' +
            '<button class="tp-folder-btn" id="tpFolderBtn" onclick="_tpToggleFolderMenu()" title="폴더에 추가">' +
              '<i class="fa fa-bookmark"></i>' +
            '</button>' +
            '<div class="tp-folder-menu" id="tpFolderMenu"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tp-speed-wrap">' +
        '<div class="tp-speed-num" id="tpSpeedNum">0</div>' +
        '<div class="tp-speed-gauge"><div class="tp-speed-bar" id="tpSpeedBar"></div></div>' +
      '</div>' +
      '<div class="tp-chars" id="tpChars">' + charSpans + '</div>' +
      '<textarea id="tpInput" class="tp-ghost-input" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>' +
    '</div>' +
    '<div class="tp-stats" id="tpStats">' +
      '<span><i class="fa fa-clock"></i> 0:00</span>' +
      '<span><i class="fa fa-tachometer-alt"></i> 0 타/분</span>' +
      '<span><i class="fa fa-bullseye"></i> 100%</span>' +
      '<span><i class="fa fa-tasks"></i> 0%</span>' +
    '</div>';

  // tp-chars 클릭 시 숨겨진 입력창에 포커스
  var charsEl = document.getElementById('tpChars');
  if(charsEl){
    charsEl.addEventListener('click', function(){
      var ta = document.getElementById('tpInput');
      if(ta) ta.focus();
    });
  }

  // Attach event listeners
  var ta = document.getElementById('tpInput');
  if(ta){
    ta.addEventListener('input', _tpOnInput);
    ta.addEventListener('compositionstart', function(){ _tp.composing = true; });
    ta.addEventListener('compositionend', function(){
      _tp.composing = false;
      // 조합 완성 후 오타 검사
      var val = ta.value;
      if(val.length > 0 && _tp.verse){
        var r = _tpBuildMapping(_tp.verse.text, val);
        var idx = val.length - 1;
        if(r.map[idx] >= 0 && !_tpMatch(val[idx], _tp.verse.text[r.map[idx]])){
          _tpPlayErrorSound();
        }
      }
      _tpOnInput();
    });
    ta.addEventListener('paste', function(e){ e.preventDefault(); });
    ta.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ toggleTypingPanel(); e.preventDefault(); return; }
      if(e.key === 'Enter'){
        e.preventDefault();
        _tpPlayEnterSound();
        _tpStopTimer();
        _tpNextVerse();
        return;
      }
      // 키 종류별 사운드 분기
      var skip = ['Shift','Control','Alt','Meta','CapsLock','Tab',
                  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                  'Home','End','PageUp','PageDown','Insert','Delete',
                  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
                  'NumLock','ScrollLock','ContextMenu','PrintScreen','Pause'];
      if(skip.indexOf(e.key) === -1 && !e.ctrlKey && !e.metaKey){
        if(e.key === ' ') _tpPlaySpaceSound();
        else _tpPlayKeySound();
      }
    });
  }
}
