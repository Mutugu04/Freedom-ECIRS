
const CACHE_NAME = 'frg-ebrs-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for offline payments/contracts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-field-records') {
    event.waitUntil(syncPendingRecords());
  }
});

async function syncPendingRecords() {
  console.log('Syncing pending field records...');
  // Logic to push from IndexedDB to API
}
