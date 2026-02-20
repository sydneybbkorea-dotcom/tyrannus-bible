// settings-panel-sync.js — 설정 패널 내 클라우드 동기화 카드 UI
function _stpSyncSection(){
  var h = '<div class="stp-cloud-card" id="stpCloudCard">';
  h += '<div class="stp-cloud-head">';
  h += '<span class="stp-cloud-title"><i class="fa fa-cloud"></i> '+t('cloud')+'</span>';
  h += '<span id="syncBadge" class="sync-badge sync-ok">';
  h += '<i class="fa fa-cloud"></i> <span id="syncText">'+t('sync.done')+'</span></span>';
  h += '</div>';
  h += '<div id="syncQuotaWrap" class="stp-cloud-body" style="display:none">';
  h += '<div class="stp-quota-bar-wrap" onclick="showQuotaModal()" title="'+t('storage')+'">';
  h += '<div class="stp-quota-head">';
  h += '<span class="stp-quota-label">'+t('storage')+'</span>';
  h += '<span id="quotaLabel" class="stp-quota-val">'+t('storage.default')+'</span>';
  h += '</div>';
  h += '<div class="stp-quota-track"><div class="stp-quota-fill" id="quotaFill"></div></div>';
  h += '</div>';
  h += '<button class="stp-cloud-upgrade" onclick="showUpgradeMsg()">';
  h += '<i class="fa fa-arrow-up"></i> '+t('add.storage')+'</button>';
  h += '</div>';
  h += '<div id="stpSyncLogin" class="stp-cloud-login">';
  h += '<i class="fa fa-sign-in-alt"></i> '+t('login.sync');
  h += '</div>';
  h += '</div>';
  return h;
}
