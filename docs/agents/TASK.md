# TASK SPECIFICATION
Created by: scheduled-run coordinator
Date: 2026-05-01
Roadmap Phase: Phase 5 - MCP Server
Product Stage: Stage 5 - MCP Server (sixth slice - final Stage 5 items)
Research Area: MCP transport architecture, platform skill MCP surface, security/privacy

## Objective

Complete all remaining Stage 5 MCP server items:
- Register scroll, navigate, runFlow as MCP runtime-control tools.
- Add read-only MCP resources for sessions and diagnostics.
- Add MCP schema validation tests.
- Mark Stage 5 as complete on the roadmap checklist.

## Acceptance Criteria

- [x] Register scroll MCP tool in `packages/mcp-server/src/cli.ts`:
  - Session required (fail-closed with SESSION_NOT_CONNECTED).
  - Required `id` (string), optional `sessionId`, `direction`, `amount`, `targetId`, `timeoutMs`.
  - Routes through `session.sendCommand()` with `type: "scroll"`.
  - Error codes: `NODE_NOT_FOUND`, `NOT_SCROLL_CONTAINER`, `DIRECTION_UNSUPPORTED`, `COMMAND_FAILED`.
- [x] Register navigate MCP tool in `packages/mcp-server/src/cli.ts`:
  - Session required.
  - Optional `sessionId`, `screen`, `route`, `params`, `replace`, `timeoutMs`.
  - Routes through `session.sendCommand()` with `type: "navigate"`.
  - Error codes: `NAVIGATION_UNAVAILABLE`, `ROUTE_NOT_FOUND`, `PARAMS_INVALID`, `COMMAND_FAILED`.
- [x] Register runFlow MCP tool in `packages/mcp-server/src/cli.ts`:
  - Session required.
  - Optional `sessionId`, `name`, `steps` (array of flow steps), `stopOnFailure`, `timeoutMs`.
  - Routes through `session.sendCommand()` with `type: "runFlow"`.
  - Error codes: `FLOW_NOT_FOUND`, `STEP_FAILED`, `TIMEOUT`, `COMMAND_FAILED`.
- [x] Add read-only MCP resources for sessions and diagnostics:
  - `agent-ui://sessions` - current active session metadata.
  - `agent-ui://diagnostics` - listener, bridge, and server diagnostics.
  - Both return metadata even when no session is active (not error states).
- [x] Update `packages/mcp-server/src/manifest.ts`:
  - Moved `scroll`, `navigate`, `runFlow` from `deferredTools` to `implementedTools`.
  - `deferredTools` is now empty. Stage 5 runtime-control tool surface is complete.
- [x] Update `packages/mcp-server/test/mcp-server.test.js` (9 new tests):
  - scroll returns SESSION_NOT_CONNECTED without session.
  - navigate returns SESSION_NOT_CONNECTED without session.
  - runFlow returns SESSION_NOT_CONNECTED without session.
  - listTools returns 13 tools (9 runtime-control + 4 skill-context).
  - All 13 tools have valid inputSchemas with type: "object".
  - All 13 tools have non-empty descriptions.
  - ListResources includes sessions and diagnostics URIs.
  - ReadResource for sessions URI returns metadata even without session.
  - ReadResource for diagnostics URI returns server metadata.
- [x] No imports of `@expo/ui`, Expo Router, React Navigation, react, react-native, old parser
  assets, tree-sitter, WASM, VS Code, or Canvas renderer code.
- [x] Existing typecheck, build, and all tests continue to pass.

## File Allowlist

- `packages/mcp-server/src/cli.ts`
- `packages/mcp-server/src/manifest.ts`
- `packages/mcp-server/test/mcp-server.test.js`
- `docs/agents/TASK.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/REVIEW.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md`

## Out Of Scope

- Bridge-level scroll/navigate/runFlow implementation in `packages/core` (the MCP server delegates to
  `sendCommand`; the bridge dispatcher handles the runtime behavior).
- Processing `includeBounds` or `rootId` in `inspectTree` (deferred).
- Dynamic sub-file template URIs for platform skills (deferred).
- Dynamic INDEX.md parsing (deferred).
- Expo SDK version bump (deferred to dedicated dependency pass).
- Adding `@expo/ui`, Expo Router, React Navigation, native module, or config-plugin imports.
- Old parser, resolver, tree-sitter, WASM, VS Code extension, or Canvas renderer work.

## Verification Commands

```powershell
cmd /c npm.cmd run typecheck --workspaces --if-present
cmd /c npm.cmd run build --workspaces --if-present
cmd /c npm.cmd test --workspace @agent-ui/mcp-server -- --runInBand
cmd /c npm.cmd test --workspaces --if-present
cmd /c npm.cmd audit --audit-level=moderate
git diff --check
```

## Status

DONE
