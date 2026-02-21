// pdf-drag-to-note.js — PDF text selection → Note insertion (Flexcil-style)
// 1) Select text in PDF
// 2) Floating menu: [Add to Note] [New Note] [Link Verse]
// 3) Auto-create highlight annotation + note citation block + bidirectional link

var PDFDragToNote = (function(){

  var _selectionMenu = null;
  var _selectedText = '';
  var _selectedRect = null;
  var _selectedPageNum = 0;

  function init(){
    // Listen for text selection on PDF viewport
    document.addEventListener('mouseup', _onSelectionEnd);
    document.addEventListener('touchend', _onSelectionEnd);
  }

  function _onSelectionEnd(e){
    var sel = window.getSelection();
    if(!sel || sel.isCollapsed) { _hideMenu(); return; }

    var text = sel.toString().trim();
    if(!text) { _hideMenu(); return; }

    // Check if selection is within PDF viewport
    var range = sel.getRangeAt(0);
    var pdfContainer = document.getElementById('pdfViewerContainer');
    if(!pdfContainer || !pdfContainer.contains(range.commonAncestorContainer)){
      return;
    }

    _selectedText = text;
    _selectedPageNum = PDFViewer.getCurrentPage();

    // Get selection bounds
    var rect = range.getBoundingClientRect();
    _selectedRect = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };

    _showMenu(rect);
  }

  function _showMenu(rect){
    if(!_selectionMenu){
      _selectionMenu = document.createElement('div');
      _selectionMenu.className = 'pdf-sel-menu';
      document.body.appendChild(_selectionMenu);
    }

    _selectionMenu.innerHTML = '<button class="pdf-sel-btn" onclick="PDFDragToNote.addToNote()">'
      + '<i class="fa fa-pen"></i>' + t('pdf.addToNote', '노트에 추가') + '</button>'
      + '<button class="pdf-sel-btn" onclick="PDFDragToNote.createNote()">'
      + '<i class="fa fa-file-circle-plus"></i>' + t('pdf.newNoteFromPdf', '새 노트') + '</button>'
      + '<button class="pdf-sel-btn" onclick="PDFDragToNote.linkVerse()">'
      + '<i class="fa fa-book-bible"></i>' + t('pdf.linkVerse', '구절 연결') + '</button>';

    // Position menu above selection
    _selectionMenu.style.display = 'flex';
    _selectionMenu.style.left = (rect.left + rect.width / 2 - _selectionMenu.offsetWidth / 2) + 'px';
    _selectionMenu.style.top = (rect.top - _selectionMenu.offsetHeight - 8 + window.scrollY) + 'px';
    _selectionMenu.style.position = 'absolute';
  }

  function _hideMenu(){
    if(_selectionMenu) _selectionMenu.style.display = 'none';
  }

  // Add selected text to current note
  function addToNote(){
    _hideMenu();
    var pdfId = PDFViewer.getCurrentPdfId();
    if(!pdfId || !_selectedText) return;

    // 1) Create highlight annotation on PDF
    var annotId = _createHighlightAnnot(pdfId);

    // 2) Insert citation block in note editor
    var citationHTML = _buildCitationHTML(pdfId, annotId, _selectedText, _selectedPageNum);
    var nc = document.getElementById('noteContent');
    if(nc){
      nc.focus();
      document.execCommand('insertHTML', false, citationHTML);
    }

    // 3) Create bidirectional link
    if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady() && S.curNoteId){
      var annotUri = TyrannusURI.pdfAnnot(pdfId, annotId);
      var noteUri = TyrannusURI.note(S.curNoteId);
      LinkRegistry.addLink(noteUri, annotUri, 'annotation', {
        label: _selectedText.slice(0, 50),
        page: _selectedPageNum
      });
    }

    toast(t('toast.saved', '저장됨') + ' ✓');
    window.getSelection().removeAllRanges();
  }

  // Create a new note from PDF selection
  function createNote(){
    _hideMenu();
    var pdfId = PDFViewer.getCurrentPdfId();
    if(!pdfId || !_selectedText) return;

    // Create highlight annotation
    var annotId = _createHighlightAnnot(pdfId);

    // Open note panel and create new note
    if(typeof openPanel === 'function') openPanel('notes');
    if(typeof switchSub === 'function') switchSub('notes');
    if(typeof newNote === 'function') newNote();

    // Insert citation in new note
    setTimeout(function(){
      var nc = document.getElementById('noteContent');
      if(nc){
        var h1 = 'PDF ' + t('pdf.page', '페이지') + ' ' + _selectedPageNum;
        var citationHTML = '<h1>' + h1 + '</h1>' + _buildCitationHTML(pdfId, annotId, _selectedText, _selectedPageNum);
        nc.innerHTML = citationHTML;
      }
    }, 100);

    window.getSelection().removeAllRanges();
  }

  // Link PDF selection to a verse
  function linkVerse(){
    _hideMenu();
    var pdfId = PDFViewer.getCurrentPdfId();
    if(!pdfId || !_selectedText) return;

    // Create highlight annotation
    var annotId = _createHighlightAnnot(pdfId);

    // Open verse link picker
    if(typeof LinkPicker !== 'undefined'){
      LinkPicker.open({ defaultTab: 'verse' }).then(function(result){
        if(!result) return;
        // Create link between PDF annotation and verse
        if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady()){
          var annotUri = TyrannusURI.pdfAnnot(pdfId, annotId);
          LinkRegistry.addLink(annotUri, result.uri, 'cross-reference', {
            label: result.label,
            page: _selectedPageNum
          });
        }
        toast(result.label + ' ' + t('toast.noteLinked', '연결됨'));
      });
    } else {
      // Fallback: open legacy verse picker
      if(typeof openVersePick === 'function') openVersePick();
    }

    window.getSelection().removeAllRanges();
  }

  function _createHighlightAnnot(pdfId){
    var annotId = 'annot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    var scale = PDFViewer.getScale() || 1;

    // Approximate rect from selection
    if(_selectedRect){
      var container = document.getElementById('pdfViewerContainer');
      var containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };

      var annot = {
        id: annotId,
        pdfId: pdfId,
        pageNum: _selectedPageNum,
        type: 'highlight',
        rect: {
          x: (_selectedRect.x - containerRect.left) / scale,
          y: (_selectedRect.y - containerRect.top) / scale,
          width: _selectedRect.width / scale,
          height: _selectedRect.height / scale
        },
        text: _selectedText,
        color: 'rgba(250, 204, 21, 0.35)',
        createdAt: Date.now()
      };
      PDFAnnotations.save(annot);
    }
    return annotId;
  }

  function _buildCitationHTML(pdfId, annotId, text, pageNum){
    var uri = TyrannusURI.pdfAnnot(pdfId, annotId);
    return '<div class="pdf-cite" data-uri="' + uri + '" contenteditable="false" '
      + 'onclick="NavigationRouter.navigateTo(\'' + TyrannusURI.pdf(pdfId, pageNum) + '\')">'
      + '<i class="fa fa-file-pdf"></i>'
      + '<span class="pdf-cite-text">' + _escapeHTML(text) + '</span>'
      + '<span class="pdf-cite-ref">p.' + pageNum + '</span>'
      + '</div>&#8203;';
  }

  function _escapeHTML(str){
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    init: init,
    addToNote: addToNote,
    createNote: createNote,
    linkVerse: linkVerse
  };
})();
