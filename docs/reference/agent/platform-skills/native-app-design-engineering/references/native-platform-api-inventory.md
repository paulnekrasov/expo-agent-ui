## Platform API Inventory

### SwiftUI Animation APIs (iOS 17+ / SwiftUI 5+)

- **Implicit animations - `.animation(_:value:)`**
Attach to a view to animate any changes to animatable properties when the specified `value` changes; always pass the `value` parameter to avoid unpredictable global animations and deprecation warnings.[^11][^12][^13]
- **Explicit animations - `withAnimation(_:_:)` and `withTransaction(_:)`**
Wrap state changes to apply a specific animation to all affected views; `withTransaction` allows finer control over transaction properties like disabling animations for parts of an update.[^12][^13]
- **`Animation` types**
    - `.linear`, `.easeIn`, `.easeOut`, `.easeInOut` with `duration`, `delay`, `repeatForever`, `repeatCount`, `speed` modifiers for time/easing control.[^14][^13]
    - Spring APIs: `.spring(response:dampingFraction:blendDuration:)` and "semantic" presets `.spring(duration:bounce:)`, `.bouncy`, `.smooth`, `.snappy` with intuitive tuning.[^15][^14]
- **Transitions - `.transition(_:)` and `AnyTransition`**
Built-in transitions (`.opacity`, `.scale`, `.slide`, `.move(edge:)`, `.push(from:)`) and composition (`.combined`, `.asymmetric`) control how views enter/exit when added/removed from the hierarchy.[^13][^14]
- **Custom transitions via `AnyTransition.modifier` and `AnimatableModifier`**
Implement fine-grained transitions by interpolating custom animatable data (e.g., corner radius, clipping path) between insertion/removal states.[^16][^17][^13]
- **`Animatable` and `animatableData`**
Conform views or modifiers to `Animatable` to interpolate arbitrary numeric data (scalars, vectors) across an animation, enabling custom drawing or effects.[^18][^13]
- **Keyframe animations - `KeyframeAnimator` and keyframe types**
`KeyframeAnimator(initialValue:trigger:content:keyframes:)` animates a value type through multiple tracks (CubicKeyframe, LinearKeyframe, MoveKeyframe, SpringKeyframe) so each property can have its own timing and easing.[^19][^20][^21]
- **Phase animations - `PhaseAnimator`**
Drives a view through an ordered sequence of discrete phases, animating between them whenever the phase value changes; useful for multi-step state transitions.[^22][^21][^19]
- **Spring system and presets**
New `Spring` type powers APIs like `.snappy`, `.bouncy`, `.smooth`, letting you reason about duration and bounce instead of stiffness/damping while still being backed by physical simulation.[^14][^15][^13]
- **Matched geometry - `matchedGeometryEffect(id:in:properties:isSource:)`**
Smoothly animates between different layouts by matching views sharing an ID in the same `Namespace`; supports animating position, size, and other geometry properties across view hierarchies.[^23][^13][^14]
- **Geometry readers - `GeometryReader`**
Exposes container size/position, often combined with animations for parallax, sticky headers, and track-based effects; must be used carefully to avoid layout complexity.[^24][^18]
- **Canvas and `TimelineView`**
`Canvas` provides a GPU-accelerated drawing surface; `TimelineView` schedules periodic updates for frame-driven custom animations like particle systems or animated backgrounds.[^17][^24][^16]
- **Symbol effects - `.symbolEffect(_:options:value:)`**
APIs to animate SF Symbols declaratively with effects like `.bounce`, `.pulse`, `.scale`, `.appear`, `.disappear`, `.variableColor`, plus new Draw/Variable Draw effects in SF Symbols 7.[^25][^26]
- **Sensory feedback - `SensoryFeedback` (iOS 17+)**
A unified high-level API that coordinates haptics, sound, and visuals for common outcomes (success, error, start, stop), intended to be composed with motion.[^27][^26]
- **Interruptibility model**
SwiftUI animations are inherently state-driven and interruptible: when the target state changes, animations retarget from the current interpolated value; explicit springs preserve velocity across interruptions.[^21][^18][^13]
- **Accessibility - `EnvironmentValues.accessibilityReduceMotion`**
Animation APIs respect the system's Reduce Motion setting when you branch on `accessibilityReduceMotion`, allowing you to replace complex movement with subtle fades or static updates.[^28][^29][^27]


### Jetpack Compose Animation APIs (Compose 1.7+ / BOM 2024.x)

- **`animate*AsState` family**
`animateFloatAsState`, `animateDpAsState`, `animateColorAsState`, `animateIntAsState`, `animateOffsetAsState`, and `animateValueAsState` animate a single value in response to state changes; they return state objects you use directly in modifiers.[^30][^31][^32][^33]
- **`Animatable`**
A lower-level, coroutine-friendly animation primitive for manually driving values with `animateTo`, `snapTo`, `animateDecay`; ideal for gestures and complex flows where you need to cancel/coordinate animations.[^34][^33]
- **`AnimationSpec` types**
    - `tween(durationMillis, delayMillis, easing)` - fixed-duration timing curve.[^32][^30]
    - `spring(dampingRatio, stiffness)` - physically based motion with named constants like `Spring.DampingRatioNoBouncy`, `Spring.StiffnessMedium`.[^35][^32]
    - `keyframes` - fine-grained control over values at specific times.[^36][^37]
    - `snap` - jump to new value without interpolation.[^30][^32]
    - `repeatable`, `infiniteRepeatable` with `RepeatMode.Restart`/`Reverse` for looping.[^38][^30]
- **Transitions - `updateTransition` and `Transition`**
`updateTransition(targetState)` creates a multi-property transition; extension functions like `transition.animateFloat`, `animateDp`, `animateColor` coordinate multiple animated values across state changes.[^38][^32][^34][^30]
- **Visibility and content transitions**
    - `AnimatedVisibility` with `enter`/`exit` `EnterTransition`/`ExitTransition` combinations such as `fadeIn`, `fadeOut`, `slideInVertically`, `expandVertically`, `shrinkHorizontally`.[^33][^30][^38]
    - `AnimatedContent` and `ContentTransform` for animating content replacement, with `sizeTransform` and explicit transitions for in/out.[^39][^36][^30]
    - `Crossfade` for simple fade-based content swaps.[^30][^38]
- **Shared element transitions - `SharedTransitionLayout`**
New APIs (`SharedTransitionLayout`, `SharedTransitionScope`, `Modifier.sharedElement()`, `Modifier.sharedBounds()`) connect elements across screens while interpolating bounds, clipping, and content.[^40][^41][^42][^43][^44]
- **Infinite and repeated animations - `rememberInfiniteTransition`**
Creates continuously running animations for loading indicators, shimmering skeletons, breathing pulses, etc., using `animateFloat`, `animateColor`, and `infiniteRepeatable` specs.[^36][^38][^30]
- **Low-level motion - `graphicsLayer` and layout animation helpers**
`Modifier.graphicsLayer` gives access to GPU-backed transforms (translation, scale, rotation, alpha, shadow) for performant, composited animations; `animateContentSize` animates content size changes automatically.[^33][^38][^30]
- **MotionLayout (ConstraintLayout integration)**
Brings declarative keyframe-style motion scenes into Compose, useful for coordinated multi-element animations beyond standard specs.[^37][^36]
- **Interruptibility model**
Animations driven by `Animatable` and coroutines can be cancelled and restarted on new input; `animate*AsState` automatically retargets when state changes, smoothly interpolating from the current value, which is ideal for gesture-driven transitions.[^31][^34][^33]
- **Performance and recomposition guidance**
Official docs emphasize keeping animation state in appropriate scopes to avoid unnecessary recompositions, and using `graphicsLayer` or draw-phase animation instead of re-running measure/layout when possible.[^32][^34][^38][^33][^30]
- **Accessibility - `LocalViewConfiguration` and reduced motion patterns**
Compose supports a `LocalReduceMotion` style pattern (and Material3 tokens) where you branch animation specs based on platform reduce-motion settings so you can shorten or replace animations while preserving state feedback.[^45][^35][^30]

***
