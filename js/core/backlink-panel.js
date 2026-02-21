// backlink-panel.js — Universal backlink panel for any URI
// Shows grouped backlinks: notes | verses | PDF annotations | highlight memos

var BacklinkPanel = (function(){

  // Render backlinks for a given URI into a container element
  function render(uri, containerEl){
    if(!containerEl) return;
    if(!uri || typeof LinkRegistry === 'undefined' || !LinkRegistry.isReady()){
      containerEl.innerHTML = '<div class="bl-empty" style="padding:12px;text-align:center;color:var(--text3);font-size:12px">' + t('notes.backlinks', '백링크') + ' (0)</div>';
      return;
    }

    var links = LinkRegistry.getIncoming(uri);
    if(!links.length){
      containerEl.innerHTML = '<div class="bl-empty" style="padding:12px;text-align:center;color:var(--text3);font-size:12px">' + t('notes.backlinks', '백링크') + ' (0)</div>';
      return;
    }

    // Group by source type
    var groups = { note: [], verse: [], pdf: [], strong: [], other: [] };
    links.forEach(function(link){
      var parsed = TyrannusURI.parse(link.sourceUri);
      var type = parsed ? parsed.type : 'other';
      if(groups[type]) groups[type].push(link);
      else groups.other.push(link);
    });

    var html = '<div class="bl-header" style="padding:8px 12px;font-size:11px;font-weight:700;color:var(--text2)">'
      + '<i class="fa fa-link" style="margin-right:4px"></i>' + t('notes.backlinks', '백링크')
      + ' <span style="color:var(--accent-color,var(--gold))">(' + links.length + ')</span></div>';

    // Notes group
    if(groups.note.length){
      html += _renderGroup(t('panel.notes', '노트'), 'fa-pen', groups.note, function(link){
        var p = TyrannusURI.parse(link.sourceUri);
        var noteId = p ? p.segments[0] : null;
        if(!noteId) return null;
        var note = S.notes.find(function(n){ return n.id === noteId; });
        if(!note) return null;
        var folder = S.folders.find(function(f){ return f.id === note.folderId; });
        return {
          label: note.title || t('notes.untitled', '제목 없음'),
          sub: folder ? folder.name : '',
          onclick: 'NavigationRouter.navigateTo(\'' + link.sourceUri + '\')'
        };
      });
    }

    // Verses group
    if(groups.verse.length){
      html += _renderGroup(t('graph.verse', '구절'), 'fa-book-bible', groups.verse, function(link){
        var key = TyrannusURI.toLegacyVerseKey(link.sourceUri);
        if(!key) return null;
        var parts = key.split('_');
        return {
          label: parts[0] + ' ' + parts[1] + ':' + (parts[2] || ''),
          sub: '',
          onclick: 'NavigationRouter.navigateTo(\'' + link.sourceUri + '\')'
        };
      });
    }

    // PDF group
    if(groups.pdf.length){
      html += _renderGroup('PDF', 'fa-file-pdf', groups.pdf, function(link){
        return {
          label: link.metadata.label || 'PDF annotation',
          sub: '',
          onclick: 'NavigationRouter.navigateTo(\'' + link.sourceUri + '\')'
        };
      });
    }

    containerEl.innerHTML = html;
  }

  function _renderGroup(title, icon, links, mapFn){
    var items = links.map(mapFn).filter(Boolean);
    if(!items.length) return '';

    var html = '<div class="bl-group">';
    html += '<div class="bl-group-head" style="padding:4px 12px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">'
      + '<i class="fa ' + icon + '" style="margin-right:4px;width:12px;text-align:center"></i>' + title
      + ' <span style="opacity:.6">(' + items.length + ')</span></div>';

    items.forEach(function(item){
      html += '<div class="bl-entry" onclick="' + item.onclick + '" style="padding:6px 12px 6px 28px;cursor:pointer;font-size:12px;color:var(--text);display:flex;align-items:center;gap:6px;transition:background .1s"'
        + ' onmouseenter="this.style.background=\'var(--bg3)\'" onmouseleave="this.style.background=\'transparent\'">'
        + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.label + '</span>'
        + (item.sub ? '<span style="font-size:10px;color:var(--text3);flex-shrink:0">' + item.sub + '</span>' : '')
        + '</div>';
    });

    html += '</div>';
    return html;
  }

  // Render backlinks for a verse key (convenience)
  function renderForVerse(verseKey, containerEl){
    var uri = TyrannusURI.fromLegacyVerseKey(verseKey);
    if(uri) render(uri, containerEl);
  }

  return {
    render: render,
    renderForVerse: renderForVerse
  };
})();
