// adv-search-engine.js — KJPBS 스타일 쿼리 파서 + 와일드카드→정규식 + 절 매칭 엔진
function _advParseQuery(raw, cs){
  if(!raw||!raw.trim()) return null;
  const branches=raw.split('|').map(b=>b.trim()).filter(Boolean);
  return branches.map(b=>_advParseBranch(b,cs));
}

function _advParseBranch(str,cs){
  const tokens=_advTokenize(str);
  const inc=[], exc=[];
  tokens.forEach(t=>{
    if(t.startsWith('-')&&t.length>1){
      const v=t.slice(1);
      exc.push(_advMakeItem(v,cs));
    } else {
      inc.push(_advMakeItem(t,cs));
    }
  });
  return {inc,exc};
}

function _advTokenize(str){
  const tokens=[]; let i=0;
  while(i<str.length){
    if(str[i]===' '||str[i]==='\t'){i++;continue;}
    const neg=str[i]==='-'&&i+1<str.length;
    const start=neg?i+1:i;
    if(str[start]==='"'||str[start]==='\u201c'){
      const close=str[start]==='"'?'"':'\u201d';
      const end=str.indexOf(close,start+1);
      const phrase=end>0?str.slice(start+1,end):str.slice(start+1);
      tokens.push((neg?'-':'')+'"'+phrase+'"');
      i=end>0?end+1:str.length;
    } else {
      let end=start;
      while(end<str.length&&str[end]!==' '&&str[end]!=='\t') end++;
      tokens.push((neg?'-':'')+str.slice(start,end));
      i=end;
    }
  }
  return tokens;
}
