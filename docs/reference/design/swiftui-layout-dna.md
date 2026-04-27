# SwiftUI Layout DNA For Expo Agent UI

Status: inspiration only
Product stage: Stage 2 - Component Primitives

This document preserves the useful layout ideas from the retired SwiftUI parser project. It is
not a static parser contract and it is not a requirement to emulate SwiftUI exactly.

## What To Preserve

- Parent containers propose space to children; children choose their own size; parents place
  children after measurement.
- `VStack`, `HStack`, and `ZStack` should stay predictable and thin.
- Stack spacing should be explicit when provided and otherwise follow sensible platform defaults.
- Cross-axis alignment belongs on the stack, not on every child.
- `Spacer` should be treated as a flexible gap, not as visible content.
- Frame-like modifiers should behave like wrappers around content rather than destructive
  constraints.
- Content is allowed to overflow when the host platform would allow it, but overflow must not
  corrupt the semantic tree.

## Expo Agent UI Interpretation

The core package should implement these ideas as React Native wrappers:

- `VStack` maps to a `View` with `flexDirection: "column"`.
- `HStack` maps to a `View` with `flexDirection: "row"`.
- `ZStack` maps to a containing `View` where children can overlay through absolute positioning
  only when explicitly requested.
- `Spacer` maps to a flexible `View` on the active stack axis.
- `Screen` owns safe-area, route, title, and semantic screen metadata. It does not replace Expo
  Router or React Navigation.

## Agent-Facing Rules

- Prefer stable, readable hierarchy over clever layout composition.
- Preserve the order of children exactly as authored.
- Avoid modifier chains that hide actionable controls from semantic registration.
- Keep fixed dimensions rare; prefer responsive React Native layout primitives.
- Make every actionable primitive easy to label, inspect, and test.

## Non-Goals

- Do not port the old TypeScript layout engine.
- Do not revive Canvas rendering.
- Do not parse Swift source.
- Do not require pixel-perfect SwiftUI layout parity.
