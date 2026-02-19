// Highlight picker UI: 텍스트 선택 시 하이라이트 색상 피커 표시
// mouseup/touchend → showHLPicker → 색상 선택 → applyDragHL
// 모바일: 터치 지원, 선택 영역 기준 위치, OS 팝업과 충돌 회피

let _lastSel = null;
const _isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ── 선택 감지 (mouse + touch) ── */
function _onSelectionEnd(e){
  if(document.body.classList.contains('hide-hl')) return;
  const bp = document.getElementById('bibleScroll');
  if(!bp || !bp.contains(e.target)) return;

  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()){
    _lastSel = null;
    return;
  }
  _lastSel = sel.getRangeAt(0).cloneRange();

  let node = sel.anchorNode;
  while(node && node.nodeType !== 1) node = node.parentNode;
  const row = node?.closest('.vrow');
  if(!row){ _lastSel = null; return; }

  /* 선택 영역의 위치를 getBoundingClientRect로 정확히 계산 */
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  showHLPicker(rect, row.dataset.v);
}

document.addEventListener('mouseup', _onSelectionEnd);
/* 모바일: touchend 후 약간의 딜레이로 selection이 확정된 뒤 처리 */
document.addEventListener('touchend', e=>{
  setTimeout(()=> _onSelectionEnd(e), 250);
}, {passive:true});

/* ── 하이라이트 피커 생성 & 표시 ── */
let _hlPickerV = null;
let _activeMark = null;

function showHLPicker(rect, vn){
  _hlPickerV = parseInt(vn);
  let p = document.getElementById('hlPicker');

  if(!p){
    p = document.createElement('div');
    p.id = 'hlPicker';
    p.style.cssText = 'position:fixed;z-index:9998;';
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
        <div class="hlc-dot" style="background:#FACC15" onclick="applyDragHL('Y')" title="노랑"></div>
        <div class="hlc-dot" style="background:#FB923C" onclick="applyDragHL('O')" title="주황"></div>
        <div class="hlc-dot" style="background:#34D399" onclick="applyDragHL('G')" title="초록"></div>
        <div class="hlc-dot" style="background:#60A5FA" onclick="applyDragHL('B')" title="파랑"></div>
        <div class="hlc-dot" style="background:#C084FC" onclick="applyDragHL('P')" title="보라"></div>
        <div class="hlc-dot hlc-erase" onclick="applyDragHL('E')" title="지우기">✕</div>
      </div>
    `;
    document.body.appendChild(p);

    /* 데스크톱: 호버로 색상 팔레트 열기 */
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
    colors.addEventListener('mouseenter', ()=> clearTimeout(_hoverTimeout));
    colors.addEventListener('mouseleave', hideColors);
    p.addEventListener('mouseleave', hideColors);

    /* 모바일: 터치로 dot 선택 시 touchend 전파 방지 */
    colors.addEventListener('touchend', e=> e.stopPropagation(), {passive:false});
  }

  /* ── 위치 계산: 선택 영역 위쪽 우선, 공간 없으면 아래쪽 ── */
  const pickerH = 40;   // 피커 높이 (대략)
  const pickerW = 230;   // 색상 팔레트 폭 (대략)
  const gap = 8;         // 선택 영역과의 간격

  /* 수평: 선택 영역 중앙 기준, 화면 밖으로 안 나가게 */
  const cx = rect.left + rect.width / 2;
  let lx = Math.max(8, Math.min(cx - pickerW / 2, window.innerWidth - pickerW - 8));

  /* 수직: 선택 영역 위쪽 우선 (OS 팝업은 보통 아래쪽에 뜸) */
  let ly;
  if(rect.top - pickerH - gap > 10){
    ly = rect.top - pickerH - gap;          // 위쪽 배치
  } else {
    ly = rect.bottom + gap;                 // 공간 없으면 아래쪽
  }

  /* 리셋: 트리거/색상 상태 초기화 */
  const trigger = p.querySelector('#hlTrigger');
  const colors = p.querySelector('#hlColors');

  if(_isTouchDevice){
    /* 모바일: 트리거 건너뛰고 바로 색상 팔레트 표시 */
    trigger.style.opacity='0'; trigger.style.pointerEvents='none';
    colors.style.opacity='1'; colors.style.pointerEvents='auto'; colors.style.transform='scale(1)';
  } else {
    /* 데스크톱: 트리거 아이콘 먼저 표시 */
    trigger.style.opacity='1'; trigger.style.pointerEvents='auto';
    colors.style.opacity='0'; colors.style.pointerEvents='none'; colors.style.transform='scale(.8)';
  }

  p.style.left = lx + 'px';
  p.style.top = ly + 'px';
  p.style.display = 'block';

  clearTimeout(p._t);
  p._t = setTimeout(hideHLPicker, _isTouchDevice ? 8000 : 5000);
}

/* ── 드래그 해제 시 피커 숨김 (피커 위 호버 중이면 유지) ── */
document.addEventListener('selectionchange', ()=>{
  const sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.toString().trim()){
    const p = document.getElementById('hlPicker');
    if(p && p.style.display==='block'){
      if(p.matches(':hover')) return;
      hideHLPicker();
    }
  }
});

function hideHLPicker(){
  const p = document.getElementById('hlPicker');
  if(p) p.style.display='none';
}
