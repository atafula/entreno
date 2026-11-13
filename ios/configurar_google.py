#!/usr/bin/env python3
"""Configura el inicio de sesión con Google de la app de iOS a partir del GoogleService-Info.plist de Firebase.

1. Firebase → Configuración del proyecto (entreno-31153) → Añadir app → iOS, con el ID de paquete com.atafula.forjado.app.
2. Descarga GoogleService-Info.plist.
3. python3 ios/configurar_google.py ~/Downloads/GoogleService-Info.plist
"""
import os, plistlib, sys

IOS = os.path.dirname(os.path.abspath(__file__))
PROYECTO = "entreno-31153"

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    g = plistlib.load(open(sys.argv[1], "rb"))
    destino = sys.argv[2] if len(sys.argv) > 2 else os.path.join(IOS, "Info.plist")
    if g.get("PROJECT_ID") != PROYECTO:
        sys.exit(f"Este plist es del proyecto «{g.get('PROJECT_ID')}», no de tu Firebase ({PROYECTO}).")
    if g.get("BUNDLE_ID") != "com.atafula.forjado.app":
        print(f"Aviso: el plist es para «{g.get('BUNDLE_ID')}»; la app usa com.atafula.forjado.app (ios/xtool.yml).", file=sys.stderr)
    cliente, invertido = g.get("CLIENT_ID"), g.get("REVERSED_CLIENT_ID")
    if not cliente or not invertido:
        sys.exit("El plist no trae CLIENT_ID: activa Google como proveedor en Firebase → Authentication y vuelve a descargarlo.")
    info = plistlib.load(open(destino, "rb"))
    info["GoogleClientID"] = cliente
    info["CFBundleURLTypes"] = [{"CFBundleURLName": "google", "CFBundleURLSchemes": [invertido]}]
    plistlib.dump(info, open(destino, "wb"))
    print(f"Listo: inicio de sesión con Google configurado ({cliente}).")

if __name__ == "__main__":
    main()
