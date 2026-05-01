# Runtime Prompt Status

Updated: 2026-05-01

## Status

Runtime prompts are in status-only mode after completing the first Stage 4 bridge slice: bridge
protocol contracts and the development-only runtime gate.

The old Stage 3 recursive resolver traversal task is obsolete. Do not recreate runtime prompts for
parser, resolver, layout, renderer, VS Code WebView, or SwiftUI preview work unless the developer
explicitly creates a bounded archive/cleanup task.

## Completed Task

- Roadmap Phase: Phase 4 - Agent Tool Bridge
- Product Stage: Stage 4 - Agent Tool Bridge
- Task file: `docs/agents/TASK.md`
- Status: `DONE_WITH_CONCERNS`

## Active Runtime Prompts

None.

No `ACTIVE_*.md` files are present. This run completed the bounded Stage 4 bridge protocol/gate
task in-process, so no disposable active prompts were generated. Generate new runtime prompts only
after the next bounded Stage 4 session/heartbeat task is created.

## Prompt Rotation Action

- No active prompt files needed deletion.
- `RUNTIME_STATUS.md` was refreshed because the active task changed from completed Stage 3 runtime
  action dispatch work to completed Stage 4 bridge protocol/gate work.
- The next run should create or refresh `docs/agents/TASK.md` from the next unchecked Stage 4
  bridge roadmap cluster: loopback-first session model, pairing-token validation shape, heartbeat,
  and event log contract.

## Verification Evidence

- Direct Node child-process probe exited `0`.
- Preflight `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- Red/green: focused Jest failed with six expected missing bridge export/hook failures, then passed
  with 7 tests after the bridge module, provider hook, and exports were added.
- Red/green: workspace typecheck failed on stale built core declarations, then passed after
  `@agent-ui/core` was rebuilt.
- Final `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  exited `0`; 7 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; 4 suites and 31 tests passed.
- `git diff --check` exited `0`.
- A PowerShell forbidden-import scan of `packages/core/src` found no `expo-constants`, `@expo/ui`,
  Expo Router, React Navigation, MCP SDK, old parser, tree-sitter, WASM, VS Code, or Canvas
  renderer imports.

## Next Prompt Generation Inputs

Use these files in order:

1. `docs/PROJECT_BRIEF.md`
2. `docs/reference/INDEX.md`
3. `docs/agents/ORCHESTRATION.md`
4. `docs/agents/PHASE_STATE.md`
5. `docs/agents/HANDOFF.md`
6. `docs/agents/ROADMAP_CHECKLIST.md`
7. `docs/agents/TASK.md`
8. `docs/agents/REVIEW.md`
9. `docs/agents/REVIEW_CHECKLIST.md`
10. `docs/reference/agent/mcp-transport-architecture.md`
11. `docs/reference/agent/security-privacy.md`
12. `docs/reference/react-native/navigation-adapters.md` only if navigation actions enter the
    bridge task
13. `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` when the run encounters a
    bug, failing command, blocked verification, runner environment failure, bridge/MCP failure, or
    flaky async behavior; apply its TTD/TDD red-green rule before source/config fixes

## Notes

- Stage 4 bridge protocol and development-only runtime gate are complete.
- The bridge does not yet open sockets, perform pairing handshakes, validate WebSocket origins,
  maintain sessions, emit events, or write audit logs.
- MCP server tools remain Stage 5 work.
- Project debugging rules require a TTD/TDD red-green loop for fixes: failing test/probe/command
  before the fix, same check passing after the fix, then broader verification.
