// Notes editor insert commands: table, callout, checkbox, and date stamp
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
