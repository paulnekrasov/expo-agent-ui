# Context Engineering System Template

Purpose: document the context-engineering system used by this repository and provide a portable
template for similar projects.

Status: stable workflow-library document

Do not use this file as live task memory. Live state belongs in:

- `docs/agents/PHASE_STATE.md`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/HANDOFF.md`

## Core Pattern

This repository uses filesystem-backed context engineering. The agent should not depend on chat
history to know what to do next. It should read a small set of durable files that provide:

- a product brief,
- a reference router,
- a roadmap,
- one active bounded task,
- a review protocol,
- a handoff note,
- and optional role/skill prompts.

The system follows four context layers:

| Layer | Purpose | Files |
|---|---|---|
| Write | Durable instructions and specs | `AGENTS.md`, `docs/PROJECT_BRIEF.md`, `docs/agents/ORCHESTRATION.md` |
| Select | Route only the needed references | `docs/reference/INDEX.md`, `docs/reference/**` |
| Compress | Preserve current state without chat history | `PHASE_STATE.md`, `HANDOFF.md`, `ROADMAP_CHECKLIST.md` |
| Inject | Load just-in-time role/task instructions | `.agents/agents/*.md`, `docs/agents/runtime-prompts/*`, skills |

## Source-Of-Truth Order

For this repository:

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

If files disagree, prefer the brief for product rules, the index for reference routing, and the
live state files for what is active now.

## Bounded Task Contract

Every implementation task should fit this prompt schema:

```text
Role / Context:
You are the <stage specialist> for <project>.

Task:
Complete exactly one bounded task: <objective>.

Constraints:
- Stay inside <file allowlist>.
- Do not implement <out of scope>.
- Preserve unrelated dirty worktree changes.
- Use <reference docs>.

Output Format:
- Update changed files.
- Run <verification command>.
- Update HANDOFF/PHASE_STATE/REVIEW as required.
- Report DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
```

## Default Loop

1. Orchestrator reads brief, index, roadmap, live state, and handoff.
2. Orchestrator writes or refreshes one bounded `TASK.md`.
3. Implementer completes only that task.
4. Reviewer applies `REVIEW_CHECKLIST.md` and writes `REVIEW.md`.
5. Fixer resolves only `BUG`, `ACTIVE_STAGE_GAP`, and accepted `SECURITY_GAP` items.
6. Reviewer re-checks once.
7. Orchestrator updates `PHASE_STATE.md` and `HANDOFF.md`.

## Agent Role Template

```md
---
name: <agent-name>
description: >
  Use this agent when <specific trigger>. Include concrete product-stage terms and common user
  phrases. State whether the role writes code, docs, or review output.
model: inherit
color: <color>
---

You are the <role> for this repository.

## Responsibilities

1. <responsibility>
2. <responsibility>
3. <responsibility>

## Startup

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `docs/agents/PHASE_STATE.md`.
5. Read `docs/agents/TASK.md`.

## Boundaries

- Do not <forbidden adjacent stage>.
- Do not modify files outside <scope>.

## Output

- <artifact to update>
- <verification to report>
```

## Runtime Prompt Rules

Runtime prompts are disposable. They live under `docs/agents/runtime-prompts/` and must reflect
the active bounded task. Delete or regenerate them when the active task changes materially.

Each runtime prompt must include:

- product stage,
- objective,
- file boundary,
- required references,
- forbidden adjacent work,
- verification commands,
- final status token.

## Review Finding Classes

Use only:

- `BUG`
- `ACTIVE_STAGE_GAP`
- `FUTURE_STAGE_GAP`
- `RESEARCH_GAP`
- `SECURITY_GAP`
- `BLOCKED`

Future-stage work is not a bug in the current task.

## Portable Minimum File Set

```text
AGENTS.md
docs/PROJECT_BRIEF.md
docs/reference/INDEX.md
docs/agents/ORCHESTRATION.md
docs/agents/ROADMAP_CHECKLIST.md
docs/agents/PHASE_STATE.md
docs/agents/TASK.md
docs/agents/REVIEW_CHECKLIST.md
docs/agents/REVIEW.md
docs/agents/HANDOFF.md
.agents/agents/INDEX.md
.agents/agents/stage-orchestrator.md
.agents/agents/phase-reviewer.md
.agents/agents/issue-fixer.md
.agents/agents/research-librarian.md
```

## Maintenance Checks

- Search for obsolete product names after every pivot.
- Check that `TASK.md` describes exactly one bounded task.
- Check that reference routes point to files that exist.
- Check that old implementation assets do not remain in active context.
- Verify before marking work complete.
