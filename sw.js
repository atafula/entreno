// Sube la versión cuando cambies archivos para que el móvil descargue la nueva copia.
const CACHE = 'entreno-v104';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'ejercicios.js', 'workout.js', 'detalle.js', 'backup.js', 'sync.js', 'manifest.webmanifest', 'traducciones.json', 'ejercicios_local.json',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon.png',
  'fonts/fonts.css', 'fonts/Fraunces-600.woff2', 'fonts/Fraunces-700.woff2', 'fonts/Manrope-500.woff2', 'fonts/Manrope-600.woff2', 'fonts/Manrope-700.woff2', 'fonts/Manrope-800.woff2',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (así los cambios llegan en cuanto hay conexión); caché si no hay red.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
