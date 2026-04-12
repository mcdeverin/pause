import Foundation
import CoreHaptics
import Capacitor

@objc(CoreHapticsPlugin)
public class CoreHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CoreHapticsPlugin"
    public let jsName = "CoreHaptics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "playInhaleHaptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playExhaleHaptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playHoldHaptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopHaptic", returnType: CAPPluginReturnPromise)
    ]

    private var engine: CHHapticEngine?
    private var player: CHHapticPatternPlayer?

    private func ensureEngine() -> Bool {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
            return false
        }
        if engine == nil {
            do {
                engine = try CHHapticEngine()
                engine?.isAutoShutdownEnabled = true
                engine?.resetHandler = { [weak self] in
                    do {
                        try self?.engine?.start()
                    } catch {
                        self?.engine = nil
                    }
                }
                engine?.stoppedHandler = { [weak self] reason in
                    self?.engine = nil
                }
                try engine?.start()
            } catch {
                engine = nil
                return false
            }
        } else {
            do {
                try engine?.start()
            } catch {
                engine = nil
                return false
            }
        }
        return true
    }

    private func stopCurrentPlayer() {
        try? player?.stop(atTime: CHHapticTimeImmediate)
        player = nil
    }

    // MARK: - Inhale: intensity ramps 0.1 → 1.0

    @objc func playInhaleHaptic(_ call: CAPPluginCall) {
        guard ensureEngine(), let engine = engine else {
            call.resolve()
            return
        }
        stopCurrentPlayer()

        let durationMs = call.getDouble("durationMs") ?? 4000
        let duration = durationMs / 1000.0

        do {
            let event = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.1),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2)
                ],
                relativeTime: 0,
                duration: duration
            )

            let intensityCurve = CHHapticParameterCurve(
                parameterID: .hapticIntensityControl,
                controlPoints: [
                    CHHapticParameterCurve.ControlPoint(relativeTime: 0, value: 0.1),
                    CHHapticParameterCurve.ControlPoint(relativeTime: duration, value: 1.0)
                ],
                relativeTime: 0
            )

            let sharpnessCurve = CHHapticParameterCurve(
                parameterID: .hapticSharpnessControl,
                controlPoints: [
                    CHHapticParameterCurve.ControlPoint(relativeTime: 0, value: 0.2),
                    CHHapticParameterCurve.ControlPoint(relativeTime: duration, value: 0.6)
                ],
                relativeTime: 0
            )

            let pattern = try CHHapticPattern(
                events: [event],
                parameterCurves: [intensityCurve, sharpnessCurve]
            )

            player = try engine.makePlayer(with: pattern)
            try player?.start(atTime: CHHapticTimeImmediate)
            call.resolve()
        } catch {
            call.resolve()
        }
    }

    // MARK: - Exhale: intensity ramps 1.0 → 0.1

    @objc func playExhaleHaptic(_ call: CAPPluginCall) {
        guard ensureEngine(), let engine = engine else {
            call.resolve()
            return
        }
        stopCurrentPlayer()

        let durationMs = call.getDouble("durationMs") ?? 4000
        let duration = durationMs / 1000.0

        do {
            let event = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.6)
                ],
                relativeTime: 0,
                duration: duration
            )

            let intensityCurve = CHHapticParameterCurve(
                parameterID: .hapticIntensityControl,
                controlPoints: [
                    CHHapticParameterCurve.ControlPoint(relativeTime: 0, value: 1.0),
                    CHHapticParameterCurve.ControlPoint(relativeTime: duration, value: 0.1)
                ],
                relativeTime: 0
            )

            let sharpnessCurve = CHHapticParameterCurve(
                parameterID: .hapticSharpnessControl,
                controlPoints: [
                    CHHapticParameterCurve.ControlPoint(relativeTime: 0, value: 0.6),
                    CHHapticParameterCurve.ControlPoint(relativeTime: duration, value: 0.2)
                ],
                relativeTime: 0
            )

            let pattern = try CHHapticPattern(
                events: [event],
                parameterCurves: [intensityCurve, sharpnessCurve]
            )

            player = try engine.makePlayer(with: pattern)
            try player?.start(atTime: CHHapticTimeImmediate)
            call.resolve()
        } catch {
            call.resolve()
        }
    }

    // MARK: - Hold: subtle repeating pulse

    @objc func playHoldHaptic(_ call: CAPPluginCall) {
        guard ensureEngine(), let engine = engine else {
            call.resolve()
            return
        }
        stopCurrentPlayer()

        let durationMs = call.getDouble("durationMs") ?? 4000
        let duration = durationMs / 1000.0

        do {
            var events: [CHHapticEvent] = []
            var time: Double = 0
            while time < duration {
                let pulseLength = min(0.3, duration - time)
                events.append(CHHapticEvent(
                    eventType: .hapticContinuous,
                    parameters: [
                        CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.25),
                        CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.15)
                    ],
                    relativeTime: time,
                    duration: pulseLength
                ))
                time += 1.0 // 0.3s on, 0.7s off
            }

            let pattern = try CHHapticPattern(events: events, parameterCurves: [])
            player = try engine.makePlayer(with: pattern)
            try player?.start(atTime: CHHapticTimeImmediate)
            call.resolve()
        } catch {
            call.resolve()
        }
    }

    // MARK: - Stop

    @objc func stopHaptic(_ call: CAPPluginCall) {
        stopCurrentPlayer()
        call.resolve()
    }
}
