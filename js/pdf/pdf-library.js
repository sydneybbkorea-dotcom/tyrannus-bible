// pdf-library.js — 폴더 CRUD, 파일 목록, 업로드, 트리 렌더링, 컨텍스트 메뉴, persist/restore

var PDFLibrary = (function(){
  var _newFolderParent = null;

  // ── Render ──
  function render(){
    var cont = document.getElementById('pdfFolderTree');
    if(!cont) return;
    cont.innerHTML = '';

    // Action bar is static HTML in index.html, just render tree
    var roots = S.pdfFolders.filter(function(f){ return !f.parentId; });
    if(roots.length === 0 && S.pdfFiles.length === 0){
      cont.innerHTML = '<div class="pdf-lib-empty"><i class="fa fa-file-pdf"></i><span>PDF 파일이 없습니다.<br>업로드 버튼을 눌러 파일을 추가하세요.</span></div>';
      return;
    }
    roots.forEach(function(f){
      cont.appendChild(_buildFolderNode(f, 0));
    });
    // Orphan files (no folder)
    var orphans = S.pdfFiles.filter(function(f){ return !f.folderId; });
    orphans.forEach(function(file){
      cont.appendChild(_buildFileNode(file, 0));
    });
  }

  // ── Folder Node ──
  function _buildFolderNode(f, depth){
    var children = S.pdfFolders.filter(function(c){ return c.parentId === f.id; });
    var files = S.pdfFiles.filter(function(file){ return file.folderId === f.id; });
    var isOpen = S.openPdfFolders.has(f.id);
    var isSel = S.curPdfFolder === f.id;
    var hasKids = children.length > 0 || files.length > 0;

    var wrap = document.createElement('div');
    wrap.className = 'pdf-ft-node';

    var head = document.createElement('div');
    head.className = 'pdf-ft-head' + (isSel ? ' pdf-ft-sel' : '');
    head.style.paddingLeft = (8 + depth * 16) + 'px';

    var arrow = hasKids
      ? '<i class="ft-arrow fa fa-chevron-right' + (isOpen ? ' open' : '') + '"></i>'
      : '<span class="ft-arrow-sp"></span>';
    var icon = '<i class="ft-icon fa fa-folder' + (isOpen ? '-open' : '') + '" style="color:' + (isOpen ? 'var(--gold)' : 'var(--text3)') + '"></i>';
    var count = files.length > 0 ? '<span class="pdf-ft-count">' + files.length + '</span>' : '';
    head.innerHTML = arrow + icon + '<span class="ft-name">' + _esc(f.name) + '</span>' + count;

    head.onclick = function(){ _toggleFolder(f.id); };
    head.addEventListener('contextmenu', function(e){
      e.preventDefault(); e.stopPropagation();
      showFolderCtx(e, f.id, f.name, files.length);
    });
    wrap.appendChild(head);

    if(isOpen){
      children.forEach(function(c){ wrap.appendChild(_buildFolderNode(c, depth + 1)); });
      files.sort(function(a,b){ return (b.createdAt||0) - (a.createdAt||0); }).forEach(function(file){
        wrap.appendChild(_buildFileNode(file, depth + 1));
      });
    }
    return wrap;
  }

  // ── File Node ──
  function _buildFileNode(file, depth){
    var el = document.createElement('div');
    el.className = 'pdf-ft-file';
    el.style.paddingLeft = (8 + depth * 16 + 16) + 'px';

    var sizeStr = _formatSize(file.size || 0);
    var dateStr = file.createdAt ? new Date(file.createdAt).toLocaleDateString('ko-KR') : '';

    el.innerHTML = '<i class="fa fa-file-pdf pdf-ft-file-icon"></i>'
      + '<div class="pdf-ft-file-info">'
      + '<div class="pdf-ft-file-name">' + _esc(file.name) + '</div>'
      + '<div class="pdf-ft-file-meta">' + sizeStr + (dateStr ? ' · ' + dateStr : '') + '</div>'
      + '</div>';

    el.title = file.name;
    el.onclick = function(e){
      e.stopPropagation();
      PDFPanel.showViewer(file.id);
    };
    el.addEventListener('contextmenu', function(e){
      e.preventDefault(); e.stopPropagation();
      showFileCtx(e, file.id, file.name);
    });
    return el;
  }

  // ── Toggle Folder ──
  function _toggleFolder(fid){
    if(S.openPdfFolders.has(fid)) S.openPdfFolders.delete(fid);
    else S.openPdfFolders.add(fid);
    S.curPdfFolder = fid;
    render();
    persistPdf();
  }

  // ── Upload PDF ──
  function uploadPdf(){
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.multiple = true;
    input.onchange = function(){
      if(!input.files || input.files.length === 0) return;
      var fileCount = input.files.length;
      var fileList = Array.prototype.slice.call(input.files);

      // Ensure IDB is open before saving
      var idbReady = (typeof IDBStore !== 'undefined' && IDBStore.open)
        ? IDBStore.open() : Promise.resolve();

      idbReady.then(function(){
        var promises = [];
        fileList.forEach(function(file){
          var pdfId = 'pdf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          var meta = { id: pdfId, name: file.name, type: 'application/pdf' };
          var promise = IDBStore.saveFile(file, meta).then(function(id){
            S.pdfFiles.push({
              id: id,
              name: file.name,
              size: file.size,
              folderId: S.curPdfFolder || 'pdf-default',
              createdAt: Date.now()
            });
          });
          promises.push(promise);
        });
        return Promise.all(promises);
      }).then(function(){
        persistPdf();
        render();
        toast(fileCount + '개 PDF가 업로드되었습니다');
      }).catch(function(e){
        console.error('[PDFLibrary] upload failed:', e);
        toast('PDF 업로드에 실패했습니다: ' + (e.message || e));
      });
    };
    input.click();
  }

  // ── Folder CRUD ──
  function newFolder(parentId){
    _newFolderParent = parentId || S.curPdfFolder || null;
    var name = prompt('새 PDF 폴더 이름:');
    if(!name || !name.trim()) return;
    createFolder(name.trim());
  }

  function createFolder(nm){
    var f = { id: 'pf_' + Date.now(), name: nm };
    if(_newFolderParent) f.parentId = _newFolderParent;
    S.pdfFolders.push(f);
    S.openPdfFolders.add(_newFolderParent || '__root');
    _newFolderParent = null;
    persistPdf();
    render();
    toast('"' + nm + '" 폴더가 만들어졌습니다');
  }

  function renameFolder(folderId){
    hidePdfCtx();
    var f = S.pdfFolders.find(function(x){ return x.id === folderId; });
    if(!f) return;
    var newName = prompt('새 폴더 이름:', f.name);
    if(!newName || !newName.trim()) return;
    f.name = newName.trim();
    persistPdf();
    render();
    toast('폴더 이름이 "' + f.name + '"으로 변경되었습니다');
  }

  function deleteFolder(folderId, folderName, fileCount){
    hidePdfCtx();
    var all = _getDescendants(folderId);
    var totalFiles = S.pdfFiles.filter(function(f){ return all.indexOf(f.folderId) !== -1; }).length;
    var msg = totalFiles > 0
      ? '"' + folderName + '" 폴더와 PDF ' + totalFiles + '개를 모두 삭제할까요?'
      : '"' + folderName + '" 폴더를 삭제할까요?';
    if(!confirm(msg)) return;
    // Delete files from IDB
    S.pdfFiles.filter(function(f){ return all.indexOf(f.folderId) !== -1; }).forEach(function(f){
      if(typeof IDBStore !== 'undefined') IDBStore.del('files', f.id);
    });
    S.pdfFiles = S.pdfFiles.filter(function(f){ return all.indexOf(f.folderId) === -1; });
    S.pdfFolders = S.pdfFolders.filter(function(f){ return all.indexOf(f.id) === -1; });
    if(all.indexOf(S.curPdfFolder) !== -1){
      S.curPdfFolder = S.pdfFolders[0] ? S.pdfFolders[0].id : null;
    }
    persistPdf();
    render();
    toast('"' + folderName + '" 폴더가 삭제되었습니다');
  }

  function _getDescendants(fid){
    var ids = [fid];
    S.pdfFolders.filter(function(f){ return f.parentId === fid; }).forEach(function(c){
      ids = ids.concat(_getDescendants(c.id));
    });
    return ids;
  }

  // ── File CRUD ──
  function deletePdf(fileId, fileName){
    hidePdfCtx();
    if(!confirm('"' + fileName + '"을(를) 삭제할까요?')) return;
    S.pdfFiles = S.pdfFiles.filter(function(f){ return f.id !== fileId; });
    if(typeof IDBStore !== 'undefined') IDBStore.del('files', fileId);
    persistPdf();
    render();
    toast('"' + fileName + '"이(가) 삭제되었습니다');
  }

  function renamePdf(fileId){
    hidePdfCtx();
    var f = S.pdfFiles.find(function(x){ return x.id === fileId; });
    if(!f) return;
    var newName = prompt('새 파일 이름:', f.name);
    if(!newName || !newName.trim()) return;
    f.name = newName.trim();
    persistPdf();
    render();
    toast('파일 이름이 "' + f.name + '"으로 변경되었습니다');
  }

  // ── Context Menus ──
  function showFolderCtx(e, folderId, folderName, fileCount){
    hidePdfCtx();
    var menu = document.createElement('div');
    menu.id = 'pdfCtxMenu';
    menu.className = 'pdf-ctx';
    var safeName = folderName.replace(/'/g, "\\'");
    menu.innerHTML =
      '<div class="pdf-ctx-item" onclick="PDFLibrary.newFolder(\'' + folderId + '\')"><i class="fa fa-folder-plus"></i> 하위 폴더</div>'
      + '<div class="pdf-ctx-item" onclick="PDFLibrary.renameFolder(\'' + folderId + '\')"><i class="fa fa-pen"></i> 이름 변경</div>'
      + '<div class="pdf-ctx-item pdf-ctx-danger" onclick="PDFLibrary.deleteFolder(\'' + folderId + '\',\'' + safeName + '\',' + fileCount + ')"><i class="fa fa-trash"></i> 폴더 삭제</div>';
    document.body.appendChild(menu);
    _positionCtx(menu, e);
    setTimeout(function(){ document.addEventListener('click', hidePdfCtx, { once: true }); }, 10);
  }

  function showFileCtx(e, fileId, fileName){
    hidePdfCtx();
    var menu = document.createElement('div');
    menu.id = 'pdfCtxMenu';
    menu.className = 'pdf-ctx';
    var safeName = fileName.replace(/'/g, "\\'");
    menu.innerHTML =
      '<div class="pdf-ctx-item" onclick="PDFPanel.showViewer(\'' + fileId + '\');PDFLibrary.hidePdfCtx()"><i class="fa fa-eye"></i> 열기</div>'
      + '<div class="pdf-ctx-item" onclick="PDFLibrary.renamePdf(\'' + fileId + '\')"><i class="fa fa-pen"></i> 이름 변경</div>'
      + '<div class="pdf-ctx-item pdf-ctx-danger" onclick="PDFLibrary.deletePdf(\'' + fileId + '\',\'' + safeName + '\')"><i class="fa fa-trash"></i> 삭제</div>';
    document.body.appendChild(menu);
    _positionCtx(menu, e);
    setTimeout(function(){ document.addEventListener('click', hidePdfCtx, { once: true }); }, 10);
  }

  function _positionCtx(menu, e){
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    requestAnimationFrame(function(){
      var r = menu.getBoundingClientRect();
      if(r.right > window.innerWidth) menu.style.left = (window.innerWidth - r.width - 8) + 'px';
      if(r.bottom > window.innerHeight) menu.style.top = (window.innerHeight - r.height - 8) + 'px';
    });
  }

  function hidePdfCtx(){
    var el = document.getElementById('pdfCtxMenu');
    if(el) el.remove();
  }

  // ── Persist / Restore ──
  function persistPdf(){
    try {
      localStorage.setItem('kjb2-pdf', JSON.stringify({
        pdfFolders: S.pdfFolders,
        pdfFiles: S.pdfFiles,
        curPdfFolder: S.curPdfFolder,
        openPdfFolders: Array.from(S.openPdfFolders)
      }));
    } catch(e){}
  }

  function restorePdf(){
    try {
      var d = JSON.parse(localStorage.getItem('kjb2-pdf') || '{}');
      if(d.pdfFolders && d.pdfFolders.length > 0) S.pdfFolders = d.pdfFolders;
      if(d.pdfFiles) S.pdfFiles = d.pdfFiles;
      if(d.curPdfFolder) S.curPdfFolder = d.curPdfFolder;
      if(d.openPdfFolders) S.openPdfFolders = new Set(d.openPdfFolders);
    } catch(e){}
  }

  // ── Helpers ──
  function _formatSize(bytes){
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function _esc(str){
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    render: render,
    uploadPdf: uploadPdf,
    newFolder: newFolder,
    createFolder: createFolder,
    renameFolder: renameFolder,
    deleteFolder: deleteFolder,
    deletePdf: deletePdf,
    renamePdf: renamePdf,
    showFolderCtx: showFolderCtx,
    showFileCtx: showFileCtx,
    hidePdfCtx: hidePdfCtx,
    persistPdf: persistPdf,
    restorePdf: restorePdf
  };
})();
