import UserNotifications

/// Aviso de fin de descanso como notificación local: el iPhone la lanza a su hora aunque esté bloqueado
/// o la app en segundo plano. La web avisa cada vez que el descanso empieza, cambia o se cancela.
enum Descanso {
    private static let id = "forjado.descanso"

    static func programar(fin: Date?, ejercicio: String) {
        let centro = UNUserNotificationCenter.current()
        centro.removePendingNotificationRequests(withIdentifiers: [id])
        guard let fin = fin, fin.timeIntervalSinceNow > 1 else { return }

        centro.requestAuthorization(options: [.alert, .sound]) { concedido, _ in
            guard concedido else { return }
            let contenido = UNMutableNotificationContent()
            contenido.title = "Descanso terminado"
            contenido.body = ejercicio.isEmpty ? "A por la siguiente serie." : "A por la siguiente serie de \(ejercicio)."
            contenido.sound = .default
            if #available(iOS 15.0, *) { contenido.interruptionLevel = .active }
            let cuando = UNTimeIntervalNotificationTrigger(timeInterval: max(1, fin.timeIntervalSinceNow), repeats: false)
            centro.add(UNNotificationRequest(identifier: id, content: contenido, trigger: cuando))
        }
    }
}
