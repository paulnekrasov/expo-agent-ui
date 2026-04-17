import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack {
      Text("Primary")
        .overlay(alignment: .topTrailing) {
          Image(systemName: "star.fill")
        }
        .fixedSize(horizontal: false, vertical: true)
        .offset(x: 12, y: -4)

      Text("Secondary")
        .overlay(Image(systemName: "heart.fill"), alignment: .bottom)
        .position(x: 120, y: 200)
    }
  }
}
