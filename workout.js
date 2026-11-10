// ---------- Entreno en vivo (pantalla tipo Hevy) ----------
// Estado guardado con marcas de tiempo: si iOS cierra la app, al volver el reloj sigue donde debe.
const LIVE_KEY = 'entreno-live';
const REST_KEY = 'entreno-descansos';
const REST_OPTS = [0, 60, 90, 120, 150, 180, 240];
let wk = null;
let wkTimer = null, wkLock = null, wkAudio = null, wkMini = false;

const restMap = () => { try { return JSON.parse(lsGet(REST_KEY) || '{}'); } catch { return {}; } };
const restOf = name => { const m = restMap(); return name in m ? m[name] : 120; };
const saveRest = (name, s) => { const m = restMap(); m[name] = s; lsSet(REST_KEY, JSON.stringify(m)); };
const saveLive = () => lsSet(LIVE_KEY, wk ? JSON.stringify(wk) : '');
const clockLong = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const restLabel = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : 'NO';
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

function wkExHtml(ex, ei) {
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
      ? `<button type="button" class="ex-img-btn" onclick="showExDetail('${ex.ejId}')" aria-label="Ver ejercicio"><img src="${ex.image}" alt="" class="ex-img" loading="lazy"></button>`
      : `<img src="${ex.image}" alt="" class="ex-img" loading="lazy">`
    : '';
  return `<div class="exblock">
    <div class="exhead">${exImg}<h4 class="exn">${esc(ex.name)}</h4><button type="button" class="sx" data-act="delex" data-ex="${ei}" aria-label="Quitar ejercicio"><svg viewBox="0 0 24 24" class="ico"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>
    <button type="button" class="chip" data-act="rest" data-ex="${ei}">Descanso: ${restLabel(ex.rest)}</button>
    <div class="wrow whead"><span>Serie</span><span>Anterior</span><span>KG</span><span>Reps</span><span>✓</span></div>
    ${rows}
    <button type="button" class="btn ghost small wide" data-act="addset" data-ex="${ei}">+ Añadir serie</button>
  </div>`;
}

function wkRender() {
  if (!wk) return;
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
    ${wk.exercises.length ? wk.exercises.map(wkExHtml).join('') : '<p class="wk-empty">Añade tu primer ejercicio.</p>'}
    <div class="wk-add"><input id="wk-new-ex" placeholder="Añadir ejercicio (ej. Dominadas)" autocomplete="off" aria-label="Nombre del ejercicio"><button type="button" class="btn ghost small" id="wk-add-ex">+ Añadir ejercicio</button></div>
    `;
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
      wk.rest = null; saveLive(); beep(); vibrate([200, 100, 200, 100, 400]);
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
  wk = { routineId: null, name: 'Entreno libre', start: Date.now(), rest: null, exercises: [] };
  saveLive();
  wkOpen(true);
  $('workout').scrollTop = 0;
  vibrate(20);
}

function wkStartRest(sec) {
  if (!sec) return;
  wk.rest = { end: Date.now() + sec * 1000, total: sec };
  saveLive(); wkTick();
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
    routineId: r.id, name: r.name, start: Date.now(), rest: null,
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

function finishWorkout() {
  const sets = [];
  wk.exercises.forEach(ex => ex.sets.forEach(s => { if (s.done && num(s.reps) > 0) sets.push({ exercise: ex.name, reps: num(s.reps), kg: num(s.kg), w: !!s.w }); }));
  if (!sets.length) return discardWorkout();          // sin series completas no hay entreno: se descarta
  db.sessions.push({ id: uid(), date: localDate(), routine: wk.name, sets, seconds: Math.floor((Date.now() - wk.start) / 1000), ts: Date.now() });
  const prs = wk.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done && s.pr).length, 0);
  wk = null; saveLive();
  try { wkLock?.release(); } catch { /* nada */ }
  $('rest').hidden = true;
  wkOpen(false);
  persist();
  // Primero la animación de entreno terminado y, cuando acaba, el resumen
  celebrate('Entreno terminado');
  const last = db.sessions[db.sessions.length - 1];
  setTimeout(() => showSummary(last, prs), 2100);
}

function discardWorkout() {
  wk = null; saveLive(); $('rest').hidden = true;
  try { wkLock?.release(); } catch { /* nada */ }
  wkOpen(false);
  toast('Entrenamiento descartado.');
}

// Pregunta al terminar con series hechas: guardar, descartar o volver
let finishArmed = null;                              // temporizador del "¿Seguro?" de Descartar
function resetFinishDiscard() {
  clearTimeout(finishArmed); finishArmed = null;
  $('finish-discard').textContent = 'Descartar';
}
function openFinish() {
  resetFinishDiscard();
  const n = wkDone();
  $('finish-sub').textContent = `${n} ${n === 1 ? 'serie hecha' : 'series hechas'}. ¿Guardas el entreno o lo descartas?`;
  $('finish-sheet').classList.add('show'); $('finish-sheet').setAttribute('aria-hidden', 'false');
  $('scrim').classList.add('show');
}
function closeFinish() {
  resetFinishDiscard();
  $('finish-sheet').classList.remove('show'); $('finish-sheet').setAttribute('aria-hidden', 'true');
  $('scrim').classList.remove('show');
}
$('finish-save').onclick = () => { closeFinish(); finishWorkout(); };
$('finish-discard').onclick = () => {
  if (finishArmed === null) {                        // primer toque: pide confirmación
    $('finish-discard').textContent = '¿Seguro? se pierde todo'; vibrate([30, 40, 30]);
    finishArmed = setTimeout(resetFinishDiscard, 3000);
    return;
  }
  closeFinish(); discardWorkout();
};
$('finish-cancel').onclick = closeFinish;

// Resumen al terminar: duración, volumen, series y mejor serie de cada ejercicio
function showSummary(session, prs) {
  const sets = session.sets, vol = sets.reduce((a, x) => a + x.kg * x.reps, 0), byEx = [];
  sets.forEach(x => {
    let e = byEx.find(b => b.name === x.exercise);
    if (!e) byEx.push(e = { name: x.exercise, n: 0, best: null });
    e.n++;
    if (!e.best || x.kg > e.best.kg || (x.kg === e.best.kg && x.reps > e.best.reps)) e.best = x;
  });
  $('summary-sub').textContent = `${session.routine}${prs ? ` · ${prs} ${prs === 1 ? 'récord' : 'récords'}` : ''}`;
  $('summary-time').textContent = clockLong(session.seconds);
  $('summary-vol').textContent = `${Math.round(vol)} kg`;
  $('summary-series').textContent = String(sets.length);
  $('summary-list').innerHTML = byEx.map(e => `<div class="sum-ex"><b>${esc(e.name)}</b><span>${e.n} ${e.n === 1 ? 'serie' : 'series'} · mejor ${e.best.kg} kg × ${e.best.reps}</span></div>`).join('');
  $('summary-sheet').classList.add('show'); $('summary-sheet').setAttribute('aria-hidden', 'false');
  $('scrim').classList.add('show');
  vibrate([40, 30, 80]);
}
function closeSummary() {
  $('summary-sheet').classList.remove('show'); $('summary-sheet').setAttribute('aria-hidden', 'true');
  $('scrim').classList.remove('show');
}
$('summary-done').onclick = closeSummary;

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
      const name = $('wk-new-ex').value.trim();
      if (!name) { shake($('wk-add-ex')); return toast('Pon el nombre del ejercicio'); }
      if (wk.exercises.some(x => x.name.toLowerCase() === name.toLowerCase())) { shake($('wk-add-ex')); return toast('Ese ejercicio ya está en el entreno'); }
      wk.exercises.push({ name, prev: lastSets(name), rest: restOf(name), sets: [0, 1, 2].map(() => ({ ...blankSet(), done: false })) });
      vibrate(10); saveLive(); wkRender();
      [...$('wk-in').querySelectorAll('.exblock')].pop()?.scrollIntoView({ block: 'center' });
      return;
    }
    if (id === 'rest-skip') { wk.rest = null; saveLive(); $('rest').hidden = true; $('wk-in').classList.remove('resting'); return; }
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
    else if (act === 'rest') { ex.rest = REST_OPTS[(REST_OPTS.indexOf(ex.rest) + 1) % REST_OPTS.length] ?? 120; saveRest(ex.name, ex.rest); }
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
      if (s.done) { vibrate(15); try { wkAudio = wkAudio || new (window.AudioContext || window.webkitAudioContext)(); wkAudio.resume?.(); } catch { /* nada */ } if (!s.w) wkStartRest(ex.rest); }
    }
    vibrate(6);
    saveLive(); wkRender();
    if (act === 'done' && ex.sets[si] && ex.sets[si].done)   // solo salta el check que se acaba de marcar
      $('wk-in').querySelector(`[data-act="done"][data-ex="${ei}"][data-set="${si}"]`)?.classList.add('pop');
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
