// settings-panel-sync.js — 설정 패널 내 클라우드 동기화 섹션 (리디자인)
function _stpSyncSection(){
  var h = '';

  // 섹션 구분선
  h += '<div class="stp-divider"></div>';

  // 헤더 행: 클라우드 아이콘 + 제목 + 상태 표시
  h += '<div class="stp-row">';
  h += '<div class="stp-row-head">';
  h += '<i class="fa fa-cloud"></i> <span>' + t('sync.title', '클라우드 동기화') + '</span>';
  h += '<span id="syncBadge" class="stp-sync-status stp-sync-ok">';
  h += '<span class="stp-sync-dot"></span>';
  h += '<span id="syncText">' + t('sync.done', '동기화 완료') + '</span>';
  h += '</span>';
  h += '</div>';
  h += '</div>';

  // 용량 바 (로그인 시 표시)
  h += '<div id="syncQuotaWrap" class="stp-row" style="display:none">';
  h += '<div class="stp-sync-quota" onclick="showQuotaModal()" title="상세 보기">';
  h += '<div class="stp-row-toggle">';
  h += '<span class="stp-label"><i class="fa fa-database"></i> ' + t('sync.storage', '저장 공간') + '</span>';
  h += '<span id="quotaLabel" class="stp-val">0 / 10 MB</span>';
  h += '</div>';
  h += '<div class="stp-quota-track"><div class="stp-quota-fill" id="quotaFill"></div></div>';
  h += '</div>';

  // 용량 추가 버튼
  h += '<button class="stp-sync-action" onclick="showUpgradeMsg()">';
  h += '<i class="fa fa-arrow-up"></i> ' + t('sync.upgrade', '용량 추가');
  h += '</button>';
  h += '</div>';

  // 미로그인 안내
  h += '<div id="stpSyncLogin" class="stp-sync-login">';
  h += '<i class="fa fa-user-lock"></i>';
  h += '<span>' + t('sync.loginHint', '로그인하면 자동 동기화됩니다') + '</span>';
  h += '</div>';

  return h;
}
