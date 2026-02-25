// Highlight picker UI: 텍스트 선택 시 하이라이트 색상 피커 표시
// mouseup/touchend → showHLPicker → 색상 선택 → applyDragHL
// 모바일: 터치 지원, 선택 영역 기준 위치, OS 팝업과 충돌 회피

let _lastSel = null;
let _lastInputWasTouch = false;
document.addEventListener('touchstart', ()=>{ _lastInputWasTouch = true; }, {passive:true,capture:true});
document.addEventListener('mousedown', (e)=>{ if(e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return; _lastInputWasTouch = false; }, {passive:true,capture:true});

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
      <div class="hlp-bar">
        <div class="hlp-icon-wrap" id="hlPenWrap">
          <div class="hlp-icon" id="hlPenBtn"><i class="fa fa-highlighter"></i></div>
          <div class="hlp-dropdown hlp-colors" id="hlColors">
            <div class="hlc-dot" style="background:#FACC15" onclick="applyDragHL('Y')" title="노랑"></div>
            <div class="hlc-dot" style="background:#FB923C" onclick="applyDragHL('O')" title="주황"></div>
            <div class="hlc-dot" style="background:#34D399" onclick="applyDragHL('G')" title="초록"></div>
            <div class="hlc-dot" style="background:#60A5FA" onclick="applyDragHL('B')" title="파랑"></div>
            <div class="hlc-dot" style="background:#C084FC" onclick="applyDragHL('P')" title="보라"></div>
            <div class="hlc-dot hlc-erase" onclick="applyDragHL('E')" title="지우기">✕</div>
          </div>
        </div>
        <div class="hlp-icon-wrap" id="hlBmkWrap">
          <div class="hlp-icon" id="hlBmkBtn"><i class="fa fa-bookmark"></i></div>
          <div class="hlp-dropdown hlp-bmk-list" id="hlBmkList"></div>
        </div>
      </div>
    `;
    document.body.appendChild(p);

    /* 호버/클릭으로 드롭다운 열기 */
    _hlSetupDropdown(p.querySelector('#hlPenWrap'));
    _hlSetupDropdown(p.querySelector('#hlBmkWrap'));

    /* 모바일: 터치로 dot 선택 시 touchend 전파 방지 */
    p.querySelector('#hlColors').addEventListener('touchend', e=> e.stopPropagation(), {passive:false});
    p.querySelector('#hlBmkList').addEventListener('touchend', e=> e.stopPropagation(), {passive:false});
  }

  /* ── 위치 계산: 선택 영역 위쪽 우선, 공간 없으면 아래쪽 ── */
  const pickerH = 40;
  const pickerW = 90;
  const gap = 8;

  const cx = rect.left + rect.width / 2;
  let lx = Math.max(8, Math.min(cx - pickerW / 2, window.innerWidth - pickerW - 8));

  let ly;
  if(rect.top - pickerH - gap > 10){
    ly = rect.top - pickerH - gap;
  } else {
    ly = rect.bottom + gap;
  }

  /* 드롭다운 닫기 */
  p.querySelectorAll('.hlp-icon-wrap').forEach(w => w.classList.remove('open'));

  /* 모바일: 펜 드롭다운 바로 열기 */
  if(_lastInputWasTouch){
    p.querySelector('#hlPenWrap').classList.add('open');
  }

  p.style.left = lx + 'px';
  p.style.top = ly + 'px';
  p.style.display = 'block';

  /* 북마크(주제) 목록 업데이트 */
  _hlUpdateBmkList();

  clearTimeout(p._t);
  p._t = setTimeout(hideHLPicker, _lastInputWasTouch ? 8000 : 5000);
}

/* ── 드롭다운 호버/클릭 설정 ── */
function _hlSetupDropdown(wrap){
  if(!wrap) return;
  let timer = null;

  function open(){
    clearTimeout(timer);
    /* 다른 드롭다운은 닫기 */
    wrap.closest('.hlp-bar').querySelectorAll('.hlp-icon-wrap').forEach(w=>{
      if(w !== wrap) w.classList.remove('open');
    });
    wrap.classList.add('open');
    /* 자동닫기 타이머 리셋 */
    const p = document.getElementById('hlPicker');
    if(p){ clearTimeout(p._t); p._t = setTimeout(hideHLPicker, _lastInputWasTouch ? 8000 : 5000); }
  }
  function close(){
    timer = setTimeout(()=> wrap.classList.remove('open'), 250);
  }

  wrap.querySelector('.hlp-icon').addEventListener('mouseenter', open);
  wrap.querySelector('.hlp-icon').addEventListener('click', open);
  wrap.querySelector('.hlp-dropdown').addEventListener('mouseenter', ()=> clearTimeout(timer));
  wrap.querySelector('.hlp-dropdown').addEventListener('mouseleave', close);
  wrap.addEventListener('mouseleave', close);
}

/* ── 북마크(주제) 목록 렌더 ── */
function _hlUpdateBmkList(){
  const list = document.getElementById('hlBmkList');
  if(!list) return;
  const topics = S.hlTopics || [{id:'default',name:'기본',visible:true}];
  if(topics.length <= 1){
    /* 주제 1개면 북마크 아이콘 숨김 */
    const wrap = document.getElementById('hlBmkWrap');
    if(wrap) wrap.style.display = 'none';
    return;
  }
  const wrap = document.getElementById('hlBmkWrap');
  if(wrap) wrap.style.display = '';

  let h = '';
  topics.forEach(t=>{
    const cls = t.id === S.activeHlTopic ? ' hlp-bmk-active' : '';
    h += '<div class="hlp-bmk-item' + cls + '" onclick="_hlPickBmk(\'' + t.id + '\')">';
    h += '<i class="fa fa-bookmark" style="font-size:9px"></i> ';
    h += (typeof _escHtml === 'function' ? _escHtml(t.name) : t.name);
    h += '</div>';
  });
  list.innerHTML = h;
}

/* ── 북마크 선택 ── */
function _hlPickBmk(id){
  if(typeof _htSetActive === 'function') _htSetActive(id);
  /* 드롭다운 닫기 */
  const wrap = document.getElementById('hlBmkWrap');
  if(wrap) wrap.classList.remove('open');
  /* 선택 완료 토스트 */
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(t && typeof toast === 'function') toast('주제: ' + t.name);
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
