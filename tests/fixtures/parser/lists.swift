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
