# Cross-Platform Adapter Research

## Executive Summary
- Agent UI v0 should not depend on Android-native or web-native adapters; keep React Native primitives plus the semantic registry as the shared baseline.
- `@expo/ui/jetpack-compose` is Android-only, alpha, and explicitly subject to breaking changes, so it is a post-v0 optional adapter, not a core dependency. The current Expo docs list bundled version `~55.0.12` (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-29).
- Expo UI requires a platform `Host` boundary for native UI: `@expo/ui/jetpack-compose` components must be wrapped in `Host`, and SwiftUI also crosses through `Host` (sources: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ and https://docs.expo.dev/guides/expo-ui-swift-ui/, accessed 2026-04-27).
- Compose support is Material 3 / Jetpack Compose shaped, while SwiftUI support is SwiftUI shaped; Agent UI should abstract semantic roles, state, actions, IDs, and layout intent, not native component APIs.
- Compose modifiers use a `modifiers` prop and ordered array, similar enough to SwiftUI modifiers for a shared Agent UI modifier intent layer, but the concrete modifier functions and platform behavior must remain adapter-specific (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/, accessed 2026-04-29).
- Expo web uses React Native Web and `react-dom`; React Native Web maps `View`, `Text`, and accessibility props to DOM elements and ARIA, which is sufficient for a semantic registry on web (sources: https://docs.expo.dev/workflow/web/ and https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27).
- Web adapter semantics should prefer native semantic HTML through React Native Web role inference where available, then ARIA props where no native element exists (sources: https://necolas.github.io/react-native-web/docs/accessibility/ and https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA, accessed 2026-04-27).
- Stable semantic IDs, action descriptors, state snapshots, accessibility props, and flow events can be shared across iOS, Android, React Native fallback, and web.
- Native `Host` sizing, Material/SwiftUI visual styling, keyboard behavior, modifier functions, and platform control variants should remain adapter-specific.
- Platform-specific adapter work should load `docs/reference/agent/platform-skill-routing.md` and
  the repo-local skill library under `docs/reference/agent/platform-skills/` before making Android,
  Apple, native accessibility, or native polish claims.
- EAS Build can compile iOS SwiftUI artifacts on Expo macOS cloud infrastructure, but this does not
  make SwiftUI renderable inside an Android Emulator or a Windows-local iOS Simulator. Live native
  preview remains platform-bound.
- Side-by-side native comparison should connect separate runtime sessions, for example iOS
  SwiftUI on an iOS simulator/device/remote Mac and Android Compose on an Android
  emulator/device/cloud worker.
- Explicitly defer cloud flow recording, screenshot comparison, custom native component layers, and full parity between SwiftUI and Compose adapters until after the semantic runtime and local tools are stable.
- Remaining concerns are now implementation gates, not research gaps: verify Compose `Host` accessibility propagation with TalkBack/native tree inspection, verify adapter sizing in fixture screens, and regenerate the component/export list from the installed `@expo/ui` package before coding.

## Expo UI Android / Compose Findings

Expo UI currently exposes Android-native Jetpack Compose components through `@expo/ui/jetpack-compose`, installed via `npx expo install @expo/ui` (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-29). The package page identifies the latest bundled version as `~55.0.12`, Android-only, alpha, and unavailable in Expo Go; development builds are required (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-29).

Imports use platform-specific entrypoints, for example:

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';
import { paddingAll, fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
```

Every Compose component must be wrapped in `Host`, which is the React Native to Jetpack Compose boundary (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-29). `Host` supports React Native `style`, `matchContents`, `colorScheme`, `layoutDirection`, keyboard-inset behavior, viewport-size measurement, and `onLayoutContent` for Compose content dimensions (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/, accessed 2026-04-29).

The documented Compose API surface includes Material 3-flavored controls and primitives. Current official pages document Button variants (`Button`, `FilledTonalButton`, `OutlinedButton`, `ElevatedButton`, `TextButton`), `Text`, `Spacer`, `Surface`, `Shape`, `ContextMenu`, `Chip`, `AlertDialog`, `Carousel`, `SegmentedButton`, `ToggleButton`, and other component pages visible in the Expo UI Jetpack Compose documentation set (sources: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/, https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/, https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/spacer/, https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/surface/, accessed 2026-04-27). NEEDS_VERIFICATION: the exact complete component list should be regenerated from Expo's `llms-full.txt` or package exports during implementation because the docs are evolving.

The Compose modifier model is ordered and array-based: Expo documents `modifiers={[...]}` and notes that order can affect output, such as padding before background versus the reverse (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/, accessed 2026-04-29). Modifier categories include padding, size, position, appearance, transform, animation, layout, interaction, and utility. Examples include `paddingAll`, `fillMaxWidth`, `background`, `border`, `shadow`, `alpha`, `rotate`, `zIndex`, `animateContentSize`, `weight`, `align`, `clickable`, `selectable`, and `testID` (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/, accessed 2026-04-29). The documented `testID(tag)` modifier gives Agent UI a concrete adapter hook for projecting semantic IDs into Compose-backed test identifiers, but it does not by itself prove screen-reader semantics inside the native `Host`.

The Compose adapter model differs from the SwiftUI adapter model in native design language and component vocabulary. Expo's SwiftUI guide says SwiftUI components have a 1-to-1 mapping to SwiftUI views and use `Host` to cross from React Native/UIKit to SwiftUI (source: https://docs.expo.dev/guides/expo-ui-swift-ui/, accessed 2026-04-27). Compose pages emphasize Material 3 components and Jetpack Compose APIs, not SwiftUI parity (sources: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/ and https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/, accessed 2026-04-27). Therefore, Agent UI should not promise that a SwiftUI `VStack`/modifier expression maps mechanically to Compose.

Limitations:
- Alpha status and frequent breaking changes make Compose unsafe as an MVP foundation (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-27).
- Expo Go is not supported for Compose UI; development builds are required (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-27).
- `Host` creates a native boundary with sizing and layout behavior Agent UI must handle explicitly (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/, accessed 2026-04-27).
- Compose has a documented `testID(tag)` modifier for UI-testing identifiers (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/, accessed 2026-04-29).
- NEEDS_VERIFICATION: accessibility role, state, value, and label propagation through Compose-backed Expo UI components is not sufficiently documented in the pages reviewed; implementation should validate TalkBack output, native accessibility metadata, and Maestro/Appium selector visibility in compiled fixtures.

Source URLs:
- https://docs.expo.dev/versions/latest/sdk/ui/
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/
- https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/
- https://docs.expo.dev/guides/expo-ui-swift-ui/

## Web / DOM Findings

Expo's web path is React Native Web plus React DOM. Expo's web guide says React Native Web provides components such as `View` and `Text` that wrap `react-dom` primitives such as `div`, `p`, and `img`, and recommends RNW for cross-platform code reuse while allowing direct React DOM use (source: https://docs.expo.dev/workflow/web/, accessed 2026-04-27). Expo web dependencies are installed with `npx expo install react-dom react-native-web @expo/metro-runtime` (source: https://docs.expo.dev/workflow/web/, accessed 2026-04-27).

React Native Web supports familiar web accessibility APIs and keeps compatibility with React Native-specific `accessibility*` props (source: https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27). It exposes ARIA props such as `aria-busy`, `aria-checked`, `aria-disabled`, `aria-expanded`, `aria-hidden`, `aria-label`, `aria-labelledby`, `aria-live`, `aria-modal`, `aria-pressed`, `aria-selected`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, and `role` (source: https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27).

React Native Web can render semantic HTML from role hints. Its docs state that `role` can infer analogous HTML elements where appropriate, such as `article`, `paragraph`, and headings with `aria-level`; it also warns against changing roles over time because accessibility APIs generally do not notify assistive technologies of role changes (source: https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27).

The semantic registry can work on web by treating DOM output as another projection of the same semantic tree:
- `id` / `nativeID` / DOM `id` for stable targeting.
- `role` for purpose.
- `aria-label` / `aria-labelledby` for label.
- `aria-disabled`, `aria-selected`, `aria-checked`, `aria-expanded`, and `aria-busy` for state.
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` for range values.
- `tabIndex` for keyboard focus, because React Native Web says it should be used instead of native `accessible` / `focusable` on web (source: https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27).

React Native core accessibility props still matter because the shared fallback layer should run on native platforms too. React Native documents `accessibilityRole`, `accessibilityState`, `accessibilityValue`, `role`, and `accessibilityActions`; `role` takes precedence over `accessibilityRole`, and accessibility actions require both `accessibilityActions` and `onAccessibilityAction` (source: https://reactnative.dev/docs/0.84/accessibility, accessed 2026-04-27).

ARIA should be used carefully. MDN states ARIA supplements HTML when there is no native mechanism, recommends native semantic HTML first, and warns that incorrect ARIA can make accessibility worse (source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA, accessed 2026-04-27). Agent UI's web adapter should therefore prefer React Native Web's semantic element inference and native form controls where available, using ARIA as a structured metadata projection rather than a blanket replacement for HTML semantics.

Limitations:
- Web keyboard/focus behavior is not equivalent to native touch and screen-reader behavior; flow tools must test web separately.
- React Native Web's `accessible` behavior differs from React Native native platforms; web code should use `tabIndex` and ARIA/role mapping intentionally (source: https://necolas.github.io/react-native-web/docs/accessibility/, accessed 2026-04-27).
- Native mobile-only semantics such as some iOS/Android accessibility actions do not have exact DOM equivalents (source: https://reactnative.dev/docs/0.84/accessibility, accessed 2026-04-27).
- NEEDS_VERIFICATION: Expo DOM components were referenced by Expo's SwiftUI guide as mixable with Expo UI components, but this LOW-01 pass did not inspect current DOM component APIs deeply enough to recommend a DOM-component adapter.

Source URLs:
- https://docs.expo.dev/workflow/web/
- https://necolas.github.io/react-native-web/docs/accessibility/
- https://reactnative.dev/docs/0.84/accessibility
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA

## Shared Adapter Abstraction

Platform-neutral Agent UI surface:
- Semantic node identity: stable `id`, optional `testID`, optional DOM/native ID projection.
- Semantic metadata: `role`, `label`, `intent`, `screen`, `state`, `value`, `actions`, `children`, and redacted `props`.
- Action contract: `tap`, `input`, `scroll`, `navigate`, `wait_for`, `run_flow`, and `collect_events` as semantic operations.
- Accessibility projection: map the same semantic role/state/value into React Native accessibility props and React Native Web ARIA props.
- Modifier intent: spacing, sizing, visibility, disabled, selected, busy, value, and interaction intent as a small adapter-neutral IR.
- Event model: mount, unmount, state change, action start/end, validation result, and animation start/end.
- Fallback rendering: ordinary React Native primitives must remain the universal baseline.
- Runtime-session identity: `sessionId`, `platform`, `adapter`, `buildId`, `device`, `screen`,
  `capabilities`, and `unsupportedReasons` so a visual editor can compare native sessions without
  pretending they share one simulator.

Adapter-specific surface:
- Native `Host` insertion and sizing for SwiftUI and Compose.
- SwiftUI versus Compose component selection.
- Platform modifier function calls and ordering details.
- Material 3 versus iOS visual defaults.
- Keyboard, safe-area, focus, and accessibility behavior inside native hosts.
- Platform-specific controls such as Material chips/carousels or SwiftUI-only effects.
- Web-only semantic HTML choices and ARIA edge cases.

Recommended architecture:
- Keep `@agent-ui/expo` core independent of `@expo/ui`.
- Add optional subpath adapters such as `@agent-ui/expo/swift-ui`, `@agent-ui/expo/compose`, and `@agent-ui/expo/web`.
- Let adapters consume the same semantic registration hooks and expose explicit capability flags.
- Return structured `UNSUPPORTED_PLATFORM`, `UNSUPPORTED_COMPONENT`, or `HOST_REQUIRED` diagnostics when a semantic component cannot use the requested native adapter.
- Treat adapter switching as a per-runtime capability. On iOS, switch between React Native
  fallback and SwiftUI. On Android, switch between React Native fallback and Compose. The editor
  can show both by connecting two runtimes side by side.

## Native Preview And EAS Boundaries

EAS changes the build constraint, not the platform runtime constraint. Expo documents EAS Build as
a hosted service for Android and iOS binaries, with iOS builds running on Expo macOS cloud
infrastructure and Android builds running on Linux infrastructure
(https://docs.expo.dev/build/introduction/ and https://docs.expo.dev/build-reference/infrastructure/,
accessed 2026-04-27). This means a Windows or Linux developer can produce an iOS SwiftUI build
artifact without a local Mac.

Running that artifact interactively still requires an iOS runtime. Expo's iOS Simulator build docs
describe `ios.simulator: true`, installation with EAS CLI or Expo Orbit, and then using the
development server for development builds (https://docs.expo.dev/build-reference/simulators and
https://docs.expo.dev/tutorial/eas/ios-development-build-for-simulators/, accessed 2026-04-27).
Agent UI should therefore distinguish:

- cloud build artifact: EAS can create it;
- live local/remote runtime: simulator, device, remote Mac, or cloud workflow is still required;
- visual editor comparison: a multi-session surface over connected runtimes, not one universal
  emulator.

EAS Workflows can run iOS jobs including simulators on macOS workers and Android Emulator jobs on
Linux nested-virtualization workers (https://docs.expo.dev/eas/workflows/syntax/, accessed
2026-04-27). That makes automated screenshot/video/test capture plausible for Stage 9+, but it
should stay separate from the core v0 semantic runtime.

## 2026-04-29 Verification Update

`$deep-research` was attempted for this follow-up, but both a full-context interaction and a
narrower verification interaction failed to return a saved report within the local script timeout.
The edits in this pass therefore use directly rechecked official sources rather than unsaved
partial stream output.

Verified updates:

- Expo's current Jetpack Compose docs still label the surface `ALPHA`, unavailable in Expo Go,
  and development-build-only; they list bundled version `~55.0.12` and require `Host` around
  `@expo/ui/jetpack-compose` components (https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/,
  accessed 2026-04-29).
- Expo's Compose modifier docs explicitly document ordered `modifiers` arrays and a `testID(tag)`
  utility modifier for UI testing identifiers (https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/,
  accessed 2026-04-29). This resolves the earlier uncertainty about whether semantic IDs have an
  official projection hook in the Compose adapter.
- Expo web still documents React Native Web as wrapping React DOM primitives and recommends
  installing `react-dom`, `react-native-web`, and `@expo/metro-runtime` for web support
  (https://docs.expo.dev/workflow/web/, accessed 2026-04-29).
- React Native Web's accessibility docs explicitly say `tabIndex` should be used for keyboard
  focus instead of React Native native `accessible`/`focusable`, and that components express
  semantics through `aria-*` props (https://necolas.github.io/react-native-web/docs/accessibility/,
  accessed 2026-04-29).
- EAS Workflows syntax documents Linux nested-virtualization workers for Android Emulator jobs
  and macOS workers for iOS jobs including simulators, but this remains cloud workflow execution,
  not a local single-runtime preview that can render both Android Compose and iOS SwiftUI
  (https://docs.expo.dev/eas/workflows/syntax/, accessed 2026-04-29).

Resolved concern:

- Semantic ID projection for Compose is no longer just a guess: use the documented
  `testID(tag)` modifier from the optional Compose adapter.

Remaining implementation gates:

- Compile a fixture app and confirm `testID(tag)` is visible to the intended automation tools.
- Validate TalkBack role/label/state/value behavior for Compose-backed controls inside `Host`.
- Validate `Host` sizing and `matchContents` behavior for nested stacks, list-like content, and
  scroll boundaries.
- Regenerate the exact component/export list from the installed `@expo/ui` package at adapter
  implementation time because the alpha docs can change.

## Platform Feature Matrix

| Feature | iOS SwiftUI adapter | Android Compose adapter | React Native fallback | Web DOM adapter | Recommendation |
|---|---|---|---|---|---|
| Semantic IDs | Project to native wrapper/test IDs where possible | Project to wrapper/test IDs; validate inside `Host` | Use `id` plus `testID`/`nativeID` | Use DOM `id` and RNW role/ARIA | Shared core requirement for all platforms |
| Semantic roles | Map to RN accessibility and native adapter metadata where supported | NEEDS_VERIFICATION for direct Compose metadata propagation | Use `role` / `accessibilityRole` | Use `role` and semantic HTML inference | Shared role vocabulary, adapter-specific projection |
| State (`disabled`, `selected`, `checked`, `busy`, `expanded`) | Map to SwiftUI/RN props where available | Map to Material controls and RN wrapper state; NEEDS_VERIFICATION inside Host | Use `accessibilityState` | Use ARIA state props | Shared semantic state object |
| Values for sliders/progress | Map to native control value plus accessibility value | Map to Material control value plus accessibility value | Use `accessibilityValue` | Use `aria-valuemin/max/now/text` | Shared range-value schema |
| Actions | Native control callbacks and semantic dispatcher | Native control callbacks and semantic dispatcher | Press/input/scroll callbacks | Click/input/focus/keyboard callbacks | Shared action contract; platform-specific event plumbing |
| Layout stacks | SwiftUI `VStack`/`HStack` where adapter is active | Compose `Column`/`Row` where adapter is active | RN `View` with flexbox | RNW `View` / DOM flexbox | Core primitives should default to RN; native adapters opt in |
| Modifiers | `@expo/ui/swift-ui/modifiers` | `@expo/ui/jetpack-compose/modifiers` | Style props and RN transforms | Style props, CSS, ARIA | Keep neutral modifier IR small; no full parity promise |
| Native Host | Required for SwiftUI components | Required for Compose components | Not needed | Not needed for RNW | Hide Host in adapter components only when sizing semantics are clear |
| Expo Go support | NEEDS_VERIFICATION for current SwiftUI support | Not supported for Compose per Expo docs | Supported when dependencies are Expo Go compatible | Supported in browser build/dev | Compose adapter must require dev build |
| Web semantics | Not applicable | Not applicable | RNW can render fallback components | DOM/ARIA plus semantic HTML | Web is a first-class fallback target, not a native UI adapter |
| Visual parity | iOS-native | Android Material-native | Cross-platform but less native | Browser-native | Prioritize semantic parity over visual parity |
| MVP readiness | Optional for iOS native fidelity | Defer | Required baseline | Useful after core semantic runtime | v0 ships RN fallback and iOS adapter first; Compose/web adapters post-v0 |

## Deferred Work

- Full Android Compose adapter: deferred because `@expo/ui/jetpack-compose` is alpha, breaking-change-prone, and unavailable in Expo Go (source: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-27).
- Direct Compose accessibility verification: deferred until there is an implementation prototype with TalkBack testing and native tree inspection.
- Full Web DOM adapter: deferred until the semantic registry and React Native fallback components stabilize; web should initially inherit RNW output.
- Expo DOM component adapter: deferred because this pass did not inspect the current API deeply enough; NEEDS_VERIFICATION.
- Pixel/visual parity between SwiftUI, Compose, RN, and web: deferred because the product goal is semantic agent control, not a new cross-platform design framework.
- Live side-by-side native visual editor: deferred until bridge sessions, adapter capability flags,
  redaction, and local flow capture are implemented.
- Cloud flow recording and replay: deferred until local semantic flow execution is stable.
- Screenshot comparison: deferred because the rebuild plan explicitly avoids screenshot/coordinate-first control.
- Custom native component layer: deferred unless Expo UI or RN primitives cannot expose a required semantic or control capability.

## Source Index

| Title | URL | Access Date | Supported Claim |
|---|---|---|---|
| Expo UI | https://docs.expo.dev/versions/latest/sdk/ui/ | 2026-04-27 | Expo UI provides native input components for Jetpack Compose and SwiftUI; available platforms include Android and iOS/tvOS. |
| Jetpack Compose - Expo Documentation | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ | 2026-04-27 | Compose entrypoint, Android platform support, alpha status, development-build requirement, `Host` requirement, bundled version. |
| Host - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/ | 2026-04-27 | Compose `Host` props, sizing behavior, style support, layout callbacks, keyboard inset behavior. |
| Modifiers - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ | 2026-04-27 | Compose modifier array model, modifier ordering, modifier categories and examples. |
| Button - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/ | 2026-04-27 | Material 3 button variants and API shape. |
| Text - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/ | 2026-04-27 | Compose Text component, typography, nested text, text style API. |
| Building SwiftUI apps with Expo UI | https://docs.expo.dev/guides/expo-ui-swift-ui/ | 2026-04-27 | SwiftUI `Host`, component-level integration, SwiftUI mapping, mixing React Native, Expo UI, DOM, and Skia components. |
| EAS Build | https://docs.expo.dev/build/introduction/ | 2026-04-27 | EAS creates Android/iOS binaries and iOS builds run on Expo macOS cloud while Android builds run on Linux infrastructure. |
| EAS Build infrastructure | https://docs.expo.dev/build-reference/infrastructure/ | 2026-04-27 | Build images and worker infrastructure for Android/Linux and iOS/macOS builds. |
| Build for iOS Simulators | https://docs.expo.dev/build-reference/simulators | 2026-04-27 | iOS simulator build profile, install flow, and development-server requirement for dev builds. |
| EAS Workflows syntax | https://docs.expo.dev/eas/workflows/syntax/ | 2026-04-27 | macOS workers for iOS jobs including simulators and Linux nested-virtualization workers for Android Emulators. |
| Develop websites with Expo | https://docs.expo.dev/workflow/web/ | 2026-04-27 | Expo web dependencies, React Native Web role in Expo web, RNW wrapping React DOM primitives. |
| React Native for Web Accessibility | https://necolas.github.io/react-native-web/docs/accessibility/ | 2026-04-27 | RNW accessibility and ARIA props, role-to-HTML behavior, `tabIndex`, semantic HTML inference, role-change warning. |
| React Native Accessibility | https://reactnative.dev/docs/0.84/accessibility | 2026-04-27 | React Native `role`, `accessibilityRole`, `accessibilityState`, `accessibilityValue`, and accessibility action contracts. |
| MDN ARIA | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA | 2026-04-27 | ARIA purpose, native semantic HTML preference, risk of bad ARIA, ARIA roles/states/properties. |

## Final Recommendation

Ship Agent UI v0 on a platform-neutral semantic runtime and React Native fallback primitives, with optional iOS SwiftUI adapter support where it improves native fidelity. Treat Android Compose and Web DOM as post-v0 adapter packages that consume the same semantic registry and action contract. Compose should remain experimental until `@expo/ui/jetpack-compose` is no longer alpha or the project accepts a development-build-only Android path. Web should initially rely on React Native Web's accessibility and semantic HTML mapping, then add a dedicated DOM adapter only for web-specific improvements such as native form semantics, landmark roles, keyboard focus management, and browser automation integration.

For native visual comparison, use EAS to reduce build friction but keep runtime truth
platform-bound. The final side-by-side model is two connected sessions: iOS SwiftUI on an iOS
runtime and Android Compose on an Android runtime, compared by semantic IDs and adapter
capabilities in a development-only editor.

DONE_WITH_CONCERNS
