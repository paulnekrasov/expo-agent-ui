VStack(alignment: .leading, spacing: 12) {
  Text("Title")
  HStack(alignment: .bottom, spacing: 6) {
    Image(systemName: "star")
    Spacer(minLength: 10)
    Text("Badge")
  }
  ZStack(alignment: .topLeading) {
    Image("hero")
    Text("Overlay")
  }
  Button(role: .destructive) {
    archiveItem()
  } label: {
    HStack {
      Image(systemName: "tray")
      Text("Archive")
    }
  }
}
