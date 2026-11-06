// Service worker UniConnect: précache de la coquille, stale-while-revalidate pour les ressources, réseau d'abord + repli cache pour les pages.
const VERSION = "uc-v2";
const SHELL = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // les Server Actions (POST) passent toujours par le réseau
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isAsset = url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons");
  const isPage = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html") || url.searchParams.has("_rsc");
  if (!isAsset && !isPage) return;

  if (isAsset) {
    // Ressources statiques: stale-while-revalidate
    e.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
        if (cached) { e.waitUntil(network); return cached; }
        return (await network) ?? Response.error();
      }),
    );
    return;
  }

  // Pages (emploi du temps, notes, absences, annonces): réseau d'abord pour des données fraîches,
  // repli sur la dernière version consultée (lecture hors ligne) puis sur /offline.
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      try {
        const res = await Promise.race([
          fetch(req),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
        ]);
        if (res.ok && !res.redirected) cache.put(req, res.clone());
        return res;
      } catch {
        const cached = await cache.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") return (await cache.match("/offline")) ?? Response.error();
        return Response.error();
      }
    }),
  );
});

// Déconnexion: on vide le cache pour ne jamais montrer les données d'un autre utilisateur.
self.addEventListener("message", (e) => {
  if (e.data === "clear") e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))));
});
