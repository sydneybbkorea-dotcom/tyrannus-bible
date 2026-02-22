// korean-search.js -- 국어사전 검색 오케스트레이션
async function searchKorean(){
  var inp = document.getElementById('koreanSearchInput');
  if(!inp) return;
  var q = inp.value.trim();
  if(!q){ toast('검색어를 입력하세요'); return; }
  var el = document.getElementById('dictKorean');
  if(!el) return;
  el.innerHTML = '<div class="dict-loading"><i class="fa fa-spinner fa-spin"></i> 검색 중...</div>';
  try {
    var data = await fetchKoreanDef(q);
    el.innerHTML = renderKoreanDef(data);
  } catch(e){
    el.innerHTML = '<div class="comm-hint"><i class="fa fa-exclamation-triangle"></i>사전 서버에 연결할 수 없습니다' +
      '<br><span style="font-size:11px;color:var(--text3)">인터넷 연결을 확인하세요</span></div>';
  }
}

// 관련어 클릭 → 바로 검색
function searchKoreanWord(word){
  var inp = document.getElementById('koreanSearchInput');
  if(inp) inp.value = word;
  searchKorean();
}
