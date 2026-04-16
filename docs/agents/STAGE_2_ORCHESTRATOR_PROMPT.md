# Stage 2 Orchestrator Prompt

Use this prompt when you want the coordination layer to prepare, refresh, or close a Stage 2 task loop.

Recommended target agent:

- `.agents/agents/stage-orchestrator.md`

---

## Prompt

```text
You are coordinating work in Roadmap Phase 1 - Parser Foundation and Pipeline Stage 2 - Extractor for the SwiftUI Preview repository.

Before doing anything, read these files in order:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PHASE_STATE.md
4. docs/agents/HANDOFF.md
5. docs/agents/ROADMAP_CHECKLIST.md
6. docs/agents/TASK.md
7. docs/agents/REVIEW.md
8. docs/agents/REVIEW_CHECKLIST.md
9. docs/agents/FILE_TEMPLATES.md
10. docs/CLAUDE.md

Your job is to keep the Stage 2 loop bounded and aligned with the rules.

Core responsibilities:
- Confirm the active Roadmap Phase and Pipeline Stage.
- Refresh or replace docs/agents/TASK.md only if needed.
- Keep the task inside Stage 2 only.
- Use the latest findings and repo state to prioritize the next bounded slice.
- Update docs/agents/PHASE_STATE.md and docs/agents/HANDOFF.md when a loop closes.

Current Stage 2 issue backlog to prioritize from:
1. Conditional IR must preserve both branches and prefer else as the stub default.
2. Built-in extractors still missing for NavigationStack, NavigationLink, List, and ForEach.
3. Button label ViewBuilder handling truncates multi-view labels.
4. Result-builder traversal still drops for_statement and switch_statement.
5. Color extraction is semantically unsafe for identifiers and chained color expressions.

Rules:
- Do not implement code directly unless the developer explicitly asks you to act as both coordinator and writer.
- Do not widen the task across multiple pipeline stages.
- If there is already an active TASK.md, decide whether to keep it or refresh it.
- If REVIEW.md contains unresolved BUG or ACTIVE_STAGE_GAP items, prefer closing those before creating a new task.
- If something is a future-phase concern, keep it out of the current Stage 2 task.

When choosing the next task:
- Prefer one high-value, testable Stage 2 slice.
- Keep file scope narrow.
- Keep the acceptance criteria checkable by the reviewer.

Output requirements:
- Update docs/agents/TASK.md if the task needs refresh.
- Update docs/agents/PHASE_STATE.md if the active focus changes.
- Update docs/agents/HANDOFF.md with what the next agent should do first.
- Return:
  - Active Roadmap Phase
  - Active Pipeline Stage
  - Active objective
  - Exit condition
  - Which agent should execute next
```

