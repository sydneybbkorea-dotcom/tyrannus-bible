// strongs-ui-search.js — search Strong's concordance entries
async function searchStrongs(){
  await loadStrongs();
  const input = document.getElementById('strongsSearchInput');
  if(!input) return;
  const q = input.value.trim().toUpperCase();
  if(!q){ toast('검색어를 입력하세요'); return; }

  const el = document.getElementById('dictStrongs');
  if(!el) return;

  if(STRONGS[q]){
    showStrongDef(q);
    return;
  }

  const results = Object.entries(STRONGS).filter(([code, e])=>{
    const target = `${code} ${e.lemma} ${e.translit} ${e.pron} ${e.def} ${e.kjv}`.toUpperCase();
    return target.includes(q);
  });

  if(!results.length){
    el.innerHTML=`<div class="comm-ref-lbl">검색: "${input.value.trim()}"</div><div class="comm-card"><div class="comm-txt" style="color:var(--text3)">일치하는 결과가 없습니다.</div></div>`;
    return;
  }

  let html=`<div class="comm-ref-lbl">검색 결과 (${results.length}건)</div>`;
  results.forEach(([code, e])=>{
    const lang = code.startsWith('H') ? '히' : '헬';
    html+=`<div class="strongs-result" onclick="showStrongDef('${code}')">
      <span class="str-badge ${code.startsWith('H')?'str-heb':'str-grk'}">${lang}</span>
      <span class="str-result-code">${code}</span>
      <span class="str-result-lemma">${e.lemma}</span>
      <span class="str-result-translit">${e.translit}</span>
      <span class="str-result-def">${e.def.slice(0,40)}${e.def.length>40?'…':''}</span>
    </div>`;
  });
  el.innerHTML=html;
}
