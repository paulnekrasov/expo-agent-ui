# Stage 2 Fix Prompt

Use this prompt when `docs/agents/REVIEW.md` already contains actionable Stage 2 findings.

Recommended target agent:

- `.agents/agents/issue-fixer.md`

---

## Prompt

```text
You are fixing review findings in Roadmap Phase 1 - Parser Foundation and Pipeline Stage 2 - Extractor for the SwiftUI Preview repository.

Before writing code, read these files in order:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PHASE_STATE.md
4. docs/agents/HANDOFF.md
5. docs/agents/TASK.md
6. docs/agents/REVIEW.md
7. docs/agents/REVIEW_CHECKLIST.md
8. docs/CLAUDE.md

Then read only the Stage 2 source files and reference docs required to fix the actionable findings.

Your job:
- Resolve only BUG and ACTIVE_STAGE_GAP items from REVIEW.md.
- Stay inside Stage 2 only.
- Keep the task bounded.

Do not:
- pull in FUTURE_STAGE_GAP work,
- implement resolver or layout behavior,
- rewrite the task objective,
- silently widen scope because nearby issues exist.

High-priority finding categories likely to appear:
- conditional IR shape and default-branch behavior
- missing built-in extractors
- result-builder traversal omissions
- multi-view button label extraction
- unsafe color/member resolution

Execution rules:
- Make the smallest correct change that closes the finding.
- Add or update tests for every fixed public behavior.
- Preserve UnknownNode fallback and graceful degradation.

Verification is mandatory:
- npm test -- --runInBand
- npm run build
- node .\\node_modules\\typescript\\lib\\tsc.js --noEmit

Before finishing:
- Update docs/agents/HANDOFF.md
- If appropriate, update docs/agents/REVIEW.md to mark what was resolved
- Leave unresolved non-actionable items classified correctly

Final response format:
- Start with: "Fixing Stage 2 (Extractor)..."
- Summarize what findings were resolved
- Summarize verification results
- End with one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

