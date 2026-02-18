function addTag(e){
  if(e.key!=='Enter'&&e.key!==',')return;
  const v=e.target.value.trim().replace(/^#/,'');
  if(v&&!S.curTags.includes(v)){S.curTags.push(v);renderTagChips();}
  e.target.value=''; e.preventDefault();
}
function removeTag(i){S.curTags.splice(i,1);renderTagChips()}
function renderTagChips(){
  const row=document.getElementById('tagRow'), inp=document.getElementById('tagInp');
  row.innerHTML='';
  S.curTags.forEach((t,i)=>{
    const c=document.createElement('span'); c.className='tag-chip';
    c.innerHTML=`#${t} <span class="tag-x" onclick="removeTag(${i})">✕</span>`;
    row.appendChild(c);
  });
  row.appendChild(inp);
}

// RTE
function cmd(c,v){document.getElementById('noteContent').focus();document.execCommand(c,false,v);}
function openColorPalette(btnEl, mode){
  saveRange();
  let pop = document.getElementById('colorPalettePop');
  if(!pop){
    const COLORS = [
      '#000000','#333333','#555555','#777777','#999999','#bbbbbb','#dddddd','#ffffff',
      '#e03333','#e06020','#e0a000','#c9973a','#5aaa5a','#2288cc','#6655cc','#cc55aa',
      '#ff6666','#ff9966','#ffcc66','#ffd966','#99dd99','#66aaee','#9988ee','#ee88cc',
      '#ffcccc','#ffe0cc','#fff0cc','#fff5cc','#cceecc','#cce4ff','#ddd4ff','#ffccee',
      '#800000','#804000','#806000','#806000','#006000','#004080','#400080','#800060',
    ];
    pop = document.createElement('div');
    pop.id = 'colorPalettePop';
    pop.style.cssText = 'display:none;position:fixed;z-index:10200;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:10px;box-shadow:var(--shadow);width:196px;';
    pop.innerHTML = `
      <div id="cpTitle" style="font-size:10px;color:var(--text3);font-weight:700;margin-bottom:6px;letter-spacing:.5px;">색상 선택</div>
      <div id="cpGrid" style="display:grid;grid-template-columns:repeat(8,20px);gap:3px;margin-bottom:8px;">
        ${COLORS.map(c=>`<div onclick="applyColor('${c}')" title="${c}"
          style="width:20px;height:20px;border-radius:3px;background:${c};cursor:pointer;border:1px solid rgba(128,128,128,.2);transition:transform .1s;"
          onmouseenter="this.style.transform='scale(1.25)'" onmouseleave="this.style.transform='scale(1)'"></div>`).join('')}
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <input id="cpCustom" type="text" placeholder="#hex 또는 rgb(...)"
          style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:4px 7px;font-size:11px;color:var(--text);outline:none;">
        <div id="cpPreview" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border);background:#fff;flex-shrink:0;"></div>
        <button onmousedown="event.preventDefault();applyColorCustom()" style="padding:3px 8px;border-radius:5px;border:none;background:var(--gold);color:var(--bg);font-size:11px;font-weight:700;cursor:pointer;">적용</button>
      </div>`;
    document.body.appendChild(pop);
    document.getElementById('cpCustom').addEventListener('input', function(){
      document.getElementById('cpPreview').style.background = this.value || '#fff';
    });
  }
  pop._mode = mode;
  document.getElementById('cpTitle').textContent = mode==='fore' ? '🖊 텍스트 색상' : '🎨 배경 하이라이트';
  showPopover('colorPalettePop', btnEl);
}

function applyColor(c){
  restoreRange();
  if(document.getElementById('colorPalettePop')._mode==='fore') cmd('foreColor',c);
  else cmd('hiliteColor',c);
  hidePopover('colorPalettePop');
}
function applyColorCustom(){
  const c = document.getElementById('cpCustom').value.trim();
  if(!c) return;
  applyColor(c);
}
function setFontSize(px){
  if(!px) return;
  saveRange(); restoreRange();
  // execCommand fontSize는 1-7 단계만 지원 → span으로 직접 감싸기
  const sel = window.getSelection();
  if(!sel || sel.rangeCount===0) return;
  const range = sel.getRangeAt(0);
  if(range.collapsed){
    // 커서만 있을 경우: 이후 입력에 적용
    document.execCommand('fontSize', false, '7');
    // 크기 7로 만들어진 font 태그를 span으로 교체
    const fonts = document.getElementById('noteContent').querySelectorAll('font[size="7"]');
    fonts.forEach(f=>{ const s=document.createElement('span'); s.style.fontSize=px+'px'; s.innerHTML=f.innerHTML; f.parentNode.replaceChild(s,f); });
  } else {
    document.execCommand('fontSize', false, '7');
    const fonts = document.getElementById('noteContent').querySelectorAll('font[size="7"]');
    fonts.forEach(f=>{ const s=document.createElement('span'); s.style.fontSize=px+'px'; s.innerHTML=f.innerHTML; f.parentNode.replaceChild(s,f); });
  }
}

function insertTable(){
  const r=prompt('행 수:','3'), c=prompt('열 수:','3');
  if(!r||!c)return;
  let h='<table>';
  for(let i=0;i<+r;i++){h+='<tr>';for(let j=0;j<+c;j++)h+=i===0?'<th>제목</th>':'<td>내용</td>';h+='</tr>';}
  h+='</table><br>'; cmd('insertHTML',h);
}

function insertCallout(type){
  const cfg = {
    info: {
      bg:'rgba(74,158,255,.1)', border:'#4a9eff',
      icon:'<i class="fa fa-info-circle" style="color:#4a9eff;font-size:13px;"></i>',
      label:'정보'
    },
    warn: {
      bg:'rgba(220,50,50,.1)', border:'#dd3333',
      icon:'<i class="fa fa-exclamation-triangle" style="color:#dd3333;font-size:13px;"></i>',
      label:'주의'
    },
    pray: {
      bg:'rgba(40,160,80,.1)', border:'#28a050',
      icon:'<i class="fa fa-lightbulb" style="color:#28a050;font-size:13px;"></i>',
      label:'묵상'
    },
  };
  const c = cfg[type] || cfg.info;

  const wrap = document.createElement('div');
  wrap.className = 'note-callout';
  wrap.contentEditable = 'false';
  wrap.style.cssText = `margin:8px 0;padding:8px 12px 10px 12px;border-left:3px solid ${c.border};background:${c.bg};border-radius:0 6px 6px 0;display:block;position:relative;`;

  // 헤더: 아이콘 + 편집 가능한 타이틀 + 삭제
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px;';

  const iconEl = document.createElement('span');
  iconEl.innerHTML = c.icon;
  iconEl.style.cssText = 'flex-shrink:0;';

  const titleEl = document.createElement('span');
  titleEl.contentEditable = 'true';
  titleEl.textContent = c.label;
  titleEl.style.cssText = `font-size:12px;font-weight:700;color:${c.border};outline:none;flex:1;min-width:10px;`;
  titleEl.addEventListener('keydown', e=>{ e.stopPropagation(); });

  const delBtn = document.createElement('button');
  delBtn.innerHTML = '✕';
  delBtn.title = '삭제';
  delBtn.style.cssText = 'background:none;border:none;color:var(--text3);font-size:11px;cursor:pointer;padding:0;line-height:1;opacity:0;transition:opacity .15s;flex-shrink:0;';
  delBtn.onmousedown = (e)=>{ e.preventDefault(); wrap.parentNode?.removeChild(wrap); };

  wrap.onmouseenter = ()=>{ delBtn.style.opacity='.7'; };
  wrap.onmouseleave = ()=>{ delBtn.style.opacity='0'; };

  header.appendChild(iconEl);
  header.appendChild(titleEl);
  header.appendChild(delBtn);

  // 본문: 직접 입력 가능
  const body = document.createElement('div');
  body.contentEditable = 'true';
  body.style.cssText = 'font-size:14px;color:var(--text);outline:none;min-height:2em;line-height:1.7;';
  body.setAttribute('data-ph', '내용을 입력하세요...');
  body.addEventListener('keydown', e=>{ e.stopPropagation(); });

  wrap.appendChild(header);
  wrap.appendChild(body);
  insertNodeAtCursor(wrap);
  setTimeout(()=>body.focus(), 50);
}

function insertCheckbox(){
  const row = document.createElement('div');
  row.contentEditable = 'false';
  row.style.cssText = 'display:flex;align-items:center;gap:6px;margin:2px 0;padding:1px 0;';
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.style.cssText = 'width:14px;height:14px;accent-color:var(--gold);cursor:pointer;flex-shrink:0;';
  chk.onchange = ()=>{ txt.style.textDecoration = chk.checked ? 'line-through' : 'none'; txt.style.opacity = chk.checked ? '.5' : '1'; };
  const txt = document.createElement('span');
  txt.contentEditable = 'true';
  txt.style.cssText = 'flex:1;outline:none;min-width:20px;font-size:14px;color:var(--text);';
  txt.textContent = ' ';
  // Delete 키로 빈 체크박스 제거
  txt.addEventListener('keydown', e=>{
    if((e.key==='Backspace'||e.key==='Delete') && txt.textContent.trim()===''){
      e.preventDefault(); row.parentNode?.removeChild(row);
    }
  });
  const delBtn = document.createElement('button');
  delBtn.innerHTML = '✕';
  delBtn.title = '삭제';
  delBtn.style.cssText = 'background:none;border:none;color:var(--text3);font-size:10px;cursor:pointer;padding:0 2px;opacity:0;transition:opacity .15s;';
  delBtn.onmousedown = (e)=>{ e.preventDefault(); row.parentNode?.removeChild(row); };
  row.onmouseenter = ()=>{ delBtn.style.opacity='.6'; };
  row.onmouseleave = ()=>{ delBtn.style.opacity='0'; };
  row.appendChild(chk);
  row.appendChild(txt);
  row.appendChild(delBtn);
  insertNodeAtCursor(row);
  setTimeout(()=>txt.focus(), 50);
}

function insertDateStamp(){
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const days = ['일','월','화','수','목','금','토'];
  const dow = days[now.getDay()];
  const span = document.createElement('span');
  span.contentEditable = 'false';
  span.style.cssText = 'font-size:11px;color:var(--text3);background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:1px 6px;font-family:Noto Sans KR,sans-serif;cursor:default;';
  span.title = '클릭하여 삭제';
  span.textContent = y+'.'+m+'.'+d+' ('+dow+')';
  span.onclick = ()=>{ if(confirm('날짜 스탬프를 삭제할까요?')) span.parentNode?.removeChild(span); };
  insertNodeAtCursor(span);
}


// ═══════════════════════════════════════════════════
// VERSE LINK — improved
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// INLINE LINK INSERT — Range API 직접 사용 (새 줄 방지)
// ═══════════════════════════════════════════════════
function insertInlineHTML(htmlStr) {
  const nc = document.getElementById('noteContent');
  nc.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    // 커서 없으면 끝에 추가
    nc.innerHTML += htmlStr;
    return;
  }

  const range = sel.getRangeAt(0);
  range.deleteContents();

  // HTML 문자열 → DocumentFragment
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlStr;
  const frag = tpl.content.cloneNode(true);

  // fragment의 마지막 노드 기억 (커서 위치용)
  const lastNode = frag.lastChild;

  range.insertNode(frag);

  // 커서를 삽입된 노드 바로 뒤로 이동
  if (lastNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}
