// ch-picker.js — 책/장 독립 드롭다운 제어
var _bookDropOpen = false;
var _chDropOpen = false;

function openBookDrop(){
  if(_bookDropOpen){ closeAllDrops(); return; }
  closeAllDrops();
  _bookDropOpen = true;
  renderBookDrop();
  var el = document.getElementById('bookDropdown');
  var btn = document.getElementById('vbBookSel');
  if(el && btn){
    el.style.left = btn.offsetLeft + 'px';
    el.style.display = '';
  }
  setTimeout(function(){ document.addEventListener('click', _dropOutClick); },10);
}

function openChDrop(){
  if(_chDropOpen){ closeAllDrops(); return; }
  closeAllDrops();
  _chDropOpen = true;
  renderChDrop();
  var el = document.getElementById('chDropdown');
  var btn = document.getElementById('vbChSel');
  if(el && btn){
    el.style.left = btn.offsetLeft + 'px';
    el.style.display = '';
  }
  setTimeout(function(){ document.addEventListener('click', _dropOutClick); },10);
}

function closeAllDrops(){
  _bookDropOpen = false; _chDropOpen = false;
  var b = document.getElementById('bookDropdown');
  var c = document.getElementById('chDropdown');
  if(b) b.style.display = 'none';
  if(c) c.style.display = 'none';
  document.removeEventListener('click', _dropOutClick);
}
