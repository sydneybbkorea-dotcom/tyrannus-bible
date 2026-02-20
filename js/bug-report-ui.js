// bug-report-ui.js — 버그 리포트 폼 UI 렌더링
function renderBugReport(){
  const c=document.getElementById('spBugBody');
  if(!c) return;
  c.innerHTML=`
<div class="bug-form">
  <label class="bug-label">제목 <span class="bug-req">*</span></label>
  <input type="text" id="bugTitle" class="bug-input" placeholder="버그 요약...">
  <label class="bug-label">설명</label>
  <textarea id="bugDesc" class="bug-textarea" rows="4" placeholder="어떤 상황에서 발생했는지 자세히 적어주세요..."></textarea>
  <label class="bug-label">스크린샷 첨부</label>
  <div class="bug-drop" id="bugDropZone" onclick="document.getElementById('bugFileInput').click()">
    <i class="fa fa-cloud-arrow-up bug-drop-icon"></i>
    <span class="bug-drop-txt">클릭 또는 드래그하여 이미지 첨부</span>
    <input type="file" id="bugFileInput" accept="image/*" multiple style="display:none" onchange="bugFilePicked(this)">
  </div>
  <div id="bugPreviews" class="bug-previews"></div>
  <button class="bug-submit" onclick="bugSubmit()"><i class="fa fa-paper-plane"></i> 리포트 제출</button>
  <div id="bugStatus"></div>
</div>
<div id="bugHistory" class="bug-history"></div>`;
  _bugLoadHistory();
}
