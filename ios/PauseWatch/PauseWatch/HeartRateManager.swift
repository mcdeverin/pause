import Foundation
import HealthKit

struct SessionSummary {
    let techniqueName: String
    let durationSeconds: Int
    let averageHR: Double?
    let minHR: Double?
    let maxHR: Double?
    let hrDecreased: Bool
}

class HeartRateManager: NSObject, ObservableObject {
    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?
    private var heartRateQuery: HKAnchoredObjectQuery?

    @Published var currentHeartRate: Double?
    @Published var isAuthorized = false

    private var heartRateReadings: [Double] = []
    private let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!

    func requestAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        let readTypes: Set<HKObjectType> = [heartRateType, HKObjectType.workoutType()]
        let writeTypes: Set<HKSampleType> = [HKSampleType.workoutType()]

        healthStore.requestAuthorization(toShare: writeTypes, read: readTypes) { [weak self] success, _ in
            DispatchQueue.main.async {
                self?.isAuthorized = success
            }
        }
    }

    func startMonitoring() {
        heartRateReadings = []
        currentHeartRate = nil
        startWorkoutSession()
        startHeartRateQuery()
    }

    func stopMonitoring() -> (avg: Double?, min: Double?, max: Double?, decreased: Bool) {
        stopHeartRateQuery()
        stopWorkoutSession()

        guard !heartRateReadings.isEmpty else {
            return (nil, nil, nil, false)
        }

        let avg = heartRateReadings.reduce(0, +) / Double(heartRateReadings.count)
        let min = heartRateReadings.min()
        let max = heartRateReadings.max()

        // Check if HR trended down: compare first quarter avg to last quarter avg
        let quarter = heartRateReadings.count / 4
        var decreased = false
        if quarter > 0 {
            let firstQuarterAvg = heartRateReadings.prefix(quarter).reduce(0, +) / Double(quarter)
            let lastQuarterAvg = heartRateReadings.suffix(quarter).reduce(0, +) / Double(quarter)
            decreased = lastQuarterAvg < firstQuarterAvg
        }

        return (avg, min, max, decreased)
    }

    // MARK: - Workout Session (needed for continuous HR)

    private func startWorkoutSession() {
        let config = HKWorkoutConfiguration()
        config.activityType = .mindAndBody
        config.locationType = .unknown

        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: config)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()
            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore, workoutConfiguration: config)

            workoutSession?.startActivity(with: Date())
            workoutBuilder?.beginCollection(withStart: Date()) { _, _ in }
        } catch {
            // Workout session not available — HR will be sampled less frequently
        }
    }

    private func stopWorkoutSession() {
        workoutSession?.end()
        workoutBuilder?.endCollection(withEnd: Date()) { [weak self] _, _ in
            self?.workoutBuilder?.finishWorkout { _, _ in }
        }
        workoutSession = nil
        workoutBuilder = nil
    }

    // MARK: - Heart Rate Query

    private func startHeartRateQuery() {
        let predicate = HKQuery.predicateForSamples(withStart: Date(), end: nil, options: .strictStartDate)

        heartRateQuery = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: predicate,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] _, samples, _, _, _ in
            self?.processHeartRateSamples(samples)
        }

        heartRateQuery?.updateHandler = { [weak self] _, samples, _, _, _ in
            self?.processHeartRateSamples(samples)
        }

        if let query = heartRateQuery {
            healthStore.execute(query)
        }
    }

    private func stopHeartRateQuery() {
        if let query = heartRateQuery {
            healthStore.stop(query)
            heartRateQuery = nil
        }
    }

    private func processHeartRateSamples(_ samples: [HKSample]?) {
        guard let quantitySamples = samples as? [HKQuantitySample] else { return }

        for sample in quantitySamples {
            let bpm = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
            DispatchQueue.main.async { [weak self] in
                self?.currentHeartRate = bpm
                self?.heartRateReadings.append(bpm)
            }
        }
    }
}
