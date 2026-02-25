// xref-inline.js — 구절 선택 시 참조 칩 + 인라인 메모 표시
function showXrefBar(vn){
  hideXrefBar();
  if(!vn) return;
  var refs = (typeof getAllRefsForVerse==='function')
    ? getAllRefsForVerse(S.book, S.ch, vn)
    : (XREFS && XREFS[S.book+'_'+S.ch+'_'+vn]) || [];
  var key = S.book+'_'+S.ch+'_'+vn;
  var memo = S.verseMemo && S.verseMemo[key] || '';
  // 참조도 메모도 없으면 표시 안 함
  if(!refs.length && !memo) return;
  var row = document.querySelector('.vrow[data-v="'+vn+'"]');
  if(!row) return;

  var bar = document.createElement('div');
  bar.className='xref-bar'; bar.id='xrefBar';
  var h = '';

  // ── 참조 섹션 ──
  if(refs.length){
    h += '<div class="xref-section">';
    h += '<span class="xref-label"><i class="fa fa-link"></i> 참조</span>';
    h += '<div class="xref-chips">';
    var chipEnd = Math.min(refs.length, 12);
    for(var i=0; i<chipEnd; i++){
      h += '<span class="xref-chip" onclick="event.stopPropagation();_xrefNav(\''+refs[i]+'\')" title="'+refs[i]+'">'+refs[i]+'</span>';
    }
    if(refs.length > chipEnd){
      h += '<span class="xref-more">+' + (refs.length - chipEnd) + '</span>';
    }
    h += '</div></div>';
  }

  // ── 메모 섹션 ──
  if(memo){
    // 메모에서 노트 링크 추출 (하단 정렬용)
    var noteLinks = _xrefExtractNoteLinks(memo);
    var cleanMemo = _xrefCleanMemoForDisplay(memo);

    h += '<div class="xref-memo-section">';
    h += '<div class="xref-memo-head">';
    h += '<span class="xref-memo-label"><i class="fa fa-pen"></i> 주석</span>';
    h += '<button class="xref-memo-edit" onclick="event.stopPropagation();ctxVerseMemo()" title="편집"><i class="fa fa-edit"></i></button>';
    h += '</div>';
    if(cleanMemo){
      h += '<div class="xref-memo-body">'+cleanMemo+'</div>';
    }
    if(noteLinks.length){
      h += '<div class="xref-memo-notes">';
      for(var n=0; n<noteLinks.length; n++){
        h += noteLinks[n];
      }
      h += '</div>';
    }
    h += '</div>';
  } else {
    // 메모 없으면 작성 버튼
    h += '<button class="xref-add-memo" onclick="event.stopPropagation();ctxVerseMemo()">';
    h += '<i class="fa fa-plus"></i> 주석 작성</button>';
  }

  bar.innerHTML = h;
  row.after(bar);
}

// 메모 HTML에서 노트 링크 (.memo-nlink) 추출
function _xrefExtractNoteLinks(html){
  var div = document.createElement('div');
  div.innerHTML = html;
  var links = div.querySelectorAll('.memo-nlink');
  var result = [];
  links.forEach(function(el){ result.push(el.outerHTML); });
  return result;
}

// 메모 HTML에서 노트 링크 제거 (본문용)
function _xrefCleanMemoForDisplay(html){
  var div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('.memo-nlink').forEach(function(el){ el.remove(); });
  return div.innerHTML.trim();
}

function hideXrefBar(){
  document.getElementById('xrefBar')?.remove();
}
function _xrefNav(ref){
  var m=ref.match(/^(.+?)\s(\d+):(\d+)$/);
  if(!m) return;
  if(typeof NavigationRouter !== 'undefined'){
    NavigationRouter.navigateTo(TyrannusURI.verse(m[1],+m[2],+m[3]));
  } else if(typeof openBibleTab==='function'){
    openBibleTab(m[1],+m[2],+m[3]);
  } else {
    S.book=m[1]; S.ch=+m[2]; S.selV=+m[3]; S.selVSet=new Set([+m[3]]); updateNavPickerLabel(); renderAll();
  }
}
