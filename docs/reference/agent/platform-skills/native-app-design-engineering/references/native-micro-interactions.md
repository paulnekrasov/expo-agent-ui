# Native Micro Interactions

### Timing \& Easing Quick Reference

| Interaction | SwiftUI | Compose | Notes |
| :-- | :-- | :-- | :-- |
| Button press | `.spring(response: 0.15, dampingFraction: 0.8)` | `spring(0.8f, Spring.StiffnessHigh)` | 80-120ms felt.[^9][^15] |
| Toggle switch | `.spring(response: 0.2, dampingFraction: 0.8)` | `spring(0.85f, Spring.StiffnessMedium)` | Slight overshoot allowed.[^9] |
| Checkbox check | `.easeOut(duration: 0.16)` + stroke animation | `tween(160, FastOutSlowInEasing)` | Box fill then check stroke.[^9] |
| Tooltip show/hide | `.easeOut(0.16)` / `.easeIn(0.1)` | `tween(150, FastOutSlowInEasing)` / `tween(100, FastOutLinearInEasing)` | Fast in, faster out.[^10][^3] |
| Badge / count update | `.spring(duration: 0.4, bounce: 0.3)` | `spring(0.6f, Spring.StiffnessLow)` | Elastic but small scale.[^9][^7] |

### Button States

**SwiftUI**

```swift
struct TactileButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .scaleEffect(configuration.isPressed ? 0.97 : 1)
      .shadow(radius: configuration.isPressed ? 2 : 6)
      .animation(.spring(response: 0.18, dampingFraction: 0.8),
                 value: configuration.isPressed)
  }
}
```

**Compose**

```kotlin
@Composable
fun TactileButton(onClick: () -> Unit, content: @Composable RowScope.() -> Unit) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.97f else 1f)

    Button(
        onClick = onClick,
        interactionSource = interactionSource,
        contentPadding = ButtonDefaults.ContentPadding,
        modifier = Modifier.scale(scale)
    ) {
        content()
    }
}
```


### Toggle Switch

**SwiftUI**

```swift
Toggle(isOn: $isOn) {
  Label("Wi-Fi", systemImage: "wifi")
}
.toggleStyle(SwitchToggleStyle(tint: .accentColor))
.animation(.spring(response: 0.22, dampingFraction: 0.8), value: isOn)
```

For custom thumb squash, see `native-disney-principles.md` (Squash \& Stretch).

**Compose**

```kotlin
Switch(
  checked = checked,
  onCheckedChange = onCheckedChange,
  interactionSource = interactionSource,
  modifier = Modifier
    .graphicsLayer {
      val s = if (pressed) 0.96f else 1f
      scaleX = s; scaleY = s
    }
)
```


### Icon State Swap (Copy -> Check)

**SwiftUI**

```swift
struct CopyIcon: View {
  @State private var copied = false

  var body: some View {
    Image(systemName: copied ? "checkmark" : "doc.on.doc")
      .transition(.scale.combined(with: .opacity))
      .animation(.spring(response: 0.22, dampingFraction: 0.85),
                 value: copied)
      .onTapGesture {
        copied = true
        // trigger haptic + reset later
      }
  }
}
```

**Compose**

```kotlin
AnimatedContent(targetState = copied, label = "CopyCheck") { isCopied ->
    val icon = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy
    Icon(
        imageVector = icon,
        contentDescription = null,
        modifier = Modifier.graphicsLayer {
            // subtle scale/alpha change within AnimatedContent
        }
    )
}
```


### Haptics

- For SwiftUI use `SensoryFeedback` or UIKit `UIImpactFeedbackGenerator` for tap/press; trigger at the start of visual feedback for taps, and at the peak of success animations.[^27][^26]
- For Compose, use `LocalHapticFeedback.current.performHapticFeedback(HapticFeedbackType)` aligned with state change; avoid triggering repeatedly during infinite animations.[^30][^38]


### Common Mistakes \& Fixes

- **Mistake**: No micro feedback -> users tap twice.
**Fix**: Always add at least scale or opacity feedback on press plus haptic, especially for critical buttons.[^6][^9][^27]
- **Mistake**: Animations on disabled states.
**Fix**: Disable hover/press animations and reduce opacity only; treat disabled as "silent".[^9]
- **Mistake**: Rapid-fire badge/count animations on every tick.
**Fix**: Only animate when the change is meaningful; batch updates or use a simpler fade for frequent increments.[^9]
