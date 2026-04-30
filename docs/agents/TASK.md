# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-30
Last updated: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Research Area: SwiftUI-inspired React Native primitives, accessibility semantics, list/form hierarchy

## Objective

Implement the next React Native-first component primitive cluster for Expo Agent UI:
`Scroll`, `List`, `Section`, and `Form`.

Keep the work inside Stage 2. Do not build the Stage 3 semantic registry, agent bridge, MCP server,
motion layer, Expo UI adapter, native modules, or old parser assets.

## Status

DONE_WITH_CONCERNS

## Acceptance Criteria

- [x] Keep the package foundation and earlier primitive slices intact.
- [x] Add core primitive exports in `packages/core/src` for:
  - `Scroll`
  - `List`
  - `Section`
  - `Form`
- [x] Implement primitives as thin React Native wrappers, not a custom renderer or virtualized list
  framework.
- [x] Map stable `id` values to React Native `testID` by default.
- [x] Emit appropriate accessibility labels, roles, state, and structure metadata where React
  Native supports it.
- [x] Preserve stable section and row hierarchy for list/form content without implementing Stage 3
  tree snapshots.
- [x] Add development warnings for scroll/list/form/section primitives that need stable IDs or
  labels for agent-readable hierarchy.
- [x] Do not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, or new
  package dependencies in `@agent-ui/core`.
- [x] Keep semantic registration as a typed no-op/deferred boundary; full registry behavior belongs
  to Stage 3.
- [x] Update the example app only enough to render one simple settings-style screen using the new
  primitives.

## Implementation Summary

- Added `Scroll`, `List`, `Section`, and `Form` primitives to `packages/core/src/primitives.tsx`.
- Extended deferred semantic primitive metadata with `scroll`, `list`, `section`, and `form` roles,
  plus a `scroll` action for scrollable scopes.
- Implemented `Scroll` as a thin `ScrollView` wrapper with `contentSpacing`, accessible label
  passthrough, `id` to `testID` mapping, and a development warning for missing scroll IDs.
- Implemented `List`, `Section`, and `Form` as thin `View` wrappers that preserve authored child
  order and warn for missing stable IDs or labels.
- Added section header/footer rendering that wraps string content in React Native `Text` while
  allowing custom nodes to pass through.
- Updated the example app to render a simple settings-style runtime connection screen using
  `Scroll`, `List`, `Section`, and `Form`.

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

Implementation verification:

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.

Review verification:

- Focused Stage 2 review found no blocking findings.
- A small active-stage API rough edge was fixed during review: string section headers/footers now
  render inside `Text`, while custom header/footer nodes pass through unchanged.
- Authorized dependency-management review fixed the React typings automation blocker:
  - added workspace `@types/react`,
  - removed the temporary local React declaration shim,
  - changed the example app `typecheck` script to real `tsc`.
- Expo Doctor initially found SDK dependency drift. The example app and core peer ranges were
  aligned to `expo@55.0.18` and `react-native@0.83.6`; `expo-doctor` now passes all 18 checks.
- Forbidden-import scan found no `@expo/ui`, Expo Router, React Navigation, MCP SDK, native module,
  old parser, tree-sitter, WASM, VS Code, or Canvas renderer imports in `packages/core/src`.

## Concerns

- The example app build/test scripts remain placeholders until Expo build target configuration and
  a React Native test harness are added.
- `npm audit --omit=dev --audit-level=moderate` reports moderate transitive Expo CLI/config
  tooling advisories. The suggested forced fix downgrades Expo to 49 and must not be applied
  without a separate dependency/security review.
- `Scroll`, `List`, `Section`, and `Form` expose deferred semantic metadata only. Full tree
  snapshots, parent-child inspection, duplicate ID detection, and action dispatch remain Stage 3.

## Out Of Scope Preserved

- Stage 3 semantic registry snapshots, duplicate ID checks, and action dispatch
- Runtime agent bridge
- MCP tools
- Reanimated motion presets
- Expo UI SwiftUI adapter or native list/form hosting
- Virtualized list data adapters
- Adding runtime dependencies
- Old parser historical archive work

## Next Candidate Task

Create the next bounded Stage 2 task for `Toggle`, `Slider`, `Picker`, and `Stepper`.
