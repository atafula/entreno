// Detalle de rutina: ejercicios y gráfica de progreso. Depende de app.js (db, num, esc, e1rm, setLabel).

const RS_METRICS = { rm: { label: '1RM est.' }, kg: { label: 'Peso máx.' }, vol: { label: 'Volumen' } };
const RS_MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const RS_MAX_PUNTOS = 24;
const rsNorm = n => String(n || '').trim().toLowerCase();
const rsRound = v => String(Math.round(v * 10) / 10);
const rsFecha = (iso, conAnio) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${RS_MESES[m - 1]}${conAnio ? ` ${String(y).slice(2)}` : ''}`; };

// Un punto por entreno en el que hiciste el ejercicio (el calentamiento no cuenta).
// rm = mejor 1RM estimado · kg = mayor peso · vol = kg × reps total. Sin kilos (peso corporal) se usan las repeticiones.
function exerciseSeries(name, metric = 'rm') {
  const key = rsNorm(name), pts = [];
  db.sessions.forEach((s, idx) => {
    const sets = (s.sets || []).filter(x => rsNorm(x.exercise) === key && !x.w && num(x.reps) > 0);
    if (!sets.length) return;
    const bw = sets.every(x => !num(x.kg));
    let v, detail;
    if (metric === 'vol') {
      v = sets.reduce((a, x) => a + (bw ? num(x.reps) : num(x.kg) * num(x.reps)), 0);
      detail = `${sets.length} ${sets.length === 1 ? 'serie' : 'series'}`;
    } else {
      const score = x => bw ? num(x.reps) : metric === 'kg' ? num(x.kg) + num(x.reps) / 1e4 : e1rm(num(x.kg), num(x.reps));
      const best = sets.reduce((a, x) => score(x) > score(a) ? x : a);
      v = bw ? num(best.reps) : metric === 'kg' ? num(best.kg) : e1rm(num(best.kg), num(best.reps));
      detail = bw ? `${num(best.reps)} reps` : `${num(best.kg)} kg × ${num(best.reps)}`;
    }
    pts.push({ id: s.id, date: s.date, v, detail, bw, idx });
  });
  pts.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.idx - b.idx);
  const out = pts.some(p => !p.bw) ? pts.filter(p => !p.bw) : pts;
  let top = 0;
  out.forEach((p, i) => { p.pr = i > 0 && p.v > top + 1e-9; top = Math.max(top, p.v); });
  return out.slice(-RS_MAX_PUNTOS);
}

let rsId = null, rsEx = 0, rsMetric = 'rm', rsSel = null;
const rsRoutine = () => db.routines.find(r => r.id === rsId);

function rsChartSvg(series, sel, name) {
  const W = 340, H = 190, L = 40, R = 14, T = 14, B = 28, n = series.length;
  const vals = series.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = (hi - lo) * 0.15 || Math.max(hi * 0.1, 1);
  lo = Math.max(0, lo - pad); hi += pad;
  const x = i => n === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (n - 1);
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const dec = hi - lo >= 6 ? 0 : 1;
  let g = '';
  for (let k = 0; k < 3; k++) {
    const v = lo + (hi - lo) * k / 2;
    g += `<line class="rs-grid" x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="rs-y" x="${L - 6}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end">${v.toFixed(dec)}</text>`;
  }
  const conAnio = series[0].date.slice(0, 4) !== series[n - 1].date.slice(0, 4);
  const marks = n === 1 ? [0] : n >= 5 ? [0, Math.floor((n - 1) / 2), n - 1] : [0, n - 1];
  marks.forEach(i => { g += `<text class="rs-x" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${rsFecha(series[i].date, conAnio)}</text>`; });
  if (n > 1) g += `<polyline class="rs-line" points="${series.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}"/>`;
  series.forEach((p, i) => {
    g += `<g class="pt${p.pr ? ' pr' : ''}${i === sel ? ' sel' : ''}" data-i="${i}"><circle class="hit" cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="16"/><circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${i === sel ? 7 : 5}"/></g>`;
  });
  return `<svg class="rs-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progreso de ${esc(name)}">${g}</svg>`;
}

function rsRenderChart(r) {
  const ex = r.exercises[Math.min(rsEx, r.exercises.length - 1)];
  if (!ex) { $('rs-chart').innerHTML = ''; return; }
  const series = exerciseSeries(ex.name, rsMetric), n = series.length;
  const sel = n ? Math.min(rsSel ?? n - 1, n - 1) : null;
  const unit = series.length && series.every(p => p.bw) ? 'reps' : 'kg';
  const p = n ? series[sel] : null;
  $('rs-chart').innerHTML = `
    <div class="rs-chart-head"><h3 id="rs-chart-title">${esc(ex.name)}</h3><span class="rs-count">${n} ${n === 1 ? 'entreno' : 'entrenos'}</span></div>
    <div class="seg rs-metric" role="group" aria-label="Qué medir">${Object.entries(RS_METRICS).map(([k, m]) => `<button type="button" data-rs-metric="${k}" aria-pressed="${k === rsMetric}">${m.label}</button>`).join('')}</div>
    ${n ? rsChartSvg(series, sel, ex.name) : '<p class="rs-empty">Aún sin registros de este ejercicio.<br>Entrena y aquí verás cómo subes.</p>'}
    <p class="rs-read" id="rs-read">${p ? `<b>${rsFecha(p.date)}</b> · ${rsRound(p.v)} ${unit}${p.pr ? ' · <em>PR</em>' : ''}<small>${esc(p.detail)}</small>` : ''}</p>`;
}

function rsRender() {
  const r = rsRoutine();
  if (!r) return rsClose();
  const sets = r.exercises.reduce((n, e) => n + e.sets.length, 0);
  $('rs-title').textContent = r.name;
  $('rs-sub').textContent = `${plural(r.exercises.length, 'ejercicio', 'ejercicios')} · ${plural(sets, 'serie', 'series')}`;
  rsRenderChart(r);
  $('rs-exercises').innerHTML = `<h4 class="rs-h">Ejercicios</h4>` + r.exercises.map((e, i) => `
    <button type="button" class="rs-ex" data-rs-ex="${i}" aria-pressed="${i === rsEx}">
      <b>${esc(e.name)}</b>
      <span class="pills">${e.sets.length ? e.sets.map(s => `<span class="pill${s.w ? ' w' : ''}">${esc(setLabel(s))}</span>`).join('') : '<span class="pill">Sin series</span>'}</span>
    </button>`).join('');
}

function rsOpen(id) {
  if (!db.routines.some(r => r.id === id)) return;
  rsId = id; rsEx = 0; rsMetric = 'rm'; rsSel = null;
  $('rscreen').hidden = false;
  document.body.classList.add('rs-open');
  rsRender();
  $('rscreen').scrollTop = 0;
  $('rs-back').focus({ preventScroll: true });
}
function rsClose() {
  rsId = null;
  $('rscreen').hidden = true;
  document.body.classList.remove('rs-open');
}
const rsRefresh = () => { if (rsId) rsRender(); };

$('rscreen').addEventListener('click', e => {
  const t = e.target;
  if (t.closest('#rs-back')) return rsClose();
  const m = t.closest('[data-rs-metric]');
  if (m) { rsMetric = m.dataset.rsMetric; rsSel = null; vibrate(6); return rsRender(); }
  const ex = t.closest('[data-rs-ex]');
  if (ex) { rsEx = +ex.dataset.rsEx; rsSel = null; vibrate(6); rsRender(); return $('rscreen').scrollTo({ top: 0, behavior: 'smooth' }); }
  const pt = t.closest('.pt[data-i]');
  if (pt) { rsSel = +pt.dataset.i; vibrate(6); rsRender(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && rsId) rsClose(); });
