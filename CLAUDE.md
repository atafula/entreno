# Forjado — reglas del proyecto

- **TDD siempre**: antes de cambiar o añadir una función, escribe el test en `tests/e2e.py`, comprueba que falla (rojo), implementa y vuelve a ejecutarlo hasta que pase (verde). Ejecuta toda la suite antes de cada commit: `python3 tests/e2e.py`.
- Al cambiar archivos de la app, sube el número de caché en `sw.js` (`entreno-vN`) y añade los archivos nuevos a `ASSETS`.
- Nunca reescribas un archivo con `open(f,'w').write(open(f).read()...)`: lo vacía. Lee primero a una variable.
