// knowledge-graph.js — D3.js force-directed knowledge graph visualization
// Builds comprehensive graph from ALL app data: highlights, memos, notes, PDFs, tags.

var KnowledgeGraph = (function(){
  var D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
  var _d3 = null;
  var _overlay = null;
  var _svg = null;
  var _simulation = null;
  var _width = 0;
  var _height = 0;
  var _centerUri = null;
  var _mode = null; // 'overlay' | 'inline'

  // Node type → color mapping
  var NODE_COLORS = {
    verse:      '#EAB308',
    note:       '#3B82F6',
    pdf:        '#EF4444',
    bookmark:   '#22C55E',
    commentary: '#A855F7',
    unknown:    '#6B7280'
  };

  // Node type → base radius
  var NODE_RADIUS = {
    verse: 6, note: 8, pdf: 7, bookmark: 6, commentary: 6, unknown: 4
  };

  function _loadD3(){
    if(_d3) return Promise.resolve(_d3);
    if(window.d3) { _d3 = window.d3; return Promise.resolve(_d3); }
    return new Promise(function(resolve, reject){
      var script = document.createElement('script');
      script.src = D3_URL;
      script.onload = function(){ _d3 = window.d3; resolve(_d3); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /* ── Resolve center URI from current state ── */
  function _resolveUri(centerUri){
    if(centerUri) return centerUri;
    if(typeof TyrannusURI !== 'undefined'){
      if(S.curNoteId) return TyrannusURI.note(S.curNoteId);
      if(S.book && S.ch && S.vs) return TyrannusURI.verse(S.book, S.ch, S.vs);
      if(S.book && S.ch) return TyrannusURI.verse(S.book, S.ch, 1);
    }
    return null;
  }

  /* ══════════════════════════════════════════════
     Build comprehensive graph from ALL app data
  ══════════════════════════════════════════════ */
  function _buildFullGraph(){
    var nodeMap = {};  // uri → { uri, type }
    var edgeMap = {};  // dedupe key → { source, target, type }

    function addNode(uri, type){
      if(!nodeMap[uri]) nodeMap[uri] = { uri: uri, type: type };
    }
    function addEdge(src, tgt, type){
      var key = src + '|' + tgt + '|' + type;
      var keyRev = tgt + '|' + src + '|' + type;
      if(!edgeMap[key] && !edgeMap[keyRev]){
        edgeMap[key] = { source: src, target: tgt, type: type, id: 'e_' + Object.keys(edgeMap).length };
      }
    }

    // Tag → items collector (tags are invisible, used only to connect items)
    var tagMembers = {}; // tagName → [uri, uri, ...]

    function _tagCollect(tagName, uri){
      if(!tagMembers[tagName]) tagMembers[tagName] = [];
      if(tagMembers[tagName].indexOf(uri) === -1) tagMembers[tagName].push(uri);
    }

    // 1) Highlighted verses → verse nodes
    var hl = S.hl || {};
    Object.keys(hl).forEach(function(key){
      var uri = TyrannusURI.fromLegacyVerseKey(key);
      if(uri) addNode(uri, 'verse');
    });

    // 2) Verse memos → verse nodes
    var vm = S.verseMemo || {};
    Object.keys(vm).forEach(function(key){
      var uri = TyrannusURI.fromLegacyVerseKey(key);
      if(uri) addNode(uri, 'verse');
    });

    // 3) Bookmarks → bookmark nodes
    var bk = S.bk || new Set();
    (bk.forEach ? bk : new Set(bk)).forEach(function(key){
      var uri = TyrannusURI.fromLegacyVerseKey(key);
      if(uri) addNode(uri, 'bookmark');
    });

    // 4) Highlight memos — collect tags for verse grouping
    var hlMemo = S.hlMemo || {};
    var hlRanges = S.hlRanges || {};
    Object.keys(hlMemo).forEach(function(gid){
      var memo = hlMemo[gid];
      var tags = memo.tags || [];

      Object.keys(hlRanges).forEach(function(vKey){
        var ranges = hlRanges[vKey];
        if(!Array.isArray(ranges)) return;
        ranges.forEach(function(r){
          if(r.gid === gid){
            var verseUri = TyrannusURI.fromLegacyVerseKey(vKey);
            if(verseUri){
              addNode(verseUri, 'verse');
              tags.forEach(function(t){ _tagCollect(t, verseUri); });
            }
          }
        });
      });
    });

    // 5) Notes → note nodes + edges to referenced verses; collect tags
    var notes = S.notes || [];
    notes.forEach(function(n){
      var noteUri = TyrannusURI.note(n.id);
      addNode(noteUri, 'note');

      // Note → verse references
      if(n.vRefs && n.vRefs.length){
        n.vRefs.forEach(function(ref){
          var vUri = TyrannusURI.fromLegacyVerseKey(ref);
          if(vUri){
            addNode(vUri, 'verse');
            addEdge(noteUri, vUri, 'reference');
          }
        });
      }

      // Collect note tags (connect later)
      if(n.tags && n.tags.length){
        n.tags.forEach(function(t){ _tagCollect(t, noteUri); });
      }

      // Note → note links + PDF annotations (from HTML)
      if(n.content){
        var tmp = document.createElement('div');
        tmp.innerHTML = n.content;
        var nlinks = tmp.querySelectorAll('.nlink');
        for(var i = 0; i < nlinks.length; i++){
          var tid = nlinks[i].dataset.noteid;
          if(tid){
            var tUri = TyrannusURI.note(tid);
            addNode(tUri, 'note');
            addEdge(noteUri, tUri, 'reference');
          }
        }
        var pdfCites = tmp.querySelectorAll('.pdf-cite[data-uri]');
        for(var j = 0; j < pdfCites.length; j++){
          var pUri = pdfCites[j].dataset.uri;
          if(pUri){
            addNode(pUri, 'pdf');
            addEdge(noteUri, pUri, 'annotation');
          }
        }
      }
    });

    // 6) PDF files → pdf nodes
    var pdfs = S.pdfFiles || [];
    pdfs.forEach(function(f){
      var pdfUri = TyrannusURI.pdf(f.id);
      addNode(pdfUri, 'pdf');
    });

    // 7) Tag-based grouping: connect all items sharing the same tag
    Object.keys(tagMembers).forEach(function(tagName){
      var members = tagMembers[tagName];
      for(var i = 0; i < members.length; i++){
        for(var j = i + 1; j < members.length; j++){
          addEdge(members[i], members[j], 'tag');
        }
      }
    });

    // 8) LinkRegistry links (additional connections)
    if(typeof LinkRegistry !== 'undefined' && LinkRegistry.isReady()){
      var allUris = Object.keys(nodeMap);
      allUris.forEach(function(uri){
        LinkRegistry.getOutgoing(uri).forEach(function(link){
          var parsed = TyrannusURI.parse(link.targetUri);
          if(parsed && parsed.type !== 'tag') addNode(link.targetUri, parsed.type);
          addEdge(link.sourceUri, link.targetUri, link.type);
        });
        LinkRegistry.getIncoming(uri).forEach(function(link){
          var parsed = TyrannusURI.parse(link.sourceUri);
          if(parsed && parsed.type !== 'tag') addNode(link.sourceUri, parsed.type);
          addEdge(link.sourceUri, link.targetUri, link.type);
        });
      });
    }

    return {
      nodes: Object.keys(nodeMap).map(function(k){ return nodeMap[k]; }),
      edges: Object.keys(edgeMap).map(function(k){ return edgeMap[k]; })
    };
  }

  /* ══════════ Fullscreen overlay (backlink "그래프 보기") ══════════ */
  function show(centerUri, options){
    options = options || {};
    var depth = options.depth || 3;
    _centerUri = centerUri;
    _mode = 'overlay';

    return _loadD3().then(function(d3){
      if(typeof LinkRegistry === 'undefined' || !LinkRegistry.isReady()){
        toast('LinkRegistry not ready');
        return;
      }

      var graphData = LinkRegistry.getGraph(centerUri, depth);
      if(!graphData.nodes.length){
        toast('연결된 데이터가 없습니다');
        return;
      }

      if(typeof GraphFilter !== 'undefined'){
        graphData = GraphFilter.apply(graphData);
      }

      _renderOverlay();
      var body = document.getElementById('kgBody');
      _renderGraph(d3, graphData, body);
    });
  }

  function _renderOverlay(){
    if(_overlay) { _overlay.style.display = 'flex'; return; }

    _overlay = document.createElement('div');
    _overlay.id = 'kgOverlay';
    _overlay.className = 'kg-overlay';

    _overlay.innerHTML = '<div class="kg-header">'
      + '<div class="kg-title"><i class="fa fa-project-diagram"></i> <span data-i18n="graph.title">' + t('graph.title', '지식 그래프') + '</span></div>'
      + '<div class="kg-close" onclick="KnowledgeGraph.close()"><i class="fa fa-times"></i></div>'
      + '</div>'
      + '<div class="kg-body" id="kgBody"></div>';

    document.body.appendChild(_overlay);
  }

  /* ══════════ Inline panel rendering (full graph) ══════════ */
  function showInline(centerUri){
    _centerUri = _resolveUri(centerUri);
    _mode = 'inline';

    return _loadD3().then(function(d3){
      var host = document.getElementById('kgInlineHost');
      if(!host) return;

      var graphData = _buildFullGraph();

      if(!graphData.nodes.length){
        host.innerHTML = '<div class="kg-inline-empty"><i class="fa fa-project-diagram"></i><br>연결된 데이터가 없습니다<br><span style="font-size:10px;margin-top:4px;opacity:.5">하이라이트, 메모, 노트를 작성하면<br>그래프가 나타납니다</span></div>';
        return;
      }

      // Apply filters
      if(typeof GraphFilter !== 'undefined'){
        graphData = GraphFilter.apply(graphData);
      }

      _renderGraph(d3, graphData, host);
    });
  }

  /* ══════════ Shared graph renderer ══════════ */
  function _renderGraph(d3, data, container){
    if(!container) return;
    container.innerHTML = '';

    _width = container.clientWidth;
    _height = container.clientHeight;
    if(_width < 10 || _height < 10){
      requestAnimationFrame(function(){ _renderGraph(d3, data, container); });
      return;
    }

    // Enrich nodes
    data.nodes.forEach(function(n){
      n.connections = 0;
      data.edges.forEach(function(e){
        var src = (typeof e.source === 'object') ? e.source.uri : e.source;
        var tgt = (typeof e.target === 'object') ? e.target.uri : e.target;
        if(src === n.uri || tgt === n.uri) n.connections++;
      });
      n.label = _getLabel(n);
      n.radius = (NODE_RADIUS[n.type] || 4) + Math.min(n.connections * 0.5, 8);
      n.isCenter = (n.uri === _centerUri);
    });

    var nodes = data.nodes;
    var links = data.edges.map(function(e){
      return { source: e.source, target: e.target, type: e.type, id: e.id };
    });

    _svg = d3.select(container).append('svg')
      .attr('width', _width)
      .attr('height', _height);

    // Zoom
    var zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', function(event){ g.attr('transform', event.transform); });

    _svg.call(zoom);

    var g = _svg.append('g');

    // Edges
    var link = g.selectAll('.kg-edge')
      .data(links)
      .enter().append('line')
      .attr('class', function(d){ return 'kg-edge kg-edge-' + (d.type || 'reference'); });

    // Drag state tracking (to distinguish click vs drag)
    var _dragged = false;

    // Nodes
    var node = g.selectAll('.kg-node')
      .data(nodes)
      .enter().append('g')
      .attr('class', function(d){ return 'kg-node kg-node-' + d.type + (d.isCenter ? ' kg-node-center' : ''); })
      .call(d3.drag()
        .on('start', function(event, d){
          _dragged = false;
          if(!event.active) _simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function(event, d){
          _dragged = true;
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', function(event, d){
          if(!event.active) _simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', function(d){ return d.radius; });

    node.append('text')
      .attr('dy', function(d){ return d.radius + 12; })
      .text(function(d){ return d.label; })
      .style('font-size', '10px');

    // Click → navigate (only if not dragged)
    node.on('click', function(event, d){
      if(_dragged) return;
      event.stopPropagation();
      _navigateToNode(d);
    });

    // Double-click → re-center graph on this node
    node.on('dblclick', function(event, d){
      event.stopPropagation();
      if(_mode === 'inline'){
        showInline(d.uri);
      } else {
        close();
        show(d.uri, { depth: 3 });
      }
    });

    // Force simulation — tuned for graph size
    var chargeStrength = nodes.length > 80 ? -120 : nodes.length > 30 ? -180 : -200;
    var linkDist = nodes.length > 80 ? 60 : nodes.length > 30 ? 70 : 80;

    _simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(function(d){ return d.uri; }).distance(linkDist))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(_width / 2, _height / 2))
      .force('collision', d3.forceCollide().radius(function(d){ return d.radius + 4; }))
      .on('tick', function(){
        link
          .attr('x1', function(d){ return d.source.x; })
          .attr('y1', function(d){ return d.source.y; })
          .attr('x2', function(d){ return d.target.x; })
          .attr('y2', function(d){ return d.target.y; });

        node.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
      });

    // Filter panel
    if(typeof GraphFilter !== 'undefined'){
      GraphFilter.render(container);
    }
  }

  /* ── Navigate to node by type ── */
  function _navigateToNode(d){
    var p = TyrannusURI.parse(d.uri);
    if(!p) return;

    switch(p.type){
      case 'verse':
      case 'bookmark':
        var book = p.segments[0], ch = parseInt(p.segments[1]), v = p.segments[2] ? parseInt(p.segments[2]) : null;
        if(typeof openBibleTab === 'function'){
          openBibleTab(book, ch, v);
        } else {
          S.book = book; S.ch = ch;
          if(v){ S.selV = v; S.selVSet = new Set([v]); }
          if(typeof renderBible === 'function') renderBible();
        }
        toast((book + ' ' + ch + (v ? ':' + v : '')) + ' 이동');
        break;

      case 'note':
        var noteId = p.segments[0];
        if(typeof loadNote === 'function') loadNote(noteId, true);
        if(typeof openPanel === 'function') openPanel('notes');
        if(typeof switchSub === 'function') switchSub('notes');
        break;

      case 'pdf':
        var pdfId = p.segments[0];
        var page = (p.segments[1] === 'page' && p.segments[2]) ? parseInt(p.segments[2]) : null;
        if(typeof PDFViewer !== 'undefined') PDFViewer.open(pdfId, page);
        else if(typeof togglePdfPanel === 'function') togglePdfPanel();
        break;

      default:
        if(typeof NavigationRouter !== 'undefined') NavigationRouter.navigateTo(d.uri);
    }
  }

  function _getLabel(node){
    var p = TyrannusURI.parse(node.uri);
    if(!p) return node.uri.split('/').pop();

    switch(p.type){
      case 'verse':
      case 'bookmark':
        return p.segments.join(' ');
      case 'note':
        var noteId = p.segments[0];
        var n = S.notes ? S.notes.find(function(x){ return x.id === noteId; }) : null;
        return n ? (n.title || '').slice(0, 15) : noteId.slice(0, 10);
      case 'pdf':
        var pdfId = p.segments[0];
        var pf = S.pdfFiles ? S.pdfFiles.find(function(x){ return x.id === pdfId; }) : null;
        return pf ? (pf.name || 'PDF').slice(0, 15) : 'PDF';
      default:
        return p.type;
    }
  }

  function close(){
    if(_simulation) _simulation.stop();
    if(_overlay) _overlay.style.display = 'none';
  }

  function isOpen(){
    return _overlay && _overlay.style.display !== 'none';
  }

  return {
    show: show,
    showInline: showInline,
    close: close,
    isOpen: isOpen
  };
})();
