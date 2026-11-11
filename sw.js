// Offline app shell. Music itself lives in IndexedDB / linked folders, not here.
// Bump VERSION (and the ?v= numbers in index.html) with every release: each version gets its
// own complete, freshly downloaded set of files, so the page and its script can never mismatch.
const VERSION = 20;
const CACHE = `cadence-shell-v${VERSION}`;
const SHELL = [
  './', 'index.html', `styles.css?v=${VERSION}`, `app.js?v=${VERSION}`, 'vendor/music-metadata.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's own HTTP cache, which may still hold the previous release.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => {
        if (!r.ok) throw new Error(`${u}: ${r.status}`);
        return c.put(u, r);
      }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve this version's files from its cache; anything else falls through to the network.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true }) ||
      (req.mode === 'navigate' ? await cache.match('index.html') : undefined);
    return cached || fetch(req);
  })());
});
