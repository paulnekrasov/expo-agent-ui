# Runtime Prompt Status

Updated: 2026-04-30

## Status

Runtime prompts are in status-only mode after the Expo Agent UI rebuild pivot.

The old Stage 3 recursive resolver traversal task is obsolete. Do not recreate runtime prompts
for parser, resolver, layout, renderer, VS Code WebView, or SwiftUI preview work unless the
developer explicitly creates a bounded archive/cleanup task.

## Active Task

The active bounded task is:

- Roadmap Phase: Phase 2 - Component Primitives
- Product Stage: Stage 2 - Component Primitives
- Task file: `docs/agents/TASK.md`

## Active Runtime Prompts

None.

Generate new `ACTIVE_*.md` runtime prompts only if a scheduled or autonomous run is going to
execute the active Stage 2 component primitives task.

The stable scheduled automation prompt has been refactored for the full Expo Agent UI lifecycle at
`docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md`. It keeps the legacy automation memory path
`C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md` intentionally.

## Prompt Generation Inputs

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
11. `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` when the run encounters a
    bug, failing command, blocked verification, runner environment failure, bridge/MCP failure, or
    flaky async behavior

## Scheduled Runner Guidance

If automation runs with a child-process-blocked environment, record the exact failure and finish
with `NEEDS_CONTEXT`. Do not classify that as a package-foundation source regression.

Do not classify `rg.exe` access denial alone as a runner blocker if PowerShell search and npm
verification still work. Use the systematic debugging adapter to distinguish current-run
environment blockers from source failures.

If verification is available, Stage 2 component primitives should use the commands specified in
`docs/agents/TASK.md`, or explain why package scripts are not available yet.

## Notes

- Research outputs already exist under `docs/reference/**`.
- The research coordinator report is
  `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`.
- Old parser assets have been cleaned from active context; do not recreate them unless a
  historical archive task is explicitly active.
