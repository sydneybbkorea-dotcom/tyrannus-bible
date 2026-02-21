// link-registry.js — Bidirectional link graph with O(1) backlink lookup
// Replaces O(N*M) HTML parsing in notes-manager-ui.js

var LinkRegistry = (function(){
  // In-memory indexes
  var _outgoing = new Map();  // sourceUri → Set<linkId>
  var _incoming = new Map();  // targetUri → Set<linkId>  (backlinks!)
  var _linkMap  = new Map();  // linkId → linkObject
  var _ready = false;

  function init(){
    return IDBStore.getAll('links').then(function(links){
      links.forEach(function(link){
        _indexLink(link);
      });
      _ready = true;
      console.log('[LinkRegistry] Initialized with ' + links.length + ' links');
    }).catch(function(e){
      console.warn('[LinkRegistry] init failed', e);
      _ready = true;
    });
  }

  function _indexLink(link){
    _linkMap.set(link.id, link);

    if(!_outgoing.has(link.sourceUri)) _outgoing.set(link.sourceUri, new Set());
    _outgoing.get(link.sourceUri).add(link.id);

    if(!_incoming.has(link.targetUri)) _incoming.set(link.targetUri, new Set());
    _incoming.get(link.targetUri).add(link.id);
  }

  function _unindexLink(link){
    _linkMap.delete(link.id);

    var outSet = _outgoing.get(link.sourceUri);
    if(outSet){ outSet.delete(link.id); if(!outSet.size) _outgoing.delete(link.sourceUri); }

    var inSet = _incoming.get(link.targetUri);
    if(inSet){ inSet.delete(link.id); if(!inSet.size) _incoming.delete(link.targetUri); }
  }

  // Add a new link
  function addLink(sourceUri, targetUri, type, metadata){
    // Deduplicate: check if same source→target+type already exists
    var existing = getOutgoing(sourceUri).filter(function(l){
      return l.targetUri === targetUri && l.type === type;
    });
    if(existing.length > 0) return Promise.resolve(existing[0].id);

    var id = 'lnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    var link = {
      id: id,
      sourceUri: sourceUri,
      targetUri: targetUri,
      type: type || 'reference',
      metadata: metadata || {},
      createdAt: Date.now()
    };

    _indexLink(link);

    if(typeof EventBus !== 'undefined') EventBus.emit('link:added', link);

    return IDBStore.put('links', link).then(function(){
      return id;
    }).catch(function(e){
      console.warn('[LinkRegistry] addLink IDB failed', e);
      return id;
    });
  }

  // Remove a link by id
  function removeLink(linkId){
    var link = _linkMap.get(linkId);
    if(!link) return Promise.resolve();

    _unindexLink(link);

    if(typeof EventBus !== 'undefined') EventBus.emit('link:removed', link);

    return IDBStore.del('links', linkId).catch(function(e){
      console.warn('[LinkRegistry] removeLink IDB failed', e);
    });
  }

  // Remove all links from a source URI
  function removeOutgoing(sourceUri){
    var links = getOutgoing(sourceUri);
    var tasks = links.map(function(l){ return removeLink(l.id); });
    return Promise.all(tasks);
  }

  // Get all incoming links (backlinks) for a URI — O(1)!
  function getIncoming(uri){
    var ids = _incoming.get(uri);
    if(!ids) return [];
    var result = [];
    ids.forEach(function(id){
      var link = _linkMap.get(id);
      if(link) result.push(link);
    });
    return result;
  }

  // Get all outgoing links from a URI
  function getOutgoing(uri){
    var ids = _outgoing.get(uri);
    if(!ids) return [];
    var result = [];
    ids.forEach(function(id){
      var link = _linkMap.get(id);
      if(link) result.push(link);
    });
    return result;
  }

  // Check if any incoming links exist for a URI (fast check for bible-renderer)
  function hasIncoming(uri){
    var ids = _incoming.get(uri);
    return ids ? ids.size > 0 : false;
  }

  // Sync links from a note's HTML content
  // Parses .vlink and .nlink elements and updates the link graph
  function syncFromNote(noteId, htmlContent){
    var noteUri = TyrannusURI.note(noteId);

    // Parse HTML for links
    var tmp = document.createElement('div');
    tmp.innerHTML = htmlContent || '';

    var newLinks = [];

    // Extract verse links (.vlink)
    var vlinks = tmp.querySelectorAll('.vlink');
    for(var i = 0; i < vlinks.length; i++){
      var ref = vlinks[i].dataset.ref;
      if(ref){
        newLinks.push({
          targetUri: TyrannusURI.fromLegacyVerseKey(ref),
          type: 'reference',
          metadata: { label: vlinks[i].textContent.trim() }
        });
      }
    }

    // Extract note links (.nlink)
    var nlinks = tmp.querySelectorAll('.nlink');
    for(var j = 0; j < nlinks.length; j++){
      var targetNoteId = nlinks[j].dataset.noteid;
      if(targetNoteId){
        newLinks.push({
          targetUri: TyrannusURI.note(targetNoteId),
          type: 'reference',
          metadata: { label: nlinks[j].textContent.trim() }
        });
      }
    }

    // Remove old outgoing links from this note
    var oldLinks = getOutgoing(noteUri);
    var removeTasks = oldLinks.map(function(l){ return removeLink(l.id); });

    return Promise.all(removeTasks).then(function(){
      // Add new links
      var addTasks = newLinks.map(function(nl){
        return addLink(noteUri, nl.targetUri, nl.type, nl.metadata);
      });
      return Promise.all(addTasks);
    });
  }

  // Get subgraph for knowledge graph visualization
  function getGraph(centerUri, depth){
    depth = depth || 2;
    var nodes = new Map();
    var edges = [];
    var visited = new Set();
    var queue = [{ uri: centerUri, d: 0 }];

    while(queue.length > 0){
      var item = queue.shift();
      if(visited.has(item.uri) || item.d > depth) continue;
      visited.add(item.uri);

      var parsed = TyrannusURI.parse(item.uri);
      nodes.set(item.uri, {
        uri: item.uri,
        type: parsed ? parsed.type : 'unknown',
        depth: item.d
      });

      // Outgoing
      getOutgoing(item.uri).forEach(function(link){
        edges.push({ source: link.sourceUri, target: link.targetUri, type: link.type, id: link.id });
        if(!visited.has(link.targetUri)){
          queue.push({ uri: link.targetUri, d: item.d + 1 });
        }
      });

      // Incoming
      getIncoming(item.uri).forEach(function(link){
        edges.push({ source: link.sourceUri, target: link.targetUri, type: link.type, id: link.id });
        if(!visited.has(link.sourceUri)){
          queue.push({ uri: link.sourceUri, d: item.d + 1 });
        }
      });
    }

    return {
      nodes: Array.from(nodes.values()),
      edges: edges
    };
  }

  // Bulk migrate: extract links from existing notes
  function bulkMigrate(notes){
    if(!notes || !notes.length) return Promise.resolve();
    console.log('[LinkRegistry] Bulk migrating ' + notes.length + ' notes');

    var chain = Promise.resolve();
    notes.forEach(function(note){
      chain = chain.then(function(){
        var noteUri = TyrannusURI.note(note.id);

        // Add links from vRefs
        var tasks = [];
        if(note.vRefs && note.vRefs.length){
          note.vRefs.forEach(function(ref){
            var targetUri = TyrannusURI.fromLegacyVerseKey(ref);
            if(targetUri){
              tasks.push(addLink(noteUri, targetUri, 'reference', { source: 'vRefs' }));
            }
          });
        }

        // Parse HTML content for .nlink references
        if(note.content){
          var tmp = document.createElement('div');
          tmp.innerHTML = note.content;
          var nlinks = tmp.querySelectorAll('.nlink');
          for(var i = 0; i < nlinks.length; i++){
            var tid = nlinks[i].dataset.noteid;
            if(tid){
              tasks.push(addLink(noteUri, TyrannusURI.note(tid), 'reference', { source: 'nlink' }));
            }
          }
        }

        return Promise.all(tasks);
      });
    });

    return chain.then(function(){
      console.log('[LinkRegistry] Bulk migration complete (' + _linkMap.size + ' links)');
    });
  }

  function isReady(){ return _ready; }
  function getLinkCount(){ return _linkMap.size; }

  return {
    init: init,
    addLink: addLink,
    removeLink: removeLink,
    removeOutgoing: removeOutgoing,
    getIncoming: getIncoming,
    getOutgoing: getOutgoing,
    hasIncoming: hasIncoming,
    syncFromNote: syncFromNote,
    getGraph: getGraph,
    bulkMigrate: bulkMigrate,
    isReady: isReady,
    getLinkCount: getLinkCount
  };
})();
