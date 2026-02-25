// generate-e-dict.cjs — KJV 영어 성경 단어 사전 생성
// E번호 부여 (알파벳순) + 출현 횟수 + 구절 주소
const fs = require('fs');
const path = require('path');

// ── 성경 데이터 로드 ──
const bible = require('./data/bible-en.json');
const bookNames = Object.keys(bible); // 한글 책 이름
// 영어 책 이름 (약어)
const EN_BOOKS = [
  'Gen','Exo','Lev','Num','Deu','Jos','Jdg','Rut','1Sa','2Sa',
  '1Ki','2Ki','1Ch','2Ch','Ezr','Neh','Est','Job','Psa','Pro',
  'Ecc','Sol','Isa','Jer','Lam','Eze','Dan','Hos','Joe','Amo',
  'Oba','Jon','Mic','Nah','Hab','Zep','Hag','Zec','Mal',
  'Mat','Mar','Luk','Joh','Act','Rom','1Co','2Co','Gal','Eph',
  'Phi','Col','1Th','2Th','1Ti','2Ti','Tit','Phm','Heb','Jam',
  '1Pe','2Pe','1Jo','2Jo','3Jo','Jud','Rev'
];

console.log('성경 데이터 로드 완료:', bookNames.length, '권');

// ── 1단계: 모든 단어 추출 + 위치 기록 ──
const wordMap = {}; // { word: { count, refs: ["Gen 1:1", ...] } }
let totalWords = 0;

bookNames.forEach((bookKo, bi) => {
  const bookEn = EN_BOOKS[bi] || bookKo;
  const chapters = bible[bookKo];
  const chKeys = Object.keys(chapters).sort((a,b) => +a - +b);

  chKeys.forEach(ch => {
    const verses = chapters[ch];
    verses.forEach((vText, vi) => {
      // HTML 태그 제거 (<i>, </i> 등)
      const clean = vText.replace(/<[^>]+>/g, '');
      // 단어 추출: 알파벳만 (하이픈 단어는 분리)
      const words = clean.match(/[a-zA-Z]+/g);
      if (!words) return;

      const ref = bookEn + ' ' + ch + ':' + (vi + 1);

      words.forEach(w => {
        const lower = w.toLowerCase();
        totalWords++;
        if (!wordMap[lower]) {
          wordMap[lower] = { count: 0, refs: [] };
        }
        wordMap[lower].count++;
        // 구절 주소는 중복 방지 (같은 절에 여러 번 나올 수 있음)
        const lastRef = wordMap[lower].refs[wordMap[lower].refs.length - 1];
        if (lastRef !== ref) {
          wordMap[lower].refs.push(ref);
        }
      });
    });
  });
});

// ── 2단계: 알파벳순 정렬 + E번호 부여 ──
const sortedWords = Object.keys(wordMap).sort();
console.log('고유 단어 수:', sortedWords.length);
console.log('총 단어 수 (중복 포함):', totalWords);

const dictEntries = sortedWords.map((word, idx) => {
  const eNum = 'E' + String(idx + 1).padStart(5, '0');
  const info = wordMap[word];
  return {
    eNum,
    word,
    count: info.count,
    verseCount: info.refs.length,
    refs: info.refs
  };
});

// ── 3단계: JSON 저장 (웹용) ──
// 전 권 고르게 샘플링: ≤200개면 전부, >200이면 책별로 최대 5개씩 배분
function sampleRefsAcrossBooks(refs, maxPerBook) {
  if (refs.length <= 200) return refs;
  const byBook = {};
  refs.forEach(ref => {
    const book = ref.split(' ')[0];
    if (!byBook[book]) byBook[book] = [];
    byBook[book].push(ref);
  });
  const result = [];
  Object.values(byBook).forEach(bookRefs => {
    // 책 내에서 균등 간격으로 maxPerBook개 선택
    const step = bookRefs.length / maxPerBook;
    for (let i = 0; i < maxPerBook && i < bookRefs.length; i++) {
      result.push(bookRefs[Math.min(Math.floor(i * step), bookRefs.length - 1)]);
    }
  });
  return result;
}

const webDict = dictEntries.map(e => ({
  e: e.eNum,
  w: e.word,
  c: e.count,
  v: e.verseCount,
  r: sampleRefsAcrossBooks(e.refs, 5)
}));

fs.writeFileSync(
  path.join(__dirname, 'data', 'e-dictionary.json'),
  JSON.stringify(webDict)
);
console.log('data/e-dictionary.json 저장 완료');

// ── 4단계: CSV 저장 (엑셀 호환) ──
// BOM 추가 (엑셀에서 한글 깨짐 방지)
let csv = '\uFEFF';
csv += 'E번호,단어(Word),출현횟수(Count),절수(Verses),뜻(Meaning),구절주소(References)\n';

dictEntries.forEach(e => {
  const refsStr = e.refs.slice(0, 100).join('; '); // 최대 100개
  // CSV 이스케이프: 쉼표나 따옴표가 있으면 감싸기
  csv += e.eNum + ',' + e.word + ',' + e.count + ',' + e.verseCount + ',,' + '"' + refsStr.replace(/"/g, '""') + '"\n';
});

fs.writeFileSync(
  path.join(__dirname, 'data', 'e-dictionary.csv'),
  csv
);
console.log('data/e-dictionary.csv 저장 완료');

// ── 통계 출력 ──
console.log('\n=== 통계 ===');
console.log('고유 단어:', sortedWords.length);
console.log('총 출현:', totalWords);
console.log('첫 10개:', dictEntries.slice(0, 10).map(e => e.eNum + ' ' + e.word + ' (' + e.count + ')').join(', '));
console.log('마지막 10개:', dictEntries.slice(-10).map(e => e.eNum + ' ' + e.word + ' (' + e.count + ')').join(', '));

// 출현 빈도 top 20
const byCount = [...dictEntries].sort((a, b) => b.count - a.count);
console.log('\n출현 빈도 Top 20:');
byCount.slice(0, 20).forEach(e => {
  console.log('  ' + e.eNum + ' ' + e.word + ': ' + e.count + '회 (' + e.verseCount + '절)');
});
