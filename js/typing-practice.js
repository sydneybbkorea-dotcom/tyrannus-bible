/* ═══════════════════════════════════════════
   typing-practice.js — 성경 타자 연습
   ═══════════════════════════════════════════ */

// ── Admin ──
var _TP_ADMIN_UID = 'jOT7IJ7okMRb9dUP3COD124xnPq1';

function _tpIsAdmin(){
  return _TP_ADMIN_UID && window._firebaseUid === _TP_ADMIN_UID;
}

// ── Tier (계급) System ──
var _tpTiers = [
  { name:'Diamond',  icon:'💎', color:'#b9f2ff', minScore:800 },
  { name:'Platinum', icon:'⚜️', color:'#e5e4e2', minScore:600 },
  { name:'Gold',     icon:'👑', color:'#ffd700', minScore:450 },
  { name:'Silver',   icon:'🛡️', color:'#c0c0c0', minScore:300 },
  { name:'Bronze',   icon:'⚔️', color:'#cd7f32', minScore:150 },
  { name:'Iron',     icon:'🔰', color:'#8a8a8a', minScore:0 }
];
function _tpGetTier(score){
  for(var i = 0; i < _tpTiers.length; i++){
    if(score >= _tpTiers[i].minScore) return _tpTiers[i];
  }
  return _tpTiers[_tpTiers.length - 1];
}

// ── Hand Position Practice Data ──
// 8-zone finger mapping (matches Ratatype):
// 0=L pinky, 1=L ring, 2=L middle, 3=L index,
// 4=R index, 5=R middle, 6=R ring, 7=R pinky
var _tpKbLayout = [
  // Row 0: top (qwertyuiop)
  [{en:'q',kr:'ㅂ',finger:0},{en:'w',kr:'ㅈ',finger:1},{en:'e',kr:'ㄷ',finger:2},{en:'r',kr:'ㄱ',finger:3},{en:'t',kr:'ㅅ',finger:3},{en:'y',kr:'ㅛ',finger:4},{en:'u',kr:'ㅕ',finger:4},{en:'i',kr:'ㅑ',finger:5},{en:'o',kr:'ㅐ',finger:6},{en:'p',kr:'ㅔ',finger:7}],
  // Row 1: home (asdfghjkl)
  [{en:'a',kr:'ㅁ',finger:0},{en:'s',kr:'ㄴ',finger:1},{en:'d',kr:'ㅇ',finger:2},{en:'f',kr:'ㄹ',finger:3},{en:'g',kr:'ㅎ',finger:3},{en:'h',kr:'ㅗ',finger:4},{en:'j',kr:'ㅓ',finger:4},{en:'k',kr:'ㅏ',finger:5},{en:'l',kr:'ㅣ',finger:6}],
  // Row 2: bottom (zxcvbnm)
  [{en:'z',kr:'ㅋ',finger:0},{en:'x',kr:'ㅌ',finger:1},{en:'c',kr:'ㅊ',finger:2},{en:'v',kr:'ㅍ',finger:3},{en:'b',kr:'ㅠ',finger:3},{en:'n',kr:'ㅜ',finger:4},{en:'m',kr:'ㅡ',finger:4}]
];

// Reverse lookup: jamo/letter → keyboard position
var _tpCharToKey = {};
(function(){
  for(var r=0;r<_tpKbLayout.length;r++)
    for(var c=0;c<_tpKbLayout[r].length;c++){
      var k=_tpKbLayout[r][c];
      _tpCharToKey[k.en]={row:r,col:c};
      _tpCharToKey[k.kr]={row:r,col:c};
    }
})();

var _tpHandLessons = [
  {id:'home',        kr:'홈 키',     en:'Home Keys'},
  {id:'top',         kr:'윗줄',      en:'Top Row'},
  {id:'bottom',      kr:'아랫줄',    en:'Bottom Row'},
  {id:'home_top',    kr:'홈+윗줄',   en:'Home+Top'},
  {id:'home_bottom', kr:'홈+아랫줄', en:'Home+Bottom'},
  {id:'all',         kr:'전체',      en:'All Keys'}
];

var _tpLessonRows = {
  home:[1], top:[0], bottom:[2],
  home_top:[1,0], home_bottom:[1,2], all:[0,1,2]
};

var _tpHandWords = {
  home:{
    kr:['나라','머리','하나','어머니','놀이','논','몸','말','힘','한','할','함',
        '혼','홈','님','만','먼','알','안','온','일','인','허리','오리',
        '이마','나이','모임','노인','아님','모험','놀','올','얼','민',
        '이리','어미','마님','나','너','오','이','하','마','모','호'],
    en:['ash','dash','flash','glad','half','hall','hash','lad','lass','sad',
        'flag','glass','flask','gash','lash','shall','salad','shag','slag',
        'slash','fall','all','ask','add','fad','gal','gas','had','hag',
        'jag','lag','sag','dad','as','flags','halls','lads','dads','asks',
        'gals','flak','falls','lass','glad','dash','flash','shall','flag']
  },
  top:{
    kr:['개','게','대','배','새','세','제','재','벼','색','백','벽','격','겹',
        '세계','베개','제대','재배','새벽','대세','세대','재개','교대','교제',
        '대대','배색','교배','제게','세배','개벽','겹겹','대게','배게','색'],
    en:['type','rip','tip','top','yet','try','quit','pet','pot','pie',
        'put','rye','wit','wet','you','write','quite','query','equip',
        'tower','quote','trip','wipe','pipe','tire','wire','pour','tour',
        'typo','poetry','pretty','puppy','equity','your','riot','pure']
  },
  bottom:{
    kr:['큰','품','춤','풍','충','출','풀','틈','틀','층','츤','춘',
        '큼','쿵','쭉','쯤','쪽','춤춤','큼큼','풍풍','충충','출출'],
    en:['ban','van','can','man','bun','cub','cab','cut','vim','mix',
        'box','numb','comb','zinc','verb','exam','next','civic','bench',
        'bunch','munch','crumb','cancel','combat','convex','canvas']
  },
  home_top:{
    kr:['사람','나라','바다','기대','사이','시대','미래','다시','사랑','세상',
        '여행','노래','이야기','거리','여기','고대','매일','결혼','비밀','대답',
        '시선','가리','도시','기억','어디','내일','바람','모양','세월','아이',
        '개미','다리','어린이','대한','어머니','나이','머리','놀이','노인','오리'],
    en:['the','his','her','what','your','just','like','right','where',
        'would','their','will','great','still','after','life','first',
        'write','large','while','start','please','eight','light','fight',
        'sight','quite','power','world','this','with','said','that',
        'they','also','people','other','years','state','right','which']
  },
  home_bottom:{
    kr:['하늘','마음','오늘','마을','이름','눈물','물론','흐름','흔히','울림',
        '흐린','논문','나를','아름','칼','탈','콩','통','침','칠','탄','친',
        '풀','품','춤','풍','큰','틈','틀','홈런','온몸','한풀','물음','늘'],
    en:['blank','chunk','flame','black','clash','clunk','flung','bunch','lunch',
        'flash','knack','flunk','drunk','shall','skull','valve','thumb','slang',
        'bland','clang','blush','flush','shank','clam','slam','hang','bank']
  },
  all:{
    kr:['대한민국','컴퓨터','인터넷','사랑','감사','학교','선생님','도서관','행복',
        '여름','겨울','음악','가족','친구','생각','그리고','하지만','그래서',
        '아름다운','자연','건강','평화','세계','미래','현재','과거','연습','타자',
        '키보드','시작','우리','나라','역사','문화','경제','사회','교육','과학',
        '기술','예술','스포츠','꿈','희망','사랑','프로그램','네트워크'],
    en:['the','quick','brown','fox','jumps','over','lazy','dog','practice',
        'typing','keyboard','finger','position','exercise','language','computer',
        'programming','beautiful','wonderful','knowledge','education','important',
        'development','experience','technology','understand','different',
        'everything','beginning','adventure','challenge','discovery','excellent',
        'fantastic','happiness','imagine','journey','original','powerful',
        'question','remember','surprise','together','valuable','something']
  }
};

// ── Bible Word Extraction for Hand Position ──
var _tpBibleWordCache = null;   // { kr:[...], en:[...] }
var _tpHandWordFilterCache = {}; // "lessonId_lang" → [words]

/* 성경 전체에서 고유 단어 추출 (2~8자) */
function _tpBuildBibleWordList(lang){
  var key = lang === 'en' ? 'en' : 'kr';
  if(_tpBibleWordCache && _tpBibleWordCache[key] && _tpBibleWordCache[key].length > 0)
    return _tpBibleWordCache[key];
  if(!_tpBibleWordCache) _tpBibleWordCache = {};

  var data = lang === 'en' ? (typeof KJV !== 'undefined' ? KJV : null)
                           : (typeof BIBLE !== 'undefined' ? BIBLE : null);
  if(!data){ return []; }

  var seen = {};
  var result = [];
  var books = BOOKS.OT.concat(BOOKS.NT);
  for(var bi = 0; bi < books.length; bi++){
    var bd = data[books[bi]];
    if(!bd) continue;
    for(var ch in bd){
      if(!bd.hasOwnProperty(ch)) continue;
      var vs = bd[ch];
      if(!vs) continue;
      for(var vi = 0; vi < vs.length; vi++){
        var raw = vs[vi].replace(/<[^>]+>/g,'').replace(/¶\s*/g,'');
        var tokens = raw.split(/\s+/);
        for(var ti = 0; ti < tokens.length; ti++){
          var w;
          if(lang === 'en'){
            w = tokens[ti].replace(/[^a-zA-Z]/g,'').toLowerCase();
          } else {
            w = tokens[ti].replace(/[^가-힣]/g,'');
          }
          if(w.length >= 2 && w.length <= 8 && !seen[w]){
            seen[w] = true;
            result.push(w);
          }
        }
      }
    }
  }
  _tpBibleWordCache[key] = result;
  return result;
}

/* 단어가 해당 구간의 키만으로 타이핑 가능한지 판정 */
function _tpWordFitsKeys(word, lang, available){
  var shiftMap = {'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ','ㅒ':'ㅐ','ㅖ':'ㅔ'};
  if(lang === 'en'){
    for(var i = 0; i < word.length; i++){
      if(!available[word[i]]) return false;
    }
    return true;
  }
  for(var i = 0; i < word.length; i++){
    var code = word.charCodeAt(i);
    if(code < 0xAC00 || code > 0xD7A3) return false;
    var jamos = _tpFullDecompose(word[i]);
    for(var j = 0; j < jamos.length; j++){
      var jm = jamos[j];
      if(!available[jm] && !(shiftMap[jm] && available[shiftMap[jm]])) return false;
    }
  }
  return true;
}

/* 구간별 필터링된 성경 단어 목록 (캐시) */
function _tpGetHandPosWords(lessonId, lang){
  var cacheKey = lessonId + '_' + (lang === 'en' ? 'en' : 'kr');
  if(_tpHandWordFilterCache[cacheKey]) return _tpHandWordFilterCache[cacheKey];

  var allWords = _tpBuildBibleWordList(lang);
  if(allWords.length === 0){
    // 성경 미로드 → 하드코딩 폴백
    var fk = lang === 'en' ? 'en' : 'kr';
    return _tpHandWords[lessonId] ? _tpHandWords[lessonId][fk] || [] : [];
  }

  // 구간에 해당하는 자모/글자 집합 생성
  var rows = _tpLessonRows[lessonId] || [1];
  var available = {};
  for(var ri = 0; ri < rows.length; ri++){
    var row = _tpKbLayout[rows[ri]];
    for(var ci = 0; ci < row.length; ci++){
      available[row[ci][lang === 'en' ? 'en' : 'kr']] = true;
    }
  }

  var result = [];
  for(var i = 0; i < allWords.length; i++){
    if(_tpWordFitsKeys(allWords[i], lang, available)){
      result.push(allWords[i]);
    }
  }

  // 너무 적으면 하드코딩 폴백 병합
  if(result.length < 10 && _tpHandWords[lessonId]){
    var fk2 = lang === 'en' ? 'en' : 'kr';
    var fallback = _tpHandWords[lessonId][fk2] || [];
    for(var fi = 0; fi < fallback.length; fi++){
      if(result.indexOf(fallback[fi]) < 0) result.push(fallback[fi]);
    }
  }

  _tpHandWordFilterCache[cacheKey] = result;
  return result;
}

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
  speedInterval: null,
  nickname: '',
  rankingView: false,
  rankingData: [],
  rankingFilter: 'all',
  handLesson: 'home'
};

/* ═══ i18n — 타자연습 내부 번역 ═══ */
var _tpStrings = {
  kr: {
    title: '타자 연습',
    langKr: '한글',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    close: '닫기',
    allBible: '전체 성경',
    book: '책',
    chapter: '장',
    favorites: '즐겨찾기',
    folder: '폴더',
    selectBook: '책 선택...',
    selectChapter: '장 선택...',
    selectFolder: '폴더 선택...',
    chapterN: function(n){ return n + '장'; },
    newFolder: '새 폴더',
    folderExists: '이미 존재하는 폴더입니다',
    enterFolderName: '폴더 이름을 입력하세요:',
    deleteFolder: function(n){ return '"' + n + '" 폴더를 삭제하시겠습니까?'; },
    alreadyAdded: '이미 추가된 구절입니다',
    addedToFolder: function(ref, n){ return ref + ' → "' + n + '" 폴더에 추가됨'; },
    removedFromFolder: function(ref, n){ return ref + ' → "' + n + '" 에서 제거됨'; },
    loadingBible: '성경 데이터를 불러오는 중입니다...',
    noFavorites: '즐겨찾기가 비어있습니다. 구절에 하트를 눌러주세요.',
    cannotLoad: '구절을 불러올 수 없습니다',
    selectFolderAdd: '폴더를 선택하고 구절을 추가해주세요',
    selectBook2: '책을 선택해주세요',
    selectChapter2: '장을 선택해주세요',
    cannotFind: '구절을 찾을 수 없습니다. 범위를 확인해주세요.',
    typingComplete: '타이핑 완료!',
    accuracy: '정확도',
    cpmUnit: '타/분',
    timeLabel: '소요 시간',
    charAnalysis: '문자 분석',
    correct: '정확',
    errors: '오류',
    punctuation: '구두점',
    total: '전체',
    charSuffix: '자',
    verses: '구절',
    average: '평균',
    best: '최고',
    totalTime: '총',
    nextVerse: '다음 구절',
    addToFolder: '폴더에 추가',
    pressEnter: 'Enter: 줄바꿈 · Ctrl+Enter: 다음 구절',
    selectFolderLabel: '폴더 선택',
    added: '추가됨',
    createFolder: '새 폴더 만들기',
    enterNewFolder: '새 폴더 이름을 입력하세요:',
    folderCreated: function(n, hasVerse){ return '"' + n + '" 폴더 생성' + (hasVerse ? ' + 구절 추가됨' : ''); },
    startMsg: '설정을 선택한 후 시작 버튼을 눌러주세요',
    start: '시작',
    veryFast: '매우 빠름',
    fast: '빠름',
    normal: '보통',
    slow: '느림',
    perfect: '완벽!',
    excellent: '우수',
    good: '양호',
    needsPractice: '연습 필요',
    prev: '이전',
    bestLabel: '최고',
    nickname: '닉네임',
    nicknamePlaceholder: '닉네임 (2~12자)',
    ranking: '랭킹',
    rankingTitle: '타자 랭킹 TOP 100',
    rankAll: '전체',
    rankKr: '한국어',
    rankEn: '영어',
    rankCol: '순위',
    rankColNickname: '닉네임',
    rankColCpm: 'CPM',
    rankColAcc: '정확도',
    rankColVerse: '구절',
    rankColDate: '날짜',
    rankEmpty: '아직 기록이 없습니다. 첫 번째 랭커가 되어보세요!',
    rankSubmitted: '랭킹에 등록되었습니다!',
    rankUpdated: '새로운 최고 기록! 랭킹이 갱신되었습니다!',
    rankNotBest: '기존 기록보다 낮아 갱신되지 않았습니다',
    rankError: '랭킹 등록 중 오류가 발생했습니다',
    rankNeedLogin: '랭킹 등록은 로그인이 필요합니다',
    rankLoading: '랭킹을 불러오는 중...',
    rankBack: '돌아가기',
    myRank: '내 순위',
    noNickname: '닉네임을 입력해주세요',
    score: '점수',
    rankColScore: '점수',
    scoreFormula: function(cpm, acc, sc){ return cpm + ' 타/분 × ' + acc + '% = ' + sc; },
    handPos: '손 자리',
    handPosTitle: '손 자리 연습',
    selectLesson: '연습 구간'
  },
  en: {
    title: 'Typing Practice',
    langKr: '한글',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    close: 'Close',
    allBible: 'All Bible',
    book: 'Book',
    chapter: 'Chapter',
    favorites: 'Favorites',
    folder: 'Folder',
    selectBook: 'Select book...',
    selectChapter: 'Select chapter...',
    selectFolder: 'Select folder...',
    chapterN: function(n){ return 'Ch. ' + n; },
    newFolder: 'New Folder',
    folderExists: 'Folder already exists',
    enterFolderName: 'Enter folder name:',
    deleteFolder: function(n){ return 'Delete folder "' + n + '"?'; },
    alreadyAdded: 'Verse already added',
    addedToFolder: function(ref, n){ return ref + ' → added to "' + n + '"'; },
    removedFromFolder: function(ref, n){ return ref + ' → removed from "' + n + '"'; },
    loadingBible: 'Loading Bible data...',
    noFavorites: 'No favorites yet. Tap the heart icon on a verse.',
    cannotLoad: 'Cannot load verse',
    selectFolderAdd: 'Select a folder and add verses',
    selectBook2: 'Please select a book',
    selectChapter2: 'Please select a chapter',
    cannotFind: 'Cannot find verse. Please check the range.',
    typingComplete: 'Typing Complete!',
    accuracy: 'Accuracy',
    cpmUnit: 'CPM',
    timeLabel: 'Time',
    charAnalysis: 'Character Analysis',
    correct: 'Correct',
    errors: 'Errors',
    punctuation: 'Punct.',
    total: 'Total',
    charSuffix: '',
    verses: 'verses',
    average: 'Avg',
    best: 'Best',
    totalTime: 'Total',
    nextVerse: 'Next Verse',
    addToFolder: 'Add to folder',
    pressEnter: 'Enter: line break · Ctrl+Enter: next verse',
    selectFolderLabel: 'Select Folder',
    added: 'Added',
    createFolder: 'Create New Folder',
    enterNewFolder: 'Enter new folder name:',
    folderCreated: function(n, hasVerse){ return '"' + n + '" folder created' + (hasVerse ? ' + verse added' : ''); },
    startMsg: 'Choose settings and press Start',
    start: 'Start',
    veryFast: 'Blazing',
    fast: 'Fast',
    normal: 'Normal',
    slow: 'Slow',
    perfect: 'Perfect!',
    excellent: 'Excellent',
    good: 'Good',
    needsPractice: 'Keep trying',
    prev: 'Prev',
    bestLabel: 'Best',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Nickname (2-12 chars)',
    ranking: 'Ranking',
    rankingTitle: 'Typing Ranking TOP 100',
    rankAll: 'All',
    rankKr: 'Korean',
    rankEn: 'English',
    rankCol: 'Rank',
    rankColNickname: 'Nickname',
    rankColCpm: 'CPM',
    rankColAcc: 'Accuracy',
    rankColVerse: 'Verse',
    rankColDate: 'Date',
    rankEmpty: 'No records yet. Be the first to rank!',
    rankSubmitted: 'Score submitted to ranking!',
    rankUpdated: 'New personal best! Ranking updated!',
    rankNotBest: 'Score not updated (lower than your best)',
    rankError: 'Error submitting to ranking',
    rankNeedLogin: 'Login required for ranking',
    rankLoading: 'Loading rankings...',
    rankBack: 'Back',
    myRank: 'My Rank',
    noNickname: 'Please enter a nickname',
    score: 'Score',
    rankColScore: 'Score',
    scoreFormula: function(cpm, acc, sc){ return cpm + ' CPM × ' + acc + '% = ' + sc; },
    handPos: 'Hand Pos.',
    handPosTitle: 'Hand Position',
    selectLesson: 'Lesson'
  }
};
function _tpT(key){ var v = _tpStrings[_tp.lang][key]; return v !== undefined ? v : (_tpStrings.kr[key] !== undefined ? _tpStrings.kr[key] : key); }

/* Helper: get English book name when in EN mode */
function _tpBookName(krName){
  if(_tp.lang === 'en' && typeof BOOK_EN !== 'undefined' && BOOK_EN[krName]) return BOOK_EN[krName];
  return krName;
}
function _tpBookShort(krName){
  if(_tp.lang === 'en' && typeof BOOK_EN !== 'undefined' && BOOK_EN[krName]){
    var en = BOOK_EN[krName];
    // Short English: "1 Corinthians" → "1Co", "Genesis" → "Gen"
    return en.length <= 5 ? en : en.replace(/^(\d?\s?)(\w{3}).*/, '$1$2');
  }
  return BOOK_SHORT[krName] || krName;
}

/* ═══ Typing Sound ═══ */
var _tpBufs = { keyQ:null, keyA:null, keyZ:null, space:null, enter:null, back:null, ending:null, bell:null };
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
  load('typing%20sound/key%20q%20line.mp3', 'keyQ');
  load('typing%20sound/key%20a%20line.mp3', 'keyA');
  load('typing%20sound/key%20z%20line.mp3', 'keyZ');
  load('typing%20sound/space.mp3', 'space');
  load('typing%20sound/enter%20sound.mp3', 'enter');
  load('typing%20sound/back%20space.mp3', 'back');
  load('typing%20sound/ending%20sound.mp3', 'ending');
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

/* ── 키보드 행 감지 (물리적 위치 기반) ── */
var _tpKeyRow = {};
(function(){
  var rows = {
    num: ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backquote'],
    q: ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
    a: ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote'],
    z: ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']
  };
  for(var r in rows) for(var i = 0; i < rows[r].length; i++) _tpKeyRow[rows[r][i]] = r;
})();

/* 키 타격: 행별 개별 사운드 파일 */
function _tpPlayKeySound(code){
  var row = _tpKeyRow[code] || 'a';
  if(row === 'q' || row === 'num'){
    _tpPlayBuf(_tpBufs.keyQ, 0.97 + Math.random() * 0.06, 0.8);
  } else if(row === 'z'){
    _tpPlayBuf(_tpBufs.keyZ, 0.97 + Math.random() * 0.06, 0.8);
  } else {
    _tpPlayBuf(_tpBufs.keyA, 0.97 + Math.random() * 0.06, 0.8);
  }
}

/* 오타: 벨 사운드 */
function _tpPlayErrorSound(){
  _tpPlayBuf(_tpBufs.bell, 0.7, 0.06);
}

/* 스페이스바 */
function _tpPlaySpaceSound(){
  _tpPlayBuf(_tpBufs.space, 1.0, 0.8);
}

/* 백스페이스 */
function _tpPlayBackSound(){
  _tpPlayBuf(_tpBufs.back, 1.0, 0.8);
}

/* 엔터키 */
function _tpPlayLeverSound(){
  _tpPlayBuf(_tpBufs.enter, 1.0, 0.8);
}

/* 완성 사운드 */
function _tpPlayFinishSound(){
  _tpPlayBuf(_tpBufs.ending, 1.0, 1.0);
}

/* ═══ Punctuation skip helper ═══ */
var _tpPunctuation = /^[,.\-;:!?'"''""·…「」『』《》〈〉\(\)\[\]\/\\~@#$%^&*+=|`{}«»‹›〝〞〟＂＇]$/;
function _tpIsPunct(ch){ return _tpPunctuation.test(ch); }

/* 자모 기반 타수 계산 (한컴타자연습 방식: 가=2타, 한=3타, 영문/공백=1타) */
function _tpCountJamo(text){
  var count = 0;
  for(var i = 0; i < text.length; i++) count += _tpDecompose(text[i]).length;
  return count;
}
// 스킵된 글자를 제외한 자모 수
function _tpCountJamoExcludeSkips(typed){
  if(!_tp.wordSkips || !_tp.verse) return _tpCountJamo(typed);
  var result = _tpBuildMapping(_tp.verse.text, typed);
  var count = 0;
  for(var i = 0; i < result.map.length; i++){
    var ti = result.map[i];
    if(ti >= 0 && !_tp.wordSkips[ti]){
      count += _tpDecompose(typed[i]).length;
    }
  }
  return count;
}

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

/* ═══ Hangul Jamo Decomposition (자모 분해) ═══ */
var _tpCho = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
var _tpJung = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
var _tpJong = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function _tpDecompose(ch){
  var code = ch.charCodeAt(0);
  // 완성형 한글 (가~힣)
  if(code >= 0xAC00 && code <= 0xD7A3){
    var offset = code - 0xAC00;
    var cho = Math.floor(offset / (21 * 28));
    var jung = Math.floor((offset % (21 * 28)) / 28);
    var jong = offset % 28;
    var result = [_tpCho[cho], _tpJung[jung]];
    if(jong > 0) result.push(_tpJong[jong]);
    return result;
  }
  // 자모 단독 (ㄱ~ㅎ, ㅏ~ㅣ)
  if((code >= 0x3131 && code <= 0x314E) || (code >= 0x314F && code <= 0x3163)){
    return [ch];
  }
  return [ch];
}

// 복합 모음 분해 맵 (ㅘ=ㅗ+ㅏ 등)
var _tpCompJung = {
  'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅐ'], 'ㅚ':['ㅗ','ㅣ'],
  'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅔ'], 'ㅟ':['ㅜ','ㅣ'],
  'ㅢ':['ㅡ','ㅣ']
};

// 복합 종성 분해 맵 (ㄶ=ㄴ+ㅎ, ㄺ=ㄹ+ㄱ 등)
var _tpCompJong = {
  'ㄳ':['ㄱ','ㅅ'], 'ㄵ':['ㄴ','ㅈ'], 'ㄶ':['ㄴ','ㅎ'],
  'ㄺ':['ㄹ','ㄱ'], 'ㄻ':['ㄹ','ㅁ'], 'ㄼ':['ㄹ','ㅂ'],
  'ㄽ':['ㄹ','ㅅ'], 'ㄾ':['ㄹ','ㅌ'], 'ㄿ':['ㄹ','ㅍ'],
  'ㅀ':['ㄹ','ㅎ'], 'ㅄ':['ㅂ','ㅅ']
};

// 자모 단위로 일치 여부 확인 (조합 중 부분 비교)
// nextTarget: 다음 글자 (종성→초성 전환 판정용, 생략 가능)
function _tpJamoMatch(typed, target, nextTarget){
  var tj = _tpDecompose(_tpNorm(typed));
  var gj = _tpDecompose(_tpNorm(target));
  for(var i = 0; i < tj.length; i++){
    if(i >= gj.length){
      // 초과 자모 — 다음 글자 초성과 일치하면 전환 상태 (오타 아님)
      if(nextTarget && i === gj.length && tj.length === gj.length + 1){
        var nj = _tpDecompose(_tpNorm(nextTarget));
        if(nj.length > 0 && tj[i] === nj[0]) return 'partial';
      }
      return 'wrong';
    }
    if(tj[i] !== gj[i]){
      // 복합 모음 부분 입력 체크 (ㅜ → ㅟ 등)
      if(i === 1 && _tpCompJung[gj[i]] && _tpCompJung[gj[i]][0] === tj[i] && i === tj.length - 1){
        return 'partial';
      }
      // 복합 종성 전환 체크 (ㄴ→ㄶ, ㄹ→ㄺ 등 — 다음 글자 초성이 합쳐진 경우)
      if(i >= 2 && i === tj.length - 1 && nextTarget && _tpCompJong[tj[i]]){
        var cParts = _tpCompJong[tj[i]];
        if(cParts[0] === gj[i]){
          var nj3 = _tpDecompose(_tpNorm(nextTarget));
          if(nj3.length > 0 && cParts[1] === nj3[0]) return 'partial';
        }
      }
      return 'wrong';
    }
  }
  return tj.length === gj.length ? 'correct' : 'partial';
}

/* Build a mapping from typed position → target position, skipping punctuation.
   Uses lookahead to recover from insertions (extra wrong chars) so that
   subsequent correct chars still align with their target positions. */
function _tpBuildMapping(target, typed){
  var map = [];         // map[typedIdx] = targetIdx (-1 = insertion/extra)
  var targetSkip = [];  // which target chars are skipped (punctuation, auto-matched)
  var ti = 0;           // target index

  for(var pi = 0; pi < typed.length; pi++){
    // Skip over target punctuation that user didn't type
    while(ti < target.length && _tpIsPunct(target[ti]) && !_tpMatch(typed[pi], target[ti])){
      targetSkip.push(ti);
      ti++;
    }

    if(ti < target.length && _tpMatch(typed[pi], target[ti])){
      // Direct match
      map.push(ti);
      ti++;
    } else if(typed[pi] === ' ' && ti < target.length && target[ti] !== ' '){
      // 스페이스가 비공백 타겟에 대응 → 삽입 처리 (타겟 소비 안 함)
      map.push(-1);
    } else {
      // Mismatch: lookahead — if a future typed char matches current target,
      // treat this typed char as an insertion (don't consume target position)
      var isInsertion = false;
      if(ti < target.length){
        for(var look = pi + 1; look < typed.length && look <= pi + 3; look++){
          if(typed[look] === ' ') continue; // 스페이스는 lookahead 대상에서 제외
          if(_tpMatch(typed[look], target[ti])){
            isInsertion = true;
            break;
          }
        }
      }

      if(isInsertion){
        // Insertion: wrong char, target position NOT consumed
        map.push(-1);
      } else {
        // Substitution: wrong char at this target position
        map.push(ti < target.length ? ti : -1);
        if(ti < target.length) ti++;
      }
    }
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
  _tpUpdateHeaderLang();
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
    // 테스트 폴더 자동 생성
    if(!_tp.folders['테스트']){
      var s7 = ''; for(var ii=0;ii<200;ii++) s7+='7';
      _tp.folders['테스트'] = ['custom_'+encodeURIComponent(s7)];
      _tpSaveFolders();
    }
    var bc = localStorage.getItem('tp_bestCpm');
    if(bc) _tp.bestCpm = parseInt(bc) || 0;
    var tt = localStorage.getItem('tp_theme');
    if(tt) _tp.tpTheme = tt;
    var nn = localStorage.getItem('tp_nickname');
    if(nn) _tp.nickname = nn;
  } catch(e){}
}
function _tpSaveNickname(){
  try { localStorage.setItem('tp_nickname', _tp.nickname); } catch(e){}
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
    btn.title = _tp.tpTheme === 'dark' ? _tpT('lightMode') : _tpT('darkMode');
  }
}

/* ═══ Language ═══ */
function _tpSetLang(lang){
  _tp.lang = lang;
  document.getElementById('tpLangKr')?.classList.toggle('active', lang==='kr');
  document.getElementById('tpLangEn')?.classList.toggle('active', lang==='en');
  // Update header text
  _tpUpdateHeaderLang();
  if(lang === 'en' && !KJV && typeof loadBibleEN === 'function'){
    loadBibleEN().then(function(){
      _tp.verse = null; _tp.started = false; _tpStopTimer();
      _tpRenderSettings(); _tpRenderBody();
    });
    return;
  }
  _tp.verse = null; _tp.started = false; _tpStopTimer();
  _tpRenderSettings(); _tpRenderBody();
}
function _tpUpdateHeaderLang(){
  var titleEl = document.querySelector('#typingOverlay .tp-title');
  if(titleEl) titleEl.innerHTML = '<i class="fa fa-keyboard"></i> ' + _tpT('title');
  var themeBtn = document.getElementById('tpThemeBtn');
  if(themeBtn) themeBtn.title = _tp.tpTheme === 'dark' ? _tpT('lightMode') : _tpT('darkMode');
  var closeBtn = document.querySelector('#typingOverlay .tp-close');
  if(closeBtn) closeBtn.title = _tpT('close');
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
function _tpOnLessonChange(){
  _tp.handLesson = document.getElementById('tpLessonSel')?.value || 'home';
}

/* ═══ Settings Render ═══ */
function _tpRenderSettings(){
  var el = document.getElementById('tpSettings');
  if(!el) return;

  var sources = [
    {id:'all',     label:_tpT('allBible'), icon:'fa-bible'},
    {id:'book',    label:_tpT('book'),     icon:'fa-book'},
    {id:'chapter', label:_tpT('chapter'),  icon:'fa-file-alt'},
    {id:'hearts',  label:_tpT('favorites'),icon:'fa-heart'},
    {id:'folder',  label:_tpT('folder'),   icon:'fa-folder'},
    {id:'handpos', label:_tpT('handPos'), icon:'fa-hand-paper'}
  ];
  var h = '<div class="tp-source-row">';
  sources.forEach(function(s){
    h += '<button class="tp-src-btn'+(_tp.source===s.id?' active':'')+'" onclick="_tpSetSource(\''+s.id+'\')"><i class="fa '+s.icon+'"></i> '+s.label+'</button>';
  });
  h += '</div>';

  // Book / Chapter selectors
  if(_tp.source === 'book' || _tp.source === 'chapter'){
    h += '<div class="tp-sel-row">';
    h += '<select class="tp-select" id="tpBookSel" onchange="_tpOnBookChange()"><option value="">'+_tpT('selectBook')+'</option>';
    var allBooks = BOOKS.OT.concat(BOOKS.NT);
    allBooks.forEach(function(b){
      h += '<option value="'+b+'"'+(_tp.book===b?' selected':'')+'>'+_tpBookName(b)+'</option>';
    });
    h += '</select>';
    if(_tp.source === 'chapter' && _tp.book){
      var cnt = CHCNT[_tp.book] || 1;
      h += '<select class="tp-select" id="tpChSel" onchange="_tpOnChChange()"><option value="">'+_tpT('selectChapter')+'</option>';
      for(var i=1; i<=cnt; i++){
        h += '<option value="'+i+'"'+(_tp.ch===i?' selected':'')+'>'+_tpT('chapterN')(i)+'</option>';
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
      h += '<select class="tp-select" id="tpFolderSel" onchange="_tpOnFolderChange()"><option value="">'+_tpT('selectFolder')+'</option>';
      fnames.forEach(function(n){
        var c = _tp.folders[n].length;
        h += '<option value="'+n+'"'+(_tp.folderName===n?' selected':'')+'>'+n+' ('+c+')</option>';
      });
      h += '</select>';
    }
    h += '<button class="tp-small-btn" onclick="_tpCreateFolder()"><i class="fa fa-plus"></i> '+_tpT('newFolder')+'</button>';
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
        var short = _tpBookShort(p[0]);
        h += '<span class="tp-folder-tag">'+short+' '+p[1]+':'+p[2]+' <i class="fa fa-times" onclick="_tpRemoveFromFolder('+idx+')"></i></span>';
      });
      h += '</div>';
    }
  }

  // Hand position lesson selector
  if(_tp.source === 'handpos'){
    h += '<div class="tp-sel-row">';
    h += '<label style="font-size:12px;color:var(--text2);font-weight:600">' + _tpT('selectLesson') + '</label>';
    h += '<select class="tp-select" id="tpLessonSel" onchange="_tpOnLessonChange()">';
    _tpHandLessons.forEach(function(les){
      var name = _tp.lang === 'en' ? les.en : les.kr;
      h += '<option value="'+les.id+'"'+(_tp.handLesson===les.id?' selected':'')+'>'+name+'</option>';
    });
    h += '</select>';
    h += '</div>';
  }

  // 관리자 메뉴 (관리자 UID만 표시)
  if(_tpIsAdmin()){
    h += '<div class="tp-admin-row">';
    h += '<span class="tp-admin-label">관리</span>';
    h += '<button class="tp-small-btn" onclick="_tpTestEffect(0)" style="font-size:10px">🔥 Off</button>';
    h += '<button class="tp-small-btn" onclick="_tpTestEffect(700)" style="font-size:10px">🔥 700</button>';
    h += '<button class="tp-small-btn" onclick="_tpTestEffect(900)" style="font-size:10px">🔥 900</button>';
    h += '<button class="tp-small-btn tp-admin-del" onclick="_tpAdminClearRankings()">🗑 랭킹 초기화</button>';
    h += '</div>';
  }

  el.innerHTML = h;
}

/* ═══ Admin: Clear Rankings ═══ */
function _tpAdminClearRankings(){
  if(!confirm('랭킹 데이터를 모두 삭제합니다. 계속하시겠습니까?')) return;
  if(!confirm('정말로 삭제합니다. 되돌릴 수 없습니다!')) return;
  if(!window._tpRanking || !window._tpRanking.clearAll){
    toast('랭킹 모듈이 로드되지 않았습니다.');
    return;
  }
  window._tpRanking.clearAll().then(function(result){
    if(result === 'no_auth') toast('로그인이 필요합니다.');
    else if(result === 'error') toast('삭제 중 오류가 발생했습니다.');
    else toast('랭킹 ' + result + '개 삭제 완료');
    // 랭킹 뷰가 열려있으면 새로고침
    if(_tp.rankingView) _tpLoadRankings();
  });
}

function _tpTestEffect(speed){
  _tp.speedGauge = speed;
  _tp._testEffect = speed > 0;
  _tpTickSpeedGauge();
}

/* ═══ Folder CRUD ═══ */
function _tpCreateFolder(){
  var name = prompt(_tpT('enterFolderName'));
  if(!name || !name.trim()) return;
  var n = name.trim();
  if(_tp.folders[n]){ toast(_tpT('folderExists')); return; }
  _tp.folders[n] = [];
  _tp.folderName = n;
  _tpSaveFolders();
  _tpRenderSettings();
}
function _tpDeleteFolder(){
  if(!_tp.folderName) return;
  if(!confirm(_tpT('deleteFolder')(_tp.folderName))) return;
  delete _tp.folders[_tp.folderName];
  _tp.folderName = null;
  _tpSaveFolders();
  _tpRenderSettings();
}
function _tpAddToFolder(name){
  if(!_tp.verse || !name) return;
  var key = _tp.verse.key;
  if(!_tp.folders[name]) _tp.folders[name] = [];
  if(_tp.folders[name].indexOf(key) >= 0){ toast(_tpT('alreadyAdded')); return; }
  _tp.folders[name].push(key);
  _tpSaveFolders();
  toast(_tpT('addedToFolder')(_tp.verse.ref, name));
}
function _tpRemoveFromFolder(idx){
  if(!_tp.folderName || !_tp.folders[_tp.folderName]) return;
  _tp.folders[_tp.folderName].splice(idx, 1);
  _tpSaveFolders();
  _tpRenderSettings();
}

/* ═══ Hand Position Verse ═══ */
function _tpNextHandPosVerse(){
  var lessonId = _tp.handLesson || 'home';
  var lang = _tp.lang;
  var rows = _tpLessonRows[lessonId] || [1];
  // Collect jamo/letters available in this lesson
  var chars = [];
  for(var ri = 0; ri < rows.length; ri++){
    var row = _tpKbLayout[rows[ri]];
    for(var ci = 0; ci < row.length; ci++){
      chars.push(lang === 'en' ? row[ci].en : row[ci].kr);
    }
  }
  // Generate 15~25 random individual characters (no spaces)
  var count = 15 + Math.floor(Math.random() * 11);
  var picked = [];
  for(var i = 0; i < count; i++){
    picked.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  var text = picked.join('');
  var lessonName = '';
  for(var li = 0; li < _tpHandLessons.length; li++){
    if(_tpHandLessons[li].id === lessonId){
      lessonName = lang === 'en' ? _tpHandLessons[li].en : _tpHandLessons[li].kr;
      break;
    }
  }
  _tp.verse = {
    book:'handpos', ch:lessonId, v:1,
    text:text, key:'handpos_'+lessonId+'_1',
    ref:lessonName, fullBook:_tpT('handPosTitle')
  };
  _tpBeginTyping();
}

/* ═══ Verse Selection ═══ */
function _tpNextVerse(){
  if(_tp.source === 'handpos'){ _tpNextHandPosVerse(); return; }
  var data = _tp.lang === 'en' ? KJV : BIBLE;
  if(!data){
    if(_tp.lang === 'en' && typeof loadBibleEN === 'function'){
      loadBibleEN().then(_tpNextVerse);
    } else {
      toast(_tpT('loadingBible'));
    }
    return;
  }

  // Hearts source
  if(_tp.source === 'hearts'){
    var hkeys = Object.keys(_tp.hearts);
    if(hkeys.length === 0){ toast(_tpT('noFavorites')); return; }
    var hk = hkeys[Math.floor(Math.random() * hkeys.length)];
    _tp.verse = _tpVerseFromKey(hk);
    if(!_tp.verse){ toast(_tpT('cannotLoad')); return; }
    _tpBeginTyping(); return;
  }

  // Folder source
  if(_tp.source === 'folder'){
    if(!_tp.folderName || !_tp.folders[_tp.folderName] || _tp.folders[_tp.folderName].length === 0){
      toast(_tpT('selectFolderAdd')); return;
    }
    var fkeys = _tp.folders[_tp.folderName];
    var pool = fkeys.slice();
    // Heart weighting
    fkeys.forEach(function(k){ if(_tp.hearts[k]) for(var i=0;i<3;i++) pool.push(k); });
    var fk = pool[Math.floor(Math.random() * pool.length)];
    _tp.verse = _tpVerseFromKey(fk);
    if(!_tp.verse){ toast(_tpT('cannotLoad')); return; }
    _tpBeginTyping(); return;
  }

  // All / Book / Chapter source
  if((_tp.source === 'book' || _tp.source === 'chapter') && !_tp.book){
    toast(_tpT('selectBook2')); return;
  }
  if(_tp.source === 'chapter' && !_tp.ch){
    toast(_tpT('selectChapter2')); return;
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

    var text = vs[vIdx].replace(/<[^>]+>/g, '').replace(/¶\s*/g, '')
      .replace(/[\u0022\u0027\u0060\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A\u301D\u301E\u301F\uFF02\uFF07]/g, '')
      .replace(/\s{2,}/g, ' ').trim();
    if(!text || text.length < 3) continue;

    _tp.history.push(key);
    if(_tp.history.length > 20) _tp.history.shift();

    var short = _tpBookShort(book);
    _tp.verse = { book:book, ch:ch, v:vIdx+1, text:text, key:key, ref:short+' '+ch+':'+(vIdx+1), fullBook:_tpBookName(book) };
    _tpBeginTyping();
    return;
  }

  toast(_tpT('cannotFind'));
}

function _tpVerseFromKey(key){
  // 커스텀 구절: custom_텍스트
  if(key.indexOf('custom_') === 0){
    var ctext = decodeURIComponent(key.slice(7));
    return { book:'custom', ch:'1', v:1, text:ctext, key:key, ref:'Test', fullBook:'Test' };
  }
  var p = key.split('_');
  if(p.length < 3) return null;
  var book = p[0], ch = p[1], v = parseInt(p[2]);
  var data = _tp.lang === 'en' ? KJV : BIBLE;
  var raw = data && data[book] && data[book][ch] && data[book][ch][v-1];
  if(!raw) return null;
  var text = raw.replace(/<[^>]+>/g, '').replace(/¶\s*/g, '')
    .replace(/[\u0022\u0027\u0060\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A\u301D\u301E\u301F\uFF02\uFF07]/g, '')
    .replace(/\s{2,}/g, ' ').trim();
  if(!text) return null;
  var short = _tpBookShort(book);
  return { book:book, ch:ch, v:v, text:text, key:key, ref:short+' '+ch+':'+v, fullBook:_tpBookName(book) };
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
  _tp.wordSkips = {};
  _tp.hpCursor = 0;
  _tp.hpCorrect = 0;
  _tp.hpWrong = 0;
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
  // Handpos uses keydown handler, skip normal input processing
  if(_tp.source === 'handpos'){ ta.value = ''; return; }

  var prev = _tp.typed;
  _tp.typed = ta.value;

  // 기호 입력 무시: 오타로 인식하지 않고 자동 제거
  if(!_tp.composing){
    var cleaned = _tp.typed.replace(/[\[\]{};':"<>,\.\/\?\u2018\u2019\u201C\u201D\u201A\u201E\u00AB\u00BB]/g, '');
    if(cleaned !== _tp.typed){
      _tp.typed = cleaned;
      ta.value = cleaned;
    }
  }

  // Error sound + speed tracking
  var now = Date.now();
  if(!_tp.composing && _tp.typed.length > prev.length){
    for(var ki = 0; ki < _tp.typed.length - prev.length; ki++) _tp.recentKeys.push(now);
    _tp.lastInputTime = now;
    var result = _tpBuildMapping(_tp.verse.text, _tp.typed);
    var lastIdx = _tp.typed.length - 1;
    var mappedTarget = result.map[lastIdx];
    // 스페이스는 자체 사운드가 있으므로 오타 사운드 제외
    if(_tp.typed[lastIdx] !== ' ' && mappedTarget >= 0 && !_tpMatch(_tp.typed[lastIdx], _tp.verse.text[mappedTarget])){
      _tpPlayErrorSound();
    }
  }
  // 조합 중에도 자모 단위 오타 감지 — 입력 변경 즉시 체크
  if(_tp.composing && _tp.typed.length > 0 && prev !== _tp.typed){
    _tp.lastInputTime = now;
    if(!_tp.recentKeys.length || _tp.recentKeys[_tp.recentKeys.length-1] !== now){
      _tp.recentKeys.push(now);
    }
    var evalLen = Math.max(0, _tp.typed.length - 1);
    var cResult = _tpBuildMapping(_tp.verse.text, _tp.typed.slice(0, evalLen));
    var cTarget = cResult.nextTarget;
    var composingCh = _tp.typed.slice(evalLen);
    if(cTarget < _tp.verse.text.length && composingCh && composingCh !== ' '){
      var nextCh2 = (cTarget + 1 < _tp.verse.text.length) ? _tp.verse.text[cTarget + 1] : null;
      var jamoState = _tpJamoMatch(composingCh, _tp.verse.text[cTarget], nextCh2);
      if(jamoState === 'wrong') _tpPlayErrorSound();
    }
  }

  // 연속 오타 6자 제한: 더 이상 앞으로 진행 불가 (백스페이스로 수정 필요)
  if(!_tp.composing && _tp.typed.length > prev.length){
    var chkResult = _tpBuildMapping(_tp.verse.text, _tp.typed);
    var wrongRun = 0;
    for(var w = chkResult.map.length - 1; w >= 0; w--){
      var wti = chkResult.map[w];
      if(wti === -1 || (wti >= 0 && !_tpMatch(_tp.typed[w], _tp.verse.text[wti]))){
        wrongRun++;
      } else { break; }
    }
    if(wrongRun >= 6){
      _tp.typed = prev;
      ta.value = prev;
      return;
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
      _tpPlayFinishSound();
      if(_tp.source === 'handpos'){
        // Quick stats flash then auto-next
        var _hpElapsed = _tp.startTime ? (Date.now() - _tp.startTime) / 1000 : 0;
        var _hpMin = _hpElapsed / 60;
        var _hpJamo = _tpCountJamoExcludeSkips(_tp.typed);
        var _hpCpm = _hpMin > 0 ? Math.round(_hpJamo / _hpMin) : 0;
        var _hpRes = _tpBuildMapping(_tp.verse.text, _tp.typed);
        var _hpOk = 0;
        for(var _hi = 0; _hi < _hpRes.map.length; _hi++){ if(_hpRes.map[_hi] >= 0 && _tpMatch(_tp.typed[_hi], _tp.verse.text[_hpRes.map[_hi]])) _hpOk++; }
        var _hpAcc = _tp.typed.length > 0 ? Math.round(_hpOk / _tp.typed.length * 100) : 100;
        _tp.sessionVerses++;
        _tp.sessionAccSum += _hpAcc;
        _tp.sessionTime += _hpElapsed;
        if(_hpCpm > _tp.bestCpm){ _tp.bestCpm = _hpCpm; _tpSaveBestCpm(); }
        toast(_hpCpm + ' ' + _tpT('cpmUnit') + ' · ' + _hpAcc + '% ' + _tpT('accuracy'), 1500);
        setTimeout(function(){ _tpNextHandPosVerse(); }, 800);
      } else {
        _tpShowResults();
      }
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

  // 커서가 뒤로 돌아가면 해당 위치 이후의 스킵 기록 삭제
  // → 다시 쳐서 맞추면 초록색(correct)으로 표시됨
  if(_tp.wordSkips){
    var cursor = result.nextTarget;
    for(var wsi in _tp.wordSkips){
      if(parseInt(wsi) >= cursor) delete _tp.wordSkips[wsi];
    }
  }

  var matchedSet = {};  // targetIdx → 'correct' | 'wrong'
  var wrongChars = {};  // targetIdx → 실제 입력한 글자 (오타 표시용)
  var skippedSet = {};  // targetIdx → true (auto-skipped punctuation)

  for(var p = 0; p < result.map.length; p++){
    var ti = result.map[p];
    if(ti >= 0){
      if(_tpMatch(typed[p], target[ti])){
        matchedSet[ti] = 'correct';
      } else {
        matchedSet[ti] = 'wrong';
        wrongChars[ti] = typed[p];
      }
    }
  }
  for(var s = 0; s < result.skipped.length; s++){
    skippedSet[result.skipped[s]] = true;
  }

  var cursorTarget = result.nextTarget;

  // 조합 중인 글자 추출
  var composingText = (_tp.composing && typed.length > evalLen) ? typed.slice(evalLen) : '';

  // 조합 중 자모 단위 일치 판정
  var composingState = ''; // 'partial' | 'correct' | 'wrong' | ''
  if(_tp.composing && composingText && cursorTarget < target.length){
    var nextCh = (cursorTarget + 1 < target.length) ? target[cursorTarget + 1] : null;
    composingState = _tpJamoMatch(composingText, target[cursorTarget], nextCh);
  }

  for(var i = 0; i < spans.length; i++){
    var span = spans[i];
    var origChar = target[i] === ' ' ? '\u00a0' : target[i];

    if(_tp.wordSkips && _tp.wordSkips[i] && (matchedSet[i] === 'correct' || skippedSet[i])){
      span.className = 'tp-char tp-word-skip';
      span.textContent = origChar;
    } else if(matchedSet[i] === 'correct'){
      var wasCorrect = span.classList.contains('tp-correct');
      span.className = 'tp-char tp-correct' + (!wasCorrect ? ' tp-punch' : '');
      span.textContent = origChar;
    } else if(matchedSet[i] === 'wrong'){
      var wasWrong = span.classList.contains('tp-wrong');
      span.className = 'tp-char tp-wrong' + (!wasWrong ? ' tp-punch-err' : '');
      span.textContent = wrongChars[i] || origChar;
    } else if(skippedSet[i]){
      var wasSkip = span.classList.contains('tp-correct');
      span.className = 'tp-char tp-correct' + (!wasSkip ? ' tp-punch' : '');
      span.textContent = origChar;
    } else if(_tp.composing && i === cursorTarget && composingText){
      // 자모 단위 실시간 표시: 맞으면 파란색, 틀리면 빨간색
      span.textContent = composingText;
      if(composingState === 'wrong'){
        span.className = 'tp-char tp-composing-wrong';
      } else {
        span.className = 'tp-char tp-composing';
      }
    } else {
      span.className = 'tp-char';
      span.textContent = origChar;
    }
  }

  // Handpos: mark current char with tp-hp-current for single-char display
  if(_tp.source === 'handpos'){
    for(var hi = 0; hi < spans.length; hi++){
      spans[hi].classList.remove('tp-hp-current');
    }
    // Find the real current char (skip spaces for display)
    var hpCur = cursorTarget;
    if(hpCur < target.length && target[hpCur] === ' ') hpCur++; // peek ahead past space
    if(hpCur < spans.length && !matchedSet[hpCur] && !skippedSet[hpCur]){
      // Only if it's not composing (composing already shown)
      if(!(_tp.composing && hpCur === cursorTarget && composingText)){
        spans[hpCur].classList.add('tp-hp-current');
      }
    }
    // Also mark composing char as current for visibility
    if(_tp.composing && cursorTarget < spans.length && composingText){
      spans[cursorTarget].classList.add('tp-hp-current');
    }
  }

  // 커서 위치: 조합 시작 즉시 해당 글자 오른쪽으로 이동
  var cursorPos = cursorTarget;
  if(_tp.composing && composingText){
    cursorPos = cursorTarget + 1;
  }
  _tpMoveCursor(container, spans, cursorPos, target);

  // Hand position: highlight next key on keyboard
  if(_tp.source === 'handpos') _tpHighlightNextKey(cursorTarget);
}

function _tpMoveCursor(container, spans, cursorIdx, target){
  var cursor = container.querySelector('.tp-caret');
  if(!cursor){
    cursor = document.createElement('div');
    cursor.className = 'tp-caret';
    container.appendChild(cursor);
  }

  var cRect = container.getBoundingClientRect();

  // 커서 굵기: 첫 글자 또는 공백 다음 → 굵게, 그 외 → 가늘게
  var isThick = cursorIdx === 0 ||
    (target && cursorIdx > 0 && cursorIdx <= target.length && target[cursorIdx - 1] === ' ');
  var cursorW = isThick ? 4 : 2.5;
  cursor.style.width = cursorW + 'px';

  if(cursorIdx > 0 && cursorIdx <= spans.length){
    var prevRect = spans[cursorIdx - 1].getBoundingClientRect();
    var posX, posY, posH;
    if(cursorIdx < spans.length){
      var nextRect = spans[cursorIdx].getBoundingClientRect();
      // 줄바꿈 감지: 다음 글자의 top이 이전 글자보다 아래면 줄이 바뀐 것
      if(nextRect.top > prevRect.top + prevRect.height * 0.5){
        // 다음 줄 첫 글자 왼쪽에 커서 배치
        posX = nextRect.left;
        posY = nextRect.top;
        posH = nextRect.height;
      } else {
        // 같은 줄: 두 글자 사이 중간점
        posX = (prevRect.right + nextRect.left) / 2;
        posY = prevRect.top;
        posH = prevRect.height;
      }
    } else {
      posX = prevRect.right;
      posY = prevRect.top;
      posH = prevRect.height;
    }
    cursor.style.left = (posX - cRect.left - cursorW / 2) + 'px';
    cursor.style.top = (posY - cRect.top) + 'px';
    cursor.style.height = posH + 'px';
    cursor.style.opacity = '1';
  } else if(cursorIdx === 0 && spans.length > 0){
    var sRect2 = spans[0].getBoundingClientRect();
    cursor.style.left = (sRect2.left - cRect.left - cursorW / 2) + 'px';
    cursor.style.top = (sRect2.top - cRect.top) + 'px';
    cursor.style.height = sRect2.height + 'px';
    cursor.style.opacity = '1';
  }
}

/* ═══ Timer & Stats ═══ */
function _tpStartTimer(){ _tp.timerInterval = setInterval(_tpRenderStats, 500); }
function _tpStopTimer(){
  if(_tp.timerInterval){ clearInterval(_tp.timerInterval); _tp.timerInterval = null; }
  if(_tp.speedInterval){ clearInterval(_tp.speedInterval); _tp.speedInterval = null; }
  var aura = document.getElementById('tpFireAura');
  if(aura) aura.classList.remove('active');
}

/* ═══ Real-time Speed Gauge ═══ */
function _tpTickSpeedGauge(){
  if(_tp._testEffect) { _tpUpdateFireAura(); _tpUpdateGaugeVisual(); return; }
  if(!_tp.started || _tp.finished) return;
  var now = Date.now();
  // 자모 기반 CPM (최종 점수와 동일)
  var target = 0;
  if(_tp.startTime && _tp.typed.length > 0 && _tp.verse){
    var elapsed = (now - _tp.startTime) / 60000; // minutes
    if(elapsed > 0){
      var jamoCount = _tpCountJamoExcludeSkips(_tp.typed);
      target = Math.round(jamoCount / elapsed);
    }
    // ── Warm-up ramp: 처음 5초간 서서히 올라가는 느낌 ──
    // 시작 직후 한두 단어만 빨리 쳐도 600+ 뜨는 현상 방지
    var sec = (now - _tp.startTime) / 1000;
    if(sec < 5){
      var ramp = sec / 5;          // 0→1 over 5 seconds (linear)
      ramp = ramp * (2 - ramp);    // ease-out: 빠르게 오르되 초반 억제
      target = Math.round(target * ramp);
    }
  }
  // Smooth interpolation (초반에는 더 부드럽게)
  var sec2 = _tp.startTime ? (now - _tp.startTime) / 1000 : 0;
  var lerp = sec2 < 3 ? 0.06 : 0.15;
  _tp.speedGauge += (target - _tp.speedGauge) * lerp;
  if(Math.abs(_tp.speedGauge - target) < 1) _tp.speedGauge = target;
  _tpUpdateFireAura();
  _tpUpdateGaugeVisual();
}

function _tpUpdateFireAura(){
  var wrap = document.querySelector('.tp-speed-wrap');
  var aura = document.getElementById('tpFireAura');
  if(!aura && wrap){
    aura = document.createElement('div');
    aura.id = 'tpFireAura';
    aura.className = 'tp-fire-aura';
    for(var fi = 0; fi < 35; fi++){
      var flame = document.createElement('div');
      flame.className = 'tp-flame';
      var sz = 6 + Math.random() * 22;
      flame.style.width = sz + 'px';
      flame.style.height = sz * (1.3 + Math.random() * 0.8) + 'px';
      flame.style.left = (2 + Math.random() * 96) + '%';
      flame.style.animationDuration = (0.5 + Math.random() * 0.9) + 's';
      flame.style.animationDelay = (Math.random() * 1.2) + 's';
      var colors = [
        'radial-gradient(circle, rgba(255,255,255,1), rgba(200,230,255,0.8), rgba(100,180,255,0.3))',
        'radial-gradient(circle, rgba(255,255,240,1), rgba(255,240,150,0.8), rgba(255,200,50,0.3))',
        'radial-gradient(circle, rgba(220,240,255,1), rgba(150,200,255,0.8), rgba(80,140,255,0.3))',
        'radial-gradient(circle, rgba(255,230,255,1), rgba(220,180,255,0.8), rgba(160,100,255,0.3))',
        'radial-gradient(circle, rgba(255,255,255,1), rgba(180,255,220,0.8), rgba(50,220,150,0.3))'
      ];
      flame.style.background = colors[Math.floor(Math.random() * colors.length)];
      aura.appendChild(flame);
    }
    wrap.appendChild(aura);
  }
  if(aura){
    if(_tp.speedGauge >= 900) aura.classList.add('active');
    else aura.classList.remove('active');
  }
}

function _tpUpdateGaugeVisual(){
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
    // 펄스 감쇠 (매 틱 0.15씩 줄어듦)
    if(!_tp.keyPulse) _tp.keyPulse = 0;
    var pulse = _tp.keyPulse;
    _tp.keyPulse *= 0.75; // 빠르게 감쇠
    if(_tp.keyPulse < 0.01) _tp.keyPulse = 0;

    var ratio = Math.min(_tp.speedGauge, 600) / 600;
    var scale = 1 + ratio * 2.0;
    // 키 입력 펄스를 스케일에 반영 (속도 비례)
    var pulseBoost = pulse * (0.3 + ratio * 0.7);
    scale += pulseBoost;
    num.style.transition = pulse > 0.5 ? 'transform 0.05s' : 'transform 0.15s ease-out';
    num.style.transform = 'scale(' + scale.toFixed(2) + ')';
    if(_tp.speedGauge >= 900){
      // 900+ 천둥 번개: 최대 펄스 확장 + 강한 번쩍임
      scale = 3.0 + pulse * 2.5 + Math.random() * 0.3;
      num.style.transform = 'scale(' + scale.toFixed(2) + ')';
      var colors900 = [
        'linear-gradient(90deg, #ffffff, #ffe066, #ffaa00, #ff6600)',
        'linear-gradient(90deg, #ffffff, #88ddff, #4488ff, #aa44ff)',
        'linear-gradient(90deg, #ffffff, #ff88cc, #ff2266, #ff8800)'
      ];
      num.style.background = colors900[Math.floor(Math.random() * colors900.length)];
      num.style.webkitBackgroundClip = 'text';
      num.style.webkitTextFillColor = 'transparent';
      num.style.backgroundClip = 'text';
      if(pulse > 0.5){
        var bright = 1.0 + pulse * 0.8;
        num.style.filter = 'drop-shadow(0 0 '+(30+pulse*40)+'px rgba(255,255,255,0.9)) drop-shadow(0 0 80px rgba(255,200,50,0.6)) brightness('+bright.toFixed(1)+')';
      } else {
        num.style.filter = 'drop-shadow(0 0 24px rgba(255,200,50,0.7)) drop-shadow(0 0 48px rgba(255,100,0,0.4))';
      }
      num.style.textShadow = 'none';
    } else if(_tp.speedGauge >= 700){
      // 700대: 중간 천둥 (600대보다 크고 900보다 작게)
      scale = 2.2 + pulse * 1.5 + Math.random() * 0.2;
      num.style.transform = 'scale(' + scale.toFixed(2) + ')';
      var colors700 = [
        'linear-gradient(90deg, #ffe066, #ffaa00, #ff6600, #ff3300)',
        'linear-gradient(90deg, #88ddff, #4488ff, #6644ee, #aa44ff)',
        'linear-gradient(90deg, #ff88cc, #ff4488, #ff2266, #cc0044)'
      ];
      num.style.background = colors700[Math.floor(Math.random() * colors700.length)];
      num.style.webkitBackgroundClip = 'text';
      num.style.webkitTextFillColor = 'transparent';
      num.style.backgroundClip = 'text';
      if(pulse > 0.5){
        var bright7 = 1.0 + pulse * 0.5;
        num.style.filter = 'drop-shadow(0 0 '+(15+pulse*25)+'px rgba(255,200,50,0.7)) drop-shadow(0 0 40px rgba(255,100,0,0.4)) brightness('+bright7.toFixed(1)+')';
      } else {
        num.style.filter = 'drop-shadow(0 0 16px rgba(255,180,50,0.5)) drop-shadow(0 0 32px rgba(255,80,0,0.3))';
      }
      num.style.textShadow = 'none';
    } else if(_tp.speedGauge >= 600){
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
  var jamoCount = _tpCountJamoExcludeSkips(typed);
  var cpm = minutes > 0 ? Math.round(jamoCount / minutes) : 0;
  var progress = Math.min(100, Math.round(result.nextTarget / target.length * 100));
  var m = Math.floor(elapsed/60);
  var sec = Math.floor(elapsed%60);
  var timeStr = m + ':' + (sec < 10 ? '0' : '') + sec;

  el.innerHTML =
    '<span><i class="fa fa-clock"></i> ' + timeStr + '</span>' +
    '<span><i class="fa fa-tachometer-alt"></i> ' + cpm + ' '+_tpT('cpmUnit')+'</span>' +
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
  var jamoCount = _tpCountJamoExcludeSkips(typed);
  var cpm = minutes > 0 ? Math.round(jamoCount / minutes) : 0;
  var wpm = minutes > 0 ? Math.round((jamoCount / 5) / minutes) : 0;

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

  // Speed rating (자모 기반 CPM 기준)
  var speedLabel, speedClass;
  if(cpm >= 600){ speedLabel = _tpT('veryFast'); speedClass = 'tp-spd-fast'; }
  else if(cpm >= 400){ speedLabel = _tpT('fast'); speedClass = 'tp-spd-good'; }
  else if(cpm >= 250){ speedLabel = _tpT('normal'); speedClass = 'tp-spd-normal'; }
  else { speedLabel = _tpT('slow'); speedClass = 'tp-spd-slow'; }

  // Accuracy rating
  var accLabel;
  if(accuracy >= 98) accLabel = _tpT('perfect');
  else if(accuracy >= 95) accLabel = _tpT('excellent');
  else if(accuracy >= 90) accLabel = _tpT('good');
  else accLabel = _tpT('needsPractice');

  var v = _tp.verse;
  var isHearted = !!_tp.hearts[v.key];

  // Bar percentages
  var correctPct = totalChars > 0 ? (correct / totalChars * 100).toFixed(1) : 0;
  var wrongPct = totalChars > 0 ? (wrong / totalChars * 100).toFixed(1) : 0;
  var skipPct = totalChars > 0 ? (skipped / totalChars * 100).toFixed(1) : 0;
  var speedPct = Math.min(100, Math.round(cpm / 600 * 100));

  // 점수 = 자모 기반 CPM (한컴타자연습 방식, 오타는 점수에 영향 없음)
  var score = cpm;
  var scorePct = Math.min(100, Math.round(score / 900 * 100));

  // SVG ring
  var circ = 2 * Math.PI * 52;
  var ringOffset = circ - (circ * accuracy / 100);

  // Folder button (항상 표시)
  var fnames = Object.keys(_tp.folders);

  // Delta HTML
  var deltaHtml = '';
  if(prevCpm !== null){
    var delta = cpm - prevCpm;
    var sign = delta > 0 ? '+' : '';
    var cls = delta > 0 ? 'tp-delta-up' : (delta < 0 ? 'tp-delta-down' : 'tp-delta-same');
    var dIcon = delta > 0 ? 'fa-arrow-up' : (delta < 0 ? 'fa-arrow-down' : 'fa-equals');
    deltaHtml = '<div class="tp-rcard-delta ' + cls + '">' +
      '<i class="fa ' + dIcon + '"></i> ' + sign + delta +
      ' <span class="tp-delta-prev">('+_tpT('prev')+': ' + prevCpm + ')</span></div>';
  }

  var tier = _tpGetTier(score);

  el.innerHTML =
    '<div class="tp-result">' +

      /* ── Row 1: Compact header ── */
      '<div class="tp-result-head">' +
        '<span class="tp-result-icon"><i class="fa fa-check-circle"></i></span>' +
        '<span class="tp-result-title">'+_tpT('typingComplete')+'</span>' +
        '<span class="tp-result-ref">' + (_tp.source === 'handpos' ? '\u270b ' + v.ref : (v.fullBook || v.book) + ' ' + v.ch + ':' + v.v) + '</span>' +
      '</div>' +

      /* ── Row 2: Stat cards (compact) ── */
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
          '<div class="tp-rcard-title">'+_tpT('accuracy')+'</div>' +
        '</div>' +

        '<div class="tp-rcard">' +
          '<div class="tp-rcard-big">' + cpm + '</div>' +
          '<div class="tp-rcard-unit">'+_tpT('cpmUnit')+'</div>' +
          '<div class="tp-rcard-bar-wrap"><div class="tp-rcard-bar" style="width:' + speedPct + '%"></div></div>' +
          '<div class="tp-rcard-tag ' + speedClass + '">' + speedLabel + '</div>' +
          deltaHtml +
          '<div class="tp-rcard-best"><i class="fa fa-trophy"></i> '+_tpT('bestLabel')+': ' + bestCpm + '</div>' +
        '</div>' +

        '<div class="tp-rcard">' +
          '<div class="tp-rcard-big tp-score-glow">' + score + '</div>' +
          '<div class="tp-rcard-unit">'+_tpT('score')+'</div>' +
          '<div class="tp-rcard-bar-wrap"><div class="tp-rcard-bar" style="width:' + scorePct + '%"></div></div>' +
          '<div class="tp-rcard-tier" style="color:' + tier.color + '">' + tier.icon + ' ' + tier.name + '</div>' +
          '<div class="tp-rcard-myrank" id="tpMyRankBadge"></div>' +
        '</div>' +
      '</div>' +

      /* ── Row 3: Char analysis bar (inline, no card) ── */
      '<div class="tp-result-chart">' +
        '<div class="tp-chart-bar">' +
          (correct > 0 ? '<div class="tp-cbar-ok" style="width:' + correctPct + '%"></div>' : '') +
          (wrong > 0 ? '<div class="tp-cbar-err" style="width:' + wrongPct + '%"></div>' : '') +
          (skipped > 0 ? '<div class="tp-cbar-skip" style="width:' + skipPct + '%"></div>' : '') +
        '</div>' +
        '<div class="tp-chart-legend">' +
          '<span><span class="tp-dot" style="background:var(--gold)"></span>'+_tpT('correct')+' ' + correct + _tpT('charSuffix')+'</span>' +
          '<span><span class="tp-dot" style="background:#ff4757"></span>'+_tpT('errors')+' ' + wrong + _tpT('charSuffix')+'</span>' +
          (skipped > 0 ? '<span><span class="tp-dot" style="background:var(--text3);opacity:.5"></span>'+_tpT('punctuation')+' ' + skipped + _tpT('charSuffix')+'</span>' : '') +
          '<span><span class="tp-dot" style="background:var(--text2)"></span>'+_tpT('total')+' ' + totalChars + _tpT('charSuffix')+'</span>' +
        '</div>' +
      '</div>' +

      /* ── Row 4: Bottom 2-column (left: session+actions, right: ranking) ── */
      '<div class="tp-result-bottom">' +
        '<div class="tp-result-left">' +
          '<div class="tp-session-bar">' +
            '<span><i class="fa fa-file-alt"></i> ' + _tp.sessionVerses + ' '+_tpT('verses')+'</span>' +
            '<span><i class="fa fa-bullseye"></i> '+_tpT('average')+' ' + sessionAvgAcc + '%</span>' +
            '<span><i class="fa fa-trophy"></i> '+_tpT('best')+' ' + bestCpm + ' '+_tpT('cpmUnit')+'</span>' +
            '<span><i class="fa fa-clock"></i> '+_tpT('totalTime')+' ' + sessionTimeStr + '</span>' +
          '</div>' +
          '<div class="tp-result-acts">' +
            '<button class="tp-next-btn" onclick="_tpNextVerse()"><i class="fa fa-arrow-right"></i> '+_tpT('nextVerse')+'</button>' +
            (_tp.source !== 'handpos' ?
              '<button class="tp-heart-btn' + (isHearted ? ' tp-hearted' : '') + '" id="tpHeartBtn" onclick="_tpToggleHeart()">' +
                '<i class="fa' + (isHearted ? 's' : 'r') + ' fa-heart"></i>' +
              '</button>' +
              '<div class="tp-folder-wrap">' +
                '<button class="tp-folder-btn" id="tpFolderBtn" onclick="_tpToggleFolderMenu()" title="'+_tpT('addToFolder')+'">' +
                  '<i class="fa fa-folder-plus"></i>' +
                '</button>' +
                '<div class="tp-folder-menu" id="tpFolderMenu"></div>' +
              '</div>'
            : '') +
          '</div>' +
          '<div class="tp-result-enter"><i class="fa fa-level-down-alt fa-rotate-90"></i> Enter: '+ (_tp.lang==='kr'?'다음 구절':'next verse') +'</div>' +
        '</div>' +
        (_tp.source !== 'handpos' ? '<div class="tp-result-right" id="tpMiniRanking"></div>' : '') +
      '</div>' +

    '</div>';

  // Document-level Enter key listener
  _tp._resultKeyHandler = function(e){
    if(e.key === 'Enter'){ e.preventDefault(); _tpPlayLeverSound(); _tpNextVerse(); }
    else if(e.key === 'Escape'){ e.preventDefault(); toggleTypingPanel(); }
  };
  document.addEventListener('keydown', _tp._resultKeyHandler);

  // Submit score to ranking & load mini ranking (skip for handpos)
  if(_tp.source !== 'handpos'){
    _tpSubmitScore(score, cpm, accuracy, v);
    _tpLoadMiniRanking(score);
  }
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
    h += '<div class="tp-fm-label">'+_tpT('selectFolderLabel')+'</div>';
    fnames.forEach(function(n){
      var inFolder = _tp.folders[n] && _tp.folders[n].indexOf(key) >= 0;
      h += '<div class="tp-fm-item' + (inFolder ? ' tp-fm-added' : '') + '" onclick="_tpToggleFolderItem(\'' + n.replace(/'/g, "\\'") + '\')">';
      h += '<i class="fa ' + (inFolder ? 'fa-check-circle' : 'fa-circle') + '"></i>';
      h += '<span>' + n + '</span>';
      if(inFolder) h += '<span class="tp-fm-badge">'+_tpT('added')+'</span>';
      h += '</div>';
    });
    h += '<div class="tp-fm-divider"></div>';
  }
  h += '<div class="tp-fm-item tp-fm-create" onclick="_tpCreateFolderFromMenu()">';
  h += '<i class="fa fa-plus"></i><span>'+_tpT('createFolder')+'</span>';
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
    toast(_tpT('removedFromFolder')(_tp.verse.ref, name));
  } else {
    _tp.folders[name].push(key);
    toast(_tpT('addedToFolder')(_tp.verse.ref, name));
  }
  _tpSaveFolders();
  _tpRenderFolderMenu();
}
function _tpCreateFolderFromMenu(){
  var name = prompt(_tpT('enterNewFolder'));
  if(!name || !name.trim()) return;
  var n = name.trim();
  if(_tp.folders[n]){ toast(_tpT('folderExists')); return; }
  _tp.folders[n] = [];
  if(_tp.verse) _tp.folders[n].push(_tp.verse.key);
  _tpSaveFolders();
  _tpRenderFolderMenu();
  toast(_tpT('folderCreated')(n, !!_tp.verse));
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

/* ═══ Hand Position Keyboard ═══ */
function _tpFullDecompose(ch){
  var jamos = _tpDecompose(ch);
  var result = [];
  for(var i = 0; i < jamos.length; i++){
    if(i === 1 && _tpCompJung[jamos[i]]){
      result = result.concat(_tpCompJung[jamos[i]]);
    } else if(i >= 2 && _tpCompJong[jamos[i]]){
      result = result.concat(_tpCompJong[jamos[i]]);
    } else {
      result.push(jamos[i]);
    }
  }
  return result;
}

/* Map physical key code → character for current language */
function _tpCodeToChar(code){
  if(!code) return null;
  if(!code.startsWith('Key')) return null;
  var letter = code.charAt(3).toLowerCase();
  for(var r = 0; r < _tpKbLayout.length; r++){
    for(var c = 0; c < _tpKbLayout[r].length; c++){
      if(_tpKbLayout[r][c].en === letter){
        return _tp.lang === 'en' ? _tpKbLayout[r][c].en : _tpKbLayout[r][c].kr;
      }
    }
  }
  return null;
}

/* Handpos keydown handler — bypasses IME, matches physical keys */
function _tpHpKeydown(e){
  if(_tp.finished || !_tp.verse) return;
  if(e.key === 'Escape'){ toggleTypingPanel(); e.preventDefault(); return; }
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ _tpStopTimer(); _tpNextVerse(); e.preventDefault(); return; }
  if(e.ctrlKey || e.altKey || e.metaKey) return;

  var ch = _tpCodeToChar(e.code);
  if(ch === null) return;
  e.preventDefault();

  // Clear IME buffer
  var ta = document.getElementById('tpInput');
  if(ta) ta.value = '';

  // Start timer on first key
  if(!_tp.startTime){
    _tp.startTime = Date.now();
    _tpStartTimer();
  }

  var target = _tp.verse.text;
  var cursor = _tp.hpCursor || 0;
  if(cursor >= target.length) return;

  var expected = target[cursor];
  var container = document.getElementById('tpChars');
  var spans = container ? container.querySelectorAll('.tp-char') : [];

  if(ch === expected){
    // ── Correct ──
    _tpPlayKeySound(e.code);
    _tp.hpCorrect++;
    _tp.typed += ch;
    if(spans[cursor]){
      spans[cursor].classList.remove('tp-hp-current');
      spans[cursor].className = 'tp-char tp-correct tp-punch';
    }
    _tp.hpCursor = cursor + 1;

    // Show next char
    _tpHpShowNext(spans, target);
    _tpHighlightNextKey(_tp.hpCursor);

    // Check completion
    if(_tp.hpCursor >= target.length){
      _tp.finished = true;
      _tpStopTimer();
      _tpPlayFinishSound();
      var elapsed = (Date.now() - _tp.startTime) / 1000;
      var minutes = elapsed / 60;
      var total = _tp.hpCorrect + _tp.hpWrong;
      var cpm = minutes > 0 ? Math.round(_tp.hpCorrect / minutes) : 0;
      var acc = total > 0 ? Math.round(_tp.hpCorrect / total * 100) : 100;
      _tp.sessionVerses++;
      _tp.sessionAccSum += acc;
      _tp.sessionTime += elapsed;
      if(cpm > _tp.bestCpm){ _tp.bestCpm = cpm; _tpSaveBestCpm(); }
      toast(cpm + ' ' + _tpT('cpmUnit') + ' · ' + acc + '% ' + _tpT('accuracy'), 1500);
      setTimeout(function(){ _tpNextHandPosVerse(); }, 800);
    }
  } else {
    // ── Wrong ──
    _tp.hpWrong++;
    _tpPlayErrorSound();
    if(spans[cursor]){
      var origText = expected;
      spans[cursor].textContent = ch;
      spans[cursor].className = 'tp-char tp-wrong tp-punch-err tp-hp-current';
      // Reset back to expected after shake animation
      (function(s, txt){
        setTimeout(function(){
          if(!s.classList.contains('tp-correct')){
            s.className = 'tp-char tp-hp-current';
            s.textContent = txt;
          }
        }, 400);
      })(spans[cursor], origText);
    }
  }
}

function _tpHpShowNext(spans, target){
  for(var i = 0; i < spans.length; i++) spans[i].classList.remove('tp-hp-current');
  var c = _tp.hpCursor || 0;
  if(c < spans.length && c < target.length){
    spans[c].classList.add('tp-hp-current');
    spans[c].textContent = target[c];
  }
}

function _tpRenderKeyboard(){
  var lessonId = _tp.handLesson || 'home';
  var lessonLayoutRows = _tpLessonRows[lessonId] || [1];
  var activeKeys = {};
  for(var ri = 0; ri < lessonLayoutRows.length; ri++){
    var row = _tpKbLayout[lessonLayoutRows[ri]];
    for(var ci = 0; ci < row.length; ci++) activeKeys[row[ci].en] = true;
  }
  var lang = _tp.lang;

  // Helper: render a single key
  // letterKey: {en,kr,finger} from _tpKbLayout
  // extraKey:  {lbl,f}  (punctuation/number with finger zone)
  // modKey:    {mod:true,lbl}  (modifier, gray)
  // flex: width multiplier (default 1)
  function k(obj, flex){
    var cls = 'tp-kb-key';
    var sty = flex ? ' style="flex:'+flex+'"' : '';
    var da = '';
    var main, sub = '';
    if(obj.en){ // letter key
      cls += ' tp-kb-f' + obj.finger;
      cls += activeKeys[obj.en] ? ' tp-kb-active' : ' tp-kb-inactive';
      da = ' data-en="'+obj.en+'" data-kr="'+obj.kr+'"';
      main = lang === 'en' ? obj.en : obj.kr;
      sub = lang === 'en' ? obj.kr : obj.en;
    } else if(obj.mod){ // modifier
      cls += ' tp-kb-mod';
      main = obj.lbl;
    } else { // extra key (number/punctuation)
      cls += ' tp-kb-f' + obj.f + ' tp-kb-inactive';
      main = obj.lbl;
      if(obj.sub) sub = obj.sub;
    }
    return '<div class="'+cls+'"'+da+sty+'><span class="tp-kb-main">'+main+'</span>'+(sub?'<span class="tp-kb-sub">'+sub+'</span>':'')+'</div>';
  }

  var h = '<div class="tp-keyboard" id="tpKeyboard">';

  // ── Number row (15 flex units) ──
  h += '<div class="tp-kb-row">';
  var nums = [{lbl:'`',f:0},{lbl:'1',f:0},{lbl:'2',f:0},{lbl:'3',f:0},{lbl:'4',f:1},{lbl:'5',f:2},{lbl:'6',f:3},{lbl:'7',f:4},{lbl:'8',f:5},{lbl:'9',f:6},{lbl:'0',f:6},{lbl:'-',f:7},{lbl:'=',f:7}];
  for(var i=0;i<nums.length;i++) h+=k(nums[i]);
  h+=k({mod:true,lbl:'⌫'},2);
  h+='</div>';

  // ── Top row: Tab + QWERTY + [ ] \ (15 units) ──
  h+='<div class="tp-kb-row">';
  h+=k({mod:true,lbl:'Tab'},1.5);
  for(var c=0;c<_tpKbLayout[0].length;c++) h+=k(_tpKbLayout[0][c]);
  h+=k({lbl:'[',f:7}); h+=k({lbl:']',f:7});
  h+=k({mod:true,lbl:'\\'},1.5);
  h+='</div>';

  // ── Home row: Caps + ASDF + ; ' Enter (15 units) ──
  h+='<div class="tp-kb-row">';
  h+=k({mod:true,lbl:'Caps'},1.75);
  for(var c=0;c<_tpKbLayout[1].length;c++) h+=k(_tpKbLayout[1][c]);
  h+=k({lbl:';',f:7}); h+=k({lbl:"'",f:7});
  h+=k({mod:true,lbl:'Enter'},2.25);
  h+='</div>';

  // ── Bottom row: Shift + ZXCV + , . / Shift (15 units) ──
  h+='<div class="tp-kb-row">';
  h+=k({mod:true,lbl:'Shift'},2.25);
  for(var c=0;c<_tpKbLayout[2].length;c++) h+=k(_tpKbLayout[2][c]);
  h+=k({lbl:',',f:5}); h+=k({lbl:'.',f:6}); h+=k({lbl:'/',f:7});
  h+=k({mod:true,lbl:'Shift'},2.75);
  h+='</div>';

  // ── Space bar ──
  h+='<div class="tp-kb-row tp-kb-row-space"><div class="tp-kb-key tp-kb-space" data-en=" " data-kr=" "><span class="tp-kb-main">Space</span></div></div>';
  h+='</div>';
  return h;
}

function _tpHighlightNextKey(cursorIdx){
  var kbEl = document.getElementById('tpKeyboard');
  if(!kbEl) return;
  var old = kbEl.querySelectorAll('.tp-kb-next');
  for(var i = 0; i < old.length; i++) old[i].classList.remove('tp-kb-next');
  if(!_tp.verse || cursorIdx >= _tp.verse.text.length) return;
  var nextChar = _tp.verse.text[cursorIdx];
  if(nextChar === ' '){
    var sp = kbEl.querySelector('.tp-kb-space');
    if(sp){ sp.classList.add('tp-kb-next'); }
    return;
  }

  // Handpos: each char is already a single jamo — direct match
  if(_tp.source === 'handpos'){
    var sel = _tp.lang === 'kr' ? 'kr' : 'en';
    var el = kbEl.querySelector('[data-'+sel+'="'+nextChar+'"]');
    if(!el) el = kbEl.querySelector('[data-kr="'+nextChar+'"]') || kbEl.querySelector('[data-en="'+nextChar+'"]');
    if(el){
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('tp-kb-next');
    }
    return;
  }

  // Normal mode: decompose for composed Korean syllables
  var targetJamo;
  if(_tp.lang === 'kr'){
    var jamos = _tpFullDecompose(nextChar);
    var typedJamoCount = 0;
    if(_tp.composing && _tp.typed.length > 0){
      var evalLen = Math.max(0, _tp.typed.length - 1);
      var composingText = _tp.typed.slice(evalLen);
      if(composingText){
        var composedJamos = _tpFullDecompose(composingText);
        typedJamoCount = composedJamos.length;
      }
    }
    targetJamo = typedJamoCount < jamos.length ? jamos[typedJamoCount] : null;
  } else {
    targetJamo = nextChar.toLowerCase();
  }
  if(!targetJamo) return;
  var sel2 = _tp.lang === 'kr' ? 'kr' : 'en';
  var keyEl = kbEl.querySelector('[data-'+sel2+'="'+targetJamo+'"]');
  if(!keyEl) keyEl = kbEl.querySelector('[data-kr="'+targetJamo+'"]') || kbEl.querySelector('[data-en="'+targetJamo+'"]');
  if(keyEl) keyEl.classList.add('tp-kb-next');
}

/* ═══ Render Body ═══ */
function _tpRenderBody(){
  var el = document.getElementById('tpBody');
  if(!el) return;

  // Ranking view
  if(_tp.rankingView){
    _tpRenderRanking(el);
    return;
  }

  if(!_tp.started || !_tp.verse){
    el.innerHTML =
      '<div class="tp-start-screen">' +
        '<div class="tp-start-icon"><i class="fa fa-keyboard"></i></div>' +
        '<div class="tp-nickname-row">' +
          '<i class="fa fa-user"></i>' +
          '<input type="text" id="tpNicknameInput" class="tp-nickname-input" ' +
            'placeholder="'+_tpT('nicknamePlaceholder')+'" ' +
            'value="'+(_tp.nickname||'').replace(/"/g,'&quot;')+'" ' +
            'maxlength="12" autocomplete="off" />' +
        '</div>' +
        '<p class="tp-start-msg">'+_tpT('startMsg')+'</p>' +
        '<button class="tp-start-btn" onclick="_tpNextVerse()"><i class="fa fa-play"></i> '+_tpT('start')+'</button>' +
      '</div>';
    // Attach nickname input listener
    var nickInput = document.getElementById('tpNicknameInput');
    if(nickInput){
      nickInput.addEventListener('input', function(){
        _tp.nickname = this.value.trim();
        _tpSaveNickname();
      });
      nickInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); _tpNextVerse(); }
      });
    }
    return;
  }

  var v = _tp.verse;
  var isHearted = !!_tp.hearts[v.key];
  var _isHP = _tp.source === 'handpos';

  // Character spans
  var charSpans = '';
  for(var i = 0; i < v.text.length; i++){
    var c = v.text[i];
    var display = c === ' ' ? '&nbsp;' : c.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    charSpans += '<span class="tp-char">' + display + '</span>';
  }

  // Build header & actions conditionally
  var _hpRefHtml, _hpActsHtml, _hpKbHtml;
  if(_isHP){
    var _hpLName = '';
    for(var _hpI = 0; _hpI < _tpHandLessons.length; _hpI++){
      if(_tpHandLessons[_hpI].id === _tp.handLesson){
        _hpLName = _tp.lang === 'en' ? _tpHandLessons[_hpI].en : _tpHandLessons[_hpI].kr;
        break;
      }
    }
    _hpRefHtml = '<div class="tp-verse-ref"><span class="tp-ref-book">\u270b ' + _tpT('handPosTitle') + '</span> <span class="tp-ref-chv">' + _hpLName + '</span></div>';
    _hpActsHtml = '';
    _hpKbHtml = _tpRenderKeyboard();
  } else {
    _hpRefHtml = '<div class="tp-verse-ref"><span class="tp-ref-book">' + (v.fullBook || v.book) + '</span> <span class="tp-ref-chv">' + v.ch + ':' + v.v + '</span></div>';
    _hpActsHtml = '<div class="tp-verse-acts">' +
      '<button class="tp-heart-btn'+(isHearted?' tp-hearted':'')+'" id="tpHeartBtn" onclick="_tpToggleHeart()">' +
        '<i class="fa'+(isHearted?'s':'r')+' fa-heart"></i>' +
      '</button>' +
      '<div class="tp-folder-wrap">' +
        '<button class="tp-folder-btn" id="tpFolderBtn" onclick="_tpToggleFolderMenu()" title="'+_tpT('addToFolder')+'">' +
          '<i class="fa fa-bookmark"></i>' +
        '</button>' +
        '<div class="tp-folder-menu" id="tpFolderMenu"></div>' +
      '</div>' +
    '</div>';
    _hpKbHtml = '';
  }

  el.innerHTML =
    '<div class="tp-verse-area">' +
      '<div class="tp-verse-header">' +
        _hpRefHtml + _hpActsHtml +
      '</div>' +
      (_isHP ? '' :
      '<div class="tp-speed-wrap">' +
        '<div class="tp-speed-num" id="tpSpeedNum">0</div>' +
        '<div class="tp-speed-gauge"><div class="tp-speed-bar" id="tpSpeedBar"></div></div>' +
      '</div>') +
      '<div class="tp-chars' + (_isHP ? ' tp-hp-chars' : '') + '" id="tpChars">' + charSpans + '</div>' +
      _hpKbHtml +
      '<textarea id="tpInput" class="tp-ghost-input" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>' +
    '</div>' +
    '<div class="tp-stats" id="tpStats">' +
      '<span><i class="fa fa-clock"></i> 0:00</span>' +
      '<span><i class="fa fa-tachometer-alt"></i> 0 '+_tpT('cpmUnit')+'</span>' +
      '<span><i class="fa fa-bullseye"></i> 100%</span>' +
      '<span><i class="fa fa-tasks"></i> 0%</span>' +
    '</div>' +
    '<div class="tp-hint">' +
      '<span>Space: '+(_tp.lang==='en'?'Skip word':'단어 스킵')+'</span>' +
      '<span>Ctrl+Enter: '+_tpT('nextVerse')+'</span>' +
    '</div>';

  // tp-chars 클릭 시 숨겨진 입력창에 포커스
  var charsEl = document.getElementById('tpChars');
  if(charsEl){
    charsEl.addEventListener('click', function(){
      var ta = document.getElementById('tpInput');
      if(ta) ta.focus();
    });
    // 초기 커서 위치 설정
    requestAnimationFrame(function(){
      var spans = charsEl.querySelectorAll('.tp-char');
      _tpMoveCursor(charsEl, spans, 0);
      // Initial keyboard highlight + first char display
      if(_tp.source === 'handpos'){
        _tpHighlightNextKey(0);
        if(spans.length > 0) spans[0].classList.add('tp-hp-current');
      }
    });
  }

  // Attach event listeners
  var ta = document.getElementById('tpInput');
  if(ta){
    ta.addEventListener('input', function(e){
      // isComposing으로 정확한 조합 상태 판별 (이벤트 순서에 무관)
      if(e && typeof e.isComposing !== 'undefined'){
        _tp.composing = e.isComposing;
      }
      _tpOnInput();
    });
    ta.addEventListener('compositionstart', function(){ _tp.composing = true; });
    ta.addEventListener('compositionend', function(){
      _tp.composing = false;
      setTimeout(_tpUpdateChars, 0);
    });
    ta.addEventListener('paste', function(e){ e.preventDefault(); });
    ta.addEventListener('keydown', function(e){
      // Handpos: use physical key matching, bypass IME
      if(_tp.source === 'handpos'){ _tpHpKeydown(e); return; }
      // 테스트: Ctrl+Shift+7 → 전체 정답 입력 + 속도 700
      if(e.ctrlKey && e.shiftKey && e.key === '&'){
        if(_tp.verse){
          _tp.speedGauge = 750;
          if(!_tp.startTime){ _tp.startTime = Date.now() - 3000; _tpStartTimer(); _tp.speedInterval = setInterval(_tpTickSpeedGauge, 80); }
          ta.value = _tp.verse.text;
          _tp.typed = _tp.verse.text;
          _tpOnInput();
        }
        e.preventDefault(); return;
      }
      if(e.key === 'Escape'){ toggleTypingPanel(); e.preventDefault(); return; }
      if(e.key === 'Enter'){
        e.preventDefault();
        if(e.ctrlKey || e.metaKey){
          // Ctrl+Enter → 구절 스킵
          _tpPlayLeverSound();
          _tpStopTimer();
          _tpNextVerse();
        } else {
          // Enter → 줄바꿈 (공백으로 처리)
          _tpPlayLeverSound();
          ta.value += ' ';
          _tpOnInput();
        }
        return;
      }
      // 키 종류별 사운드 분기
      if(e.key === 'Backspace'){ _tpPlayBackSound(); return; }
      // Space → 단어 스킵
      if(e.key === ' '){
        e.preventDefault();
        _tpPlaySpaceSound();
        _tp.keyPulse = 1.0;
        if(_tp.verse && !_tp.finished){
          var mapping = _tpBuildMapping(_tp.verse.text, _tp.typed);
          var cur = mapping.nextTarget;
          if(cur < _tp.verse.text.length){
            // 현재 단어 끝까지 찾기
            var wEnd = cur;
            while(wEnd < _tp.verse.text.length && _tp.verse.text[wEnd] !== ' ') wEnd++;
            // 공백도 포함
            if(wEnd < _tp.verse.text.length && _tp.verse.text[wEnd] === ' ') wEnd++;
            // 스킵 인덱스 기록
            if(!_tp.wordSkips) _tp.wordSkips = {};
            for(var ws = cur; ws < wEnd; ws++) _tp.wordSkips[ws] = true;
            // 정답 텍스트 자동 입력
            ta.value += _tp.verse.text.slice(cur, wEnd);
            _tpOnInput();
          }
        }
        return;
      }
      var skip = ['Shift','Control','Alt','Meta','CapsLock','Tab',
                  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                  'Home','End','PageUp','PageDown','Insert','Delete',
                  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
                  'NumLock','ScrollLock','ContextMenu','PrintScreen','Pause'];
      if(skip.indexOf(e.key) === -1 && !e.ctrlKey && !e.metaKey){
        _tpPlayKeySound(e.code);
        // 타이핑 펄스 (키 입력마다 확장)
        _tp.keyPulse = 1.0;
      }
    });
  }
}

/* ═══ Score Submission — TOP 100 진입 시에만 등록 ═══ */
function _tpSubmitScore(score, cpm, accuracy, verse){
  if(!_tp.nickname || _tp.nickname.length < 2){
    console.log('[Ranking] 닉네임 미입력, 스킵');
    return;
  }
  if(!window._tpRanking){
    console.warn('[Ranking] _tpRanking 모듈 미로드');
    return;
  }

  console.log('[Ranking] 점수 제출 시도:', _tp.nickname, 'score=' + score, 'cpm=' + cpm, 'acc=' + accuracy);

  window._tpRanking.fetchRankings('all').then(function(rankings){
    console.log('[Ranking] 현재 랭킹 수:', rankings.length);
    var myNick = _tp.nickname.toLowerCase();

    // 내 기존 기록 확인
    var myExisting = null;
    for(var i = 0; i < rankings.length; i++){
      if(rankings[i].nickname && rankings[i].nickname.toLowerCase() === myNick){
        myExisting = rankings[i];
        break;
      }
    }

    // 기존 기록(score)보다 낮으면 스킵
    if(myExisting && score <= (myExisting.score || 0)){
      console.log('[Ranking] 기존 점수(' + (myExisting.score||0) + ')보다 낮음, 스킵');
      return;
    }

    // TOP 100 진입 가능한지 확인
    var qualifies = rankings.length < 100;
    if(!qualifies){
      var lastScore = rankings[rankings.length - 1].score || 0;
      qualifies = score > lastScore || !!myExisting;
    }
    if(!qualifies){
      console.log('[Ranking] TOP 100 밖, 스킵');
      return;
    }

    // 순위 계산 (나 자신 제외)
    var rank = 1;
    for(var i = 0; i < rankings.length; i++){
      if(rankings[i].nickname && rankings[i].nickname.toLowerCase() !== myNick && (rankings[i].score||0) > score) rank++;
    }

    var verseRef = (verse.fullBook || verse.book) + ' ' + verse.ch + ':' + verse.v;
    console.log('[Ranking] submitScore 호출:', _tp.nickname, 'score=' + score);
    window._tpRanking.submitScore(_tp.nickname, score, cpm, accuracy, verseRef, _tp.lang)
      .then(function(result){
        console.log('[Ranking] 결과:', result);
        if(result === 'new') toast(_tpT('rankSubmitted') + ' (#' + rank + ')');
        else if(result === 'updated') toast(_tpT('rankUpdated') + ' (#' + rank + ')');
        else if(result === 'no_auth') toast(_tpT('rankNeedLogin'));
        else if(typeof result === 'string' && result.indexOf('error') === 0) toast(result);
      });
  }).catch(function(e){
    console.error('[Ranking] 제출 실패:', e);
    toast('catch: ' + (e.code || e.message || e));
  });
}

/* ═══ Mini Ranking (결과 화면) ═══ */
function _tpLoadMiniRanking(myScore){
  if(!window._tpRanking) return;
  window._tpRanking.fetchRankings(_tp.rankingFilter || 'all')
    .then(function(data){
      _tp.rankingData = data;
      var container = document.getElementById('tpMiniRanking');
      if(!container) return;
      var top20 = data.slice(0, 20);
      if(top20.length === 0){ container.innerHTML = ''; return; }
      var myNick = (_tp.nickname || '').toLowerCase();
      var h = '<div class="tp-result-ranking">' +
        '<div class="tp-mini-rank-header"><i class="fa fa-trophy"></i> TOP 20 '+_tpT('ranking')+'</div>' +
        '<table class="tp-mini-rank-table"><thead><tr>' +
          '<th>'+_tpT('rankCol')+'</th>' +
          '<th>'+_tpT('rankColNickname')+'</th>' +
          '<th>'+_tpT('rankColScore')+'</th>' +
          '<th>'+_tpT('rankColCpm')+'</th>' +
        '</tr></thead><tbody>';
      var myRank = -1;
      for(var i = 0; i < top20.length; i++){
        var r = top20[i];
        var rank = i + 1;
        var isMe = myNick && r.nickname && r.nickname.toLowerCase() === myNick;
        if(isMe) myRank = rank;
        var tier = _tpGetTier(r.score || 0);
        var medal = '';
        if(rank === 1) medal = '🥇';
        else if(rank === 2) medal = '🥈';
        else if(rank === 3) medal = '🥉';
        else medal = '<span class="tp-rank-num">' + rank + '</span>';
        h += '<tr class="' + (isMe ? 'tp-mini-rank-me' : '') + '">' +
          '<td class="tp-rank-pos">' + medal + '</td>' +
          '<td class="tp-rank-nick"><span class="tp-tier-badge" style="color:' + tier.color + '">' + tier.icon + '</span> ' + _tpEscHtml(r.nickname || '?') + '</td>' +
          '<td class="tp-rank-score">' + (r.score || 0) + '</td>' +
          '<td class="tp-rank-cpm">' + (r.cpm || 0) + '</td>' +
        '</tr>';
      }
      h += '</tbody></table></div>';
      container.innerHTML = h;
      // Update my rank badge on score card
      var badge = document.getElementById('tpMyRankBadge');
      if(badge && myRank > 0) badge.textContent = '#' + myRank;
    })
    .catch(function(){});
}

/* ═══ Ranking Toggle ═══ */
function _tpShowRanking(){
  _tp.rankingView = true;
  _tp.started = false;
  _tpStopTimer();
  if(_tp._resultKeyHandler){
    document.removeEventListener('keydown', _tp._resultKeyHandler);
    _tp._resultKeyHandler = null;
  }
  _tpRenderBody();
}

function _tpHideRanking(){
  _tp.rankingView = false;
  if(_tp.finished && _tp.verse){
    // 결과 화면 복귀
    _tpShowResults();
  } else {
    _tpRenderBody();
  }
}

/* ═══ Ranking UI ═══ */
function _tpRenderRanking(el){
  if(!el) el = document.getElementById('tpBody');
  if(!el) return;

  el.innerHTML =
    '<div class="tp-ranking-wrap">' +
      '<div class="tp-ranking-header">' +
        '<button class="tp-rank-back" onclick="_tpHideRanking()"><i class="fa fa-arrow-left"></i> '+_tpT('rankBack')+'</button>' +
        '<div class="tp-ranking-title"><i class="fa fa-trophy"></i> '+_tpT('rankingTitle')+'</div>' +
      '</div>' +
      '<div class="tp-rank-filters">' +
        '<button class="tp-rank-filter'+(_tp.rankingFilter==='all'?' active':'')+'" onclick="_tpSetRankFilter(\'all\')">'+_tpT('rankAll')+'</button>' +
        '<button class="tp-rank-filter'+(_tp.rankingFilter==='kr'?' active':'')+'" onclick="_tpSetRankFilter(\'kr\')">'+_tpT('rankKr')+'</button>' +
        '<button class="tp-rank-filter'+(_tp.rankingFilter==='en'?' active':'')+'" onclick="_tpSetRankFilter(\'en\')">'+_tpT('rankEn')+'</button>' +
      '</div>' +
      '<div class="tp-rank-table-wrap" id="tpRankTable">' +
        '<div class="tp-rank-loading"><i class="fa fa-spinner fa-spin"></i> '+_tpT('rankLoading')+'</div>' +
      '</div>' +
    '</div>';

  _tpLoadRankings();
}

function _tpSetRankFilter(filter){
  _tp.rankingFilter = filter;
  // Update filter button states
  var btns = document.querySelectorAll('.tp-rank-filter');
  for(var i = 0; i < btns.length; i++){
    btns[i].classList.remove('active');
  }
  // Set active based on index
  var idx = filter === 'all' ? 0 : (filter === 'kr' ? 1 : 2);
  if(btns[idx]) btns[idx].classList.add('active');
  // Reload
  var tableWrap = document.getElementById('tpRankTable');
  if(tableWrap) tableWrap.innerHTML = '<div class="tp-rank-loading"><i class="fa fa-spinner fa-spin"></i> '+_tpT('rankLoading')+'</div>';
  _tpLoadRankings();
}

function _tpLoadRankings(){
  if(!window._tpRanking){
    var tableWrap = document.getElementById('tpRankTable');
    if(tableWrap) tableWrap.innerHTML = '<div class="tp-rank-empty">'+_tpT('rankError')+'</div>';
    return;
  }
  window._tpRanking.fetchRankings(_tp.rankingFilter)
    .then(function(data){
      _tp.rankingData = data;
      _tpRenderRankTable(data);
    })
    .catch(function(){
      var tableWrap = document.getElementById('tpRankTable');
      if(tableWrap) tableWrap.innerHTML = '<div class="tp-rank-empty">'+_tpT('rankError')+'</div>';
    });
}

function _tpRenderRankTable(data){
  var tableWrap = document.getElementById('tpRankTable');
  if(!tableWrap) return;

  if(!data || data.length === 0){
    tableWrap.innerHTML = '<div class="tp-rank-empty"><i class="fa fa-inbox"></i><p>'+_tpT('rankEmpty')+'</p></div>';
    return;
  }

  var myNick = (_tp.nickname || '').toLowerCase();
  var h = '<table class="tp-rank-table">';
  h += '<thead><tr>' +
    '<th>'+_tpT('rankCol')+'</th>' +
    '<th>'+_tpT('rankColNickname')+'</th>' +
    '<th>'+_tpT('rankColScore')+'</th>' +
    '<th>'+_tpT('rankColCpm')+'</th>' +
    '<th>'+_tpT('rankColAcc')+'</th>' +
    '<th class="tp-rank-hide-mobile">'+_tpT('rankColVerse')+'</th>' +
    '<th class="tp-rank-hide-mobile">'+_tpT('rankColDate')+'</th>' +
    '</tr></thead><tbody>';

  for(var i = 0; i < data.length; i++){
    var r = data[i];
    var rank = i + 1;
    var isMe = myNick && r.nickname && r.nickname.toLowerCase() === myNick;
    var medal = '';
    if(rank === 1) medal = '<span class="tp-medal tp-gold">🥇</span>';
    else if(rank === 2) medal = '<span class="tp-medal tp-silver">🥈</span>';
    else if(rank === 3) medal = '<span class="tp-medal tp-bronze">🥉</span>';
    else medal = '<span class="tp-rank-num">' + rank + '</span>';

    var dateStr = '';
    if(r.timestamp){
      var d = new Date(r.timestamp);
      dateStr = d.getFullYear() + '.' + (d.getMonth()+1) + '.' + d.getDate();
    }

    h += '<tr class="' + (isMe ? 'tp-rank-me' : '') + (rank <= 3 ? ' tp-rank-top3' : '') + '">' +
      '<td class="tp-rank-pos">' + medal + '</td>' +
      '<td class="tp-rank-nick"><span class="tp-tier-badge" style="color:' + _tpGetTier(r.score||0).color + '">' + _tpGetTier(r.score||0).icon + '</span> ' + _tpEscHtml(r.nickname || '?') + (isMe ? ' <span class="tp-rank-me-badge">'+_tpT('myRank')+'</span>' : '') + '</td>' +
      '<td class="tp-rank-score">' + (r.score || 0) + '</td>' +
      '<td class="tp-rank-cpm">' + (r.cpm || 0) + '</td>' +
      '<td class="tp-rank-acc">' + (r.accuracy || 0) + '%</td>' +
      '<td class="tp-rank-verse tp-rank-hide-mobile">' + _tpEscHtml(r.verseRef || '') + '</td>' +
      '<td class="tp-rank-date tp-rank-hide-mobile">' + dateStr + '</td>' +
      '</tr>';
  }
  h += '</tbody></table>';
  tableWrap.innerHTML = h;
}

function _tpEscHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
