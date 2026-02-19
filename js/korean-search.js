// korean-search.js -- 국어사전 검색 → iframe URL 변경
function searchKorean(){
  const inp=document.getElementById('koreanSearchInput');
  if(!inp) return;
  const q=inp.value.trim();
  if(!q){ toast('검색어를 입력하세요'); return; }
  const frame=document.getElementById('koreanFrame');
  if(!frame) return;
  frame.src='https://stdict.korean.go.kr/search/all.do?searchKeyword='+encodeURIComponent(q);
}
