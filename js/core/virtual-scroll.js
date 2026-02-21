// virtual-scroll.js — Virtual scrolling for large lists
// Renders only visible items + buffer for smooth scrolling

var VirtualScroll = (function(){

  /**
   * Create a virtual scroll instance
   * @param {Object} options
   * @param {HTMLElement} options.container - Scrollable container element
   * @param {number} options.itemHeight - Fixed height per item (px)
   * @param {number} options.totalItems - Total number of items
   * @param {Function} options.renderItem - fn(index) → HTMLElement or HTML string
   * @param {number} [options.buffer=5] - Extra items rendered above/below viewport
   * @param {string} [options.itemClass='vs-item'] - CSS class for each item
   */
  function create(options){
    var container = options.container;
    var itemHeight = options.itemHeight;
    var totalItems = options.totalItems || 0;
    var renderItem = options.renderItem;
    var buffer = options.buffer || 5;
    var itemClass = options.itemClass || 'vs-item';

    // Sentinel element for total scroll height
    var sentinel = document.createElement('div');
    sentinel.className = 'vs-sentinel';
    sentinel.style.cssText = 'position:relative;width:100%;pointer-events:none;';
    sentinel.style.height = (totalItems * itemHeight) + 'px';

    // Content container positioned within sentinel
    var content = document.createElement('div');
    content.className = 'vs-content';
    content.style.cssText = 'position:absolute;left:0;right:0;will-change:transform;';

    sentinel.appendChild(content);
    container.innerHTML = '';
    container.appendChild(sentinel);
    container.style.overflowY = 'auto';

    var _startIdx = -1;
    var _endIdx = -1;

    function _render(){
      var scrollTop = container.scrollTop;
      var viewHeight = container.clientHeight;

      var start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      var end = Math.min(totalItems - 1, Math.ceil((scrollTop + viewHeight) / itemHeight) + buffer);

      // Skip if range unchanged
      if(start === _startIdx && end === _endIdx) return;
      _startIdx = start;
      _endIdx = end;

      // Position content
      content.style.transform = 'translateY(' + (start * itemHeight) + 'px)';

      // Render visible items
      var fragment = document.createDocumentFragment();
      for(var i = start; i <= end; i++){
        var result = renderItem(i);
        var el;
        if(typeof result === 'string'){
          el = document.createElement('div');
          el.innerHTML = result;
          el = el.firstChild || el;
        } else {
          el = result;
        }
        el.className = (el.className ? el.className + ' ' : '') + itemClass;
        el.style.height = itemHeight + 'px';
        el.dataset.vsIndex = i;
        fragment.appendChild(el);
      }

      content.innerHTML = '';
      content.appendChild(fragment);
    }

    // Throttled scroll handler
    var _raf = null;
    function _onScroll(){
      if(_raf) return;
      _raf = requestAnimationFrame(function(){
        _raf = null;
        _render();
      });
    }

    container.addEventListener('scroll', _onScroll, { passive: true });

    // Initial render
    _render();

    // Return controller
    return {
      refresh: function(){
        _startIdx = -1;
        _endIdx = -1;
        _render();
      },

      setTotalItems: function(n){
        totalItems = n;
        sentinel.style.height = (n * itemHeight) + 'px';
        this.refresh();
      },

      scrollToIndex: function(idx){
        container.scrollTop = idx * itemHeight;
      },

      destroy: function(){
        container.removeEventListener('scroll', _onScroll);
        if(_raf) cancelAnimationFrame(_raf);
        container.innerHTML = '';
      },

      getVisibleRange: function(){
        return { start: _startIdx, end: _endIdx };
      }
    };
  }

  return { create: create };
})();
