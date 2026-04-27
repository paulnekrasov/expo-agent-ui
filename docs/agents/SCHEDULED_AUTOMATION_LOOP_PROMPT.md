# Scheduled Automation Loop Prompt - Expo Agent UI

Use this prompt only for scheduled or autonomous runs in this repository.

## Mission

Advance the current bounded Expo Agent UI task without reviving old SwiftUI parser work.

## Startup

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `docs/agents/PHASE_STATE.md`.
5. Read `docs/agents/HANDOFF.md`.
6. Read `docs/agents/ROADMAP_CHECKLIST.md`.
7. Read `docs/agents/TASK.md`.
8. Read `docs/agents/REVIEW.md`.
9. Read `docs/agents/runtime-prompts/RUNTIME_STATUS.md`.

## Current Active Task

The active task is Stage 2 component primitives unless `docs/agents/TASK.md` says otherwise.

Do not implement old Stage 3 resolver traversal, tree-sitter extraction, VS Code WebView,
Canvas rendering, or SwiftUI parser work.

## Execution Rules

- Stay inside the file allowlist in `docs/agents/TASK.md`.
- Preserve dirty files outside the task scope.
- Do not recreate old parser assets unless the active task explicitly allows historical archive work.
- Do not install dependencies unless the active task requires it and the verification path needs it.
- If verification cannot run because of runner environment restrictions, record the exact command
  and error in `HANDOFF.md` and finish with `NEEDS_CONTEXT`.
- If verification runs, report exact commands and outcomes.

## Completion Status Tokens

End with exactly one:

- `DONE`
- `DONE_WITH_CONCERNS`
- `NEEDS_CONTEXT`
- `BLOCKED`
