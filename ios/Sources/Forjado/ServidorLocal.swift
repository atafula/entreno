import Foundation
import Network

/// Un servidor HTTP mínimo que sirve la app en http://localhost:48723, solo dentro del propio iPhone.
/// Hace falta porque Firebase Auth solo funciona con páginas http/https (con forjado:// da
/// «auth/operation-not-supported-in-this-environment»), y «localhost» ya viene autorizado en Firebase.
/// El puerto es fijo: los datos guardados (localStorage) van ligados a él.
final class ServidorLocal {
    static let puerto: UInt16 = 48723
    static let inicio = URL(string: "http://localhost:\(puerto)/index.html")!

    private var escucha: NWListener?
    private let cola = DispatchQueue(label: "forjado.servidor")

    var enMarcha: Bool { escucha != nil }

    /// Arranca (si no lo está ya) y avisa una sola vez en el hilo principal de si ha podido
    func arrancar(_ listo: @escaping (Bool) -> Void) {
        let avisar = Una(listo)
        cola.async {
            if self.escucha != nil { return avisar(true) }
            let parametros = NWParameters.tcp
            parametros.requiredInterfaceType = .loopback     // nadie de fuera (wifi, datos) puede conectarse
            parametros.allowLocalEndpointReuse = true
            guard let puerto = NWEndpoint.Port(rawValue: ServidorLocal.puerto),
                  let escucha = try? NWListener(using: parametros, on: puerto) else { return avisar(false) }
            escucha.newConnectionHandler = { [weak self] conexion in self?.atender(conexion) }
            escucha.stateUpdateHandler = { [weak self] estado in
                switch estado {
                case .ready:
                    avisar(true)
                case .failed, .cancelled:
                    self?.cola.async { if self?.escucha === escucha { self?.escucha = nil } }   // se rearranca al volver a la app
                    escucha.cancel()
                    avisar(false)
                default:
                    break
                }
            }
            self.escucha = escucha
            escucha.start(queue: self.cola)
        }
    }

    private func atender(_ conexion: NWConnection) {
        conexion.start(queue: cola)
        recibir(conexion, Data())
    }

    /// Lee hasta el final de las cabeceras («\r\n\r\n»); las peticiones de la app son GET sin cuerpo
    private func recibir(_ conexion: NWConnection, _ hasta: Data) {
        conexion.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] datos, _, terminado, error in
            guard let self = self else { return conexion.cancel() }
            var leido = hasta
            if let datos = datos { leido.append(datos) }
            if let fin = leido.range(of: Data("\r\n\r\n".utf8)) {
                self.responder(conexion, String(decoding: leido[..<fin.lowerBound], as: UTF8.self))
            } else if terminado || error != nil || leido.count > 65536 {
                conexion.cancel()
            } else {
                self.recibir(conexion, leido)
            }
        }
    }

    private func responder(_ conexion: NWConnection, _ cabeceras: String) {
        let linea = cabeceras.components(separatedBy: "\r\n").first ?? ""
        let partes = linea.split(separator: " ")
        let metodo = partes.first.map(String.init) ?? "GET"
        let ruta = partes.count > 1 ? String(partes[1]) : "/"

        let archivo = (metodo == "GET" || metodo == "HEAD") ? Archivos.leer(ruta) : nil
        let cuerpo = archivo?.datos ?? Data("No encontrado".utf8)
        let estado = archivo != nil ? "200 OK" : (metodo == "GET" || metodo == "HEAD" ? "404 Not Found" : "405 Method Not Allowed")
        var respuesta = Data(("HTTP/1.1 \(estado)\r\n"
            + "Content-Type: \(archivo?.tipo ?? "text/plain; charset=utf-8")\r\n"
            + "Content-Length: \(cuerpo.count)\r\n"
            + "Cache-Control: no-cache\r\n"
            + "Connection: close\r\n\r\n").utf8)
        if metodo != "HEAD" { respuesta.append(cuerpo) }
        conexion.send(content: respuesta, completion: .contentProcessed { _ in conexion.cancel() })
    }
}

/// Llama a una función solo la primera vez, en el hilo principal
private final class Una {
    private var f: ((Bool) -> Void)?
    private let candado = NSLock()
    init(_ f: @escaping (Bool) -> Void) { self.f = f }
    func callAsFunction(_ ok: Bool) {
        candado.lock(); let g = f; f = nil; candado.unlock()
        if let g = g { DispatchQueue.main.async { g(ok) } }
    }
}
