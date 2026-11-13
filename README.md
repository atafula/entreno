# Forjado (PWA)

App web instalable en iPhone para registrar entrenos, rutinas y caminatas. Estilo "papel": tipografía Fraunces y Manrope, esquinas redondeadas y un solo tema, oscuro violeta con acento morado. Racha semanal, cifras de la semana, siguiente rutina sugerida, calendario de días entrenados y frases sin piedad.

## Instalar en el iPhone

1. Publica el repo con GitHub Pages (Settings → Pages → rama `main`, carpeta raíz).
2. Abre la URL en **Safari**.
3. Compartir → **Añadir a pantalla de inicio**.

## Notas

- Tema: solo oscuro (no hay selector).
- Rutinas: «Te toca» destaca la que más tiempo lleva sin hacerse; el resto se empiezan con ▶. Editar, Duplicar y Borrar van en el menú ⋯ de cada tarjeta.
- Los datos se guardan en el propio iPhone (localStorage). Si borras los datos de Safari, se pierden.
- El GPS solo cuenta con la app abierta: iOS no permite ubicación en segundo plano a las webs.
- Al cambiar archivos, sube la versión de `CACHE` en `sw.js` para forzar la actualización.

## Dónde se guardan los datos

Los datos viven primero en el móvil (`localStorage`, clave `entreno-v1`) y, si inicias sesión con Google, se copian a Firestore y se sincronizan entre dispositivos. Es el mismo sistema que la app de finanzas.

- Las rutinas **nunca se borran solas al abrir**: antes una migración eliminaba los ejercicios sin `ejId` (los escritos a mano y los de rutinas antiguas) en cada arranque. Ya no existe.
- Si el móvil no deja guardar (espacio lleno, modo privado), se avisa con «No se pudo guardar en el móvil» y no se confirma nada falso.
- Si los datos locales quedan ilegibles, la app arranca igualmente y guarda una copia en `entreno-v1-corrupto` para poder recuperarlos.
- Se pide al navegador almacenamiento persistente (`navigator.storage.persist()`) para que no los borre al liberar espacio.
- Sin sesión, los datos solo están en ese móvil: inicia sesión en Ajustes → Cuenta para tener copia en la nube.

## Sin conexión

La app funciona sin wifi ni datos. El service worker (`sw.js`) guarda el código, las fuentes, el catálogo de ejercicios y las traducciones al instalarse, y sirve siempre primero la copia guardada (la actualiza en segundo plano), así que abre al instante aunque la cobertura sea mala. Los datos del usuario viven en el dispositivo.

- Los cambios llegan al instalarse la nueva versión: tras subir `CACHE`, hay que abrir la app **dos veces**.
- Las librerías de Firebase se guardan si se puede; si fallan, no impiden instalar (la sincronización solo funciona con conexión).
- Las fotos de los ejercicios (de un servidor externo) se guardan al verlas por primera vez, hasta 250, en una caché aparte que no se borra al subir de versión. Para poder guardarlas se piden con CORS; si el servidor no lo permite, se muestran igual pero no quedan disponibles sin red.
- Fuentes autoalojadas: Fraunces y Manrope (licencia SIL OFL 1.1, ver `fonts/`).
- Iconos en `icons/`: una «F» clara inclinada con una línea morada debajo, sobre el fondo casi negro de la app (`--bg`). Fuente en `icons/icon.svg`; los PNG se generan con `rsvg-convert` (el «maskable» con el dibujo al 85 %).

## Funciones

- Rutinas con ejercicios, series de calentamiento (cuentan en volumen y series, no en récords) y descansos por ejercicio.
- Entreno en vivo: duración, volumen y series; arrastrar una serie hacia un lado para borrarla; avisos de récord.
- Al terminar con series hechas se pregunta si guardar o descartar; después, animación y resumen del entreno.
- Historial con edición y borrado, gráficas de progreso y calendario de días entrenados.
- Caminatas con objetivo en minutos.

## Licencia

[PolyForm Noncommercial 1.0.0](LICENSE): uso libre para fines no comerciales. Fuentes bajo SIL OFL 1.1 (ver `fonts/`).

## Diseño

Todo sale de los tokens de `:root` en `styles.css`: espaciado en escala de 4 px (`--s1`…`--s10`), radios (`--r-*`), texto (`--t-*`, en rem), sombras (`--shadow-*`), color y movimiento (`--d-*`, `--ease-*`). No añadas colores ni medidas sueltas fuera de ese bloque: hay tests que lo comprueban, junto con el contraste AA en los dos temas, las áreas táctiles de 44 px y `prefers-reduced-motion`. Las animaciones tocan `transform` y `opacity`; la única excepción es el colapso de las series, que anima la altura con `grid-template-rows`.

## Tests

`python3 tests/e2e.py` (Playwright + Chrome) lanza un servidor local y prueba rutinas, entreno en vivo, descanso, borrado e historial.

## Cuenta y nube

Igual que la app de finanzas: inicio de sesión con Google y Firestore (proyecto `entreno-31153`). Si faltan las claves en `sync.js` la app funciona solo en local. Las reglas están en `firestore.rules`.

## App de iOS (carpeta `ios/`)

La misma app, empaquetada como app nativa en Swift para compilarla con [xtool](https://xtool.sh) (sin proyecto de Xcode). La web va dentro, en `ios/Sources/Forjado/web`, y se ve idéntica; Swift añade lo que Safari no deja hacer a una web:

- **Vibración** real (háptica) en los mismos sitios donde la web llama a `vibrate()`.
- **GPS con la pantalla apagada** en las caminatas (CoreLocation en segundo plano).
- **Pantalla encendida** durante el entreno y las caminatas.
- **Descargar copia / CSV** abre la hoja de compartir de iOS (Guardar en Archivos, AirDrop…).

Compilar e instalar en el iPhone conectado:

```
python3 ios/sync_web.py   # copia la web actual dentro de la app (hazlo tras cada cambio en la web)
cd ios && xtool dev
```

- `puente.js` sustituye `navigator.vibrate`, `navigator.geolocation`, `navigator.wakeLock` y `downloadFile` por mensajes a Swift (`Puente.swift`). La web no cambia: fuera de la app el puente no se carga.
- Los archivos se sirven en `forjado://app/` (`Archivos.swift`), sin service worker: ya van dentro de la app y funcionan sin conexión.
- Los datos de la app nativa son nuevos (no comparte almacenamiento con la web instalada desde Safari). Para traerlos: en la web, Ajustes → Descargar copia; en la app, Ajustes → Restaurar copia.
- El inicio de sesión con Google para sincronizar no funciona dentro de la app (Google no lo permite en vistas web incrustadas).
- El identificador es `com.atafula.forjado` (`ios/xtool.yml`); el icono, `ios/AppIcon.png`, sale de `icons/icon.svg` a 1024 px sin transparencia.
- Los tests `ios_*` comprueban que la copia de la web está al día y que el puente funciona.
