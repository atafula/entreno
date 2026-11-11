// Catálogo de ejercicios: carga desde CSV local, cachea en IndexedDB, busca y presenta el picker
const EJ_URL = 'ejercicios_local.json';
const EJ_DB_NAME = 'forjado-ej';
const EJ_STORE = 'ejercicios';

const PARTES = {
  'Abdominals': 'Abdomen', 'Abductors': 'Abductores', 'Adductors': 'Aductores',
  'Biceps': 'Bíceps', 'Calves': 'Pantorrillas', 'Cardio': 'Cardio',
  'Chest': 'Pecho', 'Forearms': 'Antebrazos', 'Full Body': 'Cuerpo completo',
  'Glutes': 'Glúteos', 'Hamstrings': 'Isquios', 'Lats': 'Espalda',
  'Lower Back': 'Lumbar', 'Neck': 'Cuello', 'Other': 'Otro',
  'Quadriceps': 'Cuádriceps', 'Shoulders': 'Hombros', 'Traps': 'Trapecios',
  'Triceps': 'Tríceps', 'Upper Back': 'Espalda alta',
};
const EQUIPO = {
  'Barbell': 'Barra', 'Dumbbell': 'Mancuernas', 'Kettlebell': 'Pesa rusa',
  'Machine': 'Máquina', 'None': '', 'Other': 'Otro',
  'Plate': 'Disco', 'Resistance Band': 'Banda elástica', 'Suspension': 'Suspensión',
};

let ejCache = null;
let ejTrad = null;      // {en: es} cargado de traducciones.json
let pickerCb = null;
let pickerPart = '';

async function loadTrad() {
  if (ejTrad) return;
  try {
    const r = await fetch('traducciones.json');
    if (r.ok) ejTrad = await r.json();
  } catch { /* sin traducciones */ }
  if (!ejTrad) ejTrad = {};
}
const tradName = name => ejTrad[name] || name;
const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;


function ejOpenIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(EJ_DB_NAME, 4);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(EJ_STORE)) db.deleteObjectStore(EJ_STORE);
      db.createObjectStore(EJ_STORE, { keyPath: 'id' });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}
function ejIDBGetAll(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EJ_STORE, 'readonly');
    const req = tx.objectStore(EJ_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function ejIDBPutAll(db, items) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EJ_STORE, 'readwrite');
    const store = tx.objectStore(EJ_STORE);
    items.forEach(item => store.put(item));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function ejSlim(e) {
  return {
    id: e.id,
    name: e.name,
    body_part: e.body_part || '',
    equipment: e.equipment || '',
    secondary_muscles: e.secondary_muscles || [],
    thumbnail: e.thumbnail || '',
    source: e.source || '',
    sourceType: e.sourceType || '',
    instructions: e.instructions || [],
  };
}
function ejIDBReplaceAll(db, items) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EJ_STORE, 'readwrite');
    const store = tx.objectStore(EJ_STORE);
    store.clear();
    items.forEach(item => store.put(item));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Red primero: así cada móvil recibe el catálogo nuevo (pasos, nombres). Sin red, usa la copia guardada.
async function loadEjercicios() {
  if (ejCache) return ejCache;
  await loadTrad();
  let idb = null;
  try { idb = await ejOpenIDB(); } catch { /* sin IndexedDB: solo red */ }
  let fresh = null;
  try {
    const res = await fetch(EJ_URL);
    if (res.ok) fresh = (await res.json()).map(ejSlim);
  } catch { /* sin red */ }
  if (fresh) {
    if (idb) await ejIDBReplaceAll(idb, fresh).catch(() => { /* la copia no se guarda; la app sigue */ });
    ejCache = fresh;
    return ejCache;
  }
  if (idb) {
    const cached = await ejIDBGetAll(idb).catch(() => []);
    if (cached.length > 0) { ejCache = cached; return ejCache; }
  }
  throw new Error('No se pudo cargar el catálogo');
}

// Ocultos del selector los ejercicios sin foto (52 del catálogo), hasta tener sus imágenes
const tieneFoto = e => !!(e.thumbnail || (e.sourceType === 'image' && e.source));
function searchEjercicios(q, part) {
  if (!ejCache) return [];
  const lq = q.toLowerCase().trim();
  return ejCache.filter(e =>
    tieneFoto(e) &&
    (!part || e.body_part === part) &&
    (!lq || e.name.toLowerCase().includes(lq) || tradName(e.name).toLowerCase().includes(lq))
  ).slice(0, lq ? 50 : 200);
}

function renderPickerFilters() {
  const btn = (key, label) =>
    `<button type="button" class="picker-filter${pickerPart === key ? ' active' : ''}" data-part="${key}">${label}</button>`;
  document.getElementById('picker-filters').innerHTML =
    btn('', 'Todos') + Object.entries(PARTES).map(([k, v]) => btn(k, v)).join('');
}

function renderPickerList() {
  const q = document.getElementById('picker-search').value;
  const list = document.getElementById('picker-list');
  if (!ejCache) {
    list.innerHTML = '<p class="picker-status">Cargando ejercicios…</p>';
    return;
  }
  const qTrim = q.trim();
  const results = searchEjercicios(q, pickerPart);
  const addCustom = qTrim && !results.find(e => e.name.toLowerCase() === qTrim.toLowerCase());
  let html = results.map(e => {
    const parte = PARTES[e.body_part] || e.body_part;
    const equipo = EQUIPO[e.equipment] || e.equipment;
    const nombreEs = capFirst(tradName(e.name));
    const imgUrl = e.thumbnail || (e.sourceType === 'image' ? e.source : '');
    const img = imgUrl
      ? `<img src="${imgUrl}"${CORS()} alt="" class="picker-img" loading="lazy">`
      : `<div class="picker-img-ph"></div>`;
    return `<button type="button" class="picker-item" data-name="${nombreEs.replace(/"/g, '&quot;')}" data-image="${imgUrl}" data-id="${e.id}">
      ${img}
      <span class="picker-item-text">
        <span class="picker-name">${esc(nombreEs)}</span>
        <span class="picker-meta">${esc(parte)}${equipo ? ' · ' + esc(equipo) : ''}</span>
      </span>
    </button>`;
  }).join('');
  if (addCustom) {
    html += `<button type="button" class="picker-item picker-custom" data-name="${qTrim.replace(/"/g, '&quot;')}" data-image="">
      <div class="picker-img-ph"></div>
      <span class="picker-item-text">
        <span class="picker-name">Añadir «${esc(qTrim)}»</span>
        <span class="picker-meta">Personalizado</span>
      </span>
    </button>`;
  }
  if (!html) html = '<p class="picker-status">Sin resultados.</p>';
  list.innerHTML = html;
}

function setPicker(open, cb) {
  const sheet = document.getElementById('picker-sheet');
  sheet.classList.toggle('show', open);
  sheet.setAttribute('aria-hidden', String(!open));
  const scrim = document.getElementById('scrim');
  if (open) {
    scrim.classList.add('show');
    pickerCb = cb || null;
    pickerPart = '';
    document.getElementById('picker-search').value = '';
    renderPickerFilters();
    if (ejCache) {
      renderPickerList();
    } else {
      document.getElementById('picker-list').innerHTML = '<p class="picker-status">Cargando ejercicios…</p>';
      loadEjercicios()
        .then(() => renderPickerList())
        .catch(() => {
          document.getElementById('picker-list').innerHTML =
            '<p class="picker-status">No se pudo cargar.<br>Comprueba la conexión.</p>';
        });
    }
    document.getElementById('picker-search').focus({ preventScroll: true });
  } else {
    scrim.classList.remove('show');
    pickerCb = null;
  }
}

document.getElementById('picker-close').onclick = () => setPicker(false);
document.getElementById('picker-search').addEventListener('input', renderPickerList);
document.getElementById('picker-filters').addEventListener('click', e => {
  const b = e.target.closest('[data-part]');
  if (!b) return;
  pickerPart = b.dataset.part;
  renderPickerFilters();
  renderPickerList();
});
document.getElementById('picker-list').addEventListener('click', e => {
  const b = e.target.closest('[data-name]');
  if (!b) return;
  const name = b.dataset.name;
  if (pickerCb) pickerCb({ name, image: b.dataset.image || '', id: b.dataset.id || '' });
  setPicker(false);
  vibrate(6);
});

window.openPicker = cb => setPicker(true, cb);
window.closePicker = () => setPicker(false);

function setDetail(open, id) {
  const sheet = document.getElementById('detail-sheet');
  sheet.classList.toggle('show', open);
  sheet.setAttribute('aria-hidden', String(!open));
  const scrim = document.getElementById('scrim');
  if (open) {
    scrim.classList.add('show');
    const ex = ejCache && ejCache.find(e => e.id === id);
    const title = document.getElementById('detail-title');
    const body = document.getElementById('detail-body');
    if (!ex) {
      title.textContent = 'Ejercicio';
      body.innerHTML = '<p class="picker-status">No hay información disponible.</p>';
    } else {
      const nombreEs = capFirst(tradName(ex.name));
      title.textContent = nombreEs;
      const parte = PARTES[ex.body_part] || ex.body_part;
      const equipo = EQUIPO[ex.equipment] || ex.equipment;
      const segundarios = (ex.secondary_muscles || []).join(', ');
      let mediaHtml = '';
      if (ex.source && ex.sourceType === 'video') {
        mediaHtml = `<video src="${ex.source}" class="detail-gif" autoplay loop muted playsinline></video>`;
      } else if (ex.source && ex.sourceType === 'image') {
        mediaHtml = `<img src="${ex.source}"${CORS()} alt="${esc(nombreEs)}" class="detail-gif" loading="lazy">`;
      } else if (ex.thumbnail) {
        mediaHtml = `<img src="${ex.thumbnail}"${CORS()} alt="${esc(nombreEs)}" class="detail-gif" loading="lazy">`;
      }
      const musclesHtml = `<p class="detail-muscles">
        <b>Músculo principal:</b> ${esc(parte)}
        ${segundarios ? `<br><b>Secundarios:</b> ${esc(segundarios)}` : ''}
        ${equipo ? `<br><b>Equipo:</b> ${esc(equipo)}` : ''}
      </p>`;
      const stepsHtml = ex.instructions && ex.instructions.length
        ? `<ol class="detail-steps">${ex.instructions.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`
        : '';
      body.innerHTML = mediaHtml + musclesHtml + stepsHtml;
    }
  } else {
    scrim.classList.remove('show');
  }
}

document.getElementById('detail-close').onclick = () => setDetail(false);

window.showExDetail = id => setDetail(true, id);
window.closeDetail = () => setDetail(false);
