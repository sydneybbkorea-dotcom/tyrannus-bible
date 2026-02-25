// e-code-renderer.js — 영어 단어 E코드 인라인 렌더러 + 패널 사전
let _eCodeMap = null;    // word → E-code
let _eCodeFull = null;   // word → {e, c, v, r}
let _eCodeLoading = null;

// E-dictionary 약어 → 한국어 책이름 매핑
const _eAbbrToKr = {
  'Gen':'창세기','Exo':'출애굽기','Lev':'레위기','Num':'민수기','Deu':'신명기',
  'Jos':'여호수아기','Jdg':'사사기','Rth':'룻기','Rut':'룻기',
  '1Sa':'사무엘기상','2Sa':'사무엘기하','1Ki':'열왕기상','2Ki':'열왕기하',
  '1Ch':'역대기상','2Ch':'역대기하','Ezr':'에스라','Neh':'느헤미야기',
  'Est':'에스더기','Job':'욥기','Psa':'시편','Pro':'잠언',
  'Ecc':'전도서','Sng':'솔로몬의아가','Son':'솔로몬의아가',
  'Isa':'이사야서','Jer':'예레미야서','Lam':'예레미야애가',
  'Eze':'에스겔서','Dan':'다니엘서','Hos':'호세아','Joe':'요엘',
  'Amo':'아모스','Oba':'오바댜','Jon':'요나','Mic':'미가',
  'Nah':'나훔','Hab':'하박국','Zep':'스바냐','Hag':'학개',
  'Zec':'스가랴','Mal':'말라기',
  'Mat':'마태복음','Mar':'마가복음','Luk':'누가복음','Joh':'요한복음',
  'Act':'사도행전','Rom':'로마서','1Co':'고린도전서','2Co':'고린도후서',
  'Gal':'갈라디아서','Eph':'에베소서','Phi':'빌립보서','Col':'골로새서',
  '1Th':'데살로니가전서','2Th':'데살로니가후서','1Ti':'디모데전서',
  '2Ti':'디모데후서','Tit':'디도서','Phm':'빌레몬서','Heb':'히브리서',
  'Jas':'야고보서','1Pe':'베드로전서','2Pe':'베드로후서',
  '1Jo':'요한일서','2Jo':'요한이서','3Jo':'요한삼서',
  'Jud':'유다서','Rev':'요한계시록'
};

async function loadECodeDict() {
  if (_eCodeMap) return;
  if (_eCodeLoading) return _eCodeLoading;
  _eCodeLoading = fetch('data/e-dictionary.json')
    .then(r => r.json())
    .then(arr => {
      _eCodeMap = {};
      _eCodeFull = {};
      arr.forEach(entry => {
        _eCodeMap[entry.w] = entry.e;
        _eCodeFull[entry.w] = entry;
      });
    });
  return _eCodeLoading;
}

// kjvTxt의 영어 단어마다 E코드 배지 삽입 (HTML 태그는 건너뜀)
function renderECodesInline(txt) {
  if (!_eCodeMap) return txt;
  return txt.replace(/(<[^>]+>)|([a-zA-Z]+)/g, (m, tag, word) => {
    if (tag) return tag;
    const key = word.toLowerCase();
    const code = _eCodeMap[key];
    if (!code) return word;
    return `${word}<span class="e-code" onclick="event.stopPropagation();showECodeDef('${key}')" title="${code}">${code}</span>`;
  });
}

// E코드 클릭 또는 검색 → 패널에서 단어 표시
async function showECodeDef(word) {
  if (!_eCodeFull) {
    toast('E사전 로딩 중...');
    await loadECodeDict();
  }
  const entry = _eCodeFull[word];
  const el = document.getElementById('dictECode');
  if (!el) return;

  if (!entry) {
    el.innerHTML = `<div class="comm-card"><div class="comm-txt" style="color:var(--text3)">"${word}" 항목을 찾을 수 없습니다.</div></div>`;
  } else {
    const refs = entry.r || [];
    const total = refs.length;
    const show = refs.slice(0, 50);
    const dw = _eDisplayWord(entry.w);
    let h = `<div class="comm-ref-lbl" style="color:#0bc">&#x1F4D6; ${entry.e} — ${dw}</div>`;
    h += `<div class="comm-card">`;
    h += `<div style="font-size:24px;font-weight:700;color:#0bc;margin-bottom:4px">${dw}</div>`;
    h += `<div style="font-size:12px;color:var(--text3);margin-bottom:10px">`;
    h += `출현 <b style="color:var(--text2)">${entry.c.toLocaleString()}</b>회 · `;
    h += `<b style="color:var(--text2)">${entry.v.toLocaleString()}</b>개 구절</div>`;
    h += `<div style="font-size:11px;font-weight:700;color:var(--text3);border-top:1px solid var(--border);padding-top:8px;margin-bottom:8px">성구 목록 (${total}개)</div>`;
    h += `<div id="eCodeVerseList" style="display:flex;flex-wrap:wrap;gap:5px">`;
    show.forEach(ref => { h += _eCodeRefBtn(ref, word); });
    h += `</div>`;
    if (total > 50) {
      h += `<button onclick="showECodeAllRefs('${word}')" style="width:100%;margin-top:8px;padding:6px;border-radius:5px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);cursor:pointer;font-size:11px">+ ${total - 50}개 더 보기</button>`;
    }
    h += `</div>`;
    el.innerHTML = h;
  }

  openPanel('dictionary');
  switchSub('dict-ecode');
  const inp = document.getElementById('ecodeSearchInput');
  if (inp) inp.value = word;
}

// 성구 참조 — 컴팩트 링크 버튼
function _eCodeRefBtn(ref, word) {
  const m = ref.match(/^(\S+)\s+(\d+):(\d+)$/);
  if (!m) return '';
  const abbr = m[1], ch = parseInt(m[2]), vn = parseInt(m[3]);
  const w = word || '';
  return `<button class="e-ref-btn" onclick="_eCodeNavRef('${abbr}',${ch},${vn},'${w}')">${ref}</button>`;
}

// 더보기: 전체 구절 표시
function showECodeAllRefs(word) {
  const entry = _eCodeFull?.[word];
  if (!entry) return;
  const el = document.getElementById('eCodeVerseList');
  if (!el) return;
  let h = '';
  (entry.r || []).forEach(ref => { h += _eCodeRefBtn(ref, word); });
  el.innerHTML = h;
  // 더보기 버튼 제거
  const btn = el.parentElement?.querySelector('button[onclick^="showECodeAllRefs"]');
  if (btn) btn.remove();
}

// 구절 클릭 → 해당 장으로 이동 + 단어 하이라이트
function _eCodeNavRef(abbr, ch, vn, word) {
  const kr = _eAbbrToKr[abbr] || abbr;
  window._eCodePendingHL = { vn, word };
  if (typeof openBibleTab === 'function') {
    openBibleTab(kr, ch, vn);
  } else {
    S.book = kr; S.ch = ch;
    S.selV = vn; S.selVSet = new Set([vn]);
    if (typeof renderAll === 'function') renderAll();
    else if (typeof renderBible === 'function') renderBible();
  }
  setTimeout(_eCodeApplyWordHL, 200);
}

// 이동 후 단어 하이라이트 적용
function _eCodeApplyWordHL() {
  const hl = window._eCodePendingHL;
  if (!hl) return;
  window._eCodePendingHL = null;
  const row = document.querySelector(`.vrow[data-v="${hl.vn}"]`);
  if (!row) return;
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // 행 전체 flash
  row.classList.add('e-row-flash');
  setTimeout(() => row.classList.remove('e-row-flash'), 1800);
  // 영어 텍스트에서 단어 하이라이트
  if (!hl.word) return;
  const enSpan = row.querySelector('.vtxt-en-side, .vtxt-en-only, .vtxt');
  if (!enSpan) return;
  const re = new RegExp(`(?<![a-zA-Z])(${hl.word})(?![a-zA-Z])`, 'gi');
  enSpan.innerHTML = enSpan.innerHTML.replace(re, '<mark class="e-word-hl">$1</mark>');
  setTimeout(() => {
    enSpan.querySelectorAll('mark.e-word-hl').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
  }, 2500);
}

// 패널 검색창에서 단어 검색
async function searchECode() {
  const q = (document.getElementById('ecodeSearchInput')?.value || '').trim().toLowerCase();
  if (!q) return;
  if (!_eCodeFull) {
    toast('E사전 로딩 중...');
    await loadECodeDict();
  }
  const exact = _eCodeFull[q];
  if (exact) { showECodeDef(q); return; }
  // 부분 일치 검색
  const el = document.getElementById('dictECode');
  if (!el) return;
  const matches = Object.keys(_eCodeFull).filter(w => w.startsWith(q)).slice(0, 40);
  if (!matches.length) {
    el.innerHTML = `<div class="comm-hint">검색 결과 없음: "${q}"</div>`;
    return;
  }
  let h = `<div class="comm-ref-lbl">검색: "${q}" (${matches.length}건)</div>`;
  matches.forEach(w => {
    const e = _eCodeFull[w];
    h += `<div class="comm-card" style="cursor:pointer;padding:7px 10px;margin-bottom:3px" onclick="showECodeDef('${w}')">`;
    h += `<span style="font-size:10px;color:#0bc;font-family:monospace">${e.e}</span> `;
    h += `<span style="font-weight:700;color:var(--text)">${_eDisplayWord(e.w)}</span> `;
    h += `<span style="font-size:10px;color:var(--text3)">${e.c.toLocaleString()}회 · ${e.v.toLocaleString()}구절</span>`;
    h += `</div>`;
  });
  el.innerHTML = h;
}

// 표시용 단어 보정 (Jesus 등 고유명사 대문자)
const _eProperCap = { 'jesus':'Jesus' };
function _eDisplayWord(word) {
  return _eProperCap[word] || word;
}

// 레거시 호환
function openEDictWord(word) {
  showECodeDef(word);
}
