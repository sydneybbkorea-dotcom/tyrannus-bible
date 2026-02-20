// highlight-memo.js — 하이라이트 메모 팝업 표시/닫기
function showMarkMemo(mark, x, y){
  _activeMark = mark;
  let popup = document.getElementById('markMemoPopup');
  if(!popup){
    popup = document.createElement('div');
    popup.id = 'markMemoPopup';
    popup.style.cssText = `position:fixed;background:var(--bg3);border:1px solid var(--border2);
      border-radius:12px;padding:0;width:340px;z-index:9999;box-shadow:var(--shadow);overflow:hidden;
      display:flex;flex-direction:column;`;
    popup.innerHTML = buildMemoPopupHTML();
    document.body.appendChild(popup);
  }
  highlightMemoGroup(mark);
  loadMemoData(mark);
  positionMemoPopup(popup, x, y);
}

function buildMemoPopupHTML(){
  return `
    <div style="padding:8px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--border);flex-shrink:0">
      <i class="fa fa-highlighter" style="color:var(--gold);font-size:12px;flex-shrink:0"></i>
      <input id="markMemoName" type="text" placeholder="${t('hl.memo')}"
        style="flex:1;background:transparent;border:none;color:var(--text);font-size:13px;font-weight:600;outline:none;padding:2px 0;min-width:0">
      <span onclick="closeMarkMemo()" style="cursor:pointer;color:var(--text3);font-size:15px;line-height:1;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .1s;flex-shrink:0" onmouseenter="this.style.background='var(--bg4)'" onmouseleave="this.style.background='none'">✕</span>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
      <div id="markMemoText" contenteditable="true" style="
        flex:1;min-height:140px;max-height:260px;overflow-y:auto;
        padding:12px 14px;font-size:13px;color:var(--text);line-height:1.8;
        outline:none;font-family:'KoPub Batang',serif;
        border:none;background:transparent;"
        oninput="processVersLinks(this)"
        onkeydown="memoKeyHandler(event)"
        data-placeholder="${t('hl.memo.ph')}"></div>
      <div id="memoTagChips" style="padding:0 14px 6px;display:flex;flex-wrap:wrap;gap:4px;min-height:0"></div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-top:1px solid var(--border);background:var(--bg2);flex-shrink:0">
      <i class="fa fa-tags" style="font-size:10px;color:var(--text3);flex-shrink:0"></i>
      <input id="memoTagInp" type="text" placeholder="${t('hl.tag.ph')}"
        style="flex:1;min-width:60px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:4px 8px;font-size:11px;color:var(--text);outline:none;"
        onkeydown="addMemoTag(event)">
      <button onclick="deleteMarkHL()" style="padding:4px 10px;border-radius:5px;border:1px solid var(--border2);
        background:transparent;color:var(--text3);font-size:11px;cursor:pointer;flex-shrink:0">
        <i class="fa fa-eraser"></i> ${t('hl.delete')}
      </button>
      <button onclick="saveMarkMemo()" style="padding:4px 14px;border-radius:5px;border:none;
        background:var(--gold);color:var(--bg);font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0">
        ${t('hl.save')}
      </button>
    </div>`;
}
