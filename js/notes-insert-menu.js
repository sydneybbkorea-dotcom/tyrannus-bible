// notes-insert-menu.js -- + 버튼 삽입 메뉴 팝업
var _insMenuOpen=false;

function _noteToggleInsertMenu(btn){
  var pop=document.getElementById('noteInsertPopup');
  if(!pop) return;
  _insMenuOpen=!_insMenuOpen;
  pop.classList.toggle('show',_insMenuOpen);
  if(_insMenuOpen){
    var r=btn.getBoundingClientRect();
    pop.style.top=(r.bottom+4)+'px';
    pop.style.right=(window.innerWidth-r.right)+'px';
    setTimeout(function(){ document.addEventListener('click',_insMenuClose,{once:true}); },50);
  }
}
function _insMenuClose(){ _insMenuOpen=false; var p=document.getElementById('noteInsertPopup'); if(p) p.classList.remove('show'); }

function _insMenuAction(fn){
  _insMenuClose();
  if(typeof window[fn]==='function') window[fn]();
}
function _insMenuCallout(type){
  _insMenuClose();
  if(typeof insertCallout==='function') insertCallout(type);
}
