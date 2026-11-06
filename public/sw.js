// Service worker UniConnect: précache de la coquille + stale-while-revalidate pour les lectures.
const VERSION = "uc-v1";
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

  // stale-while-revalidate
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      const res = await network;
      if (res) return res;
      if (req.mode === "navigate") return (await cache.match("/offline")) ?? Response.error();
      return Response.error();
    }),
  );
});
