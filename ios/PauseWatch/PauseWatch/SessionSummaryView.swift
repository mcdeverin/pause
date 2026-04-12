import SwiftUI

struct SessionSummaryView: View {
    let summary: SessionSummary
    let onDismiss: () -> Void

    private var durationText: String {
        let minutes = summary.durationSeconds / 60
        let seconds = summary.durationSeconds % 60
        if minutes > 0 {
            return "\(minutes)m \(seconds)s"
        }
        return "\(seconds)s"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Checkmark
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(Color(red: 74/255, green: 91/255, blue: 140/255))

                Text("session complete")
                    .font(.system(size: 14, weight: .light, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
                    .tracking(2)

                // Stats
                VStack(spacing: 10) {
                    statRow(icon: "timer", label: "Duration", value: durationText)
                    statRow(icon: "wind", label: "Technique", value: summary.techniqueName)

                    if let avg = summary.averageHR {
                        statRow(icon: "heart.fill", label: "Avg HR", value: "\(Int(avg)) bpm")
                    }
                    if let min = summary.minHR {
                        statRow(icon: "heart", label: "Min HR", value: "\(Int(min)) bpm")
                    }
                }
                .padding(.top, 4)

                // Calming message
                if summary.hrDecreased {
                    Text("Your heart rate decreased during the session")
                        .font(.system(size: 11, weight: .light, design: .rounded))
                        .foregroundColor(Color(red: 107/255, green: 168/255, blue: 136/255))
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }

                // Done button
                Button {
                    onDismiss()
                } label: {
                    Text("done")
                        .font(.system(size: 13, weight: .light, design: .rounded))
                        .foregroundColor(.white.opacity(0.6))
                        .tracking(2)
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
            }
            .padding(.horizontal, 12)
        }
        .navigationBarBackButtonHidden(true)
    }

    private func statRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.4))
                .frame(width: 16)
            Text(label)
                .font(.system(size: 12, weight: .light, design: .rounded))
                .foregroundColor(.white.opacity(0.5))
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: .regular, design: .rounded))
                .foregroundColor(.white.opacity(0.8))
        }
    }
}
