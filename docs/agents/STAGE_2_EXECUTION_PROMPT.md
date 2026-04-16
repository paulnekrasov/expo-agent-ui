# Stage 2 Execution Prompt

Use this prompt when assigning focused Stage 2 extractor work to an implementation agent.

Recommended target agent:

- `.agents/agents/parser-implementer.md`

Use this after `stage-orchestrator` has confirmed or refreshed the active task in `docs/agents/TASK.md`.

---

## Prompt

```text
You are working in Roadmap Phase 1 - Parser Foundation and Pipeline Stage 2 - Extractor for the SwiftUI Preview repository.

Your job is to implement or harden Stage 2 AST-to-IR extraction only.

Before writing code, read these files in order:
1. docs/reference/INDEX.md
2. docs/agents/ORCHESTRATION.md
3. docs/agents/PHASE_STATE.md
4. docs/agents/HANDOFF.md
5. docs/agents/ROADMAP_CHECKLIST.md
6. docs/agents/TASK.md
7. docs/agents/REVIEW_CHECKLIST.md
8. docs/CLAUDE.md

Then read only the Stage 2 reference docs you actually need, especially:
- docs/reference/layer-1-grammar/node-types.md
- docs/reference/layer-1-grammar/node-type-specs.md
- docs/reference/layer-1-grammar/corpus-examples.md
- docs/reference/layer-1-grammar/parsing-edge-cases.md
- docs/reference/swift-syntax/view-initializer-signatures.md
- docs/reference/swift-syntax/edge-cases.md
- docs/reference/planning/cross-layer-research.md

State your working context explicitly before changing code:
- Roadmap Phase
- Pipeline Stage
- Active objective
- Exit condition

Core task rules:
- Stay inside Stage 2 only.
- Do not implement resolver, layout, renderer, device, navigation-state, or MCP work.
- Do not guess tree-sitter node names.
- Preserve UnknownNode as the final fallback where extraction is unsupported.
- Do not throw; degrade gracefully.
- Use Windows-safe path handling only.
- Add or update tests for every new public extraction behavior.

Current Stage 2 priority issues from the latest review:

1. Conditional extraction is wrong and must be corrected.
   - The current IR and extractor behavior only keep one active branch.
   - Phase 1 planning requires both branches to be extracted.
   - The stub default should prefer the else branch, not the then branch, when modeling unresolved conditionals.
   - Update the IR shape, extractor behavior, and tests accordingly.
   - Relevant sources:
     - docs/CLAUDE.md
     - docs/reference/planning/cross-layer-research.md

2. Documented Phase 1 fixture coverage is still incomplete.
   - NavigationStack, NavigationLink, List, and ForEach are recognized as built-ins but still degrade to UnknownNode.
   - Implement the missing built-in extractors required by the documented Phase 1 fixture set.
   - Relevant source:
     - docs/reference/planning/cross-layer-research.md

3. Button label ViewBuilder handling is incomplete.
   - Multi-view labels are truncated to the first child.
   - Valid result-builder labels must preserve all extracted child views.
   - Relevant source:
     - docs/CLAUDE.md

4. Result-builder traversal is still too narrow.
   - Current traversal only admits call_expression and if_statement.
   - Stage 2 traversal must also account for for_statement and switch_statement where the grammar supports them.
   - Relevant source:
     - docs/reference/layer-1-grammar/node-type-specs.md

5. Color extraction is semantically unsafe.
   - Do not map arbitrary simple_identifier nodes to fake system colors.
   - Preserve unresolved identifiers as unresolved or unknown values.
   - Handle context-aware implicit members correctly.
   - Avoid routing color-expression call chains through nested view parsing when they are still color data.
   - Relevant source:
     - docs/reference/layer-1-grammar/parsing-edge-cases.md

Secondary Stage 2 gaps from the broader Phase 1 planning docs:
6. Add extractor coverage for additional documented fixture surfaces such as ScrollView and Group if the active task or fixture set reaches them.
7. Preserve parser-side structure for property wrappers such as @State and @Binding where later stub resolution depends on extracted shape, but do not implement Stage 3 stub semantics here.
8. Add raw-string and raw-interpolation handling where Stage 2 currently drops, flattens, or misclassifies those forms.
9. Expand tests so documented fixture coverage is asserted directly and unsupported built-ins are not treated as acceptable end-state behavior.

Important scope boundary notes:
- Stage 1 parser validation work still exists, including real tree-sitter parse S-expressions, parser diagnostics, hasError()/isMissing(), parser logging, progress, and cancellation. Do not implement those here unless the current Stage 2 task is truly blocked on them. If blocked, record that explicitly instead of drifting into Stage 1 infrastructure work.
- Property-wrapper stub injection belongs to Stage 3 resolver work. You may extract structure only if the active Stage 2 task explicitly requires it, but do not implement resolver-side stub semantics in this pass.

If you are asked to cover both the Stage 1 parser backlog and the Stage 2 extractor backlog in one loop, stop and hand off to PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md instead of stretching this prompt past its stage boundary.

Execution instructions:
1. Reconcile the current TASK.md with the priority issues above.
2. If TASK.md is narrower than the full issue list, complete TASK.md first and carry the remaining unresolved items forward in HANDOFF.md and REVIEW.md language. Do not silently widen the task.
3. Touch only the files needed for the active bounded Stage 2 objective.
4. Prefer focused extractor files and focused tests over broad refactors.
5. If you must change IR types, do so minimally and keep them aligned with docs/reference/ir/viewnode-types.md and the Phase 1 plan.

Verification is mandatory before claiming completion:
- npm test -- --runInBand
- npm run build
- node .\\node_modules\\typescript\\lib\\tsc.js --noEmit

Before you finish:
- Update docs/agents/HANDOFF.md with what changed, what remains, and what the next agent should do first.
- If the work resolves review findings, make that explicit.
- If anything remains unresolved, classify it as BUG, ACTIVE_STAGE_GAP, FUTURE_STAGE_GAP, RESEARCH_GAP, or BLOCKED.

Final response format:
- Start with: "Working in Stage 2 (Extractor)..."
- Summarize what you changed
- Summarize verification results
- End with exactly one status:
  - DONE
  - DONE_WITH_CONCERNS
  - NEEDS_CONTEXT
  - BLOCKED
```

---

## Usage note

If you want the agent to work on one specific subset first, prepend a one-line scope constraint before the prompt body, for example:

```text
Scope constraint: focus only on conditional IR and its tests in this pass.
```

Good narrow scope constraints for this repo:

- `focus only on conditional IR and its tests`
- `focus only on NavigationStack and NavigationLink extraction`
- `focus only on List and ForEach extraction`
- `focus only on Button label ViewBuilder correctness`
- `focus only on safer color extraction behavior`
