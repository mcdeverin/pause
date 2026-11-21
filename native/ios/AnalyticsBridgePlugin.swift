import Foundation
import Capacitor
import FirebaseAnalytics

/// Lets the web app control Google Analytics for Firebase.
///
/// - `setEnabled({ enabled })` follows the app's consent rules (the Europe
///   banner, the onboarding agreement and "Share anonymous usage" in About).
///   Firebase remembers the setting across launches.
/// - `logEvent({ name, params })` records the app's own events
///   (breathing_session_started, paywall_viewed, …).
///
/// Advertising consent is always denied: the app never uses ads features.
/// Requires FIREBASE_ANALYTICS_COLLECTION_ENABLED = NO in Info.plist so nothing
/// is collected before the web app turns it on.
@objc(AnalyticsBridgePlugin)
public class AnalyticsBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AnalyticsBridgePlugin"
    public let jsName = "AnalyticsBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setEnabled", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logEvent", returnType: CAPPluginReturnPromise)
    ]

    @objc func setEnabled(_ call: CAPPluginCall) {
        let enabled = call.getBool("enabled") ?? false
        Analytics.setConsent([
            .analyticsStorage: enabled ? .granted : .denied,
            .adStorage: .denied,
            .adUserData: .denied,
            .adPersonalization: .denied
        ])
        Analytics.setAnalyticsCollectionEnabled(enabled)
        call.resolve()
    }

    @objc func logEvent(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), !name.isEmpty else {
            call.reject("Missing event name")
            return
        }
        var parameters: [String: Any] = [:]
        for (key, value) in call.getObject("params") ?? [:] {
            if let text = value as? String {
                parameters[key] = text
            } else if let number = value as? NSNumber {
                parameters[key] = number
            }
        }
        Analytics.logEvent(name, parameters: parameters.isEmpty ? nil : parameters)
        call.resolve()
    }
}
