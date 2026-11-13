// swift-tools-version: 5.9
import PackageDescription

// Forjado para iOS. Se compila con xtool (https://xtool.sh): `xtool dev` dentro de esta carpeta.
let package = Package(
    name: "Forjado",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "Forjado", targets: ["Forjado"]),
    ],
    targets: [
        .target(
            name: "Forjado",
            resources: [
                .copy("web"),        // la app tal cual (copia de la raíz del repo: python3 ios/sync_web.py)
                .copy("puente.js"),  // une la web con lo nativo: vibración, GPS, pantalla encendida, compartir
            ]
        ),
    ]
)
