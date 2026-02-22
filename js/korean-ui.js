// korean-ui.js -- 국어사전 결과 카드 렌더링
function renderKoreanDef(data){
  if(!data || !data.entries || !data.entries.length) return _koreanEmpty();

  var h = '<div class="comm-ref-lbl"><i class="fa fa-font"></i> ' + _escHtml(data.word) + '</div>';

  data.entries.forEach(function(entry){
    h += '<div class="comm-card">';
    if(entry.pos){
      h += '<div class="dict-pos">' + _escHtml(entry.pos) + '</div>';
    }
    entry.defs.forEach(function(def, i){
      h += '<div class="dict-def"><span class="dict-num">' + (i + 1) + '.</span> ' + _escHtml(def.text) + '</div>';
      if(def.examples && def.examples.length > 0){
        def.examples.slice(0, 2).forEach(function(ex){
          h += '<div class="dict-example">' + _escHtml(ex) + '</div>';
        });
      }
    });
    if(entry.related && entry.related.length > 0){
      h += '<div class="dict-syn"><i class="fa fa-link"></i> ' +
        entry.related.map(function(r){ return _koreanWordLink(r); }).join(', ') +
        '</div>';
    }
    h += '</div>';
  });

  h += '<div class="dict-src">출처: 위키낱말사전 (Wiktionary)</div>';
  return h;
}

function _koreanWordLink(word){
  var clean = word.replace(/[()（）]/g, '').trim();
  return '<span class="dict-related-word" onclick="searchKoreanWord(\'' +
    clean.replace(/'/g, "\\'") + '\')">' + _escHtml(word) + '</span>';
}

function _koreanEmpty(){
  return '<div class="comm-hint"><i class="fa fa-font"></i>검색 결과가 없습니다' +
    '<br><span style="font-size:11px;color:var(--text3)">다른 단어를 입력하세요</span></div>';
}

function _escHtml(s){
  if(!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
