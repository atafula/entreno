import HealthKit

/// Guarda en Apple Salud cada entreno de fuerza y cada caminata terminada.
/// Solo escribe: Forjado no lee nada de Salud. La primera vez iOS pregunta el permiso.
enum Salud {
    private static let almacen = HKHealthStore()

    static func guardar(caminata: Bool, desde inicio: Date, hasta fin: Date, metros: Double) {
        guard HKHealthStore.isHealthDataAvailable(), fin > inicio else { return }

        var tipos: Set<HKSampleType> = [HKObjectType.workoutType()]
        if caminata, let distancia = HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning) { tipos.insert(distancia) }

        almacen.requestAuthorization(toShare: tipos, read: []) { concedido, _ in
            guard concedido else { return }

            let config = HKWorkoutConfiguration()
            config.activityType = caminata ? .walking : .traditionalStrengthTraining
            config.locationType = caminata ? .outdoor : .indoor

            let constructor = HKWorkoutBuilder(healthStore: almacen, configuration: config, device: .local())
            constructor.beginCollection(withStart: inicio) { _, _ in
                func terminar() {
                    constructor.endCollection(withEnd: fin) { _, _ in
                        constructor.finishWorkout { _, _ in }
                    }
                }
                // La distancia de la caminata va como muestra dentro del entreno
                if caminata, metros > 0, let tipo = HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning) {
                    let muestra = HKQuantitySample(type: tipo, quantity: HKQuantity(unit: .meter(), doubleValue: metros), start: inicio, end: fin)
                    constructor.add([muestra]) { _, _ in terminar() }
                } else {
                    terminar()
                }
            }
        }
    }
}
