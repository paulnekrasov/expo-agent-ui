# Native Disney Principles

Each principle: concept + SwiftUI + Compose.

### 1. Squash \& Stretch

- **Concept**: Deform shapes under force while preserving volume; subtle in professional UI, stronger for delight.[^8][^7]

**SwiftUI**

```swift
struct SquashButton: View {
  @GestureState private var pressed = false

  var body: some View {
    Circle()
      .scaleEffect(x: pressed ? 1.03 : 1, y: pressed ? 0.96 : 1)
      .animation(.spring(response: 0.15, dampingFraction: 0.8), value: pressed)
      .gesture(
        DragGesture(minimumDistance: 0)
          .updating($pressed) { _, state, _ in state = true }
      )
  }
}
```

**Compose**

```kotlin
val pressed by interactionSource.collectIsPressedAsState()
val scaleX by animateFloatAsState(if (pressed) 1.03f else 1f)
val scaleY by animateFloatAsState(if (pressed) 0.96f else 1f)

Box(
  modifier = Modifier
    .graphicsLayer {
      this.scaleX = scaleX
      this.scaleY = scaleY
    }
)
```

Diagnostic: If press feels flat or weightless, add 2-5% squash/stretch for buttons; 10-15% for playful toggles.[^8][^9]

### 2. Anticipation

- **Concept**: Prepare the user for a state change with a tiny counter-movement, lift, focus change, or press state before the main action. Use it for taps, drags, reveals, and destructive confirmations; skip it for keyboard-driven commands and high-frequency shortcuts.
- **SwiftUI**: Use `ButtonStyle`, `GestureState`, or a short `withAnimation` pre-state before triggering the main transition.
- **Compose**: Use `MutableInteractionSource`, `collectIsPressedAsState`, or gesture state to create pre-action scale, elevation, or alpha feedback.
- **Diagnostic**: If an interaction feels abrupt, add a 60-120ms preparatory state before the main movement.

### 3. Staging

- **Concept**: Make one thing the focal point. Dim, freeze, or slow secondary content so the user understands what changed.
- **SwiftUI**: Layer with `ZStack`, transition overlays separately, and avoid animating background elements at the same strength as the primary element.
- **Compose**: Use `AnimatedVisibility`, `AnimatedContent`, scrims, and separate child transitions so the primary element leads.
- **Diagnostic**: If the eye does not know where to look, reduce simultaneous motion and give the primary element the clearest timing or contrast.

### 4. Straight-Ahead vs Pose-To-Pose

- **Concept**: Use straight-ahead motion for physical, gestural, or generative movement; use pose-to-pose for predictable UI state changes.
- **SwiftUI**: Prefer keyframes, `PhaseAnimator`, `TimelineView`, or custom `Animatable` values for generative motion; use standard transitions for normal UI.
- **Compose**: Use `Animatable`, gestures, and coroutine-driven motion for direct manipulation; use `animate*AsState` and `updateTransition` for fixed states.
- **Diagnostic**: If a standard transition feels chaotic, simplify it to two or three clear poses. If a drag feels robotic, switch to spring/velocity-preserving motion.

### 5. Follow-Through And Overlap

- **Concept**: Containers and children should not all stop at exactly the same time. Let the parent land first, then stagger content or allow a small overshoot.
- **SwiftUI**: Stagger child animations with transaction delays or phase values; use modest overshoot in springs.
- **Compose**: Use `updateTransition`, `AnimatedContent`, or staggered specs per child.
- **Diagnostic**: If everything stops together, add a 20-40ms child delay or lower damping on the primary moving element.

### 6. Slow In And Slow Out

- **Concept**: Interactive motion should accelerate and decelerate naturally. Linear motion is reserved for constant-rate indicators.
- **SwiftUI**: Use `.easeOut`, `.easeInOut`, or springs for UI; reserve `.linear` for spinners and progress loops.
- **Compose**: Use Material easing or springs for UI; reserve `LinearEasing` for time-based indicators.
- **Diagnostic**: If motion feels mechanical, check for linear or delayed ease-in curves on feedback.

### 7. Arcs

- **Concept**: Natural movement often follows arcs, especially thrown, dismissed, or hero elements. Small curved paths feel less synthetic than purely straight translation.
- **SwiftUI**: Use `GeometryEffect`, custom `Animatable` paths, `Canvas`, or combined x/y offsets to imply an arc.
- **Compose**: Use paired `Animatable` values, keyframes, or path-derived offsets for thrown/dismissed elements.
- **Diagnostic**: If a dismissed card feels like it slides on rails, add a small perpendicular drift or rotation tied to velocity.

### 8. Secondary Action

- **Concept**: Secondary motion supports the main action without stealing focus: shadows settle, ripples fade, icons shift, counters tick.
- **SwiftUI**: Pair primary scale/position changes with subtle shadow, material, or symbol effects.
- **Compose**: Pair primary transitions with tonal elevation, alpha, ripple alternatives, or icon changes.
- **Diagnostic**: If secondary motion is more noticeable than the state change, reduce duration, distance, opacity, or bounce.

### 9. Timing

- **Concept**: Timing communicates weight, emotion, and priority. Short and quiet for frequent actions; slower and richer for rare milestones.
- **SwiftUI**: Tune `duration`, `response`, and `dampingFraction` by element size and frequency.
- **Compose**: Tune `tween` duration, `dampingRatio`, and `stiffness`; use Material motion tokens where possible.
- **Diagnostic**: If motion feels slow, compare against frequency first; high-frequency actions should approach instant feedback.

### 10. Exaggeration

- **Concept**: Exaggeration clarifies emotion, but the acceptable amount depends on product context. Enterprise flows need tiny exaggeration; celebrations can use more.
- **SwiftUI**: Keep standard UI scale changes around 0.96-1.04; reserve larger bounce for success or delight moments.
- **Compose**: Use no-bounce or medium-stiff springs for serious UI; use lower stiffness or medium bounce only for delight.
- **Diagnostic**: If a professional flow feels childish, lower bounce, reduce scale amplitude, and shorten duration.

### 11. Solid Drawing

- **Concept**: Motion should respect volume, depth, transform origins, and consistent spatial logic.
- **SwiftUI**: Keep consistent anchors, matched geometry IDs, corner radii, and shadow logic across states.
- **Compose**: Keep stable keys, `graphicsLayer` origins, shape radii, and elevation changes coherent.
- **Diagnostic**: If an element feels like it warps or jumps, inspect transform origin, clipping, matched IDs, and layout changes.

### 12. Appeal

- **Concept**: Appeal is cohesive personality: consistent timing, springs, haptics, hierarchy, and platform conventions across the app.
- **SwiftUI**: Align with Apple HIG motion and system-feeling springs unless brand purpose justifies variation.
- **Compose**: Align with Material 3 motion tokens and platform expectations unless product personality requires a measured override.
- **Diagnostic**: If each screen feels designed by a different team, define shared motion presets and haptic rules before adding more animations.
