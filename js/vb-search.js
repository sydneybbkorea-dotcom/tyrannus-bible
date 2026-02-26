// vb-search.js — 뷰바 검색창: 입력 → 노트 패널 검색 탭으로 독립 표시
function vbDoSearch() {
  const q = (document.getElementById('vbSchInput')?.value || '').trim();
  if (!q) return;
  // 기존 검색 입력창에도 동기화
  const schInput = document.getElementById('schInput');
  if (schInput) schInput.value = q;

  // 노트 패널 열기 + 검색 탭 전환 (PDF 패널과 완전 독립)
  if (typeof PaneManager !== 'undefined' && !PaneManager.isVisible('notes')) {
    PaneManager.show('notes');
  }
  if (typeof openPanel === 'function') openPanel('notes');
  if (typeof switchTab === 'function') switchTab('search');

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
