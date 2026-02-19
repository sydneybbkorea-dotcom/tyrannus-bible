// strongs-load-helpers.js -- 현재 책에 맞는 스트롱 데이터 로드 헬퍼
async function loadEnStrongsForBook(book){
  var g=getStrongsGroup(book);
  if(g) await loadEnStrongs(g);
}
async function loadStrongsDictForBook(book){
  var t=isOTBook(book)?'heb':'grk';
  await loadStrongsDict(t);
}
async function ensureStrongsData(){
  if(!S.showStrong) return;
  await loadEnStrongsForBook(S.book);
  await loadStrongsDictForBook(S.book);
}
