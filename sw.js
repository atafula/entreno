// Sube la versión cuando cambies archivos para que el móvil descargue la nueva copia.
const CACHE = 'entreno-v171';
const IMG_CACHE = 'entreno-img';   // fotos de ejercicios: no se borra al subir de versión
const IMG_MAX = 250;               // máximo de fotos guardadas (se van borrando las más antiguas)
const IMG_HOSTS = ['pump-app.s3.eu-west-2.amazonaws.com'];
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'ejercicios.js', 'workout.js', 'detalle.js', 'backup.js', 'sync.js', 'manifest.webmanifest', 'traducciones.json', 'ejercicios_local.json',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png',
  'fonts/fonts.css', 'fonts/InterTight-600.woff2', 'fonts/InterTight-700.woff2', 'fonts/InterTight-800.woff2', 'fonts/Manrope-500.woff2', 'fonts/Manrope-600.woff2', 'fonts/Manrope-700.woff2', 'fonts/Manrope-800.woff2'
];
// Externos: se guardan si se puede, pero si fallan no impiden instalar la app
const EXTERNOS = [
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));   // copias frescas, no las de la caché HTTP
    await Promise.allSettled(EXTERNOS.map(u => c.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (IMG_HOSTS.includes(url.hostname)) return e.respondWith(foto(req));
  if (url.origin !== location.origin && url.hostname !== 'www.gstatic.com') return;   // Firestore y demás: sin tocar
  e.respondWith(rapido(e, req));
});

// Caché primero y se refresca en segundo plano: abre al instante con mala cobertura o sin red.
// Los cambios llegan al instalarse la nueva versión (por eso se sube el número de caché).
async function rapido(e, req) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
  const red = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()).catch(() => {}); return res; });
  if (guardado) { e.waitUntil(red.catch(() => {})); return guardado; }
  try { return await red; }
  catch { return (req.mode === 'navigate' && await cache.match('index.html')) || Response.error(); }
}

// Fotos: se guarda la que se ha visto una vez. Solo respuestas correctas y completas: las opacas
// (sin CORS) no dejan ver si eran un error, así que no se guardan.
async function foto(req) {
  const cache = await caches.open(IMG_CACHE);
  const guardada = await cache.match(req);
  if (guardada) return guardada;
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200 && !req.headers.has('range')) {
      await cache.put(req, res.clone()).catch(() => {});
      recortar(cache);
    }
    return res;
  } catch { return Response.error(); }
}
async function recortar(cache) {
  const ks = await cache.keys();
  await Promise.all(ks.slice(0, Math.max(0, ks.length - IMG_MAX)).map(k => cache.delete(k)));
}
