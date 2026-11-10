# Forjado (PWA)

App web instalable en iPhone para registrar entrenos, rutinas y caminatas. Estilo "papel": tipografía Fraunces y Manrope, esquinas redondeadas y acento naranja. El tema oscuro cálido es el predeterminado y el claro (crema) es la variante. Cuenta atrás del día, calendario de días entrenados y frases sin piedad.

## Instalar en el iPhone

1. Publica el repo con GitHub Pages (Settings → Pages → rama `main`, carpeta raíz).
2. Abre la URL en **Safari**.
3. Compartir → **Añadir a pantalla de inicio**.

## Notas

- Tema: botón de ajustes de la cabecera → Apariencia: Automático, Claro u Oscuro (se guarda en el móvil).
- Los datos se guardan en el propio iPhone (localStorage). Si borras los datos de Safari, se pierden.
- El GPS solo cuenta con la app abierta: iOS no permite ubicación en segundo plano a las webs.
- Al cambiar archivos, sube la versión de `CACHE` en `sw.js` para forzar la actualización.
- Fuentes autoalojadas: Fraunces y Manrope (licencia SIL OFL 1.1, ver `fonts/`).
- Iconos en `icons/`: aro grueso crema con arco naranja y punto oscuro. Fuente en `icons/icon.svg`.

## Funciones

- Rutinas con ejercicios, series de calentamiento (cuentan en volumen y series, no en récords) y descansos por ejercicio.
- Entreno en vivo: duración, volumen y series; arrastrar una serie hacia un lado para borrarla; avisos de récord.
- Al terminar con series hechas se pregunta si guardar o descartar; después, animación y resumen del entreno.
- Historial con edición y borrado, gráficas de progreso y calendario de días entrenados.
- Caminatas con objetivo en minutos.

## Licencia

[PolyForm Noncommercial 1.0.0](LICENSE): uso libre para fines no comerciales. Fuentes bajo SIL OFL 1.1 (ver `fonts/`).

## Diseño

Todo sale de los tokens de `:root` en `styles.css`: espaciado en escala de 4 px (`--s1`…`--s10`), radios (`--r-*`), texto (`--t-*`, en rem), sombras (`--shadow-*`), color y movimiento (`--d-*`, `--ease-*`). No añadas colores ni medidas sueltas fuera de ese bloque: hay tests que lo comprueban, junto con el contraste AA en los dos temas, las áreas táctiles de 44 px y `prefers-reduced-motion`. Las animaciones solo tocan `transform` y `opacity`.

## Tests

`python3 tests/e2e.py` (Playwright + Chrome) lanza un servidor local y prueba rutinas, entreno en vivo, descanso, borrado e historial.

## Cuenta y nube

Igual que la app de finanzas: inicio de sesión con Google y Firestore (proyecto `entreno-31153`). Si faltan las claves en `sync.js` la app funciona solo en local. Las reglas están en `firestore.rules`.
