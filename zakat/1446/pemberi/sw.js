// Service Worker for Zakat Management System

const CACHE_NAME = 'zakat-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/daftar.html',
  '/edit.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css',
  'https://cdn.datatables.net/responsive/2.2.9/css/responsive.bootstrap5.min.css',
  'https://code.jquery.com/jquery-3.6.0.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js',
  'https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js',
  'https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js',
  'https://cdn.datatables.net/responsive/2.2.9/js/dataTables.responsive.min.js',
  'https://cdn.datatables.net/responsive/2.2.9/js/responsive.bootstrap5.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Try network request
        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the response
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API calls
                if (!event.request.url.includes('script.google.com')) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
