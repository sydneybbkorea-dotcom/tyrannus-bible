// reading-plan-gen.js — 읽기 계획 일별 분량 생성 함수
function _genFullBible(days){
  const all=[];
  [...BOOKS.OT,...BOOKS.NT].forEach(b=>{
    for(let c=1;c<=(CHCNT[b]||1);c++) all.push({book:b,ch:c});
  });
  return _distribute(all,days);
}
function _genNT(days){
  const all=[];
  BOOKS.NT.forEach(b=>{
    for(let c=1;c<=(CHCNT[b]||1);c++) all.push({book:b,ch:c});
  });
  return _distribute(all,days);
}
function _genPsalm(days){
  const all=[];
  for(let c=1;c<=150;c++) all.push({book:'시편',ch:c});
  return _distribute(all,days);
}
function _distribute(items,days){
  const result=[]; const per=Math.ceil(items.length/days);
  for(let i=0;i<days;i++){
    result.push(items.slice(i*per,(i+1)*per));
  }
  return result;
}
