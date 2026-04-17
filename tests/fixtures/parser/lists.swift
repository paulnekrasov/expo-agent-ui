List {
  Text("Inbox")
  Section(header: Text("Pinned"), footer: Text("2 items")) {
    Text("Starred")
    Toggle("Enabled", isOn: binding)
  }
  ForEach(["A", "B"], id: \.self) { item in
    Text(item)
  }
}
