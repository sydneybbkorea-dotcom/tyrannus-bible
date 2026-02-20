// Notes editor: tag management, RTE commands, color palette, and font size
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
    c.innerHTML=`#${t} <span class="tag-x" onclick="removeTag(${i})">&#x2715;</span>`;
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
      <div id="cpTitle" style="font-size:10px;color:var(--text3);font-weight:700;margin-bottom:6px;letter-spacing:.5px;">${t('color.title')}</div>
      <div id="cpGrid" style="display:grid;grid-template-columns:repeat(8,20px);gap:3px;margin-bottom:8px;">
        ${COLORS.map(c=>`<div onclick="applyColor('${c}')" title="${c}"
          style="width:20px;height:20px;border-radius:3px;background:${c};cursor:pointer;border:1px solid rgba(128,128,128,.2);transition:transform .1s;"
          onmouseenter="this.style.transform='scale(1.25)'" onmouseleave="this.style.transform='scale(1)'"></div>`).join('')}
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <input id="cpCustom" type="text" placeholder="${t('color.ph')}"
          style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:4px 7px;font-size:11px;color:var(--text);outline:none;">
        <div id="cpPreview" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border);background:#fff;flex-shrink:0;"></div>
        <button onmousedown="event.preventDefault();applyColorCustom()" style="padding:3px 8px;border-radius:5px;border:none;background:var(--gold);color:var(--bg);font-size:11px;font-weight:700;cursor:pointer;">${t('color.apply')}</button>
      </div>`;
    document.body.appendChild(pop);
    document.getElementById('cpCustom').addEventListener('input', function(){
      document.getElementById('cpPreview').style.background = this.value || '#fff';
    });
  }
  pop._mode = mode;
  document.getElementById('cpTitle').textContent = mode==='fore' ? t('color.text') : t('color.bg');
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
