#!/usr/bin/env python
"""
Descarga el catálogo de ejercicios, traduce los nombres al español con Google Translate
(gratis, sin API key) y guarda traducciones.json.

Uso:  python traducir.py
"""
import json, os, time, urllib.request, urllib.parse

GT_URL = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q={}"
DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, "traducciones.json")
EJ_LOCAL = os.path.join(DIR, "ejercicios_local.json")

def translate(text):
    url = GT_URL.format(urllib.parse.quote(text))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    return "".join(part[0] for part in data[0] if part[0])

def main():
    print("Leyendo ejercicios_local.json...")
    with open(EJ_LOCAL, encoding="utf-8") as f:
        data = json.load(f)
    names = [e["name"] for e in data]
    print(f"{len(names)} ejercicios.")

    trad = {}
    if os.path.exists(OUT):
        trad = json.load(open(OUT, encoding="utf-8"))
        print(f"{len(trad)} ya traducidos, continuando...")

    todo = [n for n in names if n not in trad]
    print(f"{len(todo)} por traducir.")

    for i, name in enumerate(todo):
        try:
            trad[name] = translate(name)
            if (i + 1) % 50 == 0:
                json.dump(trad, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
                print(f"  {i+1}/{len(todo)} guardados...")
            time.sleep(0.05)   # pausa mínima para no saturar
        except Exception as e:
            print(f"  ERROR en '{name}': {e}")
            time.sleep(1)

    json.dump(trad, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\nListo. {len(trad)} traducciones en {OUT}")

if __name__ == "__main__":
    main()
