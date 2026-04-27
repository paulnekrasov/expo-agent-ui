# Runtime Prompts

This directory is for disposable prompt files that describe the currently active bounded task.

It is managed by the scheduled agent loop.

## Important distinction

Stable prompt library:

- lives under `docs/agents/`
- should not be deleted during normal automation runs

Runtime prompt set:

- lives only under this directory
- may be deleted and replaced when the active task changes or completes

## Intended files

- `ACTIVE_COORDINATOR_PROMPT.md`
- `ACTIVE_IMPLEMENTER_PROMPT.md`
- `ACTIVE_REVIEW_PROMPT.md`
- `ACTIVE_FIX_PROMPT.md`
- `RUNTIME_STATUS.md`

## Rules

- Keep only prompts relevant to the current bounded task.
- Remove stale `ACTIVE_*.md` files before writing replacements when the task changes materially.
- Do not store long-term planning here.
- Do not treat this directory as an archive.

Long-lived workflow guidance belongs in:

- `docs/agents/ORCHESTRATION.md`
- `docs/agents/PROMPT_ROTATION_PROTOCOL.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/HANDOFF.md`

This directory is intentionally ephemeral.
