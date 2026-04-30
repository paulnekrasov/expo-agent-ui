# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-30
Last updated: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Research Area: SwiftUI-inspired React Native controls, accessibility semantics, control chrome

## Objective

Implement the next React Native-first component primitive cluster for Expo Agent UI:
`Toggle`, `Slider`, `Picker`, and `Stepper`.

Keep the work inside Stage 2. Do not build the Stage 3 semantic registry, agent bridge, MCP server,
motion layer, Expo UI adapter, native modules, optional icon/control dependencies, or old parser
assets.

## Status

DONE_WITH_CONCERNS

## Acceptance Criteria

- [x] Keep the package foundation and earlier primitive slices intact.
- [x] Add core primitive exports in `packages/core/src` for:
  - `Toggle`
  - `Slider`
  - `Picker`
  - `Stepper`
- [x] Implement controls with React Native primitives and built-ins only; do not add package
  dependencies.
- [x] Map stable `id` values to React Native `testID` by default.
- [x] Emit appropriate accessibility labels, roles, state, actions, and range/selection values.
- [x] Add development warnings for actionable controls missing stable IDs or accessible labels.
- [x] Keep semantic registration as a typed no-op/deferred boundary; full registry behavior belongs
  to Stage 3.
- [x] Do not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, or old
  parser assets in `@agent-ui/core`.
- [x] Update the example app only enough to render one simple control settings section using the
  new primitives.
- [x] Add focused React Native Testing Library coverage for stable IDs and accessibility metadata
  on the new control cluster.

## Implementation Summary

- Added `Toggle`, `Slider`, `Picker`, and `Stepper` primitives to `packages/core/src/primitives.tsx`.
- Extended deferred semantic primitive metadata with `toggle`, `slider`, `picker`, and `stepper`
  roles, plus `toggle`, `increment`, `decrement`, `set_value`, and `select` actions.
- Implemented `Toggle` as a React Native `Switch` wrapper with stable `id` to `testID` mapping,
  explicit accessibility element status, checked state, and deferred checked metadata.
- Implemented `Slider` as a dependency-free React Native fallback control with adjustable
  accessibility actions, min/max/current value metadata, range clamping, and visible track/thumb
  chrome.
- Implemented `Picker` as a simple selectable option group using React Native `Pressable` rows with
  radio accessibility state and stable option IDs.
- Implemented `Stepper` as a compact fallback control with adjustable accessibility metadata,
  increment/decrement actions, visible +/- press targets, and range clamping.
- Added development warnings for missing stable IDs or accessible labels on the new actionable
  controls, and for invalid/missing picker option IDs or labels.
- Updated the example app settings form with a runtime toggle, automation confidence slider,
  session mode picker, and retry count stepper.
- Added React Native Testing Library assertions for control test IDs, roles, checked state,
  range values, picker selection, and stepper increment behavior.

## File Allowlist Used

- `packages/core/src/**`
- `packages/example-app/**`
- `docs/agents/TASK.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/REVIEW.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md`

## Verification

Current-run preflight:

- `node -e "const r=require('child_process').spawnSync(process.execPath,['-e','process.exit(0)'],{encoding:'utf8'}); if(r.error){console.error(r.error.message); process.exit(2)} process.exit(r.status ?? 0)"` exited `0`.
- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.

Debugging red-green evidence:

- Red: `cmd /c npm.cmd run typecheck --workspaces --if-present` failed because the example app
  resolved `@agent-ui/core` through stale `dist` declarations that did not yet export `Toggle`,
  `Slider`, `Picker`, or `Stepper`.
- Green: `cmd /c npm.cmd run build --workspace @agent-ui/core` regenerated package output, and the
  same workspace typecheck command then exited `0`.
- Red: `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` failed because RNTL
  did not query the new `Switch` by role without an explicit accessibility element boundary.
- Green: `Toggle` now passes `accessible`; the same focused example test then reached the next
  assertion.
- Red: the same focused test then failed because hidden stepper press targets were excluded from
  `getByTestId`.
- Green: visible stepper press targets are no longer marked accessibility-hidden; the same focused
  example test exited `0`.

Implementation verification:

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; the example app reported 2 suites and
  5 tests passing.
- `git diff --check` exited `0`.
- A PowerShell forbidden-import scan of `packages/core/src` found no `@expo/ui`, Expo Router,
  React Navigation, MCP SDK, old parser, tree-sitter, WASM, VS Code, or Canvas renderer imports.

## Concerns

- `Slider`, `Picker`, and `Stepper` use dependency-free React Native fallback rendering because the
  core package must not add optional control packages in Stage 2. Native hosted controls remain
  Stage 7 adapter work.
- The new controls expose deferred semantic metadata only. Full tree snapshots, duplicate ID
  detection, and runtime action dispatch remain Stage 3 work.
- `Icon` remains a dependency-free text/glyph wrapper until a future adapter or optional icon
  package task chooses a concrete mapping.

## Out Of Scope Preserved

- Stage 3 semantic registry snapshots, duplicate ID checks, and action dispatch
- Runtime agent bridge
- MCP tools
- Reanimated motion presets
- Expo UI SwiftUI adapter or native hosted controls
- Adding runtime dependencies or optional control packages
- Old parser historical archive work

## Next Candidate Task

Create the first bounded Stage 3 task for semantic node schema and registry mount/unmount behavior.
