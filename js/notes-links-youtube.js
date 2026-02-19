// notes-links-youtube.js — 유튜브 영상 삽입
function initYtPopover(){
  if(document.getElementById('popYtEmbed')) return;
  const ytPop = document.createElement('div');
  ytPop.id = 'popYtEmbed';
  ytPop.style.cssText = 'display:none;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px 16px;width:320px;box-shadow:var(--shadow);';
  ytPop.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;"><i class="fab fa-youtube" style="color:#ff4444;margin-right:5px"></i>유튜브 영상 삽입</div>
    <input id="ytUrl" type="text" placeholder="https://youtube.com/watch?v=..."
      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12px;color:var(--text);outline:none;margin-bottom:6px;box-sizing:border-box;">
    <div id="ytPreview" style="display:none;margin-bottom:8px;border-radius:6px;overflow:hidden;">
      <iframe id="ytIframe" style="width:100%;height:160px;border:none;" allowfullscreen></iframe>
    </div>
    <div style="display:flex;gap:6px;justify-content:flex-end;">
      <button onmousedown="event.preventDefault();previewYt()" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">미리보기</button>
      <button onmousedown="event.preventDefault();hidePopover('popYtEmbed')" style="padding:4px 12px;border-radius:5px;border:1px solid var(--border2);background:var(--bg4);color:var(--text2);font-size:11px;cursor:pointer;">취소</button>
      <button onmousedown="event.preventDefault();insertYtEmbed()" style="padding:4px 12px;border-radius:5px;border:none;background:#e03333;color:#fff;font-size:11px;font-weight:600;cursor:pointer;">삽입</button>
    </div>`;
  document.body.appendChild(ytPop);
}
function openYoutubeEmbed(btnEl){
  saveRange();
  initEmbedPopovers();
  document.getElementById('ytUrl').value = '';
  document.getElementById('ytPreview').style.display = 'none';
  showPopover('popYtEmbed', btnEl);
  setTimeout(()=>document.getElementById('ytUrl').focus(), 60);
}
function getYtId(url){
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : (url.length<=11 ? url.trim() : '');
}
function previewYt(){
  const vid = getYtId(document.getElementById('ytUrl').value.trim());
  if(!vid){ toast('유효한 유튜브 URL을 입력해주세요'); return; }
  document.getElementById('ytIframe').src = `https://www.youtube.com/embed/${vid}`;
  document.getElementById('ytPreview').style.display = 'block';
}
function insertYtEmbed(){
  const vid = getYtId(document.getElementById('ytUrl').value.trim());
  if(!vid){ toast('유효한 유튜브 URL을 입력해주세요'); return; }
  const thumb = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  const ytUrl = `https://www.youtube.com/watch?v=${vid}`;
  hidePopover('popYtEmbed');
  const wrap = document.createElement('div');
  wrap.className = 'note-yt-card';
  wrap.contentEditable = 'false';
  wrap.title = '유튜브에서 열기';
  wrap.onclick = ()=> window.open(ytUrl, '_blank');
  wrap.innerHTML = `
    <div style="position:relative;display:block;cursor:pointer;">
      <img src="${thumb}" alt="YouTube" style="width:100%;border-radius:6px 6px 0 0;display:block;max-height:180px;object-fit:cover;" onerror="this.style.display='none'">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
        <div style="width:48px;height:48px;background:rgba(220,0,0,.92);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <i class="fa fa-play" style="color:#fff;font-size:18px;margin-left:4px;"></i>
        </div>
      </div>
    </div>
    <div style="padding:6px 10px 8px;background:var(--bg2);border-radius:0 0 6px 6px;border:1px solid var(--border);border-top:none;display:flex;align-items:center;gap:8px;">
      <span style="font-size:11px;color:#e03333;font-weight:700;flex-shrink:0;"><i class="fab fa-youtube"></i> YouTube</span>
      <span style="font-size:10px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ytUrl}</span>
    </div>`;
  insertNodeAtCursor(wrap);
  toast('유튜브 링크가 삽입됐어요');
}
