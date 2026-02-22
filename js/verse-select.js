// verse-select.js — 구절 선택/해제 + 미니 툴바 + 호버 툴팁
function restoreSel(){
  (S.selVSet||[]).forEach(v=>{
    const r=document.querySelector(`.vrow[data-v="${v}"]`); if(r) r.classList.add('vsel');
  });
}

/* ── 구절 미니 툴바 ── */
var _verseToolbar=null;
var _vtbVerse=null; // 현재 툴바가 열린 구절 번호

function _ensureVerseToolbar(){
  if(_verseToolbar) return;
  var tb=document.createElement('div');
  tb.id='verseToolbar';
  tb.className='verse-toolbar';
  tb.innerHTML=
    '<button class="vtb-btn" data-act="highlight" title="형광펜"><i class="fa fa-highlighter"></i></button>'+
    '<button class="vtb-btn" data-act="memo" title="주석 작성"><i class="fa fa-comment-dots"></i></button>'+
    '<button class="vtb-btn" data-act="note" title="새 노트"><i class="fa fa-pen"></i></button>'+
    '<button class="vtb-btn" data-act="link" title="노트 연결"><i class="fa fa-link"></i></button>'+
    '<button class="vtb-btn" data-act="bookmark" title="북마크"><i class="fa fa-bookmark"></i></button>'+
    '<span class="vtb-sep"></span>'+
    '<button class="vtb-btn" data-act="copy" title="구절 복사"><i class="fa fa-copy"></i></button>'+
    '<button class="vtb-btn" data-act="copyref" title="참조 복사"><i class="fa fa-quote-right"></i></button>'+
    '<button class="vtb-btn" data-act="dict" title="사전"><i class="fa fa-book"></i></button>'+
    '<button class="vtb-btn" data-act="insertlink" title="노트에 링크 삽입"><i class="fa fa-external-link-alt"></i></button>';
  tb.addEventListener('click', function(e){
    var btn=e.target.closest('.vtb-btn');
    if(!btn) return;
    e.stopPropagation();
    var act=btn.dataset.act;
    _vtbAction(act);
  });
  document.body.appendChild(tb);
  _verseToolbar=tb;
}

function _vtbAction(act){
  switch(act){
    case 'highlight': if(typeof ctxHL==='function') ctxHL(); break;
    case 'memo': if(typeof ctxVerseMemo==='function') ctxVerseMemo(); break;
    case 'note': if(typeof ctxNote==='function') ctxNote(); break;
    case 'link': if(typeof ctxLinkNote==='function') ctxLinkNote(); break;
    case 'bookmark': addBookmark(); break;
    case 'copy': if(typeof ctxCopy==='function') ctxCopy(); break;
    case 'copyref': if(typeof ctxCopyRef==='function') ctxCopyRef(); break;
    case 'dict': if(typeof ctxDict==='function') ctxDict(); break;
    case 'insertlink': if(typeof ctxInsertLink==='function') ctxInsertLink(); break;
  }
  hideVerseToolbar();
}

function showVerseToolbar(vn){
  _ensureVerseToolbar();
  var row=document.querySelector('.vrow[data-v="'+vn+'"]');
  if(!row){ hideVerseToolbar(); return; }
  _vtbVerse=vn;
  var rect=row.getBoundingClientRect();
  var tb=_verseToolbar;
  tb.style.display='flex';
  // 위치: 구절 행 바로 아래, 왼쪽 정렬
  var x=rect.left+8;
  var y=rect.bottom+4;
  // 화면 밖 방지
  requestAnimationFrame(function(){
    var tw=tb.offsetWidth||300;
    if(x+tw>window.innerWidth-8) x=window.innerWidth-tw-8;
    if(x<4) x=4;
    if(y+40>window.innerHeight) y=rect.top-40;
    tb.style.left=x+'px';
    tb.style.top=y+'px';
  });
  tb.style.left=x+'px';
  tb.style.top=y+'px';
}

function hideVerseToolbar(){
  if(_verseToolbar) _verseToolbar.style.display='none';
  _vtbVerse=null;
}

/* 포커스 토글 (일반 클릭) — 같은 구절 다시 클릭하면 툴바/참조바 숨김 */
function focusVerse(vn){
  if(S.selV===vn){
    S.selV=null;
    hideVerseToolbar();
    if(typeof hideXrefBar==='function') hideXrefBar();
    updateDict();
    return;
  }
  S.selV=vn;
  updateDict();
  if(typeof showXrefBar==='function') showXrefBar(vn);
  showVerseToolbar(vn);
}

/* Ctrl+Click — 영구 다중 선택 (파란 하이라이트) */
function selVerse(vn, e){
  if(!S.selVSet) S.selVSet=new Set();
  if(S.selVSet.has(vn)){
    S.selVSet.delete(vn);
    document.querySelector(`.vrow[data-v="${vn}"]`)?.classList.remove('vsel');
    S.selV=S.selVSet.size?Math.max(...S.selVSet):null;
  } else {
    S.selVSet.add(vn);
    document.querySelector(`.vrow[data-v="${vn}"]`)?.classList.add('vsel');
    S.selV=vn;
  }
  _updateStatV(); updateDict();
  if(typeof showXrefBar==='function'){ S.selV ? showXrefBar(S.selV) : hideXrefBar(); }
}
function _updateStatV(){
  const statV=document.getElementById('statV'); if(!statV) return;
  const arr=[...(S.selVSet||[])].sort((a,b)=>a-b);
  if(!arr.length){ statV.innerHTML=''; return; }
  statV.innerHTML=`<i class="fa fa-map-pin" style="color:var(--gold)"></i> ${S.book} ${arr.map(v=>S.ch+':'+v).join(', ')}`;
}
function clearAllSel(){
  document.querySelectorAll('.vrow.vsel').forEach(r=>r.classList.remove('vsel'));
  if(S.selVSet) S.selVSet.clear(); S.selV=null; _updateStatV();
  if(typeof hideXrefBar==='function') hideXrefBar();
  hideVerseToolbar();
}
document.addEventListener('click',e=>{
  // 툴바 자체 클릭은 무시
  if(_verseToolbar && _verseToolbar.contains(e.target)) return;
  const bs=document.getElementById('bibleScroll');
  if(!bs||!bs.contains(e.target)){
    hideVerseToolbar();
    return;
  }
  if(!e.target.closest('.vrow')&&!e.target.closest('#ctxMenu')&&!e.target.closest('#hlPicker')){
    clearAllSel();
  }
});

/* ── 브라우저 기본 우클릭 메뉴 차단 ── */
document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, true);
document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, false);
document.oncontextmenu = function(e){ if(e) e.preventDefault(); return false; };

/* ── 구절 호버 툴팁 (마우스 따라다니는 구절 참조) ── */
var _vHoverTip=null;
function _ensureVHoverTip(){
  if(_vHoverTip) return;
  _vHoverTip=document.createElement('div');
  _vHoverTip.id='vHoverTip';
  _vHoverTip.className='v-hover-tip';
  document.body.appendChild(_vHoverTip);
}
document.addEventListener('mousemove', function(e){
  var bs=document.getElementById('bibleScroll');
  var row=e.target.closest('.vrow');
  if(!row||!bs||!bs.contains(row)){
    if(_vHoverTip) _vHoverTip.style.display='none';
    return;
  }
  _ensureVHoverTip();
  var vn=row.dataset.v;
  _vHoverTip.textContent=S.book+' '+S.ch+':'+vn;
  _vHoverTip.style.display='block';
  var x=e.clientX+14, y=e.clientY-32;
  var tw=_vHoverTip.offsetWidth||80;
  if(x+tw>window.innerWidth-8) x=e.clientX-tw-8;
  if(y<4) y=e.clientY+18;
  _vHoverTip.style.left=x+'px';
  _vHoverTip.style.top=y+'px';
});

function addBookmark(){
  if(!S.selV){toast('먼저 구절을 클릭하세요');return}
  const k=`${S.book}_${S.ch}_${S.selV}`;
  if(S.bk.has(k)){S.bk.delete(k);toast('북마크 해제됨')}
  else{S.bk.add(k);toast('북마크 추가됨')}
  persist(); renderBible(); restoreSel();
}
