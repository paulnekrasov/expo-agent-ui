# Android / Material Design 3 Layout DNA For Expo Agent UI

Status: inspiration only
Product stage: Stage 2 - Component Primitives, Stage 7 - Expo UI Adapter
Counterpart: `design/swiftui-layout-dna.md` (iOS)
Skill source: `agent/platform-skills/android-ecosystem-skill/references/compose-patterns.md`,
`agent/platform-skills/android-ecosystem-skill/references/material3-theming.md`,
`agent/platform-skills/native-app-design-engineering/SKILL.md`

This document preserves the useful Android layout and composition ideas from the
android-ecosystem and native-design-engineering platform skills. Expo Agent UI should use it
alongside the SwiftUI layout DNA to guide cross-platform primitives.

## What To Preserve

- Compose uses a single-pass layout model: parent measures children, children respond with
  their size, parent places children. This is functionally similar to SwiftUI's
  parent-proposes/child-decides model.
- `Column`, `Row`, and `Box` are the Compose equivalents of `VStack`, `HStack`, and `ZStack`.
- Compose enforces no double-measurement by default. Intrinsic measurements exist for
  cross-axis sizing but should be used sparingly.
- `Modifier` chains in Compose are order-sensitive: padding before background produces
  different results than background before padding.
- `LazyColumn`, `LazyRow`, and `LazyVerticalGrid` handle dynamic lists with item recycling.
  Stable `key` values and `contentType` are critical for list performance.
- `Spacer` in Compose with `Modifier.weight(1f)` maps to SwiftUI `Spacer()`.
- Adaptive layouts use window size classes to choose compact, medium, and expanded
  configurations. `NavigationBar`, `NavigationRail`, and `NavigationSuiteScaffold` respond
  to available width.

## Expo Agent UI Interpretation

The core package should map Compose layout concepts to the same React Native wrappers used for
SwiftUI-inspired layout:

- `VStack` maps to Compose `Column` → React Native `flexDirection: "column"`.
- `HStack` maps to Compose `Row` → React Native `flexDirection: "row"`.
- `ZStack` maps to Compose `Box` → React Native overlay layout.
- `Spacer` maps to Compose `Spacer(Modifier.weight(1f))` → React Native flexible `View`.
- `Screen` owns route, title, semantic metadata, and safe-area equivalents including
  Android edge-to-edge insets.

## Material 3 Component Mapping

| Compose Component | Agent UI Primitive | Notes |
|---|---|---|
| `Button`, `FilledTonalButton`, `OutlinedButton` | `Button` with variant prop | Semantic roles must be exposed |
| `Switch` | `Toggle` | Compose uses `toggleable` with `Role.Switch` |
| `Checkbox` | `Checkbox` | Supports checked, unchecked, indeterminate |
| `Slider` | `Slider` | Must expose min/max/now through accessibility |
| `TextField`, `OutlinedTextField` | `TextInput` | M3 text fields include error states by default |
| `NavigationBar`, `NavigationRail` | Tab navigation | Adaptive by window size class |
| `TopAppBar`, `MediumTopAppBar`, `LargeTopAppBar` | Screen header | Scroll behavior variants |
| `BottomSheetScaffold`, `ModalBottomSheet` | Sheet | Explicit state management |
| `ListItem` | List row | Two-line and three-line variants |

## Adaptive Layout Rules

- Use window size classes (`Compact`, `Medium`, `Expanded`) to choose layout configurations.
- Compact: single-pane, bottom navigation, standard top bar.
- Medium: navigation rail possible, two-pane optional.
- Expanded: navigation rail or permanent drawer, list-detail or supporting pane.
- `GridCells.Adaptive` for responsive grids scales to available width.
- Test foldables, tablets, Chromebooks, rotation, multi-window, and virtual displays when
  claiming large-screen support.

## Agent-Facing Rules

- Prefer standard Material 3 components over custom implementations.
- Use `MaterialTheme.colorScheme` for colors, never hardcode.
- Keep composables stateless where possible; hoist state to ViewModel.
- Accessibility semantics must be intentional: roles, labels, state descriptions.
- Edge-to-edge is mandatory on Android 15+ (API 35); verify inset handling.
- Keep modifier chains readable; avoid deeply nested modifier wrapping.
- Test with representative data, images, and mid-range devices.

## Cross-Platform Convergence

| Concept | SwiftUI | Compose | Agent UI |
|---|---|---|---|
| Vertical stack | `VStack` | `Column` | `VStack` → `flexDirection: "column"` |
| Horizontal stack | `HStack` | `Row` | `HStack` → `flexDirection: "row"` |
| Overlay | `ZStack` | `Box` | `ZStack` → absolute overlay |
| Flexible gap | `Spacer()` | `Spacer(Modifier.weight(1f))` | `Spacer` → flex gap |
| Lazy list | `List` / `LazyVStack` | `LazyColumn` | React Native `FlatList` |
| Adaptive nav | `TabView` + `.sidebarAdaptable` | `NavigationSuiteScaffold` | Platform-aware tab/rail |
| Minimum touch target | 44×44 pt | 48×48 dp | 48×48 dp (stricter default) |

## Non-Goals

- Do not port the Compose single-pass layout engine into React Native.
- Do not require Material 3 in core Agent UI; it belongs behind the Jetpack Compose adapter.
- Do not assume all Android devices are large-screen.
- Do not replicate Compose `Modifier` chain semantics in the core API.
