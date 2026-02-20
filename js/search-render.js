// search-render.js — 검색 결과 렌더링 + 파일 검색 헬퍼
function _searchFiles(q, results){
  if(!searchFilters.files || !Array.isArray(S.notes)) return;
  S.notes.forEach(n=>{
    if(!n || !Array.isArray(n.files)) return;
    n.files.forEach(f=>{
      const name = f.name || f.filename || '';
      if(name.includes(q)) results.push({
        type:'file', ref:`📎 ${name}`,
        text:`노트: ${n.title||'무제'}`, nid:n.id
      });
    });
  });
}

function _renderResults(q, results){
  document.getElementById('schCount').textContent=`${results.length}개의 결과`;
  const list=document.getElementById('schList');
  list.innerHTML='';
  if(!results.length){
    list.innerHTML='<div style="text-align:center;color:var(--text3);padding:24px;font-size:12px">검색 결과가 없어요</div>';
    return;
  }
  results.forEach(r=>list.appendChild(_sriEl(r, q)));
}
