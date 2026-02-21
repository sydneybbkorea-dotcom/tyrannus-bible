// idb-store.js — IndexedDB storage layer
// Overcomes localStorage 5-10MB limit. Stores notes, links, PDF blobs, annotations.

var IDBStore = (function(){
  var DB_NAME = 'tyrannus-db';
  var DB_VERSION = 1;
  var _db = null;

  var STORES = {
    notes:      { keyPath: 'id', indexes: [['folderId','folderId',{}], ['updatedAt','updatedAt',{}]] },
    folders:    { keyPath: 'id', indexes: [] },
    highlights: { keyPath: 'verseUri', indexes: [] },
    links:      { keyPath: 'id', indexes: [['sourceUri','sourceUri',{}], ['targetUri','targetUri',{}], ['type','type',{}]] },
    files:      { keyPath: 'id', indexes: [] },
    'pdf-annots': { keyPath: 'id', indexes: [['pdfId','pdfId',{}], ['pdfId_pageNum','[pdfId+pageNum]',{}]] },
    settings:   { keyPath: 'key', indexes: [] },
    'sync-meta': { keyPath: 'key', indexes: [] }
  };

  function open(){
    if(_db) return Promise.resolve(_db);
    return new Promise(function(resolve, reject){
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e){
        var db = e.target.result;
        Object.keys(STORES).forEach(function(name){
          if(db.objectStoreNames.contains(name)) return;
          var cfg = STORES[name];
          var store = db.createObjectStore(name, { keyPath: cfg.keyPath });
          cfg.indexes.forEach(function(idx){
            try { store.createIndex(idx[0], idx[1], idx[2] || {}); } catch(err){}
          });
        });
      };
      req.onsuccess = function(e){
        _db = e.target.result;
        resolve(_db);
      };
      req.onerror = function(e){
        console.error('[IDBStore] open failed', e.target.error);
        reject(e.target.error);
      };
    });
  }

  function _tx(storeName, mode){
    if(!_db) throw new Error('[IDBStore] DB not open');
    return _db.transaction(storeName, mode).objectStore(storeName);
  }

  function put(storeName, data){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readwrite');
      var req = store.put(data);
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function get(storeName, key){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readonly');
      var req = store.get(key);
      req.onsuccess = function(){ resolve(req.result || null); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function getAll(storeName){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readonly');
      var req = store.getAll();
      req.onsuccess = function(){ resolve(req.result || []); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function del(storeName, key){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readwrite');
      var req = store.delete(key);
      req.onsuccess = function(){ resolve(); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function clear(storeName){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readwrite');
      var req = store.clear();
      req.onsuccess = function(){ resolve(); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function getAllByIndex(storeName, indexName, value){
    return new Promise(function(resolve, reject){
      var store = _tx(storeName, 'readonly');
      var index = store.index(indexName);
      var req = index.getAll(value);
      req.onsuccess = function(){ resolve(req.result || []); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function putBulk(storeName, items){
    return new Promise(function(resolve, reject){
      var tx = _db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      items.forEach(function(item){ store.put(item); });
      tx.oncomplete = function(){ resolve(); };
      tx.onerror = function(){ reject(tx.error); };
    });
  }

  // Save a file (Blob) with metadata
  function saveFile(blob, metadata){
    var id = metadata.id || 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    var record = {
      id: id,
      name: metadata.name || 'unknown',
      type: metadata.type || blob.type || 'application/octet-stream',
      size: blob.size,
      data: blob,
      createdAt: Date.now()
    };
    return put('files', record).then(function(){ return id; });
  }

  // Load file blob
  function loadFile(id){
    return get('files', id);
  }

  // Get setting value
  function getSetting(key){
    return get('settings', key).then(function(r){ return r ? r.value : null; });
  }

  function setSetting(key, value){
    return put('settings', { key: key, value: value });
  }

  return {
    open: open,
    put: put,
    get: get,
    getAll: getAll,
    del: del,
    clear: clear,
    getAllByIndex: getAllByIndex,
    putBulk: putBulk,
    saveFile: saveFile,
    loadFile: loadFile,
    getSetting: getSetting,
    setSetting: setSetting
  };
})();
