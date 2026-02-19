// Highlight picker UI: mouseup handler, showHLPicker, hideHLPicker, selectionchange handler

let _lastSel = null;
document.addEventListener('mouseup', e=>{
  // 읽기 모드에서는 하이라이트 비활성
  if(document.body.classList.contains('read-mode')) return;
  // Only act if inside biblePane and there's an actual selection
  const bp = document.getElementById('bibleScroll');
  if(!bp.contains(e.target)) return;

  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()) {
    _lastSel = null;
    return;
  }
  _lastSel = sel.getRangeAt(0).cloneRange();

  // Find which verse row the selection started in
  let node = sel.anchorNode;
  while(node && node.nodeType !== 1) node = node.parentNode;
  const row = node?.closest('.vrow');
  if(!row) { _lastSel = null; return; }

  // Show mini toolbar near selection
  showHLPicker(e.clientX, e.clientY, row.dataset.v);
});

// Mini HL picker popup (appears near drag selection)
let _hlPickerV = null;
// ── 하이라이트 메모 팝업 ─────────────────────────────
let _activeMark = null;
// HL Picker & Drag HL
function showHLPicker(x, y, vn){
  _hlPickerV = parseInt(vn);
  let p = document.getElementById('hlPicker');
  if(!p){
    p = document.createElement('div');
    p.id = 'hlPicker';
    p.style.cssText = `position:fixed;z-index:9998;`;
    p.innerHTML = `
      <div id="hlTrigger" style="
        width:30px;height:30px;border-radius:50%;
        background:var(--bg3);border:1px solid var(--border2);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;box-shadow:var(--shadow);transition:all .18s;
        color:var(--gold);font-size:13px;
      "><i class="fa fa-highlighter"></i></div>
      <div id="hlColors" style="
        position:absolute;left:0;top:0;
        display:flex;gap:5px;align-items:center;
        background:var(--bg3);border:1px solid var(--border2);border-radius:20px;
        padding:5px 10px;box-shadow:var(--shadow);
        opacity:0;pointer-events:none;transform:scale(.8);
        transition:opacity .15s,transform .15s;white-space:nowrap;
      ">
        <i class="fa fa-highlighter" style="font-size:11px;color:var(--gold);margin-right:2px"></i>
        <div class="hlc-dot" style="background:#FFD740" onclick="applyDragHL('Y')" title="노랑"></div>
        <div class="hlc-dot" style="background:#FFAB40" onclick="applyDragHL('O')" title="주황"></div>
        <div class="hlc-dot" style="background:#69F0AE" onclick="applyDragHL('G')" title="초록"></div>
        <div class="hlc-dot" style="background:#40C4FF" onclick="applyDragHL('B')" title="파랑"></div>
        <div class="hlc-dot" style="background:#CE93D8" onclick="applyDragHL('P')" title="보라"></div>
        <div class="hlc-dot hlc-erase" onclick="applyDragHL('E')" title="지우기">✕</div>
      </div>
    `;
    document.body.appendChild(p);

    // 호버 로직
    const trigger = p.querySelector('#hlTrigger');
    const colors = p.querySelector('#hlColors');
    let _hoverTimeout = null;

    function showColors(){
      clearTimeout(_hoverTimeout);
      trigger.style.opacity='0'; trigger.style.pointerEvents='none';
      colors.style.opacity='1'; colors.style.pointerEvents='auto'; colors.style.transform='scale(1)';
    }
    function hideColors(){
      _hoverTimeout = setTimeout(()=>{
        colors.style.opacity='0'; colors.style.pointerEvents='none'; colors.style.transform='scale(.8)';
        trigger.style.opacity='1'; trigger.style.pointerEvents='auto';
      }, 300);
    }

    trigger.addEventListener('mouseenter', showColors);
    trigger.addEventListener('click', showColors);
    colors.addEventListener('mouseenter', ()=>clearTimeout(_hoverTimeout));
    colors.addEventListener('mouseleave', hideColors);
    p.addEventListener('mouseleave', hideColors);
  }

  // 리셋: 트리거 보이기, 색상 숨기기
  const trigger = p.querySelector('#hlTrigger');
  const colors = p.querySelector('#hlColors');
  trigger.style.opacity='1'; trigger.style.pointerEvents='auto';
  colors.style.opacity='0'; colors.style.pointerEvents='none'; colors.style.transform='scale(.8)';

  p.style.left = Math.min(x, window.innerWidth-200)+'px';
  p.style.top = Math.max(y - 58, 10)+'px';
  p.style.display = 'block';

  clearTimeout(p._t);
  p._t = setTimeout(hideHLPicker, 5000);
}

// 드래그 해제(셀렉션 없어짐) 시 즉시 숨김 — 단, 피커 위 호버 중이면 유지
document.addEventListener('selectionchange', ()=>{
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()){
    const p = document.getElementById('hlPicker');
    if(p && p.style.display==='block'){
      // 피커 위에 마우스가 있으면 숨기지 않음
      if(p.matches(':hover')) return;
      hideHLPicker();
    }
  }
});

function hideHLPicker(){
  const p = document.getElementById('hlPicker');
  if(p) p.style.display='none';
  // _hlPickerV는 applyDragHL에서 사용 후 직접 초기화
}
