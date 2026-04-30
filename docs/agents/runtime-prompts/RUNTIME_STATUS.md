# Runtime Prompt Status

Updated: 2026-04-30

## Status

Runtime prompts are in status-only mode after completing the Stage 2 `Scroll`, `List`, `Section`,
and `Form` primitive cluster.

The old Stage 3 recursive resolver traversal task is obsolete. Do not recreate runtime prompts
for parser, resolver, layout, renderer, VS Code WebView, or SwiftUI preview work unless the
developer explicitly creates a bounded archive/cleanup task.

## Completed Task

- Roadmap Phase: Phase 2 - Component Primitives
- Product Stage: Stage 2 - Component Primitives
- Task file: `docs/agents/TASK.md`
- Status: `DONE_WITH_CONCERNS`

## Active Runtime Prompts

None.

No `ACTIVE_*.md` files are present. The current run completed the task in-process, so no disposable
active prompts were generated. Generate new runtime prompts only after a new bounded Stage 2 task is
created.

## Prompt Rotation Action

- No active prompt files needed deletion.
- `RUNTIME_STATUS.md` was refreshed because the active task changed and then completed.
- The next run should create or refresh `docs/agents/TASK.md` from the next unchecked Stage 2
  roadmap cluster before generating disposable active prompts.

## Verification Evidence

- Direct Node child-process probe exited `0`.
- Preflight `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- Final `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `cmd /c npx.cmd expo-doctor` in `packages/example-app` passed all 18 checks after dependency
  alignment.
- `cmd /c npx.cmd tsc --noEmit -p packages/example-app/tsconfig.json` exited `0`.
- `git diff --check` exited `0`.
- Forbidden-import scan of `packages/core/src` found no `@expo/ui`, Expo Router,
  React Navigation, MCP SDK, old parser, tree-sitter, WASM, VS Code, or Canvas renderer imports.

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
10. `docs/reference/react-native/accessibility-semantics.md`
11. `docs/reference/design/control-chrome.md`
12. `docs/reference/expo/expo-ui-swift-ui.md` if adapter boundaries are relevant
13. `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` when the run encounters a
    bug, failing command, blocked verification, runner environment failure, bridge/MCP failure, or
    flaky async behavior

## Notes

- Stage 2 remains in progress. The next task should cover `Toggle`, `Slider`, `Picker`, and
  `Stepper`.
- The authorized React typings pass is complete: workspace `@types/react` is installed, the local
  shim was removed, and the example app typecheck script now runs real TypeScript.
- The example app build/test scripts remain placeholders until an Expo build target configuration
  and React Native test harness are added.
- `Scroll`, `List`, `Section`, and `Form` are React Native-first wrappers with deferred semantic
  metadata only. Real tree snapshots and action dispatch belong to Stage 3.
