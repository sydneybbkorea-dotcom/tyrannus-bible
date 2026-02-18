function showMarkMemo(mark, x, y){
  _activeMark = mark;
  let popup = document.getElementById('markMemoPopup');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'markMemoPopup';
    popup.style.cssText = `position:fixed;background:var(--bg3);border:1px solid var(--border2);
      border-radius:12px;padding:0;width:340px;z-index:9999;box-shadow:var(--shadow);overflow:hidden;
      display:flex;flex-direction:column;`;
    popup.innerHTML = `
      <!-- 헤더: 메모 이름 편집 -->
      <div style="padding:8px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--border);flex-shrink:0">
        <i class="fa fa-highlighter" style="color:var(--gold);font-size:12px;flex-shrink:0"></i>
        <input id="markMemoName" type="text" placeholder="하이라이트 메모"
          style="flex:1;background:transparent;border:none;color:var(--text);font-size:13px;font-weight:600;outline:none;padding:2px 0;min-width:0">
        <span onclick="closeMarkMemo()" style="cursor:pointer;color:var(--text3);font-size:15px;line-height:1;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .1s;flex-shrink:0" onmouseenter="this.style.background='var(--bg4)'" onmouseleave="this.style.background='none'">✕</span>
      </div>
      <!-- 본문: 메모 입력 + 태그 -->
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div id="markMemoText" contenteditable="true" style="
          flex:1;min-height:140px;max-height:260px;overflow-y:auto;
          padding:12px 14px;font-size:13px;color:var(--text);line-height:1.8;
          outline:none;font-family:'KoPub Batang',serif;
          border:none;background:transparent;"
          oninput="processVersLinks(this)"
          onkeydown="memoKeyHandler(event)"
          data-placeholder="메모를 입력하세요...&#10;&#10;[[창1:1]] 구절 링크 · / 스페이스로 노트 링크"></div>
        <!-- 태그 칩 영역 (본문 하단) -->
        <div id="memoTagChips" style="padding:0 14px 6px;display:flex;flex-wrap:wrap;gap:4px;min-height:0"></div>
      </div>
      <!-- 푸터: 태그 입력 + 버튼 -->
      <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-top:1px solid var(--border);background:var(--bg2);flex-shrink:0">
        <i class="fa fa-tags" style="font-size:10px;color:var(--text3);flex-shrink:0"></i>
        <input id="memoTagInp" type="text" placeholder="태그 입력 후 Enter..."
          style="flex:1;min-width:60px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:4px 8px;font-size:11px;color:var(--text);outline:none;"
          onkeydown="addMemoTag(event)">
        <button onclick="deleteMarkHL()" style="padding:4px 10px;border-radius:5px;border:1px solid var(--border2);
          background:transparent;color:var(--text3);font-size:11px;cursor:pointer;flex-shrink:0">
          <i class="fa fa-eraser"></i> 삭제
        </button>
        <button onclick="saveMarkMemo()" style="padding:4px 14px;border-radius:5px;border:none;
          background:var(--gold);color:var(--bg);font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0">
          저장
        </button>
      </div>`;
    document.body.appendChild(popup);
  }
  // 같은 그룹 mark 모두 강조
  const gid = mark.dataset.gid;
  document.querySelectorAll('mark[data-gid]').forEach(m => m.classList.remove('hl-active'));
  if(gid){
    document.querySelectorAll(`mark[data-gid="${gid}"]`).forEach(m => m.classList.add('hl-active'));
  } else {
    mark.classList.add('hl-active');
  }

  // 기존 데이터 불러오기
  const memoMark = gid ? document.querySelector(`mark[data-gid="${gid}"]`) : mark;
  const memoData = gid ? S.hlMemo?.[gid] : null;

  // 메모 이름
  const nameInp = document.getElementById('markMemoName');
  const existingName = memoData?.name || '';
  nameInp.value = existingName || `하이라이트 메모 ${Object.keys(S.hlMemo||{}).length + 1}`;

  // 메모 본문 (HTML로 복원 — 구절 링크 포함)
  const ta = document.getElementById('markMemoText');
  const memoHtml = memoData?.html || memoMark?.dataset.memo || '';
  ta.innerHTML = memoHtml || '';

  // 태그 불러오기
  _memoTags = [];
  if(memoData?.tags){ _memoTags = [...memoData.tags]; }
  renderMemoTags();

  // 위치 조정
  const pw = 340, ph = 340;
  let lx = Math.min(x, window.innerWidth - pw - 12);
  let ly = Math.min(y + 8, window.innerHeight - ph - 12);
  if(ly < 10) ly = 10;
  popup.style.left = lx + 'px';
  popup.style.top  = ly + 'px';
  popup.style.display = 'flex';

  setTimeout(()=>{ ta.focus(); }, 50);

  setTimeout(()=>{
    document.addEventListener('mousedown', _closeMemoOutside);
  }, 100);
}

// [[창1:1]] → 구절 하이퍼링크 변환 (입력 중 실시간)
function processVersLinks(el){
  // 커서 위치 저장
  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  // 텍스트 노드에서 [[...]] 패턴 찾기
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  const toReplace = [];
  while(node = tw.nextNode()){
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;
    while(match = regex.exec(node.textContent)){
      toReplace.push({node, match: match[0], ref: match[1], index: match.index});
    }
  }

  if(!toReplace.length) return;

  // 역순으로 교체 (offset 깨짐 방지)
  toReplace.reverse().forEach(({node, match, ref, index})=>{
    // [[창1:1]] → 창세기_1_1 형식 파싱
    const parsed = parseMemoVerseRef(ref);
    if(!parsed) return;

    const before = node.textContent.substring(0, index);
    const after  = node.textContent.substring(index + match.length);

    const textBefore = document.createTextNode(before);
    const link = document.createElement('span');
    link.className = 'memo-vlink';
    link.dataset.ref = parsed.key;
    link.dataset.label = ref;
    link.contentEditable = 'false';
    link.setAttribute('onclick', `event.stopPropagation();navByKey('${parsed.key}')`);
    link.innerHTML = `<i class="fa fa-book-open" style="font-size:9px"></i> ${ref}`;
    const textAfter = document.createTextNode(after);
    const frag = document.createDocumentFragment();
    frag.appendChild(textBefore);
    frag.appendChild(link);
    // 링크 뒤에 빈 문자 추가 (커서 이동용)
    frag.appendChild(document.createTextNode('\u200B'));
    frag.appendChild(textAfter);
    node.parentNode.replaceChild(frag, node);
  });

  // 커서를 끝으로 이동
  const newRange = document.createRange();
  newRange.selectNodeContents(el);
  newRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// [[창1:1]], [[창세기 1:1]], [[요3:16]] 등 파싱
function parseMemoVerseRef(ref){
  ref = ref.trim();
  // 약어 → 전체 이름 매핑
  const SHORT_MAP = {
    '창':'창세기','출':'출애굽기','레':'레위기','민':'민수기','신':'신명기',
    '수':'여호수아','삿':'사사기','룻':'룻기','삼상':'사무엘상','삼하':'사무엘하',
    '왕상':'열왕기상','왕하':'열왕기하','대상':'역대상','대하':'역대하',
    '스':'에스라','느':'느헤미야','에':'에스더','욥':'욥기','시':'시편',
    '잠':'잠언','전':'전도서','아':'아가','사':'이사야서','렘':'예레미야',
    '애':'예레미야애가','겔':'에스겔서','단':'다니엘서','호':'호세아',
    '욜':'요엘서','암':'아모스','옵':'오바댜','욘':'요나','미':'미가',
    '나':'나훔','합':'하박국','습':'스바냐','학':'학개','슥':'스가랴','말':'말라기',
    '마':'마태복음','막':'마가복음','눅':'누가복음','요':'요한복음',
    '행':'사도행전','롬':'로마서','고전':'고린도전서','고후':'고린도후서',
    '갈':'갈라디아서','엡':'에베소서','빌':'빌립보서','골':'골로새서',
    '살전':'데살로니가전서','살후':'데살로니가후서','딤전':'디모데전서','딤후':'디모데후서',
    '딛':'디도서','몬':'빌레몬서','히':'히브리서','약':'야고보서',
    '벧전':'베드로전서','벧후':'베드로후서','요일':'요한일서','요이':'요한이서','요삼':'요한삼서',
    '유':'유다서','계':'요한계시록',
  };
  // "창1:1" 또는 "창세기 1:1" 또는 "창세기1:1"
  const m = ref.match(/^([가-힣]+)\s*(\d+):(\d+)$/);
  if(!m) return null;
  let book = m[1];
  const ch = parseInt(m[2]);
  const vn = parseInt(m[3]);
  // 약어 변환
  if(SHORT_MAP[book]) book = SHORT_MAP[book];
  // BIBLE에 존재하는지 확인
  if(!BIBLE[book]) return null;
  return { key:`${book}_${ch}_${vn}`, book, ch, vn };
}

// ── 메모 에디터 "/ " → 노트 링크 검색 ──
let _memoSlashPending = false;
function memoKeyHandler(e){
  const ta = document.getElementById('markMemoText');
  if(e.key==='/'){
    _memoSlashPending = true;
    return;
  }
  if(e.key===' ' && _memoSlashPending){
    e.preventDefault();
    _memoSlashPending = false;
    removeLastSlash(ta);
    const sel = window.getSelection();
    if(sel.rangeCount) _memoNlinkRange = sel.getRangeAt(0).cloneRange();
    showMemoNoteSearch();
    return;
  }
  _memoSlashPending = false;
}

function removeLastSlash(el){
  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if(node.nodeType === Node.TEXT_NODE && range.startOffset > 0){
    const txt = node.textContent;
    const pos = range.startOffset;
    if(txt[pos-1]==='/'){
      node.textContent = txt.slice(0,pos-1) + txt.slice(pos);
      range.setStart(node, pos-1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

let _memoNlinkRange = null;
function showMemoNoteSearch(){
  let popup = document.getElementById('memoNoteSearchPopup');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'memoNoteSearchPopup';
    popup.style.cssText = `position:fixed;background:var(--bg3);border:1px solid var(--border2);
      border-radius:10px;width:280px;z-index:10100;box-shadow:var(--shadow);overflow:hidden;display:none;`;
    popup.innerHTML = `
      <div style="padding:8px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px">
        <i class="fa fa-link" style="font-size:11px;color:var(--gold)"></i>
        <input id="memoNoteSearchInp" type="text" placeholder="노트 이름 검색..."
          style="flex:1;background:transparent;border:none;color:var(--text);font-size:12px;outline:none"
          oninput="filterMemoNotes(this.value)"
          onkeydown="memoNoteSearchKey(event)">
      </div>
      <div id="memoNoteSearchList" style="max-height:200px;overflow-y:auto"></div>
    `;
    document.body.appendChild(popup);
  }
  const memoPop = document.getElementById('markMemoPopup');
  if(memoPop){
    const r = memoPop.getBoundingClientRect();
    popup.style.left = (r.left + 20) + 'px';
    popup.style.top = (r.top + 60) + 'px';
  }
  popup.style.display = 'block';
  document.getElementById('memoNoteSearchInp').value = '';
  filterMemoNotes('');
  setTimeout(()=>document.getElementById('memoNoteSearchInp').focus(), 30);
  setTimeout(()=>document.addEventListener('mousedown', _closeMemoNoteSearch), 100);
}
function _closeMemoNoteSearch(e){
  const p = document.getElementById('memoNoteSearchPopup');
  if(p && !p.contains(e.target)){
    p.style.display='none';
    document.removeEventListener('mousedown', _closeMemoNoteSearch);
  }
}
function filterMemoNotes(q){
  const list = document.getElementById('memoNoteSearchList');
  if(!list) return;
  q = q.toLowerCase();
  const matched = S.notes.filter(n=>!q || (n.title||'').toLowerCase().includes(q)).slice(0,15);
  if(!matched.length){
    list.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--text3)">노트를 찾을 수 없습니다</div>';
    return;
  }
  list.innerHTML = matched.map((n,i)=>{
    const f = S.folders.find(x=>x.id===n.folderId);
    return `<div class="mnsl-item${i===0?' mnsl-active':''}" data-nid="${n.id}" onclick="insertMemoNoteLink('${n.id}')">
      <i class="fa fa-file-alt" style="font-size:10px;color:var(--text3)"></i>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.title||'제목 없음'}</span>
      <span style="font-size:9px;color:var(--text3)">${f?.name||''}</span>
    </div>`;
  }).join('');
}
function memoNoteSearchKey(e){
  const list = document.getElementById('memoNoteSearchList');
  const items = list?.querySelectorAll('.mnsl-item');
  if(!items?.length) return;
  let cur = list.querySelector('.mnsl-active');
  let idx = cur ? [...items].indexOf(cur) : 0;
  if(e.key==='ArrowDown'){
    e.preventDefault(); cur?.classList.remove('mnsl-active');
    idx = (idx+1)%items.length; items[idx].classList.add('mnsl-active');
    items[idx].scrollIntoView({block:'nearest'});
  } else if(e.key==='ArrowUp'){
    e.preventDefault(); cur?.classList.remove('mnsl-active');
    idx = (idx-1+items.length)%items.length; items[idx].classList.add('mnsl-active');
    items[idx].scrollIntoView({block:'nearest'});
  } else if(e.key==='Enter'){
    e.preventDefault();
    const active = list.querySelector('.mnsl-active');
    if(active) insertMemoNoteLink(active.dataset.nid);
  } else if(e.key==='Escape'){
    document.getElementById('memoNoteSearchPopup').style.display='none';
    document.removeEventListener('mousedown', _closeMemoNoteSearch);
    document.getElementById('markMemoText')?.focus();
  }
}
function insertMemoNoteLink(noteId){
  const p = document.getElementById('memoNoteSearchPopup');
  if(p) p.style.display='none';
  document.removeEventListener('mousedown', _closeMemoNoteSearch);
  const note = S.notes.find(n=>n.id===noteId);
  if(!note) return;
  const ta = document.getElementById('markMemoText');
  if(!ta) return;
  ta.focus();
  const sel = window.getSelection();
  if(_memoNlinkRange){ sel.removeAllRanges(); sel.addRange(_memoNlinkRange); }
  const link = document.createElement('span');
  link.className = 'memo-nlink';
  link.dataset.noteid = noteId;
  link.contentEditable = 'false';
  link.setAttribute('onclick', `event.stopPropagation();loadNote('${noteId}',true);switchTab('notes')`);
  link.innerHTML = `<i class="fa fa-file-alt" style="font-size:9px"></i> ${note.title||'제목 없음'}`;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(link);
  const space = document.createTextNode('\u00A0');
  link.after(space);
  range.setStartAfter(space); range.collapse(true);
  sel.removeAllRanges(); sel.addRange(range);
  _memoNlinkRange = null;
}

let _memoTags = [];
function addMemoTag(e){
  if(e.key!=='Enter'&&e.key!==',') return;
  e.preventDefault();
  const v=e.target.value.trim().replace(/^#/,'');
  if(v&&!_memoTags.includes(v)){ _memoTags.push(v); renderMemoTags(); }
  e.target.value='';
}
function removeMemoTag(i){ _memoTags.splice(i,1); renderMemoTags(); }
function renderMemoTags(){
  const chips=document.getElementById('memoTagChips');
  if(!chips) return;
  chips.innerHTML='';
  if(!_memoTags.length){ chips.style.display='none'; return; }
  chips.style.display='flex';
  _memoTags.forEach((t,i)=>{
    const c=document.createElement('span');
    c.className='memo-tag-chip';
    c.innerHTML=`#${t} <span onclick="removeMemoTag(${i})" style="cursor:pointer;opacity:.6;margin-left:2px">✕</span>`;
    chips.appendChild(c);
  });
}
function _closeMemoOutside(e){
  const popup = document.getElementById('markMemoPopup');
  const noteSearch = document.getElementById('memoNoteSearchPopup');
  // 노트 검색 팝업 안을 클릭한 경우 무시
  if(noteSearch && noteSearch.contains(e.target)) return;
  if(popup && !popup.contains(e.target)){
    closeMarkMemo();
    document.removeEventListener('mousedown', _closeMemoOutside);
  }
}
function closeMarkMemo(){
  const popup = document.getElementById('markMemoPopup');
  if(popup) popup.style.display = 'none';
  if(_activeMark){
    document.querySelectorAll('mark.hl-active').forEach(m => m.classList.remove('hl-active'));
    _activeMark = null;
  }
  document.removeEventListener('mousedown', _closeMemoOutside);
}
function saveMarkMemo(){
  if(!_activeMark) return;
  const ta = document.getElementById('markMemoText');
  const text = ta?.textContent?.trim() || '';
  const html = ta?.innerHTML || '';
  const name = document.getElementById('markMemoName')?.value?.trim() || '';
  const gid = _activeMark.dataset.gid;
  const targets = gid
    ? [...document.querySelectorAll(`mark[data-gid="${gid}"]`)]
    : [_activeMark];
  targets.forEach(m => {
    m.dataset.memo = text;
    m.style.borderBottom = text ? '2px dotted var(--gold)' : '';
  });

  // S.hlMemo에 이름 + 메모(html) + 태그 저장
  const vrow = _activeMark.closest('.vrow');
  if(vrow){
    const vn = parseInt(vrow.dataset.v);
    const key = `${S.book}_${S.ch}_${vn}`;
    if(!S.hlMemo) S.hlMemo = {};
    if(gid){
      if(text || _memoTags.length || name){
        S.hlMemo[gid] = { key, text, html, gid, tags:[..._memoTags], name };
      } else {
        delete S.hlMemo[gid];
      }
    }
  }

  closeMarkMemo();
  if(S.panelOpen === 'commentary') updateComm();
  persist();
  toast('메모가 저장됐어요 ✓');
}
function deleteMarkHL(){
  if(!_activeMark) return;
  const gid = _activeMark.dataset.gid;
  // vrow를 먼저 저장 (closeMarkMemo가 _activeMark를 null로 만들기 전에)
  const vrow = _activeMark.closest('.vrow');
  const targets = gid
    ? [...document.querySelectorAll(`mark[data-gid="${gid}"]`)]
    : [_activeMark];
  targets.forEach(m => m.replaceWith(...m.childNodes));
  // hlRanges에서 gid 제거
  if(S.hlRanges){
    Object.keys(S.hlRanges).forEach(k=>{
      S.hlRanges[k] = (S.hlRanges[k]||[]).filter(r=>r.gid!==gid);
      if(!S.hlRanges[k].length) delete S.hlRanges[k];
    });
  }
  // S.hl에서도 제거
  if(vrow){
    const key = `${S.book}_${S.ch}_${vrow.dataset.v}`;
    if(!S.hlRanges?.[key]?.length) delete S.hl[key];
  }
  closeMarkMemo();
  persist();
  toast('하이라이트가 지워졌어요');
}
// ─────────────────────────────────────────────────────

