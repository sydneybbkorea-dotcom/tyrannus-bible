// highlight-topics.js — 주제별 하이라이트 CRUD + 관리 UI

// ── 주제 CRUD ──────────────────────────────────────────

function _htCreateTopic(name){
  if(!name || !name.trim()) return;
  const id = 'ht_' + Date.now();
  if(!S.hlTopics) S.hlTopics = [{id:'default',name:'기본',visible:true}];
  S.hlTopics.push({id, name:name.trim(), visible:true});
  persist();
  return id;
}

function _htRenameTopic(id, name){
  if(!name || !name.trim()) return;
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(t) { t.name = name.trim(); persist(); }
}

function _htDeleteTopic(id){
  if(id === 'default') return; // 기본 주제는 삭제 불가
  // 소속 하이라이트를 default로 이동
  Object.values(S.hlRanges||{}).forEach(ranges=>{
    ranges.forEach(r=>{ if(r.topicId===id) r.topicId='default'; });
  });
  Object.values(S.hlMemo||{}).forEach(m=>{
    if(m.topicId===id) m.topicId='default';
  });
  S.hlTopics = (S.hlTopics||[]).filter(t=>t.id!==id);
  if(S.activeHlTopic === id) S.activeHlTopic = 'default';
  persist();
  if(typeof renderBible === 'function') renderBible();
}

function _htToggleVisibility(id){
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(!t) return;
  t.visible = !t.visible;
  persist();
  if(typeof renderBible === 'function') renderBible();
}

function _htSetActive(id){
  S.activeHlTopic = id;
  persist();
}

// ── 관리 UI (설정 패널 서브페이지) ─────────────────────

function _htRenderManager(){
  const topics = S.hlTopics || [{id:'default',name:'기본',visible:true}];
  let h = '<div class="ht-list">';

  topics.forEach(t=>{
    const isDefault = t.id === 'default';
    const hidden = t.visible === false;
    const eyeIcon = hidden ? 'fa-eye-slash' : 'fa-eye';
    const hiddenCls = hidden ? ' ht-item-hidden' : '';
    const activeCls = S.activeHlTopic === t.id ? ' ht-item-active' : '';

    h += '<div class="ht-item' + hiddenCls + activeCls + '" data-id="' + t.id + '">';
    h += '<button class="ht-eye-btn" onclick="_htToggleVisibility(\'' + t.id + '\');_stpGoTopics()" title="표시/숨김">';
    h += '<i class="fa ' + eyeIcon + '"></i></button>';
    h += '<span class="ht-item-name">' + _escHtml(t.name) + '</span>';
    h += '<button class="ht-edit-btn" onclick="_htPromptRename(\'' + t.id + '\')" title="이름 변경">';
    h += '<i class="fa fa-pen"></i></button>';
    if(!isDefault){
      h += '<button class="ht-del-btn" onclick="_htConfirmDelete(\'' + t.id + '\')" title="삭제">';
      h += '<i class="fa fa-trash"></i></button>';
    }
    h += '</div>';
  });

  h += '</div>';
  h += '<button class="ht-add-btn" onclick="_htPromptCreate()"><i class="fa fa-plus"></i> 새 주제 추가</button>';

  // 현재 활성 주제 선택
  h += '<div class="ht-active-section">';
  h += '<div class="ht-active-label">현재 활성 주제</div>';
  h += '<select class="ht-active-select" onchange="_htSetActive(this.value);_stpGoTopics()">';
  topics.forEach(t=>{
    const sel = S.activeHlTopic === t.id ? ' selected' : '';
    h += '<option value="' + t.id + '"' + sel + '>' + _escHtml(t.name) + '</option>';
  });
  h += '</select>';
  h += '</div>';

  return h;
}

// ── 피커 내 주제 칩 ────────────────────────────────────

function _htRenderTopicPicker(){
  const topics = S.hlTopics || [];
  if(topics.length <= 1) return ''; // 주제 1개면 표시 안 함
  const active = (topics.find(t=>t.id===S.activeHlTopic) || topics[0]);
  let h = '<div class="ht-topic-picker" onclick="_htTogglePickerDropdown(event)">';
  h += '<i class="fa fa-bookmark" style="font-size:10px;margin-right:3px"></i>';
  h += '<span class="ht-picker-label">' + _escHtml(active.name) + '</span>';
  h += '<i class="fa fa-caret-down" style="font-size:9px;margin-left:2px"></i>';
  h += '</div>';
  h += '<div class="ht-picker-dropdown" id="htPickerDropdown" style="display:none">';
  topics.forEach(t=>{
    const cls = t.id === S.activeHlTopic ? ' ht-topic-chip-active' : '';
    h += '<div class="ht-topic-chip' + cls + '" onclick="_htPickTopic(\'' + t.id + '\')">';
    h += _escHtml(t.name) + '</div>';
  });
  h += '</div>';
  return h;
}

function _htTogglePickerDropdown(e){
  e.stopPropagation();
  const dd = document.getElementById('htPickerDropdown');
  if(dd) dd.style.display = dd.style.display === 'none' ? 'flex' : 'none';
}

function _htPickTopic(id){
  _htSetActive(id);
  const dd = document.getElementById('htPickerDropdown');
  if(dd) dd.style.display = 'none';
  // 피커 라벨 업데이트
  const label = document.querySelector('.ht-picker-label');
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(label && t) label.textContent = t.name;
}

// ── 다이얼로그 헬퍼 ────────────────────────────────────

function _htPromptCreate(){
  const name = prompt('새 주제 이름을 입력하세요:');
  if(name){
    _htCreateTopic(name);
    _stpGoTopics();
  }
}

function _htPromptRename(id){
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(!t) return;
  const name = prompt('주제 이름 변경:', t.name);
  if(name){
    _htRenameTopic(id, name);
    _stpGoTopics();
  }
}

function _htConfirmDelete(id){
  const t = (S.hlTopics||[]).find(t=>t.id===id);
  if(!t) return;
  if(confirm('"' + t.name + '" 주제를 삭제하시겠습니까?\n소속 하이라이트는 "기본" 주제로 이동됩니다.')){
    _htDeleteTopic(id);
    _stpGoTopics();
  }
}

// HTML escape
function _escHtml(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
