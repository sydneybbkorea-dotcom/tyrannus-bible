// nav-router.js — URI → app navigation mapping
// NavigationRouter.navigateTo(uri) routes to the correct view

var NavigationRouter = (function(){

  function navigateTo(uri){
    var p = TyrannusURI.parse(uri);
    if(!p) return false;

    switch(p.type){
      case 'verse':
        return _navVerse(p.segments);
      case 'note':
        return _navNote(p.segments[0]);
      case 'pdf':
        return _navPdf(p.segments);
      case 'strong':
        return _navStrong(p.segments[0]);
      case 'commentary':
        return _navCommentary(p.segments);
      case 'dict':
        return _navDict(p.segments);
      case 'tag':
        return _navTag(p.segments[0]);
      default:
        console.warn('[NavRouter] Unknown URI type:', p.type);
        return false;
    }
  }

  function _navVerse(segs){
    var book = segs[0];
    var ch = parseInt(segs[1]);
    var v = segs[2] ? parseInt(segs[2]) : null;
    if(!book || !ch) return false;

    if(typeof openBibleTab === 'function'){
      openBibleTab(book, ch, v);
    } else {
      S.book = book;
      S.ch = ch;
      if(v){ S.selV = v; S.selVSet = new Set([v]); }
      if(typeof updateNavPickerLabel === 'function') updateNavPickerLabel();
      if(typeof renderAll === 'function') renderAll();
    }

    if(typeof EventBus !== 'undefined') EventBus.emit('nav:chapter', { book: book, ch: ch, v: v });
    return true;
  }

  function _navNote(noteId){
    if(!noteId) return false;
    if(typeof loadNote === 'function'){
      loadNote(noteId, true);
    }
    // Ensure notes panel is visible
    if(typeof openPanel === 'function'){
      openPanel('notes');
      if(typeof switchSub === 'function') switchSub('notes');
    }
    return true;
  }

  function _navPdf(segs){
    var pdfId = segs[0];
    if(!pdfId) return false;

    var page = null;
    if(segs[1] === 'page' && segs[2]) page = parseInt(segs[2]);

    // Open PDF viewer if available
    if(typeof PDFViewer !== 'undefined'){
      PDFViewer.open(pdfId, page);
    }
    return true;
  }

  function _navStrong(code){
    if(!code) return false;
    if(typeof showStrongDef === 'function'){
      showStrongDef(code);
    }
    // Switch to dictionary panel
    if(typeof openPanel === 'function'){
      openPanel('dictionary');
      if(typeof switchSub === 'function') switchSub('dict-strongs');
    }
    return true;
  }

  function _navCommentary(segs){
    var book = segs[0];
    var ch = parseInt(segs[1]);
    var v = segs[2] ? parseInt(segs[2]) : null;
    if(!book || !ch) return false;

    // Navigate to verse first
    _navVerse(segs);

    // Then open commentary panel
    if(typeof openPanel === 'function'){
      openPanel('notes');
      if(typeof switchSub === 'function') switchSub('commentary');
    }
    return true;
  }

  function _navDict(segs){
    var dictType = segs[0]; // 'webster', 'enko', 'korean'
    var word = segs[1];
    if(!dictType || !word) return false;

    if(typeof openPanel === 'function'){
      openPanel('dictionary');
      if(typeof switchSub === 'function') switchSub('dict-' + dictType);
    }

    // Search the word
    if(dictType === 'webster' && typeof searchWebster === 'function'){
      var inp = document.getElementById('websterSearchInput');
      if(inp){ inp.value = word; searchWebster(); }
    } else if(dictType === 'enko' && typeof searchEnko === 'function'){
      var inp2 = document.getElementById('enkoSearchInput');
      if(inp2){ inp2.value = word; searchEnko(); }
    }
    return true;
  }

  function _navTag(tagName){
    // Future: open tag search/filter
    console.log('[NavRouter] Navigate to tag:', tagName);
    return true;
  }

  // Navigate from legacy key format
  function navigateByKey(key){
    var uri = TyrannusURI.fromLegacyVerseKey(key);
    if(uri) return navigateTo(uri);

    // Fallback: direct key parsing
    var p = key.split('_');
    if(p.length >= 2){
      if(typeof openBibleTab === 'function'){
        openBibleTab(p[0], parseInt(p[1]), p[2] ? parseInt(p[2]) : null);
      }
      return true;
    }
    return false;
  }

  return {
    navigateTo: navigateTo,
    navigateByKey: navigateByKey
  };
})();
