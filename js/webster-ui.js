// webster-ui.js -- 웹스터 정의 카드 HTML 렌더링
function renderWebsterDef(data){
  if(!data||!data.length) return _websterEmpty();
  const w=data[0];
  let h=`<div class="comm-ref-lbl"><i class="fa fa-spell-check"></i> ${w.word}</div>`;
  h+=_websterPhonetic(w);
  if(w.meanings) w.meanings.forEach(m=>{ h+=_websterMeaning(m); });
  return h;
}
function _websterPhonetic(w){
  const ph=w.phonetics?.find(p=>p.text)||{};
  const audio=w.phonetics?.find(p=>p.audio)?.audio||'';
  let h='<div class="dict-phonetic">';
  if(ph.text) h+=`<span class="dict-ipa">${ph.text}</span>`;
  if(audio) h+=`<button class="dict-audio-btn" onclick="new Audio('${audio}').play()"><i class="fa fa-volume-up"></i></button>`;
  return h+'</div>';
}
function _websterMeaning(m){
  let h=`<div class="comm-card"><div class="dict-pos">${m.partOfSpeech||''}</div>`;
  (m.definitions||[]).slice(0,5).forEach((d,i)=>{
    h+=`<div class="dict-def"><span class="dict-num">${i+1}.</span> ${d.definition||''}</div>`;
    if(d.example) h+=`<div class="dict-example">"${d.example}"</div>`;
  });
  if(m.synonyms?.length) h+=`<div class="dict-syn"><i class="fa fa-link"></i> ${m.synonyms.slice(0,8).join(', ')}</div>`;
  return h+'</div>';
}
function _websterEmpty(){
  return '<div class="comm-hint"><i class="fa fa-spell-check"></i>검색 결과가 없습니다<br><span style="font-size:11px;color:var(--text3)">다른 단어를 입력하세요</span></div>';
}
