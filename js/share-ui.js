// share-ui.js — 공유 UI 함수 (일반 script)

// ── 공유 다이얼로그 (링크 모달) ────────────────
function _shareShowDialog(shareCode, type, label){
  const url = 'https://tyrannus-kjb1611.web.app/?share=' + shareCode;
  const typeLabel = type === 'folder' ? '폴더' : '하이라이트 주제';

  const m = document.getElementById('mShare');
  if(!m) return;
  document.getElementById('mShareLabel').textContent = '"' + label + '" ' + typeLabel;
  document.getElementById('mShareUrl').value = url;
  document.getElementById('mShareCode').textContent = shareCode;
  m.dataset.code = shareCode;

  // 입력 필드 초기화
  const inp = document.getElementById('shareEmailInput');
  if(inp) inp.value = '';

  // 캐시에 데이터가 없으면 Firestore에서 로드 후 렌더
  if(window._shareFetchData){
    window._shareFetchData(shareCode).then(()=> _shareRenderEmails(shareCode));
  } else {
    _shareRenderEmails(shareCode);
  }

  openM('mShare');
}

// ── 허용 이메일 칩 렌더링 ─────────────────────
function _shareRenderEmails(code){
  const wrap = document.getElementById('shareEmailList');
  if(!wrap) return;
  const emails = window._shareGetAllowedEmails ? window._shareGetAllowedEmails(code) : [];
  if(!emails.length){
    wrap.innerHTML = '<div class="share-email-empty">등록된 이메일이 없습니다</div>';
    return;
  }
  let h = '';
  emails.forEach(email=>{
    h += '<div class="share-email-chip">';
    h += '<span class="share-email-text">' + _escHtml(email) + '</span>';
    h += '<button class="share-email-del" onclick="_shareRemoveEmail(\'' + code + '\',\'' + _escHtml(email).replace(/'/g,"\\'") + '\')" title="삭제"><i class="fa fa-times"></i></button>';
    h += '</div>';
  });
  wrap.innerHTML = h;
}

// ── 이메일 추가 ──────────────────────────────
function _shareAddEmail(){
  const m = document.getElementById('mShare');
  if(!m) return;
  const code = m.dataset.code;
  const inp = document.getElementById('shareEmailInput');
  if(!inp) return;
  const email = inp.value.trim().toLowerCase();
  if(!email) return;
  // 간단한 이메일 유효성 검사
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    toast('올바른 이메일 형식을 입력하세요.');
    return;
  }
  // 이미 등록된 이메일 체크
  const existing = window._shareGetAllowedEmails ? window._shareGetAllowedEmails(code) : [];
  if(existing.includes(email)){
    toast('이미 등록된 이메일입니다.');
    return;
  }
  if(window._shareAddAllowedEmail){
    window._shareAddAllowedEmail(code, email).then(()=>{
      _shareRenderEmails(code);
      toast(email + ' 추가됨');
    }).catch(()=> toast('이메일 추가 실패'));
  }
  inp.value = '';
}

// ── 이메일 제거 ──────────────────────────────
function _shareRemoveEmail(code, email){
  if(window._shareRemoveAllowedEmail){
    window._shareRemoveAllowedEmail(code, email).then(()=>{
      _shareRenderEmails(code);
      toast(email + ' 제거됨');
    }).catch(()=> toast('이메일 제거 실패'));
  }
}

// ── 가입 프롬프트 모달 ─────────────────────────
function _shareShowJoinPrompt(code, data){
  const m = document.getElementById('mShareJoin');
  if(!m) return;
  const typeLabel = data.type === 'folder' ? '폴더' : '하이라이트 주제';
  const name = data.type === 'folder' ? data.folderName : data.topicName;
  document.getElementById('msjOwner').textContent = data.ownerName || '(이름 없음)';
  document.getElementById('msjType').textContent = typeLabel;
  document.getElementById('msjName').textContent = '"' + name + '"';
  m.dataset.code = code;
  m.dataset.data = JSON.stringify(data);
  openM('mShareJoin');
}

// ── 클립보드 복사 ──────────────────────────────
function _shareCopyLink(){
  const inp = document.getElementById('mShareUrl');
  if(!inp) return;
  inp.select();
  navigator.clipboard.writeText(inp.value).then(()=>{
    toast('링크가 복사되었습니다!');
  }).catch(()=>{
    document.execCommand('copy');
    toast('링크가 복사되었습니다!');
  });
}

// ── 폴더 컨텍스트 메뉴에서 호출 ────────────────
function _shareFolder(folderId){
  hideFolderNoteCtx();
  if(!window._firebaseUid){
    toast('로그인 후 공유할 수 있습니다.');
    return;
  }
  // 이미 공유 중인지 확인
  const existing = (S.sharedByMe||[]).find(s=>s.type==='folder'&&s.sourceId===folderId);
  if(existing){
    const folder = (S.folders||[]).find(f=>f.id===folderId);
    _shareShowDialog(existing.shareCode, 'folder', folder?.name||'폴더');
    return;
  }
  // 새 공유 생성
  if(!window._shareCreateFolder){ toast('공유 모듈 로딩 중...'); return; }
  window._shareCreateFolder(folderId).then(code=>{
    if(code){
      const folder = (S.folders||[]).find(f=>f.id===folderId);
      _shareShowDialog(code, 'folder', folder?.name||'폴더');
    }
  });
}

// ── 주제 관리에서 호출 ─────────────────────────
function _shareTopic(topicId){
  if(!window._firebaseUid){
    toast('로그인 후 공유할 수 있습니다.');
    return;
  }
  // 이미 공유 중인지 확인
  const existing = (S.sharedByMe||[]).find(s=>s.type==='highlights'&&s.sourceId===topicId);
  if(existing){
    const topic = (S.hlTopics||[]).find(t=>t.id===topicId);
    _shareShowDialog(existing.shareCode, 'highlights', topic?.name||'주제');
    return;
  }
  if(!window._shareCreateHighlight){ toast('공유 모듈 로딩 중...'); return; }
  window._shareCreateHighlight(topicId).then(code=>{
    if(code){
      const topic = (S.hlTopics||[]).find(t=>t.id===topicId);
      _shareShowDialog(code, 'highlights', topic?.name||'주제');
    }
  });
}

// ── 가입 수락 ──────────────────────────────────
function _shareAcceptJoin(){
  const m = document.getElementById('mShareJoin');
  if(!m) return;
  const code = m.dataset.code;
  let data;
  try { data = JSON.parse(m.dataset.data); } catch(e){ return; }
  if(window._shareConfirmJoin) window._shareConfirmJoin(code, data);
  if(window._shareStartListeners) window._shareStartListeners();
  window.renderAll?.();
  toast('공유에 가입했습니다!');
  closeM('mShareJoin');
}

// ── 공유 해제 확인 ─────────────────────────────
function _shareRevokeConfirm(code){
  if(!confirm('이 공유를 해제하시겠습니까?\n수신자들이 더 이상 접근할 수 없게 됩니다.')) return;
  if(window._shareRevoke){
    window._shareRevoke(code).then(()=>{
      toast('공유가 해제되었습니다.');
      if(_stpView === 'sharing') renderSettingsPanel();
    });
  }
  closeM('mShare');
}

// ── 공유 탈퇴 확인 ─────────────────────────────
function _shareLeaveConfirm(code){
  if(!confirm('이 공유에서 나가시겠습니까?')) return;
  if(window._shareLeave) window._shareLeave(code);
  window.renderAll?.();
  toast('공유에서 나갔습니다.');
  if(_stpView === 'sharing') renderSettingsPanel();
}

// ── 설정 서브페이지: "내가 공유 중" ─────────────
function _shareRenderMyShares(){
  const items = S.sharedByMe || [];
  if(!items.length) return '<div class="share-empty">공유 중인 항목이 없습니다.</div>';
  let h = '';
  items.forEach(s=>{
    const icon = s.type === 'folder' ? 'fa-folder' : 'fa-highlighter';
    h += '<div class="share-item">';
    h += '<i class="fa ' + icon + ' share-item-icon"></i>';
    h += '<span class="share-item-name">' + _escHtml(s.sourceName) + '</span>';
    h += '<button class="share-item-btn" onclick="_shareShowDialog(\'' + s.shareCode + '\',\'' + s.type + '\',\'' + _escHtml(s.sourceName).replace(/'/g,"\\'") + '\')" title="링크 보기"><i class="fa fa-link"></i></button>';
    h += '<button class="share-item-btn share-item-del" onclick="_shareRevokeConfirm(\'' + s.shareCode + '\')" title="공유 해제"><i class="fa fa-trash"></i></button>';
    h += '</div>';
  });
  return h;
}

// ── 설정 서브페이지: "나에게 공유된" ────────────
function _shareRenderSharedWithMe(){
  const items = S.sharedWithMe || [];
  if(!items.length) return '<div class="share-empty">공유받은 항목이 없습니다.</div>';
  let h = '';
  items.forEach(s=>{
    const icon = s.type === 'folder' ? 'fa-folder' : 'fa-highlighter';
    h += '<div class="share-item">';
    h += '<i class="fa ' + icon + ' share-item-icon"></i>';
    h += '<span class="share-item-name">' + _escHtml(s.label) + ' <span class="share-owner">(' + _escHtml(s.ownerName) + ')</span></span>';
    h += '<button class="share-item-btn share-item-leave" onclick="_shareLeaveConfirm(\'' + s.shareCode + '\')" title="나가기"><i class="fa fa-sign-out-alt"></i></button>';
    h += '</div>';
  });
  return h;
}
