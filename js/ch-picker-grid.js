// ch-picker-grid.js — 장 드롭다운 렌더링 + 선택 액션
function renderChDrop(){
  var el = document.getElementById('chDropdown');
  if(!el) return;
  var cnt = CHCNT[S.book]||1;
  var h = '';
  for(var i=1;i<=cnt;i++){
    var cls = 'cp-item';
    if(i===S.ch) cls += ' cp-item-act';
    h += '<div class="'+cls+'" onclick="_pickCh('+i+')">'+i+' '+t('ch.suffix')+'</div>';
  }
  el.innerHTML = h;
  var act = el.querySelector('.cp-item-act');
  if(act) act.scrollIntoView({block:'center',behavior:'auto'});
}

function _pickBook(b){
  S.book = b; S.ch = 1;
  S.selV = null; S.selVSet.clear();
  closeAllDrops(); renderAll();
}

function _pickCh(ch){
  S.ch = ch;
  S.selV = null; S.selVSet.clear();
  closeAllDrops(); renderAll();
}

function _dropOutClick(e){
  var bd = document.getElementById('bookDropdown');
  var cd = document.getElementById('chDropdown');
  var b1 = document.getElementById('vbBookSel');
  var b2 = document.getElementById('vbChSel');
  if(bd&&bd.contains(e.target)) return;
  if(cd&&cd.contains(e.target)) return;
  if(b1&&b1.contains(e.target)) return;
  if(b2&&b2.contains(e.target)) return;
  closeAllDrops();
}
