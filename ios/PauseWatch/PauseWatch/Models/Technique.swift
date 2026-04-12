import Foundation

struct BreathingPhase: Codable, Identifiable {
    var id: String { label }
    let label: String   // "inhale", "hold", "exhale"
    let duration: Int   // seconds
}

struct Technique: Identifiable, Codable {
    let id: String
    let name: String
    let category: String
    let phases: [BreathingPhase]
    let science: String

    var totalDuration: Int {
        phases.reduce(0) { $0 + $1.duration }
    }

    static let defaults: [Technique] = [
        Technique(
            id: "box",
            name: "Box Breathing",
            category: "Calm",
            phases: [
                BreathingPhase(label: "inhale", duration: 4),
                BreathingPhase(label: "hold", duration: 4),
                BreathingPhase(label: "exhale", duration: 4),
                BreathingPhase(label: "hold", duration: 4)
            ],
            science: "Used by Navy SEALs to control stress under pressure."
        ),
        Technique(
            id: "478",
            name: "4-7-8 Relaxing",
            category: "Sleep",
            phases: [
                BreathingPhase(label: "inhale", duration: 4),
                BreathingPhase(label: "hold", duration: 7),
                BreathingPhase(label: "exhale", duration: 8)
            ],
            science: "Developed by Dr. Andrew Weil to promote natural sleep."
        ),
        Technique(
            id: "calm",
            name: "Calm Breathing",
            category: "Calm",
            phases: [
                BreathingPhase(label: "inhale", duration: 4),
                BreathingPhase(label: "exhale", duration: 6)
            ],
            science: "Extended exhale activates the parasympathetic nervous system."
        ),
        Technique(
            id: "energize",
            name: "Energize",
            category: "Energy",
            phases: [
                BreathingPhase(label: "inhale", duration: 2),
                BreathingPhase(label: "hold", duration: 2),
                BreathingPhase(label: "exhale", duration: 2),
                BreathingPhase(label: "hold", duration: 2)
            ],
            science: "Quick cycles increase alertness through controlled hyperventilation."
        ),
        Technique(
            id: "focus",
            name: "Focus Breathing",
            category: "Focus",
            phases: [
                BreathingPhase(label: "inhale", duration: 5),
                BreathingPhase(label: "hold", duration: 5),
                BreathingPhase(label: "exhale", duration: 5),
                BreathingPhase(label: "hold", duration: 5)
            ],
            science: "Extended box breathing deepens concentration and mental clarity."
        )
    ]
}
