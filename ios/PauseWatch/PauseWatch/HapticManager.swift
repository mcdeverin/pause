import WatchKit

struct HapticManager {
    /// Called every 1-second tick during a breathing phase
    static func playTick(for label: String) {
        let device = WKInterfaceDevice.current()
        let l = label.lowercased()

        if l.contains("inhale") {
            device.play(.directionUp)
        } else if l.contains("exhale") {
            device.play(.directionDown)
        } else if l.contains("hold") {
            // Only pulse every other second during hold (subtle)
            device.play(.click)
        }
    }

    /// Strong marker at the start of each new phase
    static func playPhaseTransition() {
        WKInterfaceDevice.current().play(.start)
    }

    /// Session complete
    static func playSessionComplete() {
        WKInterfaceDevice.current().play(.success)
    }
}
