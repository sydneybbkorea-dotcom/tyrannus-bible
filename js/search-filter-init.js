// search-filter-init.js — 검색 책 선택 드롭다운 초기화
document.addEventListener('DOMContentLoaded', function(){
  const sel = document.getElementById('sfBookSel');
  if(!sel || typeof BOOKS==='undefined') return;
  const grp = (label, list) => {
    const og = document.createElement('optgroup');
    og.label = label;
    list.forEach(b => {
      const o = document.createElement('option');
      o.value = b; o.textContent = b; og.appendChild(o);
    });
    sel.appendChild(og);
  };
  if(BOOKS.OT) grp('구약', BOOKS.OT);
  if(BOOKS.NT) grp('신약', BOOKS.NT);
});
