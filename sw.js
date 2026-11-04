/* Service worker da TCDF Plataforma: deixa o app abrir e funcionar sem internet depois de uma primeira visita.
   Estratégia: rede primeiro (sempre a versão nova quando há conexão), cache como reserva quando a rede falha.
   Nunca guarda chamadas do Firebase/Firestore (o app tem a própria fila de envio). */
const CACHE = 'tcdf-offline-v1';
const HOSTS_CACHEAVEIS = ['www.gstatic.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// a página manda a lista do que precisa estar disponível offline (o que carregou + arquivos de carga sob demanda)
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.tipo !== 'precache' || !Array.isArray(d.urls)) return;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const u of d.urls) {
      try {
        const url = new URL(u, self.location.href), mesma = url.origin === self.location.origin;
        if (!mesma && !HOSTS_CACHEAVEIS.includes(url.hostname)) continue;
        if (await cache.match(url.href)) continue;
        const resp = await fetch(url.href, mesma ? undefined : { mode: 'cors' });
        if (resp && resp.ok) await cache.put(url.href, resp);
      } catch (_) { /* fica para a próxima visita */ }
    }
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  if (!mesmaOrigem && !HOSTS_CACHEAVEIS.includes(url.hostname)) return;     // Firestore, Auth e afins passam direto
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const resp = await fetch(req);
      if (resp && (resp.ok || resp.type === 'opaque') && resp.status !== 206) {
        // uma única versão por arquivo: apaga as cópias com outro ?v= do mesmo caminho
        if (mesmaOrigem) { for (const k of await cache.keys()) { const ku = new URL(k.url); if (ku.pathname === url.pathname && ku.search !== url.search) await cache.delete(k); } }
        cache.put(req, resp.clone()).catch(() => {});
      }
      return resp;
    } catch (erro) {
      const guardado = await cache.match(req, { ignoreSearch: false }) || (mesmaOrigem ? await cache.match(req, { ignoreSearch: true }) : null)
        || (req.mode === 'navigate' ? await cache.match(new URL('index.html', self.registration.scope).href, { ignoreSearch: true }) : null);
      if (guardado) return guardado;
      throw erro;
    }
  })());
});
