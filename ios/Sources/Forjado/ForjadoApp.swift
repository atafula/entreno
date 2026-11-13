import SwiftUI

// Forjado para iOS: la app web va dentro (carpeta «web») y se muestra a pantalla completa.
// Lo nativo (vibración, GPS, pantalla encendida, compartir) está en Puente.swift.
@main
struct ForjadoApp: App {
    var body: some Scene {
        WindowGroup {
            Pantalla()
                .ignoresSafeArea()
                .background(Color(red: 14 / 255, green: 11 / 255, blue: 20 / 255).ignoresSafeArea())
                .preferredColorScheme(.dark)
                .statusBarHidden(false)
        }
    }
}

struct Pantalla: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> WebViewController { WebViewController() }
    func updateUIViewController(_ controller: WebViewController, context: Context) {}
}
