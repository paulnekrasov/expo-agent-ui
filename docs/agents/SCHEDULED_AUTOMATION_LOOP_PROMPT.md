# Scheduled Automation Loop Prompt

Use this prompt when you want a recurring automation to run the agent loop on a schedule.

This prompt is intentionally general. It is not locked to only Stage 2.

It should:

- inspect the current repo state,
- determine the active roadmap phase and pipeline stage,
- run one bounded task loop,
- update the mutable workflow files,
- refresh the runtime agent prompts for the next active task,
- retire obsolete runtime prompts when a task is finished.

Recommended target agent:

- `.agents/agents/stage-orchestrator.md` as the coordinator

Use this prompt in your automation runner or scheduled thread.

---

## Prompt

```text
Run the scheduled agent loop for the SwiftUI Preview repository.

You are the coordinator. Treat this as a recurring automation run, not an open-ended coding session.
Act as `stage-orchestrator` and keep the workflow bounded, stage-gated, and evidence-driven.

Skill rules:
- Always use [$context-prompt-engineering](C:/Users/Asus/.codex/skills/context-prompt-engineering/SKILL.md) when reconciling scope, refreshing `TASK.md`, rotating runtime prompts, or rewriting any `docs/agents/runtime-prompts/ACTIVE_*.md` file.
- Use [$systematic-debugging](C:/Users/Asus/.codex/skills/systematic-debugging/SKILL.md) before fixing any bug, failing test, unexpected behavior, regression, or blocked verification step.
- Use [swiftui-parser-debugging](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/skills/swiftui-parser-debugging/SKILL.md) when the active issue involves pipeline-stage isolation, tree-sitter AST shape, `UnknownNode` fallback behavior, extractor/IR mismatches, or TypeScript strict-mode errors in this repo.
- Use [apple-ecosystem-skill](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/skills/apple-ecosystem-skill/SKILL.md) when the active task depends on SwiftUI semantics, Apple HIG expectations, control behavior, layout contracts, navigation behavior, SF Symbols, or broader Apple-platform interpretation.
- Do not front-load every reference from every skill. Read only the specific skill sections and referenced files needed for the active bounded task.

Before acting, read these files in order:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PROMPT_ROTATION_PROTOCOL.md
4. docs/agents/PHASE_STATE.md
5. docs/agents/HANDOFF.md
6. docs/agents/ROADMAP_CHECKLIST.md
7. docs/agents/TASK.md
8. docs/agents/REVIEW.md
9. docs/agents/REVIEW_CHECKLIST.md
10. docs/CLAUDE.md
11. docs/swiftui_planning_full.md only if the current state files are insufficient to choose the next bounded task

After determining the active Roadmap Phase and Pipeline Stage:
1. Open the first stage-specific reference file from `docs/reference/INDEX.md`.
2. Open any additional governing docs required by the active `TASK.md` and unresolved `REVIEW.md` findings.
3. If the issue is parser, extractor, AST, IR, or typecheck related, read `skills/swiftui-parser-debugging/SKILL.md` and only the specific referenced file(s) it points you to.
4. If the issue depends on SwiftUI or Apple-platform semantics, read `skills/apple-ecosystem-skill/SKILL.md` and only the most relevant reference file(s) it points you to.

Core mission:
1. Determine the active Roadmap Phase and Pipeline Stage from the live repo state.
2. Reconcile whether the current task is still active, already complete, stale, or blocked.
3. Refresh `TASK.md` if needed so it describes exactly one bounded task in exactly one pipeline stage.
4. Run exactly one bounded implementation loop:
   - orchestrate,
   - implement with the correct stage implementer,
   - review,
   - fix only valid current-stage findings if needed,
   - re-review once,
   - update live state.
5. Before finishing, refresh the runtime prompt set for the next active task using context-prompt-engineering discipline.
6. Retire runtime prompts that are no longer needed because their task is complete, blocked, or the stage changed.
7. If the active task completes cleanly, seed the next bounded task in `TASK.md` for the next scheduled run before stopping.

Mandatory workflow rules:
- Respect the repo startup contract and stage boundaries.
- Keep one writer active at a time.
- Read-only review or research may run in parallel only if edits do not conflict.
- Never widen a task across multiple pipeline stages.
- Maximum two fix cycles before marking the task blocked or splitting it.
- Use `docs/agents/TASK.md`, `docs/agents/REVIEW.md`, `docs/agents/PHASE_STATE.md`, and `docs/agents/HANDOFF.md` as the durable memory.
- Never treat `docs/CLAUDE.md` or `docs/swiftui_planning_full.md` as a session log.

Prompt rotation rules:
- Stable prompt files under `docs/agents/*.md` are the library. Do not delete them.
- Disposable runtime prompts live only under `docs/agents/runtime-prompts/`.
- If the current bounded task changed, completed, or became blocked, delete obsolete `docs/agents/runtime-prompts/ACTIVE_*.md` files before writing replacements.
- Regenerate runtime prompt files from the current phase, stage, task, review state, and the context-prompt-engineering discipline.
- If no next bounded task can be seeded safely, clear obsolete runtime prompts and write runtime status instead of leaving stale prompts behind.

Runtime prompt files to manage:
- docs/agents/runtime-prompts/ACTIVE_COORDINATOR_PROMPT.md
- docs/agents/runtime-prompts/ACTIVE_IMPLEMENTER_PROMPT.md
- docs/agents/runtime-prompts/ACTIVE_REVIEW_PROMPT.md
- docs/agents/runtime-prompts/ACTIVE_FIX_PROMPT.md
- docs/agents/runtime-prompts/RUNTIME_STATUS.md

Preferred agent sequence if sub-agents are available:
- stage-orchestrator
- stage-specific implementer
- phase-reviewer
- issue-fixer
- phase-reviewer
- stage-orchestrator

Stage-specific implementer choice:
- Phase 1 Stage 1-2 -> parser-implementer
- Stage 3 -> resolver-implementer
- Stage 4 -> layout-engineer
- Stage 5 -> renderer-engineer
- Stage 6 -> device-frame-engineer
- Stage 7 -> navigation-engineer
- MCP packaging or integration -> mcp-engineer

Research support:
- Use research-librarian only when the bounded task is blocked on missing authoritative references.

Review and fixing rules:
- Review findings must be classified only as `BUG`, `ACTIVE_STAGE_GAP`, `FUTURE_STAGE_GAP`, `RESEARCH_GAP`, or `BLOCKED`.
- Fix only `BUG` and `ACTIVE_STAGE_GAP`.
- Do not silently pull `FUTURE_STAGE_GAP` or later-stage backlog into the current bounded task.

Verification rules:
- If source code changed, run:
  - npm test -- --runInBand
  - npm run build
  - node .\\node_modules\\typescript\\lib\\tsc.js --noEmit
- If only docs or prompt files changed, state that code verification was not required.

Before finishing, you must update:
- docs/agents/TASK.md
- docs/agents/REVIEW.md
- docs/agents/PHASE_STATE.md
- docs/agents/HANDOFF.md
- docs/agents/runtime-prompts/RUNTIME_STATUS.md

Final response format:
- Start with: "Running the scheduled agent loop..."
- Summarize:
  - active phase,
  - active stage,
  - task executed,
  - review outcome,
  - whether prompts were rotated,
  - what the next scheduled run should pick up first
- End with exactly one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

---

## Usage note

Use this prompt when the scheduler should decide the next bounded task from repo state rather than being hard-coded to one stage or one issue cluster.
