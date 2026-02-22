// context-menu-copy.js — 다중 구절 복사 헬퍼
function _getSelVerses(){
  const set=S.selVSet||new Set();
  return set.size?[...set].sort((a,b)=>a-b):(S.selV?[S.selV]:[]);
}

/* 실제 렌더링된 본문 스타일 읽기 */
function _getVtxtStyle(){
  var el=document.querySelector('.vtxt');
  if(!el) return {fs:'17px',lh:'1.85',ls:'0.02em',fw:'500'};
  var cs=getComputedStyle(el);
  return {fs:cs.fontSize||'17px', lh:cs.lineHeight||'1.85', ls:cs.letterSpacing||'0.02em', fw:cs.fontWeight||'500'};
}

/* 본문 HTML의 클래스 기반 스타일을 인라인 스타일로 변환 */
function _inlineStyles(html, vs){
  var base="font-family:'KoPubWorld Batang','Noto Serif KR',serif;font-size:"+vs.fs+";font-weight:"+vs.fw+";line-height:"+vs.lh+";letter-spacing:"+vs.ls+";";
  var dotum="font-family:'KoPubWorld Dotum','Noto Sans KR',sans-serif;";
  // b.dg (모든 철자 대문자) → 돋움체 bold
  html=html.replace(/<b\s+class="dg">/g,'<b style="'+dotum+'font-weight:700;letter-spacing:0.02em;">');
  // b.dg.semi → 돋움체 medium
  html=html.replace(/<b\s+class="dg semi">/g,'<b style="'+dotum+'font-weight:500;">');
  // span.dg → 돋움체 light
  html=html.replace(/<span\s+class="dg">/g,'<span style="'+dotum+'font-weight:300;">');
  // b (바탕체 bold)
  html=html.replace(/<b>/g,'<b style="font-weight:700;">');
  // i (이탤릭)
  html=html.replace(/<i>/g,'<i style="font-style:italic;">');
  // mark 하이라이트 제거 (복사 시 불필요)
  html=html.replace(/<mark[^>]*>/g,'').replace(/<\/mark>/g,'');
  return '<span style="'+base+'">'+html+'</span>';
}

function _buildCopyData(arr){
  var vs=_getVtxtStyle();
  var refStyle="font-family:'KoPubWorld Dotum','Noto Sans KR',sans-serif;font-size:12px;color:#c9973a;font-weight:700;";
  let html='',plain='';
  arr.forEach((vn,i)=>{
    const t=BIBLE[S.book]?.[S.ch]?.[vn-1]||'', p=t.replace(/<[^>]+>/g,'');
    const ref=`${S.book} ${S.ch}:${vn}`;
    html+=`<b style="${refStyle}">${ref}</b><br>${_inlineStyles(t,vs)}`;
    if(i<arr.length-1) html+='<br><br>';
    plain+=ref+'\n'+p+(i<arr.length-1?'\n\n':'');
  });
  return {html,plain};
}
function _buildCopyRefData(arr){
  var vs=_getVtxtStyle();
  var refStyle="font-family:'KoPubWorld Dotum','Noto Sans KR',sans-serif;font-size:12px;color:#c9973a;font-weight:600;";
  let html='',plain='';
  arr.forEach((vn,i)=>{
    const t=BIBLE[S.book]?.[S.ch]?.[vn-1]||'', p=t.replace(/<[^>]+>/g,'');
    const ref=`${S.book} ${S.ch}:${vn}`;
    html+=`<span style="${refStyle}">${ref}</span> — ${_inlineStyles(p,vs)}`;
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
