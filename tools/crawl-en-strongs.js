// crawl-en-strongs.js -- bolls.life API에서 KJV 스트롱 데이터 크롤링
// 실행: node tools/crawl-en-strongs.js
const https=require('https');
const fs=require('fs');
const path=require('path');

const OT=['창세기','출애굽기','레위기','민수기','신명기','여호수아기','사사기','룻기','사무엘기상','사무엘기하','열왕기상','열왕기하','역대기상','역대기하','에스라','느헤미야기','에스더기','욥기','시편','잠언','전도서','솔로몬의아가','이사야서','예레미야서','예레미야애가','에스겔서','다니엘서','호세아','요엘','아모스','오바댜','요나','미가','나훔','하박국','스바냐','학개','스가랴','말라기'];
const NT=['마태복음','마가복음','누가복음','요한복음','사도행전','로마서','고린도전서','고린도후서','갈라디아서','에베소서','빌립보서','골로새서','데살로니가전서','데살로니가후서','디모데전서','디모데후서','디도서','빌레몬서','히브리서','야고보서','베드로전서','베드로후서','요한일서','요한이서','요한삼서','유다서','요한계시록'];
const ALL=[...OT,...NT];
const CHCNT={'창세기':50,'출애굽기':40,'레위기':27,'민수기':36,'신명기':34,'여호수아기':24,'사사기':21,'룻기':4,'사무엘기상':31,'사무엘기하':24,'열왕기상':22,'열왕기하':25,'역대기상':29,'역대기하':36,'에스라':10,'느헤미야기':13,'에스더기':10,'욥기':42,'시편':150,'잠언':31,'전도서':12,'솔로몬의아가':8,'이사야서':66,'예레미야서':52,'예레미야애가':5,'에스겔서':48,'다니엘서':12,'호세아':14,'요엘':3,'아모스':9,'오바댜':1,'요나':4,'미가':7,'나훔':3,'하박국':3,'스바냐':3,'학개':2,'스가랴':14,'말라기':4,'마태복음':28,'마가복음':16,'누가복음':24,'요한복음':21,'사도행전':28,'로마서':16,'고린도전서':16,'고린도후서':13,'갈라디아서':6,'에베소서':6,'빌립보서':4,'골로새서':4,'데살로니가전서':5,'데살로니가후서':3,'디모데전서':6,'디모데후서':4,'디도서':3,'빌레몬서':1,'히브리서':13,'야고보서':5,'베드로전서':5,'베드로후서':3,'요한일서':5,'요한이서':1,'요한삼서':1,'유다서':1,'요한계시록':22};

// 그룹 분류
const GROUPS={
  ot1:OT.slice(0,5), ot2:OT.slice(5,14), ot3:OT.slice(14,22), ot4:OT.slice(22),
  nt1:NT.slice(0,5), nt2:NT.slice(5,18), nt3:NT.slice(18)
};

function fetchJSON(url){ return new Promise((ok,no)=>{
  https.get(url,{headers:{'User-Agent':'Mozilla/5.0'}},res=>{
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(e)}}); res.on('error',no);
  }).on('error',no);
});}

function parseStrongs(text,isOT){
  const prefix=isOT?'H':'G';
  const results=[];
  // sup 태그 제거 (각주)
  text=text.replace(/<sup>.*?<\/sup>/g,'');
  const regex=/([^<]*?)<S>(\d+)<\/S>/g;
  let m;
  while((m=regex.exec(text))!==null){
    const word=m[1].replace(/<[^>]+>/g,'').trim();
    const code=prefix+m[2];
    if(word) results.push({word,code});
  }
  return results;
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function main(){
  const OUT=path.join(__dirname,'..','data','en-strongs');
  const PROGRESS=path.join(__dirname,'crawl-progress.json');
  let done={};
  if(fs.existsSync(PROGRESS)) done=JSON.parse(fs.readFileSync(PROGRESS,'utf8'));

  for(const[groupName,books] of Object.entries(GROUPS)){
    const data={};
    let skipGroup=true;
    for(const book of books){
      const chs=CHCNT[book];
      data[book]={};
      for(let ch=1;ch<=chs;ch++){
        const key=`${book}_${ch}`;
        if(done[key]){ data[book][ch]=done[key]; continue; }
        skipGroup=false;
        const bookNum=ALL.indexOf(book)+1;
        const isOT=bookNum<=39;
        const url=`https://bolls.life/get-text/KJV/${bookNum}/${ch}/`;
        try{
          const verses=await fetchJSON(url);
          const chData={};
          verses.forEach(v=>{
            const parsed=parseStrongs(v.text,isOT);
            if(parsed.length) chData[v.verse]=parsed;
          });
          data[book][ch]=chData;
          done[key]=chData;
          process.stdout.write(`\r${book} ${ch}/${chs}  `);
          await sleep(300);
        }catch(e){
          console.error(`\nError: ${book} ${ch}: ${e.message}`);
          await sleep(2000);
          ch--; // retry
        }
        // 10챕터마다 프로그레스 저장
        if(ch%10===0) fs.writeFileSync(PROGRESS,JSON.stringify(done));
      }
      console.log(`\n✓ ${book} (${chs}ch)`);
    }
    fs.writeFileSync(PROGRESS,JSON.stringify(done));
    const outFile=path.join(OUT,`en-strongs-${groupName}.json`);
    fs.writeFileSync(outFile,JSON.stringify(data));
    console.log(`=> ${outFile} (${(fs.statSync(outFile).size/1024).toFixed(0)}KB)`);
  }
  console.log('\nAll done!');
}
main().catch(e=>console.error(e));
