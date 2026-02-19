// build-strongs-dict.js -- openscriptures에서 스트롱 사전 다운로드/변환
// 실행: node tools/build-strongs-dict.js
const https=require('https');
const fs=require('fs');
const path=require('path');

const HEB_URL='https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js';
const GRK_URL='https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js';
const OUT=path.join(__dirname,'..','data');

function fetch(url){
  return new Promise((ok,no)=>{
    https.get(url,{headers:{'User-Agent':'Mozilla/5.0'}},res=>{
      if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){
        return fetch(res.headers.location).then(ok,no);
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>ok(d)); res.on('error',no);
    }).on('error',no);
  });
}

function parseDict(raw,prefix){
  // openscriptures format: var defined as JS object assignment
  // Extract JSON-like content between first { and last }
  const start=raw.indexOf('{'), end=raw.lastIndexOf('}');
  if(start<0||end<0) throw new Error('Cannot parse dictionary');
  let jsonStr=raw.substring(start,end+1);
  // Fix: some entries use single quotes, convert
  const obj=eval('('+jsonStr+')');
  const result={};
  for(const[key,val] of Object.entries(obj)){
    const code=prefix+key.replace(/\D/g,'');
    result[code]={
      lemma:val.lemma||'',
      translit:val.xlit||val.translit||'',
      pron:val.pron||'',
      def:val.strongs_def||val.kjv_def||'',
      kjv:val.kjv_def||'',
      derivation:val.derivation||''
    };
  }
  return result;
}

async function main(){
  console.log('Downloading Hebrew dictionary...');
  const hebRaw=await fetch(HEB_URL);
  const heb=parseDict(hebRaw,'H');
  fs.writeFileSync(path.join(OUT,'strongs-dict-heb.json'),JSON.stringify(heb));
  console.log(`Hebrew: ${Object.keys(heb).length} entries`);

  console.log('Downloading Greek dictionary...');
  const grkRaw=await fetch(GRK_URL);
  const grk=parseDict(grkRaw,'G');
  fs.writeFileSync(path.join(OUT,'strongs-dict-grk.json'),JSON.stringify(grk));
  console.log(`Greek: ${Object.keys(grk).length} entries`);
  console.log('Done!');
}
main().catch(e=>console.error(e));
