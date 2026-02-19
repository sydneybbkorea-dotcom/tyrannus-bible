// adv-search-filter.js — 구약/신약/책 범위 필터 + 스코프(절/장/권)
var _advFilter={testament:'all',books:[]};

function _advSetTestament(t){
  _advFilter.testament=t;
  _advFilter.books=[];
  _advRefreshFilterUI();
}

function _advToggleBook(bookName){
  const idx=_advFilter.books.indexOf(bookName);
  if(idx>=0) _advFilter.books.splice(idx,1);
  else _advFilter.books.push(bookName);
  if(_advFilter.books.length>0) _advFilter.testament='custom';
  else _advFilter.testament='all';
  _advRefreshFilterUI();
}

function _advGetFilteredBooks(){
  if(_advFilter.books.length>0) return _advFilter.books;
  if(_advFilter.testament==='ot') return [...BOOKS.OT];
  if(_advFilter.testament==='nt') return [...BOOKS.NT];
  return [...BOOKS.OT,...BOOKS.NT];
}

function _advRefreshFilterUI(){
  document.querySelectorAll('.adv-tst-chip').forEach(c=>{
    c.classList.toggle('on',c.dataset.tst===_advFilter.testament);
  });
  const sel=document.getElementById('advBookSel');
  if(sel) sel.value='';
}

function _advBuildBookOptions(){
  let h='<option value="">책 선택...</option>';
  h+='<optgroup label="구약">';
  BOOKS.OT.forEach(b=>{h+='<option value="'+b+'">'+b+'</option>';});
  h+='</optgroup><optgroup label="신약">';
  BOOKS.NT.forEach(b=>{h+='<option value="'+b+'">'+b+'</option>';});
  h+='</optgroup>';
  return h;
}
