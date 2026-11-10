// ---------- Copia de seguridad: descargar, restaurar y exportar a Excel (CSV) ----------
const BACKUP_APP = 'forja';
const BACKUP_APPS = [BACKUP_APP, 'entreno'];     // 'entreno' = copias hechas antes del cambio de nombre
const isStr = (v, max = 200) => typeof v === 'string' && v.length <= max;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function cleanRoutine(r) {
  if (!r || !isStr(r.id, 80) || !r.id || !isStr(r.name, 100) || !r.name.trim() || !Array.isArray(r.exercises)) return null;
  const exercises = r.exercises.filter(e => e && isStr(e.name, 100) && e.name.trim()).map(e => ({
    name: e.name, sets: (Array.isArray(e.sets) ? e.sets : []).map(s => ({ w: !!(s && s.w), kg: s && isNum(s.kg) ? s.kg : '', reps: s && isNum(s.reps) ? s.reps : '' }))
  }));
  return { id: r.id, name: r.name, exercises };
}
function cleanSession(s) {
  if (!s || !isStr(s.id, 80) || !s.id || !isDate(s.date) || !isStr(s.routine, 100) || !Array.isArray(s.sets)) return null;
  const sets = s.sets.filter(x => x && isStr(x.exercise, 100) && isNum(x.reps) && x.reps > 0 && (x.kg === undefined || isNum(x.kg)))
    .map(x => ({ exercise: x.exercise, reps: x.reps, kg: x.kg || 0, w: !!x.w }));
  if (sets.length !== s.sets.length) return null;           // si alguna serie está rota, se descarta toda la sesión
  const out = { id: s.id, date: s.date, routine: s.routine, sets };
  if (isNum(s.seconds)) out.seconds = s.seconds;
  if (isNum(s.ts)) out.ts = s.ts;
  return out;
}
function cleanWalk(w) {
  if (!w || !isStr(w.id, 80) || !w.id || !isDate(w.date) || !isNum(w.seconds) || !isNum(w.meters)) return null;
  const out = { id: w.id, date: w.date, seconds: w.seconds, meters: w.meters };
  if (isNum(w.ts)) out.ts = w.ts;
  return out;
}

function parseBackup(text) {
  let d;
  try { d = JSON.parse(text); } catch { throw new Error('json'); }
  if (!d || typeof d !== 'object' || Array.isArray(d) || !BACKUP_APPS.includes(d.app)) throw new Error('formato');
  const list = (v, f) => (Array.isArray(v) ? v : []).map(f).filter(Boolean);
  return { routines: list(d.routines, cleanRoutine), sessions: list(d.sessions, cleanSession), walks: list(d.walks, cleanWalk) };
}

// Se mezcla con lo que hay (no se borra nada); si un id ya existe, se sustituye por el de la copia.
function mergeBackup(c) {
  const merge = (cur, inc) => { const m = new Map(cur.map(x => [x.id, x])); inc.forEach(x => m.set(x.id, x)); return [...m.values()]; };
  [['sesiones', c.sessions], ['caminatas', c.walks]].forEach(([n, l]) => {      // lo restaurado ya no cuenta como borrado
    const ids = new Set(l.map(x => x.id)); db.deleted[n] = db.deleted[n].filter(id => !ids.has(id));
  });
  db.routines = merge(db.routines, c.routines);
  db.sessions = merge(db.sessions, c.sessions).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
  db.walks = merge(db.walks, c.walks).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
}

function downloadFile(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

$('backup-export').onclick = () => {
  const data = { app: BACKUP_APP, version: 1, exported: new Date().toISOString(), routines: db.routines, sessions: db.sessions, walks: db.walks };
  downloadFile(`forja-${localDate()}.json`, new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
};

$('backup-csv').onclick = () => {
  const dec = n => String(n).replace('.', ',');
  const rows = [['fecha', 'tipo', 'rutina', 'ejercicio', 'serie', 'calentamiento', 'kg', 'reps', 'minutos', 'metros']];
  db.sessions.forEach(s => {
    const n = {};
    s.sets.forEach(x => {
      const k = x.exercise; if (!x.w) n[k] = (n[k] || 0) + 1;
      rows.push([s.date, 'entreno', s.routine, x.exercise, x.w ? '' : n[k], x.w ? 'sí' : '', x.kg ? dec(x.kg) : '', x.reps, '', '']);
    });
  });
  db.walks.forEach(w => rows.push([w.date, 'caminata', '', '', '', '', '', '', Math.round(w.seconds / 60), w.meters]));
  const csv = '﻿' + rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  downloadFile(`forja-${localDate()}.csv`, new Blob([csv], { type: 'text/csv' }));
};

$('backup-file').onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const c = parseBackup(await f.text());
    mergeBackup(c);
    if (c.routines.length) { db.routinesTs = Date.now(); delete db.routinesSig; }   // para que la nube la tome como lo más reciente
    persist();
    toast(`Copia restaurada: ${c.routines.length} rutinas, ${c.sessions.length} entrenos, ${c.walks.length} caminatas`);
  } catch { toast('Ese archivo no es una copia de Forja'); }
  e.target.value = '';
};
