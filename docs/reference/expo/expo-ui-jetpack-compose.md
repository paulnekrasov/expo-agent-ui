# Expo UI Jetpack Compose Adapter Research

## Executive Summary

- `@expo/ui/jetpack-compose` is the Android-native Expo UI surface for rendering Jetpack Compose
  components from React Native.
- Stage 7 must build a Jetpack Compose adapter alongside the SwiftUI adapter. This is not a
  SwiftUI parity layer; it is the Android-native lane for the same Agent UI semantic contract.
- The adapter must import only explicit subpaths: `@expo/ui/jetpack-compose` and
  `@expo/ui/jetpack-compose/modifiers`.
- Expo documents Jetpack Compose as Android-only, alpha, unavailable in Expo Go, and
  development-build-only. Treat those facts as implementation gates, not as reasons to defer the
  Android adapter below SwiftUI.
- Every Compose tree must be wrapped in `Host`. Use `matchContents` only for intrinsic controls
  and explicit `style` sizing for flexible screens, lists, and scrollable content.
- Agent UI should use Material 3 and Jetpack Compose knowledge for Android component choices:
  buttons, text fields, switches, sliders, dialogs, sheets, chips, search, lazy lists, surfaces,
  rows, and columns should feel Android-native rather than iOS-translated.
- Semantic registration stays in JavaScript. Native Compose renders and emits callbacks; it is not
  the source of truth for agent IDs, actions, privacy, or redaction.
- The adapter should mirror semantic IDs into Compose testing metadata where supported, including
  the documented `testID(tag)` modifier, then verify the result in compiled fixtures.
- Android development builds and EAS Android builds are first-class for this lane. Repeated EAS
  Android builds should enable Gradle cache with `EAS_GRADLE_CACHE=1` and verify `FROM CACHE` in
  Run Gradle logs on later builds.
- Research is complete enough for Stage 7 planning. Remaining concerns are implementation gates:
  package export inspection, `.d.ts` checks, `Host` sizing, TalkBack propagation, fixture tests,
  Gradle cache verification, and fallback behavior.

## Package And Version Facts

| Package / import | Current status | Install command | Supported platform(s) | Source URL |
|---|---|---|---|---|
| `@expo/ui` | Expo UI package containing SwiftUI and Jetpack Compose native UI surfaces. Official SDK docs list bundled version `~55.0.12`. | `npx expo install @expo/ui` | Android, iOS, tvOS at package overview level. | https://docs.expo.dev/versions/latest/sdk/ui/ |
| `@expo/ui/jetpack-compose` | Android Jetpack Compose entrypoint. Expo labels it alpha, unavailable in Expo Go, and development-build-only. | `npx expo install @expo/ui` followed by an Android development rebuild. | Android. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `@expo/ui/jetpack-compose/modifiers` | Compose modifier entrypoint. Modifiers are ordered arrays passed through the `modifiers` prop. | Installed with `@expo/ui`. | Android. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| `Host` | Required container for rendering Compose views from React Native. | Imported from `@expo/ui/jetpack-compose`. | Android. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/ |
| EAS Android Gradle cache | EAS can cache Gradle task outputs between Android builds when `EAS_GRADLE_CACHE=1` is set. | Configure in EAS environment variables or in an `eas.json` build profile. | EAS Android builds. | https://expo.dev/changelog/gradle-cache |

## Android Adapter Principles

Use the repo-local Android ecosystem guidance as the review frame:

- Prefer modern Android UI decisions: Jetpack Compose, Material 3, stable state, predictable
  side effects, explicit semantics, and measured performance.
- Keep host components thin. Agent UI wrappers should translate props, semantics, callbacks, and
  fallbacks; business logic stays in app code.
- Use Android platform expectations for control selection. Do not mechanically translate SwiftUI
  components or iOS visual chrome into Compose.
- Treat accessibility as part of the adapter contract: labels, role-like behavior, state, values,
  touch targets, focus, TalkBack behavior, and test IDs must be verified in Android fixtures.
- Treat Gradle and EAS behavior as version-sensitive. Re-check official Expo and Android docs
  before changing exact Gradle, AGP, Kotlin, Compose BOM, target SDK, or Play policy claims.

## Host Model

`Host` is the React Native to Jetpack Compose boundary. Expo requires it around any component
imported from `@expo/ui/jetpack-compose`.

Recommended Agent UI sizing rules:

- Use `<Host matchContents>` for a single intrinsic native control, such as a small button, chip,
  switch, or text label.
- Use `<Host style={{ flex: 1 }}>` for flexible screens, list scopes, sheets, or any container that
  owns scrolling or fills available space.
- Do not hide `Host` sizing decisions inside vague defaults. Adapter components should choose a
  stable sizing policy per primitive and expose explicit escape hatches only when needed.
- Treat `Host` bounds as layout evidence only. Agent tools target semantic IDs first.

Semantic registration should happen before rendering the hosted native control. Pseudo-code shape:

```tsx
import { Host, Button } from "@expo/ui/jetpack-compose";
import { testID } from "@expo/ui/jetpack-compose/modifiers";

function AgentComposeButton({ id, label, onPress }) {
  registerWithCurrentAgentUISemanticRuntime({
    id,
    type: "button",
    label,
    actions: [{ name: "activate" }],
    privacy: { value: "none" },
  });

  return (
    <Host matchContents>
      <Button onClick={onPress} modifiers={[testID(id)]}>
        {label}
      </Button>
    </Host>
  );
}
```

This example shows the intended shape only; it is not a public API contract. During
implementation, use the current Agent UI semantic registration helper, then read the installed
`.d.ts` files and the matching Expo docs before using each component or modifier.

## Android Build And Launch Lane

Compose UI is unavailable in Expo Go, so the adapter requires Android development builds.

Recommended local lane:

```sh
npx expo install @expo/ui
npx expo run:android
npx expo start --dev-client
```

Recommended EAS profile shape for repeated Android adapter builds:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "env": {
        "EAS_GRADLE_CACHE": "1"
      }
    }
  }
}
```

Operational rules:

- Use Expo development builds for Compose adapter smoke tests.
- Use Android Emulator, Android device, or cloud Android worker as the runtime. Do not imply that
  an iOS simulator can render Compose.
- After enabling EAS Gradle cache, the first build creates cache entries and later builds should
  show `FROM CACHE` for reused Gradle tasks in the Run Gradle step.
- Cache keys are based on the package manager lockfile, so dependency changes should naturally
  refresh the cache.
- Gradle cache is build acceleration only. It does not replace typecheck, tests, fixture builds,
  accessibility checks, or runtime smoke tests.

## Component API Table

| Component | Import path | Agent UI primitive mapping | Caveats | Source URL |
|---|---|---|---|---|
| `Host` | `@expo/ui/jetpack-compose` | Private adapter boundary | Required for Compose components. Choose `matchContents` or explicit sizing deliberately. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/ |
| `RNHostView` | `@expo/ui/jetpack-compose` | Reverse bridge for React Native content inside Compose scopes | Use only when React Native content intentionally nests inside a Compose surface. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `Button`, `FilledTonalButton`, `OutlinedButton`, `ElevatedButton`, `TextButton` | `@expo/ui/jetpack-compose` | `Button` variants | Good first adapter targets. Proxy callbacks into Agent UI actions and mirror semantic labels. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/ |
| `Text` | `@expo/ui/jetpack-compose` | Internal native text inside hosted scopes | Core `Text` stays React Native by default; use Compose text inside native Android adapter scopes. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/ |
| `TextField` | `@expo/ui/jetpack-compose` | `TextField`, `SecureField` with adapter policy | Verify controlled behavior, IME behavior, focus, submit, and redaction in Android fixtures. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/textfield/ |
| `Switch` / `Checkbox` / `RadioButton` | `@expo/ui/jetpack-compose` | `Toggle`, checkbox-like picker options | Map checked state, disabled state, and action availability into semantic state. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `Slider` | `@expo/ui/jetpack-compose` | `Slider` | Must expose min/max/now semantics and reject out-of-range agent actions. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/slider/ |
| `Column`, `Row`, `Box`, `Spacer` | `@expo/ui/jetpack-compose` | Native stack/surface internals | Use for hosted native scopes. Core stack primitives stay React Native-first. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `LazyColumn` | `@expo/ui/jetpack-compose` | Native list scope | High-value Android target, but requires explicit sizing, stable keys, visible item semantics, and accessibility verification. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/lazycolumn/ |
| `ListItem`, `Surface`, `Card`, `Chip` | `@expo/ui/jetpack-compose` | Section rows, cards, chips, labels | Use Material 3 semantics and touch targets. Keep agent action IDs stable. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `AlertDialog`, `BasicAlertDialog`, `ModalBottomSheet`, `Tooltip`, `DropdownMenu`, `ContextMenu` | `@expo/ui/jetpack-compose` | Presentation/menu adapters | Requires semantic presentation state, dismissal actions, focus scope, and redaction checks. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `SearchBar`, `DockedSearchBar` | `@expo/ui/jetpack-compose` | Search/input adapter | Verify text input, result selection, IME, and accessibility behavior before public exposure. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `Icon`, `IconButton` | `@expo/ui/jetpack-compose` | `Icon`, icon button | Expo skill guidance prefers Android XML vector drawables for Compose icons. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |

## Modifier API Table

| Modifier area | Import path | Agent UI use | Caveats | Source URL |
|---|---|---|---|---|
| Spacing and size: `paddingAll`, `padding`, `size`, `fillMaxSize`, `fillMaxWidth`, `width`, `height` | `@expo/ui/jetpack-compose/modifiers` | Map Agent UI spacing/sizing intent into Compose modifiers | Modifier order affects output. Keep conversion adapter-local. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| Appearance: `background`, `border`, `shadow`, `alpha`, `blur` | `@expo/ui/jetpack-compose/modifiers` | Native Material visual chrome | Visual modifiers must not determine semantic visibility or action availability. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| Transform and layout: `offset`, `rotate`, `zIndex`, `weight`, `align` | `@expo/ui/jetpack-compose/modifiers` | Native layout tuning inside hosted scopes | Avoid making root Agent UI layout depend on Compose-only behavior. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| Animation: `animateContentSize` | `@expo/ui/jetpack-compose/modifiers` | Native Android polish inside Compose adapter | Core motion remains Reanimated. Do not replace Stage 6 motion semantics. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| Interaction: `clickable`, `selectable`, `testID` | `@expo/ui/jetpack-compose/modifiers` | Callback hooks and semantic ID projection | Verify `testID(tag)` in compiled fixtures and automation tools. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |

## Adapter Design Recommendation

Package boundary:

- `@agent-ui/expo` contains React Native-first primitives, semantic registry, accessibility mapping,
  motion hooks, and tool bridge integration.
- `@agent-ui/expo/swift-ui` contains all SwiftUI imports.
- `@agent-ui/expo/jetpack-compose` contains all Jetpack Compose imports.
- The root package must not import or re-export either native adapter entrypoint.

Public imports:

- Core app code imports stable primitives from `@agent-ui/expo`.
- Android-native app code imports Compose-backed primitives from `@agent-ui/expo/jetpack-compose`.
- Unsupported platforms, Expo Go, and missing `@expo/ui` must use React Native fallbacks with
  development warnings.

First adapter targets:

- `Button` variants,
- `TextField` and secure text input policy,
- `Switch` / checkbox-like toggles,
- `Slider`,
- `Column`, `Row`, `Box`, and `Spacer` inside hosted scopes,
- one native list scope using `LazyColumn` or `ListItem`,
- one presentation scope such as `AlertDialog` or `ModalBottomSheet`.

Do not expose a component publicly until it has semantic registration tests, fallback tests, and at
least one Android development-build fixture check.

## Testing Strategy

- Unit-test prop-to-adapter mapping without rendering native modules.
- Unit-test modifier array construction, including `testID(id)` projection.
- Test semantic registration and fallback rendering with React Native Testing Library.
- Add package-resolution tests proving root imports work without `@expo/ui` installed.
- Add Android development-build smoke tests for `Host`, `Button`, `TextField`, `Switch`, `Slider`,
  `LazyColumn`, and one presentation component.
- Validate TalkBack label, state, value, focus, and touch target behavior in compiled fixtures.
- Validate that the same semantic node IDs appear in the JavaScript registry and native adapter
  test identifiers where supported.
- For EAS Android builds, verify the `EAS_GRADLE_CACHE=1` profile and record `FROM CACHE` evidence
  from a later Run Gradle log before claiming cache behavior.

## Unsupported Or Unknown Areas

Stable constraints:

- `@expo/ui/jetpack-compose` is alpha and may change frequently.
- Compose UI is Android-only and unavailable in Expo Go.
- Compose requires a development build.
- Compose components and modifiers are Android-native, not SwiftUI-compatible APIs.

Implementation unknowns to verify:

- Exact installed `.d.ts` exports for every selected component and modifier.
- Controlled text input and secure field behavior across IME and focus transitions.
- Direct accessibility propagation from Compose-backed components inside `Host`.
- Native `testID(tag)` visibility to the intended automation tools.
- `Host` sizing for nested rows/columns, lazy lists, sheets, and scroll boundaries.
- Whether any Agent UI-owned custom native Kotlin/Compose extension is needed after built-in Expo
  UI components are tested.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Expo UI SDK overview | https://docs.expo.dev/versions/latest/sdk/ui/ | 2026-04-30 | Expo UI package contains native UI surfaces including Jetpack Compose and SwiftUI; bundled version family. |
| Jetpack Compose - Expo Documentation | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ | 2026-04-30 | Android-only Compose entrypoint, alpha status, Expo Go limitation, development-build requirement, `Host` usage, bundled `~55.0.12`. |
| Host - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/host/ | 2026-04-30 | Compose `Host` boundary and sizing props. |
| Modifiers - Jetpack Compose | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ | 2026-04-30 | Ordered modifier arrays, sizing, appearance, interaction, animation, and `testID` modifier surface. |
| Expo UI Jetpack Compose skill | `docs/reference/agent/platform-skills/expo-skill/references/expo-ui-jetpack-compose.md` | 2026-04-30 | Repo-local Expo skill guidance: install command, native rebuild, `Host`, `.d.ts` verification, Material 3/Compose knowledge. |
| Android Gradle and Build Engineering skill | `docs/reference/agent/platform-skills/android-ecosystem-skill/references/gradle-build-engineering.md` | 2026-04-30 | Android build guidance: deterministic Gradle, build cache, version volatility, release/build review gates. |
| Gradle cache for Android builds | https://expo.dev/changelog/gradle-cache | 2026-04-30 | `EAS_GRADLE_CACHE=1`, lockfile-derived cache keys, Gradle task outputs marked `FROM CACHE`. |

## Final Recommendation

Stage 7 should implement `@agent-ui/expo/jetpack-compose` as the Android-native peer to
`@agent-ui/expo/swift-ui`. Keep core Agent UI React Native-first and semantic-first, but build the
Compose lane as a real adapter, not a future note. The adapter should wrap selected Material 3
controls in `Host`, project stable semantic IDs through JavaScript registry metadata and
Compose-supported test identifiers, mirror accessibility state where possible, and fall back to
React Native on unsupported platforms, Expo Go, or missing peers. Android development builds are
required; EAS Android profiles should opt into Gradle cache for repeated native adapter builds and
verify `FROM CACHE` in build logs.

DONE_WITH_CONCERNS
