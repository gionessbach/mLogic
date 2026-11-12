// mLogic – Offline-Speicher für alle Spiele. Bei Änderungen an einer Datei die Versionsnummer erhöhen.
const CACHE = "mlogic-v44";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png",
  "hash/", "hash/index.html", "hash/icon-180.png", "hash/icon-192.png", "hash/icon-512.png",
  "tile/", "tile/index.html", "tile/icon-180.png", "tile/icon-192.png", "tile/icon-512.png",
  "crack/", "crack/index.html", "crack/words.js", "crack/icon-180.png", "crack/icon-192.png", "crack/icon-512.png",
  "grow/", "grow/index.html", "grow/icon-180.png", "grow/icon-192.png", "grow/icon-512.png",
  "rise/", "rise/index.html", "rise/icon-180.png", "rise/icon-192.png", "rise/icon-512.png",
  "code/", "code/index.html", "code/icon-180.png", "code/icon-192.png", "code/icon-512.png",
  "sudo/", "sudo/index.html", "sudo/icon-180.png", "sudo/icon-192.png", "sudo/icon-512.png",
  "calc/", "calc/index.html", "calc/icon-180.png", "calc/icon-192.png", "calc/icon-512.png",
  "zip/", "zip/index.html", "zip/icon-180.png", "zip/icon-192.png", "zip/icon-512.png",
  "flow/", "flow/index.html", "flow/icon.png", "flow/icon-512.png", "flow/icon-maskable-192.png", "flow/icon-maskable-512.png", "flow/fredoka.woff2",
  "atom/", "atom/index.html", "atom/vielzeller.js", "atom/icon-180.png", "atom/icon-192.png", "atom/icon-512.png"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Startseite „nach unten ziehen“: alle Dateien frisch vom Server holen
self.addEventListener("message", e => {
  if (!e.data || e.data.type !== "refresh-all") return;
  const port = e.ports && e.ports[0];
  e.waitUntil(caches.open(CACHE).then(async c => {
    const res = await Promise.allSettled(FILES.map(f => fetch(f, { cache: "reload" }).then(r => { if (!r.ok) throw r.status; return c.put(f, r); })));
    const ok = res.filter(r => r.status === "fulfilled").length;
    if (port) port.postMessage({ ok, fail: res.length - ok });
  }));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Schriften: aus dem Speicher, im Hintergrund auffrischen
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Eigene Dateien: erst Netz (für Updates), sonst Speicher
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
