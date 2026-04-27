# Runtime Prompt Status

Updated: 2026-04-27

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

## Scheduled Runner Guidance

If automation runs with a child-process-blocked environment, record the exact failure and finish
with `NEEDS_CONTEXT`. Do not classify that as a package-foundation source regression.

If verification is available, Stage 2 component primitives should use the commands specified in
`docs/agents/TASK.md`, or explain why package scripts are not available yet.

## Notes

- Research outputs already exist under `docs/reference/**`.
- The research coordinator report is
  `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`.
- Old parser assets have been cleaned from active context; do not recreate them unless a
  historical archive task is explicitly active.
