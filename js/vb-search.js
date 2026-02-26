// vb-search.js — 뷰바 검색창: 입력 → 검색 패널 독립 표시
function vbDoSearch() {
  const q = (document.getElementById('vbSchInput')?.value || '').trim();
  if (!q) return;
  // 기존 검색 입력창에도 동기화
  const schInput = document.getElementById('schInput');
  if (schInput) schInput.value = q;

  // 항상 PDF 검색 뷰로 검색 결과 표시 (PDF/노트 패널 상태와 무관하게 독립 동작)
  if (!window._searchInPdf && typeof toggleSearchPane === 'function') {
    toggleSearchPane();
  }
  // 검색 실행
  if (typeof uniSearch === 'function') uniSearch();
  else if (typeof doSearch === 'function') doSearch();
}

function vbSchKey(e) {
  if (e.key === 'Enter') vbDoSearch();
  if (e.key === 'Escape') {
    const inp = document.getElementById('vbSchInput');
    if (inp) { inp.value = ''; inp.blur(); }
  }
}
