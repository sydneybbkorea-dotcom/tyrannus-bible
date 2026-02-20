// bug-report-ui.js — 버그 리포트 폼 UI 렌더링
function renderBugReport(){
  const c=document.getElementById('spBugBody');
  if(!c) return;
  c.innerHTML=`
<div class="bug-form">
  <label class="bug-label">${t('bug.title')} <span class="bug-req">*</span></label>
  <input type="text" id="bugTitle" class="bug-input" placeholder="${t('bug.title.ph')}">
  <label class="bug-label">${t('bug.desc')}</label>
  <textarea id="bugDesc" class="bug-textarea" rows="4" placeholder="${t('bug.desc.ph')}"></textarea>
  <label class="bug-label">${t('bug.screenshot')}</label>
  <div class="bug-drop" id="bugDropZone" onclick="document.getElementById('bugFileInput').click()">
    <i class="fa fa-cloud-arrow-up bug-drop-icon"></i>
    <span class="bug-drop-txt">${t('bug.drop')}</span>
    <input type="file" id="bugFileInput" accept="image/*" multiple style="display:none" onchange="bugFilePicked(this)">
  </div>
  <div id="bugPreviews" class="bug-previews"></div>
  <button class="bug-submit" onclick="bugSubmit()"><i class="fa fa-paper-plane"></i> ${t('bug.submit')}</button>
  <div id="bugStatus"></div>
</div>
<div id="bugHistory" class="bug-history"></div>`;
  _bugLoadHistory();
}
