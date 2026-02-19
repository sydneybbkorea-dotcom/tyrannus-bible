// word-study-paginate.js -- 단어 연구 페이지네이션
function renderWSPage(page){
  if(!_wsResults) return;
  _wsPage=page;
  var start=page*WS_PER_PAGE;
  var end=Math.min(start+WS_PER_PAGE,_wsResults.length);
  var list=document.getElementById('wsVerseList');
  var pag=document.getElementById('wsPag');
  if(!list) return;
  var h='';
  for(var i=start;i<end;i++){
    var r=_wsResults[i];
    var txt=(BIBLE&&BIBLE[r.book]&&BIBLE[r.book][r.ch])?
      (BIBLE[r.book][r.ch][r.v-1]||'').replace(/<[^>]+>/g,'').slice(0,50):'';
    h+='<div class="ws-verse" onclick="openBibleTab(\''+r.book+'\','+r.ch+','+r.v+')">';
    h+='<span class="ws-ref">'+r.book+' '+r.ch+':'+r.v+'</span>';
    h+='<span class="ws-txt">'+txt+'...</span></div>';
  }
  list.innerHTML=h;
  var tp=Math.ceil(_wsResults.length/WS_PER_PAGE);
  if(pag&&tp>1){
    var ph='';
    if(page>0) ph+='<button class="ws-pg-btn" onclick="renderWSPage('+(page-1)+')">◀ 이전</button>';
    ph+='<span class="ws-pg-info">'+(page+1)+' / '+tp+'</span>';
    if(page<tp-1) ph+='<button class="ws-pg-btn" onclick="renderWSPage('+(page+1)+')">다음 ▶</button>';
    pag.innerHTML=ph;
  }
}
