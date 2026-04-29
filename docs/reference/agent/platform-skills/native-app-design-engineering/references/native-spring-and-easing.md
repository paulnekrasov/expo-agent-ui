# Native Spring And Easing

### Quick Reference: Native Springs \& Easing

| Scenario | SwiftUI | Compose | Notes |
| :-- | :-- | :-- | :-- |
| Tap feedback / micro-press | `.spring(response: 0.18, dampingFraction: 0.8)` | `spring(dampingRatio = 0.8f, stiffness = Spring.StiffnessHigh)` | Fast, minimal overshoot.[^9][^15][^35] |
| Toggle / chip | `.spring(response: 0.25, dampingFraction: 0.8)` | `spring(dampingRatio = 0.85f, stiffness = Spring.StiffnessMedium)` | Slightly slower than taps.[^9][^35] |
| Modal/sheet enter | `.easeOut(duration: 0.22)` or `.spring(response: 0.3, dampingFraction: 0.9)` | `tween(220, easing = FastOutSlowInEasing)` | Keep under ~250ms.[^10][^30][^27] |
| List item add/remove | `.spring(response: 0.25, dampingFraction: 0.9)` + `opacity` | `tween(200, FastOutSlowInEasing)` + `AnimatedVisibility` | Directional move + alpha.[^10][^38] |
| Success pop | `.spring(duration: 0.5, bounce: 0.25)` | `spring(dampingRatio = 0.6f, stiffness = Spring.StiffnessLow)` | Overshoot allowed; use sparingly.[^7][^8] |
| Spinner / loading | `.linear(duration: 0.6).repeatForever(false)` | `infiniteRepeatable(tween(600, LinearEasing))` | Linear is OK for constant motion.[^9][^30][^32] |

### Easing Equivalents

- **Standard UI enter/exit**
    - SwiftUI: `.easeOut`
    - Compose: `FastOutSlowInEasing` / Material standard easing.[^35][^30]
- **On-screen movement**
    - SwiftUI: `.easeInOut`
    - Compose: `FastOutLinearInEasing` (enter) + `LinearOutSlowInEasing` (exit) or combined `FastOutSlowInEasing` depending on spec.[^54][^35]
- **Delightful bounce**
    - SwiftUI: `.spring(duration: 0.45, bounce: 0.2)` or `.bouncy` with small extraBounce.[^15][^14]
    - Compose: `spring(dampingRatio = 0.6f, stiffness = Spring.StiffnessLow)`


### Patterns

**SwiftUI - Tapping into spring presets**

```swift
// Standard UI movement
withAnimation(.spring(response: 0.3, dampingFraction: 0.9)) {
  isOn.toggle()
}

// Delightful pop
withAnimation(.spring(duration: 0.45, bounce: 0.25)) {
  isLiked.toggle()
}
```

**Compose - Selecting specs**

```kotlin
// Standard
val offset by animateDpAsState(
  targetValue = if (expanded) 32.dp else 0.dp,
  animationSpec = spring(
    dampingRatio = 0.85f,
    stiffness = Spring.StiffnessMedium
  )
)

// Delight
val scale by animateFloatAsState(
  targetValue = if (liked) 1.1f else 1f,
  animationSpec = spring(
    dampingRatio = 0.6f,
    stiffness = Spring.StiffnessLow
  )
)
```


### Common Mistakes \& Corrections

- **Mistake**: Using `.linear` for card transitions or modals.
**Fix**: Use `.easeOut` / `FastOutSlowInEasing` or spring; reserve linear for purely temporal indicators.[^8][^54][^2][^27]
- **Mistake**: Overly bouncy springs for critical flows (auth, payments).
**Fix**: Increase dampingFraction above 0.85 / use `DampingRatioNoBouncy` in Compose.[^7][^8][^35]
- **Mistake**: Tweens used for gestures requiring interruption.
**Fix**: Use spring-based `Animatable` in Compose and spring-based `withAnimation` / `DragGesture` combos in SwiftUI.[^5][^34][^13]
