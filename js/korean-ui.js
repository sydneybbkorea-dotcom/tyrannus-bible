// korean-ui.js -- 국어사전 결과 카드 렌더링
function renderKoreanDef(data){
  if(!data || !data.entries || !data.entries.length) return _koreanEmpty();

  var h = '<div class="comm-ref-lbl"><i class="fa fa-font"></i> ' + _escHtml(data.word) + '</div>';

  // 발음 표시
  if(data.pron){
    h += '<div class="dict-phonetic"><span class="dict-ipa">' + _escHtml(data.pron) + '</span></div>';
  }

  data.entries.forEach(function(entry){
    h += '<div class="comm-card">';
    if(entry.pos){
      h += '<div class="dict-pos">' + _escHtml(entry.pos) + '</div>';
    }
    entry.defs.forEach(function(def, i){
      h += '<div class="dict-def"><span class="dict-num">' + (i + 1) + '.</span> ' + _escHtml(def.text) + '</div>';
      if(def.examples && def.examples.length > 0){
        def.examples.slice(0, 3).forEach(function(ex){
          h += '<div class="dict-example">"' + _escHtml(ex) + '"</div>';
        });
      }
    });
    if(entry.related && entry.related.length > 0){
      h += '<div class="dict-syn"><i class="fa fa-link"></i> ' +
        entry.related.map(function(r){ return _koreanRelated(r); }).join(' ') +
        '</div>';
    }
    h += '</div>';
  });

  h += '<div class="dict-src">출처: 위키낱말사전 (Wiktionary)</div>';
  return h;
}

/* 관련어 항목 렌더링 — "유의어: 사모, 애정" 형태 처리 */
function _koreanRelated(text){
  // "유의어: 사모, 애정" 또는 "동사: 사랑하다" 패턴
  var match = text.match(/^([^:：]+)[:\s：]\s*(.+)$/);
  if(match){
    var label = match[1].trim();
    var words = match[2].split(/[,，、]\s*/);
    var links = words.map(function(w){
      var clean = w.replace(/[()（）\[\]]/g, '').trim();
      if(!clean) return '';
      return '<span class="dict-related-word" onclick="searchKoreanWord(\'' +
        clean.replace(/'/g, "\\'") + '\')">' + _escHtml(w.trim()) + '</span>';
    }).filter(Boolean).join(', ');
    return '<span style="color:var(--text3);font-size:11px">' + _escHtml(label) + ':</span> ' + links;
  }
  // 단순 단어
  var clean2 = text.replace(/[()（）\[\]]/g, '').trim();
  return '<span class="dict-related-word" onclick="searchKoreanWord(\'' +
    clean2.replace(/'/g, "\\'") + '\')">' + _escHtml(text) + '</span>';
}

function _koreanEmpty(){
  return '<div class="comm-hint"><i class="fa fa-font"></i>검색 결과가 없습니다' +
    '<br><span style="font-size:11px;color:var(--text3)">다른 단어를 입력하세요</span></div>';
}

function _escHtml(s){
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
