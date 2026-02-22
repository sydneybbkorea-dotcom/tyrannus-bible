// verse-select.js — 구절 선택 + 참조바 + 메뉴 드롭다운 + 호버 툴팁
function restoreSel(){
  (S.selVSet||[]).forEach(v=>{
    const r=document.querySelector(`.vrow[data-v="${v}"]`); if(r) r.classList.add('vsel');
  });
}

/* ── 구절 클릭: 첫 클릭=선택, 두번째 클릭=참조바 토글 ── */
function focusVerse(vn){
  hideVerseMenu();
  // 다중 선택 상태에서 일반 클릭 → 전부 해제
  if(S.selVSet && S.selVSet.size){
    document.querySelectorAll('.vrow.vsel').forEach(r=>r.classList.remove('vsel'));
    S.selVSet.clear(); _updateStatV();
  }
  // 이미 선택된 구절 다시 클릭 → 참조바 토글
  if(S.selV===vn){
    var bar=document.getElementById('xrefBar');
    if(bar){
      // 참조바 있으면 숨김
      if(typeof hideXrefBar==='function') hideXrefBar();
    } else {
      // 참조바 없으면 표시
      if(typeof showXrefBar==='function') showXrefBar(vn);
    }
    updateDict();
    return;
  }
  // 다른 구절 클릭 → 새로 선택
  // 이전 선택 해제 (시각적)
  if(S.selV){
    var prevRow=document.querySelector('.vrow[data-v="'+S.selV+'"]');
    if(prevRow) prevRow.classList.remove('vfocus');
  }
  S.selV=vn;
  var row=document.querySelector('.vrow[data-v="'+vn+'"]');
  if(row) row.classList.add('vfocus');
  if(typeof hideXrefBar==='function') hideXrefBar();
  updateDict();
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
/* Shift+Click — 범위 선택 */
function selVerseRange(from, to){
  if(!S.selVSet) S.selVSet=new Set();
  var lo=Math.min(from,to), hi=Math.max(from,to);
  for(var v=lo; v<=hi; v++){
    S.selVSet.add(v);
    var r=document.querySelector('.vrow[data-v="'+v+'"]');
    if(r) r.classList.add('vsel');
  }
  S.selV=to;
  _updateStatV(); updateDict();
  if(typeof showXrefBar==='function') showXrefBar(to);
}
function _updateStatV(){
  const statV=document.getElementById('statV'); if(!statV) return;
  const arr=[...(S.selVSet||[])].sort((a,b)=>a-b);
  if(!arr.length){ statV.innerHTML=''; return; }
  statV.innerHTML=`<i class="fa fa-map-pin" style="color:var(--gold)"></i> ${S.book} ${arr.map(v=>S.ch+':'+v).join(', ')}`;
}
function clearAllSel(){
  document.querySelectorAll('.vrow.vsel').forEach(r=>r.classList.remove('vsel'));
  document.querySelectorAll('.vrow.vfocus').forEach(r=>r.classList.remove('vfocus'));
  if(S.selVSet) S.selVSet.clear(); S.selV=null; _updateStatV();
  if(typeof hideXrefBar==='function') hideXrefBar();
  hideVerseMenu();
}
/* ── Ctrl+드래그 다중 선택 ── */
var _ctrlDrag=false, _ctrlDragged=false;
document.addEventListener('mousedown',function(e){
  if(!(e.ctrlKey||e.metaKey)||e.button!==0) return;
  var row=e.target.closest('.vrow');
  if(!row) return;
  var bs=document.getElementById('bibleScroll');
  if(!bs||!bs.contains(row)) return;
  _ctrlDrag=true;
  _ctrlDragged=false;
  e.preventDefault();
});
document.addEventListener('mousemove',function(e){
  if(!_ctrlDrag) return;
  var row=e.target.closest('.vrow');
  if(!row) return;
  var vn=+row.dataset.v;
  if(!vn||S.selVSet&&S.selVSet.has(vn)) return;
  _ctrlDragged=true;
  if(!S.selVSet) S.selVSet=new Set();
  S.selVSet.add(vn);
  row.classList.add('vsel');
  S.selV=vn;
  _updateStatV();
});
document.addEventListener('mouseup',function(){
  if(!_ctrlDrag) return;
  _ctrlDrag=false;
  if(_ctrlDragged){
    updateDict();
    if(S.selV&&typeof showXrefBar==='function') showXrefBar(S.selV);
  }
});

document.addEventListener('click',e=>{
  if(_ctrlDragged){_ctrlDragged=false;return;}
  if(e.target.closest('.verse-menu')||e.target.closest('.vrow-menu-btn')) return;
  hideVerseMenu();
  const bs=document.getElementById('bibleScroll');
  if(!bs||!bs.contains(e.target)) return;
  if(!e.target.closest('.vrow')&&!e.target.closest('#ctxMenu')&&!e.target.closest('#hlPicker')){
    clearAllSel();
  }
});

/* ── 구절 ⋮ 메뉴 버튼 드롭다운 ── */
var _verseMenu=null;
var _vmVerse=null;

function _ensureVerseMenu(){
  if(_verseMenu) return;
  var m=document.createElement('div');
  m.id='verseMenu';
  m.className='verse-menu';
  m.innerHTML=
    '<div class="vm-item" data-act="highlight"><i class="fa fa-highlighter"></i> 형광펜</div>'+
    '<div class="vm-item" data-act="memo"><i class="fa fa-comment-dots"></i> 주석 작성</div>'+
    '<div class="vm-item" data-act="note"><i class="fa fa-pen"></i> 새 노트</div>'+
    '<div class="vm-item" data-act="link"><i class="fa fa-link"></i> 노트 연결</div>'+
    '<div class="vm-item" data-act="dict"><i class="fa fa-book"></i> 사전 보기</div>'+
    '<div class="vm-sep"></div>'+
    '<div class="vm-item" data-act="bookmark"><i class="fa fa-bookmark"></i> 북마크</div>'+
    '<div class="vm-item" data-act="copy"><i class="fa fa-copy"></i> 구절 복사</div>'+
    '<div class="vm-item" data-act="copyref"><i class="fa fa-quote-right"></i> 참조 형식 복사</div>'+
    '<div class="vm-item" data-act="insertlink"><i class="fa fa-external-link-alt"></i> 노트에 링크 삽입</div>';
  m.addEventListener('click', function(e){
    var item=e.target.closest('.vm-item');
    if(!item) return;
    e.stopPropagation();
    _vmAction(item.dataset.act);
  });
  document.body.appendChild(m);
  _verseMenu=m;
}

function _vmAction(act){
  hideVerseMenu();
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
}

function toggleVerseMenu(vn, btnEl){
  _ensureVerseMenu();
  // 이미 열려있으면 닫기
  if(_vmVerse===vn && _verseMenu.style.display==='block'){
    hideVerseMenu(); return;
  }
  // 구절 포커스 설정
  S.selV=vn;
  _vmVerse=vn;
  updateDict();

  var rect=btnEl.getBoundingClientRect();
  _verseMenu.style.display='block';
  requestAnimationFrame(function(){
    var mw=_verseMenu.offsetWidth||180;
    var mh=_verseMenu.offsetHeight||300;
    var x=rect.right-mw;
    var y=rect.bottom+4;
    if(x<4) x=4;
    if(y+mh>window.innerHeight-8) y=rect.top-mh-4;
    _verseMenu.style.left=x+'px';
    _verseMenu.style.top=y+'px';
  });
}

function hideVerseMenu(){
  if(_verseMenu) _verseMenu.style.display='none';
  _vmVerse=null;
}


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
