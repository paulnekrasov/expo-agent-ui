# Agent Orchestration Protocol - Expo Agent UI

This file defines how agents coordinate work in this repository after the Expo Agent UI
rebuild pivot.

## Canonical Terms

- `Roadmap Phase`: delivery progress across the rebuild.
- `Product Stage`: the current implementation slice.
- `Research Area`: the documentation or technical domain that informs the task.

Example:

- `Roadmap Phase: Phase 1 - Package Foundation`
- `Product Stage: Stage 1 - Package Foundation`
- `Research Area: Expo package foundation`

## Source-Of-Truth Order

1. `docs/PROJECT_BRIEF.md`
2. `docs/reference/INDEX.md`
3. `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`
4. `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`
5. `docs/agents/ROADMAP_CHECKLIST.md`
6. `docs/agents/PHASE_STATE.md`
7. `docs/agents/TASK.md`
8. `docs/agents/REVIEW_CHECKLIST.md`
9. `docs/agents/REVIEW.md`
10. `docs/agents/HANDOFF.md`
11. `docs/agents/FILE_TEMPLATES.md`

If files appear to disagree:

- treat `PROJECT_BRIEF.md` as the product rulebook,
- treat `INDEX.md` as the reference router,
- treat `RESEARCH_STATUS.md` as the current research state,
- treat `ROADMAP_CHECKLIST.md` and `PHASE_STATE.md` as the live execution layer,
- treat old SwiftUI parser guidance as obsolete unless a cleanup/archive task says otherwise.

## File Roles

### `ROADMAP_CHECKLIST.md`

Distilled execution roadmap for the Expo Agent UI rebuild.

### `PHASE_STATE.md`

Live repo state. It should answer:

- which roadmap phase is active,
- which product stage is active,
- what was completed recently,
- what is in progress,
- what is blocked,
- what the next agent should do first.

### `TASK.md`

Single active bounded task.

Rules:

- one bounded task at a time,
- exactly one product stage per implementation task,
- explicit acceptance criteria,
- explicit file allowlist,
- explicit out-of-scope section.

### `REVIEW.md`

Living review report for the active task.

Use these finding classes only:

- `BUG`
- `ACTIVE_STAGE_GAP`
- `FUTURE_STAGE_GAP`
- `RESEARCH_GAP`
- `SECURITY_GAP`
- `BLOCKED`

Do not label future-stage work as a current bug.

### `HANDOFF.md`

Short operational note for the next agent.

### `FILE_TEMPLATES.md`

Canonical templates for mutable workflow files. Keep terminology aligned with this protocol.

### `PROMPT_ROTATION_PROTOCOL.md`

Rules for stable prompt library files and disposable runtime prompts. Still applies, but prompt
content must target Expo Agent UI stages.

## Default Loop

1. Orchestrator reads brief, router, research status, live state, and roadmap.
2. Orchestrator writes or refreshes one bounded `TASK.md`.
3. Implementer completes only the bounded task and updates `HANDOFF.md`.
4. Reviewer uses `REVIEW_CHECKLIST.md` and writes `REVIEW.md`.
5. Fixer resolves only `BUG`, `ACTIVE_STAGE_GAP`, and accepted `SECURITY_GAP` items.
6. Reviewer re-checks once.
7. Orchestrator updates `PHASE_STATE.md`.

## Loop Guardrails

- One writer at a time for source files.
- Read-only research and review can happen in parallel.
- Maximum of two fix cycles per task before splitting or escalating.
- Never combine unrelated product stages in one implementation task.
- Never use chat history as durable state.
- Never recreate old parser assets except in a dedicated historical archive task.
- Never treat low-priority future research as an MVP blocker.
- Preserve research concerns as implementation gates when relevant.

## Verification Rules

- Documentation-only tasks must be verified by reading changed files and checking that routing
  no longer points at obsolete work.
- Package tasks must run the stage-defined package verification commands.
- Semantic runtime tasks must include focused tests for registry behavior, accessibility mapping,
  redaction, and action dispatch.
- Bridge/MCP tasks must include security-gate tests before being marked complete.
- If an environment-level failure blocks verification, record the exact command and error in
  `HANDOFF.md` and `REVIEW.md`.

## Startup Contract

At the start of any coding or review session:

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read this file.
4. Read `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and
   `docs/agents/ROADMAP_CHECKLIST.md`.
5. Read `docs/agents/TASK.md` if populated.
6. Read `docs/agents/REVIEW_CHECKLIST.md` for review/fix work.
7. Map the request to Roadmap Phase, Product Stage, and Research Area.
8. Open only the reference docs needed for the active task.
