# Multi-Agent Launch Guide - Expo Agent UI

This file explains how to launch the Expo Agent UI workflow from one prompt and how to use
multiple agents safely.

## Short Version

Use one coordinator, one writer at a time, and read-only specialists in parallel only when
their work cannot conflict with source edits.

State passes through `docs/agents/*`, not chat memory.

## Recommended Loop

1. `stage-orchestrator`
2. stage-specific implementer
3. `phase-reviewer`
4. `issue-fixer` if needed
5. `phase-reviewer`
6. `stage-orchestrator`

## Current Active Loop

The current bounded task is Stage 2 component primitives.

Useful specialist roles:

- component primitives implementer
- research librarian, read-only
- phase reviewer
- issue fixer

Use `cleanup-archivist` only for explicit cleanup/archive tasks. Do not recreate old parser,
resolver, layout, renderer, or VS Code specialists.

## Safe Parallel Patterns

Allowed:

- reviewer + read-only research librarian
- coordinator + read-only status inspection
- implementation + separate read-only API research when no files overlap

Not allowed:

- two writer agents editing the same workspace slice,
- implementer and fixer at the same time,
- package foundation and component implementation in one task,
- MCP server implementation before runtime capabilities exist.

## Single-Prompt Launch Example

```text
Use stage-orchestrator as coordinator for the Expo Agent UI rebuild.
Read docs/PROJECT_BRIEF.md, docs/reference/INDEX.md, docs/agents/ORCHESTRATION.md,
docs/agents/PHASE_STATE.md, docs/agents/HANDOFF.md, docs/agents/ROADMAP_CHECKLIST.md,
and docs/agents/TASK.md.
Run exactly one bounded loop for the active task.
Keep one writer at a time.
Preserve unrelated dirty files.
Do not resume old SwiftUI parser/resolver work.
Update TASK.md, REVIEW.md, PHASE_STATE.md, HANDOFF.md, and RUNTIME_STATUS.md before finishing.
```

## Scheduled Automation Launch Example

```text
Run the scheduled Expo Agent UI agent loop.
Read the active state files first.
Determine the active phase and product stage from docs/agents/TASK.md.
If verification is blocked by the runner environment, capture the exact command and error and
finish with NEEDS_CONTEXT.
If the task completes, update REVIEW.md, PHASE_STATE.md, HANDOFF.md, and RUNTIME_STATUS.md.
Do not recreate runtime prompts for old parser/resolver work.
```

## File Baton

- `TASK.md` is the current bounded task.
- `REVIEW.md` is the reviewer output.
- `HANDOFF.md` is the next-step note.
- `PHASE_STATE.md` is durable live state.
- `RUNTIME_STATUS.md` controls disposable runtime prompts.

## Rule Of Thumb

When unsure, launch one coordinator and ask it to choose one bounded task from
`ROADMAP_CHECKLIST.md`. Do not allow more than one writer at a time.
