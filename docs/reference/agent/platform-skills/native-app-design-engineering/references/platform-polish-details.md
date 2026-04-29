# Platform Polish Details

### Quick Reference Details

| Detail | SwiftUI | Compose |
| :-- | :-- | :-- |
| Concentric radius | Outer = inner + padding | Same via `RoundedCornerShape` nesting |
| Safe-area inset animation | Animate `.safeAreaInset` or padding; keep motion minimal | Animate `WindowInsets`-related paddings carefully |
| SF Symbol rendering | Use correct rendering modes in animations to avoid flicker | Use vector assets with optical alignment |
| Optical alignment | Extra padding for icon side | Adjust padding/margin in modifiers |

### Examples

**SwiftUI - Safe Area \& Corner Radius**

```swift
VStack {
  // content
}
.safeAreaInset(edge: .bottom) {
  ButtonRow()
    .padding()
    .background(.ultraThinMaterial)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    .shadow(radius: 10)
}
.animation(.easeOut(duration: 0.2), value: isVisible)
```

**Compose - Padding \& Clip**

```kotlin
Scaffold(
  bottomBar = {
    AnimatedVisibility(visible = visible) {
      Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 3.dp
      ) {
        Row(Modifier.padding(16.dp)) { ... }
      }
    }
  }
)
```

**Optical Alignment**

- Reduce trailing padding slightly for icons at the end of labels (both platforms) to center the visual mass.[^6]
- Adjust icon vector viewBox if necessary to avoid per-use padding hacks.
