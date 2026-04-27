# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-27
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Research Area: SwiftUI-inspired React Native primitives, accessibility semantics

## Objective

Implement the first React Native-first component primitive slice for Expo Agent UI without
building the full semantic runtime or agent bridge.

## Status

ACTIVE_READY

## Acceptance Criteria

- [ ] Keep the package foundation from Stage 1 intact.
- [ ] Add core primitive exports in `packages/core/src` for:
  - `AgentUIProvider`
  - `Screen`
  - `VStack`
  - `HStack`
  - `ZStack`
  - `Spacer`
  - `Text`
  - `Button`
- [ ] Define shared primitive prop types for stable `id`, `intent`, accessibility label, disabled
  state, and test ID mapping.
- [ ] Implement primitives as thin React Native wrappers, not a custom renderer.
- [ ] Do not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, or native modules in core.
- [ ] Keep semantic registration as a typed no-op/deferred boundary; full registry work belongs to
  Stage 3.
- [ ] Add focused tests or type-level verification for primitive prop mapping if the test harness is
  ready; otherwise document the verification limitation.
- [ ] Update the example app only enough to render one simple primitive screen if dependencies are
  installed or intentionally installed for this task.

## File Allowlist

- `packages/core/**`
- `packages/example-app/**`
- `package.json`
- `package-lock.json`
- `tsconfig.base.json`
- `docs/agents/TASK.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/REVIEW.md`
- `docs/agents/ROADMAP_CHECKLIST.md`

## Reference Docs To Read Before Starting

- `docs/PROJECT_BRIEF.md`
- `docs/reference/INDEX.md`
- `docs/reference/react-native/accessibility-semantics.md`
- `docs/reference/expo/cross-platform-adapters.md`
- `docs/reference/expo/expo-ui-swift-ui.md`
- `docs/reference/expo/package-foundation.md`

## Known Traps

- Do not implement the Stage 3 semantic registry in this task.
- Do not make `@expo/ui` mandatory.
- Do not add MCP tools or bridge transport.
- Do not recreate old SwiftUI parser, VS Code extension, tree-sitter, WASM, or Canvas renderer assets.
- Do not convert the package into a framework with its own navigation or animation engine.
- If React/React Native dependencies are missing from `node_modules`, either install the refreshed
  workspace dependencies intentionally or state the exact verification limitation.

## Out Of Scope

- Semantic tree inspection
- Runtime action dispatch
- Agent bridge
- MCP tools
- Reanimated motion presets
- Expo UI SwiftUI adapter
- Old parser historical archive work

## Verification

Preferred verification after implementation:

- `npm run typecheck --workspaces --if-present`
- `npm run build --workspaces --if-present`
- `npm test --workspaces --if-present`

If the example app cannot typecheck because Expo dependencies are not installed, verify the core
package directly and document the limitation.
