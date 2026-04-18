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
.toolbar {
  ToolbarItem(placement: .navigationBarTrailing) {
    Button("Add") {}
  }
  ToolbarItemGroup(placement: .bottomBar) {
    Button("Primary") {}
    Button("Secondary") {}
  }
  Button("Plain") {}
}
.navigationDestination(for: Int.self) { value in
  Text("Value")
}
