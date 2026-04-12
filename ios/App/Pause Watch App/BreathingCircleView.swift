import SwiftUI

struct BreathingCircleView: View {
    let scale: Double
    let phaseLabel: String

    private let baseSize: CGFloat = 90

    var body: some View {
        ZStack {
            // Outer glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 74/255, green: 91/255, blue: 140/255).opacity(0.3),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: baseSize * 0.4,
                        endRadius: baseSize * 0.9
                    )
                )
                .frame(width: baseSize * 1.6, height: baseSize * 1.6)
                .scaleEffect(scale)

            // Main orb
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 74/255, green: 91/255, blue: 140/255).opacity(0.9),
                            Color(red: 155/255, green: 142/255, blue: 196/255).opacity(0.7)
                        ],
                        center: UnitPoint(x: 0.35, y: 0.35),
                        startRadius: 0,
                        endRadius: baseSize * 0.5
                    )
                )
                .frame(width: baseSize, height: baseSize)
                .scaleEffect(scale)
        }
        .animation(.easeInOut(duration: 0.95), value: scale)
    }
}
