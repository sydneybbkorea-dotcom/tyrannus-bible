// build-reverse-index.js -- en-strongs 데이터에서 역인덱스 생성
// 실행: node tools/build-reverse-index.js
const fs=require('fs');
const path=require('path');
const DIR=path.join(__dirname,'..','data','en-strongs');
const OUT=path.join(__dirname,'..','data');

const files=['en-strongs-ot1.json','en-strongs-ot2.json','en-strongs-ot3.json','en-strongs-ot4.json',
             'en-strongs-nt1.json','en-strongs-nt2.json','en-strongs-nt3.json'];

const revOT={}, revNT={};

files.forEach(f=>{
  const fp=path.join(DIR,f);
  if(!fs.existsSync(fp)){console.log('Skip:',f);return;}
  const data=JSON.parse(fs.readFileSync(fp,'utf8'));
  const isOT=f.includes('-ot');
  Object.entries(data).forEach(([book,chs])=>{
    Object.entries(chs).forEach(([ch,verses])=>{
      Object.entries(verses).forEach(([vn,words])=>{
        const key=book+'_'+ch+'_'+vn;
        words.forEach(w=>{
          if(!w.code) return;
          const rev=isOT?revOT:revNT;
          if(!rev[w.code]) rev[w.code]=[];
          // 중복 방지
          if(!rev[w.code].includes(key)) rev[w.code].push(key);
        });
      });
    });
  });
  console.log('Processed:',f);
});

fs.writeFileSync(path.join(OUT,'strongs-reverse-ot.json'),JSON.stringify(revOT));
fs.writeFileSync(path.join(OUT,'strongs-reverse-nt.json'),JSON.stringify(revNT));
const otCodes=Object.keys(revOT).length, ntCodes=Object.keys(revNT).length;
console.log('OT codes:',otCodes,'NT codes:',ntCodes);
console.log('Done!');
