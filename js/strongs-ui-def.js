// strongs-ui-def.js — Strong's 사전 정의 + 단어 연구 통합
async function showStrongDef(code){
  var isHeb=code.startsWith('H');
  // 새 완전한 사전 로드 시도
  if(typeof loadStrongsDict==='function'){
    await loadStrongsDict(isHeb?'heb':'grk');
  }
  await loadStrongs(); // 기존 한국어 사전 폴백
  var dict=isHeb?STRONGS_HEB:STRONGS_GRK;
  var entry=(dict&&dict[code])||STRONGS[code];
  var el=document.getElementById('dictStrongs');
  if(!el) return;

  if(!entry){
    el.innerHTML='<div class="comm-ref-lbl">'+code+'</div><div class="comm-card"><div class="comm-txt" style="color:var(--text3)">해당 스트롱 번호의 데이터가 아직 준비되지 않았습니다.</div></div>';
  } else {
    var lang=isHeb?'히브리어':'그리스어';
    var icon=isHeb?'🇮🇱':'🇬🇷';
    var tr=entry.translit||entry.xlit||'';
    var df=entry.def||entry.strongs_def||'';
    var kj=entry.kjv||entry.kjv_def||'';
    var h='<div class="comm-ref-lbl">'+icon+' '+code+' — '+lang+'</div>';
    h+='<div class="comm-card">';
    h+='<div style="font-size:28px;font-weight:700;color:var(--gold2);margin-bottom:6px;line-height:1.4">'+entry.lemma+'</div>';
    h+='<div style="font-size:13px;color:var(--text2);margin-bottom:10px">';
    h+='<span style="color:var(--text3)">음역:</span> '+tr+' &nbsp;';
    h+='<span style="color:var(--text3)">발음:</span> '+(entry.pron||'')+'</div>';
    h+='<div style="font-size:14px;color:var(--text);line-height:1.8;margin-bottom:12px">'+df+'</div>';
    if(entry.derivation) h+='<div style="font-size:11px;color:var(--text3);margin-bottom:8px">'+entry.derivation+'</div>';
    h+='<div style="font-size:11px;color:var(--text3);border-top:1px solid var(--border);padding-top:8px">';
    h+='<span style="font-weight:700">KJV:</span> '+kj+'</div>';
    h+='<div id="wsContainer"></div></div>';
    el.innerHTML=h;
    // 비동기로 단어 연구 로드
    if(typeof showWordStudy==='function'){
      var ws=await showWordStudy(code);
      var wc=document.getElementById('wsContainer');
      if(wc&&ws) wc.innerHTML=ws;
    }
  }
  openPanel('dictionary'); switchSub('dict-strongs');
}
