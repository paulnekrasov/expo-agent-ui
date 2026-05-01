# TASK SPECIFICATION
Created by: scheduled-run coordinator
Date: 2026-05-01
Last updated: 2026-05-01
Roadmap Phase: Phase 4 - Agent Tool Bridge
Product Stage: Stage 4 - Agent Tool Bridge
Research Area: Agent bridge transport architecture and security/privacy

## Objective

Implement the first bounded Stage 4 bridge slice: define the JS-only bridge protocol contracts and
development-only runtime gate exposed through `AgentUIProvider`.

Keep the work inside Stage 4. Do not implement WebSocket transport, MCP server tools, Node bridge
listeners, navigation adapters, flow runner, Reanimated motion, Expo UI adapters, native modules,
or old parser assets.

## Status

DONE_WITH_CONCERNS

## Acceptance Criteria

- [x] Preserve Stage 2 primitives and Stage 3 semantic registry behavior.
- [x] Add public bridge protocol/gate types for protocol version, transport mode, execution
  environment, capabilities, and structured gate result codes.
- [x] Add a pure JS gate that enables bridge control only when explicitly configured, `__DEV__`
  is true, execution environment is non-standalone, a pairing token is present, and the URL policy
  is accepted.
- [x] Keep default bridge posture fail-closed: disabled by default, disabled outside development,
  disabled for standalone/unknown execution environments, disabled for missing tokens, and disabled
  for LAN/tunnel URLs unless a documented explicit unsafe LAN option is used.
- [x] Expose the gate result through `AgentUIProvider` and a hook without opening sockets or
  serializing semantic trees.
- [x] Do not import `expo-constants`, `@expo/ui`, Expo Router, React Navigation, MCP SDK, native
  modules, old parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code in
  `@agent-ui/core`.
- [x] Add focused tests for default-disabled, development-enabled loopback, production disabled,
  standalone disabled, missing-token disabled, LAN rejection, explicit LAN opt-in, tunnel rejection,
  and provider hook exposure.

## Implementation Summary

- Added `packages/core/src/bridge.ts` with protocol version `1`, bridge capability, transport,
  execution-environment, config, gate-result, and result-code contracts.
- Added `createAgentUIBridgeGate(config?, options?)` as a pure JS fail-closed runtime gate.
- Required explicit `enabled: true`, `__DEV__` development mode, known non-standalone execution
  environment, non-empty pairing token, and valid `ws://` / `wss://` URL before the gate enables.
- Kept loopback and Android emulator host URLs safe by default, required `unsafeAllowLAN: true` for
  LAN mode, and rejected tunnel mode for v0.
- Exposed the resolved bridge gate in `AgentUIProvider` context and `useAgentUIBridge()` without
  opening a network socket.
- Exported bridge constants, functions, and types from `@agent-ui/core`.
- Added focused React Native Testing Library/Jest coverage in
  `packages/example-app/app/agent-ui-bridge.test.tsx`.

## File Allowlist Used

- `packages/core/src/bridge.ts`
- `packages/core/src/semantic.tsx`
- `packages/core/src/index.ts`
- `packages/example-app/app/agent-ui-bridge.test.tsx`
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

Focused red/green:

- Red: `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  failed with six expected `createAgentUIBridgeGate is not a function` /
  `useAgentUIBridge is not a function` failures.
- Green: adding the bridge module, provider hook, and exports made the same focused command pass
  with 7 tests.
- Red: workspace typecheck failed because the example app resolved stale built `@agent-ui/core`
  declarations without the new bridge exports and provider prop.
- Green: `cmd /c npm.cmd run build --workspace @agent-ui/core` regenerated declarations, and the
  same workspace typecheck passed.

Final verification:

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  exited `0`; 7 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; 4 suites and 31 tests passed.
- `git diff --check` exited `0`.
- A PowerShell forbidden-import scan of `packages/core/src` found no `expo-constants`, `@expo/ui`,
  Expo Router, React Navigation, MCP SDK, old parser, tree-sitter, WASM, VS Code, or Canvas
  renderer imports.

## Concerns

- This slice defines and exposes the bridge gate only; it does not open a WebSocket, perform a
  handshake, validate WebSocket origins, maintain sessions, or emit bridge audit logs.
- `executionEnvironment` is caller-supplied in core to avoid importing Expo Constants directly; a
  later bridge/provider integration must pass Expo runtime evidence from an adapter or app layer.
- LAN mode is structurally gated with `unsafeAllowLAN`, but the future Node bridge listener still
  must bind loopback by default and implement pairing/origin checks before tool control works.

## Out Of Scope Preserved

- Opening a WebSocket connection from the app.
- Implementing a Node bridge listener.
- Implementing MCP tools or adding the MCP SDK dependency.
- Adding Expo Constants imports to core.
- Adding native modules or config-plugin mutations.
- Supporting tunnel mode for semantic control.
- Navigation adapters, flow runner, screenshots, coordinates, or old parser historical archive
  work.

## Next Candidate Task

Implement the next bounded Stage 4 task for the loopback-first app bridge session model:
session ids, hello/heartbeat envelopes, pairing-token validation shape, and an in-memory event log
contract, still without MCP tools.
