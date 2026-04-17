Form {
  Toggle(isOn: binding) {
    Label("Notifications", systemImage: "bell")
  }
  TextField(text: username, prompt: Text("Required")) {
    HStack {
      Image(systemName: "envelope")
      Text("Email")
    }
  }
  SecureField(text: password, prompt: Text("Required")) {
    Label("Password", systemImage: "lock")
  }
}
