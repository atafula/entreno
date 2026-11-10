#!/usr/bin/env python
"""
Genera ejercicios_local.json desde los CSV locales.
Fusiona instrucciones desde el catálogo GitHub (si hay red).
Uso: python csv_to_json.py
"""
import csv, json, os, re, urllib.request, io, html, time
from urllib.parse import quote

DIR = os.path.dirname(os.path.abspath(__file__))

def read_csv(filename):
    with open(os.path.join(DIR, filename), encoding='utf-8') as f:
        return list(csv.DictReader(f))

def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

GH_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json'

STOPWORDS = {'with', 'the', 'a', 'an', 'and', 'or', 'on', 'in', 'at', 'to', 'of', 'from', 'ii', 'iii', 'two', 'one'}

def word_set(name):
    """Normalize a name to a frozenset of meaningful words."""
    s = re.sub(r'[^a-z0-9 ]', ' ', name.lower())
    return frozenset(w for w in s.split() if w not in STOPWORDS and len(w) > 1)

def hevy_variants(name):
    """Generate lookup keys from a Hevy name like 'Bench Press (Barbell)'."""
    lo = name.lower()
    yield lo
    core = re.sub(r'\s*\(.*?\)', '', lo).strip()
    if core != lo:
        yield core
    for m in re.finditer(r'\(([^)]+)\)', lo):
        eq = m.group(1).strip()
        yield f"{eq} {core}"
        yield f"{eq} {core}".replace('-', ' ')
    yield core.replace('-', ' ')
    yield lo.replace('-', ' ')

def fetch_instructions():
    """Returns lookup fn: name -> [step, ...]. Downloads GitHub JSON."""
    print('Descargando instrucciones desde GitHub...')
    try:
        req = urllib.request.Request(GH_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        gh = {}
        for e in data:
            steps = []
            if e.get('instruction_steps'):
                s = e['instruction_steps'].get('es') or e['instruction_steps'].get('en')
                if isinstance(s, list): steps = s
            elif e.get('instructions'):
                s = e['instructions'].get('es') or e['instructions'].get('en')
                if isinstance(s, str) and s: steps = [s]
            if steps:
                gh[e['name'].lower()] = steps
        print(f'  {len(gh)} ejercicios con instrucciones en GitHub.')
        # Build word-set index for fuzzy matching
        ws_index = {}  # frozenset -> steps (first match wins)
        for k, steps in gh.items():
            ws = word_set(k)
            if ws not in ws_index:
                ws_index[ws] = steps

        def lookup(name):
            # 1. exact key variants
            for key in hevy_variants(name):
                if key in gh: return gh[key]
            # 2. word-set exact match (order-independent)
            ws = word_set(name)
            if ws in ws_index: return ws_index[ws]
            # 3. word-set subset: hevy words all present in some gh name
            for gh_ws, steps in ws_index.items():
                if ws and ws.issubset(gh_ws) and len(gh_ws) - len(ws) <= 2:
                    return steps
            return []
        return lookup
    except Exception as ex:
        print(f'  Sin instrucciones (error: {ex}).')
        return lambda _: []

def fetch_wger():
    """Returns {name_lower: [step, ...]} from wger public API (no key). Slow — batches all exercises."""
    print('Descargando instrucciones desde Wger...')
    try:
        # Fetch all English exercises with descriptions
        wger = {}
        url = 'https://wger.de/api/v2/exerciseinfo/?format=json&limit=100&offset=0'
        while url:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read())
            for ex in data['results']:
                for t in ex.get('translations', []):
                    if t.get('language') != 2: continue  # English only
                    name = (t.get('name') or '').strip()
                    desc = t.get('description') or ''
                    if not name or not desc: continue
                    plain = re.sub(r'<[^>]+>', ' ', html.unescape(desc)).strip()
                    plain = re.sub(r'\s+', ' ', plain)
                    if plain and name.lower() not in wger:
                        wger[name.lower()] = [plain]
            url = data.get('next')
            time.sleep(0.05)
        print(f'  {len(wger)} ejercicios en Wger.')
        # Build word-set index
        wger_ws = {}
        for k, v in wger.items():
            ws = word_set(k)
            if ws and ws not in wger_ws:
                wger_ws[ws] = v
        def lookup_wger(name):
            lo = name.lower()
            if lo in wger: return wger[lo]
            ws = word_set(name)
            if ws in wger_ws: return wger_ws[ws]
            for gh_ws, steps in wger_ws.items():
                if ws and ws.issubset(gh_ws) and len(gh_ws) - len(ws) <= 2:
                    return steps
            return []
        return lookup_wger
    except Exception as ex:
        print(f'  Wger no disponible ({ex}).')
        return lambda _: []

thumbs = {}
for row in read_csv('thumbnails.csv'):
    t = row.get('thumbnail', '') or ''
    if t and t != 'None':
        thumbs[row['name']] = t

lookup_instructions = fetch_instructions()
lookup_wger = fetch_wger()

result = []
for row in read_csv('exercises_data.csv'):
    name = (row.get('name') or '').strip()
    if not name:
        continue
    source = row.get('source', '') or ''
    stype = row.get('sourceType', '') or ''
    if source == 'None': source = ''
    if stype == 'None': stype = ''
    sec = row.get('secondary_muscle', '') or ''
    if sec == 'None': sec = ''
    secondary = [s.strip() for s in sec.split(',') if s.strip() and s.strip() != 'None']
    result.append({
        'id': slugify(name),
        'name': name,
        'body_part': (row.get('primary_muscle') or '').strip(),
        'equipment': (row.get('equipment') or '').strip(),
        'secondary_muscles': secondary,
        'thumbnail': thumbs.get(name, ''),
        'source': source,
        'sourceType': stype,
        'instructions': lookup_instructions(name) or lookup_wger(name),
    })

out = os.path.join(DIR, 'ejercicios_local.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f'Listo. {len(result)} ejercicios en {out}')
