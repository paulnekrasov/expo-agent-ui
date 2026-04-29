## Anti-Pattern Catalogue

### SwiftUI Anti-Patterns

1. **Implicit `.animation()` without `value`**

- **Symptom**: "Everything animates randomly", animations leak across unrelated state changes; deprecation warnings.[^11][^12]
- **Root cause**: Using the old `.animation(_:)` without a `value` parameter attaches a global implicit animation to the view subtree, so any state change re-uses it.[^12][^11]
- **Correction** (Before/After):

```swift
// Bad: Global, unpredictable
.struct ViewA: View {
  @State private var isOn = false
  var body: some View {
    VStack {
      Toggle("On", isOn: $isOn)
      Circle()
        .frame(width: isOn ? 80 : 40, height: isOn ? 80 : 40)
        .animation(.spring(), value: UUID()) // or deprecated .animation(.spring())
    }
  }
}

// Good: Scoped to relevant value
Circle()
  .frame(width: isOn ? 80 : 40, height: isOn ? 80 : 40)
  .animation(.spring(), value: isOn)
```

- **Diagnostic**: Look for `.animation(...)` without `value:` in code review or deprecation warnings; ensure each animation is tied to a specific state.[^11][^12]

2. **Animating derived layout-heavy properties in `body`**

- **Symptom**: Jank when animating view size/position; frequent re-layout of large hierarchies.[^24][^13]
- **Root cause**: Animating properties that force full recomputation of complex bodies instead of using composited transforms or lighter structures.[^24]
- **Correction**:

```swift
// Bad: Layout-heavy: animating frame for large subtree
VStack {
  BigComplexView()
}
.frame(width: isExpanded ? 320 : 200) // re-layouts everything

// Good: Prefer transforms or dedicated subviews
VStack {
  BigComplexView()
}
.scaleEffect(isExpanded ? 1.1 : 1.0)
.animation(.spring(response: 0.4, dampingFraction: 0.8), value: isExpanded)
```

- **Diagnostic**: Profile with Instruments "SwiftUI" and "Time Profiler"; long layout phases when toggling state indicate the need to move animation to transforms or smaller subtrees.[^24][^13]

3. **Overusing `GeometryReader` for animated layouts**

- **Symptom**: Layout oscillations, unexpected jumps, or poor performance when animating geometry-dependent views.[^18][^24]
- **Root cause**: Using `GeometryReader` as a generic layout engine instead of limited measurement, coupled with animations that cause repeated size changes.[^24]
- **Correction**:

```swift
// Bad: GeometryReader driving multiple dependent views
GeometryReader { proxy in
  SomeView()
    .position(x: isExpanded ? proxy.size.width/2 : 40,
              y: proxy.size.height/2)
}

// Good: Use simpler layout + transform
HStack {
  SomeView()
    .offset(x: isExpanded ? 0 : -40)
}
.animation(.spring(response: 0.4, dampingFraction: 0.85), value: isExpanded)
```

- **Diagnostic**: If geometry-based values change during animations causing re-layout loops, replace geometry usage with simpler layout + offset/scale where possible.[^18][^24]

4. **Misconfigured `matchedGeometryEffect`**

- **Symptom**: Shared transitions snap or cross-fade instead of morphing; weird overlaps or missing animation of one side.[^23][^14]
- **Root cause**: Missing consistent `id` or mismatched `Namespace`, or failing to mark a stable source vs destination when needed.[^14][^23]
- **Correction**:

```swift
@Namespace private var cardNamespace

// Bad: Different IDs or namespaces
SmallCard()
  .matchedGeometryEffect(id: "card", in: cardNamespace)

DetailCard()
  .matchedGeometryEffect(id: "detail", in: cardNamespace)

// Good: Same ID & namespace; optionally designate source view
SmallCard()
  .matchedGeometryEffect(id: "card", in: cardNamespace, isSource: !isDetail)

DetailCard()
  .matchedGeometryEffect(id: "card", in: cardNamespace, isSource: isDetail)
```

- **Diagnostic**: Inspect all matched views to ensure identical IDs and same namespace, and that views actually appear mutually exclusively rather than both on screen.[^23][^14][^13]

5. **Using `Timer` for animation instead of `TimelineView` or built-in animations**

- **Symptom**: Stuttering animations, timer drift, excessive CPU.[^24]
- **Root cause**: Driving visual updates via `Timer` + state changes on each tick instead of using SwiftUI's animation engine.[^13][^24]
- **Correction**:

```swift
// Bad: Timer-driven
Timer.publish(every: 1/60, on: .main, in: .common)
  .autoconnect()
  .sink { _ in phase += 0.01 }

// Good: TimelineView or implicit animation
TimelineView(.animation) { context in
  MyAnimatedView(progress: context.date.timeIntervalSinceReferenceDate)
}
```

- **Diagnostic**: Search for `Timer.publish` powering visuals; replace with `TimelineView` or animate properties directly via SwiftUI animations.[^13][^24]

6. **Ignoring accessibility Reduce Motion**

- **Symptom**: Users with Reduce Motion enabled still see large, sweeping animations or parallax; potential nausea or discomfort.[^28][^27]
- **Root cause**: Not using `@Environment(\.accessibilityReduceMotion)` to conditionally alter animation patterns.[^27]
- **Correction**:

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

var body: some View {
  let animation = reduceMotion ? .easeOut(duration: 0.1) : .spring(response: 0.4, dampingFraction: 0.8)
  ContentView()
    .animation(animation, value: state)
}
```

- **Diagnostic**: Run app with Reduce Motion enabled; verify large motions become shorter or replaced with simple fades.[^28][^27]


### Jetpack Compose Anti-Patterns

1. **Storing `AnimationSpec` or transitions inside composable bodies**

- **Symptom**: Animations restart unexpectedly or performance degrades as specs are recreated on every recomposition.[^38][^33]
- **Root cause**: Specs and transitions allocated as new objects each recomposition instead of being `remember`ed.[^38]
- **Correction**:

```kotlin
// Bad: New spec each recomposition
val alpha by animateFloatAsState(
    targetValue = if (visible) 1f else 0f,
    animationSpec = tween(200)
)

// Good: Stable spec
val fadeSpec = remember { tween<Float>(durationMillis = 200) }
val alpha by animateFloatAsState(
    targetValue = if (visible) 1f else 0f,
    animationSpec = fadeSpec
)
```

- **Diagnostic**: Look for `tween()`, `spring()` etc. created inside composables without `remember`; move to `remember` or higher scope.[^33][^38]

2. **Using `LaunchedEffect` with manual delay loops instead of animation APIs**

- **Symptom**: Imperative loops with `while(true)` or repeated delays to animate values; difficult to interrupt and reason about.[^36][^34]
- **Root cause**: Treating Compose like imperative animation where you manually update values over time rather than using state-driven animation APIs.[^33]
- **Correction**:

```kotlin
// Bad: Manual loop
LaunchedEffect(Unit) {
    while (true) {
        offset += 1f
        delay(16)
    }
}

// Good: Infinite transition
val infiniteTransition = rememberInfiniteTransition()
val offset by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
        animation = tween(600, easing = LinearEasing),
        repeatMode = RepeatMode.Restart
    )
)
```

- **Diagnostic**: Search for `while(true)` or repeated `delay` inside `LaunchedEffect` used purely for animation; replace with `animate*AsState`, `Animatable`, or `rememberInfiniteTransition`.[^36][^34][^33]

3. **Placing `animate*AsState` inside conditional layout branches**

- **Symptom**: Runtime errors or "rules of hooks" style issues where animations are re-created inconsistently; strange animations starting from wrong initial values.[^30][^38][^33]
- **Root cause**: Declaring animations only in some branches of `if`/`when` so recomposition changes call order.[^33]
- **Correction**:

```kotlin
// Bad: Inside conditional
if (show) {
    val alpha by animateFloatAsState(targetValue = 1f)
    Box(Modifier.alpha(alpha))
}

// Good: Outside conditional, use states
val targetAlpha = if (show) 1f else 0f
val alpha by animateFloatAsState(targetValue = targetAlpha)
Box(Modifier.alpha(alpha))
```

- **Diagnostic**: Ensure animations are declared in a stable order; if an animation disappears when a branch is skipped, move it up to always run and drive the branch with its animated value.[^30][^38][^33]

4. **Using `updateTransition` where `AnimatedContent` would be clearer**

- **Symptom**: Overly complex `Transition` code for simple content swaps; animation logic hard to read.[^39][^36][^30]
- **Root cause**: Misusing `updateTransition` for content replacement rather than `AnimatedContent`/`Crossfade` which encode common patterns.[^30]
- **Correction**:

```kotlin
// Bad: Manual transition for content swap
val transition = updateTransition(targetState = screen)
val alpha by transition.animateFloat { ... }

// Good: AnimatedContent
AnimatedContent(targetState = screen) { target ->
    when (target) {
        Screen.List -> ListScreen()
        Screen.Detail -> DetailScreen()
    }
}
```

- **Diagnostic**: If code manually animates a small number of properties on content swap, consider replacing with `AnimatedContent` or `Crossfade`.[^39][^30]

5. **Animating layout-heavy changes instead of using `graphicsLayer`**

- **Symptom**: Recomposition and layout cost spike when animating size/position; janky list scroll during animations.[^34][^38]
- **Root cause**: Using layout modifiers (e.g., `padding`, `height`, `fillMaxWidth`) as animation targets when a composited transform would suffice.[^38]
- **Correction**:

```kotlin
// Bad: Layout-based animation
Box(
    Modifier
        .height(if (expanded) 200.dp else 80.dp)
        .animateContentSize()
)

// Good: Transform-based animation for simple emphasis
Box(
    Modifier.graphicsLayer {
        scaleX = if (expanded) 1.05f else 1f
        scaleY = if (expanded) 1.05f else 1f
    }
)
```

- **Diagnostic**: Use Layout Inspector and trace recomposition/layout cost during animation; if many children remeasure, move some effects to `graphicsLayer`.[^34][^38][^33]

6. **Ignoring reduced motion**

- **Symptom**: Large transitional animations persist even when user prefers reduced motion.[^45][^35]
- **Root cause**: No branching of animation specs or alternative patterns based on platform reduce-motion settings or design tokens.[^35]
- **Correction**: Provide alternate `AnimationSpec` or replace with short fades for reduced motion; wire it into a `LocalReduceMotion` or design system flag.
- **Diagnostic**: Build with a simulated low-motion configuration (e.g., design token) and verify major transitions short-circuit to simpler specs.[^45][^35]


### Cross-Platform Anti-Patterns

1. **Animating before initial layout**

- **Symptom**: Elements "jump" or animate from unexpected positions on first appearance.[^10][^30][^13]
- **Root cause**: Triggering animations on view creation without waiting for initial layout/measurement to stabilize.
- **Correction**: Use appearance flags set after first frame (SwiftUI: `task`/`onAppear` with small `DispatchQueue.main.async` delay or use phase/keyframe triggers; Compose: `LaunchedEffect` with remembered state and possibly `SnapshotStateList` gating).
- **Diagnostic**: Check if animations only misbehave on the first render; add an explicit "didAppear" state and animate on subsequent changes.

2. **Re-triggering animations on every recomposition/update**

- **Symptom**: Animation restarts or flickers frequently on minor state changes; feels "twitchy".[^3][^30][^33]
- **Root cause**: Using derived values or ephemeral state as animation triggers instead of stable state changes.
- **Correction**: Tie animations only to meaningful state transitions and ensure triggers (`value:` in SwiftUI, `targetState` in Compose) do not change on every frame or recomposition.
- **Diagnostic**: Log or debug the state used as animation trigger; if it changes too often, refactor.

3. **No interruption handling**

- **Symptom**: User taps toggle or back twice and animation "snaps" or waits for first to finish before responding.[^5][^34][^13]
- **Root cause**: Using fixed-timeline animations (keyframes, timers) for interactive elements; not allowing state to retarget the animation mid-flight.
- **Correction**: Use state-driven animations (springs, `withAnimation`, `Animatable` / `Animatable.animateTo`) that can retarget from current position; treat every user action as state change, not play/stop command.
- **Diagnostic**: Interact rapidly with controls; if controls feel locked or laggy, ensure animations are state-driven and interruptible.

4. **Ignoring reduced motion / accessibility entirely**

- **Symptom**: Complex parallax, zooming, or large transitions cause nausea for sensitive users.[^4][^2][^35][^27][^28]
- **Root cause**: No conditional paths for animation intensity when Reduce Motion is enabled.
- **Correction**: Replace large spatial moves with opacity or small-scale transitions; preserve information via color, icons, and static state changes.
- **Diagnostic**: Test with Reduce Motion on; inspect all major transitions and delight animations.

5. **Using fixed pixel offsets without respecting device density or dynamic type**

- **Symptom**: Animations feel too large or too small on tablets, small phones, or with large text; content clips or looks misaligned.[^6][^10]
- **Root cause**: Hard-coded offsets that don't adapt to layout or content size.
- **Correction**: Derive distances from container size, baseline metrics, or use scale factors rather than absolute pixels; ensure transitions adapt to different screen sizes.
- **Diagnostic**: Run on multiple devices and text sizes; if motion feels inconsistent, replace constants with relative factors.

***
