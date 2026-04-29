---
name: native-app-design-engineering
description: Native app design engineering reference for SwiftUI, Jetpack Compose, native-feeling Expo/React Native UI, and mobile interaction polish. Use when working on native mobile design, animations, transitions, micro-interactions, haptics, spring or easing configs, shared element transitions, reduced motion, performance jank, platform polish, or any "this feels off" iOS or Android interface problem. Triggers include SwiftUI animation feels off, Compose transition, native micro-interaction, haptic and visual feedback, matchedGeometryEffect, SharedTransitionLayout, iOS or Android polish, native app motion, reduced motion, and mobile UI performance.
---

# Native App Design Engineering

Design and implement native mobile interfaces that feel natural, fast, alive, and polished on iOS, Android, and native-feeling cross-platform apps. This skill translates the research findings into practical SwiftUI and Jetpack Compose guidance, with references for motion, haptics, transitions, performance, accessibility, and platform polish.

## When To Load References

Load on demand. Do not load every reference upfront; pick the one or two files that match the active task. Footnote markers such as `[^27]` resolve in `references/source-links.md`.


| Task | Load |
| :-- | :-- |
| Choosing easing, duration, and spring config for SwiftUI/Compose | `references/native-spring-and-easing.md` |
| Button states, toggles, checkboxes, icon swaps, form validation, loading micro-interactions (native + haptics) | `references/native-micro-interactions.md` |
| Modals, sheets, toasts, dropdowns, sidebars, list add/remove, navigation transitions | `references/native-entrance-exit-patterns.md` |
| Success states, confetti, like button, achievement unlock, onboarding celebrations (with haptics) | `references/native-joy-delight.md` |
| Choppy animation, frame drops, jank, layout/recomposition thrash, device-specific performance | `references/native-performance-diagnosis.md` |
| Shared element / hero transitions, matchedGeometryEffect, SharedTransitionLayout | `references/native-shared-transitions.md` |
| Diagnosing "something feels off" using Disney vocabulary (native examples) | `references/native-disney-principles.md` |
| Text behavior, concentric radius, safe-area animation, symbol rendering, optical alignment, interruptibility details | `references/platform-polish-details.md` |
| Original timeless vs web-specific extraction map | `references/translation-research-map.md` |
| SwiftUI and Jetpack Compose API inventory | `references/native-platform-api-inventory.md` |
| Practitioner, article, WWDC, Google I/O, and documentation research findings | `references/practitioner-research-findings.md` |
| SwiftUI, Compose, and cross-platform anti-pattern catalogue | `references/native-anti-pattern-catalogue.md` |
| Source footnote links for all research citations | `references/source-links.md` |

## Core Philosophy

> "The best animations are the ones you don't notice" still applies on native.[^1][^5][^27]

**Animations communicate, not decorate.** Before adding motion, ask:

1. Is this solving a communication problem (state change, hierarchy, spatial mapping) or a decoration problem?[^5][^1]
2. How often will the user see this? (100+ times/day -> no animation, or barely perceptible micro feedback).[^9][^1]
3. Does removing it break the interaction or just make it less visually interesting?[^1][^5]

If the answer to 3 is "just less interesting", use restraint - especially on high-frequency interactions like keyboard shortcuts, command palettes, or pull-to-refresh.[^3][^1][^27]

**Nothing in the world disappears instantly.** Even 120-180ms of motion (with a fast start) makes state changes in SwiftUI and Compose feel grounded in physical reality.[^8][^1][^27]

**Springs are the native motion language.** Apple and Google both lean heavily on spring-based motion for direct manipulation, gestures, and system transitions; use springs by default for interactive UI, and tweens for simple, predictable transitions.[^5][^35][^27][^30][^13]

## The Four Easing Questions (native translation)

When deciding how to animate in SwiftUI/Compose, answer these in 10 seconds:

```text
Is the element entering or exiting?            -> ease-out tween or light spring
Is it moving/morphing while on screen?        -> easeInOut tween or critically damped spring
Is it a simple color/opacity change?          -> gentle ease / standard M3 easing
Is it constant motion (spinner, progress)?    -> linear
Default for interactive UI:                   -> easeOut or spring with quick response
```

**Never use pure ease-in for user feedback** - the slow start delays confirmation and makes interactions feel sluggish on both platforms.[^2][^54][^8][^3]

Mapping to APIs:

- **SwiftUI**[^14][^13]
    - Enter/exit: `.easeOut(duration: 0.15...0.25)` or `.spring(response: 0.25, dampingFraction: 0.85)`
    - On-screen reposition: `.easeInOut(duration: 0.20...0.30)` or `.spring(response: 0.3, dampingFraction: 0.8)`
    - Constant motion (spinner): `.linear(duration: 0.6).repeatForever(autoreverses: false)`
- **Compose**[^54][^32][^35][^30]
    - Enter/exit: `tween(180, easing = FastOutSlowInEasing)` or `spring(dampingRatio = 0.9f, stiffness = Spring.StiffnessMedium)`
    - On-screen movement: `tween(250, easing = FastOutSlowInEasing)` or spring with slightly lower damping for softness
    - Constant motion: `infiniteRepeatable(tween(600, easing = LinearEasing))`


## Duration Quick Reference (Native-Calibrated)

Native platforms generally feel comfortable with slightly faster timings than web UIs, especially on 120Hz displays.[^10][^9][^35][^27]


| Element type | Duration (60Hz baseline) | Duration (120Hz high-refresh) |
| :-- | :-- | :-- |
| Tap/press feedback | 80-120ms | 60-90ms |
| Toggle / checkbox / chip | 120-180ms | 90-150ms |
| Tooltip / toast | 140-200ms | 110-170ms |
| Dropdown / menu | 150-220ms | 120-190ms |
| Modal / sheet / drawer | 200-280ms | 170-240ms |
| Page / tab transition | 220-320ms | 190-280ms |
| Success / delight sequence | 350-650ms total | 300-550ms |

**Rules** (carry over from the web skill, tuned for native):[^7][^10][^1]

- Stay under ~280ms for standard UI elements; navigation and page transitions rarely exceed ~320ms on mobile.
- Exits should be 20-30% faster than entrances (users are waiting to act).[^10]
- Larger, heavier-seeming elements animate slightly slower than small chips or icons.[^8]
- Keyboard-initiated actions and repetitive shortcuts: don't animate position at all; at most, apply a very short opacity or color pulse (<80ms).[^3][^1]
- On 120Hz devices, you can reduce durations by ~10-15% while preserving perceived smoothness.


## Spring Quick Reference

### SwiftUI Spring Heuristics

- **`.spring(response:dampingFraction:blendDuration:)`**[^15][^14][^13]
    - `response` approx time to reach the first peak; smaller -> faster.
    - `dampingFraction` controls overshoot and oscillation:
        - `0.5-0.7` - energetic with some bounce.
        - `0.8-0.9` - standard UI, little to no overshoot.
        - `1.0` - critically damped, no visible overshoot (good for professional UI).

Example presets (60Hz baseline):


| Feel | Response | DampingFraction | Use for |
| :-- | :-- | :-- | :-- |
| Snappy | 0.25 | 0.7 | Switch toggles, micro-press feedback |
| Standard | 0.35 | 0.85 | Cards, modals, small position changes |
| Smooth | 0.45 | 0.95 | Content shifts, reflows, hero transitions |
| Playful | 0.4 | 0.6 | Like buttons, celebrations (limited use) |

**`.spring(duration:bounce:)` (iOS 17+)** uses `duration` + `bounce` instead of response/damping; think of:

- `bounce: 0` -> smooth, professional.
- `0.1-0.2` -> subtle overshoot.
- `>0.3` -> visibly bouncy; reserve for delight moments.[^14][^15]


### Compose Spring Heuristics

- `spring(dampingRatio, stiffness)` with named constants:[^32][^35]

| Feel | DampingRatio | Stiffness | Use for |
| :-- | :-- | :-- | :-- |
| No bounce | `Spring.DampingRatioNoBouncy` | `Spring.StiffnessMedium` | Default UI transitions |
| Medium bounce | 0.6f | `Spring.StiffnessLow` | Toggles, chips, subtle overshoot |
| Snappy | 0.7f | `Spring.StiffnessHigh` | Micro-interactions, icon presses |
| Soft | `Spring.DampingRatioMediumBouncy` | `Spring.StiffnessLow` | Delight / celebration (sparingly) |

### When to Choose Spring vs Tween vs Keyframes

- **Use springs when**
    - Interaction is gestural or interruptible (drag, swipe, dismiss).[^5][^34][^13]
    - Element should feel "alive" (Dynamic Island-style, chips that follow your finger).[^5][^27]
    - You need continuity when state changes mid-animation (springs preserve velocity).[^2][^34][^13]
- **Use tweens (easeOut/easeInOut) when**
    - You need a predictable, fixed-duration transition (sheet present/dismiss, simple opacity/transform).[^2][^10][^32][^30]
    - Motion is subtle and primarily informational, not physical.
- **Use keyframes when**
    - Different properties need independent timing (scale then color then blur).[^7][^8][^19][^21]
    - You need snappy, hand-crafted sequences (success pop with overshoot, then settle, then glow).
    - You want to choreograph text/mesh effects at per-slice granularity.[^16]


## Performance Ground Rules (Native Translation)

Conceptual rules from the web skill carry over but map to native pipelines.[^4][^1][^5]

### SwiftUI

- Treat the SwiftUI `body` as a description: avoid heavy per-frame work or `GeometryReader` misuse; let the system drive animation via Animatable values.[^18][^24][^13]
- Prefer animating high-level transform/opacity modifiers instead of constantly changing complex view hierarchies.[^4][^24]
- Use `Canvas` for particle systems or heavy custom drawing so the GPU does most of the work.[^16]
- Profile with Instruments (SwiftUI, Time Profiler, Hitches) on real devices, including ProMotion hardware.[^4][^24]
- Respect `accessibilityReduceMotion` and use simpler transitions on low-end devices or when motion is reduced.[^4][^27]


### Compose

- Keep animation state in stable scopes; avoid recomposing large hierarchies on every animation frame.[^38][^33]
- Prefer `graphicsLayer` transforms and alpha for motion; use `animateContentSize` for size changes instead of manual layout tweaks when possible.[^30][^38]
- Use Layout Inspector and animation tooling to find hotspots and unnecessary recompositions.[^56][^49]
- Suspend or simplify infinite animations for off-screen content and on low-end devices.[^30][^33]


## Instant Wins (Apply Without Reading References)

Each pattern is given for SwiftUI and Compose.

1. **Button press feedback (scale + haptic)**

- **SwiftUI**:

```swift
Button(action: action) {
  label
    .scaleEffect(isPressed ? 0.97 : 1)
}
.buttonStyle(.plain)
.simultaneousGesture(
  DragGesture(minimumDistance: 0)
    .onChanged { _ in impact(.light) } // via SensoryFeedback or UIImpactFeedbackGenerator
)
.animation(.spring(response: 0.15, dampingFraction: 0.8), value: isPressed)
```

- **Compose**:

```kotlin
val interactionSource = remember { MutableInteractionSource() }
val pressed by interactionSource.collectIsPressedAsState()
val scale by animateFloatAsState(if (pressed) 0.97f else 1f)

Box(
  modifier = Modifier
    .scale(scale)
    .clickable(
      interactionSource = interactionSource,
      indication = null,
      onClick = onClick
    )
)
```

2. **Don't animate from "zero" scale**

- **SwiftUI**:

```swift
// Bad: pops from nowhere
.scaleEffect(isVisible ? 1 : 0)

// Good: deflated balloon + opacity
.scaleEffect(isVisible ? 1 : 0.95)
.opacity(isVisible ? 1 : 0)
.animation(.spring(response: 0.25, dampingFraction: 0.85), value: isVisible)
```

- **Compose**:

```kotlin
val targetScale = if (visible) 1f else 0.95f
val targetAlpha = if (visible) 1f else 0f
val scale by animateFloatAsState(targetScale)
val alpha by animateFloatAsState(targetAlpha)

Box(Modifier.graphicsLayer {
    scaleX = scale; scaleY = scale; this.alpha = alpha
})
```

3. **Concentric border radius**

Apply the same formula everywhere you nest content:[^6]

```text
outerRadius = innerRadius + padding
```

- **SwiftUI**:

```swift
RoundedRectangle(cornerRadius: 20)
  .padding(8)
  .overlay(
    RoundedRectangle(cornerRadius: 12) // 20 - 8 = 12
      .strokeBorder(style: StrokeStyle(lineWidth: 1))
  )
```

- **Compose**:

```kotlin
Card(
  shape = RoundedCornerShape(20.dp),
) {
  Box(
    Modifier
      .padding(8.dp)
      .clip(RoundedCornerShape(12.dp))
  ) {
    // inner content
  }
}
```

4. **Haptic + visual choreography**

Always pair meaningful state changes with subtle haptics:

- Success: scale-up + light success haptic.
- Error: shake + error haptic.

Map to SensoryFeedback on iOS and `HapticFeedback` on Android; for details see `native-micro-interactions.md` and `native-joy-delight.md`.[^9][^7][^27][^30]

5. **SF Symbol animation one-liner**

- **SwiftUI**:

```swift
Image(systemName: isLiked ? "heart.fill" : "heart")
  .symbolEffect(.bounce, value: isLiked)
  .foregroundStyle(isLiked ? .red : .primary)
```

6. **Compose ripple replacement pattern**

Use a custom indication or underlying scale/opacity animation instead of default ripple when you want brand-specific motion:

```kotlin
val interactionSource = remember { MutableInteractionSource() }
val pressed by interactionSource.collectIsPressedAsState()
val scale by animateFloatAsState(if (pressed) 0.96f else 1f)

Box(
  modifier = Modifier
    .scale(scale)
    .clickable(
      interactionSource = interactionSource,
      indication = null,
      onClick = onClick
    )
)
```


## "Something Feels Wrong" Diagnostic (Native Edition)

Every symptom from the original table, with native causes and references:


| Symptom | Likely cause (native) | Load |
| :-- | :-- | :-- |
| Mechanical / robotic | Using linear or weak easing; springs overdamped or too long duration.[^8][^2][^27][^35] | `native-spring-and-easing.md` |
| Pops in from nowhere | Starting from scale/alpha 0 with no anticipation; no directional movement.[^10][^3] | `native-entrance-exit-patterns.md` |
| Feels slow / heavy | Durations too long for frequency/context; bounce too large for serious UI.[^1][^7][^27][^35] | `native-spring-and-easing.md` |
| Confusing focal point | Multiple elements animating simultaneously; missing staging and hierarchy.[^8][^7][^5] | `native-disney-principles.md` |
| Hover/tap feedback feels flickery | Hit target moves during animation; in Compose, recomposition or clickable area shifts; in SwiftUI, layout changes move tap area.[^3][^9] | `native-micro-interactions.md` |
| Popover/sheet scales from wrong place | Transform / transition origin doesn't match trigger or platform convention.[^8][^10][^3] | `platform-polish-details.md` |
| Everything stops at once | No stagger or follow-through; container and children share identical timing.[^8][^10][^7] | `native-disney-principles.md` |
| Choppy / frame drops | Animating layout-heavy properties or recomposing large trees per frame; misusing GeometryReader / layout-phase animation.[^4][^24][^38][^34] | `native-performance-diagnosis.md` |
| Shaky / jittery at start/end | Layer promotion not prepared (Compose: misused graphicsLayer; SwiftUI: overdraw/layout jitter); interpolation of layout instead of transform.[^4][^3][^38] | `native-performance-diagnosis.md` |
| Too cartoony | Exaggeration and bounce beyond what context warrants; durations too long; repeated delight for frequent actions.[^8][^7][^9] | `native-disney-principles.md` |
| Blur or heavy effects lag | Overusing heavy blur/shadow/text effects without Canvas/graphicsLayer; animating expensive filters.[^4][^3][^16][^38] | `native-performance-diagnosis.md` |
| Shared element feels like cross-fade | Incorrect matchedGeometry/SharedTransition setup; clipping issues; inconsistent IDs.[^41][^40][^23] | `native-shared-transitions.md` |


***
