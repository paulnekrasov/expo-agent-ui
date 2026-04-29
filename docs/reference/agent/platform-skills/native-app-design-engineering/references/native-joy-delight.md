# Native Joy Delight

### Quick Reference

| Element | Duration | Easing / Spec | Notes |
| :-- | :-- | :-- | :-- |
| Success icon pop | 220-320ms | Spring with small bounce | Overshoot then settle.[^7] |
| Bounce settle | 300-450ms | Spring with higher damping | Attach to state completion.[^7] |
| Confetti burst | 700-1100ms | Ease-out / spring-based per-particle | Use Canvas for performance.[^7][^16] |
| Achievement sequence | 450-750ms total | Multiple staged springs/tweens | Build phases.[^7] |

### SwiftUI Patterns

**Success Pop with Haptic**

```swift
struct SuccessIcon: View {
  @Binding var isSuccess: Bool

  var body: some View {
    Image(systemName: "checkmark.circle.fill")
      .scaleEffect(isSuccess ? 1 : 0.8)
      .opacity(isSuccess ? 1 : 0)
      .animation(.spring(duration: 0.4, bounce: 0.25), value: isSuccess)
      .onChange(of: isSuccess) { newValue in
        if newValue { successHaptic() }
      }
  }
}
```

**Confetti with Canvas**

Use `Canvas` and `TimelineView` for particles; each particle has position, velocity, color, and lifetime; drive updates from time instead of Timer.[^16]

### Compose Patterns

**Like Button**

```kotlin
val liked by remember { mutableStateOf(false) }
val scale by animateFloatAsState(
    targetValue = if (liked) 1.2f else 1f,
    animationSpec = spring(dampingRatio = 0.6f, stiffness = Spring.StiffnessLow)
)

Icon(
  imageVector = if (liked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
  contentDescription = null,
  tint = if (liked) Color.Red else LocalContentColor.current,
  modifier = Modifier
    .scale(scale)
    .clickable {
      liked = !liked
      if (liked) haptic.performHapticFeedback(HapticFeedbackType.LongPress)
    }
)
```

**Confetti**

Use `Canvas` with infinite transition animating offsets and alpha for multiple particles, or integrate Lottie for complex vector-based delight.[^7][^30]

### Reduced Motion

Replace confetti bursts with:

- Color change and success icon.
- Small, fast scale + subtle haptic.

Keep emotional payoff through iconography and color, not kinetic energy.[^7][^27][^35]
