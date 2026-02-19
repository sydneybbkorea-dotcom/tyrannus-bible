// word-study.js — 원어 단어 연구 (역인덱스 기반 전체 성경 검색)
var _wsResults=null, _wsPage=0;
var WS_PER_PAGE=50;

async function showWordStudy(code){
  var refs=[];
  // 역인덱스에서 검색 (전체 성경)
  if(typeof loadStrongsReverse==='function'){
    var isH=code.startsWith('H');
    await loadStrongsReverse(isH?'ot':'nt');
    var rev=isH?STRONGS_REV_OT:STRONGS_REV_NT;
    if(rev&&rev[code]) refs=rev[code];
  }
  // 폴백: 기존 VERSE_STRONGS
  if(!refs.length&&VERSE_STRONGS){
    Object.entries(VERSE_STRONGS).forEach(function(e){
      e[1].forEach(function(w){
        if(w.codes&&w.codes.includes(code)) refs.push(e[0]);
      });
    });
  }
  if(!refs.length) return '';
  var otC=0,ntC=0;
  _wsResults=refs.map(function(key){
    var p=key.split('_'),book=p.slice(0,-2).join('_');
    var ch=+p[p.length-2],v=+p[p.length-1];
    if(BOOKS.OT.includes(book))otC++;else ntC++;
    return{book:book,ch:ch,v:v};
  });
  _wsPage=0;
  var total=otC+ntC, otPct=Math.round(otC/total*100);
  var h='<div class="ws-section"><div class="ws-title"><i class="fa fa-chart-bar"></i> 단어 연구</div>';
  h+='<div class="ws-freq"><span class="ws-freq-num">'+total+'</span>회 출현</div>';
  h+='<div class="ws-dist"><div class="ws-bar"><div class="ws-bar-ot" style="width:'+otPct+'%"></div></div>';
  h+='<div class="ws-dist-labels"><span>구약 '+otC+'</span><span>신약 '+ntC+'</span></div></div>';
  h+='<div class="ws-verses" id="wsVerseList"></div>';
  h+='<div class="ws-pag" id="wsPag"></div></div>';
  setTimeout(function(){renderWSPage(0)},50);
  return h;
}
