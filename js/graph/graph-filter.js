// graph-filter.js — Knowledge graph node/link type filters
// Color-coded toggle chips for filtering visible graph elements

var GraphFilter = (function(){
  var _activeTypes = new Set(['verse', 'note', 'pdf', 'bookmark', 'commentary']);
  var _activeLinkTypes = new Set(['reference', 'annotation', 'cross-reference', 'tag', 'embed']);
  var _minConnections = 0;

  var NODE_TYPES = [
    { id: 'verse',      label: null, icon: 'fa-book-bible', labelKey: 'graph.verse' },
    { id: 'note',       label: null, icon: 'fa-pen',        labelKey: 'graph.note' },
    { id: 'pdf',        label: null, icon: 'fa-file-pdf',   labelKey: 'graph.pdfNode' },
    { id: 'bookmark',   label: null, icon: 'fa-bookmark',   labelKey: 'graph.bookmark' },
    { id: 'commentary', label: null, icon: 'fa-scroll',     labelKey: 'graph.commNode' }
  ];

  function apply(graphData){
    var filteredNodes = graphData.nodes.filter(function(n){
      return _activeTypes.has(n.type);
    });

    var nodeUris = new Set(filteredNodes.map(function(n){ return n.uri; }));

    var filteredEdges = graphData.edges.filter(function(e){
      return nodeUris.has(e.source) && nodeUris.has(e.target) && _activeLinkTypes.has(e.type);
    });

    // Apply min connections filter
    if(_minConnections > 0){
      var connCount = {};
      filteredEdges.forEach(function(e){
        connCount[e.source] = (connCount[e.source] || 0) + 1;
        connCount[e.target] = (connCount[e.target] || 0) + 1;
      });
      filteredNodes = filteredNodes.filter(function(n){
        return (connCount[n.uri] || 0) >= _minConnections;
      });
    }

    return { nodes: filteredNodes, edges: filteredEdges };
  }

  function render(containerEl){
    var panel = document.createElement('div');
    panel.className = 'kg-filters';

    var html = '<div class="kg-filter-title">' + t('graph.filterNodes', '노드 필터') + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px">';

    NODE_TYPES.forEach(function(nt){
      var label = t(nt.labelKey, nt.id);
      var active = _activeTypes.has(nt.id);
      html += '<div class="kg-chip kg-chip-' + nt.id + (active ? ' active' : ' inactive') + '" onclick="GraphFilter.toggle(\'' + nt.id + '\')">'
        + '<span class="kg-chip-dot"></span>'
        + '<span>' + label + '</span>'
        + '</div>';
    });
    html += '</div>';

    panel.innerHTML = html;
    containerEl.appendChild(panel);
  }

  function toggle(type){
    if(_activeTypes.has(type)){
      _activeTypes.delete(type);
    } else {
      _activeTypes.add(type);
    }

    // Re-render graph
    if(typeof KnowledgeGraph !== 'undefined' && KnowledgeGraph.isOpen()){
      KnowledgeGraph.close();
      // Small delay for DOM cleanup
      setTimeout(function(){
        KnowledgeGraph.show(KnowledgeGraph._centerUri || null, { depth: 3 });
      }, 50);
    }
  }

  function toggleLinkType(type){
    if(_activeLinkTypes.has(type)) _activeLinkTypes.delete(type);
    else _activeLinkTypes.add(type);
  }

  function setMinConnections(n){
    _minConnections = n || 0;
  }

  function getActiveTypes(){ return _activeTypes; }
  function getActiveLinkTypes(){ return _activeLinkTypes; }

  return {
    apply: apply,
    render: render,
    toggle: toggle,
    toggleLinkType: toggleLinkType,
    setMinConnections: setMinConnections,
    getActiveTypes: getActiveTypes,
    getActiveLinkTypes: getActiveLinkTypes
  };
})();
