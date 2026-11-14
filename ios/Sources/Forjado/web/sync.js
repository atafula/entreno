// ---------- Cuenta y sincronización (Firebase: Google + Firestore), igual que la app de finanzas ----------
// Primero lo local (funciona sin conexión ni cuenta); con sesión, todo se copia a la nube y se baja lo de otros dispositivos.
// Nube: users/{uid} -> {rutinasV2} · users/{uid}/rutinas/{id} · users/{uid}/sesiones/{id} · users/{uid}/caminatas/{id}
// Cada documento lleva `rev` (contador de cambios) y `upd` (hora): gana el de más `rev`, así no importa el reloj de cada aparato.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDBl3KDT96i6l35XZIKxqkyNccSdvJFuag',
  authDomain: 'entreno-31153.firebaseapp.com',
  projectId: 'entreno-31153',
  storageBucket: 'entreno-31153.firebasestorage.app',
  messagingSenderId: '229443527410',
  appId: '1:229443527410:web:2f9dee88ac098622f3a66b'
};
const UID_KEY = 'entreno-uid';
const cfg = window.ENTRENO_FIREBASE_CONFIG || FIREBASE_CONFIG;   // los tests inyectan su propia config
let fdb = null, fauth = null, fuser = null, cloudIds = { sesiones: new Map(), caminatas: new Map(), rutinas: new Map() };   // id -> {rev, upd} que hay en la nube
let cloudPerfil = { rev: 0, upd: 0 };   // versión del perfil que hay en la nube
let unsubs = [], pushT = null, rootLeido = false, nubeV2 = false, leidas = new Set();

const saveLocal = () => guardarLocal();
// Un aviso de la nube solo repinta si trajo algo distinto, y sin reanimar la pantalla
const firma = () => JSON.stringify([db.routines, db.sessions, db.walks]);
const renderSiCambio = antes => { if (firma() !== antes) renderSilencioso(); };

function setAccountUI() {
  const on = !!fuser;
  window.cuentaActual = fuser;           // el Perfil enseña su foto y su nombre
  if (typeof renderPerfil === 'function') renderPerfil();
  $('account-sec').hidden = !fauth;
  $('login-btn').hidden = on;
  $('logout-btn').hidden = !on;
  $('account-note').textContent = on
    ? `Sincronizado con ${fuser.email || 'Google'}. Tus entrenos están a salvo en la nube.`
    : 'Tus datos se guardan solo en este móvil. Inicia sesión para sincronizarlos y no perderlos.';
}

// Lo que cambia en local se sube (con un pequeño retraso para agrupar cambios)
function syncPush() {
  if (!fuser || !fdb) return;
  clearTimeout(pushT);
  pushT = setTimeout(pushNow, 250);
}
// ¿Es `a` más nueva que `b`? Manda el contador de revisiones; la hora solo desempata (así un reloj mal puesto no pisa nada)
const newer = (a, b) => (a.rev || 0) !== (b.rev || 0) ? (a.rev || 0) > (b.rev || 0) : (a.upd || 0) > (b.upd || 0);
const COLS = [['sesiones', 'sessions'], ['caminatas', 'walks'], ['rutinas', 'routines']];
const porSubir = (name, item) => { const c = cloudIds[name].get(item.id); return c === undefined || newer(item, c); };
let avisado = false;
function falloNube(err) {
  if (err && err.code === 'permission-denied' && !avisado) {
    avisado = true;
    toast('La nube rechaza los datos: publica las reglas nuevas de Firestore (archivo firestore.rules).');
  }
}
function pushNow() {
  // antes de subir nada hay que haber leído la nube entera (si no, lo local pisaría versiones más nuevas)
  if (!fuser || !fdb || !rootLeido || leidas.size < COLS.length) return;
  const root = fdb.collection('users').doc(fuser.uid);
  const b = fdb.batch();
  let tocado = false;
  if (!nubeV2) { b.set(root, { rutinasV2: true }, { merge: true }); nubeV2 = true; }
  const pf = db.perfil;
  if (pf && Object.keys(pf).length && (!pf.rev || newer(pf, cloudPerfil))) {
    if (!pf.rev) { tocar(pf); tocado = true; }
    b.set(root, { perfil: JSON.parse(JSON.stringify(pf)) }, { merge: true });
    cloudPerfil = { rev: pf.rev, upd: pf.upd || 0 };
  }
  COLS.forEach(([name, key]) => {
    db.deleted[name].forEach(id => b.delete(root.collection(name).doc(id)));
    db[key].forEach(item => {
      if (!item.id || !porSubir(name, item)) return;
      if (!item.rev) { tocar(item); tocado = true; }
      const { id, ...data } = item;
      b.set(root.collection(name).doc(id), JSON.parse(JSON.stringify(data)));
      cloudIds[name].set(id, { rev: item.rev || 0, upd: item.upd || 0 });
    });
  });
  if (tocado) saveLocal();
  b.commit().catch(falloNube);
}

// Orden de las rutinas y punto de partida para detectar cambios propios tras traer algo de la nube
function ajustarRutinas() {
  ordenarRutinas();
  db.routineSigs = {}; db.routines.forEach(r => { db.routineSigs[r.id] = { s: sigRutina(r), rev: r.rev || 0 }; });
}

function listenCloud(user) {
  stopListen();
  const root = fdb.collection('users').doc(user.uid);
  unsubs.push(root.onSnapshot(snap => {
    if (snap.metadata && snap.metadata.fromCache && !snap.exists) return;   // sin red no sabemos si hay rutinas antiguas
    const antes = firma();
    const d = snap.exists ? snap.data() : null;
    rootLeido = true; nubeV2 = !!(d && d.rutinasV2);
    // Cada cuenta tiene su propio perfil: el de la nube gana si es más nuevo que el de este móvil
    if (d && d.perfil) {
      cloudPerfil = { rev: d.perfil.rev || 0, upd: d.perfil.upd || 0 };
      if (!db.perfil || !Object.keys(db.perfil).length || newer(d.perfil, db.perfil)) { db.perfil = d.perfil; saveLocal(); renderSiCambio(antes); renderPerfil(); }
    }
    if (!nubeV2) {
      // Nube antigua: las rutinas iban juntas en un bloque. Se juntan con las locales y pasan a un documento cada una
      const tengo = new Set(db.routines.map(r => r.id));
      (d && Array.isArray(d.rutinas) ? d.rutinas : []).map(normRoutine)
        .filter(r => r.id && !tengo.has(r.id) && !db.deleted.rutinas.includes(r.id)).forEach(r => db.routines.push(r));
      ajustarRutinas(); saveLocal(); renderSiCambio(antes);
      pushNow();
    }
  }, falloNube));
  COLS.forEach(([name, key]) => {
    unsubs.push(root.collection(name).onSnapshot(snap => {
      if (snap.metadata && snap.metadata.fromCache) return;
      const antes = firma();
      const cloud = new Map(snap.docs.map(x => [x.id, { rev: x.data().rev || 0, upd: x.data().upd || 0 }]));
      cloudIds[name] = cloud; leidas.add(name);
      const synced = new Set(db.syncedIds[name]);
      // Borrado en otro dispositivo: estaba en la nube la última vez y ya no
      db[key] = db[key].filter(x => !(synced.has(x.id) && !cloud.has(x.id)));
      const pendingDel = new Set(db.deleted[name]);
      db.deleted[name] = db.deleted[name].filter(id => cloud.has(id));   // los ya borrados de la nube se olvidan
      db.syncedIds[name] = [...cloud.keys()];
      // Editado en otro dispositivo: gana la versión con más revisiones
      const docs = new Map(snap.docs.map(x => [x.id, x.data()]));
      const norm = x => key === 'routines' ? normRoutine(x) : x;
      db[key] = db[key].map(x => { const c = docs.get(x.id); return c && newer(c, x) ? norm({ id: x.id, ...c }) : x; });
      const have = new Set(db[key].map(x => x.id));
      const add = snap.docs.filter(x => !have.has(x.id) && !pendingDel.has(x.id)).map(x => norm({ id: x.id, ...x.data() }));
      if (add.length) db[key] = [...db[key], ...add];
      if (key === 'routines') ajustarRutinas();
      else db[key].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
      saveLocal(); renderSiCambio(antes);
      if (!nubeV2 || db.deleted[name].length || db[key].some(x => porSubir(name, x))) pushNow();
    }, falloNube));
  });
}
function stopListen() { rootLeido = false; leidas = new Set(); unsubs.forEach(u => { try { u(); } catch { /* nada */ } }); unsubs = []; clearTimeout(pushT); }

(function initSync() {
  if (!window.firebase || !cfg.apiKey || cfg.apiKey === 'REEMPLAZA') { $('account-sec').hidden = true; return; }
  try {
    firebase.initializeApp(cfg);
    fdb = firebase.firestore();
    fdb.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    fauth = firebase.auth();
  } catch { $('account-sec').hidden = true; return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const signIn = () => fauth.signInWithPopup(provider).catch(err => {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-cancelled') return fauth.signInWithRedirect(provider);
    if (err.code !== 'auth/popup-closed-by-user') toast(err.message);
  });
  // En la app de iOS Google no deja iniciar sesión dentro de la vista web: lo hace iOS (GoogleLogin.swift)
  // y devuelve los tokens de Google, que entran en este mismo Firebase con signInWithCredential
  const nativo = window.webkit?.messageHandlers?.forjado;
  const entrar = nativo ? () => nativo.postMessage({ t: 'google' }) : signIn;
  if (nativo) {
    window.__forjadoGoogle = (idToken, accessToken) => fauth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(idToken, accessToken))
      .catch(err => toast(err.message || 'No se pudo iniciar sesión.'));
    window.__forjadoGoogleError = msg => { if (msg && msg !== 'cancelado') toast(msg); };
  }
  $('login-btn').onclick = entrar;
  $('logout-btn').onclick = entrar;                       // "cambiar de cuenta": vuelve a elegir
  // getRedirectResult prepara la ventana de Google, que en la app no existe (y puede dejar Auth colgado)
  if (!nativo) fauth.getRedirectResult().catch(err => { if (err.code && !err.code.includes('cancelled')) toast(err.message); });
  setAccountUI();
  fauth.onAuthStateChanged(user => {
    fuser = user;
    setAccountUI();
    if (!user) { stopListen(); rootLeido = false; return; }                  // al cerrar sesión se sigue en local
    const prev = lsGet(UID_KEY);
    if (prev && prev !== user.uid) {                      // otra cuenta: no mezclar datos
      db.routines = []; db.sessions = []; db.walks = []; db.routineSigs = {}; db.perfil = {}; cloudPerfil = { rev: 0, upd: 0 };
      db.deleted = { sesiones: [], caminatas: [], rutinas: [] }; db.syncedIds = { sesiones: [], caminatas: [], rutinas: [] };
      cloudIds = { sesiones: new Map(), caminatas: new Map(), rutinas: new Map() }; rootLeido = false; nubeV2 = false; leidas = new Set();
      saveLocal(); render();
    }
    lsSet(UID_KEY, user.uid);
    listenCloud(user);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && fuser) syncPush(); });
  window.addEventListener('online', () => { if (fuser) syncPush(); });
})();
