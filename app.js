const PHRASES = [
  'Deja de buscar excusas. Levanta el culo y muévete.',
  'Nadie va a hacerlo por ti. Ponte las zapatillas.',
  'Tu cómodo sofá te está matando poco a poco.',
  'Si estás cansado de verte así, haz algo ahora.',
  'El dolor de la disciplina pesa menos que el del arrepentimiento.',
  'No tienes ganas. Perfecto. Hazlo igual.',
  'Mientras tú dudas, otro ya está entrenando.',
  'Hoy te rindes o hoy te ganas. Elige.',
  'Tu yo de hace un año ya se rindió. No seas él.',
  'Sin excusas. Sin negociar. Fuera de casa.',
  'Estás a un paso de empezar. Da el paso.',
  'Sudar duele menos que seguir igual.',
  'La racha no se mantiene sola. Defiéndela.',
  'Veinte minutos. Es todo lo que te pido. Muévete.',
  'Nadie te va a salvar. Sal a caminar ya.',
  'Débil es el que se queda en casa. Tú no eres débil.',
  'Cada día que no entrenas, alguien te adelanta.',
  'Tu cama no te va a dar resultados.',
  'Mañana es el idioma de los que nunca empiezan.',
  'No quieres sentirte así otra vez. Levántate.',
  'El móvil no te va a hacer más fuerte. Suéltalo.',
  'Hoy no es un día de descanso. Es un día de excusas.',
  'Cuando duela, no pares. Ahí empieza a funcionar.',
  'Querer no basta. Haz.',
  'Ya has perdido demasiado tiempo pensándolo.',
  'Tu cuerpo es la única máquina que tienes. Úsala.',
  'Te mereces más que un día perdido.',
  'No eres vago. Eres alguien que aún no ha empezado.',
  'Cada repetición es un voto por el hombre que quieres ser.',
  'Rendirse es fácil. Por eso lo hace todo el mundo.',
  'Hoy vas a ganarle a tu versión perezosa.',
  'Si fuera fácil, no valdría nada. Muévete.',
  'La motivación se acaba. La disciplina no. Entrena.',
  'No cuentes los días. Haz que los días cuenten.',
  'Sal ahora o vive con ello esta noche.',
  'Te vas a arrepentir de no hacerlo. Nunca de haberlo hecho.',
  'Esos 30 minutos te los debes a ti.',
  'Haz lo que otros no quieren y tendrás lo que otros no tienen.',
  'No hay atajos. Hay esfuerzo. Ve a por él.',
  'Sigue sentado y seguirás igual.',
  'Tu racha te mira. No la decepciones.',
  'Pierde la excusa, no la racha.',
  'El cansancio miente. Tú sigues.',
  'Ponte las zapatillas antes de pensarlo.',
  'Cinco minutos y estás dentro. Empieza.',
  'No necesitas permiso. Necesitas moverte.',
  'Lo difícil es salir por la puerta. Lo demás es fácil.',
  'Hoy eliges el sudor o el sofá. Piénsalo bien.',
  'Nadie se ha arrepentido jamás de entrenar.',
  'Te estás haciendo trampas a ti mismo. Para.',
  'Esto no es un juego. Es tu cuerpo. Cuídalo.',
  'No hay mala forma física, hay poca constancia.',
  'Lo que no haces hoy se acumula mañana.',
  'Trabaja en silencio y que tus resultados hablen.',
  'Tu próximo nivel está al otro lado de la pereza.',
  'Hazlo mal, hazlo lento, pero hazlo.',
  'Una caminata mala sigue ganando a ninguna.',
  'El momento perfecto no existe. El momento es ahora.',
  'Cada excusa te cuesta un paso atrás.',
  'Estás a una decisión de sentirte mejor.',
  'Gana la mañana, gana el día. Gana la tarde, salva el día.',
  'No digas que no puedes. Di que aún no lo has intentado.',
  'Suda ahora o lamenta después.',
  'Los que te superan están haciendo lo que tú pospones.',
  'Apaga la tele y enciende el motor.',
  'Eres más fuerte que tu excusa de hoy.',
  'Tu futuro cuerpo te está mirando. Ponte las pilas.',
  'No negocies con la pereza. Siempre pide más.',
  'La flojera es una costumbre. La disciplina también. Elige.',
  'Cuando quieras parar, aguanta un poco más.',
  'Hoy no cuesta tanto como piensas. Empieza y verás.',
  'No es sacrificio. Es inversión en ti.',
  'Menos plan y más acción. Sal.',
  'Haz sufrir a la pereza, no a tus ganas.',
  'Quien quiere, encuentra el camino. Quien no, la excusa.',
  'Tienes piernas. Úsalas.',
  'La zona de confort es un cementerio de metas.',
  'No hace falta que sea perfecto. Hace falta que ocurra.',
  'Los resultados no llegan solos. Ve a buscarlos.',
  'Cada kilómetro es una victoria sobre el sofá.',
  'Ahora o nunca. Y nunca no es una opción.',
  'Eres lo que haces cada día, no lo que dices que harás.',
  'Respira, aprieta los dientes y sigue.',
  'Un día perdido son dos días de remordimiento.',
  'No te prometas. Cúmplete.',
  'Si lo piensas demasiado, no lo harás. Sal ya.',
  'La excusa de hoy es el lamento de mañana.',
  'Sé el que sale cuando todos se quedan.',
  'Te dolerá. Y luego te dolerá menos. Y luego lo agradecerás.',
  'Tu límite es solo la primera señal de que estás creciendo.',
  'No vuelvas a empezar el lunes. Empieza hoy.',
  'La pereza no paga facturas ni da resultados.',
  'Lucha contra ti mismo, es el único rival que importa.',
  'No te pido que corras. Te pido que no te quedes quieto.',
  'Haz que tu yo del futuro te dé las gracias.',
  'El esfuerzo de hoy es el orgullo de mañana.',
  'Sin sudor no hay cambio. Así de simple.',
  'Empieza mal si hace falta. Pero empieza.',
  'Hoy tienes dos opciones: ganar o poner excusas.',
  'Tu cuerpo te pide que te muevas. Escúchalo.',
  'Menos quejarte, más moverte.',
  'No termines el día debiéndote esto.',
  'Hazlo por el que eres y por el que serás.',
  'Todo lo bueno cuesta. Págalo hoy.'
];

const KEY = 'entreno-v1';
const CIRC = 2 * Math.PI * 94;
const $ = id => document.getElementById(id);
let db = null;
try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { db = null; }
if (!db || typeof db !== 'object' || Array.isArray(db)) {
  // Datos ilegibles: se guarda una copia para poder recuperarlos y se empieza en limpio, en vez de romper la app
  try { const raw = localStorage.getItem(KEY); if (raw) localStorage.setItem(KEY + '-corrupto', raw); } catch { /* sin almacenamiento */ }
  db = { routines: [], sessions: [], walks: [] };
}
// Lo que hay en el móvil es la fuente de verdad: se pide al navegador que no lo borre para liberar espacio
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch { /* nada */ }
// Las rutinas antiguas solo tenían nombres de ejercicio: se convierten al formato con series
function normRoutine(r) {
  return {
    id: r.id, name: r.name,
    exercises: (r.exercises || []).map(e => typeof e === 'string'
      ? { name: e, sets: [] }
      : { name: e.name, image: e.image || '', ejId: e.ejId || '', sets: (e.sets || []).map(s => ({ w: !!s.w, kg: s.kg || '', reps: s.reps || '' })) })
  };
}
db.routines = (db.routines || []).map(normRoutine);
db.deleted = db.deleted || { sesiones: [], caminatas: [] };        // borrados pendientes de propagar a la nube
db.syncedIds = db.syncedIds || { sesiones: [], caminatas: [] };  // ids que había en la nube la última vez
let walk = null;
let lastStreak = null;
let lastPhrase = -1;

// Guardado local: si el móvil no deja (espacio lleno, modo privado), se avisa en vez de perder datos en silencio
function guardarLocal() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch { toast('No se pudo guardar en el móvil'); return false; }
}
const persist = () => { const ok = guardarLocal(); render(); if (typeof syncPush === 'function') syncPush(); return ok; };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const activeDays = () => new Set([...db.sessions, ...db.walks].map(x => x.date));
const vibrate = p => { try { navigator.vibrate?.(p); } catch { /* iOS no lo soporta */ } };

// ---------- Feedback visual ----------
let toastT;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

let celT;
const CEL_SUBS = ['Así se hace.', 'Uno menos.', 'Mañana, otra vez.', 'No te relajes.', 'Eso es disciplina.', 'Ahora no pares.'];
function celebrate(msg, sub) {
  $('cel-msg').textContent = msg;
  $('cel-sub').textContent = sub || CEL_SUBS[Math.floor(Math.random() * CEL_SUBS.length)];
  const c = $('celebrate');
  c.classList.remove('show');
  void c.offsetWidth;                       // reinicia las animaciones
  c.classList.add('show');
  vibrate([40, 30, 80]);
  clearTimeout(celT);
  celT = setTimeout(() => c.classList.remove('show'), 2100);
}
// Un número que cambia entra con un pequeño salto (el texto ya es el definitivo: solo se anima transform y opacity)
function tick(el) {
  if (!el) return;
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
}
// Contador que sube hasta su valor: fmt(n) da el texto de cada paso y el último siempre es el exacto
function countUp(el, to, fmt = n => String(Math.round(n))) {
  if (!el) return;
  const end = fmt(to);
  if (!(to > 0) || (reduceMQ && reduceMQ.matches)) { el.textContent = end; return; }
  const t0 = performance.now(), dur = 1100;   // despacio, para poder leer el número mientras sube
  let last = '';
  el.textContent = last = fmt(0);
  const step = now => {
    if (!el.isConnected) return;
    const p = Math.max(0, Math.min(1, (now - t0) / dur)), txt = p >= 1 ? end : fmt(to * (1 - Math.pow(1 - p, 3)));
    if (txt !== last) el.textContent = last = txt;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// Sacudida para los errores: el botón tiembla y avisa
function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  vibrate([60, 40, 60]);
}

// ---------- Render ----------
// Repintar sin volver a animar las tarjetas: lo usan los avisos de la nube y el borrado
let silencio = false;
function renderSilencioso() { silencio = true; try { render(); } finally { silencio = false; } }
function render() {
  renderRoutines();
  renderStreak();
  renderToday();
  renderWeek();
  renderHistory();
  if (typeof rsRefresh === 'function') rsRefresh();
}

// Días de descanso que se perdonan por semana (0 = hace falta actividad todos los días)
const REST_KEY2 = 'entreno-descanso';
const restAllowance = () => { const v = parseInt(lsGet(REST_KEY2), 10); return [0, 1, 2, 3].includes(v) ? v : 1; };
// Cuenta los días con actividad seguidos hacia atrás desde hoy (o ayer si hoy aún se puede salvar).
// Un día vacío se perdona si en los 7 días hasta él no hay más huecos que `rest`.
function streakInfo(days, rest = restAllowance(), today = new Date()) {
  const rests = new Set(), first = [...days].sort()[0];
  if (!first) return { n: 0, rest: rests };
  const d = new Date(today), missing = [];
  if (!days.has(localDate(d))) d.setDate(d.getDate() - 1);
  let n = 0, oldest = null;
  while (localDate(d) >= first) {
    const k = localDate(d);
    if (days.has(k)) { n++; oldest = k; }
    else {
      missing.push(k);
      const near = missing.filter(m => (new Date(m + 'T12:00:00') - new Date(k + 'T12:00:00')) / 864e5 <= 6).length;
      if (near > rest) { missing.pop(); break; }
    }
    d.setDate(d.getDate() - 1);
  }
  missing.forEach(k => { if (oldest && k > oldest) rests.add(k); });   // los descansos del final no cuentan
  return { n, rest: rests };
}

function renderStreak() {
  const n = streakInfo(activeDays()).n;
  $('streak-n').textContent = n;
  if (lastStreak !== null && n !== lastStreak) tick($('streak-n'));
  $('streak').classList.toggle('hot', n > 0);
  if (lastStreak !== null && n > lastStreak) {
    $('streak').classList.remove('bump');
    void $('streak').offsetWidth;
    $('streak').classList.add('bump');
  }
  lastStreak = n;
}

function renderToday() {
  const done = activeDays().has(localDate());
  $('hero').classList.toggle('done', done);
  $('today-status').textContent = done ? 'Hoy cumpliste.' : 'Hoy no has hecho nada.';
  const lbl = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  $('today-label').textContent = lbl;
  tickClock();
}
// Cuenta atrás hasta medianoche mientras no hayas hecho nada: la presión es parte del trato
function tickClock() {
  if (activeDays().has(localDate())) { $('today-sub').textContent = 'Mañana otra vez. No te relajes.'; return; }
  const now = new Date(), end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((end - now) / 1000));
  const p = n => String(n).padStart(2, '0');
  $('today-sub').textContent = `Te quedan ${p(Math.floor(s / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)} para salvar el día`;
}
setInterval(tickClock, 1000);

// ---------- Récords (PR): más peso o más 1RM estimado (Epley) que nunca antes en ese ejercicio ----------
const e1rm = (kg, reps) => kg * (1 + reps / 30);
function computePRs() {
  const best = {}, out = {};
  [...db.sessions].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : (x.ts || 0) - (y.ts || 0))).forEach(s => {
    const seen = {}, idx = [];
    s.sets.forEach((x, i) => {
      if (x.w || !(x.kg > 0)) return;
      const rm = e1rm(x.kg, x.reps), ref = { kg: Math.max((best[x.exercise] || {}).kg || 0, (seen[x.exercise] || {}).kg || 0), rm: Math.max((best[x.exercise] || {}).rm || 0, (seen[x.exercise] || {}).rm || 0) };
      if (best[x.exercise] && (x.kg > ref.kg + 1e-9 || rm > ref.rm + 1e-9)) idx.push(i);
      seen[x.exercise] = { kg: Math.max(ref.kg, x.kg), rm: Math.max(ref.rm, rm) };
    });
    Object.entries(seen).forEach(([ex, v]) => { const b = best[ex] || { kg: 0, rm: 0 }; best[ex] = { kg: Math.max(b.kg, v.kg), rm: Math.max(b.rm, v.rm) }; });
    if (idx.length) out[s.id] = idx;
  });
  return out;
}
let prMap = {};

const CHECK_ICO = '<svg viewBox="0 0 24 24" class="ico"><path d="M5 13l4 4L19 7"/></svg>';
function renderWeek() {
  const days = activeDays();
  const first = [...days].sort()[0] || null;          // solo cuentan como fallados los días posteriores al primer registro
  const rests = streakInfo(days).rest;                // huecos perdonados por los días de descanso
  const today = new Date();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDate(d), on = days.has(key);
    const rest = !on && rests.has(key), miss = !on && !rest && i > 0 && first !== null && key > first;
    const label = d.toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase();
    out.push(`<div class="day${on ? ' on' : ''}${miss ? ' miss' : ''}${rest ? ' restday' : ''}${i === 0 ? ' today' : ''}" style="--i:${6 - i}">${label}<i>${on ? CHECK_ICO : miss ? '✕' : rest ? '–' : d.getDate()}</i></div>`);
  }
  $('week').innerHTML = out.join('');
}

// Bolsa barajada: ninguna frase se repite hasta haberlas visto todas (se recuerda entre sesiones)
const BAG_KEY = 'entreno-frases';
function nextPhraseIndex() {
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch { bag = []; }
  bag = bag.filter(i => Number.isInteger(i) && i >= 0 && i < PHRASES.length);
  if (!bag.length) {
    bag = PHRASES.map((_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) {   // Fisher-Yates
      const k = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[k]] = [bag[k], bag[i]];
    }
    if (bag[bag.length - 1] === lastPhrase) bag.unshift(bag.pop());   // que la última vista no abra la nueva ronda
  }
  const i = bag.pop();
  lsSet(BAG_KEY, JSON.stringify(bag));
  return i;
}
function newPhrase(animate = true) {
  const i = nextPhraseIndex();
  lastPhrase = i;
  const el = $('phrase');
  if (!animate) { el.textContent = PHRASES[i]; return; }
  el.classList.add('out');
  setTimeout(() => { el.textContent = PHRASES[i]; el.classList.remove('out'); }, 230);
}

// ---------- Series: kg y reps ----------
const blankSet = () => ({ w: false, kg: '', reps: '' });
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0; };
const setLabel = s => `${s.w ? 'W · ' : ''}${s.reps || '?'}${s.kg ? ` × ${s.kg} kg` : ' reps'}`;

// Una fila por serie. En el editor se puede borrar; en la sesión se marca con ✓ cuando la has hecho
function setRowsHtml(ex, ei, kind) {
  let n = 0;
  return ex.sets.map((s, si) => {
    const lab = s.w ? 'W' : ++n;
    const p = (ex.prev && ex.prev[si]) || {};
    const end = kind === 'draft'
      ? `<button type="button" class="sx" data-act="delset" data-ex="${ei}" data-set="${si}" aria-label="Quitar serie"><svg viewBox="0 0 24 24" class="ico"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`
      : `<button type="button" class="sx chk" data-act="done" data-ex="${ei}" data-set="${si}" aria-label="Serie hecha"><svg viewBox="0 0 24 24" class="ico"><path d="M5 13l4 4L19 7"/></svg></button>`;
    return `<div class="srow${s.done ? ' done' : ''}">
      <button type="button" class="sn${s.w ? ' w' : ''}" data-act="togw" data-ex="${ei}" data-set="${si}" aria-label="Alternar calentamiento">${lab}</button>
      <input type="text" inputmode="decimal" placeholder="${esc(p.kg || 'KG')}" value="${esc(s.kg)}" data-f="kg" data-ex="${ei}" data-set="${si}" aria-label="Kilos">
      <input type="text" inputmode="numeric" placeholder="${esc(p.reps || 'Reps')}" value="${esc(s.reps)}" data-f="reps" data-ex="${ei}" data-set="${si}" aria-label="Repeticiones">
      ${end}
    </div>`;
  }).join('');
}
function exBlockHtml(ex, ei, kind) {
  const exImg = ex.image
    ? ex.ejId
      ? `<button type="button" class="ex-img-btn" onclick="showExDetail('${ex.ejId}')" aria-label="Ver ejercicio"><img src="${ex.image}"${CORS()} alt="" class="ex-img" loading="lazy"></button>`
      : `<img src="${ex.image}"${CORS()} alt="" class="ex-img" loading="lazy">`
    : '';
  const head = kind === 'draft'
    ? `<input class="exname" placeholder="Ejercicio (ej. Press banca)" value="${esc(ex.name)}" data-f="name" data-ex="${ei}" aria-label="Nombre del ejercicio">
       <button type="button" class="sx" data-act="delex" data-ex="${ei}" aria-label="Quitar ejercicio"><svg viewBox="0 0 24 24" class="ico"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>`
    : `<h4 class="exn">${esc(ex.name)}</h4>`;
  const btns = kind === 'draft'
    ? `<button type="button" class="btn ghost small" data-act="addset" data-ex="${ei}">+ Añadir serie</button>`
    : `<button type="button" class="btn ghost small" data-act="addset" data-ex="${ei}">+ SERIE</button>
       <button type="button" class="btn ghost small" data-act="lastset" data-ex="${ei}"${ex.sets.length < 2 ? ' disabled' : ''}>− SERIE</button>`;
  return `<div class="exblock">
    <div class="exhead">${exImg}${head}</div>
    <div class="exbody"><div class="exbody-in">
      <div class="shead"><span>Serie</span><span>KG</span><span>Reps</span><span>${kind === 'draft' ? '' : '✓'}</span></div>
      ${setRowsHtml(ex, ei, kind)}
      <div class="setbtns">${btns}</div>
    </div></div>
  </div>`;
}
// Los inputs actualizan el estado sin repintar (así no pierdes el teclado); los botones sí repintan
// Cambia de sitio un ejercicio de la rutina (flechas o arrastrar)
function moveEx(exs, from, to) {
  if (to < 0 || to >= exs.length || from === to) return false;
  const [x] = exs.splice(from, 1);
  exs.splice(to, 0, x);
  return true;
}
// Índice del ejercicio más cercano al centro del bloque arrastrado
function destino(d) {
  const mid = d.centers[d.from] + d.dy;
  let to = d.from;
  d.centers.forEach((c, i) => { if (Math.abs(c - mid) < Math.abs(d.centers[to] - mid)) to = i; });
  return to;
}
// Mantener pulsada la cabecera de un ejercicio: se cierran sus series y se puede moverlo arrastrando
const HOLD_MS = 420;
function bindExDrag(box, getExs, rerender) {
  let timer = null, start = null, d = null;
  const cancel = () => { clearTimeout(timer); timer = null; };
  box.addEventListener('pointerdown', e => {
    const head = e.target.closest('.exhead');
    if (!head || e.target.closest('button')) return;
    const block = head.closest('.exblock');
    // Bajar el dedo sobre el nombre no lo enfoca (en iPhone abriría el teclado y movería la pantalla al mantener).
    // Si es un toque corto, se enfoca al soltar (ver abajo).
    if (e.target.matches('input.exname')) e.preventDefault();
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      timer = null;
      const blocks = [...box.querySelectorAll('.exblock')];
      document.activeElement?.blur?.();
      blocks.forEach(b => b.classList.add('is-collapsed'));   // se compactan todos los ejercicios
      block.classList.add('moving');
      d = { from: blocks.indexOf(block), y: start.y, dy: 0, block, blocks, centers: null, slot: 0 };
      vibrate(8);
    }, HOLD_MS);
  });
  box.addEventListener('pointermove', e => {
    if (!d) {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) { cancel(); start = null; }
      return;
    }
    if (!d.centers) {   // se miden al empezar a mover, cuando el colapso ya ha terminado de animarse
      d.centers = d.blocks.map(b => b.offsetTop + b.offsetHeight / 2);
      d.slot = d.blocks.length > 1 ? Math.abs(d.centers[1] - d.centers[0]) : d.block.offsetHeight;
    }
    d.dy = e.clientY - d.y;
    d.block.style.transform = `translateY(${d.dy}px)`;
    const to = destino(d);
    // los demás se apartan para dejar hueco en el sitio al que se va a soltar
    d.blocks.forEach((b, i) => {
      if (i === d.from) return;
      let sh = 0;
      if (d.from < to && i > d.from && i <= to) sh = -d.slot;
      else if (to < d.from && i >= to && i < d.from) sh = d.slot;
      b.style.transform = sh ? `translateY(${sh}px)` : '';
    });
  });
  box.addEventListener('touchmove', e => { if (d) e.preventDefault(); }, { passive: false });
  box.addEventListener('contextmenu', e => { if (e.target.closest('.exhead')) e.preventDefault(); });
  const fin = () => {
    cancel(); start = null;
    if (!d) return;
    const cur = d; d = null;
    if (cur.centers) moveEx(getExs(), cur.from, destino(cur));
    expandirAlSoltar = true;                       // al soltar, las series se despliegan con animación
    rerender();
  };
  // Toque corto sobre el nombre: se enfoca al soltar, si todavía no había empezado el mantener
  box.addEventListener('pointerup', e => { if (timer && e.target.matches('input.exname')) e.target.focus({ preventScroll: true }); });
  box.addEventListener('pointerup', fin);
  box.addEventListener('pointercancel', fin);
}
function bindSets(box, getExs, rerender) {
  box.addEventListener('input', e => {
    const t = e.target, f = t.dataset.f;
    if (!f) return;
    const ex = getExs()[+t.dataset.ex];
    if (!ex) return;
    if (f === 'name') ex.name = t.value;
    else { ex.sets[+t.dataset.set][f] = t.value; ex.sets[+t.dataset.set].done = false; t.closest('.srow')?.classList.remove('done'); }
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const exs = getExs(), ei = +b.dataset.ex, ex = exs[ei], si = +b.dataset.set, act = b.dataset.act;
    if (!ex) return;
    if (act === 'addset') { const l = ex.sets[ex.sets.length - 1]; ex.sets.push(l ? { w: false, kg: l.kg, reps: l.reps } : blankSet()); }
    else if (act === 'delset') ex.sets.splice(si, 1);
    else if (act === 'lastset') { if (ex.sets.length > 1) ex.sets.pop(); }
    else if (act === 'togw') ex.sets[si].w = !ex.sets[si].w;
    else if (act === 'delex') exs.splice(ei, 1);
    else if (act === 'done') {
      const s = ex.sets[si], p = (ex.prev && ex.prev[si]) || {};
      if (!s.done) {                                   // al marcar, se rellenan los huecos con lo de la última vez
        if (!num(s.reps) && p.reps) s.reps = String(p.reps);
        if (!num(s.kg) && p.kg) s.kg = String(p.kg);
        if (!num(s.reps)) { shake(b.closest('.srow')); return toast('Pon las repeticiones'); }
      }
      s.done = !s.done;
      if (s.done) vibrate(15);
    }
    vibrate(6);
    rerender();
  });
}

// ----- Editor de rutinas -----
const newDraft = () => ({ id: null, name: '', exercises: [] });
let creating = false;
let draft = newDraft();
function renderEditor() {
  $('editor-title').textContent = draft.id ? 'Editar rutina' : 'Nueva rutina';
  const open = !!draft.id || creating;
  $('editor-card').hidden = !open;
  $('new-routine').hidden = open;
  $('free-workout').hidden = open;
  $('editor-cancel').hidden = !open;
  $('routines-list').hidden = open;
  $('routine-save').textContent = draft.id ? 'Guardar cambios' : 'Guardar rutina';
  const del = $('routine-delete'); clearTimeout(del._t); del.classList.remove('armed'); del.textContent = 'Borrar rutina'; del.hidden = !draft.id;
  $('routine-name').value = draft.name;
  const box = $('routine-exercises');
  box.innerHTML = draft.exercises.map((ex, i) => exBlockHtml(ex, i, 'draft')).join('');
  if (expandirAlSoltar) { expandirAlSoltar = false; expandirConAnimacion(box); }
}

// Tras soltar un arrastre, las series se despliegan con la misma transición que el colapso
let expandirAlSoltar = false;
function expandirConAnimacion(box) {
  const blocks = [...box.querySelectorAll('.exblock')];
  blocks.forEach(b => b.classList.add('is-collapsed'));
  void box.offsetHeight;                           // fija el estado cerrado antes de abrirlo
  requestAnimationFrame(() => blocks.forEach(b => b.classList.remove('is-collapsed')));
}

// ----- Sesión (registrar entreno) -----
function lastSets(name) {          // lo que hiciste la última vez en este ejercicio
  for (let i = db.sessions.length - 1; i >= 0; i--) {
    const hit = db.sessions[i].sets.filter(x => x.exercise === name);
    if (hit.length) return hit.map(x => ({ kg: x.kg || '', reps: x.reps || '' }));
  }
  return [];
}
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
// Fecha para leer: Hoy, Ayer, Hace 3 días o 8 nov (con el año si no es el actual)
const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function whenText(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso || '');
  const days = Math.round((new Date(localDate() + 'T12:00:00') - new Date(y, m - 1, d, 12)) / 864e5);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days > 1 && days < 7) return `Hace ${days} días`;
  return `${d} ${MES_CORTO[m - 1]}${y === new Date().getFullYear() ? '' : ' ' + y}`;
}
const EMPTY_ICO = {
  rutinas: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/></svg>',
  historial: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>'
};
const emptyHtml = (ico, title, text) => `<div class="empty">${EMPTY_ICO[ico]}<b>${title}</b>${text}</div>`;
// Grupos musculares de una rutina: la parte principal de cada ejercicio, sin repetir y en orden de aparición
const GRUPO = {
  'Abdominals': 'Abdomen', 'Abductors': 'Abductor', 'Adductors': 'Aductor', 'Biceps': 'Bíceps', 'Calves': 'Gemelo',
  'Cardio': 'Cardio', 'Chest': 'Pecho', 'Forearms': 'Antebrazo', 'Full Body': 'Cuerpo completo', 'Glutes': 'Glúteo',
  'Hamstrings': 'Isquiotibial', 'Lats': 'Espalda', 'Lower Back': 'Lumbar', 'Neck': 'Cuello', 'Quadriceps': 'Cuádriceps',
  'Shoulders': 'Hombro', 'Traps': 'Trapecio', 'Triceps': 'Tríceps', 'Upper Back': 'Espalda alta',
};
function gruposRutina(r) {
  // ejCache lo declara ejercicios.js, que carga después: al arrancar aún no existe
  if (typeof ejCache === 'undefined' || !ejCache) return [];
  const partes = [];
  r.exercises.forEach(ex => {
    const cat = ex.ejId && ejCache.find(c => c.id === ex.ejId);
    const g = cat && GRUPO[cat.body_part];
    if (g && !partes.includes(g)) partes.push(g);
  });
  return partes.slice(0, 4);
}

function renderRoutines() {
  $('routines-list').innerHTML = db.routines.map(r => {
    const sets = r.exercises.reduce((n, e) => n + e.sets.length, 0);
    const last = db.sessions.filter(s => String(s.routine).toLowerCase() === String(r.name).toLowerCase()).map(s => s.date).sort().pop();
    const grupos = gruposRutina(r);
    return `
    <div class="card routine">
      <button type="button" class="rhead" data-open-routine="${r.id}" aria-label="Abrir ${esc(r.name)}">
        <span class="rtitle"><b>${esc(r.name)}</b><small>${plural(r.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(sets, 'serie', 'series')} · ${last ? whenText(last) : 'Sin estrenar'}</small></span>
        <svg viewBox="0 0 24 24" class="ico chev"><path d="M9 5l7 7-7 7"/></svg>
      </button>
      ${grupos.length ? `<div class="rtags">${grupos.map(g => `<span>${esc(g)}</span>`).join('')}</div>` : ''}
      <div class="ractions">
        <button type="button" class="btn primary" data-start-routine="${r.id}">Comenzar</button>
        <button type="button" class="btn" data-edit-routine="${r.id}">Editar</button>
      </div>
    </div>`;
  }).join('') || emptyHtml('rutinas', 'Aún no tienes rutinas', 'Pulsa «Crear rutina» para montar la primera, o empieza un «Entreno libre» y añade ejercicios sobre la marcha.');
}

const openEntries = new Set();           // entrenos con el detalle desplegado (solo en pantalla)
let histQuiet = false;                    // el próximo repintado no vuelve a animar las tarjetas (abrir detalle, menú)
const durText = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`; };
function sessionHtml(s) {
  const groups = [], prs = prMap[s.id] || [];
  s.sets.forEach((x, i) => { let g = groups.find(g => g.name === x.exercise); if (!g) groups.push(g = { name: x.exercise, sets: [], idx: [] }); g.sets.push(x); g.idx.push(i); });
  const vol = Math.round(s.sets.reduce((a, x) => a + (x.reps || 0) * (x.kg || 0), 0));
  const work = s.sets.length, open = openEntries.has(s.id);
  const stat = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
  const rest = Math.max(0, groups.length - 3);
  return `<div class="entry-head"><span class="tag">${esc(s.routine)}</span><small title="${esc(s.date)}">${whenText(s.date)}</small>${menuBtn('session', s.id)}</div>${entryMenu('session', s.id)}
    <div class="hstats">${s.seconds ? stat('Tiempo', durText(s.seconds)) : ''}${vol ? stat('Volumen', `${vol.toLocaleString('es-ES')} kg`) : ''}${stat('Series', work)}</div>
    <div class="hsums"${open ? ' hidden' : ''}>${groups.slice(0, 3).map(g => { const n = g.sets.length; return `<div class="hsum"><b>${n}</b> ${n === 1 ? 'serie' : 'series'} · ${esc(g.name)}</div>`; }).join('')}</div>
    <div class="hdetail"${open ? '' : ' hidden'}>${groups.map(g => { let n = 0; return `<div class="hex"><b>${esc(g.name)}</b>${g.sets.map((x, j) =>
      `<div class="hset"><span class="hn${x.w ? ' w' : ''}">${x.w ? 'W' : ++n}</span><span>${x.kg ? x.kg + ' kg' : '—'}${prs.includes(g.idx[j]) ? '<i class="pr">PR</i>' : ''}</span><span>${x.reps} reps</span></div>`).join('')}</div>`; }).join('')}</div>
    <button type="button" class="hmore" data-toggle-entry="${s.id}" aria-expanded="${open}">${open ? 'Ver menos' : rest ? `Ver ${rest} ${rest === 1 ? 'ejercicio más' : 'ejercicios más'}` : 'Ver detalle'}</button>`;
}

// Botón ⋯ de cada tarjeta del historial; al tocarlo se abre un menú con Editar y Borrar
let menuEntry = null;                     // 'session:ID' | 'walk:ID' con el menú abierto
const DOTS_ICO = '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
const menuBtn = (kind, id) => `<button type="button" class="more-btn" data-menu="${kind}:${id}" aria-label="Más opciones" aria-expanded="${menuEntry === kind + ':' + id}">${DOTS_ICO}</button>`;
const entryMenu = (kind, id) => menuEntry === kind + ':' + id
  ? `<div class="entry-menu" role="menu"><button type="button" role="menuitem" data-edit-${kind}="${id}">Editar</button><button type="button" role="menuitem" class="danger" data-del-${kind}="${id}">Borrar</button></div>` : '';
let editingEntry = null;                  // {kind, id, draft}: la entrada del historial que se está editando
const KEY_OF = { session: 'sessions', walk: 'walks' };
function startEditEntry(kind, id) {
  const e = db[KEY_OF[kind]].find(x => x.id === id);
  if (!e) return;
  if (kind === 'session') {
    const exercises = [];
    e.sets.forEach(x => {
      let g = exercises.find(g => g.name === x.exercise);
      if (!g) exercises.push(g = { name: x.exercise, image: '', ejId: '', sets: [] });
      g.sets.push({ w: !!x.w, kg: x.kg ? String(x.kg) : '', reps: String(x.reps) });
    });
    editingEntry = { kind, id, draft: { date: e.date, exercises } };
    completarFotos(editingEntry.draft.exercises);
    if (!ejCache) loadEjercicios().then(() => { if (editingEntry && editingEntry.id === id) { completarFotos(editingEntry.draft.exercises); histQuiet = true; renderHistory(); } }).catch(() => {});
  } else editingEntry = { kind, id, draft: { date: e.date, min: String(Math.round(e.seconds / 60)), km: String(e.meters / 1000) } };
  renderHistory();
  window.scrollTo(0, 0);
}
// Las sesiones guardan solo el nombre: la foto y el id se buscan por nombre (en las rutinas, o en el catálogo)
function fotoDeEjercicio(name) {
  const key = sinAcentos(name);
  const deRutina = db.routines.flatMap(r => r.exercises).find(x => x.image && sinAcentos(x.name) === key);
  if (deRutina) return { image: deRutina.image, ejId: deRutina.ejId || '' };
  if (!ejCache) return null;
  const hit = ejCache.find(e => (e.thumbnail || (e.sourceType === 'image' && e.source)) && [tradName(e.name), e.name].some(k => sinAcentos(k) === key));
  return hit ? { image: hit.thumbnail || hit.source, ejId: hit.id } : null;
}
function completarFotos(exs) {
  exs.forEach(ex => { if (ex.image) return; const f = fotoDeEjercicio(ex.name); if (f) { ex.image = f.image; ex.ejId = f.ejId; } });
}
function entryEditorHtml(kind, e) {
  const d = editingEntry.draft;
  const head = `<div class="entry-head"><span class="tag${kind === 'walk' ? ' walk-tag' : ''}">${kind === 'walk' ? 'Caminata' : esc(e.routine)}</span><button type="button" class="link" id="entry-cancel">Cancelar</button></div>
    <input type="date" id="entry-date" value="${esc(d.date)}" aria-label="Fecha">`;
  const body = kind === 'session'
    ? d.exercises.map((ex, i) => exBlockHtml(ex, i, 'draft')).join('')
    : `<div class="wedit"><label>Minutos<input id="entry-min" type="text" inputmode="decimal" value="${esc(d.min)}"></label>
        <label>KM<input id="entry-km" type="text" inputmode="decimal" value="${esc(d.km)}"></label></div>`;
  return `<div class="entry-editor">${head}${body}<div class="eactions"><button type="button" class="btn primary wide" id="entry-save">Guardar cambios</button></div></div>`;
}
function saveEditEntry() {
  const { kind, id, draft: d } = editingEntry, e = db[KEY_OF[kind]].find(x => x.id === id);
  if (!e) { editingEntry = null; return renderHistory(); }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? d.date : e.date;
  if (kind === 'session') {
    const sets = d.exercises.flatMap(ex => ex.name.trim() ? ex.sets.filter(s => num(s.reps) > 0).map(s => ({ exercise: ex.name.trim(), reps: num(s.reps), kg: num(s.kg), w: !!s.w })) : []);
    if (!sets.length) { shake($('entry-save')); return toast('Necesitas al menos una serie con repeticiones'); }
    e.sets = sets;
  } else {
    const min = num(d.min), km = num(d.km);
    if (!min) { shake($('entry-save')); return toast('Pon los minutos'); }
    e.seconds = Math.round(min * 60); e.meters = Math.round(km * 1000);
  }
  e.date = date; e.upd = Date.now();
  editingEntry = null;
  if (persist()) toast('Cambios guardados.');
}
function deleteEntry(kind, id) {
  const key = kind === 'session' ? 'sessions' : 'walks', name = kind === 'session' ? 'sesiones' : 'caminatas';
  db[key] = db[key].filter(x => x.id !== id);
  if (lsGet('entreno-uid') && !db.deleted[name].includes(id)) db.deleted[name].push(id);   // para que no vuelva desde la nube
  histQuiet = true;                                                                          // las demás tarjetas no se reanimen
  if (persist()) toast('Borrado.');
}
// Borrar pide un segundo toque: el botón se pone rojo y, si no confirmas, se desarma solo
bindSets($('history-list'), () => (editingEntry && editingEntry.kind === 'session' ? editingEntry.draft.exercises : []), () => renderHistory());
$('history-list').addEventListener('input', e => {
  if (!editingEntry) return;
  const d = editingEntry.draft, id = e.target.id;
  if (id === 'entry-date') d.date = e.target.value; else if (id === 'entry-min') d.min = e.target.value; else if (id === 'entry-km') d.km = e.target.value;
});
document.addEventListener('click', e => {      // tocar fuera del menú ⋯ lo cierra
  if (menuEntry && !e.target.closest('.entry-menu, [data-menu]')) { menuEntry = null; renderHistory(); }
});
$('history-list').addEventListener('click', e => {
  const dots = e.target.closest('[data-menu]');
  if (dots) { menuEntry = menuEntry === dots.dataset.menu ? null : dots.dataset.menu; vibrate(6); histQuiet = true; return renderHistory(); }
  const more = e.target.closest('[data-toggle-entry]');
  if (more) { const id = more.dataset.toggleEntry; openEntries.has(id) ? openEntries.delete(id) : openEntries.add(id); vibrate(6); histQuiet = true; return renderHistory(); }
  const ed = e.target.closest('[data-edit-session], [data-edit-walk]');
  if (ed) { menuEntry = null; return startEditEntry(ed.dataset.editSession ? 'session' : 'walk', ed.dataset.editSession || ed.dataset.editWalk); }
  if (e.target.closest('#entry-cancel')) { editingEntry = null; return renderHistory(); }
  if (e.target.closest('#entry-save')) return saveEditEntry();
  const b = e.target.closest('[data-del-session], [data-del-walk]');
  if (!b) return;
  if (!b.classList.contains('armed')) {
    b.classList.add('armed'); b.textContent = '¿Seguro?'; vibrate([30, 40, 30]);
    clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Borrar'; }, 3000);
    return;
  }
  clearTimeout(b._t);
  b.dataset.delSession ? deleteEntry('session', b.dataset.delSession) : deleteEntry('walk', b.dataset.delWalk);
});
function renderHistory() {
  const quiet = histQuiet || silencio; histQuiet = false;
  prMap = computePRs();
  const km = db.walks.reduce((a, w) => a + w.meters, 0) / 1000;
  const stats = [
    [db.sessions.length, 'entrenos'],
    [db.walks.length, 'caminatas'],
    [km.toFixed(1), 'km']
  ];
  $('stats').innerHTML = stats.map((s, i) => `<div class="stat"><b data-v="${s[0]}">${s[0]}</b><span>${s[1]}</span></div>`).join('');
  $('stats').classList.toggle('quiet', quiet);

  const items = [
    ...db.sessions.map(s => ({
      date: s.date,
      editing: !!editingEntry && editingEntry.kind === 'session' && editingEntry.id === s.id,
      html: editingEntry && editingEntry.kind === 'session' && editingEntry.id === s.id ? entryEditorHtml('session', s) : sessionHtml(s)
    })),
    ...db.walks.map(w => ({
      date: w.date,
      editing: !!editingEntry && editingEntry.kind === 'walk' && editingEntry.id === w.id,
      html: editingEntry && editingEntry.kind === 'walk' && editingEntry.id === w.id ? entryEditorHtml('walk', w) : `<div class="entry-head"><span class="tag walk-tag">Caminata</span><small title="${esc(w.date)}">${whenText(w.date)}</small>${menuBtn('walk', w.id)}</div>${entryMenu('walk', w.id)}
        <ul><li><span>${Math.round(w.seconds / 60)} min</span><em>${(w.meters / 1000).toFixed(2)} km</em></li></ul>`
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  $('stats').hidden = !!editingEntry || !items.length;                 // al editar solo se ve la entrada; sin datos, ni tres ceros
  const shown = editingEntry ? items.filter(i => i.editing) : items;
  $('history-list').innerHTML = shown.map(i => `<div class="card entry">${i.html}</div>`).join('')
    || emptyHtml('historial', 'Todavía no hay nada aquí', 'Empieza un entreno desde «Rutinas» o una caminata desde «Hoy» y aparecerá en esta lista.');
  $('history-list').classList.toggle('quiet', quiet);
}

// ---------- Tabs ----------
const tabs = [...document.querySelectorAll('.tabbar button')];
function moveIndicator() {
  const i = tabs.findIndex(b => b.classList.contains('active'));
  $('indicator').style.transform = `translateX(${i * 100}%)`;
}
tabs.forEach(btn => {
  btn.onclick = () => {
    if (btn.classList.contains('active')) return;
    if (editingEntry) { editingEntry = null; renderHistory(); }   // cambiar de pestaña cancela la edición del historial
    if (creating || draft.id) { draft = newDraft(); creating = false; renderEditor(); }   // y también crear o editar una rutina
    // Primero arriba y sin animación: si el contenido se acorta con la página desplazada, iOS rebota y la barra fija se mueve
    window.scrollTo(0, 0);
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === btn.dataset.tab));
    tabs.forEach(n => n.classList.toggle('active', n === btn));
    moveIndicator();
    if (btn.dataset.tab === 'tab-historial')
      document.querySelectorAll('#stats .stat b').forEach(b => { const v = b.dataset.v, dec = (v.split('.')[1] || '').length; countUp(b, parseFloat(v), n => n.toFixed(dec)); });
    vibrate(8);
  };
});

// ---------- Rutinas ----------
bindSets($('routine-exercises'), () => draft.exercises, renderEditor);
bindExDrag($('routine-exercises'), () => draft.exercises, renderEditor);
$('routine-name').addEventListener('input', e => { draft.name = e.target.value; });
$('add-exercise').onclick = () => {
  if (typeof openPicker === 'function') {
    openPicker(({ name, image, id }) => { draft.exercises.push({ name, image: image || '', ejId: id || '', sets: [blankSet(), blankSet(), blankSet()] }); renderEditor(); vibrate(8); });
  } else {
    draft.exercises.push({ name: '', sets: [blankSet(), blankSet(), blankSet()] }); renderEditor(); vibrate(8);
  }
};
$('free-workout').onclick = () => startFreeWorkout();
$('new-routine').onclick = () => { creating = true; draft = newDraft(); renderEditor(); vibrate(8); window.scrollTo(0, 0); };
$('editor-cancel').onclick = () => { draft = newDraft(); creating = false; renderEditor(); };

$('routine-save').onclick = () => {
  const name = draft.name.trim();
  const exercises = draft.exercises
    .map(ex => ({ name: ex.name.trim(), image: ex.image || '', ejId: ex.ejId || '', sets: ex.sets.map(s => ({ w: !!s.w, kg: num(s.kg) || '', reps: num(s.reps) || '' })) }))
    .filter(ex => ex.name);
  if (!name || !exercises.length) { shake($('routine-save')); return toast('Nombre y ejercicios. Completa la rutina.'); }
  const mine = db.routines.find(r => r.id === draft.id);
  if (mine) { mine.name = name; mine.exercises = exercises; } else db.routines.push({ id: uid(), name, exercises });
  const edited = !!mine;
  draft = newDraft(); creating = false;
  renderEditor();
  if (persist()) toast(edited ? 'Rutina actualizada.' : 'Rutina guardada. Ahora a trabajar.');
};

$('routines-list').onclick = e => {
  const start = e.target.closest('[data-start-routine]'), edit = e.target.closest('[data-edit-routine]'), open = e.target.closest('[data-open-routine]');
  if (start) return startWorkout(start.dataset.startRoutine);
  if (edit) return editRoutine(edit.dataset.editRoutine);
  if (open && typeof rsOpen === 'function') rsOpen(open.dataset.openRoutine);
};
function editRoutine(id) {
  const r = db.routines.find(x => x.id === id);
  if (!r) return;
  draft = { id: r.id, name: r.name, exercises: r.exercises.map(ex => ({ name: ex.name, image: ex.image || '', ejId: ex.ejId || '', sets: (ex.sets.length ? ex.sets : [blankSet(), blankSet(), blankSet()]).map(s => ({ w: !!s.w, kg: s.kg === '' ? '' : String(s.kg), reps: s.reps === '' ? '' : String(s.reps) })) })) };
  renderEditor();
  window.scrollTo(0, 0);
}
// Borrar vive en el editor y pide un segundo toque: el botón se pone rojo y, si no confirmas, se desarma solo
$('routine-delete').onclick = () => {
  const del = $('routine-delete');
  if (!del.classList.contains('armed')) {
    del.classList.add('armed');
    del.textContent = '¿Seguro?';
    vibrate([30, 40, 30]);
    clearTimeout(del._t);
    del._t = setTimeout(() => { del.classList.remove('armed'); del.textContent = 'Borrar rutina'; }, 3000);
    return;
  }
  clearTimeout(del._t);
  const id = draft.id;
  db.routines = db.routines.filter(r => r.id !== id);
  draft = newDraft(); creating = false;
  renderEditor();
  if (persist()) toast('Rutina borrada.');
};

// ---------- Caminar ----------
const hav = (a, b) => {
  const R = 6371000, toR = x => x * Math.PI / 180;
  const dLat = toR(b.latitude - a.latitude), dLon = toR(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.latitude)) * Math.cos(toR(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const setRing = p => { $('ring-bar').style.strokeDashoffset = CIRC * (1 - Math.min(1, Math.max(0, p))); };
const walkCard = () => document.querySelector('.walk');

function updateGoalLabel() {
  if (walk) return;
  const g = Math.max(1, Number($('walk-goal').value) || 20);
  $('walk-sub').textContent = `De ${fmt(g * 60)}`;
}

function tickWalk() {
  if (!walk) return;
  const elapsed = Math.floor((Date.now() - walk.start) / 1000);
  const left = walk.goal - elapsed;
  const p = elapsed / walk.goal;
  $('walk-timer').textContent = fmt(elapsed);
  $('walk-sub').textContent = `De ${fmt(walk.goal)}`;
  $('walk-dist').textContent = (walk.meters / 1000).toFixed(2);
  $('walk-pct').textContent = Math.min(100, Math.round(p * 100));
  setRing(p);
  // El botón siempre funciona: antes del objetivo es RENDIRSE (no cuenta), después TERMINAR (guarda)
  const fin = $('walk-finish');
  fin.disabled = false;
  if (left > 0) { fin.classList.add('quit'); if (!fin.classList.contains('armed')) fin.textContent = 'Rendirse'; }
  else { fin.classList.remove('quit', 'armed'); fin.textContent = 'Terminar'; }
  walkCard().classList.toggle('complete', left <= 0);
  if (left > 0) $('walk-hint').textContent = `Faltan ${fmt(left)}. No pares.`;
  else if (!walk.done) {
    walk.done = true;
    saveWalk();
    $('walk-hint').textContent = 'Objetivo cumplido. Ya puedes terminar.';
    vibrate([30, 50, 30]);
    toast('Objetivo cumplido. Eso es.');
  }
}

// El estado de la caminata se guarda con marcas de tiempo: si iOS cierra la app, al volver el reloj sigue donde debe
const WALK_KEY = 'entreno-walk', WALK_MAX_AGE = 12 * 3600 * 1000;
const saveWalk = () => lsSet(WALK_KEY, walk ? JSON.stringify({ start: walk.start, goal: walk.goal, meters: Math.round(walk.meters), done: walk.done }) : '');

async function runWalk(w) {                    // arranca (o reanuda) la caminata con el estado w
  walk = Object.assign({ last: null, watchId: null, timer: null, lock: null, done: false, meters: 0 }, w);
  walkCard().classList.add('running');
  $('walk-goal').value = Math.round(walk.goal / 60);
  $('walk-goal').disabled = true;
  $('walk-start').disabled = true;

  if ('geolocation' in navigator) {
    walk.watchId = navigator.geolocation.watchPosition(pos => {
      if (!walk) return;
      const p = pos.coords;
      if (p.accuracy > 30) return;
      if (walk.last) {
        const d = hav(walk.last, p);
        if (d > 2 && d < 100) { walk.meters += d; saveWalk(); }
      }
      walk.last = p;
    }, () => { $('walk-hint').textContent = 'Sin GPS: solo cuenta el tiempo.'; }, { enableHighAccuracy: true });
  }

  walk.timer = setInterval(tickWalk, 1000);
  tickWalk();
  try { walk.lock = await navigator.wakeLock?.request('screen'); } catch { /* opcional */ }
}

$('walk-start').onclick = () => {
  if (walk) return;
  const goalMin = Math.max(1, Number($('walk-goal').value) || 20);
  runWalk({ start: Date.now(), goal: goalMin * 60 });
  saveWalk();
  vibrate(15);
};

function resetFinishBtn() {
  const fin = $('walk-finish');
  clearTimeout(resetFinishBtn.t);
  fin.disabled = true;
  fin.classList.remove('quit', 'armed');
  fin.textContent = 'Rendirse';
}

function stopWalk() {
  if (!walk) return null;
  const w = walk;
  walk = null;
  saveWalk();
  clearInterval(w.timer);
  if (w.watchId !== null) navigator.geolocation.clearWatch(w.watchId);
  if (w.lock) w.lock.release().catch(() => {});
  walkCard().classList.remove('running', 'complete');
  $('walk-start').disabled = false;
  resetFinishBtn();
  $('walk-goal').disabled = false;
  $('walk-timer').textContent = '00:00';
  $('walk-dist').textContent = '0.00';
  $('walk-pct').textContent = '0';
  $('walk-hint').textContent = 'Mantén la app abierta. No te quedes parado.';
  setRing(0);
  updateGoalLabel();
  return w;
}

$('walk-finish').onclick = () => {
  if (!walk) return;
  const fin = $('walk-finish');
  const seconds = Math.floor((Date.now() - walk.start) / 1000);
  if (seconds < walk.goal) {
    // Rendirse pide un segundo toque para evitar paradas sin querer
    if (!fin.classList.contains('armed')) {
      fin.classList.add('armed');
      fin.textContent = '¿Seguro?';
      vibrate([30, 40, 30]);
      toast('Toca otra vez para rendirte');
      clearTimeout(resetFinishBtn.t);
      resetFinishBtn.t = setTimeout(() => { fin.classList.remove('armed'); fin.textContent = 'Rendirse'; }, 3000);
      return;
    }
    stopWalk();
    shake($('walk-start'));
    toast(`Te has rendido a los ${fmt(seconds)}. Esta no cuenta.`);
    return;
  }
  const w = stopWalk();
  db.walks.push({ id: uid(), date: localDate(), seconds, meters: Math.round(w.meters), ts: Date.now() });
  persist();
  celebrate('Caminata hecha');
};

$('walk-goal').oninput = updateGoalLabel;

// ---------- Ajustes: tema ----------
const THEME_KEY = 'entreno-tema';
const THEME_BG = { light: '#eef2f9', dark: '#0c0d10' };
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
const lightMQ = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
// Fotos de ejercicios: se piden con CORS para que el service worker pueda guardarlas y verse sin conexión.
// Si el servidor no lo permite (o falla), se reintenta una vez sin CORS y se deja de pedir en esta sesión.
let corsFotos = true;
const CORS = () => corsFotos ? ' crossorigin="anonymous"' : '';
document.addEventListener('error', e => {
  const i = e.target;
  if (!i || i.tagName !== 'IMG' || !i.hasAttribute('crossorigin') || i.dataset.retry) return;
  corsFotos = false; i.dataset.retry = '1'; i.removeAttribute('crossorigin');
  i.setAttribute('src', i.getAttribute('src'));
}, true);

const reduceMQ = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;

function fadeTheme() {
  if (reduceMQ && reduceMQ.matches) return;
  const r = document.documentElement;
  r.classList.add('theming');
  clearTimeout(fadeTheme.t);
  fadeTheme.t = setTimeout(() => r.classList.remove('theming'), 480);
}
// La barra del navegador toma el color del tema efectivo
function syncThemeColor() {
  const t = document.documentElement.dataset.theme;
  const eff = t === 'auto' ? (lightMQ && lightMQ.matches ? 'light' : 'dark') : t;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.content = THEME_BG[eff] || THEME_BG.dark; });
}
function applyTheme(t, animate) {
  const v = ['light', 'dark', 'auto'].includes(t) ? t : 'dark';
  if (animate) fadeTheme();
  document.documentElement.dataset.theme = v;
  document.querySelectorAll('[data-tema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tema === v)));
  syncThemeColor();
}
if (lightMQ && lightMQ.addEventListener) lightMQ.addEventListener('change', syncThemeColor);
applyTheme(lsGet(THEME_KEY));
document.querySelectorAll('[data-tema]').forEach(b => b.onclick = () => { lsSet(THEME_KEY, b.dataset.tema); applyTheme(b.dataset.tema, true); vibrate(8); });

// ---------- Calendario de días entrenados ----------
let calMonth = null, calSel = null, calView = 'mes';   // calMonth = 'AAAA-MM'
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function renderCal() {
  const [y, m] = calMonth.split('-').map(Number);
  const days = activeDays(), today = localDate();
  const year = calView === 'anio';
  $('cal-grid').hidden = year; $('cal-dow').hidden = year; $('cal-year').hidden = !year;
  document.querySelectorAll('[data-calview]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.calview === calView)));
  if (year) {
    const inYear = [...days].filter(d => d.startsWith(String(y))).length;
    $('cal-month').textContent = String(y);
    $('cal-summary').textContent = `${inYear} ${inYear === 1 ? 'día' : 'días'} en ${y} · ${days.size} en total`;
    $('cal-next').disabled = y >= Number(today.slice(0, 4));
    $('cal-prev').setAttribute('aria-label', 'Año anterior'); $('cal-next').setAttribute('aria-label', 'Año siguiente');
    renderYear(y, days, today);
  } else {
    const inMonth = [...days].filter(d => d.startsWith(calMonth)).length;
    $('cal-month').textContent = `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`;
    $('cal-summary').textContent = `${inMonth} ${inMonth === 1 ? 'día' : 'días'} este mes · ${days.size} en total`;
    $('cal-next').disabled = calMonth >= today.slice(0, 7);
    $('cal-prev').setAttribute('aria-label', 'Mes anterior'); $('cal-next').setAttribute('aria-label', 'Mes siguiente');
    const first = [...days].sort()[0] || null, rests = streakInfo(days).rest;
    const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7, n = new Date(y, m, 0).getDate();
    let out = '<span></span>'.repeat(lead);
    for (let d = 1; d <= n; d++) {
      const key = `${calMonth}-${String(d).padStart(2, '0')}`, on = days.has(key);
      const rest = !on && rests.has(key), miss = !on && !rest && key < today && first !== null && key > first;
      out += `<button type="button" class="cd${on ? ' on' : ''}${miss ? ' miss' : ''}${rest ? ' restday' : ''}${key === today ? ' today' : ''}${key === calSel ? ' sel' : ''}" data-date="${key}">${on ? CHECK_ICO : miss ? '✕' : rest ? '–' : d}</button>`;
    }
    $('cal-grid').innerHTML = out;
  }
  renderCalDay();
}
// Vista anual tipo mapa de calor: una columna por semana (lunes arriba), un cuadrado por día
function renderYear(y, days, today) {
  const jan1 = new Date(y, 0, 1), lead = (jan1.getDay() + 6) % 7, n = Math.round((new Date(y + 1, 0, 1) - jan1) / 864e5);
  const cols = Math.ceil((lead + n) / 7);
  let out = '';
  // Etiqueta de cada mes sobre la columna donde el mes ya domina (si el día 1 cae de viernes a domingo, la siguiente)
  for (let i = 0; i < 12; i++) {
    const p = lead + Math.round((new Date(y, i, 1) - jan1) / 864e5);
    const c = Math.floor(p / 7) + (i > 0 && p % 7 >= 4 ? 1 : 0) + 1;
    out += `<span class="hm-mes" style="grid-area:1/${c}">${MESES[i].slice(0, 3)}</span>`;
  }
  for (let i = 0; i < n; i++) {
    const key = localDate(new Date(y, 0, 1 + i)), p = lead + i;
    out += `<button type="button" class="hm${days.has(key) ? ' on' : ''}${key > today ? ' fut' : ''}${key === today ? ' today' : ''}${key === calSel ? ' sel' : ''}" style="grid-area:${p % 7 + 2}/${Math.floor(p / 7) + 1}" data-date="${key}" aria-label="${key}"></button>`;
  }
  $('cal-year').style.setProperty('--cols', cols);
  $('cal-year').innerHTML = out;
}
function renderCalDay() {
  if (!calSel) { $('cal-day').textContent = 'Toca un día para ver qué hiciste.'; return; }
  const ss = db.sessions.filter(s => s.date === calSel), ww = db.walks.filter(w => w.date === calSel);
  const [y, m, d] = calSel.split('-').map(Number);
  const parts = [...ss.map(s => s.routine || 'Entreno'), ...ww.map(w => `Caminata ${Math.round(w.seconds / 60)} min`)];
  $('cal-day').textContent = `${d} de ${MESES[m - 1]}: ` + (parts.length ? parts.join(' · ') : 'nada.');
}
function setCal(open) {
  if (open) { calMonth = localDate().slice(0, 7); calSel = null; calView = 'mes'; renderCal(); }
  $('cal-sheet').classList.toggle('show', open);
  $('scrim').classList.toggle('show', open);
  $('cal-sheet').setAttribute('aria-hidden', String(!open));
  if (open) $('cal-close').focus({ preventScroll: true });
}
const shiftMonth = k => { const [y, m] = calMonth.split('-').map(Number); const d = calView === 'anio' ? new Date(y + k, m - 1, 1) : new Date(y, m - 1 + k, 1); calMonth = localDate(d).slice(0, 7); calSel = null; renderCal(); };
$('week').onclick = () => setCal(true);
$('week').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCal(true); } };
$('cal-close').onclick = () => setCal(false);
$('cal-prev').onclick = () => shiftMonth(-1);
$('cal-next').onclick = () => shiftMonth(1);
$('cal-grid').onclick = $('cal-year').onclick = e => { const b = e.target.closest('[data-date]'); if (!b) return; calSel = b.dataset.date; renderCal(); };
document.querySelectorAll('[data-calview]').forEach(b => b.onclick = () => { calView = b.dataset.calview; calSel = null; renderCal(); });

function setSettings(open) {
  $('settings-sheet').classList.toggle('show', open);
  $('scrim').classList.toggle('show', open);
  $('settings-sheet').setAttribute('aria-hidden', String(!open));
  if (open) $('settings-close').focus({ preventScroll: true });
}
document.querySelectorAll('[data-descanso]').forEach(b => {
  b.setAttribute('aria-pressed', String(+b.dataset.descanso === restAllowance()));
  b.onclick = () => {
    lsSet(REST_KEY2, b.dataset.descanso);
    document.querySelectorAll('[data-descanso]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render(); vibrate(8);
  };
});
$('settings-btn').onclick = () => setSettings(true);
$('settings-close').onclick = () => setSettings(false);
$('scrim').onclick = () => { setSettings(false); setCal(false); closeSummary(); closeFinish(); if (typeof closePicker === 'function') closePicker(); if (typeof closeDetail === 'function') closeDetail(); };
// ---------- Hojas inferiores: foco, bloqueo del fondo, Escape y arrastrar para cerrar ----------
const sheets = [...document.querySelectorAll('.sheet')];
const openSheets = () => sheets.filter(s => s.classList.contains('show'));
// Cierra una hoja por su propio botón (Cerrar o Cancelar); si no tiene, como al tocar fuera
function dismissSheet(sheet) {
  const closer = sheet.querySelector('.sheet-head .icon-btn, .sheet-head .link');
  if (closer) closer.click(); else $('scrim').click();
}
const sheetOpener = new WeakMap();
let lastTrigger = null;                             // en táctil, tocar un botón no le da el foco: se recuerda cuál abrió la hoja
document.addEventListener('click', e => { lastTrigger = e.target.closest?.('button, [role="button"], a') || null; }, true);
sheets.forEach(sheet => {
  sheet.tabIndex = -1;
  let was = sheet.classList.contains('show');
  new MutationObserver(() => {
    const now = sheet.classList.contains('show');
    if (now === was) return;
    was = now;
    document.body.classList.toggle('sheet-open', openSheets().length > 0);
    if (now) {
      sheetOpener.set(sheet, lastTrigger && lastTrigger.isConnected && !sheet.contains(lastTrigger) ? lastTrigger : document.activeElement);
      // el foco entra en la hoja (salvo que ella misma ya lo haya puesto en un campo suyo)
      setTimeout(() => { if (sheet.classList.contains('show') && !sheet.contains(document.activeElement)) sheet.focus({ preventScroll: true }); }, 0);
    } else {
      sheet.style.transform = '';
      const op = sheetOpener.get(sheet);
      if (op && op.isConnected && !/^(INPUT|TEXTAREA|SELECT)$/.test(op.tagName) && (sheet.contains(document.activeElement) || document.activeElement === document.body)) op.focus({ preventScroll: true });
    }
  }).observe(sheet, { attributes: true, attributeFilter: ['class'] });

  // Arrastrar la cabecera hacia abajo: la hoja sigue al dedo y se cierra al soltar si ha bajado lo suficiente
  const head = sheet.querySelector('.sheet-head');
  if (!head) return;
  let drag = null;
  head.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || e.target.closest('button, input, a')) return;
    drag = { y: e.touches[0].clientY, dy: 0, t: performance.now() };
  }, { passive: true });
  head.addEventListener('touchmove', e => {
    if (!drag) return;
    drag.dy = Math.max(0, e.touches[0].clientY - drag.y);
    if (drag.dy > 4) { e.preventDefault(); sheet.classList.add('dragging'); sheet.style.transform = `translateY(${drag.dy}px)`; }
  }, { passive: false });
  const end = () => {
    if (!drag) return;
    const d = drag, fast = d.dy / Math.max(1, performance.now() - d.t) > .6;
    drag = null;
    sheet.classList.remove('dragging');
    if (d.dy > 110 || (d.dy > 40 && fast)) { vibrate(8); dismissSheet(sheet); }
    sheet.style.transform = '';                      // vuelve a su sitio, o baja del todo si se ha cerrado
  };
  head.addEventListener('touchend', end);
  head.addEventListener('touchcancel', end);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const top = openSheets().pop();
  if (top) dismissSheet(top);
});

// ---------- Init ----------
$('new-phrase').onclick = () => newPhrase(true);
newPhrase(false);
renderEditor();
updateGoalLabel();
render();
// el catálogo (ejercicios.js) carga después de este script: los grupos musculares se pintan al terminar
window.addEventListener('load', () => loadEjercicios().then(() => renderRoutines()).catch(() => { /* sin catálogo: las rutinas se ven sin grupos */ }));
(function resumeWalk() {
  try {
    const w = JSON.parse(lsGet(WALK_KEY) || 'null');
    if (w && Number.isFinite(w.start) && Number.isFinite(w.goal) && Date.now() - w.start < WALK_MAX_AGE) runWalk({ start: w.start, goal: w.goal, meters: w.meters || 0, done: !!w.done });
    else if (w) lsSet(WALK_KEY, '');
  } catch { lsSet(WALK_KEY, ''); }
})();
moveIndicator();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// iOS ignora user-scalable=no: se cancelan los gestos de pellizco para que la app no haga zoom
['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
