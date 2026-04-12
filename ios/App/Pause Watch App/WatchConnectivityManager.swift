import Foundation
import Combine
import WatchConnectivity

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var syncedTechniques: [Technique] = []

    private let storageKey = "syncedTechniques"

    override init() {
        super.init()
        loadFromStorage()
        activateSession()
    }

    private func activateSession() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        // Session activated
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        guard let data = applicationContext["techniques"] as? Data else { return }
        do {
            let techniques = try JSONDecoder().decode([Technique].self, from: data)
            DispatchQueue.main.async { [weak self] in
                self?.syncedTechniques = techniques
                self?.saveToStorage(data: data)
            }
        } catch {
            // Failed to decode — keep using current techniques
        }
    }

    // MARK: - Persistence

    private func saveToStorage(data: Data) {
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func loadFromStorage() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        do {
            syncedTechniques = try JSONDecoder().decode([Technique].self, from: data)
        } catch {
            // Failed to decode stored data
        }
    }
}
