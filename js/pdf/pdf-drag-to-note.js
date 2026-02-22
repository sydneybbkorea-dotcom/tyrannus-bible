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

    // Initialize note editor as drop target for PDF highlights
    _initDropTarget();
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

  // ── Drop Target: note editor receives dragged highlights ──

  function _initDropTarget(){
    var nc = document.getElementById('noteContent');
    if(!nc) return;

    nc.addEventListener('dragover', function(e){
      if(!e.dataTransfer.types.includes('application/x-pdf-highlight')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      nc.classList.add('pdf-drop-active');
    });

    nc.addEventListener('dragleave', function(e){
      // Only remove when truly leaving (not entering child)
      if(!nc.contains(e.relatedTarget)){
        nc.classList.remove('pdf-drop-active');
      }
    });

    nc.addEventListener('drop', function(e){
      nc.classList.remove('pdf-drop-active');
      var json = e.dataTransfer.getData('application/x-pdf-highlight');
      if(!json) return;
      e.preventDefault();
      try {
        var data = JSON.parse(json);
        _insertDroppedHighlight(data, e);
      } catch(err){
        console.warn('[PDFDragToNote] drop parse error:', err);
      }
    });
  }

  // ── Drag start handler (called from pdf-annotations.js) ──

  function onAnnotDragStart(e, annot){
    // Allow drag in select and highlight modes (block draw/text/eraser)
    if(typeof PDFTools !== 'undefined'){
      var tool = PDFTools.getTool();
      if(tool !== 'select' && tool !== 'highlight'){
        e.preventDefault();
        return;
      }
    }

    var pdfId = annot.pdfId || (typeof PDFViewer !== 'undefined' ? PDFViewer.getCurrentPdfId() : '');
    var data = {
      annotId: annot.id,
      pdfId: pdfId,
      pageNum: annot.pageNum,
      text: annot.text || '',
      color: annot.color || ''
    };

    e.dataTransfer.setData('application/x-pdf-highlight', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';

    // Custom drag image: PDF icon + text preview
    var ghost = document.createElement('div');
    ghost.style.cssText = 'position:absolute;top:-9999px;left:-9999px;padding:6px 10px;'
      + 'background:#1a1c24;border:1px solid #bd8a00;border-radius:6px;'
      + 'font-size:11px;color:#e8e8e8;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
      + 'display:flex;align-items:center;gap:6px;';
    ghost.innerHTML = '<i class="fa fa-file-pdf" style="color:#f05050"></i>'
      + _escapeHTML((data.text || 'PDF highlight').slice(0, 40));
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 16, 16);
    setTimeout(function(){ document.body.removeChild(ghost); }, 0);
  }

  // ── Insert dropped highlight as citation block ──

  function _insertDroppedHighlight(data, dropEvent){
    var nc = document.getElementById('noteContent');
    if(!nc) return;

    // If note editor view is not visible, create a new note
    var noteView = document.getElementById('noteEditorView') || document.getElementById('noteView');
    var isHidden = !noteView || noteView.style.display === 'none' || noteView.classList.contains('hidden');
    if(isHidden || !S.curNoteId){
      if(typeof openPanel === 'function') openPanel('notes');
      if(typeof switchSub === 'function') switchSub('notes');
      if(typeof newNote === 'function') newNote();
    }

    // Place cursor at drop position
    if(document.caretRangeFromPoint){
      var range = document.caretRangeFromPoint(dropEvent.clientX, dropEvent.clientY);
      if(range){
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if(document.caretPositionFromPoint){
      var pos = document.caretPositionFromPoint(dropEvent.clientX, dropEvent.clientY);
      if(pos){
        var range2 = document.createRange();
        range2.setStart(pos.offsetNode, pos.offset);
        range2.collapse(true);
        var sel2 = window.getSelection();
        sel2.removeAllRanges();
        sel2.addRange(range2);
      }
    }

    // Build citation HTML (reuse existing helper)
    var citationHTML = _buildCitationHTML(data.pdfId, data.annotId, data.text, data.pageNum);
    nc.focus();
    document.execCommand('insertHTML', false, citationHTML);

    // Register bidirectional link
    if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady() && S.curNoteId){
      var annotUri = TyrannusURI.pdfAnnot(data.pdfId, data.annotId);
      var noteUri = TyrannusURI.note(S.curNoteId);
      LinkRegistry.addLink(noteUri, annotUri, 'annotation', {
        label: (data.text || '').slice(0, 50),
        page: data.pageNum
      });
    }

    // Update annotation with linkedNoteId/linkedUri → badge display + re-render
    if(typeof PDFAnnotations !== 'undefined' && S.curNoteId){
      var pdfId = data.pdfId;
      var pageNum = data.pageNum;
      var annots = PDFAnnotations.getPage(pdfId, pageNum);
      var target = null;
      for(var i = 0; i < annots.length; i++){
        if(annots[i].id === data.annotId){ target = annots[i]; break; }
      }
      if(target){
        target.linkedNoteId = S.curNoteId;
        target.linkedUri = TyrannusURI.note(S.curNoteId);
        PDFAnnotations.save(target);
        // Re-render annotation layer on that page
        var layers = document.querySelectorAll('.pdf-annot-layer');
        layers.forEach(function(layer){
          var wrap = layer.closest('.pdf-page-wrap');
          if(wrap && parseInt(wrap.dataset.page) === pageNum){
            var scale = typeof PDFViewer !== 'undefined' ? PDFViewer.getScale() || 1 : 1;
            PDFAnnotations.renderPage(pageNum, layer, { scale: scale });
          }
        });
      }
    }

    if(typeof toast === 'function') toast('PDF 인용이 노트에 추가됨 ✓');
  }

  return {
    init: init,
    addToNote: addToNote,
    createNote: createNote,
    linkVerse: linkVerse,
    onAnnotDragStart: onAnnotDragStart
  };
})();
