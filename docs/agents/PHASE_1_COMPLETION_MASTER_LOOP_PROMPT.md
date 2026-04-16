# Phase 1 Completion Master Loop Prompt

Use this prompt when you want one launch instruction to cover the remaining Phase 1 backlog across:

- Pipeline Stage 1 / parser validation and resilience work
- Pipeline Stage 2 / extractor correctness and fixture coverage work

Use this instead of the Stage 2-only loop when the findings span both parser infrastructure and extraction behavior.

Recommended target agent:

- `.agents/agents/stage-orchestrator.md` as coordinator

---

## Prompt

```text
Run the remaining Phase 1 completion loop for the SwiftUI Preview repository.

You are the coordinator. Work in Roadmap Phase 1 - Parser Foundation only.

Before acting, read:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PHASE_STATE.md
4. docs/agents/HANDOFF.md
5. docs/agents/ROADMAP_CHECKLIST.md
6. docs/agents/TASK.md
7. docs/agents/REVIEW.md
8. docs/agents/REVIEW_CHECKLIST.md
9. docs/CLAUDE.md
10. docs/reference/planning/pipeline-overview.md
11. docs/reference/planning/cross-layer-research.md

Then run this bounded loop:
1. Reconcile the current task and review state with the remaining Phase 1 backlog.
2. Choose one bounded task at a time, but allow the loop to alternate between Stage 1 and Stage 2 as needed.
3. Execute the task.
4. Review the result against the relevant stage checklist and governing docs.
5. If there are BUG or ACTIVE_STAGE_GAP findings, fix them.
6. Review one more time.
7. Update PHASE_STATE.md and HANDOFF.md.
8. If the task is complete, seed the next bounded Phase 1 task.

Remaining Phase 1 backlog to use as prioritization context:
1. Conditional IR must preserve both branches and prefer else as the stub default.
2. Missing built-in extractors include NavigationStack, NavigationLink, List, and ForEach, and may also include ScrollView and Group where the Phase 1 fixtures require them.
3. Button labels with multi-view ViewBuilder closures must preserve all extracted visual children.
4. Result-builder traversal must cover call_expression, if_statement, for_statement, and switch_statement where the grammar supports them.
5. Color extraction must stop guessing on bare identifiers and must preserve chained color expressions as color data where possible.
6. Add missing Stage 2 structure extraction for property wrappers such as @State and @Binding where later stub logic depends on preserved shape.
7. Add Stage 2 handling for raw strings and raw interpolation so extractor behavior matches the planning docs.
8. Capture real tree-sitter parse outputs for the planned Phase 1 fixtures and add real .swift fixture files where the plan requires them.
9. Add parser validation and resilience hooks such as hasError(), isMissing(), parser logging, and progress or cancellation support where the Phase 1 docs require them.
10. Expand tests so the planned fixtures and edge cases are asserted directly rather than passing through UnknownNode fallbacks.

Loop guardrails:
- Stay inside Roadmap Phase 1 only.
- Work on one bounded task at a time.
- Keep one writer active at a time.
- Read-only research or review may run in parallel only if it does not create conflicting edits.
- Do not drift into Stage 3 resolver semantics, layout, renderer, device frame, interaction, or MCP work.
- Maximum two fix cycles before stopping and reporting the blocker.

If you can spawn specialized agents, use this pattern:
- stage-orchestrator: coordination and task refresh
- parser-implementer: Stage 1 or Stage 2 code changes within the active task
- phase-reviewer: review pass
- issue-fixer: targeted remediation
- research-librarian: read-only support when a task is blocked on missing authoritative references

If you cannot spawn specialized agents, emulate those roles sequentially in one thread while still respecting the file protocol.

Verification is mandatory before claiming the loop is complete:
- npm test -- --runInBand
- npm run build
- node .\\node_modules\\typescript\\lib\\tsc.js --noEmit

Deliverables:
- docs/agents/TASK.md kept accurate
- docs/agents/REVIEW.md updated
- docs/agents/PHASE_STATE.md updated
- docs/agents/HANDOFF.md updated

Final response format:
- Start with: "Running the Phase 1 completion loop..."
- Summarize:
  - what task was executed,
  - which stage it belonged to,
  - what changed,
  - what review found,
  - whether fixes were applied,
  - what remains in Phase 1
- End with exactly one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

---

## Usage note

Use this prompt when your findings include both of these categories:

- Stage 1 parser-validation or parser-resilience gaps
- Stage 2 extraction or fixture-coverage gaps

If your work is extraction-only, prefer [STAGE_2_MASTER_LOOP_PROMPT.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/STAGE_2_MASTER_LOOP_PROMPT.md).
