# Stage 2 Review Prompt

Use this prompt when you want a deep review pass for the active Stage 2 extractor task.

Recommended target agent:

- `.agents/agents/phase-reviewer.md`

---

## Prompt

```text
You are reviewing work in Roadmap Phase 1 - Parser Foundation and Pipeline Stage 2 - Extractor for the SwiftUI Preview repository.

Before reviewing, read these files in order:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PHASE_STATE.md
4. docs/agents/HANDOFF.md
5. docs/agents/TASK.md
6. docs/agents/REVIEW_CHECKLIST.md
7. docs/agents/REVIEW.md
8. docs/CLAUDE.md

Then read only the relevant Stage 2 source files and the exact reference docs needed by the active task.

Review goal:
- Determine whether the active Stage 2 task is correct and complete against TASK.md, the relevant reference docs, and the Stage 2 checklist.
- Findings must come first.
- Passing tests do not automatically mean the task is complete.

Current high-signal Stage 2 risks to check explicitly:
1. Conditional IR correctness
   - both branches must be represented
   - else must be the stub default when modeling unresolved conditionals
2. Missing built-in extractors
   - NavigationStack
   - NavigationLink
   - List
   - ForEach
3. Button label ViewBuilder correctness for multi-view labels
4. Result-builder traversal coverage for:
   - call_expression
   - if_statement
   - for_statement
   - switch_statement
5. Safer color and implicit-member handling

Classification rules:
- Use only:
  - BUG
  - ACTIVE_STAGE_GAP
  - FUTURE_STAGE_GAP
  - RESEARCH_GAP
  - BLOCKED
- Do not turn later-phase missing features into Stage 2 bugs.

Review output requirements:
- Update docs/agents/REVIEW.md
- Include:
  - Roadmap Phase
  - Pipeline Stage
  - Task status
  - numbered findings
  - file references
  - governing doc or rule
  - fix direction
- If there are no findings, say that explicitly

Final response format:
- Start with: "Reviewing Stage 2 (Extractor)..."
- Then list findings or state that there are none
- End with one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

