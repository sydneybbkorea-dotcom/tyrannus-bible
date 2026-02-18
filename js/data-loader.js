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
