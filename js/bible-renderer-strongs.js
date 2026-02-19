// bible-renderer-strongs.js -- 영어 KJV 텍스트에 스트롱 코드 인라인 삽입
function renderEnStrongsInline(kjvTxt,book,ch,vn){
  if(!kjvTxt) return kjvTxt;
  var g=getStrongsGroup(book);
  if(!g) return kjvTxt;
  var gd=EN_STRONGS[g];
  if(!gd) return kjvTxt;
  var vd=gd[book]&&gd[book][ch]&&gd[book][ch][vn];
  if(!vd||!vd.length) return kjvTxt;
  var result=kjvTxt;
  vd.forEach(function(item){
    var cs='<span class="str-code str-en" onclick="event.stopPropagation();showStrongDef(\''+item.code+'\')" title="'+item.code+'">'+item.code+'</span>';
    var idx=result.indexOf(item.word);
    if(idx>=0){
      result=result.substring(0,idx+item.word.length)+cs+result.substring(idx+item.word.length);
    }
  });
  return result;
}
