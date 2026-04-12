import Foundation
import WatchConnectivity

class WatchSessionManager: NSObject, WCSessionDelegate {
    static let shared = WatchSessionManager()

    private override init() {
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func syncTechniques(_ techniquesData: Data) {
        guard WCSession.default.activationState == .activated else { return }

        do {
            try WCSession.default.updateApplicationContext(["techniques": techniquesData])
        } catch {
            // Failed to send to watch
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        // Session activated
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        // Required for iOS
    }

    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
}
