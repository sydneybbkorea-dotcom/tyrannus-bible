// advanced-search-render.js — 원어 검색 결과 렌더링 + 원어 검색 로직
async function _advSearchOriginal(q){
  await Promise.all([loadStrongs(), loadVerseStrongs()]);
  if(!VERSE_STRONGS) return [];
  const code=q.toUpperCase().trim(), r=[];
  Object.entries(VERSE_STRONGS).forEach(([key, words])=>{
    words.forEach(w=>{
      if(w.codes&&w.codes.includes(code)){
        const p=key.split('_'), book=p.slice(0,-2).join('_');
        r.push({book,ch:+p[p.length-2],v:+p[p.length-1],text:w.word,code});
      }
    });
  });
  return r;
}
function _advRenderResults(results, q){
  const c=document.getElementById('advResults'); if(!c) return;
  if(!results.length){
    c.innerHTML='<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">검색 결과가 없습니다</div>';
    return;
  }
  let h=`<div style="padding:6px 10px;font-size:10px;color:var(--text3);border-bottom:1px solid var(--border)">${results.length}개 결과</div>`;
  results.slice(0,100).forEach(r=>{
    const ref=`${r.book} ${r.ch}:${r.v}`;
    const txt=(r.text||'').replace(/<[^>]+>/g,'').slice(0,60);
    h+=`<div class="sp-note-item" onclick="_advNav('${r.book}',${r.ch},${r.v})" style="flex-direction:column;align-items:flex-start;gap:2px">`;
    h+=`<span style="font-size:10px;color:var(--gold);font-family:'JetBrains Mono',monospace">${ref}</span>`;
    h+=`<span style="font-size:11px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">${txt}</span></div>`;
  });
  c.innerHTML=h;
}
function _advNav(b,ch,v){
  S.book=b; S.ch=ch; S.selV=v; S.selVSet=new Set([v]);
  updateNavPickerLabel(); renderAll();
  setTimeout(()=>document.querySelector(`.vrow[data-v="${v}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),200);
}
function renderAdvSearch(){
  const c=document.getElementById('spOriginalContent'); if(!c) return;
  let h=`<div class="ws-tabs" style="padding:0 10px;margin:10px 0 0">`;
  h+=`<div class="adv-tab ws-tab${_advMode==='korean'?' active':''}" data-mode="korean" onclick="_advSetMode('korean')">한글</div>`;
  h+=`<div class="adv-tab ws-tab${_advMode==='english'?' active':''}" data-mode="english" onclick="_advSetMode('english')">영어</div>`;
  h+=`<div class="adv-tab ws-tab${_advMode==='original'?' active':''}" data-mode="original" onclick="_advSetMode('original')">원어</div>`;
  h+=`</div>`;
  h+=`<div class="sp-search-wrap"><input type="text" id="advSearchInput" placeholder="한글 검색어..." onkeydown="if(event.key==='Enter')_advDoSearch()"></div>`;
  h+=`<div id="advResults" style="flex:1;overflow-y:auto"></div>`;
  c.innerHTML=h;
}
