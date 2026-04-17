# Active Fix Prompt - Reopened Build / WASM Gate

Use this prompt for the current reopened build-verification blocker where `npm run build` fails with `spawn EPERM` around the esbuild/WASM path after Stage 2 fixture coverage already landed cleanly.

This is a bounded fix prompt for the current issue. It is intentionally stricter than the status-only blocker loop:

- it does **not** allow the agent to stop immediately at "environment blocker"
- it requires the agent to test whether a repo-side build path can avoid the current child-process dependency for the non-watch build command
- it preserves the Layer 6 WASM filename and packaging rules exactly

If this task finishes and the next bug is not build/tooling/WASM-centered, discard this runtime prompt and regenerate from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` or the relevant stage-specific template.

---

## Prompt

```text
You are fixing the reopened repo-level build gate for the SwiftUI Preview repository.

This is a build/tooling/WASM debugging task, not a parser/extractor implementation task.

Current context:
- Roadmap Phase: Phase 1 - Parser Foundation
- Current bounded task status: Stage 2 fixture coverage is implemented and green at the parser/test level
- Reopened blocker: `cmd /c npm.cmd run build` fails with `spawn EPERM` around the current esbuild build path

Before doing any work:
1. Read `docs/reference/INDEX.md`
2. Read `docs/agents/ORCHESTRATION.md`
3. Read `docs/agents/PHASE_STATE.md`
4. Read `docs/agents/HANDOFF.md`
5. Read `docs/agents/ROADMAP_CHECKLIST.md`
6. Read `docs/agents/TASK.md`
7. Read `docs/agents/REVIEW.md`
8. Read `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
9. Read `docs/CLAUDE.md`
10. Read `docs/agents/BUILD_TOOLING_WASM_DEBUGGING_PROMPT_TEMPLATE.md`
11. Read `docs/reference/layer-6-vscode/extension-packaging-csp.md`
12. Read these implementation files:
   - `esbuild.config.js`
   - `esbuild.js`
   - `tests/build/esbuild.test.ts`
   - `tests/build/packaging.test.ts`
   - `package.json`
   - `tsconfig.json`
   - `jest.config.ts` or `jest.config.js` if present; otherwise explicitly note that Jest is configured inline in `package.json`
   - `.vscodeignore` if packaging behavior becomes relevant

If `$context-prompt-engineering` is available, use it before acting so the task stays explicit, bounded, and verification-driven.
If a debugging skill is available, use it.
Otherwise follow the equivalent behavior manually:
- root cause before fixes
- semantic contract before implementation
- red/green TDD
- verification before completion

## CORE GOAL

Determine whether the reopened `spawn EPERM` build failure can be fixed in repo code while preserving the required WASM packaging contract.

Do not assume the answer is "no" just because a direct spawn probe fails.

Your job is to test whether the current non-watch build command can be refactored to:
- keep exact WASM filename preservation
- keep `npm run build` working
- avoid or reduce the currently failing child-process dependency in the one-shot build path

Only if you explicitly disprove repo-side options may you conclude the blocker is external.

## STAGE TRANSITION RULE

This prompt is only for the current reopened build/tooling/WASM gate.

If this task finishes and the next issue is parser, extractor, resolver, layout, renderer, device, interaction, or another roadmap phase:
- stop using this prompt
- re-open `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`
- re-read the required docs for the new stage
- regenerate a stage-appropriate prompt before continuing

Do not drag this build-gate prompt into non-build work.

## VERIFIED SITUATION (DO NOT RE-INVESTIGATE THESE FACTS WITHOUT CONTRADICTORY EVIDENCE)

1. WHAT PASSES
   - `cmd /c npm.cmd test -- --runInBand tests/parser/fixtureRegression.test.ts` passed (`1` suite, `5` tests)
   - `cmd /c npm.cmd test -- --runInBand` passed (`10` suites, `51` tests)
   - `node .\node_modules\typescript\lib\tsc.js --noEmit` passed
   - The in-process build-test pattern is already in place for `tests/build/esbuild.test.ts`

2. WHAT FAILS
   - `cmd /c npm.cmd run build` currently fails with `spawn EPERM` inside `esbuild`
   - A direct probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` reproduced the same `EPERM`

3. ROOT CAUSE STATUS
   - PARTIAL EVIDENCE ONLY:
     - the environment denies at least one direct child-process probe
     - the current build path still depends on a code path in/around `esbuild` that fails under that constraint
     - it is not yet proven that the repo has no viable non-watch, non-subprocess-friendly alternative inside the current build/tooling constraints

4. WHAT THE FIX MUST NOT DO
   - Must not touch parser/extractor source unless the build fix truly requires it, which is not expected
   - Must not hide failures with `jest.skip`, `xit`, `xtest`, exclusions, or weakened assertions
   - Must not break the exact-name WASM packaging rules from Layer 6
   - Must not replace a semantic build verification with a fake no-op
   - Must not widen into resolver, layout, renderer, device, or interaction work

## KNOWN SAFE FILE ALLOWLIST

Only edit these unless you can prove the task cannot be solved inside them:

- `esbuild.config.js`
- `esbuild.js`
- `tests/build/esbuild.test.ts`
- `tests/build/packaging.test.ts`
- `package.json`
- `.vscodeignore`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`

If you need another file, justify it explicitly before editing.

## KNOWN DIRTY WORKTREE NOTE

The worktree may contain unrelated user or prior-agent changes.

Rules:
- Do not revert unrelated changes.
- Do not clean up files you did not touch for this task.
- If unrelated changes conflict directly with this fix, stop and call out the conflict explicitly.

## VERIFIED NON-CAUSES

These are not yet sufficient explanations on their own:
- "The parser/extractor fixture slice regressed" — current evidence says the Stage 2 fixture/test slice is green
- "The build test suite is still subprocess-based" — current evidence says `tests/build/esbuild.test.ts` is already using the in-process pattern

Do not reopen these without contradictory evidence.

## REPO-SPECIFIC RULES YOU MUST ENFORCE

- Exact WASM filenames matter.
- Do not switch to `.wasm` file-loader hashing if it breaks exact-name runtime lookup.
- Use Windows-safe `path.join()` / `path.resolve()` only.
- Keep packaging/WebView/WASM behavior aligned with `docs/reference/layer-6-vscode/extension-packaging-csp.md`.
- Prefer import-safe, in-process testing for build logic when possible.
- Distinguish clearly between:
  - a broken repo build strategy
  - a broken test strategy
  - a genuinely external environment constraint

## REQUIRED FILE READINGS

Read each required file and summarize it in one sentence before continuing.

Required format:

FILE 1: `<path>`
Summary: <one sentence>

Continue for every required file.

## REQUIRED FAILURE ANALYSIS

You must analyze both of these:

FAILING COMMAND 1: `cmd /c npm.cmd run build`
Intent: <what semantic build contract it is supposed to satisfy>
Failure point: <exact code path / API dependency / observed error>
Why it fails: <best current explanation>
Semantic goal: <what the build command should accomplish independent of the current implementation>

FAILING COMMAND 2: direct child-process probe
Intent: <what the probe is actually testing>
Failure point: <exact failure>
Why it fails: <best current explanation>
Semantic goal: <what role the probe should or should not play in deciding whether the repo can be fixed>

## CRITICAL INVESTIGATION RULE

You are NOT allowed to conclude "external blocker only" until you explicitly investigate whether the repo can close the build gate with one of these bounded strategies or prove why each is invalid:

1. A one-shot non-watch build path that does not rely on the current failing async service pattern
2. A split build strategy where:
   - normal build uses a safer path
   - watch mode keeps the richer API only where necessary
3. A build-contract refactor that preserves exact WASM copying and CLI behavior while changing only the esbuild invocation strategy
4. Any other repo-local path that:
   - stays on esbuild
   - preserves exact WASM filenames
   - keeps `npm run build` meaningful
   - stays inside the bounded file allowlist

If all such paths are disproved with evidence, only then may you classify the blocker as external-only.

## FIX DESIGN (BEFORE ANY CODE)

For each viable option you find, write:

FIX DESIGN 1: "<name>"
Current problem: <what is structurally wrong in the current build path>
Replacement strategy: <what you will test or change>
Why this preserves semantics: <why the real build/WASM contract remains valid>
Why this avoids false green results: <anti-cheat reasoning>
Why this stays bounded: <why it does not drift into unrelated stages>
Risk: <main risk if you choose this option>

Then rank the options and choose one explicitly.

## RED/GREEN TDD REQUIREMENT

Write the failing test(s) first.

Good red failures for this task include:
- missing exported build path
- wrong build API selection for non-watch builds
- incorrect WASM asset contract
- build wrapper still routing through the failing dependency path
- packaging behavior no longer preserving exact filenames

Bad red failures include:
- unrelated syntax errors
- environment noise unrelated to the semantic build contract
- weak assertions that would pass without a real fix

## IMPLEMENTATION RULES

- Keep the fix as small as possible.
- Preserve the CLI contract of `npm run build`.
- Preserve exact WASM filename behavior.
- Preserve the existing in-process build-test pattern.
- Do not introduce fake mocks that replace the real contract under test.
- Do not add new packages unless absolutely necessary and justified.

## VERIFICATION

Run these in order unless the task reveals a narrower but stronger equivalent:

1. `node .\node_modules\typescript\lib\tsc.js --noEmit`
2. `cmd /c npm.cmd test -- --runInBand tests/build/esbuild.test.ts tests/build/packaging.test.ts`
3. `cmd /c npm.cmd test -- --runInBand`
4. `cmd /c npm.cmd run build`

If packaging behavior is changed, also run any relevant packaging verification command and report it.

For each command, report:
- exact command
- pass/fail
- key proof lines

## SELF-REVIEW

After the implementation is green, review your own diff.

If there are no real bounded-task findings left, state exactly:
- `No BUG or ACTIVE_STAGE_GAP findings remain in the bounded build/WASM task diff.`

Otherwise list real findings using:
- `BUG`
- `ACTIVE_STAGE_GAP`
- `FUTURE_STAGE_GAP`
- `RESEARCH_GAP`
- `BLOCKED`

## STATE FILE UPDATES

If the task closes or materially advances, update:
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`

## WHAT NOT TO DO

NEVER:
- stop immediately at "spawn probe failed, therefore no repo fix is possible"
- treat the direct probe as stronger than the actual build-contract analysis
- hide the build failure by skipping verification
- switch to hashed `.wasm` outputs when exact names are required
- break watch-mode expectations without explicitly documenting the tradeoff
- widen into parser/extractor/layout/renderer work

## SUCCESS CRITERIA

All must be true:
- either the repo build gate is actually fixed and `cmd /c npm.cmd run build` passes
- or every viable repo-side bounded fix path is explicitly disproved with evidence, leaving a clearly documented external blocker
- exact WASM naming and packaging rules still hold
- targeted build/tooling tests pass
- full Jest suite still passes
- `tsc --noEmit` passes
- state files are updated accurately

## OUTPUT FORMAT

1. FILE READINGS
2. FAILING COMMAND ANALYSIS
3. FIX DESIGN
4. RED TESTS
5. IMPLEMENTATION
6. VERIFICATION
7. SELF-REVIEW
8. STATE FILE UPDATES
9. FINAL DISPOSITION

In FINAL DISPOSITION, choose one:
- FIXED_IN_REPO
- EXTERNAL_BLOCKER_PROVEN
- NEEDS_CONTEXT
- BLOCKED
```
