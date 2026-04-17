# Parser / Extractor Debugging Prompt Template

Use this prompt when the active bug is in Roadmap Phase 1 and belongs to:

- Pipeline Stage 1 - Parser validation / resilience, or
- Pipeline Stage 2 - Extractor AST-to-IR behavior

Use this when the debugging task is specifically parser/extractor-bound and must not drift into resolver, layout, renderer, device, interaction, or packaging redesign.

When this parser/extractor task finishes and the next bug moves to Stage 3 or later, stop and regenerate the next prompt from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` instead of continuing with parser/extractor assumptions.

Recommended target agent:

- `.agents/agents/parser-implementer.md`
- `.agents/agents/issue-fixer.md` for bounded review-fix passes
- `.agents/agents/stage-orchestrator.md` if the current task needs re-bounding first

---

## Prompt

```text
You are debugging parser/extractor behavior in the SwiftUI Preview repository.

Roadmap Phase: Phase 1 - Parser Foundation
Pipeline Stage: <Stage 1 - Parser | Stage 2 - Extractor>
Research Layer: Layer 1, Layer 2, and when needed Layer 3 / Swift syntax references

Before doing anything else:
1. Read `docs/reference/INDEX.md`
2. Read `docs/agents/ORCHESTRATION.md`
3. Read `docs/agents/PHASE_STATE.md`
4. Read `docs/agents/HANDOFF.md`
5. Read `docs/agents/ROADMAP_CHECKLIST.md`
6. Read `docs/agents/TASK.md` if present
7. Read `docs/agents/REVIEW.md` if present
8. Read `docs/agents/REVIEW_CHECKLIST.md`
9. Read `docs/CLAUDE.md`
10. Read the stage-specific references required by this bug:
   - `docs/reference/layer-1-grammar/node-types.md`
   - `docs/reference/layer-1-grammar/node-type-specs.md` when field/child shape matters
   - `docs/reference/layer-1-grammar/corpus-examples.md` when modifier/result-builder grammar is involved
   - `docs/reference/layer-1-grammar/parsing-edge-cases.md` when identifiers, wrappers, interpolation, or edge cases are involved
   - `docs/reference/layer-2-parser-api/web-tree-sitter-api.md` when parser setup or SyntaxNode APIs matter
   - `docs/reference/layer-2-parser-api/web-tree-sitter-extras.md` when logging/progress/helpers matter
   - `docs/reference/layer-3-viewbuilder/result-builder-transforms.md` when closure child extraction or ViewBuilder semantics matter
   - `docs/reference/layer-3-viewbuilder/viewbuilder-swiftui-api.md` when Group / conditional / container semantics matter
   - `docs/reference/swift-syntax/view-initializer-signatures.md` when view initializer shape matters
   - `docs/reference/swift-syntax/modifier-signatures.md` when modifier extraction shape matters
   - `docs/reference/swift-syntax/edge-cases.md` when literals, raw strings, interpolation, wrappers, or unusual syntax matter

If `$context-prompt-engineering` is available, use it to keep the prompt and debugging scope explicit and minimal.
If a debugging skill is available, use it.
Otherwise follow the equivalent behavior manually:
- root cause before fixes
- semantic contract before implementation
- red/green TDD
- verification before completion

## STAGE TRANSITION RULE

This prompt is only for Stage 1 / Stage 2 debugging.

If the current parser/extractor bug closes and the next issue belongs to Stage 3 resolver, Stage 4 layout, Stage 5 renderer, Stage 6 device, Stage 7 interaction, or a later roadmap phase:
- stop
- re-open `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`
- re-read the required docs for the new stage
- regenerate a stage-appropriate debugging prompt before continuing

Do not drag parser/extractor constraints into later-stage debugging.

## TASK

Debug this bounded parser/extractor issue:

<ONE-LINE ISSUE DESCRIPTION>

## VERIFIED SITUATION (DO NOT RE-INVESTIGATE THESE FACTS)

1. WHAT PASSES
   - <passing tests / commands / already confirmed invariants>

2. WHAT FAILS
   - <exact failing test file(s), fixture(s), or commands>
   - <exact error or incorrect IR behavior>

3. ROOT CAUSE STATUS
   - VERIFIED ROOT CAUSE: <if already proven>
   - or PARTIAL EVIDENCE ONLY: <what is known, what remains open>

4. WHAT THE FIX MUST NOT DO
   - Must not touch: <later-stage modules / unrelated files>
   - Must not break: <existing green parser/extractor suites>
   - Must not hide failures with skips, exclusions, or weaker assertions

## KNOWN SAFE FILE ALLOWLIST (OPTIONAL BUT STRONGLY RECOMMENDED)

- `<parser or extractor file>`
- `<adjacent helper file>`
- `<targeted test file>`
- `<IR file if absolutely required>`

## KNOWN DIRTY WORKTREE NOTE (OPTIONAL)

Known unrelated modified files:
- `<file>`
- `<file>`

Preserve them.

## VERIFIED NON-CAUSES (OPTIONAL)

- `<hypothesis already disproved>`
- `<hypothesis already disproved>`

Do not reopen these without new evidence.

## REPO RULES YOU MUST ENFORCE

- Do not guess tree-sitter node names. Use exact names from `docs/reference/layer-1-grammar/node-types.md`.
- Preserve `UnknownNode` as the final extractor fallback.
- Do not throw in Stage 1 or Stage 2. Degrade gracefully.
- Parser code does not do layout.
- Extractor code does not do renderer behavior.
- Modifier order must be preserved when relevant.
- Use Windows-safe path handling only.
- If parsing raw Swift source, preserve CRLF normalization behavior before tree-sitter.
- Tests should prefer real Swift snippets / fixtures over mocked ASTs when practical.

## REQUIRED FILE READS FOR THIS BUG

Read and summarize each:
1. `<PRIMARY FAILING TEST FILE>`
2. `<PRIMARY IMPLEMENTATION FILE>`
3. `<SECONDARY IMPLEMENTATION FILE>`
4. `package.json`
5. Jest config file if present, otherwise note that Jest is inline in `package.json`
6. `tsconfig.json`
7. the most relevant stage-specific reference docs from the list above

After each file, write:

FILE: `<path>`
Summary: <one sentence>

## REFERENCE IMPLEMENTATION (OPTIONAL)

If another parser/extractor file already implements the correct pattern, read it and compare:
- `<reference file>`
- `<reference file>`

State:
- the correct pattern it demonstrates
- how the failing path differs
- whether the fix should align fully or partially

## DEBUGGING METHOD

### Phase 1: Root Cause
- Reproduce or validate the failure.
- Identify the exact AST shape, parser condition, extractor branch, or IR contract that is wrong.
- Do not fix yet.

### Phase 2: Pattern Analysis
- State what semantic behavior the test or fixture is trying to prove.
- Compare the failing path against:
  - the grammar docs
  - the Swift syntax reference
  - any established extractor/parser pattern in this repo

### Phase 3: Red Test
- Write the smallest possible failing test using a real Swift snippet or fixture when practical.
- The red test must fail for the intended semantic reason.

### Phase 4: Green Fix
- Implement the smallest fix that makes the red test pass.
- Avoid unrelated refactors.
- Keep the fix in Stage 1 / Stage 2 only.

## REQUIRED ANALYSIS FORMAT

For each failing item:

FAILING TEST 1: "<exact test name>"
Intent: <what semantic parser/extractor behavior it should prove>
Failure point: <exact code path or contract>
Why it fails: <root cause>
Semantic goal: <correct parser/extractor behavior>

## REQUIRED FIX DESIGN FORMAT

FIX DESIGN 1: "<name>"
Current problem: <what is structurally wrong>
Replacement strategy: <new test/fix path>
Why this preserves parser/extractor semantics: <why it matches docs and repo rules>
Why this stays inside Stage 1 / Stage 2: <boundary justification>
Why this avoids false green results: <anti-cheat reasoning>

## VERIFICATION

Run these unless the task provides narrower replacements:

1. `node .\node_modules\typescript\lib\tsc.js --noEmit`
2. `<targeted parser/extractor test command>`
3. `cmd /c npm.cmd test -- --runInBand`
4. `cmd /c npm.cmd run build` if the task affects repo-level verification

For each, report:
- exact command
- pass/fail
- key proof lines

## SELF-REVIEW

Before finishing, review the diff and state either:
- `No BUG or ACTIVE_STAGE_GAP findings remain in the bounded task diff.`
or list real findings using:
- `BUG`
- `ACTIVE_STAGE_GAP`
- `FUTURE_STAGE_GAP`
- `RESEARCH_GAP`
- `BLOCKED`

## STATE FILE UPDATES

If the bounded parser/extractor task closes or materially advances:
- update `docs/agents/TASK.md`
- update `docs/agents/REVIEW.md`
- update `docs/agents/PHASE_STATE.md`
- update `docs/agents/HANDOFF.md`

## WHAT NOT TO DO

NEVER:
- guess AST node names
- drop unsupported structures silently when `UnknownNode` is required
- add layout or renderer logic to parser/extractor code
- throw in Stage 1 / Stage 2
- widen into Stage 3+ because nearby files are tempting
- weaken tests to get green
- ignore a relevant reference implementation

## OUTPUT FORMAT

1. FILE READINGS
2. FAILING TEST / FAILURE ANALYSIS
3. FIX DESIGN
4. RED TESTS
5. IMPLEMENTATION
6. VERIFICATION
7. SELF-REVIEW
8. STATE FILE UPDATES
9. OPEN RISKS OR REMAINING BLOCKERS
```

---

## Usage notes

- Use this for parser/extractor debugging only.
- Once the next issue leaves Stage 1 / Stage 2, regenerate the prompt from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` before continuing.
