NavigationStack {
  NavigationLink {
    Text("Detail")
    Toggle("Enabled", isOn: binding)
  } label: {
    HStack {
      Image(systemName: "star")
      Text("Open")
    }
  }
}
