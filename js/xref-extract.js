// xref-extract.js — 주석 텍스트에서 성경 구절 참조 자동 추출
var _xrefBookPattern = null;

/* 책 이름 정규식 생성 (한 번만) */
function _xrefBuildPattern(){
  if(_xrefBookPattern) return _xrefBookPattern;
  var allBooks = BOOKS.OT.concat(BOOKS.NT);
  // 긴 이름부터 매칭 (솔로몬의아가 > 아가)
  var sorted = allBooks.slice().sort(function(a,b){ return b.length - a.length; });
  var escaped = sorted.map(function(b){ return b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
  // 패턴: 책이름 + 공백? + 숫자장 + : + 숫자절 (+ 선택적 -숫자)
  _xrefBookPattern = new RegExp(
    '(' + escaped.join('|') + ')\\s*(\\d+)\\s*[:]\\s*(\\d+)(?:\\s*[-–]\\s*(\\d+))?',
    'g'
  );
  return _xrefBookPattern;
}

/* 주석 텍스트에서 구절 참조 추출 → 배열 반환 */
function extractRefsFromText(text){
  if(!text) return [];
  var pattern = _xrefBuildPattern();
  pattern.lastIndex = 0;
  var refs = [];
  var seen = {};
  var m;
  while((m = pattern.exec(text)) !== null){
    var book = m[1];
    var ch = m[2];
    var vStart = m[3];
    var vEnd = m[4];
    var ref = book + ' ' + ch + ':' + vStart;
    if(vEnd) ref += '-' + vEnd;
    if(!seen[ref]){
      seen[ref] = true;
      refs.push(ref);
    }
  }
  return refs;
}

/* 특정 구절의 모든 참조 수집 (XREFS + 주석 텍스트 추출) */
function getAllRefsForVerse(book, ch, vn){
  var key = book + '_' + ch + '_' + vn;
  var refs = [];
  var seen = {};

  // 1) 기존 XREFS 데이터
  if(XREFS && XREFS[key]){
    XREFS[key].forEach(function(r){
      if(!seen[r]){ seen[r] = true; refs.push(r); }
    });
  }

  // 2) 주석 텍스트에서 추출
  if(COMMENTARY && COMMENTARY[book] && COMMENTARY[book][ch] && COMMENTARY[book][ch][vn]){
    var commText = COMMENTARY[book][ch][vn];
    var extracted = extractRefsFromText(commText);
    extracted.forEach(function(r){
      if(!seen[r]){ seen[r] = true; refs.push(r); }
    });
  }

  // 3) 구절 메모에서 추출
  if(S.verseMemo && S.verseMemo[key]){
    var memoRefs = extractRefsFromText(S.verseMemo[key]);
    memoRefs.forEach(function(r){
      if(!seen[r]){ seen[r] = true; refs.push(r); }
    });
  }

  return refs;
}
