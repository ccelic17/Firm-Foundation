// Bump on every deploy that changes cached assets.
const VERSION = 'ff-v2';
const APP_SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

// The app shell. Third-party scripts are cached at runtime rather than
// precached, so an unreachable CDN cannot fail the whole install step.
const PRECACHE = ['/', '/index.html', '/manifest.json'];

const OFFLINE_FALLBACK = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline — Firm Foundation</title>
<body style="margin:0;background:#07090F;color:#DEDAD4;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:32px;gap:12px">
  <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#F5C842">Firm Foundation</div>
  <div style="font-size:17px">You're offline.</div>
  <div style="font-size:13px;color:#888;line-height:1.6;max-width:300px">Reconnect and reload to pick up where you left off.</div>
</body>`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL)
      // Individually so one failed asset does not abort the whole install.
      .then(cache => Promise.allSettled(PRECACHE.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== APP_SHELL && k !== RUNTIME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/** True for requests that should always prefer the network (the app itself). */
function isDocument(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls — stale biometrics or AI replies are worse than none.
  if (url.pathname.startsWith('/.netlify/functions/')) return;

  // ── Documents: network-first ──────────────────────────────────────
  // The previous cache-first strategy on /index.html pinned users to whatever
  // version they first installed — new deploys were never picked up.
  if (isDocument(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(APP_SHELL).then(c => c.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/index.html'))
            .then(cached => cached || new Response(OFFLINE_FALLBACK, {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }))
        )
    );
    return;
  }

  // ── Everything else: cache-first, then populate ───────────────────
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          // Opaque cross-origin responses are still worth storing so the
          // fonts and Dexie/OneSignal scripts survive going offline.
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(RUNTIME).then(c => c.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached || Response.error());
    })
  );
});
