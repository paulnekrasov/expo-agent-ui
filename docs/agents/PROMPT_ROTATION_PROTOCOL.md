# Prompt Rotation Protocol - Expo Agent UI

This file defines how scheduled or autonomous agent runs should manage prompt files.

The goal is to refresh active prompts without damaging the stable prompt library or research
outputs.

## Prompt Classes

### Stable Prompt Library

Reusable prompt files and guides live under `docs/agents/` and should not be deleted during
routine automation.

Examples:

- `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`
- `docs/agents/CONTEXT_ENGINEERING_SYSTEM_TEMPLATE.md`
- `docs/agents/research-prompts/expo-agent-ui/**`
- `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md`
- `docs/agents/DEEP_DEBUGGING_AUTONOMOUS_AGENT_LOOP_PROMPT.md`
- `docs/agents/MULTI_AGENT_LAUNCH_GUIDE.md`

### Runtime Prompts

Disposable prompts for the current bounded task live only under:

- `docs/agents/runtime-prompts/`

Allowed runtime files:

- `ACTIVE_COORDINATOR_PROMPT.md`
- `ACTIVE_IMPLEMENTER_PROMPT.md`
- `ACTIVE_REVIEW_PROMPT.md`
- `ACTIVE_FIX_PROMPT.md`
- `RUNTIME_STATUS.md`

## Rotation Triggers

Rotate runtime prompts when:

- the active task in `TASK.md` changes,
- the active roadmap phase or product stage changes,
- the active task completes,
- the reviewer marks the task blocked,
- acceptance criteria change materially,
- current prompts drift from `PROJECT_BRIEF.md`, `PHASE_STATE.md`, `TASK.md`, or `REVIEW.md`.

Do not rotate just because another scheduled run started.

## Rotation Algorithm

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `PHASE_STATE.md`, `TASK.md`, `REVIEW.md`, and `HANDOFF.md`.
5. Decide whether the current bounded task is still live.
6. If the task changed or completed:
   - delete obsolete `ACTIVE_*.md` files under `docs/agents/runtime-prompts/`,
   - preserve `README.md`,
   - write a fresh `RUNTIME_STATUS.md`.
7. Generate new `ACTIVE_*.md` prompts only for the active bounded task.

Use `docs/reference/agent/platform-skills/context-prompt-engineering/SKILL.md` when rewriting
stable workflow prompts or runtime prompts. Use
`docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` when the rotation is caused by
a bug, failing command, blocked verification, or runner environment failure.

## Runtime Prompt Quality Bar

Each active runtime prompt must include:

- roadmap phase,
- product stage,
- objective,
- exit condition,
- file allowlist,
- required docs to read,
- verification commands,
- debugging skill to load before fixing failures,
- TTD/TDD red-green requirement for bug, security, tooling, runner, bridge, MCP, or flaky async
  fixes,
- required final status token.

## Deletion Safety Rule

Only delete prompt files under:

- `docs/agents/runtime-prompts/`

Never delete:

- stable prompt library files,
- research prompt files,
- research reports under `docs/reference/**`,
- agent definitions under `.agents/agents/`,
- roadmap or live state files,
- old parser assets outside a dedicated historical archive task.

## Current Pivot Rule

The old SwiftUI parser Stage 3 resolver task is obsolete. Runtime prompt rotation must not
recreate prompts for old parser/resolver work unless the developer explicitly asks for an
archive or cleanup task.
