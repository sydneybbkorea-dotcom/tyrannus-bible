// input-manager.js — PointerEvent-based input detection + mode switching
// Detects mouse/touch/pen and adapts UI accordingly

var InputManager = (function(){
  var currentMode = 'mouse';
  var _penActive = false;

  function init(){
    // PointerEvent API — unified input handling
    document.addEventListener('pointerdown', _onPointerDown, true);
    document.addEventListener('pointerup', _onPointerUp, true);
    document.addEventListener('pointermove', _onPointerMove, { passive: true, capture: true });

    // Set initial mode
    var hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if(hasTouch && !window.matchMedia('(hover: hover)').matches){
      _setMode('touch');
    } else {
      _setMode('mouse');
    }
  }

  function _onPointerDown(e){
    var mode = e.pointerType; // 'mouse', 'touch', 'pen'
    if(mode === 'pen') _penActive = true;

    // Palm rejection: ignore touch while pen is active
    if(mode === 'touch' && _penActive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    _setMode(mode);
  }

  function _onPointerUp(e){
    if(e.pointerType === 'pen') {
      // Delay pen deactivation to handle palm rejection properly
      setTimeout(function(){ _penActive = false; }, 300);
    }
  }

  function _onPointerMove(e){
    // Update pressure data for pen (available to PDF tools)
    if(e.pointerType === 'pen'){
      InputManager._lastPressure = e.pressure || 0.5;
      InputManager._lastTiltX = e.tiltX || 0;
      InputManager._lastTiltY = e.tiltY || 0;
    }
  }

  function _setMode(mode){
    if(mode === currentMode) return;
    currentMode = mode;
    document.body.dataset.input = mode;
    if(typeof EventBus !== 'undefined'){
      EventBus.emit('input:mode', { mode: mode });
    }
  }

  function getMode(){ return currentMode; }
  function isPen(){ return currentMode === 'pen'; }
  function isTouch(){ return currentMode === 'touch'; }
  function isMouse(){ return currentMode === 'mouse'; }

  // Pen pressure data (updated on pointermove)
  var _lastPressure = 0.5;
  var _lastTiltX = 0;
  var _lastTiltY = 0;

  // Map pen pressure (0-1) to line width (minPx - maxPx)
  function pressureToWidth(minPx, maxPx){
    return minPx + (_lastPressure * (maxPx - minPx));
  }

  return {
    init: init,
    getMode: getMode,
    isPen: isPen,
    isTouch: isTouch,
    isMouse: isMouse,
    pressureToWidth: pressureToWidth,
    _lastPressure: _lastPressure,
    _lastTiltX: _lastTiltX,
    _lastTiltY: _lastTiltY
  };
})();
