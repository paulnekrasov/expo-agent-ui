# HANDOFF NOTE
From: scheduled-run coordinator
To: next Stage 4 implementer
Session date: 2026-05-01

## What I Did

- Ran the scheduled automation loop for the first Stage 4 bridge task.
- Confirmed current-run verification was available:
  - direct Node child-process probe exited `0`,
  - `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- Used the repo-local context-prompt-engineering reference for task/state/prompt status updates.
- Used the repo-local systematic-debugging adapter for the focused red tests and stale declaration
  typecheck failure.
- Added `packages/core/src/bridge.ts` with bridge protocol version, capability, transport-mode,
  execution-environment, config, gate-result, and result-code contracts.
- Added `createAgentUIBridgeGate(config?, options?)` as a pure JS fail-closed gate.
- Required explicit bridge enablement, development mode, known non-standalone execution
  environment, pairing token, valid WebSocket URL, and accepted URL/transport policy before bridge
  control enables.
- Kept LAN behind explicit `unsafeAllowLAN` and rejected tunnel mode for v0 semantic control.
- Exposed the resolved bridge gate through `AgentUIProvider` and `useAgentUIBridge()` without
  opening sockets or serializing semantic snapshots.
- Exported the bridge constants, types, and gate function from `@agent-ui/core`.
- Added focused tests in `packages/example-app/app/agent-ui-bridge.test.tsx`.
- Updated `ROADMAP_CHECKLIST.md` to mark bridge protocol and development-only runtime gate done.

## Debugging Evidence

- Red: `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  failed with six expected `createAgentUIBridgeGate is not a function` /
  `useAgentUIBridge is not a function` failures.
- Green: adding the bridge module, provider hook, and exports made the same focused Jest command
  pass with 7 tests.
- Red: `cmd /c npm.cmd run typecheck --workspaces --if-present` failed because the example app
  resolved stale built `@agent-ui/core` declarations without the new bridge exports and provider
  prop.
- Green: `cmd /c npm.cmd run build --workspace @agent-ui/core` regenerated declarations, and the
  same workspace typecheck command passed.

## Verification Completed

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  exited `0`; 7 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; 4 suites and 31 tests passed.
- `git diff --check` exited `0`.
- A PowerShell forbidden-import scan of `packages/core/src` found no `expo-constants`, `@expo/ui`,
  Expo Router, React Navigation, MCP SDK, native modules, old parser assets, tree-sitter, WASM, VS
  Code, or Canvas renderer code.

## Known Concerns

- This task did not implement WebSocket transport, pairing handshake, origin validation, sessions,
  heartbeat, event log, or audit logging.
- Core intentionally does not import Expo Constants. The future app/adapter bridge layer must pass
  trustworthy `executionEnvironment` evidence into the gate.
- LAN mode is structurally gated with `unsafeAllowLAN`, but the future Node bridge listener still
  must bind loopback by default and implement token/origin checks.

## What The Next Agent Must Do First

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/TASK.md`.
4. Read `docs/reference/agent/mcp-transport-architecture.md`.
5. Read `docs/reference/agent/security-privacy.md`.
6. Check `git status --short --branch`.
7. Use `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` before fixing any bug,
   failed command, blocked verification, runner environment issue, bridge/MCP failure, or flaky
   async behavior, and apply its TTD/TDD red-green rule.

## Suggested Next Target

- Create the next bounded Stage 4 task for the loopback-first app bridge session model: session
  ids, hello/heartbeat envelopes, pairing-token validation shape, and in-memory event log contract.
  Keep MCP tools separate until Stage 5.

## What The Next Agent Must Not Do

- Do not implement MCP tools yet.
- Do not add `@modelcontextprotocol/sdk` until Stage 5 server code imports it.
- Do not add native modules or config-plugin mutations for this JS-only bridge path.
- Do not make Expo Router, React Navigation, `@expo/ui`, or Expo Constants mandatory imports in
  `packages/core`.
- Do not fallback to screenshots or coordinates as the primary control model.
- Do not recreate old SwiftUI parser, resolver, tree-sitter, WASM, VS Code extension, or Canvas
  renderer assets.
