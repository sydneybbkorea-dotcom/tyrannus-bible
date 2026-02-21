// sw.js — Service Worker for offline support
var CACHE_NAME = 'tyrannus-v4';
var SHELL_CACHE = 'tyrannus-shell-v4';
var DATA_CACHE = 'tyrannus-data-v4';

// App shell files — cache on install (상대 경로 — GitHub Pages 호환)
var SHELL_FILES = [
  './',
  './index.html',
  './css/theme-system.css',
  './css/variables.css',
  './css/layout.css',
  './css/icon-rail.css',
  './css/side-panel.css',
  './css/topbar.css',
  './css/bible.css',
  './css/notes.css',
  './css/ui.css',
  './css/responsive.css',
  './css/knowledge-graph.css',
  './css/pdf-viewer.css',
  './data/books.js'
];

// Bible data patterns — cache-first strategy
var DATA_PATTERNS = [
  /\/data\//,
  /\/bible\//,
  /\/commentary\//,
  /\/strongs\//
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      return cache.addAll(SHELL_FILES);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(name){
          return name !== SHELL_CACHE && name !== DATA_CACHE && name !== CACHE_NAME;
        }).map(function(name){
          return caches.delete(name);
        })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event){
  var url = new URL(event.request.url);

  // Skip non-GET
  if(event.request.method !== 'GET') return;

  // Skip external CDN (D3, PDF.js, Firebase) — let network handle
  if(url.origin !== self.location.origin) return;

  // Bible data files — cache-first (they rarely change)
  var isData = DATA_PATTERNS.some(function(p){ return p.test(url.pathname); });
  if(isData){
    event.respondWith(
      caches.open(DATA_CACHE).then(function(cache){
        return cache.match(event.request).then(function(cached){
          if(cached) return cached;
          return fetch(event.request).then(function(response){
            if(response.ok) cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // App shell — stale-while-revalidate
  event.respondWith(
    caches.open(SHELL_CACHE).then(function(cache){
      return cache.match(event.request).then(function(cached){
        var fetchPromise = fetch(event.request).then(function(response){
          if(response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(function(){
          return cached;
        });
        return cached || fetchPromise;
      });
    })
  );
});
