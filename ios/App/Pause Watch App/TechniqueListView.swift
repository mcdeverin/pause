import SwiftUI

struct TechniqueListView: View {
    let techniques: [Technique]
    let onSelect: (Technique) -> Void

    private var grouped: [String: [Technique]] {
        Dictionary(grouping: techniques, by: { $0.category })
    }

    private var sortedCategories: [String] {
        let order = ["Calm", "Sleep", "Focus", "Energy", "Advanced"]
        return grouped.keys.sorted { a, b in
            let ia = order.firstIndex(of: a) ?? 999
            let ib = order.firstIndex(of: b) ?? 999
            return ia < ib
        }
    }

    var body: some View {
        List {
            ForEach(sortedCategories, id: \.self) { category in
                Section(header: Text(category.uppercased())
                    .font(.system(size: 10, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary)
                ) {
                    ForEach(grouped[category] ?? []) { technique in
                        Button {
                            onSelect(technique)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(technique.name)
                                    .font(.system(size: 14, weight: .light, design: .rounded))
                                    .foregroundColor(.white)

                                Text(technique.phases.map { "\($0.duration)" }.joined(separator: "-"))
                                    .font(.system(size: 11, weight: .light, design: .rounded))
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }
            }
        }
        .navigationTitle("Pause")
    }
}
