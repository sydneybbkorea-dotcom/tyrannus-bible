// webster-api.js -- Free Dictionary API fetch 래퍼
async function fetchWebsterDef(word){
  const url='https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word);
  const res=await fetch(url);
  if(!res.ok) return null;
  return await res.json();
}
