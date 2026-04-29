## Practitioner Research Findings

### X/Twitter-like Practitioner Equivalents (blogs, talks, repos)

Because direct X/Twitter search isn't available here, the closest "practitioner" sources are engineers and designers publishing deep SwiftUI/Compose animation work via blogs, conference talks, and tutorials.

- **AppCoda - Simon Ng \& team (SwiftUI)**
    - Focus: Practical iOS tutorials including `KeyframeAnimator`, `PhaseAnimator`, and complex SwiftUI animation sequences.[^19]
    - Signal: Production-focused tutorials with stepwise code for keyframe-driven motion and emoji/icon animations.[^19]
- **Exyte engineering blog (SwiftUI)**
    - Focus: Advanced KeyframeAnimator and scroll effects, rewriting old animations using the iOS 17 keyframes API.[^20]
    - Signal: Deep dives into structuring keyframe value types and building sophisticated, multi-track animations.[^20]
- **Pavel Hubin - "Advanced Animations in SwiftUI" (SwiftUI)**
    - Focus: Keyframe vs phase animations, multi-property animation design, patterns for building value types for animation.[^22]
    - Signal: Explains when to choose keyframes vs phases and how to decompose animation into semantic properties.[^22]
- **Create with Swift - Majid Jabrayilov \& community (SwiftUI)**
    - Focus: Spring animation semantics in SwiftUI (response/dampingFraction), how presets map to perceived feel.[^15]
    - Signal: Practical heuristics for configuring springs to feel snappy, standard, or smooth in real apps.[^15]
- **FlyingHarley.dev (SwiftUI)**
    - Focus: Architecture of SwiftUI's animation system, view vs render tree, how Animatable and Transaction work.[^24]
    - Signal: Explains internal mechanics that underlie animation performance and correctness in SwiftUI.[^24]
- **Bugfender \& Softaai Compose blogs (Jetpack Compose)**
    - Focus: Complete guides to `animate*AsState`, `Animatable`, `updateTransition`, `AnimatedVisibility`, and micro-interactions like ripple, loading, and shimmer.[^46][^31][^36]
    - Signal: Multi-section guides mapping animation APIs to concrete UI examples and anti-pattern notes.[^31][^46][^36]
- **Victor Brandalise / ProAndroidDev (Compose shared elements)**
    - Focus: Shared element transitions with `SharedTransitionLayout`, sharedElement/sharedBounds scopes, navigation integration.[^42][^47][^48][^40]
    - Signal: Realistic card-to-detail and list-to-detail patterns with code and migration guidance to Compose 1.7+ shared elements.[^41][^44][^40]
- **Android Developers channel (Compose)**
    - Talks: "Practical magic with animations in Jetpack Compose", "Advanced animation example: Gestures", "Animation in Compose".[^49][^34][^39][^30]
    - Signal: Official deep dives showing combinations of `AnimatedContent`, `updateTransition`, `Animatable`, and gesture-driven animation with interruption and decay.[^34][^39][^30]
- **WWDC / Apple Developer videos (SwiftUI)**
    - Sessions: "Explore SwiftUI animation", "Wind your way through advanced animations in SwiftUI", "Animate symbols in your app", "Create custom visual effects with SwiftUI".[^26][^13][^16][^21]
    - Signal: First-party examples of how to structure multi-step animations, use keyframes and text renderers, design animated symbols, and integrate custom shaders.[^13][^16][^21]


### Articles and Blogs

Representative resources across the topic areas:


| Title | URL | Platform | Topic | Core insight | Recency / author |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SwiftUI Animation Guide: From Basic to Advanced in 2026 | dev.to article[^11] | SwiftUI | Implicit/explicit animations, springs, transitions | Emphasizes always using `.animation(_:value:)` with a value parameter and using `withAnimation` for scoped explicit animations.[^11] | 2026, independent iOS dev |
| The first step to SwiftUI's Animation System | flyingharley.dev[^24] | SwiftUI | Architecture, view vs render tree, Animatable/Transaction | Explains how state changes propagate via transactions, and why SwiftUI keeps a persistent render tree for smooth animation.[^24] | 2023, Swift engineer |
| Mastering SwiftUI Animations: Implicit vs Explicit | fatbobman.com[^12] | SwiftUI | Implicit vs explicit animations, priority rules | Documents how explicit `withAnimation` provides a default animation but can be overridden by implicit `.animation` and how transactions combine.[^12] | 2025, iOS blogger |
| Creating Advanced Animations with KeyframeAnimator in SwiftUI | AppCoda[^19] | SwiftUI | KeyframeAnimator, multi-track keyframes | Shows how to model an `AnimationValues` struct and use Cubic/Linear/Spring keyframes to animate multiple properties independently.[^19] | 2023, AppCoda |
| Advanced Animations in SwiftUI | pavelhubin.com[^22] | SwiftUI | PhaseAnimator vs KeyframeAnimator | Clarifies when to use phase-based animations for discrete states vs keyframes for per-property timing and more expressive motion.[^22] | 2023, Swift engineer |
| Understanding Spring Animations in SwiftUI | Create with Swift[^15] | SwiftUI | Spring semantics and presets | Breaks down `response` and `dampingFraction` in perceptual terms and maps to new `.spring(duration:bounce:)` style APIs.[^15] | 2026, SwiftUI educator |
| Value-based animations | developer.android.com[^32] | Compose | `animate*AsState`, `updateTransition`, keyframes | Official guidance on when to use simple value animations vs multi-value transitions and how to coordinate child animations.[^32] | Ongoing, Android team |
| Animation modifiers and composables | developer.android.com[^38] | Compose | `AnimatedVisibility`, transitions, infinite transitions | Provides patterns for animating visibility, size (`animateContentSize`), and looping animations with `rememberInfiniteTransition`.[^38] | Ongoing, Android team |
| Advanced animation example: Gestures | developer.android.com[^34] | Compose | Gesture-linked animations with Animatable | Demonstrates using `Animatable` plus drag/fling gestures, velocity tracking, and interruptible animations.[^34] | Ongoing, Android team |
| Shared element transitions in Compose | developer.android.com[^41] | Compose | SharedTransitionLayout \& sharedElement/sharedBounds | Shows how to scope shared elements and decide between sharedElement (same content) and sharedBounds (different content but shared container).[^41] | 2024, Android team |
| Shared Element Transitions in Jetpack Compose | Victor Brandalise blog[^40] | Compose | Shared elements with cards-to-detail | Implements practical card expansion and list-to-detail patterns using shared element APIs.[^40] | 2024, Android dev |
| Master animate*AsState in Jetpack Compose | softaai.com[^31] | Compose | `animate*AsState` mental model | Emphasizes state-driven approach: you don't start animations, you change state; animate*AsState smoothly interpolates between targets.[^31] | 2026, Android dev |
| Jetpack Compose Animations: Complete Guide | bugfender.com[^36] | Compose | High-level guide to core APIs | Summarizes animate*AsState, Animatable, transitions, and visibility APIs with concrete recipes and recommendations.[^36] | 2025, Android engineer |
| Motion - Material Design 3 | material.io[^35][^45] | Both | M3 motion tokens, physics-based springs | Defines easing, duration, and spring tokens that Compose's material animations map to.[^35][^45] | Current, Google design |
| Motion | Apple HIG[^27][^28] | Both | When/how to animate, accessibility | Provides high-level rules: be realistic, purposeful, consistent; make animations optional and respect Reduce Motion.[^27][^28] | Current, Apple |

### WWDC and Android Dev Summit Sessions

**SwiftUI WWDC sessions**

- **Explore SwiftUI animation (WWDC23)**[^13]
    - Shows how SwiftUI uses `Animatable` to interpolate values, how animations are applied via Transactions, and how implicit/explicit animations cooperate.[^13]
    - Clarifies that animation is state-driven: change state, SwiftUI figures out what to interpolate.[^13]
    - Demonstrates simple implicit animations scaling up to more complex interactions.[^13]
- **Wind your way through advanced animations in SwiftUI (WWDC23)**[^50][^51][^21]
    - Introduces `PhaseAnimator` and `KeyframeAnimator` with multi-track keyframes, showing independent timing per property.[^21]
    - Demonstrates structuring animation values as a type and feeding them into keyframe tracks.[^21]
    - Emphasizes combining multiple APIs (springs, keyframes, phases) to construct sophisticated sequences while keeping code declarative.[^21]
- **Animate symbols in your app (WWDC23)**[^25][^26]
    - Introduces the Symbols framework and symbol effects (e.g., bounce, scale, variable color) for SF Symbols.[^26]
    - Explains design patterns for using animated symbols as micro-interactions and for success/error confirmation states.[^26]
    - Encourages pairing symbol motion with system-consistent durations and respecting accessibility settings.[^26]
- **Create custom visual effects with SwiftUI (WWDC24)**[^52][^16][^17]
    - Shows how to build custom scroll effects, mesh gradients, and text transitions using `TextRenderer` and shaders.[^16]
    - Provides patterns for splitting text into runs/slices and animating each with springs over time.[^16]
    - Encourages experimentation, emphasizing that many rich effects are just combinations of simple transformations with careful timing.[^16]

**Compose / Android sessions**

- **Practical magic with animations in Jetpack Compose (Android Devs)**[^49][^39]
    - Demonstrates combining `AnimatedContent`, `AnimatedVisibility`, and `updateTransition` to create fluid, multi-part transitions without imperative state machines.[^39]
    - Highlights the Compose Animation Preview tooling to scrub animations and inspect values over time.[^49]
    - Underlines that animations should be tied to state changes, not manual start/stop lifecycles.[^33]
- **Animations in Jetpack Compose / Value-based animations**[^30][^33]
    - Clarifies that `animate*AsState` is for simple single-property animations, `updateTransition` for multiple properties, and `AnimatedVisibility`/`Crossfade` for visibility/content changes.[^33][^30]
    - Provides guidance on selecting tween vs spring vs keyframes and customizing `transitionSpec` per target state.[^32][^30]
- **Advanced animation example: Gestures**[^34]
    - Shows how to link drag/fling gestures with `Animatable`, `VelocityTracker`, and decay animations.[^34]
    - Emphasizes interruptibility: new gestures cancel ongoing animations via coroutine cancellation, then re-target from the current value.[^34]


### Official Documentation Extracts

- **Apple HIG - Motion \& Animation**[^29][^28][^27]
    - Use animation judiciously; avoid gratuitous motion that distracts or disorients.[^27]
    - Strive for realism and credibility; movements should respect implied physics and be reversible where users expect.[^28]
    - Be consistent with platform motion: custom animations should feel like extensions of built-in transitions.[^28]
    - Make animations optional; apps must respect the Reduce Motion accessibility preference.[^27]
- **SwiftUI - Animation \& APIs (WWDC/Docs)**[^16][^21][^13]
    - Animations are driven by state changes and transactions; Animatable values define what moves, Animation defines how values evolve over time.[^18][^13]
    - PhaseAnimator and KeyframeAnimator provide higher-level compositional tools for multi-step and multi-track animations.[^21]
    - TextRenderer and shaders enable custom text and graphic effects at high performance.[^16]
- **Material Design 3 - Motion**[^53][^54][^35][^45]
    - Defines motion duration and easing tokens (e.g., short2 100ms, medium2 300ms) and physics-based spring tokens for expressive motion.[^55][^35]
    - Encourages consistent use of motion tokens across UI for predictable behavior (containment, shared axis, fade through, etc.).[^35][^45]
    - Newer expressive system leans more heavily on springs for fluidity while still mapping to abstract tokens.[^53][^45]
- **Jetpack Compose Animation Guide**[^38][^32][^30][^33]
    - Recommends `animate*AsState` for simple value animations, `Transition` for multi-value, `AnimatedVisibility`/`AnimatedContent` for content, `rememberInfiniteTransition` for looping, and `Animatable` for gesture-driven motion.[^38][^32][^30][^34]
    - Emphasizes tying animations to state and keeping animation state stable over recompositions.[^33]
- **Compose performance \& recomposition**[^56][^32][^30][^38][^34]
    - Guides using recomposition scopes properly, avoiding storing animation specs inside composable bodies, and preferring draw-phase animations when layout work is expensive.[^38][^33]
    - Shows how tools like Layout Inspector and animation previews help diagnose performance and correctness.[^56][^49]

***
