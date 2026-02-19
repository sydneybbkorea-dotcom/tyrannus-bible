// strongs-ui-def.js — Strong's 사전 정의 + 단어 연구 통합
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
    let h=`<div class="comm-ref-lbl">${langIcon} ${code} — ${lang}</div>`;
    h+=`<div class="comm-card">`;
    h+=`<div style="font-size:28px;font-weight:700;color:var(--gold2);margin-bottom:6px;line-height:1.4">${entry.lemma}</div>`;
    h+=`<div style="font-size:13px;color:var(--text2);margin-bottom:10px">`;
    h+=`<span style="color:var(--text3)">음역:</span> ${entry.translit} &nbsp;`;
    h+=`<span style="color:var(--text3)">발음:</span> ${entry.pron}</div>`;
    h+=`<div style="font-size:14px;color:var(--text);line-height:1.8;margin-bottom:12px">${entry.def}</div>`;
    h+=`<div style="font-size:11px;color:var(--text3);border-top:1px solid var(--border);padding-top:8px">`;
    h+=`<span style="font-weight:700">KJV 번역:</span> ${entry.kjv}</div>`;
    h+=`<div id="wsContainer"></div>`;
    h+=`</div>`;
    el.innerHTML=h;
    // 비동기로 단어 연구 로드
    if(typeof showWordStudy==='function'){
      const ws=await showWordStudy(code);
      const wc=document.getElementById('wsContainer');
      if(wc&&ws) wc.innerHTML=ws;
    }
  }

  openPanel('dictionary');
  switchSub('dict-strongs');
}
