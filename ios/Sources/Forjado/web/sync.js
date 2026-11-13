// ---------- Cuenta y sincronización (Firebase: Google + Firestore), igual que la app de finanzas ----------
// Primero lo local (funciona sin conexión ni cuenta); con sesión, todo se copia a la nube y se baja lo de otros dispositivos.
// Nube: users/{uid} -> {rutinas, rutinasTs} · users/{uid}/sesiones/{id} · users/{uid}/caminatas/{id}
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
let fdb = null, fauth = null, fuser = null, cloudIds = { sesiones: new Map(), caminatas: new Map() };   // id -> marca `upd` que hay en la nube
let unsubs = [], pushT = null, pending = false;

const saveLocal = () => guardarLocal();
const routinesSig = () => JSON.stringify(db.routines);
// Un aviso de la nube solo repinta si trajo algo distinto, y sin reanimar la pantalla
const firma = () => JSON.stringify([db.routines, db.sessions, db.walks]);
const renderSiCambio = antes => { if (firma() !== antes) renderSilencioso(); };

function setAccountUI() {
  const on = !!fuser;
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
  if (db.routinesSig !== routinesSig()) { db.routinesSig = routinesSig(); db.routinesTs = Date.now(); saveLocal(); }
  clearTimeout(pushT);
  pushT = setTimeout(pushNow, 250);
}
function pushNow() {
  if (!fuser || !fdb) return;
  const root = fdb.collection('users').doc(fuser.uid);
  const b = fdb.batch();
  if (db.routinesTs) b.set(root, { rutinas: db.routines, rutinasTs: db.routinesTs }, { merge: true });
  ['sesiones', 'caminatas'].forEach(name => db.deleted[name].forEach(id => b.delete(root.collection(name).doc(id))));
  [['sesiones', db.sessions], ['caminatas', db.walks]].forEach(([name, list]) => {
    list.forEach(item => {
      if (!item.id) return;
      const inCloud = cloudIds[name].get(item.id);
      if (inCloud !== undefined && (item.upd || 0) <= inCloud) return;       // la nube ya tiene esta versión
      const { id, ...data } = item;
      b.set(root.collection(name).doc(id), data);
      cloudIds[name].set(id, item.upd || 0);
    });
  });
  b.commit().catch(() => { /* se reintenta en el siguiente cambio */ });
}

function listenCloud(user) {
  stopListen();
  const root = fdb.collection('users').doc(user.uid);
  unsubs.push(root.onSnapshot(snap => {
    const antes = firma();
    const d = snap.exists ? snap.data() : null;
    if (d && Array.isArray(d.rutinas) && (d.rutinasTs || 0) > (db.routinesTs || 0)) {
      db.routines = d.rutinas.map(normRoutine); db.routinesTs = d.rutinasTs; db.routinesSig = routinesSig();
      saveLocal(); renderSiCambio(antes);
    } else if (!d && db.routines.length) {
      if (!db.routinesTs) db.routinesTs = Date.now();
      db.routinesSig = routinesSig(); saveLocal(); pushNow();
    } else if (d && (d.rutinasTs || 0) < (db.routinesTs || 0)) pushNow();
  }, () => { /* sin permisos o sin red: se sigue en local */ }));
  [['sesiones', 'sessions'], ['caminatas', 'walks']].forEach(([name, key]) => {
    unsubs.push(root.collection(name).onSnapshot(snap => {
      if (snap.metadata && snap.metadata.fromCache) return;
      const antes = firma();
      const cloud = new Map(snap.docs.map(x => [x.id, x.data().upd || 0]));
      cloudIds[name] = cloud;
      const synced = new Set(db.syncedIds[name]);
      // Borrado en otro dispositivo: estaba en la nube la última vez y ya no
      db[key] = db[key].filter(x => !(synced.has(x.id) && !cloud.has(x.id)));
      const pendingDel = new Set(db.deleted[name]);
      db.deleted[name] = db.deleted[name].filter(id => cloud.has(id));   // los ya borrados de la nube se olvidan
      db.syncedIds[name] = [...cloud.keys()];
      // Editado en otro dispositivo: la versión de la nube es más nueva
      db[key] = db[key].map(x => { const c = snap.docs.find(d => d.id === x.id); return c && (c.data().upd || 0) > (x.upd || 0) ? { id: x.id, ...c.data() } : x; });
      const have = new Set(db[key].map(x => x.id));
      const add = snap.docs.filter(x => !have.has(x.id) && !pendingDel.has(x.id)).map(x => ({ id: x.id, ...x.data() }));
      if (add.length) db[key] = [...db[key], ...add];
      db[key].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
      saveLocal(); renderSiCambio(antes);
      if (db.deleted[name].length || db[key].some(x => !cloud.has(x.id) || (x.upd || 0) > cloud.get(x.id))) pushNow();
    }, () => { /* sin permisos o sin red */ }));
  });
}
function stopListen() { unsubs.forEach(u => { try { u(); } catch { /* nada */ } }); unsubs = []; clearTimeout(pushT); }

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
    if (!user) { stopListen(); return; }                  // al cerrar sesión se sigue en local
    const prev = lsGet(UID_KEY);
    if (prev && prev !== user.uid) {                      // otra cuenta: no mezclar datos
      db.routines = []; db.sessions = []; db.walks = []; delete db.routinesTs; delete db.routinesSig;
      db.deleted = { sesiones: [], caminatas: [] }; db.syncedIds = { sesiones: [], caminatas: [] };
      cloudIds = { sesiones: new Map(), caminatas: new Map() };
      saveLocal(); render();
    }
    lsSet(UID_KEY, user.uid);
    listenCloud(user);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && fuser) syncPush(); });
  window.addEventListener('online', () => { if (fuser) syncPush(); });
})();
