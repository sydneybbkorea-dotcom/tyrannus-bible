// commentary-verse.js — verse-level commentary rendering (updateCommentary)
function updateCommentary(){
  var vn=S.selV; var el=document.getElementById('commentaryContent');
  if(!el) return;
  if(!vn){el.innerHTML='<div class="comm-empty"><div class="comm-empty-icon"><i class="fa fa-scroll"></i></div><div class="comm-empty-msg">구절을 클릭하면<br>주석과 메모를 볼 수 있어요</div></div>';return}

  var key=S.book+'_'+S.ch+'_'+vn;
  var comm=COMMENTARY[S.book]?.[S.ch]?.[vn];
  var refs = (typeof getAllRefsForVerse==='function')
    ? getAllRefsForVerse(S.book, S.ch, vn)
    : (XREFS[key]||[]);
  var linked=S.notes.filter(function(n){return n.vRefs?.includes(key)});
  var vMemo = S.verseMemo?.[key];

  // 하이라이트 메모 수집
  var vtxtEl = document.querySelector('.vtxt[data-key="'+key+'"]');
  var memoMap = new Map();
  if(vtxtEl){
    vtxtEl.querySelectorAll('mark[data-memo]').forEach(function(m){
      var memo = m.dataset.memo?.trim();
      if(!memo) return;
      var gid = m.dataset.gid || ('_'+m.textContent.trim().slice(0,8));
      if(!memoMap.has(gid)){
        var allText = vtxtEl.querySelectorAll('mark[data-gid="'+m.dataset.gid+'"]');
        var rangeText = allText.length > 0 ? [].slice.call(allText).map(function(x){return x.textContent}).join('') : m.textContent;
        var color = m.className.replace('hl-active','').trim();
        memoMap.set(gid, { memo:memo, text:rangeText, color:color });
      }
    });
  }

  // 구절 텍스트 (한국어 + 영어)
  var krTxt=(BIBLE?.[S.book]?.[S.ch]?.[vn-1]||'').replace(/<[^>]+>/g,'').slice(0,120);
  var enTxt=(typeof KJV!=='undefined' && KJV?.[S.book]?.[S.ch]?.[vn-1]||'').replace(/<[^>]+>/g,'').slice(0,120);
  var hasHL=!!S.hl[key];

  var hasContent = comm || refs.length || linked.length || memoMap.size || vMemo;

  // ── 통합 헤더 ──
  var h = '<div class="cv-wrap">';

  // Hero header
  h += '<div class="cv-hero">';
  h += '<div class="cv-hero-ref">'+S.book+' '+S.ch+':'+vn+'</div>';
  if(krTxt) h += '<div class="cv-hero-kr">'+krTxt+'</div>';
  if(enTxt) h += '<div class="cv-hero-en">'+enTxt+'</div>';

  // Stats bar
  var statsHtml = '';
  if(comm) statsHtml += '<span class="cv-badge"><i class="fa fa-scroll"></i>주석</span>';
  if(refs.length) statsHtml += '<span class="cv-badge"><i class="fa fa-link"></i>'+refs.length+'</span>';
  if(linked.length) statsHtml += '<span class="cv-badge"><i class="fa fa-pen"></i>'+linked.length+'</span>';
  if(memoMap.size) statsHtml += '<span class="cv-badge"><i class="fa fa-highlighter"></i>'+memoMap.size+'</span>';
  if(hasHL) statsHtml += '<span class="cv-badge cv-badge-hl"><i class="fa fa-circle"></i></span>';
  if(typeof KnowledgeGraph!=='undefined'){
    statsHtml += '<span class="cv-badge cv-badge-link" onclick="event.stopPropagation();KnowledgeGraph.show(typeof TyrannusURI!==\'undefined\'?TyrannusURI.verse(\''+S.book+'\','+S.ch+','+vn+'):null,{depth:3})"><i class="fa fa-project-diagram"></i></span>';
  }
  if(statsHtml) h += '<div class="cv-stats">'+statsHtml+'</div>';
  h += '</div>'; // cv-hero

  if(!hasContent){
    h += '<div class="comm-empty" style="padding:30px 16px"><div class="comm-empty-icon" style="font-size:16px"><i class="fa fa-feather-alt"></i></div><div class="comm-empty-msg">이 구절에 대한<br>주석이나 메모가 없어요</div></div>';
    h += '</div>'; el.innerHTML = h; return;
  }

  h += '<div class="cv-sections">';

  // ── 1) 참고 주석 (가장 중요 — 맨 위) ──
  if(comm){
    h += _cvSection('commentary', 'fa-scroll', '참고 주석', '<div class="cv-comm-body">'+comm+'</div>', true);
  }

  // ── 2) 연결된 구절 ──
  if(refs.length){
    var refsHtml = '<div class="cv-refs">';
    // 미리보기 (최대 3개)
    refs.slice(0,3).forEach(function(r){
      var m=r.match(/^(.+?)\s(\d+):(\d+)$/);
      var rTxt='';
      if(m) rTxt=(BIBLE?.[m[1]]?.[+m[2]]?.[+m[3]-1]||'').replace(/<[^>]+>/g,'').slice(0,50);
      refsHtml += '<div class="cv-ref-row" onclick="navByRef(\''+r+'\')"><span class="cv-ref-label">'+r+'</span><span class="cv-ref-txt">'+rTxt+'</span></div>';
    });
    // 나머지 칩
    if(refs.length > 3){
      refsHtml += '<div class="cv-ref-chips">';
      refs.slice(3).forEach(function(r){
        refsHtml += '<span class="cref" onclick="navByRef(\''+r+'\')">'+r+'</span>';
      });
      refsHtml += '</div>';
    }
    refsHtml += '</div>';
    h += _cvSection('refs', 'fa-link', '연결된 구절 ('+refs.length+')', refsHtml, true);
  }

  // ── 3) 구절 주석 메모 ──
  if(vMemo){
    h += _cvSection('vmemo', 'fa-comment-dots', '구절 주석', '<div class="cv-vmemo">'+vMemo+'</div>', true);
  }

  // ── 4) 하이라이트 메모 ──
  if(memoMap.size > 0){
    var colorDot = {'hl-y':'rgba(255,215,64,.9)','hl-o':'rgba(255,171,64,.9)','hl-g':'rgba(105,240,174,.9)','hl-b':'rgba(64,196,255,.9)','hl-p':'rgba(206,147,216,.9)'};
    var hlHtml = '';
    memoMap.forEach(function(v, gid){
      var cls = v.color.split(' ').find(function(c){return c.startsWith('hl-')})||'hl-y';
      var dot = colorDot[cls]||'var(--gold)';
      var mData = S.hlMemo?.[gid];
      var mTags = (mData?.tags||[]).map(function(t){return '<span class="cv-memo-tag">#'+t+'</span>'}).join('');
      var mHtml = mData?.html || v.memo;
      hlHtml += '<div class="cv-hl-item">';
      hlHtml += '<div class="cv-hl-quote" style="border-left-color:'+dot+'"><span class="cv-hl-dot" style="background:'+dot+'"></span>'+v.text+'</div>';
      hlHtml += '<div class="cv-hl-memo">'+mHtml+'</div>';
      if(mTags) hlHtml += '<div class="cv-hl-tags">'+mTags+'</div>';
      hlHtml += '</div>';
    });
    h += _cvSection('hl', 'fa-highlighter', '하이라이트 메모 ('+memoMap.size+')', hlHtml, true);
  }

  // ── 5) 연결된 노트 ──
  if(linked.length){
    var notesHtml = '';
    linked.forEach(function(n){
      var folder = S.folders.find(function(f){return f.id===n.folderId});
      notesHtml += '<div class="cv-note-row" onclick="loadNote(\''+n.id+'\',true);openPanel(\'notes\');switchSub(\'notes\')">';
      notesHtml += '<div class="cv-note-icon"><i class="fa fa-file-alt"></i></div>';
      notesHtml += '<div class="cv-note-info"><div class="cv-note-title">'+(n.title||'제목 없음')+'</div>';
      if(folder) notesHtml += '<div class="cv-note-folder"><i class="fa fa-folder"></i> '+folder.name+'</div>';
      notesHtml += '</div></div>';
    });
    h += _cvSection('notes', 'fa-pen', '연결된 노트 ('+linked.length+')', notesHtml, true);
  }

  h += '</div></div>'; // cv-sections, cv-wrap
  el.innerHTML = h;

  // delegation
  el.querySelectorAll('.memo-vlink').forEach(function(lnk){
    if(!lnk.getAttribute('onclick')){
      var ref = lnk.dataset.ref;
      if(ref) lnk.setAttribute('onclick', "event.stopPropagation();navByKey('"+ref+"')");
    }
  });
  el.querySelectorAll('.memo-nlink').forEach(function(lnk){
    if(!lnk.getAttribute('onclick')){
      var nid = lnk.dataset.noteid;
      if(nid) lnk.setAttribute('onclick', "event.stopPropagation();loadNote('"+nid+"',true);switchTab('notes')");
    }
  });
}

// ── 섹션 빌더 (접힘/펼침 지원) ──
function _cvSection(type, icon, label, content, defaultOpen){
  var openClass = defaultOpen ? ' cv-sec-open' : '';
  return '<div class="cv-sec cv-sec-'+type+openClass+'">'
    + '<div class="cv-sec-head" onclick="_cvToggle(this)">'
    + '<i class="fa '+icon+' cv-sec-icon"></i>'
    + '<span class="cv-sec-label">'+label+'</span>'
    + '<i class="fa fa-chevron-down cv-sec-chev"></i>'
    + '</div>'
    + '<div class="cv-sec-body">'+content+'</div>'
    + '</div>';
}

function _cvToggle(headEl){
  var sec = headEl.closest('.cv-sec');
  if(sec) sec.classList.toggle('cv-sec-open');
}
