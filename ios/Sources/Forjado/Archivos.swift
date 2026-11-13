import Foundation
import WebKit

/// Sirve los archivos de la carpeta «web» en forjado://app/…
/// Con un esquema propio (y no file://) la web tiene un origen estable: funcionan fetch() y localStorage, y los datos no se pierden al actualizar la app.
final class Archivos: NSObject, WKURLSchemeHandler {
    static let esquema = "forjado"
    static let inicio = URL(string: "forjado://app/index.html")!

    private let raiz: URL? = Bundle.module.url(forResource: "web", withExtension: nil)

    private static let tipos: [String: String] = [
        "html": "text/html; charset=utf-8", "css": "text/css; charset=utf-8", "js": "text/javascript; charset=utf-8",
        "json": "application/json; charset=utf-8", "png": "image/png", "svg": "image/svg+xml", "jpg": "image/jpeg",
        "woff2": "font/woff2", "webmanifest": "application/manifest+json",
    ]

    func webView(_ webView: WKWebView, start tarea: WKURLSchemeTask) {
        guard let url = tarea.request.url else {
            tarea.didFailWithError(URLError(.badURL))
            return
        }
        var ruta = url.path
        if ruta.isEmpty || ruta == "/" { ruta = "/index.html" }

        var datos: Data?
        if let raiz = raiz {
            let archivo = raiz.appendingPathComponent(String(ruta.dropFirst())).standardizedFileURL
            if archivo.path.hasPrefix(raiz.standardizedFileURL.path) {   // nada de salir de la carpeta con «..»
                datos = try? Data(contentsOf: archivo)
            }
        }

        let cuerpo = datos ?? Data()
        let cabeceras = [
            "Content-Type": Archivos.tipos[(ruta as NSString).pathExtension.lowercased()] ?? "application/octet-stream",
            "Content-Length": String(cuerpo.count),
            "Cache-Control": "no-cache",
        ]
        guard let respuesta = HTTPURLResponse(url: url, statusCode: datos == nil ? 404 : 200, httpVersion: "HTTP/1.1", headerFields: cabeceras) else {
            tarea.didFailWithError(URLError(.unknown))
            return
        }
        tarea.didReceive(respuesta)
        tarea.didReceive(cuerpo)
        tarea.didFinish()
    }

    func webView(_ webView: WKWebView, stop tarea: WKURLSchemeTask) {}
}
