// enko-api.js -- 영어 정의 + 한국어 번역 API fetch
async function fetchEnkoDef(word){
  const url='https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word);
  const res=await fetch(url);
  if(!res.ok) return null;
  return await res.json();
}
async function fetchEnkoTranslation(word){
  const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(word)+'&langpair=en|ko';
  const res=await fetch(url);
  if(!res.ok) return null;
  const d=await res.json();
  return d?.responseData?.translatedText||null;
}
