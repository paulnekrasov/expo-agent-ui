# Reanimated Motion Layer Research

## Executive Summary
- Build Agent UI motion on Reanimated 4 primitives, not a custom animation engine.
- Target Expo's bundled `react-native-reanimated` first: current Expo latest documents bundled version `4.2.1` and install via `npx expo install react-native-reanimated react-native-worklets`.
- Keep package peer ranges flexible enough for upstream `react-native-reanimated@4.3.0`, but do not assume Expo latest has adopted it until Expo package metadata says so.
- Treat `react-native-worklets` as a required Reanimated 4 dependency. Expo managed apps get Babel plugin configuration from `babel-preset-expo`; bare/community CLI apps must configure the Worklets plugin explicitly and keep it last.
- Default to `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, layout transitions, and entering/exiting animations.
- Use `react-native-gesture-handler` for gesture-driven motion. Wrap the app with `GestureHandlerRootView`, and use `Gesture`/`GestureDetector` or the newer hook APIs according to the installed RNGH major.
- Honor reduced motion everywhere. Use Reanimated `ReduceMotion.System` by default and expose an Agent UI override.
- Prefer `opacity` and `transform` for default transitions. Use layout transitions only for small, bounded layout changes.
- Emit semantic animation events from JS-owned wrappers and Reanimated callbacks; do not promise per-frame telemetry.
- Defer shared element transitions, advanced physics parity with SwiftUI, and automated motion debugging until after v0.

## Version And Install Matrix

| Package | Current version / range | Required install step | Expo managed behavior | Bare workflow behavior | Source URL |
|---|---|---|---|---|---|
| `react-native-reanimated` | Expo latest bundled: `4.2.1`; npm latest checked locally: `4.3.0` with peer `react-native: 0.81 - 0.85` and `react-native-worklets: 0.8.x` | `npx expo install react-native-reanimated react-native-worklets` in Expo; npm/yarn equivalent outside Expo | Included in Expo Go per Expo docs; no extra Babel config required with `babel-preset-expo` | Must satisfy React Native New Architecture/Fabric for Reanimated 4; rebuild native app | [Expo Reanimated SDK](https://docs.expo.dev/versions/latest/sdk/reanimated/), [Reanimated compatibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/), npm package metadata checked 2026-04-27 |
| `react-native-worklets` | npm latest checked locally: `0.8.1`; Reanimated compatibility docs map Reanimated `4.2.x` to Worklets `0.7.x`/`0.8.x`, `4.3.x` to `0.8.x` | Install alongside Reanimated | Expo docs require installing it with Reanimated; Babel plugin is auto-configured by Expo | Add `react-native-worklets/plugin` to `babel.config.js`, listed last, when using React Native Community CLI | [Expo Reanimated SDK](https://docs.expo.dev/versions/latest/sdk/reanimated/), [Reanimated getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/), [Worklets Babel plugin](https://docs.swmansion.com/react-native-worklets/docs/worklets-babel-plugin/about/) |
| `react-native-gesture-handler` | Expo latest bundled: `~2.30.0`; npm latest checked locally: `2.31.1` | `npx expo install react-native-gesture-handler` | Included in Expo Go; still needs app-root `GestureHandlerRootView` for gesture recognition | Install package, wrap roots/screens, run prebuild/pods for native builds | [Expo Gesture Handler SDK](https://docs.expo.dev/versions/latest/sdk/gesture-handler/), [RNGH installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/) |
| Metro / Babel config | Expo managed: use Expo defaults; custom/bare: verify Babel and bundler config | No Agent UI-specific Metro config for v0; ensure Worklets Babel plugin path is correct where Expo does not supply it | Expo says no additional Reanimated configuration is required after install because `babel-preset-expo` configures the plugin | Community CLI must list `react-native-worklets/plugin` last; custom web bundlers may need extra Babel setup | [Expo Reanimated SDK](https://docs.expo.dev/versions/latest/sdk/reanimated/), [Reanimated getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) |
| `@babel/plugin-proposal-export-namespace-from` | Only relevant to some web setups outside Expo | Add to Babel config for Reanimated web when not using Expo defaults | Expo is the recommended web path in upstream docs | Needed in non-Expo web builds before the Worklets plugin | [Reanimated getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/), [Reanimated web support](https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/) |

## Core API Findings

### `useSharedValue`

- Purpose: create the shared mutable values that drive Reanimated animations.
- Minimal example shape: `const width = useSharedValue(100); width.value = withSpring(nextWidth);`.
- Constraints: always read/write through `.value`; the animated value category must match the destination category.
- Agent UI use case: internal state for opacity, scale, translation, gesture offsets, and progress values.
- Source URL: [Your First Animation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/) accessed 2026-04-27.

### `useAnimatedStyle`

- Purpose: derive animated style objects from shared values and React state.
- Minimal example shape: `useAnimatedStyle(() => ({ opacity: visible.value ? 1 : 0 }))`.
- Constraints: pass returned styles only to `Animated` components; do not mutate shared values inside the callback; animated styles override static styles by last update, not array order.
- Agent UI use case: SwiftUI-style view modifiers that map to transforms, opacity, and bounded style updates.
- Source URL: [useAnimatedStyle](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/) accessed 2026-04-27.

### `withSpring`

- Purpose: spring animation object for shared values and animated styles.
- Minimal example shape: `sv.value = withSpring(toValue, { damping, stiffness, reduceMotion: ReduceMotion.System }, callback)`.
- Constraints: physics config (`stiffness`/`damping`) and duration config (`duration`/`dampingRatio`) are mutually exclusive; callback runs on the UI thread and receives interruption state.
- Agent UI use case: `motion.spring`, `motion.bouncy`, `motion.snappy`, gesture settle animations.
- Source URL: [withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) accessed 2026-04-27.

### `withTiming`

- Purpose: deterministic duration/easing animation.
- Minimal example shape: `sv.value = withTiming(toValue, { duration: 300, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }, callback)`.
- Constraints: default duration is 300 ms; callback receives `false` if cancelled.
- Agent UI use case: `motion.easeInOut`, opacity transitions, reduced-motion short fades when allowed.
- Source URL: [withTiming](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/) accessed 2026-04-27.

### `withSequence`

- Purpose: run animation objects sequentially.
- Minimal example shape: `sv.value = withSequence(ReduceMotion.System, withTiming(50), withTiming(0))`.
- Constraints: pass reduced-motion behavior explicitly when used; avoid defaulting v0 UI to playful multi-step effects.
- Agent UI use case: rare feedback pulses and validation shakes, not primary navigation or form motion.
- Source URL: [withSequence](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/) accessed 2026-04-27.

### `withDelay`

- Purpose: delay an animation start.
- Minimal example shape: `sv.value = withDelay(120, withTiming(1), ReduceMotion.System)`.
- Constraints: delayed animation still needs reduced-motion handling; delays can make semantic state appear stale.
- Agent UI use case: staggered decorative entrance only when disabled by reduced motion and not needed for tool reliability.
- Source URL: [withDelay](https://docs.swmansion.com/react-native-reanimated/docs/animations/withDelay/) accessed 2026-04-27.

### `useDerivedValue`

- Purpose: create readonly reactive shared values from other shared values or state.
- Minimal example shape: `const derived = useDerivedValue(() => progress.value * 50);`.
- Constraints: returned value is readonly for normal use; dependencies are mainly relevant for web without Babel plugin.
- Agent UI use case: computed progress, clamped gesture state, and derived semantic animation phase.
- Source URL: [useDerivedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue/) accessed 2026-04-27.

### `runOnJS` / JS scheduling

- Purpose: call JS-thread functions from UI-thread worklets, usually for state updates or completion events.
- Minimal example shape: `runOnJS(onComplete)(finished)`.
- Constraints: Worklets docs mark `runOnJS` deprecated in favor of newer scheduling APIs, while Reanimated/RNGH integration still commonly references JS-thread callbacks. Keep this behind an internal adapter.
- Agent UI use case: emit `animation_completed` or `gesture_committed` events from callbacks into the semantic registry.
- Source URL: [React Native Worklets runOnJS](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS/) accessed 2026-04-27.

### Layout transitions

- Purpose: animate size and position changes caused by layout updates.
- Minimal example shape: `<Animated.View layout={LinearTransition} />`.
- Constraints: `LinearTransition`, `SequencedTransition`, `FadingTransition`, `JumpingTransition`, `CurvedTransition`, and `EntryExitTransition` expose duration, delay, `reduceMotion`, and callback modifiers; springified transitions cannot use easing modifiers.
- Agent UI use case: `layoutTransition.smooth` for local stack/list item repositioning.
- Source URL: [Layout transitions](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/) accessed 2026-04-27.

### Entering and exiting animations

- Purpose: animate elements when added to or removed from the view hierarchy.
- Minimal example shape: `<Animated.View entering={FadeIn} exiting={FadeOut} />`.
- Constraints: predefined animations expose modifiers such as duration, delay, reduce motion, initial values, and completion callbacks.
- Agent UI use case: `transition.opacity`, `transition.slide`, and `transition.scale`.
- Source URL: [Entering/Exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) accessed 2026-04-27.

### Reduced motion APIs

- Purpose: detect and honor the system reduced-motion preference.
- Minimal example shape: `const reduceMotion = useReducedMotion();` or animation config `{ reduceMotion: ReduceMotion.System }`.
- Constraints: `useReducedMotion` reads synchronously but does not rerender when the system setting changes; Reanimated defaults animations to `ReduceMotion.System`.
- Agent UI use case: global Agent UI motion policy with per-animation system/default handling.
- Source URL: [useReducedMotion](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/), [Reanimated accessibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/) accessed 2026-04-27.

## SwiftUI-Style Preset Mapping

| Agent UI preset | Reanimated primitive | Recommended config | Reduced motion behavior | Caveats | Source URL |
|---|---|---|---|---|---|
| `motion.spring()` | `withSpring` | Duration spring: `{ duration: 420, dampingRatio: 1, reduceMotion: ReduceMotion.System }` for predictable SwiftUI-like default | System: snap to final value or use minimal opacity fade where appropriate | Not exact SwiftUI parity; expose override config | [withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) |
| `motion.bouncy()` | `withSpring` | Physics spring: `{ damping: 14, stiffness: 180, mass: 1, overshootClamping: false, reduceMotion: ReduceMotion.System }` | Disable bounce; snap/fade | Use sparingly for small controls, not navigation-critical flow | [withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) |
| `motion.snappy()` | `withSpring` or `withTiming` | Prefer duration spring `{ duration: 260, dampingRatio: 0.9, reduceMotion: ReduceMotion.System }` | Snap or reduce to <=100 ms opacity | Needs tuning against actual device feel | [withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) |
| `motion.easeInOut({ duration })` | `withTiming` | `{ duration: duration ?? 300, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }` | Snap/fade; no long easing | Good for opacity and small transform transitions | [withTiming](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/) |
| `transition.opacity` | `FadeIn`/`FadeOut` or `withTiming(opacity)` | 150-250 ms timing; use entering/exiting for mount/unmount, shared value for persistent nodes | Usually allow very short fade only if product policy permits; otherwise snap | Must coordinate semantic visibility events with mount state | [Entering/Exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) |
| `transition.slide` | `SlideIn*`/`SlideOut*` or translate transform with `withTiming`/`withSpring` | Translate on X/Y plus opacity, 250-350 ms | Remove translation; optional opacity only | Avoid conflicting with navigation library transitions | [Entering/Exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) |
| `transition.scale` | `ZoomIn`/`ZoomOut` or transform scale | Scale 0.96 to 1 with opacity, 180-260 ms | Disable scale; optional opacity | Do not use large zooms as default accessibility-safe motion | [Entering/Exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) |
| `layoutTransition.smooth` | `LinearTransition` or `FadingTransition`; springify only when bounded | `LinearTransition.duration(250).reduceMotion(ReduceMotion.System)` or `LinearTransition.springify().dampingRatio(1)` | Disable layout motion; final layout only | Layout transitions animate size/position, so limit to small local changes | [Layout transitions](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/) |

## Layout Transition Strategy

Use Reanimated layout transitions when the layout change is local, bounded, and predictable: expanding a small disclosure row, reordering a short stack, inserting/removing one form section, or moving a compact card within the same screen. Use `LinearTransition` for the v0 default, `FadingTransition` for safer cross-size changes, and expose springified variants only as opt-in.

Avoid layout transitions for whole-screen navigation, virtualized list churn, deeply nested forms, keyboard-driven relayout, and large scroll containers. Reanimated supports many layout/style properties, but layout animation can still create visual and semantic ambiguity when many nodes move at once. For `Animated.FlatList`, `itemLayoutAnimation` works only with single-column lists and cannot be used with `numColumns > 1`.

Entering/exiting strategy should be separate from layout strategy. Map Agent UI transition presets onto Reanimated entering/exiting builders for mount/unmount and shared-value styles for components that remain mounted. Agent UI should set semantic visibility and busy state from React state first, then emit animation events from callbacks.

Semantic event hooks should be coarse:
- `animation_started`: emitted by the JS wrapper before assigning the animation.
- `animation_completed`: emitted from completion callbacks when `finished === true`.
- `animation_interrupted`: emitted when completion callback reports cancellation/interruption.
- `transition_committed`: emitted when React state has changed and final semantic tree is available.

Do not emit per-frame semantic updates in v0.

## Gesture Strategy

Install `react-native-gesture-handler` when Agent UI exposes drag, swipe, fling, or custom tap gesture helpers. Expo latest bundles `~2.30.0` and installs it with `npx expo install react-native-gesture-handler`. The app must be wrapped in `GestureHandlerRootView` as close to the root as possible so gestures and relations work under the same root.

For v0:
- Tap/press: use React Native `Pressable` for normal buttons and semantic actions; use RNGH tap gestures only for custom composed gesture surfaces.
- Drag: use `Gesture.Pan()`/`GestureDetector` or the installed RNGH hook API with Reanimated shared values for offset and velocity.
- Swipe: use `ReanimatedSwipeable` for row actions only when that component fits the UI contract.
- Gesture composition: use `Race`, `Simultaneous`, and `Exclusive` for explicit interactions such as drag-vs-long-press.

Integration with semantic actions:
- Gesture start can emit `gesture_started`.
- Gesture update should stay on the UI thread and not spam the semantic layer.
- Gesture end should classify the result on the UI thread and use a JS bridge callback to dispatch `semanticAction` or `gesture_cancelled`.
- Agent tool taps should call semantic actions directly; they should not synthesize coordinates unless falling back to external simulator tooling.

Edge cases:
- Do not mix Reanimated and React Native Animated inside the same gesture detector.
- Memoize gesture configurations where docs recommend it.
- Wrap modal content with `GestureHandlerRootView` on Android if gestures are needed inside modals.
- Keep web `touchAction`/`userSelect` behavior explicit for draggable surfaces.

## Platform Caveats

iOS: Reanimated and Gesture Handler are supported in Expo Go according to Expo docs. Bare iOS builds need pods after native dependency changes. Reduced motion must map to the iOS accessibility setting through Reanimated `ReduceMotion.System` or React Native `AccessibilityInfo`.

Android: Gesture Handler needs no extra Android setup in normal cases, but gestures inside modals need their own `GestureHandlerRootView`. Reanimated performance on New Architecture has documented caveats around scrolling and animated components; test sticky headers and scroll-bound effects on real Android devices.

Web: Reanimated 4 documents web support for many APIs, but non-Expo web builds may need Babel configuration such as `@babel/plugin-proposal-export-namespace-from` and Worklets plugin ordering. Agent UI should degrade web motion to timing/opacity/transform first.

Expo Go: Expo docs mark both Reanimated and Gesture Handler included in Expo Go. Still use `expo install` ranges and avoid requiring custom native modules for v0 motion.

Development builds: When native dependency versions change, run prebuild and rebuild the app. Gesture Handler docs call out prebuild for Expo development builds.

New Architecture: Reanimated 4 works only with React Native New Architecture/Fabric. Agent UI should document Reanimated 3 as a non-v0 fallback for old-architecture apps rather than supporting both in the first motion layer.

Low power and reduced motion: Reanimated reduced-motion defaults are system-aware, but Agent UI should centralize a motion policy so agents and tests can see whether animations are enabled, reduced, or disabled.

Debugging: Expo notes Reanimated is incompatible with Remote JS Debugging for JavaScriptCore and recommends Hermes with the JavaScript Inspector. Do not make motion debugging depend on Chrome remote debugging.

## Deferred Work

- Shared element transitions: Reanimated marks shared element transitions as experimental; defer until core screen semantics and navigation adapters are stable.
- Exact SwiftUI spring parity: Reanimated and SwiftUI use different configuration models; v0 should provide taste mappings and named presets only.
- Per-frame semantic telemetry: too noisy and expensive for agent control; use start/completion/interruption events.
- Complex keyframe authoring: useful later for rich examples but not necessary for v0 primitives.
- Layout animation for complex virtualized grids: Reanimated list layout animation has single-column constraints.
- Cross-navigation transition ownership: defer until Expo Router and React Navigation adapter boundaries are defined.
- Automatic motion performance diagnostics: start with docs, presets, and examples; add profiling later.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Expo `react-native-reanimated` SDK docs | https://docs.expo.dev/versions/latest/sdk/reanimated/ | 2026-04-27 | Expo bundled Reanimated `4.2.1`, Expo install command, Worklets package install, automatic Babel plugin via `babel-preset-expo`, Expo Go support, remote debugging caveat |
| Reanimated getting started | https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/ | 2026-04-27 | Reanimated 4 requires New Architecture, Worklets dependency, prebuild/native rebuild guidance, Worklets Babel plugin for community CLI, web Babel caveat |
| Reanimated compatibility table | https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/ | 2026-04-27 | RN/Reanimated/Worklets version compatibility and New Architecture requirement |
| Reanimated Your First Animation | https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/ | 2026-04-27 | Shared values, `.value`, Animated components, `withSpring` basics |
| Reanimated `useAnimatedStyle` | https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/ | 2026-04-27 | Animated style purpose, constraints, animated component requirement |
| Reanimated `useDerivedValue` | https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue/ | 2026-04-27 | Derived shared values and readonly behavior |
| Reanimated `withSpring` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/ | 2026-04-27 | Spring config shape, reduced motion option, callback behavior |
| Reanimated `withTiming` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/ | 2026-04-27 | Timing config, easing, reduced motion, callback cancellation |
| Reanimated `withSequence` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/ | 2026-04-27 | Sequenced animations and reduced-motion argument |
| Reanimated `withDelay` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withDelay/ | 2026-04-27 | Delayed animations and reduced-motion argument |
| Reanimated layout transitions | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/ | 2026-04-27 | Layout transition builders, modifiers, callbacks, reduceMotion |
| Reanimated entering/exiting animations | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ | 2026-04-27 | Entering/exiting animation builders and modifiers |
| Reanimated list layout animations | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/list-layout-animations/ | 2026-04-27 | `itemLayoutAnimation` and single-column FlatList caveat |
| Reanimated accessibility | https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/ | 2026-04-27 | `ReduceMotion.System`, `Always`, `Never`, default system behavior |
| Reanimated `useReducedMotion` | https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/ | 2026-04-27 | Synchronous reduced-motion query and rerender caveat |
| Reanimated supported style properties | https://docs.swmansion.com/react-native-reanimated/docs/guides/supported-properties/ | 2026-04-27 | Animatable style property support varies by platform |
| Reanimated performance guide | https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/ | 2026-04-27 | New Architecture performance caveats and scroll jitter guidance |
| React Native Worklets `runOnJS` | https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS/ | 2026-04-27 | JS-thread callback bridge, deprecation note, callback constraints |
| React Native Worklets Babel plugin | https://docs.swmansion.com/react-native-worklets/docs/worklets-babel-plugin/about/ | 2026-04-27 | Workletization, autoworkletization, plugin limits |
| Expo `react-native-gesture-handler` SDK docs | https://docs.expo.dev/versions/latest/sdk/gesture-handler/ | 2026-04-27 | Expo bundled RNGH `~2.30.0`, Expo install command, Expo Go support |
| RNGH installation | https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/ | 2026-04-27 | `GestureHandlerRootView`, Expo install, prebuild, modal caveat, Reanimated + Worklets recommendation |
| RNGH Reanimated integration | https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/reanimated-interactions/ | 2026-04-27 | UI-thread gesture callbacks, shared values in gesture config, runOnJS option |
| RNGH Gesture API | https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture/ | 2026-04-27 | `Gesture`, `GestureDetector`, tap/pan/long press/fling/pinch/rotation and composition APIs |
| React Native `AccessibilityInfo` | https://reactnative.dev/docs/accessibilityinfo | 2026-04-27 | Native reduced-motion access outside Reanimated |
| npm package metadata | `npm view react-native-reanimated`, `npm view react-native-worklets`, `npm view react-native-gesture-handler` | 2026-04-27 | Latest package versions and peer dependency ranges at generation time |

## Final Recommendation

Stage 6 should implement a thin `packages/core/src/motion` layer over Reanimated 4 with:

- `motion.spring`, `motion.bouncy`, `motion.snappy`, and `motion.easeInOut` returning typed Reanimated animation configs or helper functions.
- transition helpers for opacity, slide, and scale using entering/exiting builders for mount/unmount and shared-value styles for mounted components.
- `layoutTransition.smooth` mapped to `LinearTransition.duration(250).reduceMotion(ReduceMotion.System)` by default, with opt-in spring variants.
- a global Agent UI motion policy that reads `useReducedMotion`, defaults all animations to `ReduceMotion.System`, and exposes disabled/reduced/enabled state to the semantic tree.
- coarse semantic events from wrapper code and Reanimated callbacks: started, completed, interrupted, and gesture committed.
- Gesture Handler integration as an optional peer path for drag/swipe/complex gestures, while ordinary semantic buttons keep React Native press semantics.

The main concerns are version skew and documentation split: Expo latest currently bundles Reanimated `4.2.1`, while npm latest is `4.3.0`; Expo managed setup says no additional Babel configuration is required, while upstream non-managed setup still requires explicit Worklets plugin handling. Agent UI should document Expo-managed install first and keep bare/community CLI setup as a separate compatibility lane.

DONE_WITH_CONCERNS
