# Runtime Prompt Status

Updated: 2026-04-18

## Status

The runtime prompt set has been rotated away from the completed Stage 2 grid extraction slice and onto the next bounded Phase 2 / Stage 3 resolver scaffolding task.

The build gate remains externally blocked in this automation environment, but it is still recurrence-hardened rather than ambiguous: `cmd /c npm.cmd run build` fails before esbuild starts with the same classified child-process `EPERM` message.

## Current run outcome

- Confirmed the current worktree closes the bounded `LazyVGrid` / `LazyHGrid` Stage 2 extractor slice
- `cmd /c npm.cmd test -- --runInBand tests/parser/extractors/lists.test.ts tests/parser/fixtureRegression.test.ts` passed (`2` suites, `15` tests)
- `node .\node_modules\typescript\lib\tsc.js --noEmit` passed
- `cmd /c npm.cmd test -- --runInBand` passed (`10` suites, `61` tests)
- `cmd /c npm.cmd run build` still failed in this automation environment, but with the same explicit message:
  - `Build verification blocked before esbuild started: child-process execution is denied in the current environment.`
  - `Direct probe: spawnSync C:\Program Files\nodejs\node.exe -> EPERM`
- Seeded the next bounded task: Stage 3 resolver scaffolding

## Active runtime prompts

- `ACTIVE_COORDINATOR_PROMPT.md` now binds the automation to the bounded Stage 3 resolver scaffold
- `ACTIVE_IMPLEMENTER_PROMPT.md` constrains code-writing work to the resolver scaffold allowlist plus focused resolver smoke coverage
- `ACTIVE_REVIEW_PROMPT.md` constrains review to the resolver scaffold diff and the Stage 3 checklist
- `ACTIVE_FIX_PROMPT.md` carries forward the external build blocker classification so the next implementation loop does not reopen build-tooling thrash

## What the next automation run should do first

1. Read `docs/agents/TASK.md`, `docs/agents/REVIEW.md`, `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and this file
2. Read `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`, `docs/reference/ir/property-wrapper-stubs.md`, `docs/reference/ir/viewnode-types.md`, and `docs/CLAUDE.md`
3. Implement only the bounded Stage 3 resolver scaffolding slice described in `docs/agents/TASK.md`
4. If source changes, re-run:
   - `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
   - `node .\node_modules\typescript\lib\tsc.js --noEmit`
   - `cmd /c npm.cmd test -- --runInBand`
   - `cmd /c npm.cmd run build`
5. Treat a repeated classified `Build verification blocked before esbuild started ... EPERM` result as the known external blocker unless the direct probe or message shape changes

## Notes

- Do not reopen completed Stage 2 grid extraction by default
- Do not reopen build/tooling files unless the classified build failure changes shape
- If the build environment changes and the direct probe stops failing, the next run should immediately re-test `cmd /c npm.cmd run build` and update the live state
