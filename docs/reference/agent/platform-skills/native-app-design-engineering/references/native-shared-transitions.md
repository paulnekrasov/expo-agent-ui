# Native Shared Transitions

### Quick Reference

| Scenario | SwiftUI | Compose |
| :-- | :-- | :-- |
| Card -> detail hero | `matchedGeometryEffect` with shared id/namespace | `SharedTransitionLayout` + `Modifier.sharedElement()` |
| List -> full-screen image | `matchedGeometryEffect` on image \& background | `sharedBounds` for container, `sharedElement` for image |
| Tab/stack transitions | Multiple matched elements across tabs | SharedTransition across NavHost destinations |

### SwiftUI - `matchedGeometryEffect`

**Basics**

```swift
@Namespace private var ns

struct Cards: View {
  @State private var selected: Item?

  var body: some View {
    ZStack {
      listView
      if let item = selected {
        detailView(item)
      }
    }
  }

  private var listView: some View { ... }

  private func card(item: Item) -> some View {
    CardView(item: item)
      .matchedGeometryEffect(id: item.id, in: ns)
      .onTapGesture { selected = item }
  }

  private func detailView(_ item: Item) -> some View {
    CardDetail(item: item)
      .matchedGeometryEffect(id: item.id, in: ns)
      .onTapGesture { selected = nil }
  }
}
```

**Guidelines**

- Keep IDs stable and unique across list/detail.[^23][^13]
- Use `isSource` when necessary to resolve ambiguity.
- Combine with opacity/scale transitions for entering/exiting contextual content.


### Compose - `SharedTransitionLayout`

**Basics**

```kotlin
SharedTransitionLayout {
  if (showList) {
    ListScreen(sharedTransitionScope = this, onItemClick = { ... })
  } else {
    DetailScreen(sharedTransitionScope = this, item = selected)
  }
}
```

In child composables:

```kotlin
@Composable
fun ListCard(item: Item, sharedTransitionScope: SharedTransitionScope) {
  with(sharedTransitionScope) {
    Card(
      modifier = Modifier
        .sharedElement(
          state = rememberSharedContentState(key = "card-${item.id}")
        )
    ) { ... }
  }
}
```

**Guidelines**

- Use `sharedElement()` when visuals stay similar; `sharedBounds()` when container/bounds matter more than content.[^44][^40][^41]
- Ensure both source and destination share the same `SharedTransitionScope` and keys.
- Combine with `AnimatedContent`/`AnimatedVisibility` for secondary elements.


### Common Mistakes \& Fixes

- **Mistake**: Shared transition looks like cross-fade only.
**Fix**: Ensure both elements share the same shared state; add `graphicsLayer` transforms if needed.[^40][^41]
- **Mistake**: Glitches when list reorders or items change during animation.
**Fix**: Keep stable keys; avoid heavy list mutations mid-transition.
