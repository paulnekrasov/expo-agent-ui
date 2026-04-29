# Reanimated Motion Layer Research

## Executive Summary
- Agent UI should build motion on Reanimated 4, not a custom animation engine.
- Expo latest documents `react-native-reanimated` bundled version `4.2.1` and install command `npx expo install react-native-reanimated react-native-worklets`.
- Expo latest documents `react-native-gesture-handler` bundled version `~2.30.0` and install command `npx expo install react-native-gesture-handler`.
- npm currently reports `react-native-reanimated@4.3.0`, `react-native-worklets@0.8.1`, and `react-native-gesture-handler@2.31.1`. These npm latest values are compatibility facts, not the Expo-managed baseline.
- Reanimated 4 requires React Native New Architecture/Fabric. Old Architecture support should not be part of Agent UI v0; document Reanimated 3 as a non-v0 compatibility lane if needed.
- Expo-managed setup and bare/community setup differ. Expo uses `babel-preset-expo` for the Worklets plugin path; React Native Community CLI must add `react-native-worklets/plugin` manually and keep it last.
- Treat `react-native-worklets` as a required companion dependency for Reanimated 4.
- Default presets should use Reanimated `withSpring`, `withTiming`, entering/exiting builders, and layout transitions with `ReduceMotion.System`.
- Gesture-driven motion should use React Native Gesture Handler only for true gestures; normal semantic buttons should keep React Native press semantics.
- No unresolved research blocker remains. Remaining concerns are implementation compatibility lanes, device testing, and tuning.

## Version And Install Matrix

| Package | Current version / range | Required install step | Expo managed behavior | Bare workflow behavior | Source URL |
|---|---|---|---|---|---|
| `react-native-reanimated` | Expo bundled: `4.2.1`. npm latest: `4.3.0`. npm peer range for `4.3.0`: React Native `0.81 - 0.85`, Worklets `0.8.x`. | Expo: `npx expo install react-native-reanimated react-native-worklets`. | Expo docs say Reanimated is included in Expo Go and no additional Babel configuration is required because `babel-preset-expo` configures the plugin. | Reanimated 4 requires New Architecture/Fabric. Native dependency changes require rebuild/prebuild/pods as applicable. | https://docs.expo.dev/versions/latest/sdk/reanimated/ |
| `react-native-worklets` | npm latest: `0.8.1`. Reanimated compatibility docs map Reanimated `4.2.x` to Worklets `0.7.x` or `0.8.x`, and Reanimated `4.3.x` to Worklets `0.8.x`. | Install alongside Reanimated. | Expo install command includes Worklets; Expo starter templates include the Worklets Babel plugin path through Expo defaults. | React Native Community CLI must add `react-native-worklets/plugin` to Babel config and list it last. | https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/ |
| `react-native-gesture-handler` | Expo bundled: `~2.30.0`. npm latest: `2.31.1`; npm `next`: `3.0.0-beta.3`. | `npx expo install react-native-gesture-handler`. | Included in Expo Go. App roots that use gesture handlers should be wrapped in `GestureHandlerRootView`. | Install package, wrap root, rebuild native app when native dependencies change. | https://docs.expo.dev/versions/latest/sdk/gesture-handler/ |
| `@babel/plugin-proposal-export-namespace-from` | Web-only companion for non-Expo web builds. | Add before `react-native-worklets/plugin` only for React Native Web setups that need it. | Expo is the recommended Reanimated web path; no Agent UI-specific Metro change is needed for v0. | Non-Expo web builds may need explicit Babel configuration. | https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/ |
| `@agent-ui/expo` motion layer | New project package, no published version yet. | Depend on Reanimated through peer/Expo install guidance, not by vendoring an animation engine. | Document Expo-managed install first and test against Expo SDK 55 package versions. | Document bare setup separately and fail diagnostics when Worklets/Babel/New Architecture requirements are not met. | docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md |

## Core API Findings

### `useSharedValue`

- Purpose: create mutable shared values used by Reanimated animations on the UI thread.
- Minimal example shape: a shared value is initialized, then assigned an animation object such as `withSpring(nextValue)`.
- Constraints: shared values are read and written through `.value`; animated value categories must stay compatible.
- Agent UI use case: opacity, scale, translation, gesture offset, progress, and internal transition phase.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/

### `useAnimatedStyle`

- Purpose: derive animated style objects from shared values.
- Minimal example shape: return style fields such as opacity or transform from a callback and pass the result to an `Animated` component.
- Constraints: use returned styles only with animated components; do not mutate shared values inside the style callback; animated styles override static styles by last update.
- Agent UI use case: implement SwiftUI-style modifiers for performant opacity and transform animations.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/

### `withSpring`

- Purpose: create spring animation objects.
- Minimal example shape: assign `withSpring(toValue, config, callback)` to a shared value.
- Constraints: physics config (`stiffness`, `damping`) and duration config (`duration`, `dampingRatio`) are mutually exclusive families; the callback runs on the UI thread and receives `false` if cancelled; `reduceMotion` is available.
- Agent UI use case: `motion.spring`, `motion.bouncy`, `motion.snappy`, gesture settle animations, and opt-in spring layout transitions.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/

### `withTiming`

- Purpose: create deterministic duration/easing animations.
- Minimal example shape: assign `withTiming(toValue, { duration, easing, reduceMotion }, callback)` to a shared value.
- Constraints: callback receives cancellation state; use for predictable fades and simple transforms rather than physics.
- Agent UI use case: `motion.easeInOut`, opacity transitions, compact state changes, and reduced fallback fades where product policy allows them.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/

### `withSequence`

- Purpose: run animation objects one after another.
- Minimal example shape: sequence two or more timing/spring animation objects, optionally passing reduced-motion behavior.
- Constraints: avoid defaulting core UI to multi-step effects; explicit reduced-motion behavior is needed.
- Agent UI use case: rare validation feedback or small interaction accents, not primary screen transitions.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/

### `withDelay`

- Purpose: delay the start of an animation.
- Minimal example shape: wrap a timing or spring animation with a delay value and reduced-motion behavior.
- Constraints: delayed animations can make semantic state look stale; do not use delayed motion for agent-critical feedback.
- Agent UI use case: optional decorative staggering after semantic state is already committed.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/animations/withDelay/

### `useDerivedValue`

- Purpose: derive readonly shared values from other shared values or React state.
- Minimal example shape: compute derived progress or clamped values from an existing shared value.
- Constraints: derived values should be treated as readonly for normal use; web dependency arrays matter mainly without the Babel plugin.
- Agent UI use case: computed gesture phase, clamped progress, and coarse semantic motion state.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue/

### `runOnJS` and JS scheduling

- Purpose: call JavaScript-thread callbacks from UI-thread worklets.
- Minimal example shape: schedule a JS callback from a Reanimated completion or gesture handler.
- Constraints: keep this behind an internal adapter because Worklets docs are moving toward newer scheduling APIs; never emit high-frequency per-frame semantic events.
- Agent UI use case: send `animation_completed`, `animation_interrupted`, or `gesture_committed` events into the semantic registry.
- Source URL: https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS/

### Layout transitions

- Purpose: animate size and position changes caused by React layout updates.
- Minimal example shape: attach a layout transition builder such as `LinearTransition` to an `Animated` component.
- Constraints: builders expose modifiers such as duration, delay, callback, and `reduceMotion`; springified transitions should not combine incompatible easing modifiers; list layout animation has single-column constraints.
- Agent UI use case: `layoutTransition.smooth` for small, local stack/list/form changes.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/

### Entering and exiting animations

- Purpose: animate components as they mount and unmount.
- Minimal example shape: attach entering and exiting builders such as fade, slide, or zoom presets to an `Animated` component.
- Constraints: do not use mount/unmount animation as the source of truth for semantic visibility; React state and semantic registry updates should lead.
- Agent UI use case: `transition.opacity`, `transition.slide`, and `transition.scale`.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/

### Reduced motion APIs

- Purpose: honor device reduced-motion accessibility settings.
- Minimal example shape: set animation config `reduceMotion` to `ReduceMotion.System`, or read policy with `useReducedMotion`.
- Constraints: Reanimated docs state animations default to `ReduceMotion.System`; `useReducedMotion` is synchronous and does not rerender on system setting changes.
- Agent UI use case: central motion policy exposed to the semantic tree as enabled, reduced, or disabled.
- Source URL: https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/

## SwiftUI-Style Preset Mapping

| Agent UI preset | Reanimated primitive | Recommended config | Reduced motion behavior | Caveats | Source URL |
|---|---|---|---|---|---|
| `motion.spring()` | `withSpring` | Duration spring with critical damping, for example duration around 420 ms and `dampingRatio: 1`. | Use `ReduceMotion.System`; when reduced, reach final value immediately. | Taste mapping only, not exact SwiftUI parity. Allow overrides. | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/ |
| `motion.bouncy()` | `withSpring` | Physics spring with lower damping and overshoot allowed for small controls. | Disable bounce under reduced motion; snap or short fade. | Use sparingly; not for navigation-critical flows. | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/ |
| `motion.snappy()` | `withSpring` or `withTiming` | Short duration spring, for example 220-280 ms with modest underdamping, or timing for predictable UI. | Snap or reduce to a very short opacity-only change. | Requires device tuning. Do not market as SwiftUI-equivalent. | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/ |
| `motion.easeInOut({ duration })` | `withTiming` | Timing with provided duration or default around 250-300 ms and an in-out easing curve. | Snap or use product-approved short fade. | Best for opacity and small transforms. | https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/ |
| `transition.opacity` | Entering/exiting fade builders or shared-value opacity | 150-250 ms timing. | Usually snap; optional very short fade if policy allows. | Coordinate semantic visibility with mount state. | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ |
| `transition.slide` | Entering/exiting slide builders or transform translation | Translate on one axis with optional opacity, around 250-350 ms. | Remove translation; optional opacity only. | Avoid conflicting with navigation library transitions. | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ |
| `transition.scale` | Entering/exiting zoom builders or transform scale | Scale from near-final values such as 0.96 to 1, with optional opacity. | Disable scale under reduced motion. | Avoid large zooms as a default accessibility-safe effect. | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ |
| `layoutTransition.smooth` | `LinearTransition` or `FadingTransition`; optional springified variant | Default to duration around 250 ms and `ReduceMotion.System`. | Disable layout motion; commit final layout. | Keep to small, bounded local changes. | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/ |

## Layout Transition Strategy

Use Reanimated layout transitions only for bounded local changes: expanding a small section, inserting or removing a compact row, reordering a short stack, or moving a card within the same screen. `LinearTransition` should be the v0 default because it is predictable. `FadingTransition` can be safer for size changes that would otherwise look jumpy. Springified layout transitions should be opt-in.

Avoid layout transitions for full-screen navigation, keyboard-driven relayout, large virtualized lists, complex grid changes, and deep form rewrites. For lists, Reanimated's `itemLayoutAnimation` path has constraints, including single-column list caveats. Agent UI should keep list and form transitions conservative until example-app testing proves them.

Entering and exiting animations should be mapped separately from layout transitions. Mount/unmount presets should use Reanimated entering/exiting builders, while persistent components should use shared values and animated styles. Semantic tree updates should come from React state first; animation callbacks only report lifecycle events.

Semantic event hooks should be coarse:

- `animation_started`: emitted by wrapper code before assigning the animation.
- `animation_completed`: emitted when a completion callback reports success.
- `animation_interrupted`: emitted when callback state reports cancellation.
- `gesture_committed`: emitted after a gesture end condition chooses an action.
- `transition_committed`: emitted after React state and semantic tree revision are updated.

Do not emit per-frame semantic telemetry in v0.

## Gesture Strategy

Required packages: use React Native Gesture Handler for pan, drag, fling, pinch, rotation, and composed gestures. Use Reanimated shared values inside gesture callbacks for UI-thread motion. Keep `react-native-gesture-handler` as an optional peer/adapter dependency unless Stage 2 primitives require complex gestures by default.

Tap and press support should start with React Native `Pressable` for normal Agent UI controls. That keeps accessibility and semantic actions simple. Use Gesture Handler tap only for custom gesture surfaces where Pressable is insufficient.

Drag and swipe support should use `Gesture.Pan`, `GestureDetector`, and Reanimated shared values. Row swipe actions can use Gesture Handler/Reanimated components only after the semantic action model for swipe-reveal and destructive actions is explicit.

Gesture integration with semantics:

- Gesture start may emit a coarse `gesture_started` event.
- Gesture updates stay on the UI thread and should not flood the semantic registry.
- Gesture end classifies the outcome and dispatches a semantic action or cancellation event.
- Agent tool actions should call semantic dispatch directly, not synthesize gesture coordinates unless using external simulator fallback tooling.

Edge cases:

- Wrap the app root in `GestureHandlerRootView` as close to the root as possible.
- Add a `GestureHandlerRootView` inside Android modals when gestures are needed there.
- Keep gesture composition explicit with race/simultaneous/exclusive relationships.
- Treat web pointer behavior, text selection, and touch action as separate testing surfaces.

## Platform Caveats

iOS: Expo docs mark Reanimated and Gesture Handler as included in Expo Go. Bare iOS or development-build native changes require pods/rebuild. Reduced motion maps through Reanimated system policy and can also be checked through React Native accessibility APIs if needed.

Android: Reanimated 4 requires New Architecture/Fabric. Gesture Handler works in standard Expo setup, but Android modals need their own `GestureHandlerRootView` when using gestures inside modal content. Test scroll-bound animations on real Android devices.

Web: Reanimated 4 documents web support for many APIs, but non-Expo web setups may need Babel plugin configuration. Agent UI web motion should start with opacity and transform timing transitions.

Expo Go: Reanimated and Gesture Handler are included in Expo Go according to Expo package docs. Agent UI v0 motion should not require a custom native module.

Development builds: When native dependency versions change, rebuild the native app. Upstream Reanimated docs call out Expo prebuild and Community CLI Babel/pod setup.

New Architecture: Reanimated 4 is New Architecture only. Agent UI should make this a compatibility requirement for the Reanimated 4 motion layer.

Low-power and reduced motion: Reduced motion is the hard accessibility constraint. Low-power mode is not a Reanimated API contract; if Agent UI later reads battery/energy state, it should reduce decorative motion only as a product policy.

Debugging: Expo documents a Remote JS Debugging incompatibility for Reanimated with JavaScriptCore and recommends Hermes/JavaScript Inspector. Do not make motion debugging depend on Chrome remote debugging.

## Deferred Work

- Shared element transitions: Reanimated marks shared element transitions as experimental, so defer until navigation adapters are stable.
- Exact SwiftUI spring parity: v0 should expose taste mappings, not claim identical SwiftUI dynamics.
- Per-frame semantic telemetry: too noisy and expensive for agent control.
- Complex keyframe authoring: useful for examples later, not required for v0.
- Virtualized grid layout transitions: defer until list/grid semantics and performance tests exist.
- Navigation transition ownership: defer until Expo Router and React Navigation adapters are designed.
- Automatic motion performance diagnostics: start with presets, docs, tests, and examples.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Expo `react-native-reanimated` SDK docs | https://docs.expo.dev/versions/latest/sdk/reanimated/ | 2026-04-29 | Expo bundled Reanimated `4.2.1`, Expo install command, Worklets install, Expo Go support, automatic Babel plugin through `babel-preset-expo`, Remote JS Debugging caveat. |
| Expo `react-native-gesture-handler` SDK docs | https://docs.expo.dev/versions/latest/sdk/gesture-handler/ | 2026-04-29 | Expo bundled Gesture Handler `~2.30.0`, Expo install command, platform support, Expo Go inclusion. |
| Reanimated getting started | https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/ | 2026-04-29 | Reanimated 4 New Architecture requirement, Worklets dependency, Expo prebuild guidance, Community CLI Worklets Babel plugin, plugin ordering, web Babel caveat. |
| Reanimated compatibility table | https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/ | 2026-04-29 | Reanimated 4 New Architecture only, supported React Native ranges by Reanimated minor, Worklets compatibility by minor. |
| Reanimated `useSharedValue` and first animation docs | https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/ | 2026-04-29 | Shared values, assignment of animation objects, `.value` usage. |
| Reanimated `useAnimatedStyle` | https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle/ | 2026-04-29 | Animated style purpose and constraints. |
| Reanimated `useDerivedValue` | https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue/ | 2026-04-29 | Derived shared values and readonly behavior. |
| Reanimated `withSpring` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/ | 2026-04-29 | Spring config families, reduced-motion option, callback behavior, supported animatable values. |
| Reanimated `withTiming` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/ | 2026-04-29 | Timing config, easing, reduced-motion option, callback cancellation. |
| Reanimated `withSequence` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/ | 2026-04-29 | Sequenced animations and reduced-motion argument. |
| Reanimated `withDelay` | https://docs.swmansion.com/react-native-reanimated/docs/animations/withDelay/ | 2026-04-29 | Delayed animations and reduced-motion argument. |
| Reanimated layout transitions | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/ | 2026-04-29 | Layout transition builders, modifiers, callbacks, reduce-motion support. |
| Reanimated entering/exiting animations | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ | 2026-04-29 | Entering/exiting animation builders and modifiers. |
| Reanimated list layout animations | https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/list-layout-animations/ | 2026-04-29 | `itemLayoutAnimation` list caveats. |
| Reanimated accessibility | https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/ | 2026-04-29 | `ReduceMotion.System`, `Always`, `Never`, default system behavior, immediate final-value behavior under reduced motion. |
| Reanimated `useReducedMotion` | https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/ | 2026-04-29 | Synchronous reduced-motion query and rerender caveat. |
| React Native Worklets `runOnJS` | https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS/ | 2026-04-29 | JS-thread scheduling from UI-thread worklets and deprecation note. |
| React Native Gesture Handler installation | https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/ | 2026-04-29 | `GestureHandlerRootView`, Expo install/prebuild guidance, modal caveat, Reanimated/Worklets recommendation. |
| Gesture Handler Reanimated integration | https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/reanimated-interactions/ | 2026-04-29 | Reanimated shared values inside gesture callbacks and JS callback bridge considerations. |
| Gesture Handler gesture API | https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture/ | 2026-04-29 | `Gesture`, `GestureDetector`, tap, pan, long press, fling, pinch, rotation, and composition APIs. |
| npm metadata for Reanimated, Worklets, Gesture Handler, and Expo | `npm view react-native-reanimated`, `npm view react-native-worklets`, `npm view react-native-gesture-handler`, `npm view expo` | 2026-04-29 | npm latest versions, dist-tags, peer dependencies, and current Expo latest version `55.0.18`. |

## Final Recommendation

Stage 6 should implement a thin `packages/core/src/motion` layer over Reanimated 4. The package should expose SwiftUI-style names as taste presets over Reanimated primitives: spring, bouncy, snappy, ease-in-out, opacity/slide/scale transitions, and a conservative smooth layout transition. Every helper should default to `ReduceMotion.System` and report coarse semantic events only at start, completion, interruption, and gesture commit points.

The implementation should document two compatibility lanes. Expo-managed apps install through `npx expo install react-native-reanimated react-native-worklets` and rely on Expo's Babel preset. Bare/community apps must satisfy Reanimated 4 New Architecture requirements, install compatible Worklets, configure `react-native-worklets/plugin` last, and rebuild native dependencies. These lanes are not blockers; they are setup and doctor-check requirements.

DONE
