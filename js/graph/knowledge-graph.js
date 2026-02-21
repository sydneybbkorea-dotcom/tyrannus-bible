// knowledge-graph.js — D3.js force-directed knowledge graph visualization
// Lazy loads D3.js from CDN. SVG rendering with interactive nodes.

var KnowledgeGraph = (function(){
  var D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
  var _d3 = null;
  var _overlay = null;
  var _svg = null;
  var _simulation = null;
  var _width = 0;
  var _height = 0;
  var _centerUri = null;

  // Node type → color mapping
  var NODE_COLORS = {
    verse:      '#EAB308',
    note:       '#3B82F6',
    pdf:        '#EF4444',
    strong:     '#22C55E',
    commentary: '#A855F7',
    tag:        '#F97316',
    unknown:    '#6B7280'
  };

  // Node type → base radius
  var NODE_RADIUS = {
    verse: 6, note: 8, pdf: 7, strong: 5, commentary: 6, tag: 5, unknown: 4
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

  function show(centerUri, options){
    options = options || {};
    var depth = options.depth || 3;
    _centerUri = centerUri;

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

      // Apply filters
      if(typeof GraphFilter !== 'undefined'){
        graphData = GraphFilter.apply(graphData);
      }

      _renderOverlay();
      _renderGraph(d3, graphData);
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

  function _renderGraph(d3, data){
    var body = document.getElementById('kgBody');
    if(!body) return;
    body.innerHTML = '';

    _width = body.clientWidth;
    _height = body.clientHeight;

    // Enrich nodes with labels and connection counts
    var nodeMap = {};
    data.nodes.forEach(function(n){ nodeMap[n.uri] = n; });

    // Count connections per node
    data.nodes.forEach(function(n){
      n.connections = 0;
      data.edges.forEach(function(e){
        if(e.source === n.uri || e.target === n.uri) n.connections++;
      });
      n.label = _getLabel(n);
      n.radius = (NODE_RADIUS[n.type] || 4) + Math.min(n.connections * 0.5, 8);
      n.isCenter = n.uri === _centerUri;
    });

    // Build D3 graph
    var nodes = data.nodes;
    var links = data.edges.map(function(e){
      return { source: e.source, target: e.target, type: e.type, id: e.id };
    });

    _svg = d3.select(body).append('svg')
      .attr('width', _width)
      .attr('height', _height);

    // Zoom behavior
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

    // Nodes
    var node = g.selectAll('.kg-node')
      .data(nodes)
      .enter().append('g')
      .attr('class', function(d){ return 'kg-node kg-node-' + d.type + (d.isCenter ? ' kg-node-center' : ''); })
      .call(d3.drag()
        .on('start', function(event, d){
          if(!event.active) _simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function(event, d){
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

    // Click → navigate
    node.on('click', function(event, d){
      if(typeof NavigationRouter !== 'undefined'){
        NavigationRouter.navigateTo(d.uri);
      }
    });

    // Double-click → re-center
    node.on('dblclick', function(event, d){
      event.stopPropagation();
      close();
      show(d.uri, { depth: 3 });
    });

    // Force simulation
    _simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(function(d){ return d.uri; }).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
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

    // Render filter panel
    if(typeof GraphFilter !== 'undefined'){
      GraphFilter.render(body);
    }
  }

  function _getLabel(node){
    var p = TyrannusURI.parse(node.uri);
    if(!p) return node.uri.split('/').pop();

    switch(p.type){
      case 'verse':
        return p.segments.join(' ');
      case 'note':
        var noteId = p.segments[0];
        var note = S.notes ? S.notes.find(function(n){ return n.id === noteId; }) : null;
        return note ? (note.title || '').slice(0, 15) : noteId.slice(0, 10);
      case 'strong':
        return p.segments[0];
      case 'pdf':
        return 'PDF';
      case 'tag':
        return '#' + p.segments[0];
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
    close: close,
    isOpen: isOpen
  };
})();
