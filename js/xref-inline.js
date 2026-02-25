// xref-inline.js — 구절 선택 시 교차참조 카드 표시 (CROSS REFERENCE)
function showXrefBar(vn){
  hideXrefBar();
  if(!vn) return;
  const refs = (typeof getAllRefsForVerse==='function')
    ? getAllRefsForVerse(S.book, S.ch, vn)
    : (XREFS && XREFS[`${S.book}_${S.ch}_${vn}`]) || [];
  if(!refs.length) return;
  const row=document.querySelector(`.vrow[data-v="${vn}"]`);
  if(!row) return;

  const bar=document.createElement('div');
  bar.className='xref-bar'; bar.id='xrefBar';

  // CROSS REFERENCE 라벨
  let h='<span class="xref-label"><i class="fa fa-link"></i> CROSS REFERENCE</span>';

  // 처음 3개는 카드로 (구절 텍스트 포함)
  var cardCount = Math.min(refs.length, 3);
  for(var i=0; i<cardCount; i++){
    var ref = refs[i];
    var txt = _xrefGetVText(ref);
    if(txt && txt.length > 100) txt = txt.slice(0,100) + '…';
    h += '<div class="xref-card" onclick="event.stopPropagation();_xrefNav(\'' + ref + '\')">'
       + '<div class="xref-card-ref">' + ref + '</div>'
       + (txt ? '<div class="xref-card-text">\u201C' + txt + '\u201D</div>' : '')
       + '</div>';
  }

  // 나머지는 칩으로
  if(refs.length > cardCount){
    h += '<div class="xref-chips">';
    var chipEnd = Math.min(refs.length, cardCount + 8);
    for(var j=cardCount; j<chipEnd; j++){
      h += '<span class="xref-chip" onclick="event.stopPropagation();_xrefNav(\'' + refs[j] + '\')" title="' + refs[j] + '">' + refs[j] + '</span>';
    }
    if(refs.length > chipEnd){
      h += '<span class="xref-more">+' + (refs.length - chipEnd) + '</span>';
    }
    h += '</div>';
  }

  bar.innerHTML=h;
  row.after(bar);
}

// 참조 문자열에서 구절 텍스트 가져오기
function _xrefGetVText(ref){
  if(!window.BIBLE) return '';
  var m = ref.match(/^(.+?)\s(\d+):(\d+)$/);
  if(!m) return '';
  var book=m[1], ch=m[2], vn=parseInt(m[3]);
  return (BIBLE[book] && BIBLE[book][ch] && BIBLE[book][ch][vn-1]) || '';
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
