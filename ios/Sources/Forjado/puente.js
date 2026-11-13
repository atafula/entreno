// Puente entre la web y la app nativa de iOS. Se inyecta antes de que cargue la página.
// Lo que Safari no da a una web (vibración, GPS con la pantalla apagada, compartir archivos) lo hace Swift.
(() => {
  const enviar = m => { try { window.webkit.messageHandlers.forjado.postMessage(m); } catch (e) { /* fuera de la app */ } };
  const poner = (obj, nombre, value) => { try { Object.defineProperty(obj, nombre, { value, configurable: true, writable: true }); } catch (e) { /* nada */ } };

  // Vibración: háptica nativa
  poner(navigator, 'vibrate', p => { enviar({ t: 'vibrar', p: (Array.isArray(p) ? p : [p]).map(Number) }); return true; });

  // GPS: CoreLocation, que sigue contando con la pantalla apagada
  const escuchas = new Map();
  let siguiente = 1;
  const geo = {
    watchPosition(ok, err) {
      const id = siguiente++;
      escuchas.set(id, { ok, err });
      if (escuchas.size === 1) enviar({ t: 'gps', on: true });
      return id;
    },
    clearWatch(id) {
      if (escuchas.delete(id) && !escuchas.size) enviar({ t: 'gps', on: false });
    },
    getCurrentPosition(ok, err) {
      const id = geo.watchPosition(p => { geo.clearWatch(id); ok(p); }, e => { geo.clearWatch(id); if (err) err(e); });
    }
  };
  poner(navigator, 'geolocation', geo);
  window.__forjadoGps = (latitude, longitude, accuracy, timestamp) => {
    const pos = { coords: { latitude, longitude, accuracy, altitude: null, altitudeAccuracy: null, heading: null, speed: null }, timestamp };
    [...escuchas.values()].forEach(e => { try { e.ok(pos); } catch (x) { /* nada */ } });
  };
  window.__forjadoGpsError = (code, message) => {
    [...escuchas.values()].forEach(e => { try { if (e.err) e.err({ code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }); } catch (x) { /* nada */ } });
  };

  // Pantalla encendida durante el entreno y las caminatas
  let bloqueos = 0;
  poner(navigator, 'wakeLock', {
    request: async () => {
      if (++bloqueos === 1) enviar({ t: 'pantalla', on: true });
      let suelto = false;
      return {
        released: false,
        addEventListener() {}, removeEventListener() {},
        release: async () => {
          if (suelto) return;
          suelto = true;
          if (--bloqueos <= 0) { bloqueos = 0; enviar({ t: 'pantalla', on: false }); }
        }
      };
    }
  });

  // Descargar copia / CSV: una web dentro de una app no puede «descargar»; se abre la hoja de compartir de iOS
  document.addEventListener('DOMContentLoaded', () => {
    window.downloadFile = (name, blob) => { blob.text().then(text => enviar({ t: 'guardar', name: String(name), text })); };
  });
})();
