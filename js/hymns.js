// ═══════════════════════════════════════════════════
// hymns.js — Hymn viewer, player, favorites, playlists
// Side panel: list / playlists
// Overlay (bibleScroll area): detail view (sheet + player)
// ═══════════════════════════════════════════════════

/* ── Section 1: Data Catalog ── */
var HYMN_MP3_SET = new Set([1,2,4,5,6,7,9,10,11,13,15,17,18,20,23,24,26,27,31,32,33,34,36,37,38,39,40,42,44,46,47,49,50,51,52,53,54,55,56,57,58,59,61,62,63,66,67,70,71,73,75,77,82,83,85,86,87,89,90,93,94,100,101,102,103,105,106,110,111,112,113,115,118,120,121,122,124,125,126,127,128,129,132,137,138,140,141,143,144,145,146,147,148,149,150,156,157,159,160,161,162,163,164,166,174,175,176,177,178,179,194,195,197,198,199,200,201,202,203,204,205,207,208,209,210,211,212,213,214,216,217,218,221,222,223,224,225,226,227,228,229,230,231,232,234,235,236,238,241,242,243,244,245,246,247,248,249,250,251,252,253,255,256,257,258,259,260,261,262,263,264,265,266,268,269,270,271,272,274,275,277,279,281,283,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,303,308,309,310,311,313,314,316,317,318,321,322,323,326,327,328,329,330,332,333,334,339,340,341,342,343,344,347,348,349,351,352,353,354,355,356,357,359,360,361,363,364,365,367,368,370,371,372,373,375,376,377,378,379,380,381,384,385,388,389,390,391,392,393,394,396,397,398,401,402,404,406,407,408,409,410,411,413,414,416,418,419,420,424,425,426,428,431,432,433,435,436,438,439,440,441,442,443,445,446,447,448,449,450,452,453,454,455,456,457,458,459,460,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,481,482,483,484,487,488,489,492,493,494,495,496,497,498,499,500,502,503,504,505,506,509,510,511,512,513,514,515,517]);
var HYMN_SHEET_SET = new Set([1,2,3,4,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,27,28,30,31,32,33,35,36,37,38,39,41,42,43,44,45,47,48,49,50,52,53,55,56,57,58,60,61,62,63,64,65,66,67,68,69,70,72,73,75,76,77,78,79,81,82,83,84,86,87,88,89,90,91,92,94,95,97,98,100,101,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,125,126,128,129,130,131,133,135,136,137,138,139,141,142,144,145,146,147,148,150,152,154,155,156,158,159,160,162,163,164,165,166,168,169,171,172,173,176,177,178,179,191,193,194,195,197,198,199,200,201,202,203,204,205,207,208,209,210,212,213,214,216,217,219,221,222,223,224,225,226,228,229,230,231,232,233,235,236,238,239,241,242,243,244,245,246,247,248,250,251,253,254,255,256,257,258,259,260,261,262,263,264,265,266,268,269,270,272,273,275,276,278,279,280,281,282,284,285,287,288,289,290,291,293,294,295,296,297,298,299,300,301,302,303,305,306,307,308,309,310,311,312,313,314,315,316,317,319,320,321,322,324,326,327,329,330,331,332,334,335,337,338,340,341,343,344,345,346,347,348,349,350,352,354,355,357,358,360,361,363,364,365,366,367,368,369,371,372,373,374,376,378,379,380,381,382,383,384,386,388,389,390,392,393,395,396,397,398,399,400,401,403,405,407,409,410,411,412,413,414,415,416,417,419,420,421,422,423,424,425,426,427,429,430,431,432,433,434,436,437,439,440,441,443,444,446,447,448,449,450,451,452,453,454,455,456,458,459,460,462,463,464,466,467,468,469,470,472,474,475,477,479,480,481,483,487,489,491,492,493,495,497,498,499,501,503,504,505,507,508,509,510,511,512,513,514,515,516,518,519,520,521,522,523,524,525,526,527,529,530,531,532,534,535,536,537,538]);
var HYMN_ALL_IDS = (function(){
  var s = new Set(HYMN_MP3_SET);
  HYMN_SHEET_SET.forEach(function(id){ s.add(id); });
  return Array.from(s).sort(function(a,b){ return a-b; });
})();

function _hymnLabel(id){ return '\uCC2C\uC591 '+id; }
function _hymnHasMp3(id){ return HYMN_MP3_SET.has(id); }
function _hymnHasSheet(id){ return HYMN_SHEET_SET.has(id); }
function _hymnMp3Url(id){ return 'hymns/GR8Hymns/mp3/'+id+'.mp3'; }
function _hymnSheetUrl(id){ return 'hymns/GR8Hymns/sheet/'+id+'.png'; }

/* ── Section 2: Runtime State ── */
var _hym = {
  inited: false,
  spView: 'list',        // side panel view: 'list' | 'playlists' | 'playlist-detail'
  detailOpen: false,      // overlay detail open?
  filter: 'all',
  search: '',
  selectedId: null,
  audio: null,
  playing: false,
  currentId: null,
  duration: 0,
  currentTime: 0,
  queue: [],
  queueIdx: -1,
  queueName: '',
  repeat: 'none',
  shuffle: false,
  zoom: 1,
  addMenuId: null,
  seeking: false,
  currentPlaylistId: null,
};

/* ── Section 3: Init ── */
function _hymInit(){
  if(_hym.inited) return;
  _hym.inited = true;
  _hym.audio = document.getElementById('hymAudio');
  if(!_hym.audio) return;
  var a = _hym.audio;
  a.addEventListener('timeupdate', _hymOnTimeUpdate);
  a.addEventListener('ended', _hymOnEnded);
  a.addEventListener('loadedmetadata', function(){ _hym.duration = a.duration; _hymUpdateAllPlayers(); });
  a.addEventListener('play', function(){ _hym.playing = true; _hymUpdatePlayIcons(); });
  a.addEventListener('pause', function(){ _hym.playing = false; _hymUpdatePlayIcons(); });
  if(S.hymnLastPlayed && (HYMN_MP3_SET.has(S.hymnLastPlayed) || HYMN_SHEET_SET.has(S.hymnLastPlayed))){
    _hym.currentId = S.hymnLastPlayed;
  }
}

// Called from _initSection('hymns') in icon-rail.js
function _hymInitSidePanel(){
  _hymInit();
  _hymShowSpView(_hym.spView);
  if(_hym.currentId) _hymShowSpPlayer();
}

/* ── Section 4: Side Panel View Management ── */
function _hymShowSpView(name){
  _hym.spView = name;
  var toolbar = document.getElementById('hymToolbar');
  ['hymViewList','hymViewPlaylists','hymViewPlaylistDetail'].forEach(function(id){
    var e = document.getElementById(id);
    if(e) e.style.display = 'none';
  });
  var viewMap = {list:'hymViewList', playlists:'hymViewPlaylists', 'playlist-detail':'hymViewPlaylistDetail'};
  var v = document.getElementById(viewMap[name]);
  if(v) v.style.display = '';
  // toolbar visibility
  if(toolbar) toolbar.style.display = (name === 'list') ? '' : 'none';
  if(name === 'list') _hymRenderList();
  else if(name === 'playlists') _hymRenderPlaylists();
  else if(name === 'playlist-detail') _hymRenderPlaylistDetail(_hym.currentPlaylistId);
}

/* ── Detail overlay (bibleScroll area) ── */
function _hymOpenDetail(id){
  _hym.selectedId = id;
  _hym.detailOpen = true;
  _hym.zoom = 1;
  // show overlay, hide bibleScroll
  var overlay = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  if(overlay) overlay.style.display = 'flex';
  if(scroll) scroll.style.display = 'none';
  // update overlay header
  var title = document.getElementById('hymTitle');
  if(title) title.textContent = _hymnLabel(id);
  _hymRenderDetail(id);
}

function _hymCloseDetail(){
  _hym.detailOpen = false;
  var overlay = document.getElementById('hymnsOverlay');
  var scroll = document.getElementById('bibleScroll');
  if(overlay) overlay.style.display = 'none';
  if(scroll) scroll.style.display = '';
}

/* ── Section 5: List View (side panel) ── */
function _hymRenderList(){
  var cont = document.getElementById('hymViewList');
  if(!cont) return;
  var ids = _hymFilteredIds();
  if(ids.length === 0){
    cont.innerHTML = '<div class="hym-empty"><i class="fa fa-'+ (_hym.filter==='fav'?'heart':'search') +'"></i>'+(_hym.filter==='fav'?'\uC990\uACA8\uCC3E\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4':'\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4')+'</div>';
    return;
  }
  var h = '';
  for(var i=0; i<ids.length; i++){
    var id = ids[i];
    var isFav = S.hymnFav.has(id);
    var hasMp3 = _hymnHasMp3(id);
    var hasSheet = _hymnHasSheet(id);
    var isPlaying = _hym.currentId === id && _hym.playing;
    h += '<div class="hym-list-item'+(isPlaying?' hym-playing':'')+'" data-id="'+id+'" onclick="_hymOpenDetail('+id+')">';
    h += '<span class="hym-list-num">'+id+'</span>';
    h += '<span class="hym-list-title">'+_hymnLabel(id)+'</span>';
    h += '<div class="hym-list-icons">';
    if(hasMp3) h += '<button class="hym-play-btn" onclick="_hymQuickPlay('+id+',event)" title="\uC7AC\uC0DD"><i class="fa fa-play"></i></button>';
    h += '<button class="hym-add-pl-btn" onclick="_hymShowAddMenu('+id+',event)" title="\uC7AC\uC0DD\uBAA9\uB85D\uC5D0 \uCD94\uAC00"><i class="fa fa-plus"></i></button>';
    h += '<button class="hym-fav-btn'+(isFav?' hym-fav-on':'')+'" onclick="_hymToggleFav('+id+',event)" title="\uC990\uACA8\uCC3E\uAE30">';
    h += '<i class="fa'+(isFav?'s':'r')+' fa-heart"></i></button>';
    h += '</div></div>';
  }
  cont.innerHTML = h;
}

function _hymFilteredIds(){
  var ids;
  if(_hym.filter === 'fav'){
    ids = HYMN_ALL_IDS.filter(function(id){ return S.hymnFav.has(id); });
  } else {
    ids = HYMN_ALL_IDS;
  }
  if(_hym.search){
    var q = _hym.search.trim();
    if(q) ids = ids.filter(function(id){ return String(id).indexOf(q) !== -1; });
  }
  return ids;
}

function _hymOnSearch(val){
  _hym.search = val;
  if(_hym.spView === 'list') _hymRenderList();
}

function _hymSetFilter(f){
  if(f === 'playlists'){
    _hym.filter = f;
    _hymShowSpView('playlists');
    return;
  }
  _hym.filter = f;
  if(_hym.spView !== 'list') _hymShowSpView('list');
  else _hymRenderList();
  // update filter button active states
  document.querySelectorAll('.hym-filter-btn').forEach(function(b){
    b.classList.toggle('hym-filter-active', b.dataset.filter === _hym.filter);
  });
}

function _hymToggleFav(id, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(S.hymnFav.has(id)) S.hymnFav.delete(id);
  else S.hymnFav.add(id);
  persist();
  if(_hym.spView === 'list') _hymRenderList();
  if(_hym.detailOpen && _hym.selectedId === id) _hymRenderDetail(id);
}

function _hymQuickPlay(id, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(!_hymnHasMp3(id)) return;
  _hymSetQueue([id], 0);
}

/* ── Section 6: Detail View (overlay in bibleScroll area) ── */
function _hymRenderDetail(id){
  var cont = document.getElementById('hymViewDetail');
  if(!cont || !id) return;
  var isFav = S.hymnFav.has(id);
  var hasSheet = _hymnHasSheet(id);
  var hasMp3 = _hymnHasMp3(id);
  var h = '';
  // header
  h += '<div class="hym-detail-header">';
  h += '<span class="hym-detail-title">'+_hymnLabel(id)+'</span>';
  h += '<button class="hym-detail-fav'+(isFav?' hym-fav-on':'')+'" onclick="_hymToggleFav('+id+')">';
  h += '<i class="fa'+(isFav?'s':'r')+' fa-heart"></i></button>';
  h += '</div>';
  // sheet
  if(hasSheet){
    h += '<div class="hym-zoom-bar">';
    h += '<button class="hym-zoom-btn" onclick="_hymZoomOut()"><i class="fa fa-search-minus"></i></button>';
    h += '<button class="hym-zoom-btn" onclick="_hymZoomReset()">100%</button>';
    h += '<button class="hym-zoom-btn" onclick="_hymZoomIn()"><i class="fa fa-search-plus"></i></button>';
    h += '</div>';
    h += '<div class="hym-sheet-wrap">';
    h += '<img class="hym-sheet-img" id="hymSheetImg" src="'+_hymnSheetUrl(id)+'" alt="'+_hymnLabel(id)+' \uC545\uBCF4" style="transform:scale('+_hym.zoom+')" onerror="this.parentNode.innerHTML=\'<div class=hym-no-sheet><i class=&quot;fa fa-image&quot;></i>\uC545\uBCF4\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4</div>\'">';
    h += '</div>';
  } else {
    h += '<div class="hym-sheet-wrap"><div class="hym-no-sheet"><i class="fa fa-image"></i>\uC545\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div></div>';
  }
  // player
  if(hasMp3){
    var isThisPlaying = _hym.currentId === id && _hym.playing;
    h += '<div class="hym-detail-player" id="hymDetailPlayer">';
    h += '<div class="hym-dp-controls">';
    h += '<button class="hym-dp-btn'+ (_hym.shuffle?' hym-dp-active':'') +'" onclick="_hymToggleShuffle()" title="\uC154\uD50C"><i class="fa fa-random"></i></button>';
    h += '<button class="hym-dp-btn" onclick="_hymPrev()" title="\uC774\uC804"><i class="fa fa-step-backward"></i></button>';
    h += '<button class="hym-dp-btn hym-dp-play" id="hymDpPlayBtn" onclick="_hymPlayThis('+id+')" title="\uC7AC\uC0DD"><i class="fa fa-'+(isThisPlaying?'pause':'play')+'"></i></button>';
    h += '<button class="hym-dp-btn" onclick="_hymNext()" title="\uB2E4\uC74C"><i class="fa fa-step-forward"></i></button>';
    h += '<button class="hym-dp-btn'+ (_hym.repeat!=='none'?' hym-dp-active':'') +'" onclick="_hymToggleRepeat()" title="\uBC18\uBCF5"><i class="fa fa-redo"></i>'+ (_hym.repeat==='one'?'<small style="font-size:8px;position:absolute;margin-top:8px">1</small>':'') +'</button>';
    h += '</div>';
    h += '<div class="hym-dp-seek">';
    h += '<span class="hym-dp-time" id="hymDpTimeCur">'+_hymFormatTime(_hym.currentId===id?_hym.currentTime:0)+'</span>';
    h += '<div class="hym-dp-track" id="hymDpTrack" onmousedown="_hymSeekStart(event,\'detail\')" ontouchstart="_hymSeekStart(event,\'detail\')">';
    var pct = (_hym.currentId===id && _hym.duration>0) ? (_hym.currentTime/_hym.duration*100) : 0;
    h += '<div class="hym-dp-fill" id="hymDpFill" style="width:'+pct+'%"></div>';
    h += '</div>';
    h += '<span class="hym-dp-time" id="hymDpTimeDur">'+_hymFormatTime(_hym.currentId===id?_hym.duration:0)+'</span>';
    h += '</div></div>';
  } else {
    h += '<div class="hym-no-audio"><i class="fa fa-volume-mute"></i> \uC74C\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  }
  cont.innerHTML = h;
}

function _hymPlayThis(id){
  if(_hym.currentId === id) _hymTogglePlay();
  else _hymSetQueue([id], 0);
}

function _hymOpenCurrentDetail(){
  if(_hym.currentId) _hymOpenDetail(_hym.currentId);
}

function _hymZoomIn(){ _hym.zoom = Math.min(_hym.zoom + 0.25, 3); _hymApplyZoom(); }
function _hymZoomOut(){ _hym.zoom = Math.max(_hym.zoom - 0.25, 0.5); _hymApplyZoom(); }
function _hymZoomReset(){ _hym.zoom = 1; _hymApplyZoom(); }
function _hymApplyZoom(){
  var img = document.getElementById('hymSheetImg');
  if(img) img.style.transform = 'scale('+_hym.zoom+')';
}

/* ── Section 7: Audio Player Engine ── */
function _hymLoadAndPlay(id){
  if(!_hymnHasMp3(id)) return;
  _hymInit();
  var a = _hym.audio;
  if(!a) return;
  _hym.currentId = id;
  _hym.currentTime = 0;
  _hym.duration = 0;
  a.src = _hymnMp3Url(id);
  a.load();
  a.play().catch(function(){});
  S.hymnLastPlayed = id;
  persist();
  _hymShowSpPlayer();
  _hymShowPlayerBar();
  _hymUpdateAllPlayers();
  if(_hym.spView === 'list') _hymRenderList();
  if(_hym.detailOpen && _hym.selectedId === id) _hymRenderDetail(id);
}

function _hymTogglePlay(){
  var a = _hym.audio;
  if(!a || !a.src) return;
  if(a.paused) a.play().catch(function(){});
  else a.pause();
}

function _hymPrev(){
  if(_hym.queue.length === 0) return;
  if(_hym.currentTime > 3){ _hym.audio.currentTime = 0; return; }
  var idx = _hym.queueIdx - 1;
  if(idx < 0) idx = _hym.queue.length - 1;
  _hym.queueIdx = idx;
  _hymLoadAndPlay(_hym.queue[idx]);
}

function _hymNext(){
  var next = _hymGetNextInQueue();
  if(next !== null) _hymLoadAndPlay(next);
  else { _hym.playing = false; _hymUpdatePlayIcons(); }
}

function _hymSeekTo(fraction){
  var a = _hym.audio;
  if(!a || !a.duration) return;
  a.currentTime = fraction * a.duration;
}

function _hymOnTimeUpdate(){
  var a = _hym.audio;
  if(!a) return;
  _hym.currentTime = a.currentTime;
  _hym.duration = a.duration || 0;
  if(!_hym.seeking) _hymUpdateAllPlayers();
}

function _hymOnEnded(){
  if(_hym.repeat === 'one'){
    _hym.audio.currentTime = 0;
    _hym.audio.play().catch(function(){});
    return;
  }
  var next = _hymGetNextInQueue();
  if(next !== null) _hymLoadAndPlay(next);
  else { _hym.playing = false; _hymUpdatePlayIcons(); }
}

function _hymFormatTime(s){
  if(!s || isNaN(s)) return '0:00';
  var m = Math.floor(s/60);
  var sec = Math.floor(s%60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

// Seek bar interaction
function _hymSeekStart(e, where){
  e.preventDefault(); e.stopPropagation();
  _hym.seeking = true;
  var trackId = where === 'detail' ? 'hymDpTrack' : where === 'sp' ? 'hymSppTrack' : 'hymPbTrack';
  var track = document.getElementById(trackId);
  if(!track) return;
  function doSeek(ev){
    var rect = track.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    _hymSeekTo(frac);
    _hymUpdateSeekVisual(frac, where);
  }
  doSeek(e);
  function onMove(ev){ doSeek(ev); }
  function onUp(){ _hym.seeking = false; document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); document.removeEventListener('touchmove',onMove); document.removeEventListener('touchend',onUp); }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove, {passive:false});
  document.addEventListener('touchend', onUp);
}

function _hymUpdateSeekVisual(frac, where){
  var pct = (frac*100).toFixed(1)+'%';
  if(where === 'detail'){
    var f = document.getElementById('hymDpFill'); if(f) f.style.width = pct;
  } else if(where === 'sp'){
    var f2 = document.getElementById('hymSppFill'); if(f2) f2.style.width = pct;
  } else {
    var f3 = document.getElementById('hymPbFill'); if(f3) f3.style.width = pct;
  }
}

function _hymUpdatePlayIcons(){
  // overlay player bar
  var pbBtn = document.getElementById('hymPbPlayBtn');
  if(pbBtn) pbBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // detail player
  var dpBtn = document.getElementById('hymDpPlayBtn');
  if(dpBtn) dpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // side panel player
  var sppBtn = document.getElementById('hymSppPlayBtn');
  if(sppBtn) sppBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // list items
  document.querySelectorAll('.hym-list-item').forEach(function(el){
    el.classList.toggle('hym-playing', parseInt(el.dataset.id) === _hym.currentId && _hym.playing);
  });
  document.querySelectorAll('.hym-pld-item').forEach(function(el){
    el.classList.toggle('hym-playing', parseInt(el.dataset.id) === _hym.currentId && _hym.playing);
  });
}

/* ── Section 8: Player bars (side panel + overlay) ── */
function _hymShowSpPlayer(){
  var el = document.getElementById('hymSpPlayer');
  if(el) el.style.display = '';
}
function _hymShowPlayerBar(){
  var el = document.getElementById('hymPlayerBar');
  if(el) el.style.display = '';
}

function _hymUpdateAllPlayers(){
  var pct = (_hym.duration > 0) ? (_hym.currentTime/_hym.duration*100).toFixed(1)+'%' : '0%';
  var time = _hymFormatTime(_hym.currentTime);
  var label = _hym.currentId ? _hymnLabel(_hym.currentId) : '';
  // overlay player bar
  var pbTitle = document.getElementById('hymPbTitle');
  if(pbTitle) pbTitle.textContent = label;
  var pbFill = document.getElementById('hymPbFill');
  if(pbFill) pbFill.style.width = pct;
  var pbTime = document.getElementById('hymPbTime');
  if(pbTime) pbTime.textContent = time;
  var pbBtn = document.getElementById('hymPbPlayBtn');
  if(pbBtn) pbBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // side panel mini player
  var sppTitle = document.getElementById('hymSppTitle');
  if(sppTitle) sppTitle.textContent = label;
  var sppFill = document.getElementById('hymSppFill');
  if(sppFill) sppFill.style.width = pct;
  var sppBtn = document.getElementById('hymSppPlayBtn');
  if(sppBtn) sppBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  // detail player (only if detail is showing this hymn)
  if(_hym.detailOpen && _hym.currentId === _hym.selectedId){
    var dpFill = document.getElementById('hymDpFill');
    if(dpFill) dpFill.style.width = pct;
    var dpCur = document.getElementById('hymDpTimeCur');
    if(dpCur) dpCur.textContent = time;
    var dpDur = document.getElementById('hymDpTimeDur');
    if(dpDur) dpDur.textContent = _hymFormatTime(_hym.duration);
    var dpBtn = document.getElementById('hymDpPlayBtn');
    if(dpBtn) dpBtn.innerHTML = '<i class="fa fa-'+(_hym.playing?'pause':'play')+'"></i>';
  }
}

/* ── Section 9: Playlist Management ── */
function _hymGetPlaylist(plId){
  return S.hymnPlaylists.find(function(p){ return p.id === plId; });
}

function _hymRenderPlaylists(){
  var cont = document.getElementById('hymViewPlaylists');
  if(!cont) return;
  var h = '<div class="hym-pl-header">';
  h += '<button class="hym-back-btn" onclick="_hymSetFilter(\'all\')" title="\uB4A4\uB85C"><i class="fa fa-arrow-left"></i></button>';
  h += '<span class="hym-pl-title"><i class="fa fa-list"></i> \uC7AC\uC0DD\uBAA9\uB85D</span>';
  h += '<button class="hym-pl-new-btn" onclick="_hymCreatePlaylist()"><i class="fa fa-plus"></i> \uC0C8\uB85C \uB9CC\uB4E4\uAE30</button>';
  h += '</div>';
  if(S.hymnPlaylists.length === 0){
    h += '<div class="hym-empty"><i class="fa fa-list"></i>\uC7AC\uC0DD\uBAA9\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  } else {
    for(var i=0; i<S.hymnPlaylists.length; i++){
      var pl = S.hymnPlaylists[i];
      h += '<div class="hym-pl-item" onclick="_hymOpenPlaylist(\''+pl.id+'\')">';
      h += '<i class="fa fa-list-ol hym-pl-icon"></i>';
      h += '<span class="hym-pl-name">'+_escHtml(pl.name)+'</span>';
      h += '<span class="hym-pl-count">'+pl.ids.length+'\uACE1</span>';
      h += '<button class="hym-pl-del-btn" onclick="_hymDeletePlaylist(\''+pl.id+'\',event)" title="\uC0AD\uC81C"><i class="fa fa-trash"></i></button>';
      h += '</div>';
    }
  }
  cont.innerHTML = h;
}

function _hymCreatePlaylist(){
  var name = prompt('\uC7AC\uC0DD\uBAA9\uB85D \uC774\uB984:');
  if(!name || !name.trim()) return;
  S.hymnPlaylists.push({id:'pl_'+Date.now(), name:name.trim(), ids:[]});
  persist();
  _hymRenderPlaylists();
}

function _hymDeletePlaylist(plId, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  if(!confirm('\uC774 \uC7AC\uC0DD\uBAA9\uB85D\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) return;
  S.hymnPlaylists = S.hymnPlaylists.filter(function(p){ return p.id !== plId; });
  persist();
  _hymRenderPlaylists();
}

function _hymOpenPlaylist(plId){
  _hym.currentPlaylistId = plId;
  _hymShowSpView('playlist-detail');
}

function _hymRenderPlaylistDetail(plId){
  var cont = document.getElementById('hymViewPlaylistDetail');
  var pl = _hymGetPlaylist(plId);
  if(!cont || !pl) return;
  var h = '<div class="hym-pld-header">';
  h += '<button class="hym-back-btn" onclick="_hymShowSpView(\'playlists\')" style="margin-right:4px"><i class="fa fa-arrow-left"></i></button>';
  h += '<span class="hym-pld-title">'+_escHtml(pl.name)+' <small style="color:var(--text3)">'+pl.ids.length+'\uACE1</small></span>';
  if(pl.ids.length > 0){
    h += '<button class="hym-pld-play-all" onclick="_hymPlayPlaylist(\''+plId+'\')"><i class="fa fa-play"></i> \uC804\uCCB4</button>';
  }
  h += '</div>';
  if(pl.ids.length === 0){
    h += '<div class="hym-empty"><i class="fa fa-music"></i>\uACE1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';
  } else {
    for(var i=0; i<pl.ids.length; i++){
      var id = pl.ids[i];
      var isPlaying = _hym.currentId === id && _hym.playing;
      h += '<div class="hym-pld-item'+(isPlaying?' hym-playing':'')+'" data-id="'+id+'" onclick="_hymOpenDetail('+id+')">';
      h += '<span class="hym-pld-num">'+(i+1)+'</span>';
      h += '<span class="hym-pld-name">'+_hymnLabel(id)+'</span>';
      if(_hymnHasMp3(id)) h += '<button class="hym-play-btn" onclick="_hymPlayPlaylistFrom(\''+plId+'\','+i+',event)" title="\uC7AC\uC0DD"><i class="fa fa-play"></i></button>';
      h += '<button class="hym-pld-remove" onclick="_hymRemoveFromPlaylist(\''+plId+'\','+i+',event)" title="\uC81C\uAC70"><i class="fa fa-times"></i></button>';
      h += '</div>';
    }
  }
  cont.innerHTML = h;
}

function _hymAddToPlaylist(hymnId, plId){
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  if(pl.ids.indexOf(hymnId) === -1){ pl.ids.push(hymnId); persist(); }
  _hymCloseAddMenu();
  if(typeof showToast === 'function') showToast(_hymnLabel(hymnId)+' \u2192 '+pl.name);
}

function _hymRemoveFromPlaylist(plId, idx, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  pl.ids.splice(idx, 1);
  persist();
  _hymRenderPlaylistDetail(plId);
}

function _hymPlayPlaylist(plId){
  var pl = _hymGetPlaylist(plId);
  if(!pl || pl.ids.length === 0) return;
  var playable = pl.ids.filter(function(id){ return _hymnHasMp3(id); });
  if(playable.length === 0) return;
  _hym.queueName = pl.name;
  _hymSetQueue(playable, 0);
}

function _hymPlayPlaylistFrom(plId, idx, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  var pl = _hymGetPlaylist(plId);
  if(!pl) return;
  var playable = pl.ids.filter(function(id){ return _hymnHasMp3(id); });
  if(playable.length === 0) return;
  var targetId = pl.ids[idx];
  var qIdx = playable.indexOf(targetId);
  if(qIdx === -1) qIdx = 0;
  _hym.queueName = pl.name;
  _hymSetQueue(playable, qIdx);
}

function _hymShowAddMenu(hymnId, e){
  if(e){ e.stopPropagation(); e.preventDefault(); }
  _hymCloseAddMenu();
  _hym.addMenuId = hymnId;
  var menu = document.createElement('div');
  menu.className = 'hym-add-menu';
  menu.id = 'hymAddMenu';
  var h = '<div class="hym-add-menu-title">\uC7AC\uC0DD\uBAA9\uB85D\uC5D0 \uCD94\uAC00</div>';
  if(S.hymnPlaylists.length === 0){
    h += '<div class="hym-add-menu-item" onclick="_hymCreateAndAdd('+hymnId+')"><i class="fa fa-plus"></i> \uC0C8 \uC7AC\uC0DD\uBAA9\uB85D...</div>';
  } else {
    for(var i=0; i<S.hymnPlaylists.length; i++){
      var pl = S.hymnPlaylists[i];
      h += '<div class="hym-add-menu-item" onclick="_hymAddToPlaylist('+hymnId+',\''+pl.id+'\')"><i class="fa fa-list-ol"></i> '+_escHtml(pl.name)+'</div>';
    }
    h += '<div class="hym-add-menu-item" onclick="_hymCreateAndAdd('+hymnId+')"><i class="fa fa-plus"></i> \uC0C8 \uC7AC\uC0DD\uBAA9\uB85D...</div>';
  }
  menu.innerHTML = h;
  document.body.appendChild(menu);
  var rect = e.target.getBoundingClientRect();
  menu.style.top = Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - 10) + 'px';
  menu.style.left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 10) + 'px';
  setTimeout(function(){ document.addEventListener('click', _hymCloseAddMenu, {once:true}); }, 10);
}

function _hymCloseAddMenu(){
  var menu = document.getElementById('hymAddMenu');
  if(menu) menu.remove();
  _hym.addMenuId = null;
}

function _hymCreateAndAdd(hymnId){
  _hymCloseAddMenu();
  var name = prompt('\uC7AC\uC0DD\uBAA9\uB85D \uC774\uB984:');
  if(!name || !name.trim()) return;
  var pl = {id:'pl_'+Date.now(), name:name.trim(), ids:[hymnId]};
  S.hymnPlaylists.push(pl);
  persist();
  if(typeof showToast === 'function') showToast(_hymnLabel(hymnId)+' \u2192 '+pl.name);
}

/* ── Section 10: Queue Management ── */
function _hymSetQueue(ids, startIdx){
  _hym.queue = ids.slice();
  _hym.queueIdx = startIdx || 0;
  if(_hym.shuffle) _hymShuffleQueue();
  _hymLoadAndPlay(_hym.queue[_hym.queueIdx]);
}

function _hymToggleShuffle(){
  _hym.shuffle = !_hym.shuffle;
  if(_hym.shuffle && _hym.queue.length > 1) _hymShuffleQueue();
  if(_hym.detailOpen) _hymRenderDetail(_hym.selectedId);
}

function _hymShuffleQueue(){
  var current = _hym.queue[_hym.queueIdx];
  for(var i = _hym.queue.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = _hym.queue[i]; _hym.queue[i] = _hym.queue[j]; _hym.queue[j] = tmp;
  }
  var ci = _hym.queue.indexOf(current);
  if(ci > 0){ _hym.queue[ci] = _hym.queue[0]; _hym.queue[0] = current; }
  _hym.queueIdx = 0;
}

function _hymToggleRepeat(){
  if(_hym.repeat === 'none') _hym.repeat = 'all';
  else if(_hym.repeat === 'all') _hym.repeat = 'one';
  else _hym.repeat = 'none';
  if(_hym.detailOpen) _hymRenderDetail(_hym.selectedId);
}

function _hymGetNextInQueue(){
  if(_hym.queue.length === 0) return null;
  var next = _hym.queueIdx + 1;
  if(next >= _hym.queue.length){
    if(_hym.repeat === 'all') next = 0;
    else return null;
  }
  _hym.queueIdx = next;
  return _hym.queue[next];
}

/* ── Section 11: Keyboard Shortcuts ── */
function _hymKeyHandler(e){
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  // only when detail overlay is open
  if(!_hym.detailOpen) return;
  if(e.key === 'Escape'){ e.preventDefault(); _hymCloseDetail(); return; }
  if(e.key === ' '){ e.preventDefault(); _hymTogglePlay(); return; }
  if(e.key === 'ArrowLeft'){ e.preventDefault(); if(_hym.audio && _hym.audio.src) _hym.audio.currentTime = Math.max(0, _hym.audio.currentTime - 5); return; }
  if(e.key === 'ArrowRight'){ e.preventDefault(); if(_hym.audio && _hym.audio.src) _hym.audio.currentTime = Math.min(_hym.audio.duration||0, _hym.audio.currentTime + 5); return; }
}
document.addEventListener('keydown', _hymKeyHandler);

/* ── Utility ── */
function _escHtml(s){
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ── Expose to global ── */
window._hymInitSidePanel = _hymInitSidePanel;
window._hymShowSpView = _hymShowSpView;
window._hymOpenDetail = _hymOpenDetail;
window._hymCloseDetail = _hymCloseDetail;
window._hymOnSearch = _hymOnSearch;
window._hymSetFilter = _hymSetFilter;
window._hymToggleFav = _hymToggleFav;
window._hymQuickPlay = _hymQuickPlay;
window._hymPlayThis = _hymPlayThis;
window._hymOpenCurrentDetail = _hymOpenCurrentDetail;
window._hymZoomIn = _hymZoomIn;
window._hymZoomOut = _hymZoomOut;
window._hymZoomReset = _hymZoomReset;
window._hymTogglePlay = _hymTogglePlay;
window._hymPrev = _hymPrev;
window._hymNext = _hymNext;
window._hymSeekStart = _hymSeekStart;
window._hymToggleShuffle = _hymToggleShuffle;
window._hymToggleRepeat = _hymToggleRepeat;
window._hymCreatePlaylist = _hymCreatePlaylist;
window._hymDeletePlaylist = _hymDeletePlaylist;
window._hymOpenPlaylist = _hymOpenPlaylist;
window._hymAddToPlaylist = _hymAddToPlaylist;
window._hymRemoveFromPlaylist = _hymRemoveFromPlaylist;
window._hymPlayPlaylist = _hymPlayPlaylist;
window._hymPlayPlaylistFrom = _hymPlayPlaylistFrom;
window._hymShowAddMenu = _hymShowAddMenu;
window._hymCloseAddMenu = _hymCloseAddMenu;
window._hymCreateAndAdd = _hymCreateAndAdd;
