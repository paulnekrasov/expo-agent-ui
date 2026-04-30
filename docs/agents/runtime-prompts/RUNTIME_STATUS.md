# Runtime Prompt Status

Updated: 2026-04-30

## Status

Runtime prompts are in status-only mode after completing the Stage 2 `Toggle`, `Slider`, `Picker`,
and `Stepper` primitive cluster.

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
active prompts were generated. Generate new runtime prompts only after a new bounded Stage 3 task is
created.

## Prompt Rotation Action

- No active prompt files needed deletion.
- `RUNTIME_STATUS.md` was refreshed because the active task changed and completed.
- The next run should create or refresh `docs/agents/TASK.md` from the first unchecked Stage 3
  semantic-runtime roadmap cluster before generating disposable active prompts.

## Verification Evidence

- Direct Node child-process probe exited `0`.
- Preflight `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- Red/green: workspace typecheck failed on stale `@agent-ui/core` `dist` declarations, then passed
  after `cmd /c npm.cmd run build --workspace @agent-ui/core`.
- Red/green: focused example tests failed on `Toggle` role querying, then advanced after `Toggle`
  explicitly set `accessible`.
- Red/green: focused example tests failed on hidden stepper press targets, then passed after visible
  press targets stopped being marked accessibility-hidden.
- Final `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; the example app reported 2 suites and
  5 tests passing.
- `git diff --check` exited `0`.
- A PowerShell forbidden-import scan of `packages/core/src` found no `@expo/ui`, Expo Router,
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
11. `docs/reference/agent/security-privacy.md`
12. `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` when the run encounters a
    bug, failing command, blocked verification, runner environment failure, bridge/MCP failure, or
    flaky async behavior; apply its TTD/TDD red-green rule before source/config fixes

## Notes

- Stage 2 component primitives are complete with deferred semantic-runtime concerns.
- Stage 3 should begin with semantic node schema and registry mount/unmount behavior, not bridge or
  MCP work.
- `Slider`, `Picker`, and `Stepper` are dependency-free React Native fallback controls. Native
  hosted equivalents belong behind optional Stage 7 adapter boundaries.
- Project debugging rules require a TTD/TDD red-green loop for fixes: failing test/probe/command
  before the fix, same check passing after the fix, then broader verification.
- `rg.exe` cannot launch in the desktop runner, but PowerShell search fallback and npm verification
  are available.
