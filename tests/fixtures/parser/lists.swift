List {
  Text("Inbox")
    .listRowSeparator(.hidden)
    .listRowInsets(EdgeInsets(top: 4, leading: 12, bottom: 6, trailing: 14))
  Section(header: Text("Pinned"), footer: Text("2 items")) {
    Text("Starred")
    Toggle("Enabled", isOn: binding)
  }
  ForEach(["A", "B"], id: \.self) { item in
    Text(item)
  }
}
.listStyle(.insetGrouped)

LazyVGrid(columns: [
  GridItem(.fixed(80), spacing: 12),
  GridItem(.flexible(minimum: 40, maximum: 120)),
  GridItem(.adaptive(minimum: 60, maximum: 140), spacing: 8)
], spacing: 16) {
  Text("A")
  Text("B")
}

LazyHGrid(rows: [
  GridItem(.fixed(44)),
  GridItem(.adaptive(minimum: 60), spacing: 10)
], spacing: 20) {
  Text("C")
}
