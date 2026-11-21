import UIKit
import Capacitor

/// Registers Always Pause's own native plugins with the Capacitor bridge.
///
/// In Main.storyboard, select the Bridge View Controller and set its Custom
/// Class to `MainViewController` (Module: App).
///
/// If CoreHapticsPlugin is already registered some other way in your project,
/// remove that line so it isn't registered twice.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AnalyticsBridgePlugin())
        bridge?.registerPluginInstance(CoreHapticsPlugin())
    }
}
