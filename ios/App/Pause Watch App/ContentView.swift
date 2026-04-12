import SwiftUI

struct ContentView: View {
    @State private var selectedTechnique: Technique?
    @State private var showSummary = false
    @State private var sessionSummary: SessionSummary?
    @StateObject private var connectivityManager = WatchConnectivityManager()

    private var techniques: [Technique] {
        connectivityManager.syncedTechniques.isEmpty
            ? Technique.defaults
            : connectivityManager.syncedTechniques
    }

    var body: some View {
        NavigationStack {
            if let summary = sessionSummary, showSummary {
                SessionSummaryView(summary: summary) {
                    showSummary = false
                    sessionSummary = nil
                }
            } else if let technique = selectedTechnique {
                BreathingView(technique: technique) { summary in
                    selectedTechnique = nil
                    if let summary = summary {
                        sessionSummary = summary
                        showSummary = true
                    }
                }
            } else {
                TechniqueListView(techniques: techniques) { technique in
                    selectedTechnique = technique
                }
            }
        }
    }
}
