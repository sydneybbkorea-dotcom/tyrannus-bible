// pdf-live.js — 라이브 강의 UI + 코디네이션 (IIFE)
var PDFLive = (function(){
  var _role = null;           // 'presenter' | 'viewer' | 'replay' | null
  var _sessionCode = null;
  var _unsubscribe = null;    // onSnapshot unsubscribe
  var _liveIndicator = null;
  var _laserEl = null;        // 레이저 포인터 DOM
  var _origGoToPage = null;   // 원래 PDFViewer.goToPage 백업
  var _viewerStrokes = {};    // 시청자: 수신된 스트로크 데이터

  // ── 상태 조회 ──
  function isPresenting(){ return _role === 'presenter'; }
  function isViewing(){ return _role === 'viewer'; }
  function getSessionCode(){ return _sessionCode; }

  // ═══════════════════════════════════════════
  //  발표자 흐름
  // ═══════════════════════════════════════════
  async function startPresenting(){
    if(_role){
      if(typeof toast === 'function') toast('이미 세션이 활성화되어 있습니다.');
      return;
    }
    if(typeof PDFViewer === 'undefined' || !PDFViewer.isViewerActive()){
      if(typeof toast === 'function') toast('먼저 PDF를 열어주세요.');
      return;
    }

    _role = 'presenter';
    var pdfName = PDFViewer.getCurrentPdfId() || 'slide';
    var totalPages = PDFViewer.getTotalPages() || 1;

    // "라이브 강의" 폴더에 현재 PDF 등록
    _ensureLiveFolder();
    _registerPdfInLiveFolder(pdfName);

    if(typeof _liveCreateSession !== 'function'){
      toast('Firebase 모듈이 로드되지 않았습니다.');
      _role = null;
      return;
    }
    var code = await _liveCreateSession(pdfName, totalPages);
    if(!code){ _role = null; return; }
    _sessionCode = code;

    // PDF blob을 Storage에 업로드 (await로 완료 대기)
    if(typeof toast === 'function') toast('PDF 업로드 중...');
    await _uploadCurrentPdf(code);

    // 현재 페이지 전송
    var curPage = PDFViewer.getCurrentPage() || 1;
    _liveUpdatePage(code, curPage);

    // goToPage 훅
    _hookPresenterGoToPage();

    // 라이브 인디케이터 표시
    _showLiveIndicator();

    // 프리젠터 툴바 표시
    if(typeof PDFPresenterBar !== 'undefined') PDFPresenterBar.show();

    // 패널 갱신
    renderPanel();
    if(typeof toast === 'function') toast('라이브 시작! 코드: ' + code);
    console.log('[PDFLive] 발표 시작, 코드:', code);
  }

  async function _uploadCurrentPdf(code){
    try {
      var pdfId = PDFViewer.getCurrentPdfId();
      if(!pdfId) return;
      if(typeof IDBStore === 'undefined') return;
      await IDBStore.open();
      var rec = await IDBStore.loadFile(pdfId);
      if(!rec || !rec.data) return;
      var blob = rec.data;
      if(!(blob instanceof Blob)) blob = new Blob([blob], { type: 'application/pdf' });
      await _liveUploadSessionPdf(code, blob);
      console.log('[PDFLive] PDF 업로드 완료');
    } catch(e){
      console.error('[PDFLive] PDF 업로드 실패:', e);
    }
  }

  function _hookPresenterGoToPage(){
    if(_origGoToPage) return;
    _origGoToPage = PDFViewer.goToPage;
    PDFViewer.goToPage = function(n){
      _origGoToPage.call(PDFViewer, n);
      if(_role === 'presenter' && _sessionCode){
        _liveUpdatePage(_sessionCode, n);
      }
    };
  }

  function _unhookPresenterGoToPage(){
    if(_origGoToPage){
      PDFViewer.goToPage = _origGoToPage;
      _origGoToPage = null;
    }
  }

  // 스트로크 완성 훅 (pdf-tools.js에서 호출)
  function onStrokeComplete(pageNum, annot){
    if(_role !== 'presenter' || !_sessionCode) return;
    var stroke = {
      points: annot.points || [],
      color: annot.color || '#000',
      strokeWidth: annot.strokeWidth || 3,
      opacity: annot.opacity || 1,
      penType: annot.penType || 'ballpen'
    };
    _liveAddStroke(_sessionCode, pageNum, stroke);
    _liveClearLiveStroke(_sessionCode);
  }

  // 스트로크 진행중 훅 (pdf-tools.js에서 호출)
  function onStrokeProgress(pageNum, points, color, strokeWidth, opacity, penType){
    if(_role !== 'presenter' || !_sessionCode) return;
    _liveUpdateLiveStroke(_sessionCode, {
      pageNum: pageNum,
      points: points.map(function(p){ return { x: p.x, y: p.y }; }),
      color: color || '#000',
      strokeWidth: strokeWidth || 3,
      opacity: opacity || 1,
      penType: penType || 'ballpen'
    });
  }

  // 레이저 포인터 훅
  function onPointerMove(pageNum, x, y){
    if(_role !== 'presenter' || !_sessionCode) return;
    _liveUpdatePointer(_sessionCode, { x: x, y: y, pageNum: pageNum });
  }

  async function endPresenting(){
    if(_role !== 'presenter' || !_sessionCode) return;
    // 프리젠터 툴바 숨기기
    if(typeof PDFPresenterBar !== 'undefined') PDFPresenterBar.hide();
    await _liveEndSession(_sessionCode);
    _unhookPresenterGoToPage();
    _hideLiveIndicator();
    _role = null;
    _sessionCode = null;
    renderPanel();
    if(typeof toast === 'function') toast('강의를 종료했습니다.');
  }

  // ═══════════════════════════════════════════
  //  시청자 흐름
  // ═══════════════════════════════════════════
  async function joinSession(code){
    if(_role){
      if(typeof toast === 'function'){
        var msg = _role === 'presenter' ? '현재 발표 중입니다. 먼저 강의를 종료하세요.'
                : _role === 'viewer' ? '이미 강의에 참가 중입니다. 먼저 나가세요.'
                : '이미 세션이 활성화되어 있습니다.';
        toast(msg);
      }
      return;
    }
    if(!code || code.length < 4){
      if(typeof toast === 'function') toast('유효한 코드를 입력해주세요.');
      return;
    }

    if(typeof _liveJoinSession !== 'function'){
      toast('Firebase 모듈이 로드되지 않았습니다.');
      return;
    }

    var data = await _liveJoinSession(code);
    if(!data){
      if(typeof toast === 'function') toast('세션을 찾을 수 없습니다.');
      return;
    }
    if(data.status === 'ended'){
      // 종료된 세션 → 재생 모드로 열기
      _openReplay(code, data);
      return;
    }

    _role = 'viewer';
    _sessionCode = code;

    // PDF 다운로드 및 열기
    var opened = await _downloadAndOpenPdf(code, data.pdfName);
    if(!opened){
      _role = null; _sessionCode = null;
      return;
    }

    // 시청자 수 증가
    _liveIncrementViewerCount(code);

    // 리스너 시작
    _startListening(code);

    // 라이브 인디케이터
    _showLiveIndicator();

    renderPanel();
    if(typeof toast === 'function') toast((data.ownerName || '발표자') + '님의 강의에 참가합니다.');
  }

  // ── "라이브 강의" 전용 폴더 확보 ──
  var LIVE_FOLDER_ID = 'pf-live-lectures';

  function _ensureLiveFolder(){
    if(!S.pdfFolders) S.pdfFolders = [];
    var exists = S.pdfFolders.some(function(f){ return f.id === LIVE_FOLDER_ID; });
    if(!exists){
      S.pdfFolders.push({ id: LIVE_FOLDER_ID, name: '라이브 강의' });
      // 기본 열림 상태
      if(S.openPdfFolders) S.openPdfFolders.add(LIVE_FOLDER_ID);
      if(typeof persistPdf === 'function') persistPdf();
    }
  }

  // 발표자: 현재 열린 PDF를 라이브 강의 폴더로 이동/등록
  function _registerPdfInLiveFolder(pdfId){
    if(!S.pdfFiles) return;
    var file = S.pdfFiles.find(function(f){ return f.id === pdfId; });
    if(file){
      file.folderId = LIVE_FOLDER_ID;
      if(typeof persistPdf === 'function') persistPdf();
    }
  }

  async function _downloadAndOpenPdf(code, pdfName){
    try {
      if(typeof toast === 'function') toast('PDF 다운로드 중...');

      // Firebase SDK getBlob()으로 직접 다운로드 (CORS 우회)
      var blob = null;
      for(var attempt = 0; attempt < 10; attempt++){
        blob = await _liveDownloadPdfBlob(code);
        if(blob) break;
        await new Promise(function(r){ setTimeout(r, 1500); });
      }
      if(!blob){
        if(typeof toast === 'function') toast('PDF를 다운로드할 수 없습니다.');
        return false;
      }

      // "라이브 강의" 폴더 확보
      _ensureLiveFolder();

      // IDB에 저장 + pdfFiles 목록에 등록
      var pdfId = 'live_' + code;
      var fileName = (pdfName || 'slide') + '.pdf';
      if(typeof IDBStore !== 'undefined'){
        await IDBStore.open();
        await IDBStore.saveFile(blob, { id: pdfId, name: fileName, type: 'application/pdf' });
      }

      // S.pdfFiles에 등록 (중복 방지)
      if(!S.pdfFiles) S.pdfFiles = [];
      if(!S.pdfFiles.some(function(f){ return f.id === pdfId; })){
        S.pdfFiles.push({
          id: pdfId,
          name: fileName,
          size: blob.size || 0,
          folderId: LIVE_FOLDER_ID,
          createdAt: Date.now()
        });
        if(typeof persistPdf === 'function') persistPdf();
      }

      // PDF 패널 열기 + 뷰어에 표시
      _showPdfInPanel(pdfId, pdfName || 'LIVE');
      return true;
    } catch(e){
      console.error('[PDFLive] PDF 다운로드 실패:', e);
      if(typeof toast === 'function') toast('PDF 다운로드 실패');
      return false;
    }
  }

  // PDF 패널을 열고 뷰어에 PDF 표시
  function _showPdfInPanel(pdfId, displayName){
    // 1) PDF 패널 열기
    if(typeof PDFPanel !== 'undefined'){
      PDFPanel.open();
      // 2) 뷰어 뷰 직접 활성화
      var libView = document.getElementById('pdfLibraryView');
      var viewerView = document.getElementById('pdfViewerView');
      if(libView) libView.classList.add('pdf-view-hide');
      if(viewerView) viewerView.classList.add('pdf-view-active');
      // 탭바 숨김 (라이브용 단독 뷰)
      var tabBar = document.getElementById('pdfTabBar');
      if(tabBar) tabBar.style.display = 'none';
      // 제목 변경
      var title = document.querySelector('.pdf-panel-title');
      if(title) title.textContent = displayName;
    }
    // 3) PDFViewer로 열기
    if(typeof PDFViewer !== 'undefined'){
      PDFViewer.open(pdfId);
    }
  }

  function _startListening(code){
    if(_unsubscribe) _unsubscribe();
    _unsubscribe = _liveListenSession(code, {
      onPageChange: function(page){
        if(_role !== 'viewer') return;
        if(typeof PDFViewer !== 'undefined') PDFViewer.goToPage(page);
      },
      onStrokesUpdate: function(strokes){
        if(_role !== 'viewer') return;
        _viewerStrokes = strokes;
        _renderViewerStrokes();
      },
      onLiveStroke: function(data){
        if(_role !== 'viewer') return;
        _renderLiveStrokePreview(data);
      },
      onPointer: function(pos){
        if(_role !== 'viewer') return;
        _renderLaserPointer(pos);
      },
      onWhiteboard: function(wb){
        if(_role !== 'viewer' && _role !== 'replay') return;
        _applyWhiteboardState(wb);
      },
      onEnd: function(){
        _onSessionEnded();
      }
    });
  }

  // 시청자: 화이트보드 상태 적용
  function _applyWhiteboardState(wb){
    if(!wb || typeof wb !== 'object') return;
    Object.keys(wb).forEach(function(pageStr){
      var pageNum = parseInt(pageStr);
      if(typeof PDFPresenterBar !== 'undefined'){
        PDFPresenterBar.setWhiteboard(pageNum, !!wb[pageStr]);
      }
    });
  }

  function _onSessionEnded(){
    if(_unsubscribe){ _unsubscribe(); _unsubscribe = null; }
    _hideLiveIndicator();
    _removeLaserPointer();
    if(_role === 'viewer' && _sessionCode){
      _liveDecrementViewerCount(_sessionCode);
    }
    // 스트로크는 유지 (종료 후에도 계속 보임)
    _role = null;
    _sessionCode = null;
    renderPanel();
    if(typeof toast === 'function') toast('강의가 종료되었습니다. 필기 내용은 유지됩니다.');
  }

  async function leaveSession(){
    if(_role !== 'viewer' || !_sessionCode) return;
    if(_unsubscribe){ _unsubscribe(); _unsubscribe = null; }
    _liveDecrementViewerCount(_sessionCode);
    _hideLiveIndicator();
    _removeLaserPointer();
    _clearAllLiveLayers();
    _role = null;
    _sessionCode = null;
    _viewerStrokes = {};
    renderPanel();
    if(typeof toast === 'function') toast('강의에서 나왔습니다.');
  }

  // ═══════════════════════════════════════════
  //  세션 재생 (종료된 세션 열기)
  // ═══════════════════════════════════════════
  async function _openReplay(code, data){
    _role = 'replay';
    _sessionCode = code;
    _viewerStrokes = data.strokes || {};

    // PDF 다운로드
    var opened = await _downloadAndOpenPdf(code, data.pdfName || 'slide');
    if(!opened){
      _role = null; _sessionCode = null;
      return;
    }

    // 스트로크 렌더링 (페이지 이동 시마다)
    _renderViewerStrokes();

    // 페이지 이동 시 스트로크 다시 렌더
    if(typeof EventBus !== 'undefined'){
      EventBus.on('pdf:pageChanged', _onReplayPageChange);
    }

    renderPanel();
    var dateStr = _formatDate(data.createdAt);
    if(typeof toast === 'function') toast(dateStr + ' 강의 기록을 불러왔습니다.');
  }

  function _onReplayPageChange(){
    if(_role === 'replay') _renderViewerStrokes();
  }

  function closeReplay(){
    if(_role !== 'replay') return;
    _clearAllLiveLayers();
    if(typeof EventBus !== 'undefined'){
      EventBus.off('pdf:pageChanged', _onReplayPageChange);
    }
    _role = null;
    _sessionCode = null;
    _viewerStrokes = {};
    renderPanel();
  }

  // ═══════════════════════════════════════════
  //  라이브 스트로크 렌더링 (시청자 + 재생)
  // ═══════════════════════════════════════════
  function _getOrCreateLiveLayer(pageNum){
    var wrap = document.getElementById('pdf-page-' + pageNum);
    if(!wrap) return null;
    var layer = wrap.querySelector('.pdf-live-stroke-layer');
    if(!layer){
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      layer.setAttribute('class', 'pdf-live-stroke-layer');
      layer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
      wrap.appendChild(layer);
    }
    return layer;
  }

  function _renderViewerStrokes(){
    var curPage = (typeof PDFViewer !== 'undefined') ? PDFViewer.getCurrentPage() : 1;
    var pages = [curPage];
    if(curPage > 1) pages.push(curPage - 1);
    pages.push(curPage + 1);

    pages.forEach(function(pn){
      var layer = _getOrCreateLiveLayer(pn);
      if(!layer) return;
      var pageStrokes = _viewerStrokes[String(pn)] || [];
      var scale = (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() : 1;
      var html = '';
      pageStrokes.forEach(function(s){
        if(!s.points || s.points.length < 2) return;
        var d = 'M ' + (s.points[0].x * scale) + ' ' + (s.points[0].y * scale);
        for(var i = 1; i < s.points.length; i++){
          d += ' L ' + (s.points[i].x * scale) + ' ' + (s.points[i].y * scale);
        }
        var cap = (s.penType === 'highlighter') ? 'square' : 'round';
        html += '<path d="' + d + '" stroke="' + (s.color||'#000') + '" stroke-width="' + (s.strokeWidth||3)
          + '" fill="none" stroke-linecap="' + cap + '" stroke-linejoin="round" stroke-opacity="' + (s.opacity||1) + '"/>';
      });
      layer.innerHTML = html;
    });
  }

  function _renderLiveStrokePreview(data){
    document.querySelectorAll('.pdf-live-preview-path').forEach(function(el){ el.remove(); });
    if(!data || !data.points || data.points.length < 2) return;

    var layer = _getOrCreateLiveLayer(data.pageNum);
    if(!layer) return;
    var scale = (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() : 1;

    var d = 'M ' + (data.points[0].x * scale) + ' ' + (data.points[0].y * scale);
    for(var i = 1; i < data.points.length; i++){
      d += ' L ' + (data.points[i].x * scale) + ' ' + (data.points[i].y * scale);
    }
    var cap = (data.penType === 'highlighter') ? 'square' : 'round';
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'pdf-live-preview-path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', data.color || '#000');
    path.setAttribute('stroke-width', data.strokeWidth || 3);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', cap);
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-opacity', (data.opacity || 1) * 0.6);
    layer.appendChild(path);
  }

  // ═══════════════════════════════════════════
  //  레이저 포인터
  // ═══════════════════════════════════════════
  function _renderLaserPointer(pos){
    if(!pos){ _removeLaserPointer(); return; }
    var wrap = document.getElementById('pdf-page-' + pos.pageNum);
    if(!wrap){ _removeLaserPointer(); return; }
    if(!_laserEl){
      _laserEl = document.createElement('div');
      _laserEl.className = 'pdf-laser-pointer';
    }
    var scale = (typeof PDFViewer !== 'undefined') ? PDFViewer.getScale() : 1;
    _laserEl.style.left = (pos.x * scale) + 'px';
    _laserEl.style.top = (pos.y * scale) + 'px';
    if(_laserEl.parentElement !== wrap) wrap.appendChild(_laserEl);
  }

  function _removeLaserPointer(){
    if(_laserEl && _laserEl.parentElement) _laserEl.remove();
    _laserEl = null;
  }

  function _clearAllLiveLayers(){
    document.querySelectorAll('.pdf-live-stroke-layer').forEach(function(el){ el.remove(); });
    document.querySelectorAll('.pdf-live-preview-path').forEach(function(el){ el.remove(); });
  }

  // ═══════════════════════════════════════════
  //  라이브 인디케이터
  // ═══════════════════════════════════════════
  function _showLiveIndicator(){
    _hideLiveIndicator();
    _liveIndicator = document.createElement('div');
    _liveIndicator.className = 'live-indicator';
    _liveIndicator.innerHTML = '<span class="live-dot"></span> LIVE';
    var toolbar = document.getElementById('pdfToolbar');
    if(toolbar) toolbar.appendChild(_liveIndicator);
  }

  function _hideLiveIndicator(){
    if(_liveIndicator && _liveIndicator.parentElement) _liveIndicator.remove();
    _liveIndicator = null;
  }

  // ═══════════════════════════════════════════
  //  사이드 패널 UI
  // ═══════════════════════════════════════════
  function renderPanel(){
    var body = document.getElementById('liveSpBody');
    if(!body) return;
    body.innerHTML = '';
    body.className = 'live-panel-body';

    if(_role === 'presenter') _renderPresenterPanel(body);
    else if(_role === 'viewer') _renderViewerPanel(body);
    else if(_role === 'replay') _renderReplayPanel(body);
    else _renderIdlePanel(body);
  }

  function _renderIdlePanel(body){
    var html = '';

    // 라이브 시작 버튼
    var pdfActive = (typeof PDFViewer !== 'undefined' && PDFViewer.isViewerActive());
    if(pdfActive){
      html += '<button class="live-btn live-btn-start" onclick="PDFLive.startPresenting()">'
        + '<i class="fa fa-tower-broadcast"></i> 라이브 시작</button>';
    } else {
      html += '<div class="live-hint"><i class="fa fa-info-circle"></i> PDF를 먼저 열면 라이브를 시작할 수 있습니다.</div>';
    }

    html += '<div class="live-divider"></div>';

    // 코드 입력 참가
    html += '<div class="live-join-section">'
      + '<label class="live-label">코드로 참가</label>'
      + '<div class="live-join-row">'
      + '<input class="live-code-input" id="liveCodeInput" placeholder="ABC123" maxlength="6" '
      + 'onkeydown="if(event.key===\'Enter\')PDFLive.joinFromInput()">'
      + '<button class="live-btn live-btn-join" onclick="PDFLive.joinFromInput()">'
      + '<i class="fa fa-sign-in-alt"></i> 참가</button>'
      + '</div></div>';

    html += '<div class="live-divider"></div>';

    // 지난 강의 기록 섹션
    html += '<div class="live-history-section">'
      + '<label class="live-label"><i class="fa fa-clock-rotate-left"></i> 지난 강의 기록</label>'
      + '<div id="liveHistoryList" class="live-history-list">'
      + '<div class="live-hint"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</div>'
      + '</div></div>';

    body.innerHTML = html;

    // 비동기 세션 목록 로드
    _loadSessionHistory();
  }

  function _renderPresenterPanel(body){
    var html = '<div class="live-status"><span class="live-dot"></span>'
      + '<span class="live-status-text">라이브 중</span></div>'
      + '<div class="live-code-display">' + _sessionCode + '</div>'
      + '<div class="live-actions">'
      + '<button class="live-btn live-btn-copy" onclick="PDFLive.copyCode()">'
      + '<i class="fa fa-copy"></i> 코드 복사</button>'
      + '<button class="live-btn live-btn-link" onclick="PDFLive.copyLink()">'
      + '<i class="fa fa-link"></i> 링크 복사</button></div>'
      + '<div class="live-divider"></div>'
      + '<button class="live-btn live-btn-end" onclick="PDFLive.endPresenting()">'
      + '<i class="fa fa-stop"></i> 강의 종료</button>';
    body.innerHTML = html;
  }

  function _renderViewerPanel(body){
    var html = '<div class="live-status"><span class="live-dot"></span>'
      + '<span class="live-status-text">시청 중</span></div>'
      + '<div class="live-code-display">' + _sessionCode + '</div>'
      + '<div class="live-divider"></div>'
      + '<button class="live-btn live-btn-leave" onclick="PDFLive.leaveSession()">'
      + '<i class="fa fa-sign-out-alt"></i> 나가기</button>';
    body.innerHTML = html;
  }

  function _renderReplayPanel(body){
    var html = '<div class="live-status">'
      + '<i class="fa fa-play-circle" style="color:var(--accent,#6366f1)"></i>'
      + '<span class="live-status-text" style="color:var(--text-1,#eee)">기록 재생 중</span></div>'
      + '<div class="live-divider"></div>'
      + '<button class="live-btn live-btn-leave" onclick="PDFLive.closeReplay()">'
      + '<i class="fa fa-times"></i> 닫기</button>';
    body.innerHTML = html;
  }

  // ── 세션 히스토리 로드 ──
  async function _loadSessionHistory(){
    var listEl = document.getElementById('liveHistoryList');
    if(!listEl) return;

    if(typeof _liveListSessions !== 'function'){
      listEl.innerHTML = '<div class="live-hint">로그인 후 이용 가능합니다.</div>';
      return;
    }

    try {
      var sessions = await _liveListSessions();
      if(!sessions || sessions.length === 0){
        listEl.innerHTML = '<div class="live-hint">저장된 강의가 없습니다.</div>';
        return;
      }

      var html = '';
      sessions.forEach(function(s){
        var dateStr = _formatDate(s.createdAt);
        var statusBadge = s.status === 'live'
          ? '<span class="live-history-badge live-history-live">LIVE</span>'
          : '<span class="live-history-badge live-history-ended">종료</span>';
        var pages = s.totalPages || 0;
        var strokeCount = 0;
        if(s.strokes){
          Object.keys(s.strokes).forEach(function(k){
            strokeCount += (s.strokes[k] || []).length;
          });
        }

        html += '<div class="live-history-item" onclick="PDFLive.openSession(\'' + s.code + '\')">'
          + '<div class="live-history-top">'
          + statusBadge
          + '<span class="live-history-date">' + dateStr + '</span>'
          + '<button class="live-history-del" onclick="event.stopPropagation();PDFLive.deleteSession(\'' + s.code + '\')" title="삭제">'
          + '<i class="fa fa-trash"></i></button>'
          + '</div>'
          + '<div class="live-history-info">'
          + '<span><i class="fa fa-file-pdf"></i> ' + (s.pdfName || 'PDF') + '</span>'
          + '<span class="live-history-meta">' + pages + '페이지'
          + (strokeCount > 0 ? ' · 필기 ' + strokeCount + '개' : '') + '</span>'
          + '</div></div>';
      });
      listEl.innerHTML = html;
    } catch(e){
      console.error('[PDFLive] 세션 목록 로드 실패:', e);
      listEl.innerHTML = '<div class="live-hint">목록 로드 실패</div>';
    }
  }

  // ── 세션 열기 (live → 참가, ended → 재생) ──
  async function openSession(code){
    if(_role) return;
    var data = await _liveJoinSession(code);
    if(!data){
      if(typeof toast === 'function') toast('세션을 찾을 수 없습니다.');
      return;
    }
    if(data.status === 'live'){
      joinSession(code);
    } else {
      _openReplay(code, data);
    }
  }

  // ── 세션 삭제 ──
  async function deleteSessionItem(code){
    if(!confirm('이 강의 기록을 삭제하시겠습니까?')) return;
    await _liveDeleteSession(code);
    // 리스트 갱신
    _loadSessionHistory();
    if(typeof toast === 'function') toast('삭제됨');
  }

  // ── 헬퍼 ──
  function joinFromInput(){
    var input = document.getElementById('liveCodeInput');
    if(!input) return;
    var code = (input.value || '').trim();
    joinSession(code);
  }

  function copyCode(){
    if(!_sessionCode) return;
    navigator.clipboard.writeText(_sessionCode).then(function(){
      if(typeof toast === 'function') toast('코드 복사됨: ' + _sessionCode);
    });
  }

  function copyLink(){
    if(!_sessionCode) return;
    var url = window.location.origin + window.location.pathname + '?live=' + _sessionCode;
    navigator.clipboard.writeText(url).then(function(){
      if(typeof toast === 'function') toast('링크 복사됨');
    });
  }

  function _formatDate(ts){
    if(!ts) return '';
    var d = new Date(ts);
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var hh = d.getHours();
    var mi = String(d.getMinutes()).padStart(2, '0');
    return mm + '/' + dd + ' ' + hh + ':' + mi;
  }

  // URL 파라미터로 직접 참가
  function handleLiveParam(code){
    if(!code) return;
    var attempts = 0;
    var timer = setInterval(function(){
      attempts++;
      if(typeof _liveJoinSession === 'function'){
        clearInterval(timer);
        openSession(code);
      } else if(attempts > 20){
        clearInterval(timer);
        if(typeof toast === 'function') toast('라이브 모듈 로딩 실패');
      }
    }, 500);
  }

  // ── 초기화: "라이브 강의" 폴더 보장 ──
  function init(){
    _ensureLiveFolder();
  }

  return {
    init: init,
    isPresenting: isPresenting,
    isViewing: isViewing,
    getSessionCode: getSessionCode,
    startPresenting: startPresenting,
    endPresenting: endPresenting,
    joinSession: joinSession,
    leaveSession: leaveSession,
    closeReplay: closeReplay,
    openSession: openSession,
    deleteSession: deleteSessionItem,
    onStrokeComplete: onStrokeComplete,
    onStrokeProgress: onStrokeProgress,
    onPointerMove: onPointerMove,
    renderPanel: renderPanel,
    joinFromInput: joinFromInput,
    copyCode: copyCode,
    copyLink: copyLink,
    handleLiveParam: handleLiveParam
  };
})();
