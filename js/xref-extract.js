// xref-extract.js — 모든 소스에서 성경 구절 참조 통합 추출
var _xrefBookPattern = null;

/* 책 이름 정규식 생성 (한 번만) */
function _xrefBuildPattern(){
  if(_xrefBookPattern) return _xrefBookPattern;
  var allBooks = BOOKS.OT.concat(BOOKS.NT);
  var sorted = allBooks.slice().sort(function(a,b){ return b.length - a.length; });
  var escaped = sorted.map(function(b){ return b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
  _xrefBookPattern = new RegExp(
    '(' + escaped.join('|') + ')\\s*(\\d+)\\s*[:]\\s*(\\d+)(?:\\s*[-–]\\s*(\\d+))?',
    'g'
  );
  return _xrefBookPattern;
}

/* 텍스트에서 구절 참조 추출 → 배열 반환 */
function extractRefsFromText(text){
  if(!text) return [];
  var pattern = _xrefBuildPattern();
  pattern.lastIndex = 0;
  var refs = [];
  var seen = {};
  var m;
  while((m = pattern.exec(text)) !== null){
    var ref = m[1] + ' ' + m[2] + ':' + m[3];
    if(m[4]) ref += '-' + m[4];
    if(!seen[ref]){ seen[ref] = true; refs.push(ref); }
  }
  return refs;
}

/* 레거시 키(book_ch_v)를 참조 문자열(book ch:v)로 변환 */
function _keyToRef(key){
  var p = key.split('_');
  if(p.length < 3) return null;
  return p[0] + ' ' + p[1] + ':' + p[2];
}

/* HTML에서 .vlink / .memo-vlink data-ref 추출 */
function _extractRefsFromHtml(html){
  if(!html) return [];
  var refs = [];
  // data-ref 속성에서 키 추출
  var re = /data-ref="([^"]+)"/g;
  var m;
  while((m = re.exec(html)) !== null){
    var r = _keyToRef(m[1]);
    if(r) refs.push(r);
  }
  // 텍스트에서도 구절 패턴 추출
  var textRefs = extractRefsFromText(html.replace(/<[^>]+>/g, ''));
  return refs.concat(textRefs);
}

/* ═══ 특정 구절의 모든 참조 통합 수집 ═══ */
function getAllRefsForVerse(book, ch, vn){
  var key = book + '_' + ch + '_' + vn;
  var refs = [];
  var seen = {};
  var selfRef = book + ' ' + ch + ':' + vn;
  seen[selfRef] = true; // 자기 자신 제외

  function add(r){
    if(!r || seen[r]) return;
    seen[r] = true;
    refs.push(r);
  }
  function addAll(arr){ arr.forEach(add); }

  // 1) 기존 XREFS 데이터
  if(XREFS && XREFS[key]){
    addAll(XREFS[key]);
  }

  // 2) 주석(Commentary) 텍스트에서 추출
  if(COMMENTARY && COMMENTARY[book] && COMMENTARY[book][ch] && COMMENTARY[book][ch][vn]){
    addAll(extractRefsFromText(COMMENTARY[book][ch][vn]));
  }

  // 3) 구절 메모(verseMemo)에서 추출
  if(S.verseMemo && S.verseMemo[key]){
    addAll(_extractRefsFromHtml(S.verseMemo[key]));
  }

  // 4) 연결된 노트에서 다른 구절 참조 수집
  if(S.notes && S.notes.length > 0){
    S.notes.forEach(function(note){
      if(!note.vRefs || note.vRefs.indexOf(key) < 0) return;
      // 이 노트가 현재 구절을 참조 → 노트의 다른 구절 참조들을 수집
      note.vRefs.forEach(function(vk){
        if(vk === key) return;
        var r = _keyToRef(vk);
        add(r);
      });
      // 노트 본문 HTML에서도 추출
      if(note.content){
        addAll(_extractRefsFromHtml(note.content));
      }
    });
  }

  // 5) 하이라이트 메모에서 추출
  if(S.hlRanges && S.hlRanges[key] && S.hlMemo){
    S.hlRanges[key].forEach(function(range){
      var memo = S.hlMemo[range.gid];
      if(!memo) return;
      // 메모 HTML에서 구절 참조 추출
      if(memo.html) addAll(_extractRefsFromHtml(memo.html));
      if(memo.text) addAll(extractRefsFromText(memo.text));
    });
  }

  // 6) LinkRegistry 백링크에서 추출
  if(typeof LinkRegistry !== 'undefined' && typeof TyrannusURI !== 'undefined'){
    try {
      var uri = TyrannusURI.fromLegacyVerseKey(key);
      if(uri){
        var incoming = LinkRegistry.getIncoming(uri);
        if(incoming && incoming.length){
          incoming.forEach(function(link){
            var parsed = TyrannusURI.parse(link.sourceUri);
            if(!parsed) return;
            if(parsed.type === 'note'){
              // 이 노트의 다른 outgoing 링크 수집
              var outgoing = LinkRegistry.getOutgoing(link.sourceUri);
              if(outgoing){
                outgoing.forEach(function(ol){
                  var tp = TyrannusURI.parse(ol.targetUri);
                  if(tp && tp.type === 'verse'){
                    var r = tp.segments[0] + ' ' + tp.segments[1] + ':' + tp.segments[2];
                    add(r);
                  }
                });
              }
            }
          });
        }
      }
    } catch(e){}
  }

  return refs;
}
