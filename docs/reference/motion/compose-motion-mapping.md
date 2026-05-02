# Compose Motion Mapping For Reanimated

Status: inspiration only
Product stage: Stage 6 - Motion Layer
Counterpart: `motion/swiftui-motion-mapping.md` (iOS)
Skill source: `agent/platform-skills/native-app-design-engineering/SKILL.md`,
`agent/platform-skills/android-ecosystem-skill/references/compose-patterns.md`

The SwiftUI motion mapping document preserves iOS-side animation taste. This companion maps
Compose / Material Motion concepts to the same Reanimated motion presets.

## Motion Principles (Android Native Translation)

- Springs are the default motion language for interactive UI on both platforms.
- Compose uses `spring(dampingRatio, stiffness)` with named constants from `Spring.*`.
- Material Motion uses `FastOutSlowInEasing`, `LinearOutSlowInEasing`, `FastOutLinearInEasing`
  as standard easing curves.
- `graphicsLayer` transforms and alpha are GPU-efficient; prefer over layout-changing animations.
- Respect `Settings.Global.ANIMATOR_DURATION_SCALE` and reduce nonessential motion.
- Keep motion presets named for intent, matching the SwiftUI mapping: `smooth`, `snappy`,
  `bouncy`, `gentle`, `easeInOut`.

## Compose → Reanimated Mapping Sketch

| Compose API | Reanimated Equivalent | Agent UI Preset |
|---|---|---|
| `spring(dampingRatio = 0.9f, stiffness = StiffnessMedium)` | `withSpring({ damping: 18, stiffness: 400 })` | `motion.snappy()` |
| `spring(DampingRatioNoBouncy, StiffnessMedium)` | `withSpring({ damping: 20, stiffness: 400 })` | `motion.smooth()` |
| `spring(0.6f, StiffnessLow)` | `withSpring({ damping: 12, stiffness: 200 })` | `motion.bouncy()` |
| `tween(250, easing = FastOutSlowInEasing)` | `withTiming(value, { duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1) })` | `motion.easeInOut({ duration: 250 })` |
| `tween(180, easing = LinearOutSlowInEasing)` | `withTiming(value, { duration: 180, easing: Easing.out(Easing.cubic) })` | `transition.opacity()` |
| `infiniteRepeatable(tween(600, LinearEasing))` | `withRepeat(withTiming(value, { duration: 600, easing: Easing.linear }), -1)` | Spinner/progress |
| `animateContentSize()` | `useAnimatedStyle` with `withTiming` on layout dimensions | `layoutTransition.smooth()` |

## Duration Quick Reference (from native-app-design-engineering)

| Element Type | Duration (60Hz baseline) | Compose API Example |
|---|---|---|
| Tap/press feedback | 80–120ms | `tween(100, FastOutSlowInEasing)` |
| Toggle / checkbox | 120–180ms | `tween(150, FastOutSlowInEasing)` or light spring |
| Tooltip / toast | 140–200ms | `tween(180, LinearOutSlowInEasing)` |
| Dropdown / menu | 150–220ms | `tween(200, FastOutSlowInEasing)` |
| Modal / sheet / drawer | 200–280ms | `tween(250, FastOutSlowInEasing)` or spring |
| Page / tab transition | 220–320ms | `tween(300, FastOutSlowInEasing)` |
| Delight sequence | 350–650ms total | Keyframe or sequenced springs |

Rules:
- Exits should be 20–30% faster than entrances.
- On 120Hz devices, reduce durations by ~10–15%.
- Stay under ~280ms for standard UI; navigation transitions rarely exceed ~320ms on mobile.

## Spring Presets (from native-app-design-engineering)

| Feel | Compose DampingRatio | Compose Stiffness | Reanimated Approx | Use For |
|---|---|---|---|---|
| No bounce | `DampingRatioNoBouncy` | `StiffnessMedium` | damping: 20, stiffness: 400 | Default UI transitions |
| Medium bounce | 0.6f | `StiffnessLow` | damping: 12, stiffness: 200 | Toggles, chips, subtle overshoot |
| Snappy | 0.7f | `StiffnessHigh` | damping: 14, stiffness: 800 | Micro-interactions, icon presses |
| Soft | `DampingRatioMediumBouncy` | `StiffnessLow` | damping: 10, stiffness: 200 | Delight / celebration (sparingly) |

## Easing Curve Mapping

| Material Motion Easing | CSS Cubic Bezier Equivalent | Reanimated | Use When |
|---|---|---|---|
| `FastOutSlowInEasing` | `cubic-bezier(0.4, 0, 0.2, 1)` | `Easing.bezier(0.4, 0, 0.2, 1)` | On-screen movement, standard transitions |
| `LinearOutSlowInEasing` | `cubic-bezier(0, 0, 0.2, 1)` | `Easing.out(Easing.cubic)` | Elements entering screen |
| `FastOutLinearInEasing` | `cubic-bezier(0.4, 0, 1, 1)` | `Easing.in(Easing.cubic)` | Elements exiting screen |
| `LinearEasing` | `linear` | `Easing.linear` | Constant motion (spinners) |

## Cross-Platform Motion Convergence

| Motion Intent | SwiftUI | Compose | Reanimated Preset |
|---|---|---|---|
| Enter/appear | `.easeOut(duration: 0.2)` or light spring | `tween(180, LinearOutSlowInEasing)` | `motion.gentle()` |
| On-screen reposition | `.easeInOut(duration: 0.25)` or spring | `tween(250, FastOutSlowInEasing)` or spring | `motion.smooth()` |
| Exit/dismiss | `.easeIn(duration: 0.15)` | `tween(150, FastOutLinearInEasing)` | 20–30% faster than enter |
| Interactive gesture | `.spring(response: 0.25)` | `spring(0.7f, StiffnessHigh)` | `motion.snappy()` |
| Delight / bounce | `.spring(response: 0.4, dampingFraction: 0.6)` | `spring(0.6f, StiffnessLow)` | `motion.bouncy()` |
| Constant rotation | `.linear.repeatForever()` | `infiniteRepeatable(tween(600, LinearEasing))` | Linear repeat |

## Preserved Ideas

- Bottom sheets feel like bottom-edge movement with a scrim dimming layer on both platforms.
- Navigation transitions on Android Material default to shared-axis or container transform;
  on iOS they default to push/pop slide. Cross-platform defaults should be direction-aware.
- Material Motion container transforms map to shared element transitions; these require
  `SharedTransitionLayout` in Compose and `matchedGeometryEffect` in SwiftUI.
- Slide transitions should respect RTL/LTR layout direction on both platforms.
- Scale transitions need opacity to avoid visual harshness on both platforms.

## Performance Rules (Compose Translation)

- Keep animation state in stable scopes; avoid recomposing large hierarchies per frame.
- Prefer `graphicsLayer` transforms and alpha; they are composited on GPU.
- Use `animateContentSize` for size changes instead of manual layout tweaks.
- Use Layout Inspector and animation tooling to find recomposition hotspots.
- Suspend or simplify infinite animations for off-screen content.

## Non-Goals

- Do not port the Compose animation system into React Native.
- Do not implement Compose-specific motion before Stage 6.
- Do not require Material Motion constants in the core motion API.
- Do not assume 60Hz; test and tune on both 60Hz and 120Hz devices.
