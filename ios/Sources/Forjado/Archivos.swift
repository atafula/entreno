import Foundation
import WebKit

/// Los archivos de la app (carpeta «web» del paquete). Los sirve ServidorLocal en http://localhost
/// y, si ese servidor no pudiera arrancar, este manejador en forjado://app/ (la app funciona, pero sin sincronizar).
final class Archivos: NSObject, WKURLSchemeHandler {
    static let esquema = "forjado"
    static let inicioReserva = URL(string: "forjado://app/index.html")!

    private static let raiz: URL? = Bundle.module.url(forResource: "web", withExtension: nil)

    private static let tipos: [String: String] = [
        "html": "text/html; charset=utf-8", "css": "text/css; charset=utf-8", "js": "text/javascript; charset=utf-8",
        "json": "application/json; charset=utf-8", "png": "image/png", "svg": "image/svg+xml", "jpg": "image/jpeg",
        "woff2": "font/woff2", "webmanifest": "application/manifest+json", "txt": "text/plain; charset=utf-8",
    ]

    /// El contenido y el tipo de un archivo, o nil si no existe. Nunca sale de la carpeta «web» (nada de «..»).
    static func leer(_ ruta: String) -> (datos: Data, tipo: String)? {
        var ruta = ruta
        if let corte = ruta.firstIndex(where: { $0 == "?" || $0 == "#" }) { ruta = String(ruta[..<corte]) }
        ruta = ruta.removingPercentEncoding ?? ruta
        if ruta.isEmpty || ruta == "/" { ruta = "/index.html" }
        guard let raiz = raiz else { return nil }
        let base = raiz.standardizedFileURL.path
        let archivo = raiz.appendingPathComponent(String(ruta.drop(while: { $0 == "/" }))).standardizedFileURL
        guard archivo.path.hasPrefix(base + "/"), let datos = try? Data(contentsOf: archivo) else { return nil }
        return (datos, tipos[archivo.pathExtension.lowercased()] ?? "application/octet-stream")
    }

    func webView(_ webView: WKWebView, start tarea: WKURLSchemeTask) {
        guard let url = tarea.request.url else { return tarea.didFailWithError(URLError(.badURL)) }
        let archivo = Archivos.leer(url.path)
        let cuerpo = archivo?.datos ?? Data()
        let cabeceras = ["Content-Type": archivo?.tipo ?? "text/plain", "Content-Length": String(cuerpo.count), "Cache-Control": "no-cache"]
        guard let respuesta = HTTPURLResponse(url: url, statusCode: archivo == nil ? 404 : 200, httpVersion: "HTTP/1.1", headerFields: cabeceras) else {
            return tarea.didFailWithError(URLError(.unknown))
        }
        tarea.didReceive(respuesta)
        tarea.didReceive(cuerpo)
        tarea.didFinish()
    }

    func webView(_ webView: WKWebView, stop tarea: WKURLSchemeTask) {}
}
