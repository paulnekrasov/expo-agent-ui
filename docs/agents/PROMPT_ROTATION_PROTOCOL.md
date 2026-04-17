# Prompt Rotation Protocol

This file defines how scheduled or autonomous agent runs should manage prompt files.

The goal is to let the automation refresh the active prompt set without damaging the stable prompt library.

## The two prompt classes

### Stable prompt library

These are reusable reference prompts and guides.

Examples:

- `docs/agents/STAGE_2_EXECUTION_PROMPT.md`
- `docs/agents/STAGE_2_MASTER_LOOP_PROMPT.md`
- `docs/agents/PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md`
- `docs/agents/MULTI_AGENT_LAUNCH_GUIDE.md`
- `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md`

Rules:

- Keep them under `docs/agents/`.
- Do not delete them during automation runs.
- Update them only when the workflow design itself changes.

### Runtime prompts

These are disposable prompts for the currently active bounded task.

They live only under:

- `docs/agents/runtime-prompts/`

Allowed runtime files:

- `ACTIVE_COORDINATOR_PROMPT.md`
- `ACTIVE_IMPLEMENTER_PROMPT.md`
- `ACTIVE_REVIEW_PROMPT.md`
- `ACTIVE_FIX_PROMPT.md`
- `RUNTIME_STATUS.md`

Rules:

- These files may be deleted and replaced by the automation.
- They must always reflect the current bounded task, not a stale past task.
- They must be regenerated when the active task changes meaningfully.

## Rotation triggers

Rotate the runtime prompt set when any of these is true:

- the active task in `TASK.md` is complete,
- the active phase or stage changed,
- the reviewer marked the task `BLOCKED`,
- the acceptance criteria changed materially,
- the bounded task was split into a different slice,
- the current prompts drifted from `TASK.md`, `PHASE_STATE.md`, or `REVIEW.md`.

Do not rotate just because another scheduled run started. If the same task remains active, refresh in place unless there is real drift.

## Rotation algorithm

1. Read `PHASE_STATE.md`, `TASK.md`, `REVIEW.md`, and `HANDOFF.md`.
2. Decide whether the current bounded task is still the live task.
3. If the task changed or completed:
   - delete obsolete `ACTIVE_*.md` runtime prompt files,
   - preserve `README.md`,
   - write a fresh `RUNTIME_STATUS.md`.
4. Generate new `ACTIVE_*.md` runtime prompts for the next bounded task.
5. Use context-prompt-engineering discipline:
   - explicit role,
   - explicit phase and stage,
   - explicit objective,
   - explicit file and scope boundaries,
   - explicit verification,
   - explicit completion status format.
6. Record prompt rotation in `HANDOFF.md` and, when useful, `PHASE_STATE.md`.

## Prompt generation inputs

Runtime prompts should be derived from:

1. `docs/reference/INDEX.md`
2. `docs/agents/ORCHESTRATION.md`
3. `docs/agents/PHASE_STATE.md`
4. `docs/agents/HANDOFF.md`
5. `docs/agents/ROADMAP_CHECKLIST.md`
6. `docs/agents/TASK.md`
7. `docs/agents/REVIEW.md`
8. `docs/agents/REVIEW_CHECKLIST.md`
9. `docs/CLAUDE.md`
10. stage-specific reference docs from the index

Only inject the minimum stage-specific material needed for the next bounded task.

## Deletion safety rule

Only delete prompt files under:

- `docs/agents/runtime-prompts/`

Never delete:

- stable prompt library files under `docs/agents/`,
- agent definitions under `.agents/agents/`,
- reference docs,
- roadmap or live state files.

## When there is no next task

If the automation cannot seed a new bounded task safely:

- delete obsolete `ACTIVE_*.md` runtime prompt files,
- update `RUNTIME_STATUS.md` to explain why there is no active prompt set,
- mark the state in `HANDOFF.md` and `PHASE_STATE.md`,
- do not leave stale prompts in place.

## Runtime prompt quality bar

Each active runtime prompt must include:

- Roadmap Phase
- Pipeline Stage
- current objective
- exit condition
- file or scope boundary
- required docs to read
- verification commands
- required final status token

## Review responsibility

The coordinator owns prompt rotation.

Implementers, reviewers, and fixers may suggest prompt drift in `HANDOFF.md` or `REVIEW.md`, but they should not delete or rotate runtime prompts unless the active automation task explicitly assigns that work.
