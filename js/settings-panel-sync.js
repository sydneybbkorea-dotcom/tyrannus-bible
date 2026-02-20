// settings-panel-sync.js — 설정 패널 내 클라우드 동기화 카드 UI
function _stpSyncSection(){
  var h = '<div class="stp-cloud-card" id="stpCloudCard">';
  // 헤더: 아이콘 + 제목 + 동기화 상태 배지
  h += '<div class="stp-cloud-head">';
  h += '<span class="stp-cloud-title"><i class="fa fa-cloud"></i> 클라우드</span>';
  h += '<span id="syncBadge" class="sync-badge sync-ok">';
  h += '<i class="fa fa-cloud"></i> <span id="syncText">동기화 완료</span></span>';
  h += '</div>';
  // 용량 바 영역 (로그인 시 표시)
  h += '<div id="syncQuotaWrap" class="stp-cloud-body" style="display:none">';
  h += '<div class="stp-quota-bar-wrap" onclick="showQuotaModal()" title="상세 보기">';
  h += '<div class="stp-quota-head">';
  h += '<span class="stp-quota-label">저장 공간</span>';
  h += '<span id="quotaLabel" class="stp-quota-val">0 / 10 MB</span>';
  h += '</div>';
  h += '<div class="stp-quota-track"><div class="stp-quota-fill" id="quotaFill"></div></div>';
  h += '</div>';
  // 용량 추가 버튼
  h += '<button class="stp-cloud-upgrade" onclick="showUpgradeMsg()">';
  h += '<i class="fa fa-arrow-up"></i> 용량 추가</button>';
  h += '</div>';
  // 미로그인 안내 (로그인 시 숨김)
  h += '<div id="stpSyncLogin" class="stp-cloud-login">';
  h += '<i class="fa fa-sign-in-alt"></i> 로그인하면 동기화가 시작됩니다';
  h += '</div>';
  h += '</div>';
  return h;
}
