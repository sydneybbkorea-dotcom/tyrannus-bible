// storage-adapter.js — Dual-write adapter: localStorage + IndexedDB
// During migration period, writes to both. Reads IDB-first with localStorage fallback.

var StorageAdapter = (function(){
  var MIGRATED_KEY = 'idb-migrated';
  var _idbReady = false;

  function init(){
    return IDBStore.open().then(function(){
      _idbReady = true;
      return IDBStore.getSetting(MIGRATED_KEY);
    }).then(function(migrated){
      if(!migrated){
        return migrateFromLocalStorage().then(function(){
          return IDBStore.setSetting(MIGRATED_KEY, true);
        });
      }
    }).catch(function(e){
      console.warn('[StorageAdapter] IDB init failed, using localStorage only', e);
    });
  }

  // Migrate all data from localStorage to IndexedDB (one-time)
  function migrateFromLocalStorage(){
    try {
      var d = JSON.parse(localStorage.getItem('kjb2') || '{}');
    } catch(e){ return Promise.resolve(); }

    var tasks = [];

    // Migrate notes
    if(d.notes && d.notes.length){
      tasks.push(IDBStore.putBulk('notes', d.notes));
    }

    // Migrate folders
    if(d.folders && d.folders.length){
      tasks.push(IDBStore.putBulk('folders', d.folders));
    }

    // Migrate highlights
    if(d.hl){
      var hlRecords = Object.keys(d.hl).map(function(key){
        return {
          verseUri: TyrannusURI.fromLegacyVerseKey(key) || key,
          legacyKey: key,
          color: d.hl[key],
          memo: (d.hlMemo && d.hlMemo[key]) || null,
          ranges: (d.hlRanges && d.hlRanges[key]) || null
        };
      });
      if(hlRecords.length) tasks.push(IDBStore.putBulk('highlights', hlRecords));
    }

    // Migrate bookmarks
    if(d.bk && d.bk.length){
      tasks.push(IDBStore.setSetting('bookmarks', Array.from(d.bk)));
    }

    // Migrate settings
    if(d.showRedLetter != null){
      tasks.push(IDBStore.setSetting('showRedLetter', d.showRedLetter));
    }
    if(d.readPlan){
      tasks.push(IDBStore.setSetting('readPlan', d.readPlan));
    }

    console.log('[StorageAdapter] Migrating localStorage → IDB (' + tasks.length + ' tasks)');
    return Promise.all(tasks);
  }

  // Save a note to both localStorage (via S.notes) and IDB
  function saveNote(note){
    if(!_idbReady) return Promise.resolve();
    return IDBStore.put('notes', note).catch(function(e){
      console.warn('[StorageAdapter] saveNote IDB failed', e);
    });
  }

  // Save a folder
  function saveFolder(folder){
    if(!_idbReady) return Promise.resolve();
    return IDBStore.put('folders', folder).catch(function(e){
      console.warn('[StorageAdapter] saveFolder IDB failed', e);
    });
  }

  // Delete a note
  function deleteNote(noteId){
    if(!_idbReady) return Promise.resolve();
    return IDBStore.del('notes', noteId).catch(function(e){
      console.warn('[StorageAdapter] deleteNote IDB failed', e);
    });
  }

  // Save highlights
  function saveHighlight(key, color, memo, ranges){
    if(!_idbReady) return Promise.resolve();
    var uri = TyrannusURI.fromLegacyVerseKey(key) || key;
    return IDBStore.put('highlights', {
      verseUri: uri,
      legacyKey: key,
      color: color,
      memo: memo || null,
      ranges: ranges || null
    }).catch(function(e){
      console.warn('[StorageAdapter] saveHighlight IDB failed', e);
    });
  }

  // Save file as Blob (instead of base64)
  function saveFile(blob, metadata){
    if(!_idbReady) return Promise.resolve(null);
    return IDBStore.saveFile(blob, metadata);
  }

  // Load all notes from IDB
  function loadNotes(){
    if(!_idbReady) return Promise.resolve(null);
    return IDBStore.getAll('notes');
  }

  // Load all folders from IDB
  function loadFolders(){
    if(!_idbReady) return Promise.resolve(null);
    return IDBStore.getAll('folders');
  }

  function isReady(){ return _idbReady; }

  return {
    init: init,
    migrateFromLocalStorage: migrateFromLocalStorage,
    saveNote: saveNote,
    saveFolder: saveFolder,
    deleteNote: deleteNote,
    saveHighlight: saveHighlight,
    saveFile: saveFile,
    loadNotes: loadNotes,
    loadFolders: loadFolders,
    isReady: isReady
  };
})();
