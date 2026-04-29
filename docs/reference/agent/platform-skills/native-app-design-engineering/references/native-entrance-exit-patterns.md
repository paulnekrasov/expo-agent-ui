# Native Entrance Exit Patterns

### Entrance \& Exit Timing

See SKILL.md duration table; apply the same principles with platform conventions.[^10][^27][^30]

### SwiftUI Patterns

**Fade + Rise**

```swift
extension AnyTransition {
  static var fadeAndRise: AnyTransition {
    .asymmetric(
      insertion: .move(edge: .bottom)
        .combined(with: .opacity)
        .combined(with: .scale(scale: 0.98)),
      removal: .move(edge: .top)
        .combined(with: .opacity)
        .combined(with: .scale(scale: 0.98))
    )
  }
}

View()
  .transition(.fadeAndRise)
```

**Modal / Sheet**

Follow platform: slide up from bottom, dim background, slight scale.

```swift
ZStack {
  if isPresented {
    Color.black.opacity(0.35)
      .ignoresSafeArea()
      .transition(.opacity)

    modalContent
      .transition(.move(edge: .bottom).combined(with: .opacity))
  }
}
.animation(.easeOut(duration: 0.25), value: isPresented)
```


### Compose Patterns

**AnimatedVisibility for modals/toasts**

```kotlin
AnimatedVisibility(
    visible = visible,
    enter = fadeIn() + slideInVertically(initialOffsetY = { it / 8 }),
    exit = fadeOut() + slideOutVertically(targetOffsetY = { -it / 8 })
) {
    ToastContent()
}
```

**Bottom sheet feel**

Use Material `ModalBottomSheet` or build custom `slideInVertically`/`slideOutVertically` with easing aligned to M3 tokens.[^35][^30]

### Lists Add/Remove

**SwiftUI**

```swift
ForEach(items) { item in
  Text(item.title)
    .transition(.asymmetric(
      insertion: .move(edge: .top).combined(with: .opacity),
      removal: .move(edge: .bottom).combined(with: .opacity)
    ))
}
.animation(.spring(response: 0.25, dampingFraction: 0.9), value: items)
```

**Compose**

```kotlin
LazyColumn {
  items(
    items = items,
    key = { it.id }
  ) { item ->
    AnimatedVisibility(
      visible = true, // control via state
      enter = fadeIn() + expandVertically(),
      exit = fadeOut() + shrinkVertically()
    ) {
      ListItemRow(item)
    }
  }
}
```


### Common Mistakes \& Fixes

- **Mistake**: Pure fade with no direction; feels like abrupt disappearance.[^10]
**Fix**: Combine alpha with a small translation (+/-8-12dp) in a logical direction.
- **Mistake**: Long, theatrical exits while user is waiting for next screen.
**Fix**: Make exits noticeably faster; reserve long motion for rare, celebratory transitions.
- **Mistake**: List items pushing others around visually during insert/remove.
**Fix**: Sequence: fade/scale, then collapse/expand; or use built-in list animation capabilities where available.
