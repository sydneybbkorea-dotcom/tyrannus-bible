// commentary-verse.js — verse-level commentary rendering (card layout)
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

  var hasContent = comm || refs.length || linked.length || memoMap.size || vMemo;

  var h = '<div class="cv-wrap">';

  // ══ Hero Card ══
  h += '<div class="cv-card cv-card-hero"><div class="cv-card-bar"></div><div class="cv-card-body">';
  h += '<div class="cv-card-badge"><i class="fa fa-bible"></i> '+S.book+'</div>';
  h += '<div class="cv-card-title">'+S.ch+'장 '+vn+'절</div>';
  if(krTxt) h += '<div class="cv-hero-kr">'+krTxt+'</div>';
  if(enTxt) h += '<div class="cv-hero-en">'+enTxt+'</div>';

  // Stats tags
  var tags = '';
  if(comm) tags += '<span class="cv-card-tag"><i class="fa fa-scroll"></i> 주석</span>';
  if(refs.length) tags += '<span class="cv-card-tag"><i class="fa fa-link"></i> 참조 '+refs.length+'</span>';
  if(linked.length) tags += '<span class="cv-card-tag"><i class="fa fa-pen"></i> 노트 '+linked.length+'</span>';
  if(memoMap.size) tags += '<span class="cv-card-tag"><i class="fa fa-highlighter"></i> 메모 '+memoMap.size+'</span>';
  if(typeof KnowledgeGraph!=='undefined'){
    tags += '<span class="cv-card-tag cv-card-tag-link" onclick="event.stopPropagation();KnowledgeGraph.show(typeof TyrannusURI!==\'undefined\'?TyrannusURI.verse(\''+S.book+'\','+S.ch+','+vn+'):null,{depth:3})"><i class="fa fa-project-diagram"></i> 그래프</span>';
  }
  if(tags) h += '<div class="cv-card-tags">'+tags+'</div>';
  h += '</div></div>';

  if(!hasContent){
    h += '<div class="comm-empty" style="padding:30px 16px"><div class="comm-empty-icon" style="font-size:16px"><i class="fa fa-feather-alt"></i></div><div class="comm-empty-msg">이 구절에 대한<br>주석이나 메모가 없어요</div></div>';
    h += '</div>'; el.innerHTML = h; return;
  }

  // ══ 1) 참고 주석 Card ══
  if(comm){
    h += '<div class="cv-card cv-card-comm"><div class="cv-card-bar"></div><div class="cv-card-body">';
    h += '<div class="cv-card-badge">참고 주석</div>';
    h += '<div class="cv-card-desc cv-comm-body">'+comm+'</div>';
    h += '</div></div>';
  }

  // ══ 2) 연결된 구절 Card ══
  if(refs.length){
    h += '<div class="cv-card cv-card-refs"><div class="cv-card-bar"></div><div class="cv-card-body">';
    h += '<div class="cv-card-badge">연결된 구절</div>';
    h += '<div class="cv-card-title" style="font-size:14px">교차 참조 ('+refs.length+')</div>';
    // Top 3 with preview
    h += '<div class="cv-card-list">';
    refs.slice(0,3).forEach(function(r){
      var m=r.match(/^(.+?)\s(\d+):(\d+)$/);
      var rTxt='';
      if(m) rTxt=(BIBLE?.[m[1]]?.[+m[2]]?.[+m[3]-1]||'').replace(/<[^>]+>/g,'').slice(0,50);
      h += '<div class="cv-ref-row" onclick="navByRef(\''+r+'\')"><span class="cv-ref-label">'+r+'</span><span class="cv-ref-txt">'+rTxt+'</span></div>';
    });
    h += '</div>';
    // Rest as chips
    if(refs.length > 3){
      h += '<div class="cv-card-tags">';
      refs.slice(3).forEach(function(r){
        h += '<span class="cref" onclick="navByRef(\''+r+'\')">'+r+'</span>';
      });
      h += '</div>';
    }
    h += '</div></div>';
  }

  // ══ 3) 구절 주석 Card ══
  if(vMemo){
    h += '<div class="cv-card cv-card-vmemo"><div class="cv-card-bar"></div><div class="cv-card-body">';
    h += '<div class="cv-card-badge">구절 주석</div>';
    h += '<div class="cv-card-desc cv-vmemo">'+vMemo+'</div>';
    h += '</div></div>';
  }

  // ══ 4) 하이라이트 메모 Card ══
  if(memoMap.size > 0){
    var colorDot = {'hl-y':'rgba(255,215,64,.9)','hl-o':'rgba(255,171,64,.9)','hl-g':'rgba(105,240,174,.9)','hl-b':'rgba(64,196,255,.9)','hl-p':'rgba(206,147,216,.9)'};
    h += '<div class="cv-card cv-card-hl"><div class="cv-card-bar"></div><div class="cv-card-body">';
    h += '<div class="cv-card-badge">하이라이트 메모</div>';
    h += '<div style="padding:10px 16px 0">';
    memoMap.forEach(function(v, gid){
      var cls = v.color.split(' ').find(function(c){return c.startsWith('hl-')})||'hl-y';
      var dot = colorDot[cls]||'var(--gold)';
      var mData = S.hlMemo?.[gid];
      var mTags = (mData?.tags||[]).map(function(t){return '<span class="cv-memo-tag">#'+t+'</span>'}).join('');
      var mHtml = mData?.html || v.memo;
      h += '<div class="cv-hl-item">';
      h += '<div class="cv-hl-quote" style="border-left-color:'+dot+'"><span class="cv-hl-dot" style="background:'+dot+'"></span>'+v.text+'</div>';
      h += '<div class="cv-hl-memo">'+mHtml+'</div>';
      if(mTags) h += '<div class="cv-hl-tags">'+mTags+'</div>';
      h += '</div>';
    });
    h += '</div>';
    h += '</div></div>';
  }

  // ══ 5) 연결된 노트 Card ══
  if(linked.length){
    h += '<div class="cv-card cv-card-notes"><div class="cv-card-bar"></div><div class="cv-card-body">';
    h += '<div class="cv-card-badge">연결된 노트</div>';
    h += '<div style="padding:10px 16px 0">';
    linked.forEach(function(n){
      var folder = S.folders.find(function(f){return f.id===n.folderId});
      h += '<div class="cv-note-row" onclick="loadNote(\''+n.id+'\',true);openPanel(\'notes\');switchSub(\'notes\')">';
      h += '<div class="cv-note-icon"><i class="fa fa-file-alt"></i></div>';
      h += '<div class="cv-note-info"><div class="cv-note-title">'+(n.title||'제목 없음')+'</div>';
      if(folder) h += '<div class="cv-note-folder"><i class="fa fa-folder"></i> '+folder.name+'</div>';
      h += '</div></div>';
    });
    h += '</div>';
    h += '</div></div>';
  }

  h += '</div>'; // cv-wrap
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

// (no longer needed — cards are always open, no toggle)
function _cvToggle(headEl){}
function _cvSection(){ return ''; }
