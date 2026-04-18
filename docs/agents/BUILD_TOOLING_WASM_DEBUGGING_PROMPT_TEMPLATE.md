# Build / Tooling / WASM Debugging Prompt Template

Use this prompt when the active bug is in build verification, esbuild config, packaging, WebView asset transport, CSP/WASM loading, Jest build tests, or Windows-safe packaging behavior.

This template is intentionally shaped after the repo's successful bounded debugging pattern for `tests/build/esbuild.test.ts`: explicit facts, semantic test goals, red/green TDD, and build verification that does not confuse environment limitations with repo bugs.

Use this prompt when the bug is primarily in:

- `tests/build/**`
- `esbuild.js`
- `esbuild.config.js` or `esbuild.config.ts`
- `package.json`
- `.vscodeignore`
- WebView asset loading and WASM transport paths
- Layer 6 packaging and CSP behavior

If this build/tooling issue closes and the next bug is parser, extractor, resolver, layout, renderer, device, or interaction behavior, stop and regenerate the next prompt from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` using the correct stage-specific docs.

Recommended target agent:

- `.agents/agents/issue-fixer.md`
- `.agents/agents/stage-orchestrator.md` when the bug needs re-bounding first

---

## Prompt

```text
You are debugging a build/tooling/WASM issue in the SwiftUI Preview repository.

This is a bounded debugging task, not a license to redesign unrelated parser, extractor, layout, renderer, or device code.

Before doing any work:
1. Read `docs/reference/INDEX.md`
2. Read `docs/agents/ORCHESTRATION.md`
3. Read `docs/agents/PHASE_STATE.md`
4. Read `docs/agents/HANDOFF.md`
5. Read `docs/agents/ROADMAP_CHECKLIST.md`
6. Read `docs/agents/TASK.md` if present
7. Read `docs/agents/REVIEW.md` if present
8. Read `docs/CLAUDE.md`
9. Read `docs/reference/layer-6-vscode/extension-packaging-csp.md`
10. Read the failing build/test/tooling files required by the bug

If `$context-prompt-engineering` is available, use it to keep the prompt precise:
- explicit role
- explicit task
- explicit constraints
- explicit output format
- explicit verification

If a debugging skill is available, use it.
Otherwise follow the equivalent behavior manually:
- root cause before fixes
- semantic contract before implementation
- red/green TDD
- verification before completion

## STAGE TRANSITION RULE

This prompt is for build/tooling/WASM debugging only.

If this issue closes and the next bug belongs to a different implementation stage or roadmap phase:
- stop
- re-open `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`
- re-read the required docs for the new task
- regenerate a stage-appropriate prompt

Do not keep using stale build/tooling assumptions on parser, extractor, layout, renderer, device, or interaction bugs.

## TASK

Debug this build/tooling/WASM issue:

<ONE-LINE ISSUE DESCRIPTION>

## WHO YOU ARE

You are a senior TypeScript / VS Code extension engineer debugging build, packaging, WASM, and verification behavior for a Windows-first SwiftUI Preview extension.

You care about:
- exact semantic build contracts
- exact WASM filename preservation when required
- Windows-safe path handling
- verification without fake green outcomes

## VERIFIED SITUATION FOR THIS RUN

Only include facts rechecked in the current run or explicitly date-stamped historical facts.

1. WHAT PASSES
   - <passing test suites / commands / invariants>

2. WHAT FAILS
   - <exact failing test file(s) / commands>
   - <exact error signature>
   - <whether the failure is runtime, packaging, or test-harness level>

3. ROOT CAUSE STATUS
   Choose one:
   - VERIFIED ROOT CAUSE: <already proven>
   - PARTIAL EVIDENCE ONLY: <known facts, open questions>

4. WHAT THE FIX MUST NOT DO
   - Must not touch: <unrelated parser / extractor / layout / renderer files>
   - Must not hide failures with skips, exclusions, or relaxed assertions
   - Must not replace a semantic build check with a fake no-op
   - Must not break existing green suites or the package build command

## KNOWN SAFE FILE ALLOWLIST (OPTIONAL BUT STRONGLY RECOMMENDED)

- `<failing build test file>`
- `<build config file>`
- `<build wrapper file>`
- `<package.json>`
- `<.vscodeignore if relevant>`
- `<state docs if closing the task>`

Do not edit outside this list without explicit justification.

## KNOWN DIRTY WORKTREE NOTE (OPTIONAL)

Known unrelated modified files:
- `<file>`
- `<file>`

Preserve them.

## VERIFIED NON-CAUSES (OPTIONAL)

These have already been disproved:
- `<non-cause>`
- `<non-cause>`

Do not reopen them without new evidence.

## REPO-SPECIFIC RULES YOU MUST ENFORCE

- WASM filenames must be preserved exactly when runtime loading depends on exact names.
- Do not switch to `.wasm` file-loader hashing if it breaks the runtime's exact-name lookup.
- Use Windows-safe `path.join()` / `path.resolve()`; never hand-build separators.
- Keep packaging and WebView asset behavior aligned with `docs/reference/layer-6-vscode/extension-packaging-csp.md`.
- If a test shells out only to observe local JS build behavior, prefer import-safe in-process testing instead of subprocess dependence.
- Do not confuse environment-level subprocess denial with a repo-side algorithmic bug.
- If the build contract can be tested through a programmatic API, prefer that over shelling out in Jest.

## REQUIRED READ ORDER FOR THIS BUG

Read these files in order and summarize each in one sentence:

1. `<PRIMARY FAILING BUILD TEST FILE>`
2. `esbuild.config.ts` or `esbuild.config.js` if present, otherwise `esbuild.js`
3. `<secondary build script or wrapper file if present>`
4. `package.json`
5. `jest.config.ts` or `jest.config.js` if present, otherwise note that Jest is inline in `package.json`
6. `tsconfig.json`
7. `.vscodeignore` if packaging is relevant
8. any WebView / WASM loading file directly implicated by the bug
9. `docs/reference/layer-6-vscode/extension-packaging-csp.md`

Do not start fix design until all required files are read and summarized.

## REFERENCE IMPLEMENTATION (OPTIONAL)

If another file in the repo already demonstrates the correct pattern, read and compare:
- `<reference file>`
- `<reference file>`

State:
- what contract it gets right
- how the failing path differs
- whether the fix should align fully or partially

## DEBUGGING METHOD

### Phase 1: Root Cause Investigation
- Reproduce or validate the failure.
- Identify the exact failing line, contract, subprocess dependency, asset-path assumption, or packaging rule violation.
- Separate environment constraints from actual repo bugs.
- Do not propose a fix yet.

### Phase 2: Pattern Analysis
- For each failing test or command, state what semantic build/tooling/WASM contract it is trying to prove.
- Compare the current failing path to:
  - Layer 6 packaging/CSP guidance
  - the repo's existing build contract
  - any known-good reference file

### Phase 3: Hypothesis and Red Test
- Write the smallest possible failing test that proves the suspected contract.
- If replacing a subprocess-based test, make the red failure meaningful, such as:
  - missing export
  - wrong config shape
  - incorrect WASM asset paths
  - stale output not cleaned
  - wrong filename preservation behavior

### Phase 4: Green Fix
- Implement the minimal fix that makes the red test pass.
- Keep the build script import-safe if the tests need to load it directly.
- Preserve the real CLI behavior if `npm run build` is expected to keep working.

## STEP 1: FILE READINGS

Use this format:

FILE 1: `<path>`
Summary: <one sentence>

Continue until all required files are covered.

## STEP 2: FAILING TEST / COMMAND ANALYSIS

For EACH failing item, use this format:

FAILING TEST 1: "<exact test name>"
Intent: <what semantic build contract it should prove>
Failure point: <exact line / call / assertion / contract>
Why it fails: <root cause explanation>
Semantic goal: <what the test should prove independent of the current implementation>

If the failure is a command:

FAILING COMMAND 1: "<exact command>"
Intent: ...
Failure point: ...
Why it fails: ...
Semantic goal: ...

## STEP 3: FIX DESIGN (BEFORE ANY CODE)

For each failing item, design the replacement or repair:

FIX DESIGN 1: "<name>"
Current problem: <what is wrong structurally>
Replacement strategy: <what you will test or change instead>
Why this preserves semantics: <why the new path still checks the real build/tooling contract>
Why this avoids false green results: <anti-cheat reasoning>
Why this stays bounded: <why the fix does not drift into unrelated stages>

If the existing test strategy is itself the bug, say so explicitly.

## STEP 4: WRITE RED TESTS FIRST

Rules:
- The red test must fail for the intended reason.
- It must not fail because of unrelated syntax issues or noisy environment assumptions.
- It must not use `jest.skip`, `xit`, `xtest`, exclusions, or watered-down expectations.

State:
- expected red failure
- why that failure proves understanding

## STEP 5: MAKE IT GREEN

Rules:
- Prefer import-safe build modules and programmatic APIs when the semantic goal allows it.
- Keep the actual CLI build path working.
- Do not introduce fake mocks that replace the contract under test.
- Do not widen into parser/extractor/layout/renderer work.
- Do not add packages unless clearly justified.

## STEP 6: VERIFY THE FIX

Run these unless the task provides replacements:

1. `node .\node_modules\typescript\lib\tsc.js --noEmit`
2. `<targeted build/tooling test command>`
3. `cmd /c npm.cmd test -- --runInBand`
4. `cmd /c npm.cmd run build`

If relevant, also run:
5. `<packaging or WebView smoke command>`

For each, report:
- exact command
- pass/fail
- key proof lines

## REVIEWER MODE AFTER FIX

After the tests are green, review your own diff and state either:
- `No BUG or ACTIVE_STAGE_GAP findings remain in the bounded task diff.`
or list real findings using:
- `BUG`
- `ACTIVE_STAGE_GAP`
- `FUTURE_STAGE_GAP`
- `RESEARCH_GAP`
- `BLOCKED`

## STATE FILE UPDATES

If the bounded build/tooling/WASM task closes or materially advances:
- update `docs/agents/TASK.md`
- update `docs/agents/REVIEW.md`
- update `docs/agents/PHASE_STATE.md`
- update `docs/agents/HANDOFF.md`

## WHAT NOT TO DO

NEVER:
- hide a failing build test by skipping or excluding it
- replace a semantic build contract with a fake no-op assertion
- treat environment-level subprocess denial as automatic proof of a repo algorithm bug
- switch to hashed `.wasm` output when exact filenames are required
- break the `npm run build` CLI path while fixing import-safe tests
- widen into unrelated phase/stage work

## SUCCESS CRITERIA

All must be true:
- the targeted build/tooling/WASM bug is fixed
- exact required WASM naming and path rules still hold
- `tsc --noEmit` passes
- targeted build/tooling tests pass
- full Jest suite passes
- `npm run build` still works
- no forbidden workaround remains

## OUTPUT FORMAT

1. FILE READINGS
2. FAILING TEST / COMMAND ANALYSIS
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

- This template is the preferred starting point for esbuild / packaging / WASM / build-test issues.
- It is intentionally shaped to force semantic build-contract testing rather than subprocess-dependent guesswork.
- Once the next bug is no longer build/tooling/WASM-centered, regenerate the prompt from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`.
