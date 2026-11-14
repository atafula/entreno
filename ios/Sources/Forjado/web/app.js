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
  const extra = {};
  ['pos', 'rev', 'upd'].forEach(k => { if (Number.isFinite(r[k])) extra[k] = r[k]; });   // orden y versión (para sincronizar)
  return {
    ...extra,
    id: r.id, name: r.name, days: [...new Set((r.days || []).filter(d => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b),
    exercises: (r.exercises || []).map(e => typeof e === 'string'
      ? { name: e, sets: [] }
      : { name: e.name, image: e.image || '', ejId: e.ejId || '', sets: (e.sets || []).map(s => ({ w: !!s.w, kg: s.kg || '', reps: s.reps || '' })) })
  };
}
db.routines = (db.routines || []).map(normRoutine);
// Versiones: cada rutina, entreno y caminata lleva `rev`, un contador que sube en cada cambio, y `upd`, la hora del cambio.
// Al sincronizar gana el `rev` más alto, no la hora: así un móvil con el reloj mal puesto no pisa datos más nuevos.
const tocar = (x, base = 0) => { x.rev = Math.max(x.rev || 0, base) + 1; x.upd = Date.now(); };
const sigRutina = r => JSON.stringify([r.name, r.days, r.pos, r.exercises]);
// Las rutinas tienen un orden (`pos`, admite decimales para colar una entre dos) que viaja con ellas a la nube
function ordenarRutinas() {
  let max = 0;
  db.routines.forEach(r => { if (Number.isFinite(r.pos)) max = Math.max(max, r.pos); });
  db.routines.forEach(r => { if (!Number.isFinite(r.pos)) r.pos = ++max; });
  db.routines.sort((a, b) => a.pos - b.pos);
}
// Detecta las rutinas cambiadas desde la última vez (editadas, nuevas, restauradas) y les sube el `rev`
function marcarRutinas() {
  ordenarRutinas();
  const antes = db.routineSigs, ahora = {};
  db.routines.forEach(r => {
    const p = antes && antes[r.id], s = sigRutina(r);
    if (antes && (!p || p.s !== s)) tocar(r, p ? p.rev : 0);
    ahora[r.id] = { s: sigRutina(r), rev: r.rev || 0 };
  });
  db.routineSigs = ahora;
}
ordenarRutinas();
db.deleted = { sesiones: [], caminatas: [], rutinas: [], ...(db.deleted || {}) };        // borrados pendientes de propagar a la nube
db.syncedIds = { sesiones: [], caminatas: [], rutinas: [], ...(db.syncedIds || {}) };  // ids que había en la nube la última vez
if (!db.routineSigs) { db.routineSigs = {}; db.routines.forEach(r => { db.routineSigs[r.id] = { s: sigRutina(r), rev: r.rev || 0 }; }); }   // punto de partida: nada cambiado
let walk = null;
let lastStreak = null;
let lastPhrase = -1;

// Guardado local: si el móvil no deja (espacio lleno, modo privado), se avisa en vez de perder datos en silencio
function guardarLocal() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch { toast('No se pudo guardar en el móvil'); return false; }
}
const persist = () => { marcarRutinas(); const ok = guardarLocal(); render(); if (typeof syncPush === 'function') syncPush(); return ok; };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const activeDays = () => new Set([...db.sessions, ...db.walks].map(x => x.date));
// En la app de iOS, un entreno o caminata terminado se guarda también en Apple Salud (en la web normal no hace nada)
const salud = (kind, seconds, meters = 0) => { try { window.webkit?.messageHandlers?.forjado?.postMessage({ t: 'salud', kind, start: Date.now() - seconds * 1000, end: Date.now(), meters: Math.round(meters) }); } catch { /* fuera de la app */ } };
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
  renderWeekSum();
  renderNext();
  renderHistory();
  renderPerfil();
  if (typeof rsRefresh === 'function') rsRefresh();
}

// Racha semanal: semanas (lunes a domingo) seguidas con al menos un día de entreno, contadas hacia atrás.
// Si esta semana aún no tiene entreno, la racha no se rompe y cuenta desde la semana anterior.
function rachaSemanas(days, today = new Date()) {
  const tieneSemana = (lunes) => {
    for (let i = 0; i < 7; i++) { const d = new Date(lunes); d.setDate(lunes.getDate() + i); if (days.has(localDate(d))) return true; }
    return false;
  };
  const lunes = new Date(today); lunes.setHours(12, 0, 0, 0);
  lunes.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  if (!tieneSemana(lunes)) lunes.setDate(lunes.getDate() - 7);
  let n = 0;
  while (tieneSemana(lunes)) { n++; lunes.setDate(lunes.getDate() - 7); }
  return n;
}

function renderStreak() {
  const n = rachaSemanas(activeDays());
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

// Lunes (a mediodía, para no tropezar con los cambios de hora) de la semana de `d`, desplazado `k` semanas
function lunesDe(d = new Date(), k = 0) {
  const x = new Date(d); x.setHours(12, 0, 0, 0);
  x.setDate(x.getDate() - (x.getDay() + 6) % 7 + 7 * k);
  return x;
}
const masDias = (d, k) => { const x = new Date(d); x.setDate(x.getDate() + k); return x; };
function renderToday() {
  const days = activeDays(), done = days.has(localDate());
  $('hero').classList.toggle('done', done);
  $('today-status').textContent = done ? 'Hoy cumpliste.' : 'Hoy no has hecho nada.';
  // Anillo: la racha de semanas en el centro; el arco se llena con los días entrenados de esta semana
  const n = rachaSemanas(days), lun = lunesDe();
  let dias = 0;
  for (let i = 0; i < 7; i++) if (days.has(localDate(masDias(lun, i)))) dias++;
  $('hero-ring-n').textContent = n;
  $('hero-ring-u').textContent = n === 1 ? 'semana' : 'semanas';
  $('hero-ring').dataset.p = String(dias / 7);
  $('hero-ring').setAttribute('aria-label', `Racha de ${plural(n, 'semana', 'semanas')}; ${plural(dias, 'día', 'días')} entrenados esta semana`);
  $('hero-ring-bar').style.strokeDasharray = `${dias / 7 * 100} 100`;
  $('hero-title').textContent = n ? `Racha de ${plural(n, 'semana', 'semanas')}.` : 'Empieza tu racha.';
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
// La semana de lunes a domingo: los días que faltan por llegar se ven apagados
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
function renderWeek() {
  const days = activeDays(), hoy = localDate(), lun = lunesDe();
  $('week').innerHTML = DIAS_SEMANA.map((label, i) => {
    const d = masDias(lun, i), key = localDate(d), on = days.has(key), fut = key > hoy;
    return `<div class="day${on ? ' on' : ''}${key === hoy ? ' today' : ''}${fut ? ' fut' : ''}" style="--i:${i}">${label}<i>${on ? CHECK_ICO : d.getDate()}</i></div>`;
  }).join('');
}

// Cifras de esta semana (lunes a hoy) frente a la semana anterior entera
const fmtMiles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function renderWeekSum() {
  const ini = localDate(lunesDe()), iniAnt = localDate(lunesDe(new Date(), -1));
  const enSemana = (d, a, b) => d >= a && d < b;
  const ses = db.sessions.filter(s => enSemana(s.date, ini, '9999')), sesAnt = db.sessions.filter(s => enSemana(s.date, iniAnt, ini));
  const vol = l => l.reduce((a, s) => a + s.sets.reduce((b, x) => b + (x.reps || 0) * (x.kg || 0), 0), 0);
  const camina = db.walks.filter(w => enSemana(w.date, ini, '9999'));
  const km = camina.reduce((a, w) => a + (w.meters || 0), 0) / 1000, diasCam = new Set(camina.map(w => w.date)).size;
  const dif = (a, b, pct) => {
    if (!b) return '<em>esta semana</em>';
    const v = pct ? Math.round((a - b) / b * 100) : a - b;
    return `<em class="${v > 0 ? 'up' : v < 0 ? 'down' : ''}">${v > 0 ? '+' : ''}${v}${pct ? '%' : ''} vs anterior</em>`;
  };
  const v = vol(ses), vAnt = vol(sesAnt);
  $('wk-sum').innerHTML = `
    <div class="st"><b>${ses.length}</b><span>${ses.length === 1 ? 'entreno' : 'entrenos'}</span>${dif(ses.length, sesAnt.length)}</div>
    <div class="st"><b>${fmtMiles(v)}<small>kg</small></b><span>volumen</span>${dif(v, vAnt, true)}</div>
    <div class="st"><b>${km.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<small>km</small></b><span>caminado</span><em>${plural(diasCam, 'día', 'días')}</em></div>`;
}

// Siguiente rutina: la que más tiempo lleva sin hacerse (las que no se han estrenado, primero)
// Un entreno es de una rutina por su id; los antiguos (sin id) se reconocen por el nombre
const esDe = (s, r) => s.routineId ? s.routineId === r.id : String(s.routine).toLowerCase() === String(r.name).toLowerCase();
function ultimaVez(r) { return db.sessions.filter(s => esDe(s, r)).map(s => s.date).sort().pop() || ''; }
const ultimaVezEn = (r, fecha) => db.sessions.some(s => s.date === fecha && esDe(s, r));
// Qué rutina toca: la que has asignado a cada día de la semana. Si no has asignado ninguna, la que más tiempo lleva sin hacerse
const diaSemana = (d = new Date()) => (d.getDay() + 6) % 7;
const hayPlan = () => db.routines.some(r => (r.days || []).length);
const rutinasDelDia = dow => db.routines.filter(r => (r.days || []).includes(dow));   // puede tocar más de una el mismo día
const rutinaDelDia = dow => rutinasDelDia(dow)[0] || null;
const hechaEn = (r, fecha) => ultimaVezEn(r, fecha);
const diasTexto = r => (r.days || []).map(i => DIAS_LETRA[i]).join('·');
// Las rutinas destacadas en «Te toca»: las de hoy según el plan, o la más antigua sin plan
const rutinasDeHoy = () => hayPlan() ? rutinasDelDia(diaSemana()) : [masAntigua()].filter(Boolean);
function masAntigua() {
  let mejor = null, fecha = null;
  db.routines.forEach(r => { const f = ultimaVez(r); if (mejor === null || f < fecha) { mejor = r; fecha = f; } });
  return mejor;
}
// Próximo día con rutina asignada, contando desde mañana: { r, k } con k = días que faltan
function proximaDelPlan() {
  for (let k = 1; k <= 7; k++) { const r = rutinaDelDia(diaSemana(masDias(new Date(), k))); if (r) return { r, k }; }
  return null;
}
const cuando = k => k === 1 ? 'mañana' : `el ${DIAS_NOMBRE[diaSemana(masDias(new Date(), k))]}`;
const PLAY_ICO = '<svg viewBox="0 0 24 24" class="ico play-ico"><path d="M8 4.5v15L20 12z"/></svg>';
function renderNext() {
  const box = $('next-routine');
  box.hidden = !db.routines.length;
  if (!db.routines.length) { box.innerHTML = ''; return; }
  const hoy = localDate(), hecho = db.sessions.some(s => s.date === hoy), plan = hayPlan();
  const proxima = plan ? proximaDelPlan() : null;
  const aviso = (lab, titulo, meta) => { box.innerHTML = `<div class="nx-l"><p class="lab">${lab}</p><b class="nx-name">${titulo}</b>${meta ? `<p class="nx-meta">${meta}</p>` : ''}</div>`; };
  const siguiente = proxima ? `${esc(proxima.r.name)} ${cuando(proxima.k)}` : '';
  const delDia = plan ? rutinasDelDia(diaSemana()) : [];
  // Con plan, las que ya se hicieron hoy se quitan; cuando no queda ninguna, «Hoy ya está hecho»
  const faltan = plan ? delDia.filter(r => !hechaEn(r, hoy)) : [masAntigua()].filter(Boolean);
  box.classList.toggle('multi', faltan.length > 1);
  if (plan ? (delDia.length && !faltan.length) || (!delDia.length && hecho) : hecho) return aviso('Hoy', 'Hoy ya está hecho.', siguiente ? `Siguiente: ${siguiente}` : '');
  if (!faltan.length) return aviso('Hoy', 'Hoy descansas.', siguiente ? `Siguiente: ${siguiente}` : '');
  const fila = r => {
    const sets = r.exercises.reduce((n, e) => n + e.sets.length, 0), last = ultimaVez(r), grupos = gruposRutina(r);
    return `<div class="nx-row">
      <div class="nx-l">
        <b class="nx-name">${esc(r.name)}</b>
        <p class="nx-meta">${plural(r.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(sets, 'serie', 'series')} ${last ? '' : ' · Sin estrenar'}</p>
        ${grupos.length ? `<div class="rtags">${grupos.map(g => `<span>${esc(g)}</span>`).join('')}</div>` : ''}
      </div>
      <button type="button" class="play" data-start-next="${r.id}" aria-label="Comenzar ${esc(r.name)}">${PLAY_ICO}</button>
    </div>`;
  };
  if (faltan.length > 1) { box.innerHTML = `<p class="lab">Toca hoy</p>${faltan.map(fila).join('')}`; return; }
  const r = faltan[0];
  const sets = r.exercises.reduce((n, e) => n + e.sets.length, 0), last = ultimaVez(r), grupos = gruposRutina(r);
  box.innerHTML = `
    <div class="nx-l">
      <p class="lab">${plan ? 'Toca hoy' : 'Siguiente rutina'}</p>
      <b class="nx-name">${esc(r.name)}</b>
      <p class="nx-meta">${plural(r.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(sets, 'serie', 'series')} ${last ? '' : ' · Sin estrenar'}</p>
      ${grupos.length ? `<div class="rtags">${grupos.map(g => `<span>${esc(g)}</span>`).join('')}</div>` : ''}
    </div>
    <button type="button" class="play" data-start-next="${r.id}" aria-label="Comenzar ${esc(r.name)}">${PLAY_ICO}</button>`;
}
$('next-routine').onclick = e => { const b = e.target.closest('[data-start-next]'); if (b) startWorkout(b.dataset.startNext); };

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
const newDraft = () => ({ id: null, name: '', days: [], exercises: [] });
const DIAS_LETRA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'], DIAS_NOMBRE = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
let creating = false;
let draft = newDraft();
function renderEditor() {
  $('editor-title').textContent = draft.id ? 'Editar rutina' : 'Nueva rutina';
  const open = !!draft.id || creating;
  $('editor-card').hidden = !open;
  $('new-routine').hidden = open;
  $('free-workout').hidden = open;
  $('quick').hidden = open;
  $('editor-cancel').hidden = !open;
  $('routines-list').hidden = open;
  $('routine-save').textContent = draft.id ? 'Guardar cambios' : 'Guardar rutina';
  const del = $('routine-delete'); clearTimeout(del._t); del.classList.remove('armed'); del.textContent = 'Borrar rutina'; del.hidden = !draft.id;
  $('routine-name').value = draft.name;
  $('routine-days').innerHTML = DIAS_LETRA.map((l, i) => `<button type="button" data-day="${i}" aria-pressed="${draft.days.includes(i)}" aria-label="${DIAS_NOMBRE[i]}">${l}</button>`).join('');
  avisoDias();
  const nSeries = draft.exercises.reduce((n, e) => n + e.sets.length, 0);
  $('editor-hint').textContent = draft.exercises.length
    ? `${plural(draft.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(nSeries, 'serie', 'series')} · mantén pulsado un ejercicio para moverlo`
    : 'Añade ejercicios con el botón de abajo.';
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

// Menú ⋯ de cada rutina: Editar, Duplicar y Borrar (con segundo toque para confirmar)
// Si un menú desplegable queda tapado por la barra de pestañas, la página se desplaza lo justo para verlo entero
function verMenuAbierto(sel) {
  const m = document.querySelector(`${sel} .entry-menu`); if (!m) return;
  const falta = m.getBoundingClientRect().bottom + 12 - $('tabbar').getBoundingClientRect().top;
  if (falta > 0) window.scrollBy({ top: falta, behavior: 'smooth' });
}
let menuRutina = null;
const rutinaMenu = id => menuRutina === id
  ? `<div class="entry-menu" role="menu"><button type="button" role="menuitem" data-edit-routine="${id}">Editar</button><button type="button" role="menuitem" data-dup-routine="${id}">Duplicar</button><button type="button" role="menuitem" class="danger" data-del-routine="${id}">Borrar</button></div>` : '';
const rutinaMenuBtn = id => `<button type="button" class="more-btn" data-routine-menu="${id}" aria-label="Más opciones" aria-expanded="${menuRutina === id}">${DOTS_ICO}</button>`;
function rutinaCard(r, feat) {
  const sets = r.exercises.reduce((n, e) => n + e.sets.length, 0), last = ultimaVez(r), grupos = gruposRutina(r);
  const cuando = last ? '' : 'Sin estrenar', dias = diasTexto(r);
  const tags = grupos.length ? `<div class="rtags">${grupos.map(g => `<span>${esc(g)}</span>`).join('')}</div>` : '';
  if (!feat) return `
    <div class="card routine mini">
      <button type="button" class="rhead" data-open-routine="${r.id}" aria-label="Abrir ${esc(r.name)}">
        <span class="rtitle"><b>${esc(r.name)}</b><small>${plural(r.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(sets, 'serie', 'series')}${[cuando, dias].filter(Boolean).map(x => ` · ${x}`).join('')}</small></span>
      </button>
      ${rutinaMenuBtn(r.id)}
      <button type="button" class="play" data-start-routine="${r.id}" aria-label="Comenzar ${esc(r.name)}">${PLAY_ICO}</button>
      ${tags}${rutinaMenu(r.id)}
    </div>`;
  const reps = e => { const w = e.sets.filter(x => !x.w), x = w[0] || e.sets[0]; return x ? `${(w.length || e.sets.length)} × ${x.reps || '–'}` : ''; };
  const resto = r.exercises.length - 3;
  const min = Math.max(5, Math.round(sets * 2.5 / 5) * 5);   // unos 2,5 min por serie con su descanso
  return `
    <div class="card routine feat">
      <div class="rtop"><span class="badge">Siguiente</span>${rutinaMenuBtn(r.id)}</div>
      <button type="button" class="rhead" data-open-routine="${r.id}" aria-label="Abrir ${esc(r.name)}">
        <span class="rtitle"><b>${esc(r.name)}</b><small>${[cuando, dias].filter(Boolean).join(' · ')}</small></span>
      </button>
      <div class="meta"><div><b>${r.exercises.length}</b><span>${r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}</span></div><div><b>${sets}</b><span>series</span></div>${sets ? `<div><b>~${min}</b><span>min</span></div>` : ''}</div>
      ${tags}
      ${r.exercises.length ? `<ul class="fx">${r.exercises.slice(0, 3).map(e => `<li>${fotoMini(e)}<span>${esc(e.name)}</span><em>${reps(e)}</em></li>`).join('')}${resto > 0 ? `<li class="m">+${plural(resto, 'ejercicio más', 'ejercicios más')}</li>` : ''}</ul>` : ''}
      <button type="button" class="btn primary wide" data-start-routine="${r.id}">Comenzar</button>
      ${rutinaMenu(r.id)}
    </div>`;
}
// Miniatura del ejercicio (su foto si la tiene; si no, sus iniciales)
function fotoMini(e) {
  const src = e.image || (typeof sinAcentos === 'function' ? (fotoDeEjercicio(e.name) || {}).image : '') || '';   // sinAcentos llega con backup.js
  const ini = esc(String(e.name || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase());
  return `<i class="fxi">${src ? `<img src="${esc(src)}" alt="" loading="lazy"${CORS()}>` : ini}</i>`;
}
function renderRoutines(quieto = false) {
  $('routines-list').classList.toggle('quiet', quieto || silencio);   // repintar por el menú no reanima las tarjetas
  const hoy = localDate(), sig = rutinasDeHoy().filter(r => !hechaEn(r, hoy)), resto = db.routines.filter(r => !sig.includes(r));   // lo ya hecho hoy sale de Te toca
  // Con plan semanal, «Te toca» son las de hoy (si hoy es de descanso, no hay destacada)
  $('routines-list').innerHTML = !db.routines.length
    ? emptyHtml('rutinas', 'Aún no tienes rutinas', 'Pulsa «Crear rutina» para montar la primera, o empieza un «Entreno libre» y añade ejercicios sobre la marcha.')
    : `${sig.length ? `<p class="rsec">Te toca</p>${sig.map(r => rutinaCard(r, true)).join('')}` : ''}${resto.length ? `<p class="rsec">${sig.length ? 'Todas' : 'Tus rutinas'}</p>${resto.map(r => rutinaCard(r, false)).join('')}` : ''}`;
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
  return `<div class="entry-head">${fechaBloque(s.date)}<div class="htit" role="button" tabindex="0" data-open-entreno="${s.id}" aria-label="Ver detalle del entreno ${esc(s.routine)}"><span class="tag">${esc(s.routine)}</span><span class="hsub"><small title="${esc(s.date)}">${whenText(s.date)}</small>${horaDe(s.ts)}</span></div>${menuBtn('session', s.id)}</div>${entryMenu('session', s.id)}
    <div class="hstats">${s.seconds ? stat('Tiempo', durText(s.seconds)) : ''}${vol ? stat('Volumen', `${fmtMiles(vol)} kg`) : ''}${stat('Series', work)}</div>
    ${recordHtml(s, prs)}
    ${s.nota ? `<p class="hnota">${esc(s.nota)}</p>` : ''}${s.foto && /^data:image\//.test(s.foto) ? `<img class="hfoto" src="${esc(s.foto)}" alt="Foto del entreno" loading="lazy">` : ''}
    <div class="hsums"${open ? ' hidden' : ''}>${groups.slice(0, 3).map(g => { const n = g.sets.length; return `<div class="hsum"><b>${n}</b> ${n === 1 ? 'serie' : 'series'} · ${esc(g.name)}</div>`; }).join('')}</div>
    <div class="hdetail"${open ? '' : ' hidden'}>${groups.map(g => { let n = 0; return `<div class="hex"><b>${esc(g.name)}</b>${g.sets.map((x, j) =>
      `<div class="hset"><span class="hn${x.w ? ' w' : ''}">${x.w ? 'W' : ++n}</span><span>${x.kg ? x.kg + ' kg' : '—'}${prs.includes(g.idx[j]) ? '<i class="pr">PR</i>' : ''}</span><span>${x.reps} reps</span></div>`).join('')}</div>`; }).join('')}</div>
    <button type="button" class="hmore" data-toggle-entry="${s.id}" aria-expanded="${open}">${open ? 'Ver menos' : rest ? `Ver ${rest} ${rest === 1 ? 'ejercicio más' : 'ejercicios más'}` : 'Ver detalle'}</button>`;
}

// Página completa de un entreno (como «Detalle de Entrenamiento»): rutina, fecha, stats y cada ejercicio con sus series
const fotoOk = f => !!f && /^data:image\//.test(f);   // solo fotos guardadas en el propio entreno
let entrenoAbierto = null;                // id del entreno que muestra la página
function entrenoPaginaHtml(s) {
  const groups = [];
  s.sets.forEach(x => { let g = groups.find(g => g.name === x.exercise); if (!g) groups.push(g = { name: x.exercise, sets: [] }); g.sets.push(x); });
  const vol = Math.round(s.sets.reduce((a, x) => a + (x.reps || 0) * (x.kg || 0), 0));
  const prs = prMap[s.id] || [];
  const stat = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
  const quien = ($('perfil-name')?.textContent || '').trim();
  const fecha = new Date(s.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${quien && quien !== 'Tu perfil' ? `<p class="pg-user">${esc(quien)}</p>` : ''}
    <p class="pg-fecha">${esc(fecha)}${s.ts > 1e12 ? `, ${new Date(s.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
    <h2 class="pg-rutina">${esc(s.routine)}</h2>
    <div class="pg-stats">${s.seconds ? stat('Tiempo', durText(s.seconds)) : ''}${stat('Series', s.sets.length)}${vol ? stat('Volumen', `${fmtMiles(vol)} kg`) : ''}</div>
    ${fotoOk(s.foto) ? `<img class="pg-foto" src="${esc(s.foto)}" alt="Foto del entreno">` : ''}${s.nota ? `<p class="pg-nota">${esc(s.nota)}</p>` : ''}
    <p class="pg-h">Ejercicios</p>
    ${groups.map(g => { let n = 0; return `<section class="pg-ex"><div class="pg-ex-head">${fotoMini({ name: g.name })}<span>${esc(g.name)}</span></div>
      <div class="pg-cols"><span>Serie</span><span>Peso</span><span>Reps</span></div>
      ${g.sets.map(x => `<div class="pg-set"><span class="pg-n${x.w ? ' pg-w' : ''}">${x.w ? 'W' : ++n}</span><span>${x.kg ? x.kg + ' kg' : '—'}${prMap[s.id] && prs.includes(s.sets.indexOf(x)) ? '<i class="pr">PR</i>' : ''}</span><span>${x.reps} reps</span></div>`).join('')}
    </section>`; }).join('')}`;
}
function abrirEntreno(id) {
  const s = db.sessions.find(x => x.id === id);
  if (!s) return;
  entrenoAbierto = id;
  $('entreno-body').innerHTML = entrenoPaginaHtml(s);
  const pg = $('entreno-page'); pg.classList.add('show'); pg.setAttribute('aria-hidden', 'false'); vibrate(6);
  pg.scrollTop = 0;
}
function cerrarEntreno() { entrenoAbierto = null; const pg = $('entreno-page'); pg.classList.remove('show'); pg.setAttribute('aria-hidden', 'true'); }
$('entreno-back').onclick = cerrarEntreno;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && entrenoAbierto) { cerrarEntreno(); e.stopImmediatePropagation(); } }, true);

// Bloque con el día del mes y «hoy», «ayer» o el día de la semana
function fechaBloque(iso) {
  const d = new Date(iso + 'T12:00:00'), w = whenText(iso);
  const lab = w === 'Hoy' || w === 'Ayer' ? w.toLowerCase() : d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  return `<div class="hdate${w === 'Hoy' ? ' now' : ''}" aria-hidden="true"><b>${d.getDate()}</b><span>${lab}</span></div>`;
}
// Hora a la que se guardó (solo si hay marca de tiempo real)
const horaDe = ts => ts > 1e12 ? `<span class="hhora"> · ${new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>` : '';
const TROFEO_ICO = '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>';
// Franja de récord: el mejor de los batidos en el entreno y cuántos más hubo
function recordHtml(s, prs) {
  if (!prs.length) return '';
  const sets = prs.map(i => s.sets[i]), mejor = sets.reduce((a, x) => (x.kg > a.kg ? x : a));
  const otros = new Set(sets.map(x => x.exercise)).size - 1;
  return `<div class="hpr">${TROFEO_ICO}<span>Récord en ${esc(mejor.exercise)} · ${String(mejor.kg).replace('.', ',')} kg × ${mejor.reps}${otros > 0 ? ` y ${otros} más` : ''}</span></div>`;
}
const CAMINA_ICO = '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M13 4a1.5 1.5 0 1 0 0 .01M9 21l2-6 3 3v3M7 12l3-4 4 1 3 3M10 8l1 7"/></svg>';
function walkHtml(w) {
  const km = w.meters / 1000, min = Math.round(w.seconds / 60);
  const pace = km > 0.05 ? Math.round(w.seconds / km) : 0;
  const kpi = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
  return `<div class="entry-head"><div class="hdate walk" aria-hidden="true">${CAMINA_ICO}</div><div class="htit"><span class="tag walk-tag">Caminata</span><span class="hsub"><small title="${esc(w.date)}">${whenText(w.date)}</small>${horaDe(w.ts)}</span></div>${menuBtn('walk', w.id)}</div>${entryMenu('walk', w.id)}
    <div class="hstats">${kpi('Tiempo', `${min} min`)}${kpi('Distancia', `${km.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`)}${pace ? kpi('min/km', `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')}`) : ''}</div>`;
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
  e.date = date; tocar(e);
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
// Quita el menú abierto sin repintar la lista: así el botón que se está tocando sigue ahí y su clic llega
function cerrarMenus(lista, boton) {
  document.querySelectorAll(`${lista} .entry-menu`).forEach(m => m.remove());
  document.querySelectorAll(`${lista} ${boton}`).forEach(b => b.setAttribute('aria-expanded', 'false'));
}
// Tocar fuera del menú ⋯ lo cierra. Con «pointerdown»: iOS no lanza «click» al tocar una zona sin botón
document.addEventListener('pointerdown', e => {
  if (menuEntry && !e.target.closest('.entry-menu, [data-menu]')) { menuEntry = null; cerrarMenus('#history-list', '[data-menu]'); }
});
$('history-list').addEventListener('keydown', e => { const t = e.target.closest('[data-open-entreno]'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirEntreno(t.dataset.openEntreno); } });
$('history-list').addEventListener('click', e => {
  const abre = e.target.closest('[data-open-entreno]');
  if (abre) return abrirEntreno(abre.dataset.openEntreno);
  const dots = e.target.closest('[data-menu]');
  if (dots) { menuEntry = menuEntry === dots.dataset.menu ? null : dots.dataset.menu; vibrate(6); histQuiet = true; renderHistory(); return verMenuAbierto('#history-list'); }
  const more = e.target.closest('[data-toggle-entry]');
  if (more) { const id = more.dataset.toggleEntry; openEntries.has(id) ? openEntries.delete(id) : openEntries.add(id); vibrate(6); histQuiet = true; return renderHistory(); }
  const ed = e.target.closest('[data-edit-session], [data-edit-walk]');
  if (ed) { menuEntry = null; cerrarMenus('#history-list', '[data-menu]'); return startEditEntry(ed.dataset.editSession ? 'session' : 'walk', ed.dataset.editSession || ed.dataset.editWalk); }
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
// ---------- Perfil: cuenta de Google arriba; debajo, los entrenos o las estadísticas ----------
let detalleId = null;                      // entreno abierto desde la cuadrícula: la lista enseña solo ese
let perfilVista = 'grid', periodo = 7;
const durCorta = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m} min`; };
const fuerza = x => e1rm(x.kg || 0, x.reps || 0) || (x.reps || 0) / 1000;   // sin peso: manda el número de reps
function renderPerfil() {
  // Lo que pones en «Editar perfil» manda; si falta algo, se usa lo de la cuenta de Google
  const u = window.cuentaActual || null, p = db.perfil || {}, hayCuenta = typeof firebase !== 'undefined' && !$('account-sec').hidden;
  const nombre = p.nombre || (u && (u.displayName || (u.email || '').split('@')[0])) || 'Tu perfil';
  $('perfil-name').textContent = nombre;
  $('perfil-sub').textContent = p.usuario ? `@${p.usuario}` : u ? (u.email || 'Cuenta de Google') : hayCuenta ? 'Entra con Google para guardar tus datos en la nube' : 'Tus datos se guardan en este móvil';
  $('perfil-login').hidden = !!u || !hayCuenta;
  $('perfil-bio').textContent = p.bio || ''; $('perfil-bio').hidden = !p.bio;
  $('perfil-foto').innerHTML = fotoHtml(p.foto || (u && u.photoURL), nombre !== 'Tu perfil' ? nombre : '');
  document.querySelectorAll('[data-pview]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.pview === perfilVista)));
  $('perfil-stats').hidden = perfilVista !== 'stats';
  $('perfil-entrenos').hidden = perfilVista !== 'entrenos';
  $('pf-grid').hidden = perfilVista !== 'grid';
  if (perfilVista === 'grid') renderPerfilGrid();
  if (perfilVista === 'stats') renderPerfilStats();
}
// Radar de seis grupos: cada entreno dibuja su forma según las series de cada grupo
const RADAR = [['pecho', 'Pecho'], ['hombro', 'Hombro'], ['brazos', 'Brazos'], ['core', 'Core'], ['piernas', 'Piernas'], ['espalda', 'Espalda']];
const MUSCULO_DE = {
  'Chest': 'pecho', 'Shoulders': 'hombro', 'Traps': 'hombro', 'Neck': 'hombro', 'Biceps': 'brazos', 'Triceps': 'brazos', 'Forearms': 'brazos',
  'Abdominals': 'core', 'Lower Back': 'core', 'Quadriceps': 'piernas', 'Hamstrings': 'piernas', 'Glutes': 'piernas', 'Calves': 'piernas',
  'Adductors': 'piernas', 'Abductors': 'piernas', 'Lats': 'espalda', 'Upper Back': 'espalda',
};
// Series por músculo de un entreno: el ejercicio se busca en la rutina del entreno (o en cualquiera) y de ahí en el catálogo
function musculosDe(s) {
  const out = {};
  if (typeof ejCache === 'undefined' || !ejCache) return out;
  const rut = db.routines.find(r => r.id === s.routineId);
  const idDe = n => { for (const r of rut ? [rut, ...db.routines] : db.routines) { const e = r.exercises.find(x => x.name === n && x.ejId); if (e) return e.ejId; } return ''; };
  s.sets.forEach(x => {
    if (x.w) return;
    const id = idDe(x.exercise), cat = id ? ejCache.find(c => c.id === id) : ejCache.find(c => c.name === x.exercise);
    const m = cat && MUSCULO_DE[cat.body_part];
    if (m) out[m] = (out[m] || 0) + 1;
  });
  return out;
}
function renderPerfilGrid() {
  const g = $('pf-grid');
  const items = [
    ...db.sessions.map(s => {
      const nombres = [...new Set(s.sets.map(x => x.exercise))].slice(0, 4);
      const vol = Math.round(s.sets.reduce((a, x) => a + (x.reps || 0) * (x.kg || 0), 0)), m = musculosDe(s);
      const tags = RADAR.filter(([k]) => m[k]).sort((a, b) => m[b[0]] - m[a[0]]).map(([, lab]) => `<u>${lab}</u>`).join('');
      const sub = [whenText(s.date), s.seconds >= 30 ? durCorta(s.seconds) : plural(s.sets.length, 'serie', 'series')].join(' · ');
      return { date: s.date, ts: s.ts || 0, id: s.id, html: `<button type="button" class="pf-card" data-pf-open="${s.id}" aria-label="Abrir entreno ${esc(s.routine)}">${fotoOk(s.foto) ? `<span class="pf-col n1"><img class="pf-ent-foto" src="${esc(s.foto)}" alt="Foto del entreno" loading="lazy"></span>` : `<span class="pf-col n${nombres.length}">${nombres.map(n => fotoMini({ name: n })).join('')}</span>`}<span class="pf-m"><b>${esc(s.routine)}</b><small>${esc(sub)}</small>${tags ? `<span class="pf-chips-m">${tags}</span>` : ''}</span>${vol ? `<span class="pf-v"><b>${fmtMiles(vol)}</b><small>kg</small></span>` : ''}</button>` };
    }),
    ...db.walks.map(w => ({ date: w.date, ts: w.ts || 0, id: w.id, html: `<button type="button" class="pf-card" data-pf-open="${w.id}" aria-label="Abrir caminata"><span class="pf-col n1"><i class="fxi walk">${CAMINA_ICO}</i></span><span class="pf-m"><b>Caminata</b><small>${esc(whenText(w.date))} · ${Math.round(w.seconds / 60)} min</small></span><span class="pf-v"><b>${(w.meters / 1000).toFixed(1).replace('.', ',')}</b><small>km</small></span></button>` })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
  g.innerHTML = items.map(i => i.html).join('') || `<div class="pf-vacio-g">${emptyHtml('historial', 'Todavía no hay entrenos', 'Empieza uno desde «Rutinas» y aparecerá aquí.')}</div>`;
}
$('pf-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-pf-open]'); if (!b) return;
  if (db.sessions.some(s => s.id === b.dataset.pfOpen)) return abrirEntreno(b.dataset.pfOpen);
  openEntries.add(b.dataset.pfOpen); detalleId = b.dataset.pfOpen; perfilVista = 'entrenos'; vibrate(6); renderPerfil(); renderHistory();
  document.querySelector(`[data-toggle-entry="${b.dataset.pfOpen}"]`)?.closest('.entry')?.scrollIntoView({ block: 'start' });
});
function renderPerfilStats() {
  document.querySelectorAll('[data-periodo]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.periodo === periodo)));
  const hoy = localDate(), N = periodo, medidaSel = $('pstats-vol-sel').value;
  const ini = N ? localDate(masDias(new Date(), -(N - 1))) : '0000-00-00';
  const prevIni = N ? localDate(masDias(new Date(), -(2 * N - 1))) : '';
  const en = (s, a, b) => s.date >= a && s.date <= b;
  const act = db.sessions.filter(s => en(s, ini, hoy)), ant = N ? db.sessions.filter(s => s.date >= prevIni && s.date < ini) : null;
  const medir = l => ({ n: l.length, series: l.reduce((a, s) => a + s.sets.filter(x => !x.w).length, 0), seg: l.reduce((a, s) => a + (s.seconds || 0), 0),
    vol: Math.round(l.reduce((a, s) => a + s.sets.reduce((b, x) => b + (x.w ? 0 : (x.reps || 0) * (x.kg || 0)), 0), 0)) });
  const A = medir(act), P = ant && medir(ant);
  const dif = (a, b, fmt = v => v) => { if (!P) return ''; const d = a - b; return `<em class="${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : d < 0 ? '−' : '='}${d ? fmt(Math.abs(d)) : ''}</em>`; };
  const et = iso => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; };
  const rango = N ? `${et(ini)} – ${et(hoy)}` : 'Desde el primer entreno';
  $('pstats-title').textContent = N ? `Cómo vas en los últimos ${N} días` : 'Cómo vas desde el principio';
  $('pstats-rango').textContent = rango + (P ? ` · frente a los ${N} días anteriores` : '');
  const card = (v, lab, d) => `<div class="pf-n"><b>${v}</b><span>${lab}</span>${d}</div>`;
  $('pstats-sum').innerHTML = card(A.n, A.n === 1 ? 'entreno' : 'entrenos', dif(A.n, P && P.n))
    + card(A.series, A.series === 1 ? 'serie' : 'series', dif(A.series, P && P.series))
    + card(durCorta(A.seg), 'tiempo', dif(Math.round(A.seg / 60), P && Math.round(P.seg / 60), v => `${v} min`));
  $('pstats-note').hidden = A.n !== 1; $('pstats-note').textContent = 'Con una sola sesión aún no hay tendencia.';

  // Volumen (o series, o tiempo) en barras: por día, por semana o por mes según el periodo
  const dia = k => localDate(masDias(new Date(), k)), hoyD = new Date();
  let cubos = [];
  if (N && N <= 30) cubos = [...Array(N)].map((_, k) => { const f = dia(k - N + 1); return { a: f, b: f, lab: N === 7 ? DIAS_LETRA[diaSemana(new Date(f + 'T12:00:00'))] : '' }; });
  else if (N === 90) cubos = [...Array(13)].map((_, k) => ({ a: dia(-(13 - k) * 7 + 1), b: dia(-(12 - k) * 7), lab: '' }));
  else {
    const meses = N ? 12 : Math.min(12, Math.max(1, db.sessions.length ? (() => { const m = db.sessions.map(s => s.date).sort()[0]; return (hoyD.getFullYear() - +m.slice(0, 4)) * 12 + hoyD.getMonth() - (+m.slice(5, 7) - 1) + 1; })() : 1));
    cubos = [...Array(meses)].map((_, k) => { const d = new Date(hoyD.getFullYear(), hoyD.getMonth() - (meses - 1 - k), 1), p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; return { a: `${p}-01`, b: `${p}-31`, lab: MESES[d.getMonth()][0].toUpperCase() }; });
  }
  const valor = (l, c) => { const m = medir(l.filter(s => en(s, c.a, c.b))); return medidaSel === 'series' ? m.series : medidaSel === 'tiempo' ? m.seg : m.vol; };
  const vals = cubos.map(c => valor(db.sessions, c)), max = Math.max(1, ...vals);
  const fmtV = (m, v) => medidaSel === 'series' ? `${v}<small> ${v === 1 ? 'serie' : 'series'}</small>` : medidaSel === 'tiempo' ? `${durCorta(v)}` : `${fmtMiles(v)}<small> kg</small>`;
  const actV = medidaSel === 'series' ? A.series : medidaSel === 'tiempo' ? A.seg : A.vol, antV = P ? (medidaSel === 'series' ? P.series : medidaSel === 'tiempo' ? P.seg : P.vol) : 0;
  $('pstats-vol-rango').textContent = rango;
  $('pstats-vol-num').innerHTML = fmtV(medidaSel, actV);
  $('pstats-vol-cmp').textContent = P && antV ? `${actV >= antV ? '+' : '−'}${Math.round(Math.abs(actV - antV) / antV * 100)}% vs anterior` : 'todavía sin comparar';
  $('pstats-vol-bars').className = `pf-bars c${cubos.length}`;
  $('pstats-vol-bars').innerHTML = cubos.map((c, k) => `<span class="vb${vals[k] ? ' on' : ''}" title="${c.a}"><span class="vb-t"><span class="vb-f" style="height:${Math.round(vals[k] / max * 100)}%"></span></span>${c.lab ? `<i>${c.lab}</i>` : ''}</span>`).join('');

  // Series por músculo: las del periodo, y una marca con las del periodo anterior
  const porGrupo = l => l.reduce((o, s) => { const m = musculosDe(s); RADAR.forEach(([k]) => { o[k] = (o[k] || 0) + (m[k] || 0); }); return o; }, {});
  const GA = porGrupo(act);
  const ORDEN = [['pecho', 'Pecho'], ['hombro', 'Hombro'], ['espalda', 'Espalda'], ['piernas', 'Piernas'], ['brazos', 'Brazos'], ['core', 'Core']];
  const maxG = Math.max(1, ...ORDEN.map(([k]) => GA[k] || 0));
  $('pstats-musc-rango').textContent = rango;
  $('pstats-musc').innerHTML = ORDEN.map(([k, lab]) => { const v = GA[k] || 0, w = Math.round(v / maxG * 100);
    return `<div class="pm"><div class="pm-h"><span class="pm-n">${lab}</span><b class="pm-v">${v}</b></div><div class="pm-t"><span class="pm-fill" style="width:${w}%"></span></div></div>`; }).join('');
  renderGraficasPro(act, rango, ant);
}
// Radar de series por grupo muscular: el periodo en relleno y con puntos, el anterior más suave
function radarSvg(cur, prev) {
  const R = 40, max = Math.max(1, ...RADAR.map(([k]) => cur[k] || 0), ...(prev ? RADAR.map(([k]) => prev[k] || 0) : []));
  const pt = (i, r) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [60 + R * r * Math.cos(a), 60 + R * r * Math.sin(a)]; };
  const fmt = l => l.map(n => n.toFixed(1)).join(',');
  const hex = r => RADAR.map((_, i) => fmt(pt(i, r))).join(' ');
  const forma = g => RADAR.map(([k], i) => fmt(pt(i, g[k] ? .12 + .88 * g[k] / max : .04))).join(' ');
  const anillos = [1, .66, .33].map(r => `<polygon class="rejilla" points="${hex(r)}"/>`).join('');
  const ejes = RADAR.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="eje" x1="60" y1="60" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
  const anterior = prev && RADAR.some(([k]) => prev[k]) ? `<polygon class="prev" points="${forma(prev)}"/>` : '';
  const puntos = RADAR.map(([k], i) => { const [x, y] = pt(i, cur[k] ? .12 + .88 * cur[k] / max : .04); return `<circle class="punto${cur[k] ? ' on' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2"/>`; }).join('');
  const textos = RADAR.map(([k, lab], i) => { const [x, y] = pt(i, 1.28), anc = Math.abs(x - 60) < 5 ? 'middle' : x > 60 ? 'start' : 'end';
    return `<text${cur[k] ? ' class="on"' : ''} x="${x.toFixed(1)}" y="${(y + 2.5).toFixed(1)}" text-anchor="${anc}">${lab}</text>`; }).join('');
  return `<svg class="radar" viewBox="-26 -2 172 124" role="img" aria-label="Series por grupo muscular">${anillos}${ejes}${anterior}<polygon class="area" points="${forma(cur)}"/>${puntos}${textos}</svg>`;
}
function renderRadar(act, ant, rango) {
  const por = l => l.reduce((o, s) => { const m = musculosDe(s); RADAR.forEach(([k]) => { o[k] = (o[k] || 0) + (m[k] || 0); }); return o; }, {});
  const cur = por(act), prev = ant ? por(ant) : null;
  const hay = RADAR.some(([k]) => cur[k]);
  $('pstats-radar').innerHTML = hay ? radarSvg(cur, prev) : SIN_DATOS;
  $('pstats-radar-ley').textContent = hay && prev && RADAR.some(([k]) => prev[k]) ? `Línea discontinua: los ${periodo} días anteriores` : '';
}
// Gráficas del detalle: reparto, rangos de repeticiones, mejores series y curva carga·reps (todo sobre el periodo elegido)
const RANGOS_REPS = [['1–5', 1, 5], ['6–10', 6, 10], ['11–15', 11, 15], ['16+', 16, 999]];
const SIN_DATOS = '<p class="pf-vacio">Sin datos en este periodo.</p>';
function rangosHtml(sets) {
  const w = sets.filter(x => !x.w && x.reps > 0), tot = w.length;
  if (!tot) return SIN_DATOS;
  return RANGOS_REPS.map(([lab, a, b]) => { const p = Math.round(w.filter(x => x.reps >= a && x.reps <= b).length / tot * 100);
    return `<div class="rr"><span class="rr-n">${lab}</span><span class="rr-t"><span style="width:${p}%"></span></span><b class="rr-p">${p}%</b></div>`; }).join('');
}
function renderGraficasPro(act, rango, ant) {
  const sets = act.flatMap(s => s.sets), trabajo = sets.filter(x => !x.w);
  ['reparto', 'reps', 'radar'].forEach(k => { $(`pstats-${k}-rango`).textContent = rango; });
  // Reparto muscular: qué parte de las series va a cada grupo
  const g = act.reduce((o, s) => { const m = musculosDe(s); RADAR.forEach(([k]) => { o[k] = (o[k] || 0) + (m[k] || 0); }); return o; }, {});
  const grupos = [['pecho', 'Pecho'], ['hombro', 'Hombro'], ['espalda', 'Espalda'], ['piernas', 'Piernas'], ['brazos', 'Brazos'], ['core', 'Core']].filter(([k]) => g[k]).sort((a, b) => g[b[0]] - g[a[0]]);
  const tot = grupos.reduce((a, [k]) => a + g[k], 0);
  $('pstats-reparto').innerHTML = tot ? `<div class="rp-barra">${grupos.map(([k]) => `<span class="rp-seg" style="flex:${g[k]}"></span>`).join('')}</div>`
    + `<div class="rp-ley">${grupos.map(([k, lab]) => `<div class="rp-fila"><i class="rp-dot"></i><span>${lab}</span><b>${Math.round(g[k] / tot * 100)}%</b></div>`).join('')}</div>` : SIN_DATOS;
  $('pstats-reps').innerHTML = rangosHtml(sets);
  renderRadar(act, ant, rango);
}
$('pstats-vol-sel').onchange = () => { vibrate(6); renderPerfilStats(); };
document.querySelectorAll('[data-pview]').forEach(b => b.onclick = () => { if (perfilVista === b.dataset.pview) return; perfilVista = b.dataset.pview; detalleId = null; vibrate(6); renderPerfil(); renderHistory(); });
document.querySelectorAll('[data-periodo]').forEach(b => b.onclick = () => { periodo = +b.dataset.periodo; vibrate(6); renderPerfilStats(); });
$('perfil-login').onclick = () => $('login-btn').click();
const ICONO_PERSONA = '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
const fotoHtml = (src, nombre) => src ? `<img src="${esc(src)}" alt="" referrerpolicy="no-referrer">` : nombre ? `<span>${esc(nombre[0].toUpperCase())}</span>` : ICONO_PERSONA;

// Editar perfil: pantalla entera; nada se guarda hasta pulsar «Guardar»
let peFoto = null;
const limpiarUsuario = v => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._]/g, '').slice(0, 24);
function abrirEditorPerfil() {
  const p = db.perfil || {}, u = window.cuentaActual;
  peFoto = p.foto || null;
  $('pe-nombre').value = p.nombre || (u && u.displayName) || '';
  $('pe-usuario').value = p.usuario ? `@${p.usuario}` : '';
  $('pe-bio').value = p.bio || '';
  $('pe-sexo').value = p.sexo || '';
  $('pe-altura').value = p.altura || '';
  $('pe-foto').innerHTML = fotoHtml(peFoto || (u && u.photoURL), '');
  const ed = $('perfil-editor'); ed.classList.add('show'); ed.setAttribute('aria-hidden', 'false'); vibrate(6);
}
function cerrarEditorPerfil() { const ed = $('perfil-editor'); ed.classList.remove('show'); ed.setAttribute('aria-hidden', 'true'); $('pe-foto-file').value = ''; }
$('perfil-edit').onclick = abrirEditorPerfil;
$('pe-back').onclick = cerrarEditorPerfil;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('perfil-editor').classList.contains('show')) { cerrarEditorPerfil(); e.stopImmediatePropagation(); } }, true);
$('pe-usuario').addEventListener('blur', e => { const v = limpiarUsuario(e.target.value); e.target.value = v ? `@${v}` : ''; });
// La foto se recorta en cuadrado y se reduce a 256 px (JPEG) para que ocupe poco
$('pe-foto-file').onchange = e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {
    const lado = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 256;
    c.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 256, 256);
    peFoto = c.toDataURL('image/jpeg', .85); URL.revokeObjectURL(url);
    $('pe-foto').innerHTML = fotoHtml(peFoto, '');
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('No se pudo leer esa imagen.'); };
  img.src = url;
};
$('pe-guardar').onclick = () => {
  const alt = parseInt($('pe-altura').value, 10);
  const p = { nombre: $('pe-nombre').value.trim().slice(0, 40), usuario: limpiarUsuario($('pe-usuario').value), bio: $('pe-bio').value.trim().slice(0, 160), sexo: $('pe-sexo').value };
  if (alt >= 100 && alt <= 250) p.altura = alt;
  if (peFoto) p.foto = peFoto;
  Object.keys(p).forEach(k => { if (p[k] === '') delete p[k]; });
  tocar(p, (db.perfil || {}).rev || 0); db.perfil = p;
  cerrarEditorPerfil(); persist(); toast('Perfil guardado');
};

// Filtro del historial y gráfico de las últimas 8 semanas (volumen; con «Caminatas», km)
let histFiltro = 'todo';
document.querySelectorAll('[data-hfilter]').forEach(b => b.onclick = () => {
  if (histFiltro === b.dataset.hfilter) return;
  histFiltro = b.dataset.hfilter; vibrate(6); renderHistory();
});
function renderHistChart() {
  const camina = histFiltro === 'caminatas', lun = lunesDe();
  const semanas = [...Array(8)].map((_, k) => {
    const ini = localDate(masDias(lun, 7 * (k - 7))), fin = localDate(masDias(lun, 7 * (k - 6)));
    const v = camina
      ? db.walks.filter(w => w.date >= ini && w.date < fin).reduce((a, w) => a + (w.meters || 0), 0) / 1000
      : db.sessions.filter(s => s.date >= ini && s.date < fin).reduce((a, s) => a + s.sets.reduce((b, x) => b + (x.reps || 0) * (x.kg || 0), 0), 0);
    return { v, ini };
  });
  const max = Math.max(...semanas.map(x => x.v), 1e-9), act = semanas[7].v, ant = semanas[6].v;
  const total = camina ? `${act.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<small>km</small>` : `${fmtMiles(act)}<small>kg</small>`;
  const dif = ant ? Math.round((act - ant) / ant * 100) : null;
  $('hist-chart-head').innerHTML = `<b>${total}</b>${dif === null ? '' : `<em class="${dif > 0 ? 'up' : dif < 0 ? 'down' : ''}">${dif > 0 ? '+' : ''}${dif}% vs semana pasada</em>`}<span>${camina ? 'Distancia' : 'Volumen'} por semana · últimas 8</span>`;
  $('hist-bars').innerHTML = semanas.map((x, k) => `<i class="bar${k === 7 ? ' cur' : ''}" style="height:${Math.max(x.v / max * 100, 4)}%"></i>`).join('');
  const et = ini => { const d = new Date(ini + 'T12:00:00'); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; };
  $('hist-bl').innerHTML = semanas.map((x, k) => `<span>${k === 0 || k === 4 ? et(x.ini) : k === 7 ? 'Esta' : ''}</span>`).join('');
}
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
      date: s.date, ts: s.ts || 0, kind: 'session', id: s.id,
      editing: !!editingEntry && editingEntry.kind === 'session' && editingEntry.id === s.id,
      html: editingEntry && editingEntry.kind === 'session' && editingEntry.id === s.id ? entryEditorHtml('session', s) : sessionHtml(s)
    })),
    ...db.walks.map(w => ({
      date: w.date, ts: w.ts || 0, kind: 'walk', id: w.id,
      editing: !!editingEntry && editingEntry.kind === 'walk' && editingEntry.id === w.id,
      html: editingEntry && editingEntry.kind === 'walk' && editingEntry.id === w.id ? entryEditorHtml('walk', w) : walkHtml(w)
    }))
  ].sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);   // mismo día: el más reciente arriba

  if (detalleId && !items.some(i => i.id === detalleId)) detalleId = null;
  const solo = !!editingEntry || !!detalleId;
  $('stats').hidden = solo || !items.length;                 // al editar solo se ve la entrada; sin datos, ni tres ceros
  $('hist-filter').hidden = $('hist-chart').hidden = $('stats').hidden;
  document.querySelectorAll('[data-hfilter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hfilter === histFiltro)));
  renderHistChart();
  $('hist-chart').classList.toggle('quiet', quiet);
  const pasa = i => histFiltro === 'todo' || (histFiltro === 'fuerza') === (i.kind === 'session');
  const shown = editingEntry ? items.filter(i => i.editing) : detalleId ? items.filter(i => i.id === detalleId) : items.filter(pasa);
  // Agrupado por meses: cabecera con el nombre y lo que hubo (sin cabeceras mientras se edita)
  let mes = null, html = '';
  shown.forEach(i => {
    const m = i.date.slice(0, 7);
    if (!solo && m !== mes) {
      mes = m;
      const del = shown.filter(x => x.date.startsWith(m)), ne = del.filter(x => x.kind === 'session').length, nc = del.length - ne;
      const [y, mm] = m.split('-').map(Number), nombre = MESES[mm - 1][0].toUpperCase() + MESES[mm - 1].slice(1);
      const partes = [ne ? plural(ne, 'entreno', 'entrenos') : '', nc ? plural(nc, 'caminata', 'caminatas') : ''].filter(Boolean).join(' · ');
      html += `<div class="hmes"><h4>${nombre}${y !== new Date().getFullYear() ? ' ' + y : ''}</h4><span>${partes}</span></div>`;
    }
    html += `<div class="card entry">${i.html}</div>`;
  });
  $('history-list').innerHTML = html
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
    document.body.dataset.tab = btn.dataset.tab.replace('tab-', '');
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
$('routine-days').addEventListener('click', e => {
  const b = e.target.closest('[data-day]'); if (!b) return;
  const i = +b.dataset.day, on = !draft.days.includes(i);
  draft.days = on ? [...draft.days, i].sort((a, c) => a - c) : draft.days.filter(d => d !== i);
  b.setAttribute('aria-pressed', String(on)); vibrate(6); avisoDias();
});
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

$('routine-save-top').onclick = () => $('routine-save').click();
$('routine-save').onclick = () => {
  const name = draft.name.trim();
  const exercises = draft.exercises
    .map(ex => ({ name: ex.name.trim(), image: ex.image || '', ejId: ex.ejId || '', sets: ex.sets.map(s => ({ w: !!s.w, kg: num(s.kg) || '', reps: num(s.reps) || '' })) }))
    .filter(ex => ex.name);
  if (!name || !exercises.length) { shake($('routine-save')); return toast('Nombre y ejercicios. Completa la rutina.'); }
  const mine = db.routines.find(r => r.id === draft.id);
  const days = [...draft.days];
  const cambios = draft.exercises.filter(ex => ex.orig && ex.name.trim() && ex.name.trim() !== ex.orig).map(ex => ({ de: ex.orig, a: ex.name.trim() }));
  if (mine) {
    if (name !== mine.name) enlazarEntrenos(mine.id, mine.name, name);
    renombrarEjercicios(mine.id, cambios, exercises);
    mine.name = name; mine.exercises = exercises; mine.days = days;
  } else db.routines.push({ id: uid(), name, exercises, days });
  const edited = !!mine;
  draft = newDraft(); creating = false;
  renderEditor();
  if (persist()) toast(edited ? 'Rutina actualizada.' : 'Rutina guardada. Ahora a trabajar.');
};

// Renombrar una rutina o un ejercicio no pierde su historial: los entrenos se enlazan a la rutina por su id
// (los antiguos, que solo tenían el nombre, se enlazan ahora) y las series cambian de nombre con el ejercicio
function enlazarEntrenos(id, viejo, nuevo) {
  const v = String(viejo).toLowerCase();
  db.sessions.forEach(s => {
    if (s.routineId ? s.routineId !== id : String(s.routine).toLowerCase() !== v) return;
    s.routineId = id; s.routine = nuevo; tocar(s);
  });
}
function renombrarEjercicios(rutinaId, cambios, nuevos) {
  cambios.forEach(({ de, a }) => {
    // si otra rutina (o otro ejercicio de esta) sigue usando el nombre viejo, no era un renombrado: el historial se queda como está
    const sigue = nuevos.some(e => e.name === de) || db.routines.some(r => r.id !== rutinaId && r.exercises.some(e => e.name === de));
    if (sigue) return;
    db.sessions.forEach(s => {
      let cambio = false;
      s.sets.forEach(x => { if (x.exercise === de) { x.exercise = a; cambio = true; } });
      if (cambio) tocar(s);
    });
  });
}
// Avisa si en alguno de los días elegidos ya toca otra rutina (ese día saldrán las dos)
function avisoDias() {
  const nota = $('days-note'), cruces = [];
  draft.days.forEach(d => { const otras = db.routines.filter(r => r.id !== draft.id && (r.days || []).includes(d)); if (otras.length) cruces.push(`${DIAS_NOMBRE[d]} ya toca ${otras.map(r => r.name).join(' y ')}`); });
  nota.hidden = !cruces.length;
  nota.textContent = cruces.length ? `${cruces.join('; ')}: ese día saldrán las dos.` : '';
}
function borrarRutina(id) {
  db.routines = db.routines.filter(r => r.id !== id);
  if (lsGet('entreno-uid') && !db.deleted.rutinas.includes(id)) db.deleted.rutinas.push(id);   // para que no vuelva desde la nube
}
document.addEventListener('pointerdown', e => {      // tocar fuera del menú ⋯ de una rutina lo cierra (sin reanimar)
  if (menuRutina && !e.target.closest('#routines-list .entry-menu, [data-routine-menu]')) { menuRutina = null; cerrarMenus('#routines-list', '[data-routine-menu]'); }
});
$('routines-list').onclick = e => {
  const start = e.target.closest('[data-start-routine]'), edit = e.target.closest('[data-edit-routine]'), open = e.target.closest('[data-open-routine]');
  const dots = e.target.closest('[data-routine-menu]'), dup = e.target.closest('[data-dup-routine]'), del = e.target.closest('[data-del-routine]');
  if (dots) { menuRutina = menuRutina === dots.dataset.routineMenu ? null : dots.dataset.routineMenu; vibrate(6); renderRoutines(true); return verMenuAbierto('#routines-list'); }
  if (dup) return duplicarRutina(dup.dataset.dupRoutine);
  if (del) return borrarRutinaDelMenu(del);
  if (start) return startWorkout(start.dataset.startRoutine);
  if (edit) { menuRutina = null; cerrarMenus('#routines-list', '[data-routine-menu]'); return editRoutine(edit.dataset.editRoutine); }
  if (open && typeof rsOpen === 'function') rsOpen(open.dataset.openRoutine);
};
function duplicarRutina(id) {
  const i = db.routines.findIndex(x => x.id === id);
  if (i < 0) return;
  const r = db.routines[i];
  const sig = db.routines[i + 1], copia = { ...JSON.parse(JSON.stringify(r)), id: uid(), name: `${r.name} (copia)`, pos: sig ? (r.pos + sig.pos) / 2 : r.pos + 1 };
  delete copia.rev; delete copia.upd;      // es una rutina nueva: empieza sin versión
  db.routines.splice(i + 1, 0, copia);
  menuRutina = null; vibrate(8);
  if (persist()) toast('Rutina duplicada.');
}
function borrarRutinaDelMenu(b) {
  if (!b.classList.contains('armed')) {
    b.classList.add('armed'); b.textContent = '¿Seguro?'; vibrate([30, 40, 30]);
    clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Borrar'; }, 3000);
    return;
  }
  clearTimeout(b._t);
  borrarRutina(b.dataset.delRoutine);
  menuRutina = null;
  if (persist()) toast('Rutina borrada.');
}
function editRoutine(id) {
  const r = db.routines.find(x => x.id === id);
  if (!r) return;
  draft = { id: r.id, name: r.name, days: [...(r.days || [])], exercises: r.exercises.map(ex => ({ orig: ex.name, name: ex.name, image: ex.image || '', ejId: ex.ejId || '', sets: (ex.sets.length ? ex.sets : [blankSet(), blankSet(), blankSet()]).map(s => ({ w: !!s.w, kg: s.kg === '' ? '' : String(s.kg), reps: s.reps === '' ? '' : String(s.reps) })) })) };
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
  borrarRutina(draft.id);
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
  salud('caminata', seconds, w.meters);
  persist();
  celebrate('Caminata hecha');
};

$('walk-goal').oninput = updateGoalLabel;

// ---------- Almacenamiento seguro ----------
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
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

// Un solo tema (oscuro): se limpia lo que guardaban las versiones con tema claro
try { localStorage.removeItem('entreno-tema'); } catch { /* sin almacenamiento */ }

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
    const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7, n = new Date(y, m, 0).getDate();
    let out = '<span></span>'.repeat(lead);
    for (let d = 1; d <= n; d++) {
      const key = `${calMonth}-${String(d).padStart(2, '0')}`, on = days.has(key);
      out += `<button type="button" class="cd${on ? ' on' : ''}${key === today ? ' today' : ''}${key === calSel ? ' sel' : ''}" data-date="${key}">${on ? CHECK_ICO : d}</button>`;
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
$('settings-btn').onclick = () => setSettings(true);
$('settings-close').onclick = () => setSettings(false);
$('scrim').onclick = () => { setSettings(false); setCal(false); closeFinish(); if (typeof closePicker === 'function') closePicker(); if (typeof closeDetail === 'function') closeDetail(); };
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
window.addEventListener('load', () => loadEjercicios().then(() => { renderRoutines(); renderPerfil(); }).catch(() => { /* sin catálogo: las rutinas se ven sin grupos */ }));
(function resumeWalk() {
  try {
    const w = JSON.parse(lsGet(WALK_KEY) || 'null');
    if (w && Number.isFinite(w.start) && Number.isFinite(w.goal) && Date.now() - w.start < WALK_MAX_AGE) runWalk({ start: w.start, goal: w.goal, meters: w.meters || 0, done: !!w.done });
    else if (w) lsSet(WALK_KEY, '');
  } catch { lsSet(WALK_KEY, ''); }
})();
moveIndicator();

if ('serviceWorker' in navigator) {
  // Si ya había una versión controlando la página y llega una nueva, se recarga una vez para mostrar el cambio
  // (si no, la primera apertura seguiría con la copia vieja de la caché)
  const teniaSW = !!navigator.serviceWorker.controller;
  let recargada = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (teniaSW && !recargada) { recargada = true; location.reload(); }
  });
  navigator.serviceWorker.register('sw.js');
}

// iOS ignora user-scalable=no: se cancelan los gestos de pellizco para que la app no haga zoom
['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
