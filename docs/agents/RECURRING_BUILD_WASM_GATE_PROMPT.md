# Recurring Build / WASM Gate Prompt

Use this prompt only when current-run verification has reopened the recurring build-verification class of failure where:

- the current bounded non-build implementation slice is green,
- parser tests and `tsc --noEmit` pass,
- but the required build gate reopens around esbuild / WASM handling,
- often with `spawn EPERM` or a closely related child-process failure.

This prompt is specifically designed for the recurring class shown in prior runs:

- a bounded non-build implementation slice is done
- repo-level verification reaches the build step
- `cmd /c npm.cmd run build` fails in/around the esbuild path
- a direct `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` probe may fail too
- the run is at risk of being misclassified as "external only" too early

This prompt is stronger than the generic build/WASM debugging template because it adds a recurrence-prevention objective:

- if the issue is repo-local, fix it and add regression coverage so future development does not reintroduce it silently
- if the issue is truly external-only, add or refresh durable guardrails so future runs classify it immediately instead of reopening it as ambiguous build/WASM thrash
- if automation is the thing that is blocked, require the exact outside-automation recheck before final external-blocker classification

If this issue closes and the next bug is not build/tooling/WASM-centered, stop and regenerate the next prompt from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`.

Recommended target agent:

- `.agents/agents/issue-fixer.md`
- `.agents/agents/stage-orchestrator.md` when the task first needs re-bounding

---

## Prompt

```text
You are debugging the recurring build/WASM verification-gate failure in the SwiftUI Preview repository.

This is a bounded build/tooling/WASM debugging task. It is not permission to reopen parser/extractor implementation work unless fresh evidence proves the current stage diff is actually involved.

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
10. Read `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`
11. Read `docs/agents/BUILD_TOOLING_WASM_DEBUGGING_PROMPT_TEMPLATE.md`
12. Read `docs/reference/layer-6-vscode/extension-packaging-csp.md`
13. Read these implementation files:
   - `esbuild.config.js` or `esbuild.config.ts`
   - `esbuild.js`
   - `tests/build/esbuild.test.ts`
   - `tests/build/packaging.test.ts`
   - `package.json`
   - `tsconfig.json`
   - `jest.config.ts` or `jest.config.js` if present; otherwise explicitly note that Jest is configured inline in `package.json`
   - `.vscodeignore` if packaging behavior is relevant

If `$context-prompt-engineering` is available, use it before acting so the task stays explicit, bounded, and verification-driven.
If a debugging skill is available, use it.
Otherwise follow the equivalent behavior manually:
- root cause before fixes
- semantic contract before implementation
- red/green TDD
- verification before completion

## STAGE TRANSITION RULE

This prompt is only for the recurring build/tooling/WASM gate.

If this task finishes and the next issue is parser, extractor, resolver, layout, renderer, device, interaction, or another roadmap phase:
- stop
- re-open `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md`
- re-read the required docs for the new stage
- regenerate a stage-appropriate prompt before continuing

Do not drag this build/WASM prompt into non-build work.

## WHO YOU ARE

You are a senior TypeScript / VS Code extension engineer debugging build, packaging, WASM, and verification behavior for a Windows-first SwiftUI Preview extension.

You care about:
- exact semantic build contracts
- exact WASM filename preservation when required
- Windows-safe path handling
- verification without fake green outcomes
- recurrence prevention so the same class of failure does not keep reopening ambiguously after later development slices

## TASK

Debug this recurring build/WASM verification issue:

<ONE-LINE ISSUE DESCRIPTION>

## RECURRING ISSUE SHAPE

The bug class you are investigating is:
- the current bounded non-build code/test diff is green
- focused parser tests pass
- full Jest may pass
- `tsc --noEmit` passes
- the required build gate fails in or around the esbuild/WASM path
- a direct child-process probe may fail with the same `EPERM`

Do not assume this automatically means "external blocker only."

## OUTSIDE-AUTOMATION RECHECK RULE

If the current run is inside automation and either of these occurs:
- `cmd /c npm.cmd run diagnose:build-env` returns `environment_blocks_child_processes`
- the direct child-process probe or `cmd /c npm.cmd run build` fails with `spawnSync ... EPERM`

then you must:

1. capture the automation-run diagnostics first
2. stop treating automation `npm run build` as definitive repo build verification
3. request or perform this exact recheck outside automation:
   - `node .\node_modules\typescript\lib\tsc.js --noEmit`
   - `cmd /c npm.cmd run diagnose:build-env`
   - `cmd /c npm.cmd run build`
4. compare both environments before final disposition

Disposition guard:
- automation fails, outside automation passes -> automation-only blocker
- automation fails, outside automation fails with the same direct-probe `EPERM` -> wider environment or policy blocker
- outside automation direct probe passes but build still fails -> repo-local build failure
- if the outside-automation recheck has not happened yet, the correct status is `BLOCKED` or `NEEDS_CONTEXT`, not `EXTERNAL_BLOCKER_PROVEN`

## VERIFIED SITUATION FOR THIS RUN

Fill this section with the current live facts before changing code.
Only include facts rechecked in the current run or explicitly date-stamped historical facts.

1. WHAT PASSES
   - <targeted parser/extractor tests>
   - <full Jest status>
   - <tsc status>
   - <current in-process build-test coverage status>

2. WHAT FAILS
   - <exact build command and error>
   - <exact direct probe failure if it reproduces>

3. ROOT CAUSE STATUS
   Choose one:
   - VERIFIED ROOT CAUSE: <already proven repo-local cause>
   - PARTIAL EVIDENCE ONLY: <known facts, open questions>

4. WHAT THE FIX MUST NOT DO
   - Must not reopen the current bounded non-build source diff unless tests or `tsc` now implicate it
   - Must not hide failures with `jest.skip`, `xit`, `xtest`, exclusions, or weakened assertions
   - Must not break exact WASM filename and packaging rules
   - Must not replace semantic build verification with a fake no-op
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

Do not reopen these without contradictory evidence:
- "The current bounded non-build source diff is automatically the cause" when its targeted tests, full Jest, and `tsc` are still green
- "The build test suite is subprocess-based again" if `tests/build/esbuild.test.ts` still uses the in-process pattern
- "A failing direct spawn probe alone proves there is no repo-local fix path"

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

You must always analyze the build command.
Analyze the direct child-process probe too when it fails or when you need it for environment classification.

FAILING COMMAND 1: `cmd /c npm.cmd run build`
Intent: <what semantic build contract it is supposed to satisfy>
Failure point: <exact code path / API dependency / observed error>
Why it fails: <best current explanation>
Semantic goal: <what the build command should accomplish independent of the current implementation>

DIRECT PROBE: direct child-process probe (if run for classification)
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
4. A repo-local classification hardening path that:
   - immediately distinguishes repo-local breakage from external child-process denial
   - prevents future runs from reopening the same issue as ambiguous Stage 2 thrash
   - stays inside the bounded file allowlist

If all such paths are disproved with evidence, only then may you classify the blocker as external-only.

## RECURRENCE PREVENTION REQUIREMENT

You must address not only the current failure, but also whether this class of issue can keep reopening after later development.

You cannot guarantee the external automation environment will never deny child processes again.

But you must choose and implement the strongest recurrence-prevention path that the evidence supports:

### Prevention Path A: Repo-local fix exists
If the build path is repo-fixable:
- implement the fix
- add regression coverage so the same build/WASM class does not silently return after later development
- preserve exact WASM naming and packaging semantics
- keep `npm run build` meaningful

### Prevention Path B: External blocker only
If the blocker is truly external-only after all bounded repo-local paths are disproved:
- make that classification durable and explicit in the state docs
- ensure future runs do not misclassify it as a parser/extractor regression
- ensure future runs know the exact first-step automation probe/build sequence and the exact outside-automation recheck sequence
- if a repo-local guardrail can classify this earlier without breaking real build verification, implement it

State clearly which path you chose and why.

## FIX DESIGN (BEFORE ANY CODE)

For each viable option you find, write:

FIX DESIGN 1: "<name>"
Current problem: <what is structurally wrong in the current build path or verification flow>
Replacement strategy: <what you will test or change>
Why this preserves semantics: <why the real build/WASM contract remains valid>
Why this avoids false green results: <anti-cheat reasoning>
Why this stays bounded: <why it does not drift into unrelated stages>
Recurrence benefit: <how this reduces future reoccurrence or re-misclassification>
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
- recurrence-classification behavior not covered when that is part of the chosen prevention path

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
- `No BUG or ACTIVE_STAGE_GAP findings remain in the bounded recurring build/WASM task diff.`

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
- treat an automation-only `EPERM` run as sufficient for `EXTERNAL_BLOCKER_PROVEN`
- hide the build failure by skipping verification
- switch to hashed `.wasm` outputs when exact names are required
- break watch-mode expectations without explicitly documenting the tradeoff
- reopen the completed Stage 2 implementation slice without fresh evidence
- widen into parser/extractor/layout/renderer work

## SUCCESS CRITERIA

All must be true:
- either the repo build gate is actually fixed and `cmd /c npm.cmd run build` passes
- or every viable repo-side bounded fix path is explicitly disproved with evidence and the outside-automation recheck has been compared, leaving a clearly documented external blocker
- exact WASM naming and packaging rules still hold
- targeted build/tooling tests pass
- full Jest suite still passes
- `tsc --noEmit` passes
- the chosen recurrence-prevention path is implemented or documented durably
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
- RECURRENCE_HARDENED
- EXTERNAL_BLOCKER_PROVEN
- NEEDS_CONTEXT
- BLOCKED

You must not choose `EXTERNAL_BLOCKER_PROVEN` unless the outside-automation recheck has been attempted and compared against the automation run.
If that recheck has not happened yet, choose `BLOCKED` or `NEEDS_CONTEXT`.
```

---

## Usage notes

- Use this only when current-run verification has reopened the recurring class where a bounded non-build slice is green but the build/WASM gate fails again.
- This prompt does not promise that an external automation environment will never deny spawning again.
- It does require the agent to do the strongest repo-local hardening available so the same class of failure does not keep reopening ambiguously after later development.
- It also requires the exact outside-automation recheck before a final external-blocker classification.
