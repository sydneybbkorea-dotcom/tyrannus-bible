// context-menu-copy.js — 다중 구절 복사 헬퍼
function _getSelVerses(){
  const set=S.selVSet||new Set();
  return set.size?[...set].sort((a,b)=>a-b):(S.selV?[S.selV]:[]);
}
function _buildCopyData(arr){
  let html='',plain='';
  arr.forEach((vn,i)=>{
    const t=BIBLE[S.book]?.[S.ch]?.[vn-1]||'', p=t.replace(/<[^>]+>/g,'');
    const ref=`${S.book} ${S.ch}:${vn}`;
    html+=`<b style="font-family:'KoPubWorld Dotum',sans-serif;font-size:12px;color:#c9973a;">${ref}</b><br><span style="font-family:'KoPubWorld Batang','Noto Serif KR',serif;">${t}</span>`;
    if(i<arr.length-1) html+='<br><br>';
    plain+=ref+'\n'+p+(i<arr.length-1?'\n\n':'');
  });
  return {html,plain};
}
function _buildCopyRefData(arr){
  let html='',plain='';
  arr.forEach((vn,i)=>{
    const t=BIBLE[S.book]?.[S.ch]?.[vn-1]||'', p=t.replace(/<[^>]+>/g,'');
    const ref=`${S.book} ${S.ch}:${vn}`;
    html+=`<span style="font-family:'KoPubWorld Dotum',sans-serif;font-size:12px;color:#c9973a;">${ref}</span> — <span style="font-family:'KoPubWorld Batang','Noto Serif KR',serif;">${p}</span>`;
    if(i<arr.length-1) html+='<br>';
    plain+=ref+' — '+p+(i<arr.length-1?'\n':'');
  });
  return {html,plain};
}
function _writeClip(html,plain,msg){
  try{
    navigator.clipboard.write([new ClipboardItem({
      'text/html':new Blob([html],{type:'text/html'}),
      'text/plain':new Blob([plain],{type:'text/plain'})
    })]).then(()=>showCopyRef(msg));
  }catch(e){ navigator.clipboard.writeText(plain).then(()=>showCopyRef(msg)); }
}
