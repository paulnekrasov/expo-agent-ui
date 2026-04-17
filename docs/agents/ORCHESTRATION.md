# Agent Orchestration Protocol

This file defines how agents coordinate work in this repository.

It is deliberately separate from `docs/swiftui_planning_full.md`.

- `docs/swiftui_planning_full.md` stays the broad research and strategy source.
- `docs/reference/INDEX.md` stays the router into the reference library.
- `docs/CLAUDE.md` stays the long-lived project brief and architectural rulebook.
- `docs/agents/*` stores mutable execution state.

## Canonical terms

- `Roadmap Phase`: delivery progress across the project.
- `Pipeline Stage`: the runtime pipeline boundary in the implementation.
- `Research Layer`: the documentation or research domain.

Every task should state all three when they matter.

Example:

- `Roadmap Phase: Phase 1 - Parser Foundation`
- `Pipeline Stage: Stage 2 - Extractor`
- `Research Layer: Layer 1 and Layer 2`

## Source-of-truth order

1. `docs/reference/INDEX.md`
2. `docs/CLAUDE.md`
3. `docs/swiftui_planning_full.md`
4. `docs/agents/ROADMAP_CHECKLIST.md`
5. `docs/agents/PHASE_STATE.md`
6. `docs/agents/TASK.md`
7. `docs/agents/REVIEW_CHECKLIST.md`
8. `docs/agents/REVIEW.md`
9. `docs/agents/HANDOFF.md`
10. `docs/agents/FILE_TEMPLATES.md`

If these files appear to disagree:

- treat `INDEX.md` as the router,
- treat `CLAUDE.md` as the architectural brief,
- treat `ROADMAP_CHECKLIST.md` and `PHASE_STATE.md` as the live execution layer,
- treat `swiftui_planning_full.md` as long-form context that may need distillation before action.

## File roles

### `ROADMAP_CHECKLIST.md`

Distilled execution roadmap.

Use it to choose the next bounded task without rereading the entire long-form planning file.

### `PHASE_STATE.md`

Live state of the repo.

It should answer:

- which roadmap phase is active,
- which pipeline stage is active,
- what was completed recently,
- what is in progress,
- what is blocked,
- what the next agent should pick up first.

### `TASK.md`

Single active task specification.

Rules:

- one bounded task at a time,
- exactly one pipeline stage per task,
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
- `BLOCKED`

Do not label future-stage work as a bug.

Reviewers must also use `docs/agents/REVIEW_CHECKLIST.md` and only apply the checklist sections that match the active pipeline stage.

### `HANDOFF.md`

Short agent-to-agent note.

It should capture:

- what changed,
- what was learned,
- what not to redo,
- what the next role should do first.

### `FILE_TEMPLATES.md`

Canonical templates for the mutable workflow files.

Use it to keep terminology and section order consistent across sessions.

### `PROMPT_ROTATION_PROTOCOL.md`

Rules for managing prompt files during scheduled or autonomous runs.

Use it to distinguish:

- stable prompt library files that must remain,
- disposable runtime prompt files that may be deleted and replaced.

## Default loop

Use this bounded loop unless the developer explicitly asks for something else:

1. `Orchestrator` reads the router, live state, and roadmap.
2. `Orchestrator` writes or refreshes `TASK.md`.
3. `Implementer` completes the bounded task and updates `HANDOFF.md`.
4. `Reviewer` uses `REVIEW_CHECKLIST.md` and writes `REVIEW.md`.
5. `Fixer` resolves only `BUG` and `ACTIVE_STAGE_GAP` items.
6. `Reviewer` re-checks once.
7. `Orchestrator` updates `PHASE_STATE.md`.

## Loop guardrails

- One writer at a time for source files.
- Read-only research or review can happen in parallel.
- Maximum of two fix cycles per task before escalating to the developer or splitting the task.
- Never combine parser, layout, and renderer implementation in one task.
- Never use `swiftui_planning_full.md` as a session log.
- Never update `CLAUDE.md` with transient task state that belongs in `docs/agents/*`.
- Never delete stable prompt library files during routine automation runs.
- Only rotate disposable prompt files under `docs/agents/runtime-prompts/`.

## Startup contract

At the start of any coding or review session:

1. Read `docs/reference/INDEX.md`.
2. Read this file.
3. Read `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and `docs/agents/ROADMAP_CHECKLIST.md`.
4. Read `docs/agents/TASK.md` if it is populated.
5. Read `docs/agents/REVIEW_CHECKLIST.md` if the session is a review or fix pass.
6. Read `docs/agents/PROMPT_ROTATION_PROTOCOL.md` if the session is scheduled or will manage runtime prompts.
7. Map the request to `Roadmap Phase`, `Pipeline Stage`, and `Research Layer`.
8. Open only the stage-specific reference docs required for the active task.

## Planning-file relationship

Use the files this way:

- Keep `docs/swiftui_planning_full.md` as the complete strategic and research source.
- Keep `docs/agents/ROADMAP_CHECKLIST.md` as the condensed execution plan.
- If the large planning file gains new important guidance, distill it into the roadmap checklist rather than turning the checklist into another essay.
