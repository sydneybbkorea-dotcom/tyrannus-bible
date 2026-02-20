// settings-panel-sync.js — 설정 패널 내 클라우드 동기화 섹션
function _stpSyncSection(){
  var h = '<div class="stp-sync">';
  h += '<div class="stp-sync-head"><i class="fa fa-cloud"></i> 클라우드</div>';
  // 동기화 배지 (firebase-ui.js가 같은 ID로 업데이트)
  h += '<div id="syncQuotaWrap" class="stp-sync-body" style="display:none">';
  h += '<div id="syncBadge" class="sync-badge">';
  h += '<i class="fa fa-cloud"></i> <span id="syncText">동기화 완료</span>';
  h += '</div>';
  h += '<div id="quotaBar" class="quota-bar-inline" onclick="showQuotaModal()" title="저장 공간">';
  h += '<div class="quota-track"><div class="quota-fill" id="quotaFill"></div></div>';
  h += '<span id="quotaLabel" class="quota-label">0 / 10 MB</span>';
  h += '</div>';
  h += '</div>';
  // 미로그인 상태 안내
  h += '<div id="stpSyncLogin" class="stp-sync-login">';
  h += '<span>로그인하면 동기화가 시작됩니다</span>';
  h += '</div>';
  h += '</div>';
  return h;
}
