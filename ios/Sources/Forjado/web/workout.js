// ---------- Entreno en vivo (pantalla tipo Hevy) ----------
// Estado guardado con marcas de tiempo: si iOS cierra la app, al volver el reloj sigue donde debe.
const LIVE_KEY = 'entreno-live';
const REST_KEY = 'entreno-descansos';
// Rueda de descanso: sin descanso, de 10 en 10 s hasta 5 min y de 30 en 30 s hasta 10 min
const REST_OPTS = [0, ...Array.from({ length: 30 }, (_, i) => (i + 1) * 10), ...Array.from({ length: 10 }, (_, i) => 330 + i * 30)];
let wk = null;
let wkTimer = null, wkLock = null, wkAudio = null, wkMini = false;

const restMap = () => { try { return JSON.parse(lsGet(REST_KEY) || '{}'); } catch { return {}; } };
const restOf = name => { const m = restMap(); return name in m ? m[name] : 120; };
const saveRest = (name, s) => { const m = restMap(); m[name] = s; lsSet(REST_KEY, JSON.stringify(m)); };
// En la app de iOS, el fin del descanso se programa como notificación: suena aunque el móvil esté bloqueado.
// Se avisa solo cuando cambia (empieza, +15/−15, se salta o acaba el entreno); cada cambio en el entreno pasa por saveLive
let avisoDescanso = null;
function avisarDescanso() {
  const fin = wk?.rest?.end ?? null;
  if (fin === avisoDescanso) return;
  avisoDescanso = fin;
  try { window.webkit?.messageHandlers?.forjado?.postMessage({ t: 'descanso', fin, ejercicio: wk?.exercises?.[wk.cur]?.name || '' }); } catch { /* fuera de la app */ }
}
const saveLive = () => { lsSet(LIVE_KEY, wk ? JSON.stringify(wk) : ''); avisarDescanso(); };
const clockLong = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const restTxt = s => { const m = Math.floor(s / 60), x = s % 60; return m ? `${m}min${x ? ` ${x}s` : ''}` : `${x}s`; };
const restLabel = s => s ? restTxt(s) : 'no';
const wkVolume = () => Math.round(wk.exercises.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + (s.done ? num(s.reps) * num(s.kg) : 0), 0), 0));
const wkDone = () => wk.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);

function beep() {
  try {
    wkAudio = wkAudio || new (window.AudioContext || window.webkitAudioContext)();
    if (wkAudio.state === 'suspended') wkAudio.resume();
    [0, .22, .44].forEach((t, i) => {
      const o = wkAudio.createOscillator(), g = wkAudio.createGain();
      o.type = 'square'; o.frequency.value = i === 2 ? 1175 : 880;
      g.gain.setValueAtTime(.0001, wkAudio.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.25, wkAudio.currentTime + t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, wkAudio.currentTime + t + .18);
      o.connect(g); g.connect(wkAudio.destination); o.start(wkAudio.currentTime + t); o.stop(wkAudio.currentTime + t + .2);
    });
  } catch { /* sin audio */ }
}

async function wkWake() {
  try { wkLock = await navigator.wakeLock?.request('screen'); } catch { /* opcional */ }
}

function wkExHtml(ex, ei, cur) {
  let n = 0;
  const rows = ex.sets.map((s, si) => {
    const p = (ex.prev && ex.prev[si]) || {};
    const lab = s.w ? 'W' : ++n;
    return `<div class="wrow${s.done ? ' done' : ''}">
      <button type="button" class="sn${s.w ? ' w' : ''}" data-act="togw" data-ex="${ei}" data-set="${si}" aria-label="Alternar calentamiento">${lab}${s.pr ? '<i class="pr">PR</i>' : ''}</button>
      <span class="wprev">${p.reps ? (p.kg ? `${p.kg} kg × ${p.reps}` : `${p.reps} reps`) : '—'}</span>
      <input type="text" inputmode="decimal" placeholder="${esc(p.kg || s.tkg || '0')}" value="${esc(s.kg)}" data-f="kg" data-ex="${ei}" data-set="${si}" aria-label="Kilos">
      <input type="text" inputmode="numeric" placeholder="${esc(p.reps || s.treps || '0')}" value="${esc(s.reps)}" data-f="reps" data-ex="${ei}" data-set="${si}" aria-label="Repeticiones">
      <button type="button" class="sx chk" data-act="done" data-ex="${ei}" data-set="${si}" aria-label="Marcar serie como hecha" aria-pressed="${s.done ? 'true' : 'false'}"><svg viewBox="0 0 24 24" class="ico"><path d="M5 13l4 4L19 7"/></svg></button>
    </div>`;
  }).join('');
  const exImg = ex.image
    ? ex.ejId
      ? `<button type="button" class="ex-img-btn" onclick="showExDetail('${ex.ejId}')" aria-label="Ver ejercicio"><img src="${ex.image}"${CORS()} alt="" class="ex-img" loading="lazy"></button>`
      : `<img src="${ex.image}"${CORS()} alt="" class="ex-img" loading="lazy">`
    : '';
  return `<div class="exblock"${ei === cur ? '' : ' hidden'}>
    <div class="exhead">${exImg}<h4 class="exn">${esc(ex.name)}</h4><button type="button" class="sx" data-act="delex" data-ex="${ei}" aria-label="Quitar ejercicio"><svg viewBox="0 0 24 24" class="ico"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>
    <button type="button" class="chip" data-act="rest" data-ex="${ei}">Descanso: ${restLabel(ex.rest)}</button>
    <div class="wrow whead"><span>Serie</span><span>Anterior</span><span>KG</span><span>Reps</span><span>✓</span></div>
    ${rows}
    <button type="button" class="btn ghost small wide" data-act="addset" data-ex="${ei}">+ Añadir serie</button>
  </div>`;
}

// Solo al navegar entre ejercicios: dirección y fracción previa de la barra. wkRender lo consume y lo borra,
// así que repintar por otro motivo (añadir serie, marcar…) no anima nada.
let wkBusy = false;  // hay una transición entre ejercicios en curso
let wkNav = null;   // { dir: 'next' | 'prev', from: fracción anterior de la barra }
function wkRender() {
  if (!wk) return;
  const nav = wkNav; wkNav = null;
  // Un ejercicio a la vez: se guarda cuál es el actual (sobrevive a recargar)
  wk.cur = Math.min(Math.max(0, wk.cur || 0), Math.max(0, wk.exercises.length - 1));
  $('wk-in').innerHTML = `
    <div class="wk-head">
    <div class="wk-top">
      <button type="button" class="sx" id="wk-min" aria-label="Minimizar"><svg viewBox="0 0 24 24" class="ico"><path d="M6 9l6 6 6-6"/></svg></button>
      <h2 class="wk-title">${esc(wk.name)}</h2>
      <button type="button" class="btn primary" id="wk-finish">Terminar</button>
    </div>
    <div class="wk-stats">
      <div><small>Duración</small><b id="wk-time">0:00</b></div>
      <div><small>Volumen</small><b id="wk-vol">0</b><i>KG</i></div>
      <div><small>Series</small><b id="wk-sets">0</b></div>
    </div>
    </div>
    ${wk.exercises.length ? `<div class="wk-prog" role="progressbar" aria-label="Progreso del entreno" aria-valuemin="1" aria-valuemax="${wk.exercises.length}" aria-valuenow="${wk.cur + 1}"><i style="transform:scaleX(${(wk.cur + 1) / wk.exercises.length})"></i></div>` : ''}
    ${wk.exercises.length ? wk.exercises.map((ex, i) => wkExHtml(ex, i, wk.cur)).join('') : '<p class="wk-empty">Añade tu primer ejercicio.</p>'}
    ${wk.exercises.length ? `<nav class="wk-nav"><button type="button" class="btn ghost small" id="wk-prev" ${wk.cur <= 0 ? 'disabled' : ''}>‹ Anterior</button><span id="wk-pos">${wk.cur + 1} / ${wk.exercises.length}</span><button type="button" class="btn ghost small" id="wk-next" ${wk.cur >= wk.exercises.length - 1 ? 'disabled' : ''}>Siguiente ›</button></nav>` : ''}
    <div class="wk-add"><button type="button" class="btn ghost small" id="wk-add-ex">+ Añadir ejercicio</button></div>
    `;
  if (nav) wkAnimarNavegacion(nav);
  wkTick();
}

let wkShown = null;                                  // último volumen y series pintados
const restFill = p => { $('rest-fill').style.transform = `scaleX(${Math.min(1, Math.max(0, p)).toFixed(4)})`; };
function wkTick() {
  if (!wk) return;
  const el = $('wk-time');
  if (el) {
    el.textContent = clockLong(Math.floor((Date.now() - wk.start) / 1000));
    const vol = wkVolume(), sets = wkDone();
    $('wk-vol').textContent = vol.toLocaleString('es-ES'); $('wk-sets').textContent = sets;
    const now = Date.now(), same = wkShown && wkShown.id === wk.start;   // el número salta solo cuando cambia de verdad
    const at = { vol: same && vol !== wkShown.vol ? now : same ? wkShown.at.vol : 0, sets: same && sets !== wkShown.sets ? now : same ? wkShown.at.sets : 0 };
    // la pantalla se vuelve a pintar justo después de marcar una serie: el salto se mantiene en los elementos nuevos
    if (now - at.vol < 300 && !$('wk-vol').classList.contains('tick')) tick($('wk-vol'));
    if (now - at.sets < 300 && !$('wk-sets').classList.contains('tick')) tick($('wk-sets'));
    wkShown = { id: wk.start, vol, sets, at };
  }
  const box = $('rest');
  if (wk.rest) {
    const left = Math.ceil((wk.rest.end - Date.now()) / 1000);
    if (left <= 0) {
      const sig = wk.rest.next;
      wk.rest = null; saveLive(); beep(); vibrate([200, 100, 200, 100, 400]);
      wkAvanzar(sig);
      $('rest-time').textContent = '¡Ya!'; restFill(1); box.classList.add('go');
      setTimeout(() => { if (!wk || wk.rest) return; box.hidden = true; box.classList.remove('go'); $('wk-in').classList.remove('resting'); }, 2200);
    } else {
      box.hidden = false; box.classList.remove('go'); $('wk-in').classList.add('resting');
      $('rest-time').textContent = clockLong(left);
      restFill(1 - left / wk.rest.total);
    }
  }
  renderResume();
}

// ¿Esta serie supera lo mejor que has hecho en ese ejercicio (historial y series ya hechas hoy)? La primera vez no cuenta.
function wkIsPR(ex, si) {
  const s = ex.sets[si], kg = num(s.kg), reps = num(s.reps);
  if (s.w || kg <= 0 || reps <= 0) return false;
  let best = null;
  const eat = (k, r) => { best = best || { kg: 0, rm: 0 }; best.kg = Math.max(best.kg, k); best.rm = Math.max(best.rm, e1rm(k, r)); };
  db.sessions.forEach(ss => ss.sets.forEach(x => { if (x.exercise === ex.name && !x.w && x.kg > 0) eat(x.kg, x.reps); }));
  if (!best) return false;
  ex.sets.forEach((o, oi) => { if (oi !== si && o.done && !o.w && num(o.kg) > 0 && num(o.reps) > 0) eat(num(o.kg), num(o.reps)); });
  return kg > best.kg + 1e-9 || e1rm(kg, reps) > best.rm + 1e-9;
}

function startFreeWorkout() {
  if (wk) { wkOpen(true); return toast('Ya tienes un entreno en curso.'); }
  wk = { routineId: null, name: 'Entreno libre', start: Date.now(), rest: null, cur: 0, exercises: [] };
  saveLive();
  wkOpen(true);
  $('workout').scrollTop = 0;
  vibrate(20);
}

function wkStartRest(sec, next) {
  if (!sec) return;
  wk.rest = { end: Date.now() + sec * 1000, total: sec };
  if (next != null) wk.rest.next = next;
  saveLive(); wkTick();
}
// Acabada la última serie de un ejercicio, al terminar el descanso se pasa al siguiente (si sigues en él)
function wkAvanzar(ei) {
  if (ei == null || !wk || wk.cur !== ei || wk.cur >= wk.exercises.length - 1) return;
  $('wk-next')?.click();
}

function wkOpen(show) {
  wkMini = !show;
  $('workout').hidden = !show;
  document.body.classList.toggle('wk-open', show);
  if (show) { wkRender(); wkWake(); }
  renderResume();
}

function renderResume() {
  const box = $('wk-resume');
  if (!box) return;
  const show = !!wk && $('workout').hidden;
  box.hidden = !show;
  if (show) {
    box.innerHTML = `<button type="button" class="wk-resume-btn" id="wk-back"><span><small>Entreno en curso</small><b>${esc(wk.name)}</b></span><em id="wk-resume-t">${clockLong(Math.floor((Date.now() - wk.start) / 1000))}</em><i>Volver ›</i></button>`;
  }
}

function startWorkout(routineId) {
  if (wk) { wkOpen(true); return toast('Ya tienes un entreno en curso.'); }
  const r = db.routines.find(x => x.id === routineId);
  if (!r) return;
  wk = {
    routineId: r.id, name: r.name, start: Date.now(), rest: null, cur: 0,
    exercises: r.exercises.map(e => ({
      name: e.name, image: e.image || '', ejId: e.ejId || '', prev: lastSets(e.name), rest: restOf(e.name),
      // Las casillas empiezan vacías; lo de la vez anterior (o lo de la rutina) se ve de fondo (tkg/treps)
      sets: (e.sets.length ? e.sets : [blankSet(), blankSet(), blankSet()]).map(s => ({ w: !!s.w, kg: '', reps: '', tkg: s.kg === '' ? '' : String(s.kg), treps: s.reps === '' ? '' : String(s.reps), done: false }))
    }))
  };
  saveLive();
  wkOpen(true);
  $('workout').scrollTop = 0;
  vibrate(20);
}

// El ejercicio nuevo entra desde el lado hacia el que se avanza; la barra crece desde donde estaba
function wkAnimarNavegacion({ dir, from }) {
  const blk = $('wk-in').querySelector('.exblock:not([hidden])');
  if (blk) { blk.classList.remove('enter-next', 'enter-prev'); void blk.offsetWidth; blk.classList.add('enter-' + dir); }
  const bar = $('wk-in').querySelector('.wk-prog i');
  if (bar) {
    const fin = bar.style.transform;
    bar.style.transition = 'none'; bar.style.transform = `scaleX(${from})`;
    void bar.offsetWidth;
    bar.style.transition = ''; bar.style.transform = fin;
  }
}

function addWkExercise(name, image, ejId) {
  if (!wk) return;
  if (wk.exercises.some(x => x.name.toLowerCase() === name.toLowerCase())) return toast('Ese ejercicio ya está en el entreno');
  wk.exercises.push({ name, image: image || '', ejId: ejId || '', prev: lastSets(name), rest: restOf(name), sets: [0, 1, 2].map(() => ({ ...blankSet(), done: false })) });
  wk.cur = wk.exercises.length - 1;
  vibrate(10); saveLive(); wkRender();
  $('wk-pos')?.scrollIntoView({ block: 'center' });
}

function finishWorkout(o = {}) {
  const sets = [];
  wk.exercises.forEach(ex => ex.sets.forEach(s => { if (s.done && num(s.reps) > 0) sets.push({ exercise: ex.name, reps: num(s.reps), kg: num(s.kg), w: !!s.w }); }));
  if (!sets.length) return discardWorkout();          // sin series completas no hay entreno: se descarta
  const segundos = Math.floor((Date.now() - wk.start) / 1000);
  const ts = o.ts || Date.now();
  db.sessions.push({ id: uid(), date: o.date || localDate(), routine: o.nombre || wk.name, ...(wk.routineId ? { routineId: wk.routineId } : {}), sets, seconds: segundos, ts,
    ...(o.nota ? { nota: o.nota } : {}), ...(o.foto ? { foto: o.foto } : {}) });
  db.sessions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
  if (o.actualizar) actualizarRutina();
  salud('fuerza', segundos);
  const prs = wk.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done && s.pr).length, 0);
  wk = null; saveLive();
  try { wkLock?.release(); } catch { /* nada */ }
  $('rest').hidden = true;
  wkOpen(false);
  persist();
  // Solo la animación de entreno terminado (con los récords, si los hubo); no hay resumen después
  celebrate('Entreno terminado', prs ? `${prs} ${prs === 1 ? 'récord nuevo' : 'récords nuevos'}` : undefined);
}

function discardWorkout() {
  wk = null; saveLive(); $('rest').hidden = true;
  try { wkLock?.release(); } catch { /* nada */ }
  wkOpen(false);
  toast('Entrenamiento descartado.');
}

// Los pesos y repeticiones de las series hechas pasan a la rutina (las no hechas se quedan como estaban)
function actualizarRutina() {
  const r = db.routines.find(x => x.id === wk.routineId); if (!r) return;
  wk.exercises.forEach(ex => {
    const re = r.exercises.find(e => e.name === ex.name); if (!re) return;
    ex.sets.forEach((s, i) => {
      if (!s.done || !(num(s.reps) > 0)) return;
      const nuevo = { w: !!s.w, kg: num(s.kg) || '', reps: num(s.reps) };
      if (i < re.sets.length) re.sets[i] = nuevo; else re.sets.push(nuevo);
    });
  });
}

// «¡Entreno completado!»: nombre, fecha, foto y descripción antes de guardar
let finFoto = null;
const isoLocal = t => { const d = new Date(t), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const FOTO_ICO = '<svg viewBox="0 0 24 24" class="ico"><path d="M4 6h10M4 6v13h16v-8M8 15l3-3 3 3 2-2 4 4M17 3v6M14 6h6"/><circle cx="8.5" cy="9.5" r="1.2"/></svg>';
function openFinish() {
  finFoto = null;
  $('finish-name').value = wk.name;
  $('finish-dur').textContent = durCorta(Math.floor((Date.now() - wk.start) / 1000));
  $('finish-sets').textContent = wkDone();
  $('finish-vol').textContent = `${wkVolume().toLocaleString('es-ES')} kg`;
  $('finish-date').value = isoLocal(Date.now());
  $('finish-note').value = '';
  $('finish-photo').innerHTML = FOTO_ICO;
  $('finish-update-row').hidden = !(wk.routineId && db.routines.some(r => r.id === wk.routineId));
  $('finish-update').checked = true;
  $('finish-sheet').classList.add('show'); $('finish-sheet').setAttribute('aria-hidden', 'false');
}
function closeFinish() {
  $('discard-modal').hidden = true;
  $('finish-sheet').classList.remove('show'); $('finish-sheet').setAttribute('aria-hidden', 'true');
  $('finish-photo-file').value = '';
}
$('finish-photo-file').onchange = e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {        // como mucho 720 px de lado, en JPEG: cabe de sobra en la nube
    const k = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    finFoto = c.toDataURL('image/jpeg', .8); URL.revokeObjectURL(url);
    $('finish-photo').innerHTML = `<img src="${finFoto}" alt="">`;
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('No se pudo leer esa imagen.'); };
  img.src = url;
};
$('finish-save').onclick = () => {
  const v = $('finish-date').value, t = v ? new Date(v).getTime() : NaN;
  const o = { nombre: $('finish-name').value.trim().slice(0, 100), nota: $('finish-note').value.trim().slice(0, 1000), foto: finFoto,
    actualizar: !$('finish-update-row').hidden && $('finish-update').checked };
  if (Number.isFinite(t)) { o.ts = t; o.date = v.slice(0, 10); }
  closeFinish(); finishWorkout(o);
};
$('finish-discard').onclick = () => { $('discard-modal').hidden = false; vibrate([30, 40, 30]); };
$('discard-cancel').onclick = () => { $('discard-modal').hidden = true; };
$('discard-ok').onclick = () => { closeFinish(); discardWorkout(); };
$('finish-cancel').onclick = closeFinish;
// Escape: cierra el aviso de descartar, la pantalla de terminar o la rueda (el entreno sigue)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('discard-modal').hidden) { $('discard-modal').hidden = true; e.stopImmediatePropagation(); }
  else if ($('finish-sheet').classList.contains('show')) { closeFinish(); e.stopImmediatePropagation(); }
}, true);

// Rueda para elegir el descanso de un ejercicio: queda elegido el que está en el centro
let ruedaEx = null, ruedaSel = 120, ruedaT = null;
function marcarRueda(s) {
  ruedaSel = s;
  $('rest-wheel').querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.s === s)));
}
function centrarRueda(s, suave) {
  const w = $('rest-wheel'), o = w.querySelector(`[data-s="${s}"]`); if (!o) return;
  w.scrollTo({ top: o.offsetTop - (w.clientHeight - o.offsetHeight) / 2, behavior: suave ? 'smooth' : 'auto' });
}
function abrirRueda(ei) {
  const ex = wk.exercises[ei]; ruedaEx = ei;
  const actual = REST_OPTS.includes(ex.rest) ? ex.rest : REST_OPTS.reduce((a, s) => (Math.abs(s - ex.rest) < Math.abs(a - ex.rest) ? s : a));
  $('rest-sheet-title').textContent = ex.name;
  $('rest-wheel').innerHTML = REST_OPTS.map(s => `<button type="button" role="option" data-s="${s}" aria-selected="false">${s ? restTxt(s) : 'Sin descanso'}</button>`).join('');
  marcarRueda(actual);
  $('rest-sheet').classList.add('show'); $('rest-sheet').setAttribute('aria-hidden', 'false'); $('scrim').classList.add('show');
  requestAnimationFrame(() => centrarRueda(actual, false));
}
function cerrarRueda() { $('rest-sheet').classList.remove('show'); $('rest-sheet').setAttribute('aria-hidden', 'true'); $('scrim').classList.remove('show'); ruedaEx = null; }
$('rest-wheel').addEventListener('scroll', () => {
  clearTimeout(ruedaT);
  ruedaT = setTimeout(() => {
    const w = $('rest-wheel'), mid = w.scrollTop + w.clientHeight / 2;
    let mejor = null, d = Infinity;
    w.querySelectorAll('[data-s]').forEach(b => { const c = b.offsetTop + b.offsetHeight / 2, x = Math.abs(c - mid); if (x < d) { d = x; mejor = b; } });
    if (mejor && +mejor.dataset.s !== ruedaSel) { marcarRueda(+mejor.dataset.s); vibrate(4); }
  }, 60);
}, { passive: true });
$('rest-wheel').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; marcarRueda(+b.dataset.s); centrarRueda(+b.dataset.s, true); });
$('rest-ok').onclick = () => {
  if (wk && ruedaEx !== null && wk.exercises[ruedaEx]) {
    const ex = wk.exercises[ruedaEx]; ex.rest = ruedaSel; saveRest(ex.name, ruedaSel); saveLive(); wkRender();
  }
  cerrarRueda();
};
$('scrim').addEventListener('click', () => { if ($('rest-sheet').classList.contains('show')) cerrarRueda(); });


function bindWorkout() {
  const root = $('workout');
  root.addEventListener('input', e => {
    const t = e.target, f = t.dataset.f;
    if (!f || !wk) return;
    const s = wk.exercises[+t.dataset.ex]?.sets[+t.dataset.set];
    if (!s) return;
    s[f] = t.value; s.done = false; s.pr = false; t.closest('.wrow')?.classList.remove('done'); t.closest('.wrow')?.querySelector('.pr')?.remove();
    saveLive(); wkTick();
  });
  // Arrastrar una serie hacia un lado de la pantalla la elimina; si se suelta antes, vuelve a su sitio.
  // Con el dedo usamos eventos táctiles (cancelables) para que un gesto algo inclinado no se convierta en scroll.
  let drag = null, noClick = false;
  const dragStart = (row, x, y) => { if (row && wk) drag = { row, x0: x, y0: y, dx: 0, on: false }; };
  const dragMove = (x, y, ev, touch) => {
    if (!drag) return;
    const dx = x - drag.x0, dy = y - drag.y0;
    if (!drag.on) {
      if (touch) {
        if (Math.hypot(dx, dy) < 10) return;
        if (Math.abs(dx) <= Math.abs(dy) * .7) { drag = null; return; }              // casi vertical: scroll normal
      } else {
        if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) < 12) return;
      }
      drag.on = true; drag.row.classList.add('swiping');
      if (!touch) { try { root.setPointerCapture?.(ev.pointerId); } catch { /* opcional */ } }
      document.activeElement?.blur?.();
    }
    if (touch && ev.cancelable) ev.preventDefault();
    drag.dx = dx;
    const p = Math.min(1, Math.abs(dx) / (innerWidth * .45));
    drag.row.style.transform = `translateX(${dx}px)`;
    drag.row.style.opacity = String(1 - p * .6);
    drag.row.style.setProperty('--sw', p.toFixed(2));
    drag.row.classList.toggle('armed-del', p >= 1);
  };
  const dragEnd = ok => {
    if (!drag) return;
    const { row, dx, on } = drag; drag = null;
    if (!on) return;
    noClick = true; setTimeout(() => { noClick = false; }, 350);
    row.classList.remove('swiping', 'armed-del');
    const btn = row.querySelector('[data-ex][data-set]'), ex = wk?.exercises[+btn?.dataset.ex];
    if (ok && Math.abs(dx) >= innerWidth * .45 && ex) {
      if (ex.sets.length < 2) { toast('Mínimo una serie'); }
      else {
        row.style.transition = 'transform .15s ease-in, opacity .15s'; row.style.transform = `translateX(${dx > 0 ? innerWidth : -innerWidth}px)`; row.style.opacity = '0';
        setTimeout(() => { ex.sets.splice(+btn.dataset.set, 1); vibrate(12); saveLive(); wkRender(); }, 160);
        return;
      }
    }
    row.style.transition = 'transform .2s var(--spring), opacity .2s';
    row.style.transform = ''; row.style.opacity = ''; row.style.removeProperty('--sw');
    setTimeout(() => { row.style.transition = ''; }, 220);
  };
  const rowOf = e => e.target.closest('.wrow:not(.whead)');
  // ratón (y lápiz)
  root.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && e.button === 0) dragStart(rowOf(e), e.clientX, e.clientY); });
  root.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') dragMove(e.clientX, e.clientY, e, false); });
  root.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') dragEnd(true); });
  root.addEventListener('pointercancel', e => { if (e.pointerType !== 'touch') dragEnd(false); });
  // dedo
  root.addEventListener('touchstart', e => { if (e.touches.length === 1) dragStart(rowOf(e), e.touches[0].clientX, e.touches[0].clientY); else drag = null; }, { passive: true });
  root.addEventListener('touchmove', e => { if (e.touches.length === 1) dragMove(e.touches[0].clientX, e.touches[0].clientY, e, true); }, { passive: false });
  root.addEventListener('touchend', () => dragEnd(true));
  root.addEventListener('touchcancel', () => dragEnd(false));
  root.addEventListener('click', e => {
    if (noClick) { e.preventDefault(); e.stopPropagation(); return; }
  }, true);
  root.addEventListener('click', e => {
    if (!wk) return;
    const id = e.target.closest('button')?.id;
    if (id === 'wk-min') return wkOpen(false);
    if (id === 'wk-finish') {
      const f = $('wk-finish');
      if (!wkDone()) return discardWorkout();         // sin series hechas no hay nada que guardar
      return openFinish();
    }
    if (id === 'wk-add-ex') {
      // Mismo selector de pantalla entera que el editor de rutinas: foto, nombre en español y catálogo al día
      if (typeof openPicker !== 'function') return toast('El catálogo aún no está listo');
      return openPicker(({ name, image, id: ejId }) => addWkExercise(name, image, ejId));
    }
    if (id === 'wk-prev' || id === 'wk-next') {
      if (wkBusy) return;                            // una transición cada vez
      const dir = id === 'wk-next' ? 'next' : 'prev';
      const destino = Math.min(Math.max(0, wk.cur + (dir === 'next' ? 1 : -1)), wk.exercises.length - 1);
      if (destino === wk.cur) return;
      vibrate(6);
      // Primero sale el ejercicio actual; al terminar, se cambia y entra el nuevo
      const blk = $('wk-in').querySelector('.exblock:not([hidden])');
      const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
      wkBusy = true;
      blk?.classList.add('leave-' + dir);
      setTimeout(() => {
        wkBusy = false;
        if (!wk) return;
        wkNav = { dir, from: (wk.cur + 1) / wk.exercises.length };
        wk.cur = destino; saveLive(); wkRender();
        $('workout').scrollTop = 0;
      }, reducir ? 0 : 150);
      return;
    }
    if (id === 'rest-skip') { const sig = wk.rest?.next; wk.rest = null; saveLive(); wkAvanzar(sig); $('rest').hidden = true; $('wk-in').classList.remove('resting'); return; }
    if (id === 'rest-minus' || id === 'rest-plus') {
      if (!wk.rest) return;
      const d = id === 'rest-plus' ? 15 : -15;
      wk.rest.end += d * 1000; wk.rest.total = Math.max(1, wk.rest.total + d); saveLive(); wkTick(); return;
    }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const ei = +b.dataset.ex, ex = wk.exercises[ei], si = +b.dataset.set, act = b.dataset.act;
    if (!ex) return;
    if (act === 'addset') { const l = ex.sets[ex.sets.length - 1]; ex.sets.push(l ? { w: false, kg: '', reps: '', tkg: l.kg || l.tkg || '', treps: l.reps || l.treps || '', done: false } : { ...blankSet(), done: false }); }
    else if (act === 'delex') {
      if (!b.classList.contains('armed')) {
        b.classList.add('armed'); vibrate([30, 40, 30]);
        clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('armed'), 3000);
        return;
      }
      wk.exercises.splice(ei, 1);
    }
    else if (act === 'togw') ex.sets[si].w = !ex.sets[si].w;
    else if (act === 'rest') { abrirRueda(ei); return; }
    else if (act === 'done') {
      const s = ex.sets[si], p = (ex.prev && ex.prev[si]) || {};
      if (!s.done) {
        if (!num(s.reps) && (p.reps || s.treps)) s.reps = String(p.reps || s.treps);
        if (!num(s.kg) && (p.kg || s.tkg)) s.kg = String(p.kg || s.tkg);
        if (!num(s.reps)) { shake(b.closest('.wrow')); return toast('Pon las repeticiones'); }
      }
      s.done = !s.done;
      s.pr = s.done && wkIsPR(ex, si);
      if (s.pr) { toast(`Récord: ${ex.name} · ${s.kg} kg × ${s.reps}`); vibrate([30, 40, 30, 40, 80]); }
      if (s.done) { vibrate(15); try { wkAudio = wkAudio || new (window.AudioContext || window.webkitAudioContext)(); wkAudio.resume?.(); } catch { /* nada */ } if (!s.w) { const ultima = ex.sets.every(o => o.done || o.w); wkStartRest(ex.rest, ultima ? ei : null); if (ultima && !ex.rest) setTimeout(() => wkAvanzar(ei), 700); } }
    }
    vibrate(6);
    saveLive(); wkRender();
    if (act === 'done' && ex.sets[si] && ex.sets[si].done)   // solo salta el check que se acaba de marcar
      { const c = $('wk-in').querySelector(`[data-act="done"][data-ex="${ei}"][data-set="${si}"]`); c?.classList.add('pop'); c?.closest('.wrow')?.classList.add('pop'); }
  });
  $('wk-resume').addEventListener('click', () => wkOpen(true));
}

(function initWorkout() {
  try { const raw = lsGet(LIVE_KEY); wk = raw ? JSON.parse(raw) : null; } catch { wk = null; }
  bindWorkout();
  if (wk) wkOpen(true); else renderResume();
  setInterval(wkTick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && wk) { wkTick(); if (!$('workout').hidden) wkWake(); } });
})();
