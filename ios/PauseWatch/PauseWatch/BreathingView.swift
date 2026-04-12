import SwiftUI
import WatchKit

struct BreathingView: View {
    let technique: Technique
    let onDone: (SessionSummary?) -> Void

    private let totalCycles = 4

    @State private var phaseIndex = 0
    @State private var secondsLeft: Int
    @State private var orbScale: Double = 1.0
    @State private var progress: Double = 0
    @State private var isActive = false

    @StateObject private var heartRateManager = HeartRateManager()

    // Extended runtime session for background haptics/timer
    @State private var extendedSession: WKExtendedRuntimeSession?

    private var totalSeconds: Int {
        technique.totalDuration * totalCycles
    }

    @State private var cycleCount = 0
    @State private var elapsedSeconds = 0

    // Timer
    @State private var timer: Timer?

    init(technique: Technique, onDone: @escaping (SessionSummary?) -> Void) {
        self.technique = technique
        self.onDone = onDone
        _secondsLeft = State(initialValue: technique.phases.first?.duration ?? 4)
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 8) {
                // Heart rate (top right)
                HStack {
                    Spacer()
                    if let hr = heartRateManager.currentHeartRate {
                        HStack(spacing: 3) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 10))
                                .foregroundColor(.red.opacity(0.8))
                            Text("\(Int(hr))")
                                .font(.system(size: 13, weight: .light, design: .rounded))
                                .foregroundColor(.white.opacity(0.7))
                        }
                    }
                }
                .padding(.horizontal, 8)
                .padding(.top, 4)

                Spacer()

                // Breathing circle
                BreathingCircleView(
                    scale: orbScale,
                    phaseLabel: currentPhaseLabel
                )

                // Phase label
                Text(currentPhaseLabel)
                    .font(.system(size: 14, weight: .light, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
                    .tracking(3)

                // Countdown
                Text("\(secondsLeft)")
                    .font(.system(size: 20, weight: .ultraLight, design: .rounded))
                    .foregroundColor(.white.opacity(0.5))

                Spacer()

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.12))
                            .frame(height: 2)
                        Capsule()
                            .fill(Color(red: 74/255, green: 91/255, blue: 156/255))
                            .frame(width: geo.size.width * progress, height: 2)
                            .animation(.easeOut(duration: 0.8), value: progress)
                    }
                }
                .frame(height: 2)
                .padding(.horizontal, 40)

                // Done button
                Button {
                    endSession(completed: false)
                } label: {
                    Text("done")
                        .font(.system(size: 11, weight: .light, design: .rounded))
                        .foregroundColor(.white.opacity(0.5))
                        .tracking(2)
                }
                .buttonStyle(.plain)
                .padding(.bottom, 4)
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            startSession()
        }
        .onDisappear {
            cleanup()
        }
    }

    private var currentPhaseLabel: String {
        guard phaseIndex < technique.phases.count else { return "" }
        return technique.phases[phaseIndex].label
    }

    // MARK: - Session Lifecycle

    private func startSession() {
        isActive = true

        // Request HR authorization and start monitoring
        heartRateManager.requestAuthorization()
        heartRateManager.startMonitoring()

        // Start extended runtime session for background execution
        let session = WKExtendedRuntimeSession()
        session.start()
        extendedSession = session

        // Initial haptic
        HapticManager.playPhaseTransition()

        // Start timer
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            tick()
        }
    }

    private func tick() {
        guard isActive else { return }

        secondsLeft -= 1
        elapsedSeconds += 1

        // Calculate scale
        let phase = technique.phases[phaseIndex]
        let elapsed = phase.duration - secondsLeft
        let phaseProgress = Double(elapsed) / Double(phase.duration)

        let label = phase.label.lowercased()
        if label.contains("inhale") {
            orbScale = 1.0 + 0.35 * phaseProgress
        } else if label.contains("exhale") {
            orbScale = 1.35 - 0.35 * phaseProgress
        } else if label.contains("hold") {
            // Hold at current scale based on previous phase
            if phaseIndex > 0 {
                let prevLabel = technique.phases[phaseIndex - 1].label.lowercased()
                orbScale = prevLabel.contains("inhale") ? 1.35 : 1.0
            } else {
                orbScale = 1.0
            }
        }

        // Progress
        progress = min(Double(elapsedSeconds) / Double(totalSeconds), 1.0)

        // Haptic tick
        if secondsLeft > 0 {
            HapticManager.playTick(for: phase.label)
        }

        // Phase transition
        if secondsLeft <= 0 {
            let nextPhaseIdx = (phaseIndex + 1) % technique.phases.count

            if nextPhaseIdx == 0 {
                cycleCount += 1
                if cycleCount >= totalCycles {
                    endSession(completed: true)
                    return
                }
            }

            phaseIndex = nextPhaseIdx
            secondsLeft = technique.phases[nextPhaseIdx].duration
            HapticManager.playPhaseTransition()
        }
    }

    private func endSession(completed: Bool) {
        isActive = false
        timer?.invalidate()
        timer = nil

        let hrData = heartRateManager.stopMonitoring()

        if completed {
            HapticManager.playSessionComplete()
        }

        extendedSession?.invalidate()
        extendedSession = nil

        let summary = SessionSummary(
            techniqueName: technique.name,
            durationSeconds: elapsedSeconds,
            averageHR: hrData.avg,
            minHR: hrData.min,
            maxHR: hrData.max,
            hrDecreased: hrData.decreased
        )

        onDone(summary)
    }

    private func cleanup() {
        timer?.invalidate()
        timer = nil
        _ = heartRateManager.stopMonitoring()
        extendedSession?.invalidate()
        extendedSession = nil
    }
}
