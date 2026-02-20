// enko-ui.js -- 영한 결과 카드 렌더링 (번역 + 정의)
function renderEnkoDef(data,translation){
  if(!data?.length&&!translation) return _enkoEmpty();
  let h='';
  if(data?.length){
    const w=data[0];
    h+=`<div class="comm-ref-lbl"><i class="fa fa-exchange-alt"></i> ${w.word}</div>`;
    if(translation) h+=_enkoKoCard(translation);
    h+=_enkoPhonetic(w);
    if(w.meanings) w.meanings.forEach(m=>{ h+=_enkoMeaning(m); });
  }else if(translation){
    h+='<div class="comm-ref-lbl"><i class="fa fa-language"></i> '+t('enko.trans')+'</div>';
    h+=_enkoKoCard(translation);
  }
  return h;
}
function _enkoKoCard(t){
  return `<div class="dict-ko-card"><span class="dict-ko-label">${window.t('enko.korean')}</span><span class="dict-ko-text">${t}</span></div>`;
}
function _enkoPhonetic(w){
  const ph=w.phonetics?.find(p=>p.text)||{};
  const audio=w.phonetics?.find(p=>p.audio)?.audio||'';
  let h='<div class="dict-phonetic">';
  if(ph.text) h+=`<span class="dict-ipa">${ph.text}</span>`;
  if(audio) h+=`<button class="dict-audio-btn" onclick="new Audio('${audio}').play()"><i class="fa fa-volume-up"></i></button>`;
  return h+'</div>';
}
function _enkoMeaning(m){
  let h=`<div class="comm-card"><div class="dict-pos">${m.partOfSpeech||''}</div>`;
  (m.definitions||[]).slice(0,3).forEach((d,i)=>{
    h+=`<div class="dict-def"><span class="dict-num">${i+1}.</span> ${d.definition||''}</div>`;
  });
  return h+'</div>';
}
function _enkoEmpty(){
  return '<div class="comm-hint"><i class="fa fa-exchange-alt"></i>'+t('enko.no.result')+'</div>';
}
