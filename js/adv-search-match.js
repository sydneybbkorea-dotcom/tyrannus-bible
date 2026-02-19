// adv-search-match.js — 와일드카드→정규식 변환 + 절 매칭 로직
function _advMakeItem(token,cs){
  const isPhrase=token.startsWith('"')&&token.endsWith('"');
  const raw=isPhrase?token.slice(1,-1):token;
  const hasWild=raw.includes('*')||raw.includes('?');
  const regex=_advWildcardToRegex(raw,cs);
  return {raw,isPhrase,hasWild,regex};
}

function _advWildcardToRegex(pat,cs){
  const esc=pat.replace(/([.+^${}()[\]\\])/g,'\\$1');
  const rx=esc.replace(/\*/g,'.*').replace(/\?/g,'.');
  try{return new RegExp(rx,cs?'g':'gi');}
  catch(e){return new RegExp(_advEscFull(pat),cs?'g':'gi');}
}

function _advEscFull(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
}

function _advMatchVerse(text,parsed){
  if(!parsed||!text) return null;
  for(let b=0;b<parsed.length;b++){
    const br=parsed[b];
    const m=_advMatchBranch(text,br);
    if(m) return m;
  }
  return null;
}

function _advMatchBranch(text,branch){
  for(const ex of branch.exc){
    ex.regex.lastIndex=0;
    if(ex.regex.test(text)) return null;
  }
  const positions=[];
  for(const inc of branch.inc){
    inc.regex.lastIndex=0;
    const m=text.match(inc.regex);
    if(!m) return null;
    inc.regex.lastIndex=0;
    let rm; while((rm=inc.regex.exec(text))!==null){
      positions.push({s:rm.index,e:rm.index+rm[0].length});
    }
  }
  return {matched:true,positions,count:positions.length};
}
