import UIKit
import WebKit

final class WebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private static let fondo = UIColor(red: 14 / 255, green: 11 / 255, blue: 20 / 255, alpha: 1)   // --bg

    private var webView: WKWebView!
    private var puente: Puente!
    private let servidor = ServidorLocal()
    private var usaReserva = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = WebViewController.fondo

        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(Archivos(), forURLScheme: Archivos.esquema)
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        puente = Puente(pantalla: self)
        config.userContentController.add(puente, name: "forjado")
        if let url = Bundle.module.url(forResource: "puente", withExtension: "js"), let codigo = try? String(contentsOf: url, encoding: .utf8) {
            config.userContentController.addUserScript(WKUserScript(source: codigo, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }

        webView = WKWebView(frame: view.bounds, configuration: config)
        puente.webView = webView
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        // Sin destello blanco al abrir, y a pantalla completa: los márgenes los pone la web con env(safe-area-inset-*)
        webView.isOpaque = false
        webView.backgroundColor = WebViewController.fondo
        webView.scrollView.backgroundColor = WebViewController.fondo
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.allowsLinkPreview = false
        webView.allowsBackForwardNavigationGestures = false
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true }   // depurable desde Safari en el Mac
        #endif
        view.addSubview(webView)

        cargar()
        // iOS puede cerrar el servidor mientras la app está en segundo plano: al volver, se arranca otra vez
        NotificationCenter.default.addObserver(self, selector: #selector(volverAPrimerPlano), name: UIApplication.willEnterForegroundNotification, object: nil)
    }

    /// La app se sirve en http://localhost (lo que Firebase necesita); si el servidor no arranca, desde forjado:// sin sincronizar
    private func cargar() {
        servidor.arrancar { [weak self] ok in
            guard let self = self else { return }
            self.usaReserva = !ok
            self.webView.load(URLRequest(url: ok ? ServidorLocal.inicio : Archivos.inicioReserva))
        }
    }

    @objc private func volverAPrimerPlano() {
        guard !servidor.enMarcha else { return }
        servidor.arrancar { [weak self] ok in
            // si veníamos de la reserva y ahora sí arranca, se pasa a localhost
            if ok, let self = self, self.usaReserva { self.usaReserva = false; self.webView.load(URLRequest(url: ServidorLocal.inicio)) }
        }
    }

    // Los enlaces de fuera se abren en Safari; dentro de la app solo vive la app
    func webView(_ webView: WKWebView, decidePolicyFor accion: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = accion.request.url else { return decisionHandler(.cancel) }
        let esPrincipal = accion.targetFrame?.isMainFrame ?? true
        let esLocal = (url.scheme == "http" && url.host == "localhost" && url.port == Int(ServidorLocal.puerto))
        if esLocal || url.scheme == Archivos.esquema || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" || !esPrincipal {
            return decisionHandler(.allow)
        }
        if url.scheme == "http" || url.scheme == "https" || url.scheme == "mailto" { UIApplication.shared.open(url) }
        decisionHandler(.cancel)
    }

    // window.open(): también a Safari
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for accion: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = accion.request.url, url.scheme == "http" || url.scheme == "https" { UIApplication.shared.open(url) }
        return nil
    }

    // Si iOS mata el proceso de la web por memoria, se recarga en vez de quedarse en blanco
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        cargar()
    }

    // alert() y confirm() de la web, por si se usan
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage mensaje: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alerta = UIAlertController(title: nil, message: mensaje, preferredStyle: .alert)
        alerta.addAction(UIAlertAction(title: "Vale", style: .default) { _ in completionHandler() })
        present(alerta, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage mensaje: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alerta = UIAlertController(title: nil, message: mensaje, preferredStyle: .alert)
        alerta.addAction(UIAlertAction(title: "Cancelar", style: .cancel) { _ in completionHandler(false) })
        alerta.addAction(UIAlertAction(title: "Aceptar", style: .default) { _ in completionHandler(true) })
        present(alerta, animated: true)
    }
}
