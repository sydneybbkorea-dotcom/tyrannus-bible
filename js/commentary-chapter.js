// commentary-chapter.js — chapter-level commentary rendering (updateChapterCommentary)
function updateChapterCommentary(){
  var el = document.getElementById('commentaryContent');
  if(!el) return;

  var verses = BIBLE[S.book]?.[S.ch];
  if(!verses){ el.innerHTML='<div class="comm-empty"><div class="comm-empty-icon"><i class="fa fa-scroll"></i></div><div class="comm-empty-msg">이 장에 대한 데이터가 없습니다</div></div>'; return; }

  var h = '<div class="cc-wrap">';
  h += '<div class="cc-title"><i class="fa fa-book-open"></i> '+S.book+' '+S.ch+'장</div>';

  var totalVerses = Object.keys(verses).length;
  var hasAny = false;
  var colorDot = {'hl-y':'rgba(255,215,64,.8)','hl-o':'rgba(255,171,64,.8)','hl-g':'rgba(105,240,174,.8)','hl-b':'rgba(64,196,255,.8)','hl-p':'rgba(206,147,216,.8)'};

  for(var vn = 1; vn <= totalVerses; vn++){
    var key = S.book+'_'+S.ch+'_'+vn;
    var comm = COMMENTARY[S.book]?.[S.ch]?.[vn];
    var refs = XREFS[key] || [];
    var linked = S.notes.filter(function(n){return n.vRefs?.includes(key)});

    // 하이라이트 메모
    var vtxtEl = document.querySelector('.vtxt[data-key="'+key+'"]');
    var memoList = [];
    if(vtxtEl){
      var seen = new Set();
      vtxtEl.querySelectorAll('mark[data-memo]').forEach(function(m){
        var memo = m.dataset.memo?.trim();
        if(!memo) return;
        var gid = m.dataset.gid || '';
        if(seen.has(gid)) return; seen.add(gid);
        var allText = gid ? [].slice.call(vtxtEl.querySelectorAll('mark[data-gid="'+gid+'"]')).map(function(x){return x.textContent}).join('') : m.textContent;
        var color = m.className.replace('hl-active','').trim();
        memoList.push({ gid:gid, memo:memo, text:allText, color:color });
      });
    }

    var hasContent = comm || refs.length || linked.length || memoList.length;
    if(!hasContent) continue;
    hasAny = true;

    var verseText = verses[vn] || '';
    var plainText = verseText.replace(/<[^>]+>/g, '');
    var isSel = S.selV === vn;

    h += '<div class="cc-verse'+(isSel?' cc-verse-sel':'')+'" data-v="'+vn+'">';

    // 구절 헤더 (클릭으로 구절 선택 + 접힘 토글)
    h += '<div class="cc-vhead" onclick="selVerse('+vn+')">';
    h += '<span class="cc-vnum">'+vn+'</span>';
    h += '<span class="cc-vtxt">'+(plainText.length > 70 ? plainText.slice(0,70)+'…' : plainText)+'</span>';

    // 인라인 배지
    var badges = '';
    if(comm) badges += '<span class="cc-badge" title="주석"><i class="fa fa-scroll"></i></span>';
    if(refs.length) badges += '<span class="cc-badge" title="참조"><i class="fa fa-link"></i>'+refs.length+'</span>';
    if(linked.length) badges += '<span class="cc-badge" title="노트"><i class="fa fa-pen"></i></span>';
    if(memoList.length) badges += '<span class="cc-badge" title="메모"><i class="fa fa-highlighter"></i></span>';
    h += '<span class="cc-badges">'+badges+'</span>';
    h += '</div>';

    // 내용 영역
    h += '<div class="cc-vbody">';

    // 주석
    if(comm){
      h += '<div class="cc-item cc-item-comm">'+comm+'</div>';
    }

    // 교차 참조
    if(refs.length){
      h += '<div class="cc-item cc-item-refs"><div class="cv-refs">';
      refs.forEach(function(r){
        h += '<span class="cref" onclick="event.stopPropagation();navByRef(\''+r+'\')">'+r+'</span>';
      });
      h += '</div></div>';
    }

    // 연결된 노트
    if(linked.length){
      h += '<div class="cc-item cc-item-notes">';
      linked.forEach(function(n){
        h += '<span class="cc-note-chip" onclick="event.stopPropagation();loadNote(\''+n.id+'\',true);openPanel(\'notes\');switchSub(\'notes\')"><i class="fa fa-file-alt"></i> '+(n.title||'제목 없음')+'</span>';
      });
      h += '</div>';
    }

    // 하이라이트 메모
    if(memoList.length){
      memoList.forEach(function(item){
        var cls = item.color.split(' ').find(function(c){return c.startsWith('hl-')})||'hl-y';
        var dot = colorDot[cls]||'var(--gold)';
        var mData = S.hlMemo?.[item.gid];
        var mHtml = mData?.html || item.memo;
        h += '<div class="cc-item cc-item-hl">';
        h += '<div class="cc-hl-quote" style="border-left-color:'+dot+'">'+item.text+'</div>';
        h += '<div class="cc-hl-memo">'+mHtml+'</div>';
        h += '</div>';
      });
    }

    h += '</div>'; // cc-vbody
    h += '</div>'; // cc-verse
  }

  if(!hasAny){
    h += '<div class="comm-empty" style="margin-top:20px"><div class="comm-empty-icon"><i class="fa fa-feather-alt"></i></div><div class="comm-empty-msg">이 장에 주석이나 메모가 없습니다</div></div>';
  }

  h += '</div>'; // cc-wrap
  el.innerHTML = h;
}
