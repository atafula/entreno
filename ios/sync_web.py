#!/usr/bin/env python3
"""Copia la app web (raíz del repo) a ios/Sources/Forjado/web, que es lo que va dentro de la app de iOS.
Ejecútalo después de cambiar la web y antes de `xtool dev`:  python3 ios/sync_web.py"""
import os, shutil

IOS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(IOS)
DEST = os.path.join(IOS, "Sources", "Forjado", "web")
ARCHIVOS = ["index.html", "styles.css", "app.js", "ejercicios.js", "workout.js", "detalle.js", "backup.js", "sync.js",
            "traducciones.json", "ejercicios_local.json", "icons/apple-touch-icon.png", "icons/favicon.png"]
FUENTES = sorted(f for f in os.listdir(os.path.join(ROOT, "fonts")) if f.endswith((".woff2", ".css")))

def main():
    shutil.rmtree(DEST, ignore_errors=True)
    for rel in ARCHIVOS + ["fonts/" + f for f in FUENTES]:
        dst = os.path.join(DEST, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, rel), dst)
    print(f"{len(ARCHIVOS) + len(FUENTES)} archivos copiados a {os.path.relpath(DEST, ROOT)}")

if __name__ == "__main__":
    main()
