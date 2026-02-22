// note-panel.js — 노트 탭 관리 + 라이브러리↔에디터 뷰 전환 (PDFPanel 패턴)
var NotePanel = (function(){
  var _tabs = [];          // [{id, title}]
  var _activeTabId = null; // null = 라이브러리 표시

  // ── Library View ──
  function showLibrary(){
    if(_activeTabId && typeof autoSaveCurrent === 'function') autoSaveCurrent();
    _activeTabId = null;
    _updateViews();
    _renderTabBar();
    if(typeof renderFolderTree === 'function') renderFolderTree();
  }

  // ── Show Editor (add/activate tab) ──
  function showEditor(noteId){
    if(!noteId) return;

    // Already active tab — just ensure views
    if(_activeTabId === noteId){
      _updateViews();
      return;
    }

    // Find existing tab
    var existing = null;
    for(var i = 0; i < _tabs.length; i++){
      if(_tabs[i].id === noteId){ existing = _tabs[i]; break; }
    }

    if(existing){
      _activeTabId = noteId;
    } else {
      // New tab
      var note = S.notes.find(function(n){ return n.id === noteId; });
      var title = note ? (note.title || '제목 없음') : '새 노트';
      if(title.length > 18) title = title.substr(0, 18) + '…';
      _tabs.push({ id: noteId, title: title });
      _activeTabId = noteId;
    }

    _updateViews();
    _renderTabBar();
  }

  // ── Close Tab ──
  function closeTab(tabId){
    if(typeof autoSaveCurrent === 'function') autoSaveCurrent();
    _tabs = _tabs.filter(function(t){ return t.id !== tabId; });

    if(_activeTabId === tabId){
      if(_tabs.length > 0){
        var last = _tabs[_tabs.length - 1];
        _activeTabId = last.id;
        _updateViews();
        _renderTabBar();
        if(typeof loadNote === 'function') loadNote(last.id, false);
      } else {
        showLibrary();
      }
    } else {
      _renderTabBar();
    }
  }

  // ── View Switching ──
  function _updateViews(){
    var libView = document.getElementById('noteLibraryView');
    var editorView = document.getElementById('noteEditorView');

    if(_activeTabId){
      if(libView) libView.style.display = 'none';
      if(editorView) editorView.style.display = 'flex';
    } else {
      if(libView) libView.style.display = '';
      if(editorView) editorView.style.display = 'none';
    }
  }

  // ── Tab Bar Rendering ──
  function _renderTabBar(){
    var bar = document.getElementById('noteTabBar');
    if(!bar) return;

    if(_tabs.length === 0){
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = '';

    // Home button
    var homeBtn = document.createElement('button');
    homeBtn.className = 'note-tab-home' + (!_activeTabId ? ' active' : '');
    homeBtn.innerHTML = '<i class="fa fa-home"></i>';
    homeBtn.title = '노트 목록';
    homeBtn.onclick = function(){ showLibrary(); };
    bar.appendChild(homeBtn);

    // Tabs
    _tabs.forEach(function(tab){
      var tabEl = document.createElement('div');
      tabEl.className = 'note-tab' + (tab.id === _activeTabId ? ' active' : '');

      var nameSpan = document.createElement('span');
      nameSpan.className = 'note-tab-name';
      nameSpan.textContent = tab.title;
      nameSpan.title = tab.title;
      nameSpan.onclick = function(){
        if(_activeTabId !== tab.id){
          if(typeof autoSaveCurrent === 'function') autoSaveCurrent();
          if(typeof loadNote === 'function') loadNote(tab.id, false);
        }
      };

      var closeBtn = document.createElement('button');
      closeBtn.className = 'note-tab-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.title = '탭 닫기';
      closeBtn.onclick = function(e){
        e.stopPropagation();
        closeTab(tab.id);
      };

      tabEl.appendChild(nameSpan);
      tabEl.appendChild(closeBtn);
      bar.appendChild(tabEl);
    });
  }

  // ── Update active tab title from H1 ──
  function updateTabTitle(){
    if(!_activeTabId) return;
    var h1 = document.querySelector('#noteContent h1:first-child');
    var title = (h1 ? h1.textContent : '').trim() || '노트';
    if(title.length > 18) title = title.substr(0, 18) + '…';

    for(var i = 0; i < _tabs.length; i++){
      if(_tabs[i].id === _activeTabId){
        if(_tabs[i].title !== title){
          _tabs[i].title = title;
          _renderTabBar();
        }
        break;
      }
    }
  }

  function isInEditor(){ return !!_activeTabId; }
  function activeTabId(){ return _activeTabId; }

  return {
    showLibrary: showLibrary,
    showEditor: showEditor,
    closeTab: closeTab,
    updateTabTitle: updateTabTitle,
    isInEditor: isInEditor,
    activeTabId: activeTabId
  };
})();
