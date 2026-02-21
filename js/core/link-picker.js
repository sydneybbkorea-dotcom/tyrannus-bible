// link-picker.js — Universal link picker modal
// Unified modal replacing openNoteLink() + openVersePick()
// Tabs: [Verse] [Note] [PDF] [Strong's] [Tag] [External]

var LinkPicker = (function(){
  var _resolve = null;
  var _activeTab = 'verse';
  var _savedRange = null;

  function open(options){
    options = options || {};
    _activeTab = options.defaultTab || 'verse';

    // Save cursor position
    var sel = window.getSelection();
    if(sel && sel.rangeCount > 0){
      var r = sel.getRangeAt(0);
      var nc = document.getElementById('noteContent');
      if(nc && nc.contains(r.commonAncestorContainer)){
        _savedRange = r.cloneRange();
      }
    }

    _renderModal();
    var modal = document.getElementById('linkPickerModal');
    if(modal) modal.style.display = 'flex';
    _switchTab(_activeTab);

    return new Promise(function(resolve){
      _resolve = resolve;
    });
  }

  function close(result){
    var modal = document.getElementById('linkPickerModal');
    if(modal) modal.style.display = 'none';
    if(_resolve){
      _resolve(result || null);
      _resolve = null;
    }
  }

  function _renderModal(){
    var modal = document.getElementById('linkPickerModal');
    if(modal) return;

    modal = document.createElement('div');
    modal.id = 'linkPickerModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:none;align-items:center;justify-content:center';
    modal.onclick = function(e){ if(e.target === modal) close(null); };

    modal.innerHTML = '<div style="background:var(--bg-surface,var(--bg3));border:1px solid var(--border-color,var(--border2));border-radius:12px;width:420px;max-height:80vh;display:flex;flex-direction:column;box-shadow:var(--shadow-lg,var(--shadow))">'
      + '<div style="padding:12px 16px;border-bottom:1px solid var(--border-color,var(--border));display:flex;justify-content:space-between;align-items:center">'
      + '<div style="font-size:13px;font-weight:600;color:var(--text-primary,var(--text))"><i class="fa fa-link" style="color:var(--accent-color,var(--gold));margin-right:6px"></i>링크 삽입</div>'
      + '<span onclick="LinkPicker.close()" style="cursor:pointer;color:var(--text-muted,var(--text3));font-size:16px;padding:4px">&times;</span>'
      + '</div>'
      // Tabs
      + '<div id="lpTabs" style="display:flex;border-bottom:1px solid var(--border-color,var(--border));padding:0 8px;gap:0"></div>'
      // Search
      + '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color,var(--border))">'
      + '<input id="lpSearch" type="text" placeholder="검색..." style="width:100%;background:var(--bg-secondary,var(--bg2));border:1px solid var(--border-color,var(--border));border-radius:6px;padding:6px 10px;font-size:12px;color:var(--text-primary,var(--text));outline:none" oninput="LinkPicker._search(this.value)">'
      + '</div>'
      // Results
      + '<div id="lpResults" style="overflow-y:auto;flex:1;max-height:50vh;padding:4px 0"></div>'
      // Footer
      + '<div style="padding:8px 12px;border-top:1px solid var(--border-color,var(--border));text-align:right">'
      + '<button onclick="LinkPicker.close()" style="padding:5px 14px;border-radius:6px;border:1px solid var(--border-color,var(--border));background:var(--bg-tertiary,var(--bg4));color:var(--text-secondary,var(--text2));font-size:12px;cursor:pointer">' + t('modal.cancel', '취소') + '</button>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modal);
  }

  function _switchTab(tab){
    _activeTab = tab;
    var tabsEl = document.getElementById('lpTabs');
    if(!tabsEl) return;

    var tabs = [
      { id: 'verse', label: t('editor.verseLink', '구절'), icon: 'fa-book-open' },
      { id: 'note',  label: t('editor.noteLink', '노트'), icon: 'fa-pen' },
      { id: 'strong', label: t('panel.strongDict', '원어'), icon: 'fa-language' },
      { id: 'tag',   label: t('graph.note', '태그'),  icon: 'fa-tag' },
      { id: 'url',   label: t('editor.urlLink', '링크'), icon: 'fa-globe' }
    ];

    tabsEl.innerHTML = tabs.map(function(t){
      var active = t.id === tab ? 'color:var(--accent-color,var(--gold));border-bottom:2px solid var(--accent-color,var(--gold))' : 'color:var(--text-muted,var(--text3));border-bottom:2px solid transparent';
      return '<button onclick="LinkPicker._switchTab(\'' + t.id + '\')" style="padding:8px 12px;font-size:11px;font-weight:600;cursor:pointer;background:none;border:none;' + active + ';transition:all .15s">'
        + '<i class="fa ' + t.icon + '" style="margin-right:3px"></i>' + t.label + '</button>';
    }).join('');

    document.getElementById('lpSearch').value = '';
    _search('');
  }

  function _search(query){
    var results = document.getElementById('lpResults');
    if(!results) return;
    query = (query || '').toLowerCase().trim();

    switch(_activeTab){
      case 'verse': _searchVerses(results, query); break;
      case 'note':  _searchNotes(results, query); break;
      case 'strong': _searchStrongs(results, query); break;
      case 'tag':   _searchTags(results, query); break;
      case 'url':   _showUrlInput(results, query); break;
    }
  }

  function _searchVerses(el, q){
    // Show book/chapter selector if no query
    if(!q){
      var books = typeof BOOKS !== 'undefined' ? [...BOOKS.OT, ...BOOKS.NT] : [];
      el.innerHTML = books.slice(0, 20).map(function(b){
        return '<div class="lp-item" onclick="LinkPicker._selectBook(\'' + b + '\')" style="padding:8px 14px;cursor:pointer;font-size:13px;color:var(--text-primary,var(--text));border-bottom:1px solid var(--border-color,var(--border))" onmouseenter="this.style.background=\'var(--bg-tertiary,var(--bg3))\'" onmouseleave="this.style.background=\'transparent\'">'
          + '<i class="fa fa-book-bible" style="color:var(--accent-color,var(--gold));margin-right:8px;width:14px"></i>' + b + '</div>';
      }).join('');
      return;
    }

    // Search in book names
    var books = typeof BOOKS !== 'undefined' ? [...BOOKS.OT, ...BOOKS.NT] : [];
    var matches = books.filter(function(b){ return b.toLowerCase().includes(q); });
    el.innerHTML = matches.map(function(b){
      return '<div class="lp-item" onclick="LinkPicker._selectBook(\'' + b + '\')" style="padding:8px 14px;cursor:pointer;font-size:13px;color:var(--text-primary,var(--text));border-bottom:1px solid var(--border-color,var(--border))" onmouseenter="this.style.background=\'var(--bg-tertiary,var(--bg3))\'" onmouseleave="this.style.background=\'transparent\'">'
        + '<i class="fa fa-book-bible" style="color:var(--accent-color,var(--gold));margin-right:8px;width:14px"></i>' + b + '</div>';
    }).join('') || '<div style="padding:16px;text-align:center;color:var(--text-muted,var(--text3));font-size:12px">결과 없음</div>';
  }

  function _selectBook(book){
    // Build chapter/verse selector
    var chCount = (typeof CHCNT !== 'undefined') ? (CHCNT[book] || 1) : 50;
    var results = document.getElementById('lpResults');
    var html = '<div style="padding:8px 14px;font-size:12px;font-weight:600;color:var(--text-secondary,var(--text2))"><i class="fa fa-chevron-left" style="cursor:pointer;margin-right:6px" onclick="LinkPicker._search(\'\')"></i>' + book + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px 12px">';
    for(var ch = 1; ch <= chCount; ch++){
      html += '<button onclick="LinkPicker._selectVerse(\'' + book + '\',' + ch + ')" style="width:36px;height:32px;border-radius:4px;border:1px solid var(--border-color,var(--border));background:var(--bg-secondary,var(--bg2));color:var(--text-primary,var(--text));font-size:11px;cursor:pointer">' + ch + '</button>';
    }
    html += '</div>';
    results.innerHTML = html;
  }

  function _selectVerse(book, ch, v){
    var key = v ? book + '_' + ch + '_' + v : book + '_' + ch + '_';
    var ref = v ? book + ' ' + ch + ':' + v : book + ' ' + ch + '장';
    var uri = TyrannusURI.verse(book, ch, v);
    close({ uri: uri, label: ref, type: 'verse', legacyKey: key });
  }

  function _searchNotes(el, q){
    var notes = S.notes || [];
    if(q){
      notes = notes.filter(function(n){
        return (n.title || '').toLowerCase().includes(q);
      });
    }
    notes = notes.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).slice(0, 30);

    if(!notes.length){
      el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted,var(--text3));font-size:12px">' + t('noteLink.noNotes', '작성된 노트가 없어요') + '</div>';
      return;
    }

    el.innerHTML = notes.map(function(n){
      var folder = S.folders.find(function(f){ return f.id === n.folderId; });
      return '<div class="lp-item" onclick="LinkPicker._selectNote(\'' + n.id + '\',\'' + (n.title || '').replace(/'/g, "\\'") + '\')" style="padding:8px 14px;cursor:pointer;font-size:13px;color:var(--text-primary,var(--text));border-bottom:1px solid var(--border-color,var(--border));display:flex;align-items:center;gap:8px" onmouseenter="this.style.background=\'var(--bg-tertiary,var(--bg3))\'" onmouseleave="this.style.background=\'transparent\'">'
        + '<i class="fa fa-pen" style="color:var(--accent-color,var(--gold));width:14px;font-size:11px"></i>'
        + '<div style="flex:1;min-width:0"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (n.title || t('notes.untitled', '제목 없음')) + '</div>'
        + '<div style="font-size:10px;color:var(--text-muted,var(--text3))">' + (folder ? folder.name : '') + '</div></div></div>';
    }).join('');
  }

  function _selectNote(noteId, noteTitle){
    var uri = TyrannusURI.note(noteId);
    close({ uri: uri, label: noteTitle || t('notes.untitled', '제목 없음'), type: 'note', noteId: noteId });
  }

  function _searchStrongs(el, q){
    if(!q){
      el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted,var(--text3));font-size:12px"><i class="fa fa-language" style="font-size:20px;display:block;margin-bottom:8px;opacity:.5"></i>스트롱 번호를 입력하세요<br>(예: H1, G3056)</div>';
      return;
    }
    // Quick Strong's code validation
    var code = q.toUpperCase();
    if(/^[HG]\d+$/.test(code)){
      var uri = TyrannusURI.strong(code);
      el.innerHTML = '<div class="lp-item" onclick="LinkPicker.close({uri:\'' + uri + '\',label:\'' + code + '\',type:\'strong\'})" style="padding:12px 14px;cursor:pointer;font-size:13px;color:var(--text-primary,var(--text));border-bottom:1px solid var(--border-color,var(--border))" onmouseenter="this.style.background=\'var(--bg-tertiary,var(--bg3))\'" onmouseleave="this.style.background=\'transparent\'">'
        + '<i class="fa fa-language" style="color:var(--accent-color,var(--gold));margin-right:8px"></i>' + code + '</div>';
    } else {
      el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted,var(--text3));font-size:12px">H 또는 G로 시작하는 번호를 입력하세요</div>';
    }
  }

  function _searchTags(el, q){
    // Collect all tags from notes
    var tagSet = new Set();
    (S.notes || []).forEach(function(n){
      (n.tags || []).forEach(function(t){ tagSet.add(t); });
    });
    var tags = Array.from(tagSet);
    if(q) tags = tags.filter(function(t){ return t.toLowerCase().includes(q); });

    if(!tags.length){
      el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted,var(--text3));font-size:12px">태그 없음</div>';
      return;
    }

    el.innerHTML = tags.map(function(tag){
      var uri = TyrannusURI.tag(tag);
      return '<div class="lp-item" onclick="LinkPicker.close({uri:\'' + uri + '\',label:\'' + tag.replace(/'/g, "\\'") + '\',type:\'tag\'})" style="padding:8px 14px;cursor:pointer;font-size:13px;color:var(--text-primary,var(--text));border-bottom:1px solid var(--border-color,var(--border))" onmouseenter="this.style.background=\'var(--bg-tertiary,var(--bg3))\'" onmouseleave="this.style.background=\'transparent\'">'
        + '<i class="fa fa-tag" style="color:var(--accent-color,var(--gold));margin-right:8px;width:14px"></i>' + tag + '</div>';
    }).join('');
  }

  function _showUrlInput(el, q){
    el.innerHTML = '<div style="padding:16px 14px">'
      + '<div style="font-size:12px;font-weight:600;color:var(--text-secondary,var(--text2));margin-bottom:8px">외부 URL 입력</div>'
      + '<input id="lpUrlInput" type="url" placeholder="https://..." value="' + (q || '') + '" style="width:100%;background:var(--bg-secondary,var(--bg2));border:1px solid var(--border-color,var(--border));border-radius:6px;padding:8px 10px;font-size:13px;color:var(--text-primary,var(--text));outline:none;margin-bottom:8px">'
      + '<input id="lpUrlLabel" type="text" placeholder="표시 텍스트" style="width:100%;background:var(--bg-secondary,var(--bg2));border:1px solid var(--border-color,var(--border));border-radius:6px;padding:8px 10px;font-size:13px;color:var(--text-primary,var(--text));outline:none;margin-bottom:12px">'
      + '<button onclick="var u=document.getElementById(\'lpUrlInput\').value;var l=document.getElementById(\'lpUrlLabel\').value||u;if(u)LinkPicker.close({uri:u,label:l,type:\'url\'})" style="padding:6px 16px;border-radius:6px;border:none;background:var(--accent-color,var(--gold));color:#fff;font-size:12px;font-weight:600;cursor:pointer">' + t('modal.insert', '삽입') + '</button>'
      + '</div>';
  }

  // Get saved range for cursor restoration
  function getSavedRange(){ return _savedRange; }

  return {
    open: open,
    close: close,
    getSavedRange: getSavedRange,
    _switchTab: _switchTab,
    _search: _search,
    _selectBook: _selectBook,
    _selectVerse: _selectVerse,
    _selectNote: _selectNote
  };
})();
