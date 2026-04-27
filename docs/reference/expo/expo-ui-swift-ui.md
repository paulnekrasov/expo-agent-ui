# Expo UI SwiftUI Adapter Research

## Executive Summary
- `@expo/ui` is the package name. Current official SDK docs and npm metadata agree on `~55.0.12` / `55.0.12` for Expo SDK 55.
- `@expo/ui/swift-ui` is beta, iOS/tvOS-focused, unavailable in Expo Go, and intended for development builds. These are stable design constraints, not research blockers.
- Project update, 2026-04-26: Expo UI's SwiftUI extension path now gives Agent UI a supported
  way to create custom native SwiftUI components and custom modifiers while staying inside Expo.
  This strengthens the optional iOS adapter path without changing the core React Native-first
  scope.
- If a host app already uses custom `@expo/ui/swift-ui` views or modifiers, Agent UI should adapt
  around that code seamlessly: preserve the native surface, pass through custom modifiers, and add
  semantic wrappers at the JavaScript boundary.
- The published `@expo/ui@55.0.12` package has no root `"."` export. Agent UI should import only explicit subpaths such as `@expo/ui/swift-ui`, `@expo/ui/swift-ui/modifiers`, `@expo/ui/jetpack-compose`, and `@expo/ui/datetimepicker`.
- `Host` is the required boundary for rendering SwiftUI views from React Native. It bridges UIKit/React Native layout to SwiftUI through `UIHostingController`.
- `RNHostView` is the reverse bridge for React Native children inside SwiftUI containers such as `BottomSheet`, `Popover`, and stack views.
- Custom SwiftUI components are exposed through Expo native view modules and required from
  JavaScript with `requireNativeView`.
- Custom SwiftUI modifiers are registered with Expo UI's native modifier registry and exposed to
  JavaScript through `createModifier`.
- SwiftUI layout and React Native Yoga layout do not fully collapse into one model. `matchContents`, explicit `style`, `onLayoutContent`, and `useViewportSizeMeasurement` must be chosen per component.
- Agent UI should keep `@expo/ui` optional and isolated behind `@agent-ui/expo/swift-ui` or an equivalent explicit adapter package/subpath.
- Core Agent UI primitives should remain React Native-first. The SwiftUI adapter should delegate only high-value native controls in v0 and fall back to core primitives on Android, web, Expo Go, or missing peer dependency.
- Semantic metadata should be registered in the JavaScript wrapper layer, not inferred from opaque native SwiftUI internals. Accessibility props/modifiers should mirror the same labels and state for OS assistive technology.
- Research is complete for Stage 7 architecture. Remaining work is implementation verification, especially simulator checks for hosted layout, focus behavior, and native presentation controls.

## Package And Version Facts

| Package / import | Current status | Install command | Supported platform(s) | Source URL |
|---|---|---|---|---|
| `@expo/ui` | Expo UI package for native UI through Jetpack Compose and SwiftUI. Official SDK docs list bundled version `~55.0.12`; npm `latest` is `55.0.12`. | `npx expo install @expo/ui` | Android, iOS, tvOS at the package overview level. | https://docs.expo.dev/versions/latest/sdk/ui/ |
| `@expo/ui` package root | Install package only. Published `@expo/ui@55.0.12` exports no root `"."` entry, so root imports should not be used. | `npx expo install @expo/ui` | N/A for imports. | https://www.npmjs.com/package/@expo/ui |
| `@expo/ui/swift-ui` | Beta SwiftUI entrypoint for native iOS interfaces from React Native. Requires `Host` and development builds; unavailable in Expo Go. | `npx expo install @expo/ui` | iOS, tvOS in the API reference. The guide also labels macOS, but Agent UI should not promise macOS until Expo API docs and package support are explicit. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ |
| `@expo/ui/swift-ui/modifiers` | SwiftUI modifier entrypoint. Published package exports this subpath with TypeScript declarations. | `npx expo install @expo/ui` | iOS, tvOS. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `@expo/ui/jetpack-compose` | Android native UI entrypoint. It is a separate surface, not a drop-in parity layer for SwiftUI. | `npx expo install @expo/ui` | Android. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ |
| `@expo/ui/jetpack-compose/modifiers` | Android Compose modifier entrypoint, separate from SwiftUI modifiers. | `npx expo install @expo/ui` | Android. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/ |
| `@expo/ui/datetimepicker` | Drop-in replacement namespace for date/time picker compatibility. | `npx expo install @expo/ui` | Cross-platform replacement surface, separate from the SwiftUI adapter. | https://docs.expo.dev/versions/latest/sdk/ui/ |
| Expo SDK compatibility | Expo UI guide says SwiftUI support is available in SDK 54 and later. The rebuild should target SDK 55 as the active baseline because SDK 55 aligns Expo package major versions and current npm metadata. | `npx expo install @expo/ui` inside the target Expo app. | Depends on selected subpath. | https://expo.dev/changelog/sdk-55-beta |

## Host Model

`Host` is the container that crosses from React Native into SwiftUI. Expo docs describe it as the boundary required to use any component imported from `@expo/ui/swift-ui`; the SwiftUI guide says it uses Apple's `UIHostingController` under the hood. Agent UI should treat `Host` as a native-rendering island, similar in boundary discipline to a canvas-like surface rather than a normal React Native layout subtree.

`Host` is required whenever a SwiftUI component is rendered. A bare Expo UI SwiftUI control inside a normal React Native view is not the supported model. This means the adapter must decide whether to create a small `Host` per intrinsic control, a larger `Host` around a native form/list scope, or no `Host` because the platform falls back to core React Native.

The reverse nesting path is `RNHostView`. When React Native content is inserted back inside SwiftUI containers, `RNHostView` syncs layout information between SwiftUI and React Native's Yoga layout system. The practical nesting model is:

React Native -> `Host` -> SwiftUI -> `RNHostView` -> React Native

Layout must be explicit. `Host` exposes `style`, `matchContents`, `onLayoutContent`, `ignoreSafeArea`, `layoutDirection`, `colorScheme`, and `useViewportSizeMeasurement`. `matchContents` can be useful for intrinsic controls, while full-screen or flexible controls should use explicit sizing or viewport measurement. `RNHostView` has a matching decision: use `matchContents` for intrinsic React Native children, omit it for `flex: 1` content that should fill the SwiftUI parent.

Semantic registration should happen above the native boundary. The Agent UI wrapper should register `id`, role, label, state, actions, intent, and redaction policy in the JavaScript semantic registry before rendering the hosted native control. Native callbacks such as press, value change, presentation change, and submit should be proxied back into the semantic action/event system. Accessibility labels and values should also be mirrored through React Native props or SwiftUI accessibility modifiers so OS accessibility and agent semantics stay aligned.

## Custom SwiftUI Views And Modifiers

The April 26, 2026 project update makes the optional SwiftUI adapter more powerful: Agent UI can
now treat native SwiftUI extension as a supported Expo path rather than an off-plan escape hatch.
Official Expo docs show two relevant mechanisms:

- custom SwiftUI components can be implemented as Expo native views and consumed from JavaScript
  through `requireNativeView`;
- custom modifiers can be implemented as SwiftUI `ViewModifier` records, registered with
  `ViewModifierRegistry`, and represented in JavaScript through `createModifier`.

This creates two different responsibilities:

- **User-owned SwiftUI interop:** if an app already uses custom `@expo/ui/swift-ui` views,
  modifier arrays, or local Expo UI extensions, Agent UI should wrap and annotate that surface
  without forcing a rewrite.
- **Agent UI-owned SwiftUI extension:** if Agent UI adds its own native iOS components or
  modifiers, those additions must remain optional, fallback-backed, and adapter-scoped.

This is an adapter capability, not a core-package requirement. The core `@agent-ui/expo` package
must still work as a React Native-first, JavaScript-only runtime without `@expo/ui`, native
modules, or development-build-only assumptions.

Recommended Agent UI uses:

- native iOS controls that are missing from built-in Expo UI but valuable for the product;
- native styling modifiers such as `agentHighlight`, focus rings, semantic debug overlays, or
  app-specific control chrome;
- native presentation or interaction behavior that is materially better in SwiftUI than in a
  React Native approximation;
- custom app-specific SwiftUI wrappers exposed only through the explicit SwiftUI adapter path.

Rules:

- Treat user-owned custom SwiftUI code as a first-class interop surface.
- Keep all Agent UI-owned custom native SwiftUI code behind the optional adapter boundary.
- Preserve unknown custom modifier configs instead of filtering them out.
- Provide semantic wrapper APIs around custom SwiftUI views so apps can register stable IDs,
  labels, state, actions, intents, and privacy policy without replacing their native component.
- Provide React Native fallback behavior for Android, web, Expo Go, and missing `@expo/ui`.
- Mirror semantic labels, state, values, disabled state, and hints into SwiftUI accessibility
  modifiers when the wrapper has enough information.
- Keep the JavaScript semantic registry authoritative. Native SwiftUI should render and emit
  callbacks; it should not become the hidden source of semantic truth.
- Do not expose custom modifiers as public Agent UI API until they have development-build smoke
  tests and managed/bare workflow notes.
- Keep Reanimated as the cross-platform motion layer. Native SwiftUI animation/modifier support
  can improve iOS fidelity, but it does not replace Reanimated for the main package.

## Component API Table

| Component | Import path | Key props | Platform support | Agent UI primitive mapping | Caveats | Source URL |
|---|---|---|---|---|---|---|
| `Host` | `@expo/ui/swift-ui` | `children`, `style`, `matchContents`, `onLayoutContent`, `colorScheme`, `ignoreSafeArea`, `layoutDirection`, `useViewportSizeMeasurement` | iOS, tvOS | Private adapter boundary | Required for SwiftUI components. Choose sizing mode deliberately. `ignoreSafeArea` can only be set once on mount. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/ |
| `RNHostView` | `@expo/ui/swift-ui` | `children`, `matchContents` | iOS, tvOS | Private reverse bridge | Required for React Native content inside SwiftUI containers. `matchContents` is for intrinsic children; omit it for flex fill. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/ |
| `Button` | `@expo/ui/swift-ui` | `label` or children, `onPress`, `modifiers` | iOS, tvOS | v0 adapter target | Good native-control candidate. Must proxy press events into Agent UI actions and mirror semantic label. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/ |
| `Text` | `@expo/ui/swift-ui` | `children`, `modifiers` | iOS, tvOS | Internal SwiftUI text only | Core Agent UI `Text` should stay React Native by default. Use SwiftUI text inside hosted native scopes. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/ |
| `TextField` | `@expo/ui/swift-ui` | `defaultValue`, `placeholder`, value/change props, submit/focus-related modifiers | iOS, tvOS | v0 adapter target with caution | Native focus and controlled/uncontrolled behavior require simulator verification. Semantic snapshots must redact sensitive fields when configured. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/textfield/ |
| `SecureField` | `@expo/ui/swift-ui` | `defaultValue`, `placeholder`, value/change props | iOS, tvOS | v0 adapter target with required redaction | Never expose raw value through semantic inspection by default. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/securefield/ |
| `Toggle` | `@expo/ui/swift-ui` | on/off value, change callback, label, `modifiers` | iOS, tvOS | v0 adapter target | SDK 55 renamed `Switch` to `Toggle`. Keep fallback API stable even if Expo UI beta changes again. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/toggle/ |
| `Slider` | `@expo/ui/swift-ui` | value, range/min/max/step style props, change callback, `modifiers` | iOS, tvOS | v0 adapter target with explicit sizing | Flexible control. Avoid blind `matchContents`; prefer explicit width/frame in adapter presets. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/slider/ |
| `Picker` | `@expo/ui/swift-ui` | selected value, change callback, label, children/options, tag-related modifiers | iOS, tvOS | v0 or v1 adapter target | Selection mapping must be stable and typed. Children generally need tags for native selection semantics. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/picker/ |
| `DatePicker` | `@expo/ui/swift-ui` | date/range selection, labels, change callback | iOS, tvOS | Defer or expose as native-only adapter | SDK 55 renamed `DateTimePicker` to `DatePicker`. Cross-platform parity belongs in a separate date/time abstraction. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/ |
| `ProgressView` | `@expo/ui/swift-ui` | value/progress props, `modifiers` | iOS, tvOS | Visual primitive, not core semantic action | SDK 55 merged circular and linear progress concepts into `ProgressView` with style modifiers. Flexible sizing needs verification. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/ |
| `List` | `@expo/ui/swift-ui` | `children`, selection-related props, `modifiers` | iOS, tvOS | Example/native scope, not default core list | Native list behavior is high value but broad. Keep core `List` React Native-first and gate native list adapter behind iOS smoke tests. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/list/ |
| `Section` | `@expo/ui/swift-ui` | `title`, `children`, expansion-related props | iOS, tvOS | Native list/form scope | SDK 55 changed `Section` constructor behavior. Avoid treating old examples as current API. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/section/ |
| `Form` | `@expo/ui/swift-ui` | `children`, `modifiers` | iOS, tvOS | Native form scope, later than initial controls | Broad host scope with keyboard/focus interactions. Use `useViewportSizeMeasurement` or explicit sizing where needed. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/form/ |
| `BottomSheet` | `@expo/ui/swift-ui` | opened/presented state, change callback, detent/presentation props | iOS, tvOS | Native presentation adapter | React Native content inside the sheet should go through `RNHostView`. API names should be checked against current types during implementation. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/bottomsheet/ |
| `Popover` / `Overlay` | `@expo/ui/swift-ui` | presented state, trigger/content children, presentation props | iOS, tvOS | Native presentation adapter | Requires careful semantic mapping for trigger, content, dismissal, and focus. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/popover/ |
| `Menu`, `ContextMenu`, `ConfirmationDialog` | `@expo/ui/swift-ui` | items/actions, labels, presentation callbacks | iOS, tvOS | Native menu/action adapters | High-value native affordances, but action identity must map to stable Agent UI semantic action IDs. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/ |
| `HStack`, `VStack`, `ZStack`, `Group`, `Spacer`, `ScrollView` | `@expo/ui/swift-ui` | children, spacing/alignment, layout props, `modifiers` | iOS, tvOS | Internal hosted layout only | Core stack primitives should remain React Native-first. SwiftUI stacks are useful only inside a hosted native scope. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ |
| `Label`, `Image`, `Link` | `@expo/ui/swift-ui` | content/source/url props, `modifiers` | iOS, tvOS | Native content helpers | Use where already inside a SwiftUI host. Core content components should not require Expo UI. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ |
| `ColorPicker`, `Gauge`, `Stepper`, `DisclosureGroup`, `ControlGroup`, `LabeledContent`, `ShareLink` | `@expo/ui/swift-ui` | control-specific state and callbacks | iOS, tvOS where documented/typed | Post-v0 native controls | Verified in docs and/or published type declarations. Add only after per-control semantic/action tests exist. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ |
| Typed exports not yet primary adapter targets | `@expo/ui/swift-ui` | `Chart`, `Grid`, `GlassEffectContainer`, `Namespace`, shapes and helper types appear in published declarations | iOS, tvOS or OS-gated where applicable | Do not expose in v0 core | Treat as available package surface but not stable Agent UI primitives until docs, OS gates, and smoke tests are checked. | https://www.npmjs.com/package/@expo/ui |

## Modifier API Table

| Modifier | Import path | Inputs | Applies to | Agent UI modifier mapping | Caveats | Source URL |
|---|---|---|---|---|---|---|
| `padding` | `@expo/ui/swift-ui/modifiers` | numeric edge/all values | General views | Map spacing tokens to numeric points | Keep token conversion in adapter layer; do not leak Expo UI modifier objects into core API. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `frame`, `containerRelativeFrame`, `fixedSize`, `aspectRatio` | `@expo/ui/swift-ui/modifiers` | width/height/min/max/alignment/aspect config | General views | Native sizing constraints | Required for flexible controls and hosted layout stability. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `layoutPriority`, `offset`, `zIndex` | `@expo/ui/swift-ui/modifiers` | numeric priority/position values | General views | Advanced layout controls | Prefer simple explicit host sizing first; these can produce layout differences from React Native. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `backgroundOverlay`, `overlay`, `mask`, `clipShape`, `clipped`, `cornerRadius`, `border` | `@expo/ui/swift-ui/modifiers` | color, shape, overlay, border, radius config | General views | Surface/chrome mapping | Native shape behavior may not match React Native style exactly. Keep fallback visually close, not identical. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `shadow`, `opacity`, `blur`, `brightness`, `contrast`, `saturation`, `hueRotation`, `colorInvert`, `grayscale`, `luminanceToAlpha` | `@expo/ui/swift-ui/modifiers` | numeric/effect config | General views/images | Visual effects | Do not make agent semantics depend on visual-only effects. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `foregroundStyle`, `foregroundColor`, `tint`, `font`, `bold`, `italic`, `monospacedDigit` | `@expo/ui/swift-ui/modifiers` | color/font/style values | Text and controls | Typography/color mapping | Prefer current SwiftUI-style names for new adapter code; keep old/deprecated names only where Expo types still expose them. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `lineLimit`, `lineSpacing`, `truncationMode`, `allowsTightening`, `kerning`, `multilineTextAlignment`, `textCase`, `underline`, `strikethrough`, `textSelection` | `@expo/ui/swift-ui/modifiers` | text layout and decoration config | Text-like views | Text primitive modifiers | Mirror only the subset needed for Agent UI text variants in v0. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `buttonStyle`, `toggleStyle`, `pickerStyle`, `datePickerStyle`, `progressViewStyle`, `gaugeStyle`, `labelStyle`, `controlSize`, `labelsHidden` | `@expo/ui/swift-ui/modifiers` | enum/string style values | Native controls | Control variant mapping | Some styles are platform or OS-version gated. Fallback components should support a smaller stable variant set. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `tag` | `@expo/ui/swift-ui/modifiers` | selection value | Picker/list option children | Selection identity mapping | Critical for stable picker semantics. Values should map to Agent UI option IDs. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `accessibilityLabel`, `accessibilityHint`, `accessibilityValue` | `@expo/ui/swift-ui/modifiers` | strings/value descriptors | Accessible views | Mirror semantic registry metadata | Registry remains authoritative for agent tools; modifiers keep OS accessibility aligned. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `disabled`, `hidden` | `@expo/ui/swift-ui/modifiers` | boolean values | General/control views | Semantic state mapping | Disabled/hidden state must update semantic action availability. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `onTapGesture`, `onLongPressGesture`, `onAppear`, `onDisappear`, `onSubmit`, `refreshable` | `@expo/ui/swift-ui/modifiers` | callback handlers | Interactive views/scopes | Event bridge mapping | Every callback exposed to Agent UI should emit structured semantic events. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `keyboardType`, `submitLabel`, `textInputAutocapitalization`, `textContentType`, `autocorrectionDisabled` | `@expo/ui/swift-ui/modifiers` | keyboard/input config | Text inputs | Text field adapter mapping | Requires simulator verification with hosted `TextField` and `SecureField`. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `presentationDetents` and related presentation modifiers | `@expo/ui/swift-ui/modifiers` | detent/presentation config | Sheets/popovers/presentations | Sheet/menu adapter mapping | Must pair with semantic presentation state and dismissal actions. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/bottomsheet/ |
| `scrollDismissesKeyboard`, `scrollDisabled`, `defaultScrollAnchor`, `defaultScrollAnchorForRole`, `scrollTargetBehavior`, `scrollTargetLayout`, `scrollContentBackground`, `listStyle`, `listRowBackground`, `listRowSeparator`, `listRowInsets`, `listSectionSpacing`, `listSectionMargins`, `headerProminence`, `badge`, `badgeProminence`, `moveDisabled`, `deleteDisabled` | `@expo/ui/swift-ui/modifiers` | list/scroll config values | Lists, forms, scroll views, rows | Native list/form adapter mapping | Useful for native list scopes, not needed in core React Native v0 primitives. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |
| `glassEffect`, `glassEffectId`, `contentTransition`, animation helpers | `@expo/ui/swift-ui/modifiers` | OS-gated visual/animation config | Supported native views | Native visual polish only | Liquid Glass and newer visual effects require current Apple OS/Xcode support. Keep optional and version-gated. | https://docs.expo.dev/guides/expo-ui-swift-ui/ |
| Custom modifiers such as `agentHighlight` | local SwiftUI adapter module plus `@expo/ui/swift-ui/modifiers` | app/package-defined parameter records | Any supported Expo UI component | Native iOS adapter extension | Must be registered natively, represented in JS with `createModifier`, fallback-backed, and smoke-tested before public exposure. | https://docs.expo.dev/guides/expo-ui-swift-ui/extending/ |
| `createModifier`, `isModifier`, `filterModifiers` | `@expo/ui/swift-ui/modifiers` | low-level modifier construction/inspection | Adapter internals | Internal escape hatch | Use for adapter-owned native modifiers; do not expose as public Agent UI API in v0. | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ |

## Optional Dependency Decision

| Option | Pros | Cons | Decision |
|---|---|---|---|
| Required dependency | Simplest imports for native controls. Every install has the same package graph. | Forces a beta native UI package onto Android/web users and Expo Go workflows. Root core would inherit native build constraints. | Reject for v0. |
| Optional peer dependency | Keeps core lightweight while allowing opt-in native fidelity. Matches Expo UI beta and platform constraints. | Conditional imports must be isolated carefully so Metro does not resolve missing native packages from root paths. | Accept only behind explicit adapter entrypoint. |
| Separate adapter package or subpath | Cleanest architectural boundary. Users intentionally opt into SwiftUI/native build requirements. Core remains React Native-first. | More package/export management and docs burden. | Recommended for v0. |
| Deferred integration | Avoids beta churn and native testing burden. | Loses a major Stage 7 value proposition and delays learning about hosted native controls. | Reject as default, but keep individual complex controls deferred. |

Recommendation: ship the SwiftUI bridge as a separate adapter package or explicit export subpath, for example `@agent-ui/expo/swift-ui`. The adapter should declare `@expo/ui` as an optional peer dependency and keep all Expo UI imports out of the root `@agent-ui/expo` entrypoint. This makes the beta/no-Expo-Go/iOS-only constraints visible to adopters without blocking the core semantic runtime.

## Adapter Design Recommendation

Package boundary:

- `@agent-ui/expo` contains React Native-first primitives, the semantic registry, accessibility mapping, motion hooks, and tool bridge integration.
- `@agent-ui/expo/swift-ui` contains all imports from `@expo/ui/swift-ui` and `@expo/ui/swift-ui/modifiers`.
- A future `@agent-ui/expo/jetpack-compose` path can be evaluated separately. Do not force Compose parity into the SwiftUI adapter.

Public imports:

- Core app code imports stable primitives from `@agent-ui/expo`.
- Apps that explicitly want native iOS SwiftUI controls import from `@agent-ui/expo/swift-ui`.
- The root package must not re-export SwiftUI adapter components, because that would make root consumers vulnerable to missing `@expo/ui` resolution.

Fallback behavior:

- iOS/tvOS development build with `@expo/ui` installed: render the SwiftUI adapter through `Host`.
- Expo Go: use React Native fallback and warn in development that SwiftUI Expo UI requires a development build.
- Android: use React Native fallback in v0. Jetpack Compose is separate research and implementation work.
- Web: use React Native Web/DOM-compatible fallback.
- Missing `@expo/ui`: use fallback and emit a clear development warning from the adapter entrypoint or component boundary.

Tree-shaking expectations:

- Keep `@expo/ui` imports statically contained in the adapter entrypoint.
- Do not import adapter files from the root package index.
- Keep fallback implementations in the core package or a shared internal layer that does not import Expo UI.
- Validate with package build output and Metro resolution tests during implementation.

Semantic metadata wrapping:

- Register semantic nodes in the wrapper component before rendering native Expo UI.
- Store stable `id`, role, label, value/state, actions, intent, parent/child relationships, and privacy policy in the JavaScript registry.
- Mirror label, hint, value, disabled state, and selected/on/off state to SwiftUI accessibility modifiers where available.
- Proxy native callbacks into semantic action results and event logs.
- Treat `Host` bounds as a coordinate fallback only. Agent tools should target semantic IDs first.

Custom SwiftUI interop and extension:

- Use only from the explicit SwiftUI adapter package/subpath.
- Support user-owned custom SwiftUI views and modifiers through pass-through and semantic wrappers.
- Do not require existing Expo UI SwiftUI code to move into Agent UI primitives before it can be
  inspected or controlled semantically.
- Prefer built-in Expo UI SwiftUI components and modifiers first.
- Add an Agent UI-owned custom SwiftUI component only when React Native, Reanimated, and built-in
  Expo UI cannot provide the needed iOS fidelity or platform behavior.
- Add an Agent UI-owned custom SwiftUI modifier only when it represents a reusable native concern
  such as `agentHighlight`, focus visualization, semantic debug styling, or app-specific native
  chrome.
- Keep every Agent UI-owned custom extension paired with React Native fallback behavior and a
  documented development-build requirement.

Testing strategy:

- Unit-test prop-to-adapter mapping without rendering native modules.
- Unit-test modifier array construction for supported controls.
- Test semantic registration and fallback rendering with React Native Testing Library.
- Add Metro/package-resolution tests proving root imports work without `@expo/ui` installed.
- Add iOS development-build smoke tests for `Host`, `RNHostView`, `Button`, `Toggle`, `TextField`, `SecureField`, `Slider`, `Picker`, `BottomSheet`, and one native list/form scope.
- Add focused simulator tests for hosted text input focus, secure value redaction, slider width, sheet dismissal, and semantic event emission.
- Add native smoke tests before publishing any custom SwiftUI component or modifier from the
  adapter.

## Unsupported Or Unknown Areas

Stable constraints, not blockers:

- `@expo/ui/swift-ui` is beta and subject to breaking changes.
- SwiftUI components are unavailable in Expo Go and require development builds.
- SwiftUI support is iOS/tvOS in the SDK reference. The guide labels macOS, but Agent UI should not make macOS promises.
- Android native parity requires the separate Jetpack Compose namespace.
- Some visual effects and styles are OS/Xcode gated.

Implementation unknowns to verify:

- Exact controlled/uncontrolled behavior for `TextField` and `SecureField` in hosted SwiftUI.
- Final prop names for presentation components against package type declarations at implementation time.
- How much of `Form` and `List` should be hosted natively before layout, keyboard, and semantic complexity outweighs the benefit.
- Whether typed exports that are less prominent in docs, such as `Chart`, `Grid`, and `GlassEffectContainer`, should be exposed after separate smoke tests.
- Whether `matchContents` is sufficient for each intrinsic control. Flexible controls should default to explicit sizing until verified.
- The exact managed and bare workflow setup for adapter-owned custom SwiftUI components and
  custom modifiers.
- Versioning policy for adapter-owned custom native SwiftUI APIs if Expo UI's beta surface changes.

No unresolved research blocker remains for the adapter decision. These items belong in implementation tasks and compatibility tests.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Expo UI SDK overview | https://docs.expo.dev/versions/latest/sdk/ui/ | 2026-04-27 | Package purpose, install path, bundled `~55.0.12`, available platform families, DateTimePicker replacement namespace. |
| Expo UI SwiftUI SDK reference | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/ | 2026-04-27 | SwiftUI beta status, iOS/tvOS platform labels, Expo Go limitation, `Host` requirement, install command. |
| Building SwiftUI apps with Expo UI | https://docs.expo.dev/guides/expo-ui-swift-ui/ | 2026-04-27 | SwiftUI integration model, SDK 54+ note, `UIHostingController` model, modifier import model, guide-level macOS label. |
| Host reference | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/ | 2026-04-27 | `Host` props, sizing modes, `matchContents`, `onLayoutContent`, safe-area behavior, viewport measurement. |
| RNHostView reference | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/ | 2026-04-27 | React Native inside SwiftUI bridge, `matchContents` behavior, Yoga layout synchronization. |
| SwiftUI modifiers reference | https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/ | 2026-04-27 | Modifier namespace, typed modifier families, accessibility modifiers, layout/style/input/list modifiers. |
| Extending with SwiftUI | https://docs.expo.dev/guides/expo-ui-swift-ui/extending/ | 2026-04-27 | Custom SwiftUI component path through Expo native views, custom modifier registration, JavaScript `createModifier` helper. |
| Expo UI Jetpack Compose reference | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/ | 2026-04-27 | Android native UI namespace is separate from SwiftUI. |
| Expo SDK 55 beta changelog | https://expo.dev/changelog/sdk-55-beta | 2026-04-27 | Expo UI beta status, SDK 55 API renames, package major-version scheme. |
| npm metadata for `@expo/ui` | https://www.npmjs.com/package/@expo/ui | 2026-04-27 | Published package version `55.0.12`, package identity, registry source. |
| Local npm metadata check | `npm view @expo/ui version dist-tags peerDependencies dependencies exports --json` | 2026-04-27 | Verified `latest` and `next` as `55.0.12`, canary `56.0.0-canary-20260423-c31bd8e`, peer dependencies, and exported subpaths. |
| Published package declarations check | `npm pack @expo/ui@55.0.12` and inspected `package/build/swift-ui/index.d.ts` plus `package/build/swift-ui/modifiers/index.d.ts` | 2026-04-27 | Verified typed SwiftUI component exports and modifier exports beyond the high-level docs index. |

## Final Recommendation

Stage 7 should implement a narrow, optional SwiftUI adapter. Keep the core package React Native-first and semantic-first. Add an explicit `@agent-ui/expo/swift-ui` adapter path that peers on `@expo/ui`, imports only `@expo/ui/swift-ui` and `@expo/ui/swift-ui/modifiers`, wraps native controls in `Host`, and uses `RNHostView` only when React Native content is intentionally embedded back inside SwiftUI presentations or containers.

The v0 SwiftUI adapter should prioritize `Button`, `Toggle`, `TextField`, `SecureField`, `Slider`, `Picker`, and one or two presentation/list examples after smoke testing. Android, web, Expo Go, and missing-peer cases should fall back to core React Native components with development warnings. Semantic registration remains in JavaScript and is mirrored to native accessibility modifiers; the native SwiftUI tree is not the source of truth for agent control.

Custom SwiftUI components and modifiers are now a valid Stage 7 interop and expansion path for iOS
fidelity. Existing user-owned custom SwiftUI should be preserved and semantically wrapped. Agent
UI-owned custom native additions should remain narrow and optional: use them to fill real native
gaps or expose reusable agent-specific native modifiers; do not move the Stage 2 primitive layer
or Stage 3 semantic runtime into native SwiftUI.

DONE
