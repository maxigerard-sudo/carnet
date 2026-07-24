/* Service worker minimal — met le carnet en cache pour l'usage hors-ligne.
   À déposer à côté de carnet.html (renommé index.html) sur GitHub Pages.
   Changez CACHE à chaque nouvelle version pour forcer la mise à jour. */
const CACHE = "carnet-v2";
const FICHIERS = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Les appels à l'API passent toujours par le réseau, jamais par le cache.
  if (url.hostname.endsWith("anthropic.com")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
