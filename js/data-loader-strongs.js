// data-loader-strongs.js -- 스트롱 원어 데이터 lazy 로더
var STRONGS_HEB=null, STRONGS_GRK=null;
var EN_STRONGS={};
var STRONGS_REV_OT=null, STRONGS_REV_NT=null;

async function loadStrongsDict(type){
  if(type==='heb'&&STRONGS_HEB) return;
  if(type==='grk'&&STRONGS_GRK) return;
  var f=type==='heb'?'strongs-dict-heb.json':'strongs-dict-grk.json';
  var res=await fetch('data/'+f);
  var d=await res.json();
  if(type==='heb') STRONGS_HEB=d; else STRONGS_GRK=d;
}

async function loadEnStrongs(group){
  if(EN_STRONGS[group]) return;
  var res=await fetch('data/en-strongs/en-strongs-'+group+'.json');
  EN_STRONGS[group]=await res.json();
}

async function loadStrongsReverse(testament){
  if(testament==='ot'&&STRONGS_REV_OT) return;
  if(testament==='nt'&&STRONGS_REV_NT) return;
  var res=await fetch('data/strongs-reverse-'+testament+'.json');
  if(testament==='ot') STRONGS_REV_OT=await res.json();
  else STRONGS_REV_NT=await res.json();
}
