# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-17
Roadmap Phase: Phase 1 - Parser Foundation
Pipeline Stage: Stage 2 - Expected IR fixture coverage
Research Layer: Layer 2 parser API + IR contracts

## Objective

Add durable Swift-snippet and expected-IR fixture coverage for the already supported Stage 2 view families, then close the repo-level build gate for that slice without breaking exact WASM packaging semantics.

## Final status

DONE

## Evidence

- Added `tests/parser/fixtureRegression.test.ts` to load Swift source and expected IR from disk, normalize parser output by removing `id` and `sourceRange`, and compare exact Stage 2 IR for supported families
- Added file-backed fixture pairs under `tests/fixtures/parser/` for:
  - `stacks-content`
  - `navigation`
  - `lists`
  - `forms`
  - `scroll`
- Added `esbuild.config.js` as an import-safe build module that exports `getBuildOptions()`, `copyWasmAssets()`, `runBuild()`, and `runCli()`
- Kept `esbuild.js` as the CLI wrapper and routed one-shot builds through `runBuild()` so the non-watch path uses `esbuild.build()` for both bundles while watch mode still uses `esbuild.context()`
- Updated `tests/build/esbuild.test.ts` to verify exact WASM filenames, stale-output cleanup, and the one-shot programmatic build path without shelling out
- Verified:
  - `node .\node_modules\typescript\lib\tsc.js --noEmit`
  - `cmd /c npm.cmd test -- --runInBand tests/build/esbuild.test.ts tests/build/packaging.test.ts`
  - `cmd /c npm.cmd test -- --runInBand`
  - `cmd /c npm.cmd run build`
- Re-ran the direct probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` and it exited cleanly with status `0`, so the earlier `EPERM` report is no longer the active repo state

## Acceptance criteria

- [x] Add a fixture-driven Stage 2 regression test that reads Swift source and expected IR from disk
- [x] Cover only already-supported extractor families in this slice:
  - stacks/core content
  - navigation
  - lists
  - forms/controls
  - scroll/geometry
- [x] Normalize parser output for deterministic fixture comparison without depending on generated `id` or `sourceRange` values
- [x] Keep the task inside Stage 2 validation; do not widen into resolver, layout, renderer, device, or new unsupported SwiftUI features
- [x] `cmd /c npm.cmd test -- --runInBand` passes
- [x] `cmd /c npm.cmd run build` passes
- [x] `node .\node_modules\typescript\lib\tsc.js --noEmit` passes

## Files touched

- `esbuild.config.js`
- `esbuild.js`
- `tests/build/esbuild.test.ts`
- `tests/build/packaging.test.ts`
- `package.json`
- `.vscodeignore`
- `tests/parser/fixtureRegression.test.ts`
- `tests/fixtures/parser/**`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/runtime-prompts/**`

## Out of scope

- New Stage 2 extractor behavior beyond what the existing supported families already expose
- Modifier or view-family expansion for unsupported built-in SwiftUI APIs
- Resolver, layout, renderer, navigation runtime, device chrome, or packaging work
