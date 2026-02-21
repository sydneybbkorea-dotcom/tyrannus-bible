// pdf-panel.js — PDF 패널 open/close/toggle, 탭 시스템, 뷰 전환 (library ↔ viewer)

var PDFPanel = (function(){
  var _tabs = [];          // [{id, name, page}]  — 열린 PDF 탭 목록
  var _activeTabId = null; // 현재 활성 탭 ID (null = 라이브러리 표시)

  // ── Panel Toggle ──
  function toggle(){
    var panel = document.getElementById('pdfPanel');
    if(!panel) return;
    if(panel.classList.contains('pdf-panel-hide')) open();
    else close();
  }

  function open(){
    var panel = document.getElementById('pdfPanel');
    if(!panel) return;
    panel.classList.remove('pdf-panel-hide');
    document.body.classList.add('pdf-open');
    var btn = document.querySelector('.rail-icon[data-rail="pdf"]');
    if(btn) btn.classList.add('active');
    if(!_activeTabId) showLibrary();
  }

  function close(){
    var panel = document.getElementById('pdfPanel');
    if(!panel) return;
    panel.classList.add('pdf-panel-hide');
    document.body.classList.remove('pdf-open');
    var btn = document.querySelector('.rail-icon[data-rail="pdf"]');
    if(btn) btn.classList.remove('active');
  }

  // Header X button: viewer→라이브러리, library→패널 닫기
  function headerClose(){
    if(_activeTabId){
      showLibrary();
    } else {
      close();
    }
  }

  // ── Library View ──
  function showLibrary(){
    _activeTabId = null;
    _updateViews();
    _renderTabBar();
    var title = document.querySelector('.pdf-panel-title');
    if(title) title.textContent = 'PDF 도서관';
    _updateCloseIcon();
    if(typeof PDFLibrary !== 'undefined') PDFLibrary.render();
  }

  // ── Open PDF in tab ──
  function showViewer(pdfId){
    // 이미 열린 탭이면 활성화만
    var existing = null;
    for(var i = 0; i < _tabs.length; i++){
      if(_tabs[i].id === pdfId){ existing = _tabs[i]; break; }
    }

    if(existing){
      _activeTabId = pdfId;
      _updateViews();
      _renderTabBar();
      _updateTitle();
      _updateCloseIcon();
      if(typeof PDFViewer !== 'undefined') PDFViewer.open(pdfId, existing.page);
      return;
    }

    // 새 탭 생성
    var file = S.pdfFiles.find(function(f){ return f.id === pdfId; });
    var tabName = file ? file.name.replace(/\.pdf$/i, '') : 'PDF';
    if(tabName.length > 18) tabName = tabName.substr(0, 18) + '…';

    _tabs.push({ id: pdfId, name: tabName, page: 1 });
    _activeTabId = pdfId;

    _updateViews();
    _renderTabBar();
    _updateTitle();
    _updateCloseIcon();

    if(typeof PDFViewer !== 'undefined') PDFViewer.open(pdfId);
  }

  // ── Close Tab ──
  function closeTab(tabId){
    _tabs = _tabs.filter(function(t){ return t.id !== tabId; });

    if(_activeTabId === tabId){
      if(_tabs.length > 0){
        // 마지막 탭으로 전환
        var last = _tabs[_tabs.length - 1];
        _activeTabId = last.id;
        _updateViews();
        _renderTabBar();
        _updateTitle();
        _updateCloseIcon();
        if(typeof PDFViewer !== 'undefined') PDFViewer.open(last.id, last.page);
      } else {
        showLibrary();
      }
    } else {
      _renderTabBar();
    }
  }

  // PDFViewer.close() 가 호출할 함수
  function closeActiveTab(){
    if(_activeTabId){
      closeTab(_activeTabId);
    } else {
      showLibrary();
    }
  }

  // ── View Switching ──
  function _updateViews(){
    var libView = document.getElementById('pdfLibraryView');
    var viewerView = document.getElementById('pdfViewerView');

    if(_activeTabId){
      if(libView) libView.classList.add('pdf-view-hide');
      if(viewerView) viewerView.classList.add('pdf-view-active');
    } else {
      if(libView) libView.classList.remove('pdf-view-hide');
      if(viewerView) viewerView.classList.remove('pdf-view-active');
    }
  }

  // ── Tab Bar Rendering ──
  function _renderTabBar(){
    var bar = document.getElementById('pdfTabBar');
    if(!bar) return;

    if(_tabs.length === 0){
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = '';

    // 홈 버튼 (도서관)
    var homeBtn = document.createElement('button');
    homeBtn.className = 'pdf-tab-home' + (!_activeTabId ? ' active' : '');
    homeBtn.innerHTML = '<i class="fa fa-home"></i>';
    homeBtn.title = 'PDF 도서관';
    homeBtn.onclick = function(){ showLibrary(); };
    bar.appendChild(homeBtn);

    // 탭들
    _tabs.forEach(function(tab){
      var tabEl = document.createElement('div');
      tabEl.className = 'pdf-tab' + (tab.id === _activeTabId ? ' active' : '');

      var nameSpan = document.createElement('span');
      nameSpan.className = 'pdf-tab-name';
      nameSpan.textContent = tab.name;
      nameSpan.title = tab.name;
      nameSpan.onclick = function(){
        if(_activeTabId !== tab.id){
          _activeTabId = tab.id;
          _updateViews();
          _renderTabBar();
          _updateTitle();
          _updateCloseIcon();
          if(typeof PDFViewer !== 'undefined') PDFViewer.open(tab.id, tab.page);
        }
      };

      var closeBtn = document.createElement('button');
      closeBtn.className = 'pdf-tab-close';
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

  function _updateTitle(){
    var title = document.querySelector('.pdf-panel-title');
    if(!title) return;
    if(!_activeTabId){
      title.textContent = 'PDF 도서관';
      return;
    }
    var tab = null;
    for(var i = 0; i < _tabs.length; i++){
      if(_tabs[i].id === _activeTabId){ tab = _tabs[i]; break; }
    }
    title.textContent = tab ? tab.name : 'PDF 뷰어';
  }

  function _updateCloseIcon(){
    var btn = document.querySelector('.pdf-panel-close');
    if(!btn) return;
    if(_activeTabId){
      btn.innerHTML = '<i class="fa fa-arrow-left"></i>';
      btn.title = '도서관으로';
    } else {
      btn.innerHTML = '<i class="fa fa-times"></i>';
      btn.title = '닫기';
    }
  }

  function isOpen(){
    var panel = document.getElementById('pdfPanel');
    return panel && !panel.classList.contains('pdf-panel-hide');
  }

  function isInViewer(){ return !!_activeTabId; }

  return {
    toggle: toggle,
    open: open,
    close: close,
    headerClose: headerClose,
    showLibrary: showLibrary,
    showViewer: showViewer,
    closeTab: closeTab,
    closeActiveTab: closeActiveTab,
    isOpen: isOpen,
    isInViewer: isInViewer
  };
})();

// Global toggle function for icon-rail onclick
function togglePdfPanel(){
  PDFPanel.toggle();
}
