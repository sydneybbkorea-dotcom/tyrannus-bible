async function toggleStrongCodes(){
  S.showStrong = !S.showStrong;
  document.getElementById('tbStrong')?.classList.toggle('on', S.showStrong);
  if(S.showStrong){
    await Promise.all([loadStrongs(), loadVerseStrongs()]);
  }
  renderBible(); restoreSel();
  toast(S.showStrong ? '원어 코드 표시 ON' : '원어 코드 표시 OFF');
}

async function toggleParallel(){
  S.showParallel = !S.showParallel;
  document.getElementById('tbParallel')?.classList.toggle('on', S.showParallel);
  if(S.showParallel){
    await loadBibleEN();
  }
  renderBible(); restoreSel();
  toast(S.showParallel ? '영한 대조 ON' : '영한 대조 OFF');
}

async function showStrongDef(code){
  await loadStrongs();
  const entry = STRONGS[code];
  const el = document.getElementById('dictStrongs');
  if(!el) return;

  if(!entry){
    el.innerHTML=`<div class="comm-ref-lbl">${code}</div><div class="comm-card"><div class="comm-txt" style="color:var(--text3)">해당 스트롱 번호의 데이터가 아직 준비되지 않았습니다.</div></div>`;
  } else {
    const lang = code.startsWith('H') ? '히브리어' : '그리스어';
    const langIcon = code.startsWith('H') ? '🇮🇱' : '🇬🇷';
    el.innerHTML=`
      <div class="comm-ref-lbl">${langIcon} ${code} — ${lang}</div>
      <div class="comm-card">
        <div style="font-size:28px;font-weight:700;color:var(--gold2);margin-bottom:6px;line-height:1.4">${entry.lemma}</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:10px">
          <span style="color:var(--text3)">음역:</span> ${entry.translit} &nbsp;
          <span style="color:var(--text3)">발음:</span> ${entry.pron}
        </div>
        <div style="font-size:14px;color:var(--text);line-height:1.8;margin-bottom:12px">${entry.def}</div>
        <div style="font-size:11px;color:var(--text3);border-top:1px solid var(--border);padding-top:8px">
          <span style="font-weight:700">KJV 번역:</span> ${entry.kjv}
        </div>
      </div>
    `;
  }

  openPanel('dictionary');
  switchSub('dict-strongs');
}

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
