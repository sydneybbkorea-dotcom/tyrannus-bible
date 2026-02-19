// strongs-book-group.js -- 책이름 → en-strongs 파일 그룹 매핑
function getStrongsGroup(book){
  var oi=BOOKS.OT.indexOf(book);
  if(oi>=0){
    if(oi<5) return 'ot1';
    if(oi<14) return 'ot2';
    if(oi<22) return 'ot3';
    return 'ot4';
  }
  var ni=BOOKS.NT.indexOf(book);
  if(ni>=0){
    if(ni<5) return 'nt1';
    if(ni<18) return 'nt2';
    return 'nt3';
  }
  return null;
}
function isOTBook(book){
  return BOOKS.OT.includes(book);
}
