// xref-inline.js — 구절 선택 시 교차참조 미니 바 표시
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
  let h='<span class="xref-label"><i class="fa fa-link"></i> 참조</span>';
  refs.slice(0,6).forEach(r=>{
    h+=`<span class="xref-chip" onclick="event.stopPropagation();_xrefNav('${r}')" title="${r}">${r}</span>`;
  });
  if(refs.length>6) h+=`<span class="xref-more">+${refs.length-6}</span>`;
  bar.innerHTML=h;
  row.after(bar);
}
function hideXrefBar(){
  document.getElementById('xrefBar')?.remove();
}
function _xrefNav(ref){
  const m=ref.match(/^(.+?)\s(\d+):(\d+)$/);
  if(!m) return;
  if(typeof NavigationRouter !== 'undefined'){
    NavigationRouter.navigateTo(TyrannusURI.verse(m[1],+m[2],+m[3]));
  } else if(typeof openBibleTab==='function'){
    openBibleTab(m[1],+m[2],+m[3]);
  } else {
    S.book=m[1]; S.ch=+m[2]; S.selV=+m[3]; S.selVSet=new Set([+m[3]]); updateNavPickerLabel(); renderAll();
  }
}
