import CoreLocation
import HealthKit
import UIKit
import WebKit

/// Recibe los mensajes de puente.js y hace lo que una web no puede: vibrar, GPS con la pantalla apagada,
/// mantener la pantalla encendida y compartir archivos.
@MainActor
final class Puente: NSObject, WKScriptMessageHandler, CLLocationManagerDelegate {
    weak var webView: WKWebView?
    private weak var pantalla: UIViewController?

    private let gps = CLLocationManager()
    private var gpsEncendido = false

    init(pantalla: UIViewController) {
        self.pantalla = pantalla
        super.init()
        gps.delegate = self
        gps.desiredAccuracy = kCLLocationAccuracyBest
        gps.activityType = .fitness
        gps.pausesLocationUpdatesAutomatically = false
    }

    func userContentController(_ controlador: WKUserContentController, didReceive mensaje: WKScriptMessage) {
        guard let m = mensaje.body as? [String: Any], let tipo = m["t"] as? String else { return }
        switch tipo {
        case "vibrar":
            vibrar((m["p"] as? [NSNumber])?.map { $0.doubleValue } ?? [])
        case "gps":
            if m["on"] as? Bool ?? false { encenderGps() } else { apagarGps() }
        case "pantalla":
            UIApplication.shared.isIdleTimerDisabled = m["on"] as? Bool ?? false
        case "salud":
            if let tipo = m["kind"] as? String, let ini = (m["start"] as? NSNumber)?.doubleValue, let fin = (m["end"] as? NSNumber)?.doubleValue {
                Salud.guardar(caminata: tipo == "caminata", desde: Date(timeIntervalSince1970: ini / 1000), hasta: Date(timeIntervalSince1970: fin / 1000), metros: (m["meters"] as? NSNumber)?.doubleValue ?? 0)
            }
        case "google":
            iniciarGoogle()
        case "guardar":
            if let nombre = m["name"] as? String, let texto = m["text"] as? String { compartir(nombre: nombre, texto: texto) }
        default:
            break
        }
    }

    // MARK: Vibración

    /// La web pide milisegundos (o un patrón); en iOS se traduce a la háptica que más se parece
    private func vibrar(_ patron: [Double]) {
        if patron.count > 1 {
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
            return
        }
        let ms = patron.first ?? 10
        let estilo: UIImpactFeedbackGenerator.FeedbackStyle = ms < 10 ? .light : (ms < 25 ? .medium : .heavy)
        UIImpactFeedbackGenerator(style: estilo).impactOccurred()
    }

    // MARK: GPS

    private var puedeEnSegundoPlano: Bool {
        (Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes") as? [String])?.contains("location") ?? false
    }

    private func encenderGps() {
        gpsEncendido = true
        switch gps.authorizationStatus {
        case .notDetermined:
            gps.requestWhenInUseAuthorization()   // al contestar, locationManagerDidChangeAuthorization arranca
        case .denied, .restricted:
            errorGps(1, "Sin permiso de ubicación")
        default:
            arrancarGps()
        }
    }

    private func arrancarGps() {
        if puedeEnSegundoPlano {
            gps.allowsBackgroundLocationUpdates = true        // la caminata sigue contando con la pantalla apagada
            gps.showsBackgroundLocationIndicator = true
        }
        gps.startUpdatingLocation()
    }

    private func apagarGps() {
        gpsEncendido = false
        gps.stopUpdatingLocation()
        if puedeEnSegundoPlano { gps.allowsBackgroundLocationUpdates = false }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard gpsEncendido else { return }
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            arrancarGps()
        case .denied, .restricted:
            errorGps(1, "Sin permiso de ubicación")
        default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations posiciones: [CLLocation]) {
        guard gpsEncendido else { return }
        for p in posiciones where p.horizontalAccuracy >= 0 {
            let ms = Int(p.timestamp.timeIntervalSince1970 * 1000)
            ejecutar("window.__forjadoGps && window.__forjadoGps(\(p.coordinate.latitude), \(p.coordinate.longitude), \(p.horizontalAccuracy), \(ms))")
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if (error as? CLError)?.code == .denied { errorGps(1, "Sin permiso de ubicación") }
        // el resto (sin cobertura un momento) se arregla solo: CoreLocation sigue intentándolo
    }

    private func errorGps(_ codigo: Int, _ texto: String) {
        ejecutar("window.__forjadoGpsError && window.__forjadoGpsError(\(codigo), '\(texto)')")
    }

    private func ejecutar(_ js: String) {
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    // MARK: Google

    private var google: GoogleLogin?

    private func iniciarGoogle() {
        guard google == nil else { return }   // ya hay una hoja abierta
        let login = GoogleLogin(ventana: pantalla?.view.window)
        google = login
        login.entrar { [weak self] resultado in
            guard let self = self else { return }
            self.google = nil
            switch resultado {
            case .success(let tokens):
                self.ejecutar("window.__forjadoGoogle && window.__forjadoGoogle(\(Puente.texto(tokens.idToken)), \(Puente.texto(tokens.accessToken)))")
            case .failure(let error):
                self.ejecutar("window.__forjadoGoogleError && window.__forjadoGoogleError(\(Puente.texto(error.localizedDescription)))")
            }
        }
    }

    /// Un texto de Swift como literal de JavaScript, bien escapado
    private static func texto(_ s: String) -> String {
        guard let datos = try? JSONSerialization.data(withJSONObject: [s]), let json = String(data: datos, encoding: .utf8) else { return "''" }
        return String(json.dropFirst().dropLast())
    }

    // MARK: Compartir (copia de seguridad, CSV)

    private func compartir(nombre: String, texto: String) {
        let limpio = (nombre as NSString).lastPathComponent
        let archivo = FileManager.default.temporaryDirectory.appendingPathComponent(limpio.isEmpty ? "forjado.json" : limpio)
        do {
            try texto.write(to: archivo, atomically: true, encoding: .utf8)
        } catch {
            return
        }
        guard let pantalla = pantalla else { return }
        let hoja = UIActivityViewController(activityItems: [archivo], applicationActivities: nil)
        // En iPad la hoja necesita un punto de anclaje
        hoja.popoverPresentationController?.sourceView = pantalla.view
        hoja.popoverPresentationController?.sourceRect = CGRect(x: pantalla.view.bounds.midX, y: pantalla.view.bounds.midY, width: 1, height: 1)
        pantalla.present(hoja, animated: true)
    }
}
