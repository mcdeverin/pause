import Foundation
import Capacitor

@objc(TechniqueSyncPlugin)
public class TechniqueSyncPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TechniqueSyncPlugin"
    public let jsName = "TechniqueSync"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "syncToWatch", returnType: CAPPluginReturnPromise)
    ]

    @objc func syncToWatch(_ call: CAPPluginCall) {
        guard let techniquesArray = call.getArray("techniques") as? [[String: Any]] else {
            call.resolve()
            return
        }

        do {
            let data = try JSONSerialization.data(withJSONObject: techniquesArray)
            WatchSessionManager.shared.syncTechniques(data)
            call.resolve()
        } catch {
            call.resolve()
        }
    }
}
