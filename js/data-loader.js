// ═══════════════════════════════════════════════════
// DATA LOADER — 성경 데이터 비동기 로딩
// ═══════════════════════════════════════════════════
let BIBLE = null;
let KJV = null;
let COMMENTARY = null;
let XREFS = null;
let STRONGS = null;
let VERSE_STRONGS = null;

async function loadBibleKR() {
  if (BIBLE) return BIBLE;
  const res = await fetch('data/bible-kr.json');
  BIBLE = await res.json();
  return BIBLE;
}
async function loadBibleEN() {
  if (KJV) return KJV;
  const res = await fetch('data/bible-en.json');
  KJV = await res.json();
  // 한글성경 키 ↔ 영어성경 키 불일치 보정
  var alias = {
    '여호수아기':'여호수아','사무엘기상':'사무엘상','사무엘기하':'사무엘하',
    '느헤미야기':'느헤미야','에스더기':'에스더','솔로몬의아가':'아가',
    '이사야서':'이사야','예레미야서':'예레미야','에스겔서':'에스겔','다니엘서':'다니엘'
  };
  for (var k in alias) { if (KJV[alias[k]] && !KJV[k]) KJV[k] = KJV[alias[k]]; }
  return KJV;
}
async function loadCommentary() {
  if (COMMENTARY) return;
  const res = await fetch('data/commentary.json');
  const d = await res.json();
  COMMENTARY = d.commentary;
  XREFS = d.xrefs;
}
async function loadStrongs() {
  if (STRONGS) return;
  const res = await fetch('data/strongs.json');
  STRONGS = await res.json();
}
async function loadVerseStrongs() {
  if (VERSE_STRONGS) return;
  const res = await fetch('data/verse-strongs.json');
  VERSE_STRONGS = await res.json();
}
