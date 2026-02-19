// notes-links-url.js — 외부 URL 링크 삽입
function initEmbedPopovers(){
  if(document.getElementById('popUrlEmbed')) return;
  const urlPop = document.createElement('div');
  urlPop.id = 'popUrlEmbed';
  urlPop.style.cssText = 'display:none;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px 16px;width:300px;box-shadow:var(--shadow);';
  urlPop.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;"><i class="fa fa-globe" style="color:var(--gold);margin-right:5px"></i>외부 링크 삽입</div>
    <input id="embedUrl" type="text" placeholder="https://example.com"
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:6px;box-sizing:border-box;">
    <input id="embedUrlLabel" type="text" placeholder="표시 텍스트 (선택)"
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:10px;box-sizing:border-box;">
    <div style="display:flex;gap:6px;justify-content:flex-end;">
      <button onmousedown="event.preventDefault();hidePopover('popUrlEmbed')" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">취소</button>
      <button onmousedown="event.preventDefault();insertUrlEmbed()" style="padding:4px 12px;border-radius:5px;border:none;background:var(--gold);color:#fff;font-size:11px;font-weight:600;cursor:pointer;">삽입</button>
    </div>`;
  document.body.appendChild(urlPop);
  initYtPopover();
}
function openUrlEmbed(btnEl){
  saveRange();
  initEmbedPopovers();
  document.getElementById('embedUrl').value = '';
  document.getElementById('embedUrlLabel').value = '';
  showPopover('popUrlEmbed', btnEl);
  setTimeout(()=>document.getElementById('embedUrl').focus(), 60);
}
function insertUrlEmbed(){
  const url = document.getElementById('embedUrl').value.trim();
  if(!url){ toast('URL을 입력해주세요'); return; }
  const label = document.getElementById('embedUrlLabel').value.trim() || url;
  hidePopover('popUrlEmbed');
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  a.className = 'note-extlink'; a.contentEditable = 'false';
  a.innerHTML = `<i class="fa fa-globe"></i> ${label}`;
  insertNodeAtCursor(a);
  toast('링크가 삽입됐어요');
}
