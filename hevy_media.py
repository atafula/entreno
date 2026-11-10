#!/usr/bin/env python
"""
Lee los CSV locales y genera hevy_media.json
{nombre_en_minusculas: {thumbnail, source, type}}

Uso: python hevy_media.py
"""
import csv, json, os

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, "hevy_media.json")

def read_csv(filename):
    with open(os.path.join(DIR, filename), encoding="utf-8") as f:
        return list(csv.DictReader(f))

print("Leyendo thumbnails.csv...")
thumbs = {}
for row in read_csv("thumbnails.csv"):
    t = row.get("thumbnail", "") or ""
    if t and t != "None":
        thumbs[row["name"].lower()] = t

print(f"  {len(thumbs)} thumbnails.")

print("Leyendo exercises_data.csv...")
exs = read_csv("exercises_data.csv")
print(f"  {len(exs)} ejercicios.")

media = {}
for row in exs:
    name = (row.get("name") or "").strip()
    if not name:
        continue
    source = row.get("source") or ""
    stype  = row.get("sourceType") or ""
    if source == "None": source = ""
    if stype  == "None": stype  = ""
    thumb = thumbs.get(name.lower(), "")
    if thumb or source:
        media[name.lower()] = {"thumbnail": thumb, "source": source, "type": stype}

json.dump(media, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"\nListo. {len(media)} ejercicios con media en {OUT}")
