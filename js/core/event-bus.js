// event-bus.js — Global event bus for decoupled communication
// Events: verse:selected, note:saved, note:deleted, link:added, link:removed,
//         highlight:applied, pdf:opened, pdf:annotated, nav:chapter,
//         panel:opened, panel:closed, sync:status, theme:changed, locale:changed, input:mode

var EventBus = (function(){
  var _listeners = {};

  function on(event, cb){
    if(!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
    return function off(){ _off(event, cb); };
  }

  function once(event, cb){
    function wrapper(data){
      _off(event, wrapper);
      cb(data);
    }
    on(event, wrapper);
  }

  function emit(event, data){
    var cbs = _listeners[event];
    if(!cbs) return;
    for(var i = 0; i < cbs.length; i++){
      try { cbs[i](data); } catch(e){ console.error('[EventBus]', event, e); }
    }
  }

  function _off(event, cb){
    var cbs = _listeners[event];
    if(!cbs) return;
    var idx = cbs.indexOf(cb);
    if(idx >= 0) cbs.splice(idx, 1);
  }

  function off(event, cb){
    if(cb) _off(event, cb);
    else delete _listeners[event];
  }

  return { on: on, once: once, emit: emit, off: off };
})();
