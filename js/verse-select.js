// verse-select.js — 구절 선택/해제 + 다중 선택 + 북마크 + 호버 툴팁
function restoreSel(){
  (S.selVSet||[]).forEach(v=>{
    const r=document.querySelector(`.vrow[data-v="${v}"]`); if(r) r.classList.add('vsel');
  });
}

/* 포커스만 (일반 클릭 / 우클릭) — 시각적 선택 표시 없이 현재 구절 설정 */
function focusVerse(vn){
  S.selV=vn;
  updateDict();
  if(typeof showXrefBar==='function') showXrefBar(vn);
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
}
document.addEventListener('click',e=>{
  const bs=document.getElementById('bibleScroll');
  if(!bs||!bs.contains(e.target)) return;
  if(!e.target.closest('.vrow')&&!e.target.closest('#ctxMenu')&&!e.target.closest('#hlPicker')){
    clearAllSel();
  }
});

/* ── 브라우저 기본 우클릭 메뉴 차단 (성경 본문 영역) ── */
document.addEventListener('contextmenu', function(e){
  var bs=document.getElementById('bibleScroll');
  if(bs && bs.contains(e.target)){
    e.preventDefault();
  }
});

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
  // 커서 오른쪽 아래에 표시, 화면 밖으로 나가지 않도록
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
  else{S.bk.add(k);toast('북마크 추가됨 🔖')}
  persist(); renderBible(); restoreSel();
}
