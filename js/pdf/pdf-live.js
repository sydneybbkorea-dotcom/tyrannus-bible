// pdf-live.js — 라이브 강의 UI + 코디네이션 (IIFE)
var PDFLive = (function(){
  var _role = null;           // 'presenter' | 'viewer' | null
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
    if(_role) return;
    if(typeof PDFViewer === 'undefined' || !PDFViewer.isViewerActive()){
      if(typeof toast === 'function') toast('먼저 PDF를 열어주세요.');
      return;
    }

    _role = 'presenter';
    var pdfName = PDFViewer.getCurrentPdfId() || 'slide';
    var totalPages = PDFViewer.getTotalPages() || 1;

    // 세션 생성
    if(typeof _liveCreateSession !== 'function'){
      toast('Firebase 모듈이 로드되지 않았습니다.');
      _role = null;
      return;
    }
    var code = await _liveCreateSession(pdfName, totalPages);
    if(!code){ _role = null; return; }
    _sessionCode = code;

    // PDF blob을 Storage에 업로드
    _uploadCurrentPdf(code);

    // 현재 페이지 전송
    var curPage = PDFViewer.getCurrentPage() || 1;
    _liveUpdatePage(code, curPage);

    // goToPage 훅
    _hookPresenterGoToPage();

    // 라이브 인디케이터 표시
    _showLiveIndicator();

    // 패널 갱신
    renderPanel();

    console.log('[PDFLive] 발표 시작, 코드:', code);
  }

  async function _uploadCurrentPdf(code){
    try {
      var pdfId = PDFViewer.getCurrentPdfId();
      if(!pdfId) return;
      // IDBStore에서 blob 조회
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
    if(_role) return;
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
      if(typeof toast === 'function') toast('이미 종료된 강의입니다.');
      return;
    }

    _role = 'viewer';
    _sessionCode = code;

    // PDF 다운로드 및 열기
    await _downloadAndOpenPdf(code, data.pdfName);

    // 시청자 수 증가
    _liveIncrementViewerCount(code);

    // 리스너 시작
    _startListening(code);

    // 라이브 인디케이터
    _showLiveIndicator();

    renderPanel();
    if(typeof toast === 'function') toast(data.ownerName + '님의 강의에 참가합니다.');
  }

  async function _downloadAndOpenPdf(code, pdfName){
    try {
      if(typeof toast === 'function') toast('PDF 다운로드 중...');
      var url = await _liveGetSessionPdfUrl(code);
      if(!url){
        toast('PDF를 다운로드할 수 없습니다.');
        return;
      }
      // fetch로 blob 다운로드
      var resp = await fetch(url);
      var blob = await resp.blob();
      // IDB에 저장 후 열기
      var pdfId = 'live-' + code;
      if(typeof IDBStore !== 'undefined'){
        await IDBStore.open();
        await IDBStore.saveFile(blob, { id: pdfId, name: pdfName || 'slide.pdf', type: 'application/pdf' });
      }
      if(typeof PDFViewer !== 'undefined'){
        // 먼저 PDF 패널 보이기
        if(typeof PDFPanel !== 'undefined' && typeof PDFPanel.show === 'function'){
          PDFPanel.show();
        }
        await PDFViewer.open(pdfId);
      }
    } catch(e){
      console.error('[PDFLive] PDF 다운로드 실패:', e);
      if(typeof toast === 'function') toast('PDF 다운로드 실패');
    }
  }

  function _startListening(code){
    if(_unsubscribe) _unsubscribe();
    _unsubscribe = _liveListenSession(code, {
      onPageChange: function(page){
        if(_role !== 'viewer') return;
        // 원본 goToPage 사용 (훅 없는 버전)
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
      onEnd: function(){
        _onSessionEnded();
      }
    });
  }

  function _onSessionEnded(){
    if(_unsubscribe){ _unsubscribe(); _unsubscribe = null; }
    _hideLiveIndicator();
    _removeLaserPointer();
    _clearAllLiveLayers();
    if(_role === 'viewer' && _sessionCode){
      _liveDecrementViewerCount(_sessionCode);
    }
    _role = null;
    _sessionCode = null;
    _viewerStrokes = {};
    renderPanel();
    if(typeof toast === 'function') toast('강의가 종료되었습니다.');
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
  //  라이브 스트로크 렌더링 (시청자)
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
    // 현재 보이는 페이지들에 대해 스트로크 렌더
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
    // 이전 프리뷰 제거
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
    if(!pos){
      _removeLaserPointer();
      return;
    }
    var wrap = document.getElementById('pdf-page-' + pos.pageNum);
    if(!wrap){
      _removeLaserPointer();
      return;
    }
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
    if(_laserEl && _laserEl.parentElement){
      _laserEl.remove();
    }
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
    if(toolbar){
      toolbar.appendChild(_liveIndicator);
    }
  }

  function _hideLiveIndicator(){
    if(_liveIndicator && _liveIndicator.parentElement){
      _liveIndicator.remove();
    }
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

    // 세션 활성 상태
    if(_role === 'presenter'){
      _renderPresenterPanel(body);
    } else if(_role === 'viewer'){
      _renderViewerPanel(body);
    } else {
      _renderIdlePanel(body);
    }
  }

  function _renderIdlePanel(body){
    var html = '';

    // 라이브 시작 버튼 (PDF 열려있을 때만)
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
      + '<label class="live-label">코드 입력</label>'
      + '<div class="live-join-row">'
      + '<input class="live-code-input" id="liveCodeInput" placeholder="ABC123" maxlength="6" '
      + 'onkeydown="if(event.key===\'Enter\')PDFLive.joinFromInput()">'
      + '<button class="live-btn live-btn-join" onclick="PDFLive.joinFromInput()">'
      + '<i class="fa fa-sign-in-alt"></i> 참가</button>'
      + '</div></div>';

    body.innerHTML = html;
  }

  function _renderPresenterPanel(body){
    var html = '';
    html += '<div class="live-status">'
      + '<span class="live-dot"></span>'
      + '<span class="live-status-text">라이브 중</span>'
      + '</div>';

    html += '<div class="live-code-display">' + _sessionCode + '</div>';

    html += '<div class="live-actions">'
      + '<button class="live-btn live-btn-copy" onclick="PDFLive.copyCode()">'
      + '<i class="fa fa-copy"></i> 코드 복사</button>'
      + '<button class="live-btn live-btn-link" onclick="PDFLive.copyLink()">'
      + '<i class="fa fa-link"></i> 링크 복사</button>'
      + '</div>';

    html += '<div class="live-divider"></div>';

    html += '<button class="live-btn live-btn-end" onclick="PDFLive.endPresenting()">'
      + '<i class="fa fa-stop"></i> 강의 종료</button>';

    body.innerHTML = html;
  }

  function _renderViewerPanel(body){
    var html = '';
    html += '<div class="live-status">'
      + '<span class="live-dot"></span>'
      + '<span class="live-status-text">시청 중</span>'
      + '</div>';

    html += '<div class="live-code-display">' + _sessionCode + '</div>';

    html += '<div class="live-divider"></div>';

    html += '<button class="live-btn live-btn-leave" onclick="PDFLive.leaveSession()">'
      + '<i class="fa fa-sign-out-alt"></i> 나가기</button>';

    body.innerHTML = html;
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

  // URL 파라미터로 직접 참가
  function handleLiveParam(code){
    if(!code) return;
    // 로그인 후 Firebase 모듈 준비 대기
    var attempts = 0;
    var timer = setInterval(function(){
      attempts++;
      if(typeof _liveJoinSession === 'function'){
        clearInterval(timer);
        joinSession(code);
      } else if(attempts > 20){
        clearInterval(timer);
        if(typeof toast === 'function') toast('라이브 모듈 로딩 실패');
      }
    }, 500);
  }

  return {
    isPresenting: isPresenting,
    isViewing: isViewing,
    getSessionCode: getSessionCode,
    startPresenting: startPresenting,
    endPresenting: endPresenting,
    joinSession: joinSession,
    leaveSession: leaveSession,
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
