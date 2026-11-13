// Firebase falso para los tests: auth + firestore en memoria (guardado en sessionStorage para sobrevivir a recargas).
(function () {
  if (window.firebase) return;
  const KEY = 'fake-cloud', UKEY = 'fake-user';
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const save = c => sessionStorage.setItem(KEY, JSON.stringify(c));
  const listeners = [];
  const notify = () => setTimeout(() => listeners.slice().forEach(l => l()), 0);   // asíncrono, como Firestore
  const kids = (cloud, path) => Object.keys(cloud).filter(p => p.startsWith(path + '/') && !p.slice(path.length + 1).includes('/'));
  const docRef = path => ({
    id: path.split('/').pop(), path,
    collection: n => colRef(path + '/' + n),
    set(data, opts) { const c = load(); c[path] = opts && opts.merge ? { ...(c[path] || {}), ...data } : data; save(c); notify(); return Promise.resolve(); },
    delete() { const c = load(); delete c[path]; save(c); notify(); return Promise.resolve(); },
    onSnapshot(a, b, c2) {
      const cb = typeof a === 'function' ? a : b, run = () => { const c = load(); cb({ exists: path in c, data: () => c[path], metadata: { fromCache: false } }); };
      listeners.push(run); setTimeout(run, 0); return () => { const i = listeners.indexOf(run); if (i >= 0) listeners.splice(i, 1); };
    }
  });
  const colRef = path => ({
    doc: id => docRef(path + '/' + id),
    onSnapshot(a, b, c2) {
      const cb = typeof a === 'function' ? a : b;
      const run = () => { const c = load(); cb({ metadata: { fromCache: false }, docs: kids(c, path).map(p => ({ id: p.split('/').pop(), data: () => c[p] })) }); };
      listeners.push(run); setTimeout(run, 0); return () => { const i = listeners.indexOf(run); if (i >= 0) listeners.splice(i, 1); };
    }
  });
  const fs = {
    enablePersistence: () => Promise.resolve(),
    collection: colRef,
    batch() {
      const ops = [];
      return { set(ref, data, opts) { ops.push(() => ref.set(data, opts)); }, delete(ref) { ops.push(() => ref.delete()); }, commit() { if (window.__fakeDeny) return Promise.reject({ code: 'permission-denied' }); ops.forEach(f => f()); return Promise.resolve(); } };
    }
  };
  const authCbs = [];
  let user = (() => { try { return JSON.parse(sessionStorage.getItem(UKEY) || 'null'); } catch { return null; } })();
  const auth = {
    get currentUser() { return user; },
    onAuthStateChanged(cb) { authCbs.push(cb); setTimeout(() => cb(user), 0); return () => {}; },
    signInWithPopup() { user = { uid: window.__fakeUid || 'U1', email: 'yo@ejemplo.com', displayName: 'Adrián Prueba', photoURL: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }; sessionStorage.setItem(UKEY, JSON.stringify(user)); authCbs.forEach(cb => cb(user)); return Promise.resolve({ user }); },
    signInWithRedirect() { return this.signInWithPopup(); },
    signInWithCredential(c) { window.__cred = c; return this.signInWithPopup(); },
    getRedirectResult: () => Promise.resolve(null),
    signOut() { user = null; sessionStorage.removeItem(UKEY); authCbs.forEach(cb => cb(null)); return Promise.resolve(); }
  };
  const authFn = () => auth; authFn.GoogleAuthProvider = function () { this.setCustomParameters = () => {}; };
  authFn.GoogleAuthProvider.credential = (idToken, accessToken) => ({ providerId: 'google.com', idToken, accessToken });
  window.firebase = { initializeApp() {}, firestore: () => fs, auth: authFn };
})();
