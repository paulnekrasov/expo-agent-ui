# Stage 2 Master Loop Prompt

Use this prompt when you want to launch a full Stage 2 loop from one instruction.

This is the best default when you do **not** want to narrow the work to only one issue like conditional IR.

Recommended target agent:

- `.agents/agents/stage-orchestrator.md` as coordinator

---

## Prompt

```text
Run the Stage 2 loop for the SwiftUI Preview repository.

You are the coordinator. Work in Roadmap Phase 1 - Parser Foundation and Pipeline Stage 2 - Extractor only.

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

Then run this bounded loop:
1. Reconcile the active task with the latest repo state and findings.
2. Execute the current Stage 2 task or refresh it if it is stale.
3. Review the result against the Stage 2 checklist and relevant docs.
4. If there are BUG or ACTIVE_STAGE_GAP findings, fix them.
5. Review one more time.
6. Update PHASE_STATE.md and HANDOFF.md.

Stage 2 issue backlog to use as prioritization context:
1. Conditional IR must preserve both branches and prefer else as the stub default.
2. Missing extractors for NavigationStack, NavigationLink, List, and ForEach.
3. Button labels with multi-view ViewBuilder closures are truncated.
4. Result-builder traversal omits for_statement and switch_statement.
5. Color extraction is unsafe for identifiers and chained color expressions.
6. Add missing Stage 2 extractor coverage where the Phase 1 fixtures require it, including likely ScrollView and Group if the current task reaches them.
7. Add parser-side structure extraction for property wrappers such as @State and @Binding only where Stage 2 needs to preserve the information for later stub resolution.
8. Add Stage 2 handling for raw strings and raw interpolation where extractor behavior currently drops or mangles them.
9. Expand tests so planned fixture coverage is asserted directly rather than relying on UnknownNode fallbacks.

Loop guardrails:
- Stay inside Stage 2 only.
- Keep one writer active at a time.
- Research or review may run read-only in parallel only if it does not create conflicting edits.
- Do not fold Stage 1 parser-infrastructure work, Stage 3 resolver work, or later stages into this loop.
- Maximum two fix cycles before stopping and reporting the blocker.
- If Stage 1 parser-validation or parser-diagnostics work is the real blocker, stop and report that this loop should hand off to a Phase 1 completion prompt instead of silently widening scope.

If you can spawn specialized agents, use this pattern:
- stage-orchestrator: coordination and task refresh
- parser-implementer: Stage 2 code changes
- phase-reviewer: review pass
- issue-fixer: targeted remediation
- phase-reviewer: re-review

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
- Start with: "Running the Stage 2 loop..."
- Summarize:
  - what task was executed,
  - what changed,
  - what review found,
  - whether fixes were applied,
  - what remains
- End with exactly one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

---

## Narrowing rule

If you want the loop to focus on one issue cluster first, prepend:

```text
Scope constraint: focus first on <issue cluster>.
```

Examples:

- `Scope constraint: focus first on conditional IR and related tests.`
- `Scope constraint: focus first on NavigationStack and NavigationLink extraction.`
- `Scope constraint: focus first on List and ForEach extraction.`

If you do **not** prepend a scope constraint, this prompt defaults to the full Stage 2 issue set.

If your target includes Stage 1 parser-validation work as well as Stage 2 extraction gaps, use [PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md) instead.
