import AuthenticationServices
import CryptoKit
import Foundation
import UIKit

/// Inicio de sesión con Google hecho por iOS (Google no lo permite dentro de una vista web).
/// Abre la hoja segura de iOS con la página de Google (OAuth con PKCE, el método de Google para apps nativas)
/// y devuelve el id_token y access_token, que la web usa para entrar en Firebase con signInWithCredential.
/// El cliente es el de la app de iOS de tu proyecto de Firebase: ios/configurar_google.py lo pone en Info.plist.
@MainActor
final class GoogleLogin: NSObject, ASWebAuthenticationPresentationContextProviding {
    enum Fallo: LocalizedError {
        case sinConfigurar, cancelado, respuesta(String)
        var errorDescription: String? {
            switch self {
            case .sinConfigurar: return "Falta configurar Google en la app (ios/configurar_google.py)."
            case .cancelado: return "cancelado"
            case .respuesta(let texto): return texto
            }
        }
    }

    private weak var ventana: UIWindow?
    private var sesion: ASWebAuthenticationSession?

    init(ventana: UIWindow?) { self.ventana = ventana }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        ventana ?? ASPresentationAnchor()
    }

    func entrar(_ listo: @escaping (Result<(idToken: String, accessToken: String), Error>) -> Void) {
        guard let cliente = Bundle.main.object(forInfoDictionaryKey: "GoogleClientID") as? String, !cliente.isEmpty else {
            return listo(.failure(Fallo.sinConfigurar))
        }
        // com.googleusercontent.apps.XXX: el cliente al revés, que Google acepta como dirección de vuelta para apps de iOS
        let esquema = cliente.components(separatedBy: ".").reversed().joined(separator: ".")
        let vuelta = "\(esquema):/oauth2redirect"
        let verificador = GoogleLogin.aleatorio()
        let reto = GoogleLogin.base64url(Data(SHA256.hash(data: Data(verificador.utf8))))
        let estado = GoogleLogin.aleatorio()

        var url = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        url.queryItems = [
            URLQueryItem(name: "client_id", value: cliente),
            URLQueryItem(name: "redirect_uri", value: vuelta),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid email profile"),
            URLQueryItem(name: "code_challenge", value: reto),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "state", value: estado),
            URLQueryItem(name: "prompt", value: "select_account"),   // siempre deja elegir cuenta («Cambiar de cuenta»)
        ]

        let sesion = ASWebAuthenticationSession(url: url.url!, callbackURLScheme: esquema) { [weak self] respuesta, error in
            Task { @MainActor in
                self?.sesion = nil
                if let error = error as? ASWebAuthenticationSessionError, error.code == .canceledLogin {
                    return listo(.failure(Fallo.cancelado))
                }
                if let error = error { return listo(.failure(error)) }
                let datos = URLComponents(url: respuesta ?? URL(string: "x:/")!, resolvingAgainstBaseURL: false)?.queryItems ?? []
                let valor = { (n: String) in datos.first { $0.name == n }?.value }
                guard valor("state") == estado, let codigo = valor("code") else {
                    return listo(.failure(Fallo.respuesta(valor("error") ?? "Google no devolvió la sesión.")))
                }
                GoogleLogin.canjear(codigo: codigo, cliente: cliente, vuelta: vuelta, verificador: verificador, listo: listo)
            }
        }
        sesion.presentationContextProvider = self
        sesion.prefersEphemeralWebBrowserSession = false   // recuerda la cuenta de Google de Safari
        self.sesion = sesion
        if !sesion.start() { listo(.failure(Fallo.respuesta("No se pudo abrir el inicio de sesión."))) }
    }

    /// Cambia el código de un solo uso por los tokens
    private static func canjear(codigo: String, cliente: String, vuelta: String, verificador: String,
                                listo: @escaping (Result<(idToken: String, accessToken: String), Error>) -> Void) {
        var peticion = URLRequest(url: URL(string: "https://oauth2.googleapis.com/token")!)
        peticion.httpMethod = "POST"
        peticion.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        var cuerpo = URLComponents()
        cuerpo.queryItems = [
            URLQueryItem(name: "code", value: codigo),
            URLQueryItem(name: "client_id", value: cliente),
            URLQueryItem(name: "redirect_uri", value: vuelta),
            URLQueryItem(name: "grant_type", value: "authorization_code"),
            URLQueryItem(name: "code_verifier", value: verificador),
        ]
        // URLComponents no escapa «+»: en un formulario significaría espacio
        peticion.httpBody = cuerpo.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B").data(using: .utf8)

        URLSession.shared.dataTask(with: peticion) { datos, _, error in
            let resultado: Result<(idToken: String, accessToken: String), Error>
            if let error = error {
                resultado = .failure(Fallo.respuesta(error.localizedDescription))
            } else if let datos = datos,
                      let json = try? JSONSerialization.jsonObject(with: datos) as? [String: Any],
                      let id = json["id_token"] as? String, let acceso = json["access_token"] as? String {
                resultado = .success((id, acceso))
            } else {
                let texto = datos.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }?["error_description"] as? String
                resultado = .failure(Fallo.respuesta(texto ?? "Google no devolvió la sesión."))
            }
            DispatchQueue.main.async { listo(resultado) }
        }.resume()
    }

    private static func aleatorio() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return base64url(Data(bytes))
    }

    private static func base64url(_ datos: Data) -> String {
        datos.base64EncodedString().replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
    }
}
