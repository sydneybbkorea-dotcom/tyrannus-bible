function shortRef(ref){
  // ref 형식: "책이름 장:절"
  const m = ref.match(/^(.+?)\s(\d+:\d+)$/);
  if(!m) return ref;
  const book = m[1], cv = m[2];
  // 책 이름에서 첫 글자만 (단, 2글자 고유명사는 2글자 유지)
  // 예외: 사무엘기상→삼상, 사무엘기하→삼하, 열왕기상→왕상, 열왕기하→왕하 등
  const abbr = {
    '창세기':'창','출애굽기':'출','레위기':'레','민수기':'민','신명기':'신',
    '여호수아기':'수','사사기':'삿','룻기':'룻','사무엘기상':'삼상','사무엘기하':'삼하',
    '열왕기상':'왕상','열왕기하':'왕하','역대기상':'대상','역대기하':'대하',
    '에스라':'스','느헤미야기':'느','에스더기':'에','욥기':'욥','시편':'시',
    '잠언':'잠','전도서':'전','솔로몬의아가':'아','이사야서':'사','예레미야서':'렘',
    '예레미야애가':'애','에스겔서':'겔','다니엘서':'단','호세아서':'호','요엘서':'욜',
    '아모스서':'암','오바댜서':'옵','요나서':'욘','미가서':'미','나훔서':'나',
    '하박국서':'합','스바냐서':'습','학개서':'학','스가랴서':'슥','말라기서':'말',
    '마태복음':'마','마가복음':'막','누가복음':'눅','요한복음':'요','사도행전':'행',
    '로마서':'롬','고린도전서':'고전','고린도후서':'고후','갈라디아서':'갈',
    '에베소서':'엡','빌립보서':'빌','골로새서':'골','데살로니가전서':'살전',
    '데살로니가후서':'살후','디모데전서':'딤전','디모데후서':'딤후','디도서':'딛',
    '빌레몬서':'몬','히브리서':'히','야고보서':'약','베드로전서':'벧전',
    '베드로후서':'벧후','요한일서':'요일','요한이서':'요이','요한삼서':'요삼',
    '유다서':'유','요한계시록':'계'
  };
  const short = abbr[book] || book[0];
  return short + ' ' + cv;
}

function makVLink(key, ref){
  const display = shortRef(ref);
  return `<span class="vlink" data-ref="${key}" data-ref-label="${ref}" contenteditable="false" onclick="navByKey('${key}')" title="${ref}"><i class="fa fa-book-open"></i> ${display}</span>&#8203;`;
}

function openVersePick(){
  saveRange();   // capture cursor before modal
  buildVLSelects();
  openM('mVerse');
}
function buildVLSelects(){
  const bs=document.getElementById('vlB');
  bs.innerHTML=[...BOOKS.OT,...BOOKS.NT].map(b=>`<option value="${b}"${b===S.book?' selected':''}>${b}</option>`).join('');
  vlChBuild(); vlPrev();
}
function vlChBuild(){
  const b=document.getElementById('vlB').value, s=document.getElementById('vlC');
  s.innerHTML=Array.from({length:CHCNT[b]||1},(_,i)=>`<option value="${i+1}"${i+1===S.ch?' selected':''}>${i+1}장</option>`).join('');
  vlPrev();
}
function vlPrev(){
  const b=document.getElementById('vlB').value, c=document.getElementById('vlC').value, v=document.getElementById('vlV').value;
  document.getElementById('vlPrev').textContent=v?`${b} ${c}:${v}`:`${b} ${c}장`;
}
function confirmVL(){
  const b=document.getElementById('vlB').value, c=parseInt(document.getElementById('vlC').value), v=parseInt(document.getElementById('vlV').value)||null;
  const key=v?`${b}_${c}_${v}`:`${b}_${c}_`;
  const ref=v?`${b} ${c}:${v}`:`${b} ${c}장`;
  const nc=document.getElementById('noteContent'); nc.focus();
  // restore saved cursor position
  if(_savedRange){
    const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(_savedRange);
    _savedRange=null;
  }
  insertInlineHTML(makVLink(key,ref));
  closeM('mVerse');
  toast(`${ref} 링크가 삽입됐어요 📖`);
}

// Navigate from vlink — opens new tab
function navByKey(key){
  const p=key.split('_');
  if(p.length<2)return;
  openBibleTab(p[0], parseInt(p[1]), p[2]?parseInt(p[2]):null);
}

// ═══════════════════════════════════════════════════
// NOTE LINK — proper inter-note linking
// ═══════════════════════════════════════════════════
// Save cursor before opening modal (so link inserts at cursor position)
let _savedRange = null;
function saveRange(){
  const sel=window.getSelection();
  if(sel && sel.rangeCount>0){
    const r=sel.getRangeAt(0);
    if(document.getElementById('noteContent').contains(r.commonAncestorContainer))
      _savedRange=r.cloneRange();
  }
}
function restoreRange(){
  if(_savedRange){
    const nc = document.getElementById('noteContent');
    nc.focus();
    const sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(_savedRange);
    _savedRange=null;
  }
}

// DOM 직접 조작으로 노드 삽입 후 커서를 삽입 노드 뒤에 위치
function insertNodeAtCursor(node){
  const nc = document.getElementById('noteContent');
  nc.focus();
  // 저장된 range 복원
  let range;
  if(_savedRange){
    range = _savedRange.cloneRange();
    _savedRange = null;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    const sel = window.getSelection();
    if(sel && sel.rangeCount > 0) range = sel.getRangeAt(0);
  }
  if(!range) { nc.appendChild(node); return; }

  // 삽입
  range.deleteContents();
  range.insertNode(node);

  // 커서를 삽입 노드 바로 뒤에 위치 (빈 텍스트 노드 삽입)
  const after = document.createTextNode('​');
  node.parentNode.insertBefore(after, node.nextSibling);
  const newRange = document.createRange();
  newRange.setStartAfter(after);
  newRange.collapse(true);
  const sel2 = window.getSelection();
  sel2.removeAllRanges();
  sel2.addRange(newRange);
}
// ── 팝오버 유틸 ──────────────────────────────────────
function showPopover(id, btnEl){
  const pop = document.getElementById(id);
  if(!pop) return;
  const rect = btnEl.getBoundingClientRect();
  pop.style.position = 'fixed';
  pop.style.zIndex = '10100';
  pop.style.display = 'block';
  const pw = pop.offsetWidth || 300;
  const ph = pop.offsetHeight || 180;
  let top = rect.bottom + 6;
  let left = rect.left;
  if(top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
  if(left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
  if(left < 6) left = 6;
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
  setTimeout(()=>{
    function outside(e){
      if(!pop.contains(e.target) && e.target !== btnEl){
        pop.style.display = 'none';
        document.removeEventListener('mousedown', outside);
      }
    }
    document.addEventListener('mousedown', outside);
  }, 10);
}
function hidePopover(id){ const p=document.getElementById(id); if(p) p.style.display='none'; }

function initEmbedPopovers(){
  if(document.getElementById('popUrlEmbed')) return;

  const urlPop = document.createElement('div');
  urlPop.id = 'popUrlEmbed';
  urlPop.style.cssText = 'display:none;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px 16px;width:300px;box-shadow:var(--shadow);';
  urlPop.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;"><i class="fa fa-globe" style="color:var(--gold);margin-right:5px"></i>외부 링크 삽입</div>
    <input id="embedUrl" type="text" placeholder="https://example.com"
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:6px;box-sizing:border-box;">
    <input id="embedUrlLabel" type="text" placeholder="표시 텍스트 (선택)"
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:10px;box-sizing:border-box;">
    <div style="display:flex;gap:6px;justify-content:flex-end;">
      <button onmousedown="event.preventDefault();hidePopover('popUrlEmbed')" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">취소</button>
      <button onmousedown="event.preventDefault();insertUrlEmbed()" style="padding:4px 12px;border-radius:5px;border:none;background:var(--gold);color:#fff;font-size:11px;font-weight:600;cursor:pointer;">삽입</button>
    </div>`;
  document.body.appendChild(urlPop);

  const ytPop = document.createElement('div');
  ytPop.id = 'popYtEmbed';
  ytPop.style.cssText = 'display:none;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px 16px;width:320px;box-shadow:var(--shadow);';
  ytPop.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;"><i class="fab fa-youtube" style="color:#ff4444;margin-right:5px"></i>유튜브 영상 삽입</div>
    <input id="ytUrl" type="text" placeholder="https://youtube.com/watch?v=..."
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:6px;box-sizing:border-box;">
    <div id="ytPreview" style="display:none;margin-bottom:8px;border-radius:6px;overflow:hidden;">
      <iframe id="ytIframe" style="width:100%;height:160px;border:none;" allowfullscreen></iframe>
    </div>
    <div style="display:flex;gap:6px;justify-content:flex-end;">
      <button onmousedown="event.preventDefault();previewYt()" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">미리보기</button>
      <button onmousedown="event.preventDefault();hidePopover('popYtEmbed')" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">취소</button>
      <button onmousedown="event.preventDefault();insertYtEmbed()" style="padding:4px 12px;border-radius:5px;border:none;background:#e03333;color:#fff;font-size:11px;font-weight:600;cursor:pointer;">삽입</button>
    </div>`;
  document.body.appendChild(ytPop);
}

// ── 외부 링크 ─────────────────────────────────────
function openUrlEmbed(btnEl){
  saveRange();
  initEmbedPopovers();
  document.getElementById('embedUrl').value = '';
  document.getElementById('embedUrlLabel').value = '';
  showPopover('popUrlEmbed', btnEl);
  setTimeout(()=>document.getElementById('embedUrl').focus(), 60);
}
function insertUrlEmbed(){
  const url = document.getElementById('embedUrl').value.trim();
  if(!url){ toast('URL을 입력해주세요'); return; }
  const label = document.getElementById('embedUrlLabel').value.trim() || url;
  hidePopover('popUrlEmbed');
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  a.className = 'note-extlink'; a.contentEditable = 'false';
  a.innerHTML = `<i class="fa fa-globe"></i> ${label}`;
  insertNodeAtCursor(a);
  toast('링크가 삽입됐어요');
}

// ── 유튜브 ────────────────────────────────────────
function openYoutubeEmbed(btnEl){
  saveRange();
  initEmbedPopovers();
  document.getElementById('ytUrl').value = '';
  document.getElementById('ytPreview').style.display = 'none';
  showPopover('popYtEmbed', btnEl);
  setTimeout(()=>document.getElementById('ytUrl').focus(), 60);
}
function getYtId(url){
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : (url.length<=11 ? url.trim() : '');
}
function previewYt(){
  const vid = getYtId(document.getElementById('ytUrl').value.trim());
  if(!vid){ toast('유효한 유튜브 URL을 입력해주세요'); return; }
  document.getElementById('ytIframe').src = `https://www.youtube.com/embed/${vid}`;
  document.getElementById('ytPreview').style.display = 'block';
}
function insertYtEmbed(){
  const vid = getYtId(document.getElementById('ytUrl').value.trim());
  if(!vid){ toast('유효한 유튜브 URL을 입력해주세요'); return; }
  const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  const ytUrl = `https://www.youtube.com/watch?v=${vid}`;
  hidePopover('popYtEmbed');

  // DOM 직접 생성 (contenteditable=false 블록)
  const wrap = document.createElement('div');
  wrap.className = 'note-yt-card';
  wrap.contentEditable = 'false';
  wrap.title = '유튜브에서 열기';
  wrap.onclick = ()=> window.open(ytUrl, '_blank');
  wrap.innerHTML = `
    <div style="position:relative;display:block;cursor:pointer;">
      <img src="${thumb}" alt="YouTube"
        style="width:100%;border-radius:6px 6px 0 0;display:block;max-height:180px;object-fit:cover;"
        onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
        <div style="width:48px;height:48px;background:rgba(220,0,0,.92);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <i class="fa fa-play" style="color:#fff;font-size:18px;margin-left:4px;"></i>
        </div>
      </div>
    </div>
    <div style="padding:6px 10px 8px;background:var(--bg2);border-radius:0 0 6px 6px;border:1px solid var(--border);border-top:none;display:flex;align-items:center;gap:8px;">
      <span style="font-size:11px;color:#e03333;font-weight:700;flex-shrink:0;"><i class="fab fa-youtube"></i> YouTube</span>
      <span style="font-size:10px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ytUrl}</span>
    </div>`;
  insertNodeAtCursor(wrap);
  toast('유튜브 링크가 삽입됐어요');
}

// ── 파일 첨부 ────────────────────────────────────
function openFileAttach(){
  saveRange();
  let inp = document.getElementById('fileAttachInput');
  if(!inp){
    inp = document.createElement('input');
    inp.id = 'fileAttachInput';
    inp.type = 'file';
    inp.style.display = 'none';
    inp.multiple = true;
    inp.addEventListener('change', handleFileAttach);
    document.body.appendChild(inp);
  }
  inp.value = '';
  inp.click();
}
function handleFileAttach(e){
  const files = [...e.target.files];
  if(!files.length) return;
  restoreRange();
  files.forEach(file=>{
    const isImg = file.type.startsWith('image/');
    const isPdf = file.type==='application/pdf';
    const reader = new FileReader();
    reader.onload = ev=>{
      let h = '';
      if(isImg){
        h = `<div class="note-file-wrap" contenteditable="false">
          <img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;border-radius:6px;display:block;">
          <span class="note-file-label"><i class="fa fa-image"></i> ${file.name}</span>
        </div><p></p>`;
      } else {
        const icon = isPdf ? 'file-pdf' : (file.type.startsWith('audio') ? 'file-audio' : (file.type.startsWith('video') ? 'file-video' : 'file'));
        h = `<div class="note-file-item" contenteditable="false">
          <i class="fa fa-${icon}" style="font-size:20px;color:var(--gold);flex-shrink:0;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</div>
            <div style="font-size:11px;color:var(--text3);">${(file.size/1024).toFixed(1)} KB · ${file.type||'파일'}</div>
          </div>
          <a href="${ev.target.result}" download="${file.name}" onclick="event.stopPropagation()"
            style="font-size:11px;color:var(--gold);text-decoration:none;flex-shrink:0;">
            <i class="fa fa-download"></i>
          </a>
        </div>&#8203;`;
      }
      document.execCommand('insertHTML', false, h);
    };
    reader.readAsDataURL(file);
  });
}
// ─────────────────────────────────────────────────────

function openNoteLink(){
  saveRange();  // capture cursor position before modal opens
  renderNotePicker('');
  openM('mNoteLink');
  document.getElementById('nlSearch').value='';
  setTimeout(()=>document.getElementById('nlSearch').focus(), 80);
}

function filterNoteLinks(q){renderNotePicker(q)}

function renderNotePicker(q){
  const cont=document.getElementById('notePicker'); cont.innerHTML='';
  const filtered=S.notes.filter(n=>n.id!==S.curNoteId&&(!q||n.title.includes(q)));
  if(!filtered.length){cont.innerHTML=`<div style="color:var(--text3);font-size:12px;padding:12px;text-align:center">${q?'일치하는 노트가 없어요':'저장된 노트가 없어요'}</div>`;return}
  filtered.sort((a,b)=>b.updatedAt-a.updatedAt).forEach(n=>{
    const f=S.folders.find(x=>x.id===n.folderId);
    const d=document.createElement('div'); d.className='npick-item';
    d.innerHTML=`<i class="fa fa-file-alt"></i><div><div>${n.title||'제목 없음'}</div><div class="npick-folder">${f?.name||'기본 폴더'}</div></div>`;
    d.onclick=()=>{ closeM('mNoteLink'); insertNoteLink(n.id, n.title||'제목 없음'); };
    cont.appendChild(d);
  });
}

function insertNoteLink(noteId, noteTitle){
  const nc=document.getElementById('noteContent');
  nc.focus();
  // Restore cursor position if we saved it
  if(_savedRange){
    const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(_savedRange);
    _savedRange=null;
  }
  const linkHTML=`<span class="nlink" data-noteid="${noteId}" contenteditable="false" title="${noteTitle}"><i class="fa fa-file-alt"></i> ${noteTitle}</span>&#8203;`;
  insertInlineHTML(linkHTML);
  toast(`"${noteTitle}" 노트 링크가 삽입됐어요 🔗`);
}

// Verse tooltip (hover on vlinks in note content)
function setupVTip(){
  const nc = document.getElementById('noteContent');
  const tip = document.getElementById('vtip');
  let _tipEl = null; // 현재 팝업을 띄운 .vlink 요소

  function hideTip(){ tip.style.display='none'; _tipEl=null; }

  // mouseover: .vlink 위로 들어올 때만 팝업
  nc.addEventListener('mouseover', e=>{
    const el = e.target.closest('.vlink');
    if(!el){ return; }
    if(el === _tipEl) return; // 이미 같은 링크
    _tipEl = el;
    const k = el.dataset.ref; if(!k) return;
    const p = k.split('_');
    const txt = BIBLE[p[0]]?.[parseInt(p[1])]?.[parseInt(p[2])-1] || '';
    document.getElementById('vtip-ref').textContent = el.dataset.refLabel || k;
    document.getElementById('vtip-txt').textContent = txt;
    const rect = el.getBoundingClientRect();
    const tipW = 280;
    let left = rect.left;
    if(left + tipW > window.innerWidth - 10) left = window.innerWidth - tipW - 10;
    tip.style.left = left + 'px';
    tip.style.top  = (rect.bottom + 6) + 'px';
    tip.style.display = 'block';
  });

  // mouseleave: nc 전체에서 나갈 때 즉시 숨김
  nc.addEventListener('mouseleave', ()=>hideTip());

  // mouseout: relatedTarget이 .vlink 밖이면 즉시 숨김
  nc.addEventListener('mouseout', e=>{
    if(!_tipEl) return;
    // relatedTarget이 현재 vlink 또는 그 자손이면 유지, 아니면 숨김
    if(!_tipEl.contains(e.relatedTarget)){
      hideTip();
    }
  });

  // ── nlink 클릭: delegation (contenteditable 내 onclick 대체)
  nc.addEventListener('click', e=>{
    const nl = e.target.closest('.nlink');
    if(!nl) return;
    e.preventDefault(); e.stopPropagation();
    const nid = nl.dataset.noteid;
    if(!nid) return;
    loadNote(nid, true);
    switchTab('notes');
  });
}

// ═══════════════════════════════════════════════════
