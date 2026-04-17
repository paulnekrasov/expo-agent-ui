# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-17
Roadmap Phase: Phase 1 - Parser Foundation
Pipeline Stage: Stage 2 - Modifier extraction
Research Layer: Layer 2 parser API + Swift syntax modifier signatures + IR list modifier contracts

## Objective

Add Stage 2 extraction coverage for the list presentation modifier family so supported `List` and row snippets stop degrading `listStyle`, `listRowSeparator`, and `listRowInsets` into `unknown` modifier payloads.

## Final status

DONE_WITH_CONCERNS

## Evidence

- Reproduced the current gap with `parseSwiftFile(...)` against a minimal `List` snippet and confirmed all three target modifiers degraded to `unknown`
- Verified the Stage 2 AST shape with the repo runtime before editing:
  - `listStyle(.insetGrouped)` and `listRowSeparator(.hidden)` arrive as literal path-like identifiers
  - `listRowInsets(...)` receives a nested `call_expression` for `EdgeInsets(top:leading:bottom:trailing:)`
- Added Stage 2 modifier extraction in `src/parser/extractors/modifiers/coreModifiers.ts` for:
  - `.listStyle(...)` across the current literal style family
  - `.listRowSeparator(...)` with literal `Visibility` values and optional validated `edges:`
  - `.listRowInsets(EdgeInsets(top:leading:bottom:trailing:))` with numeric literal insets
- Widened the Stage 2 IR `ListStyle` union in `src/ir/types.ts` to include `automatic`
- Added focused extractor coverage in `tests/parser/extractors/lists.test.ts`
- Updated fixture-backed regression coverage in `tests/fixtures/parser/lists.swift` and `tests/fixtures/parser/lists.json`
- Verified:
  - `cmd /c npm.cmd test -- --runInBand tests/parser/extractors/lists.test.ts tests/parser/fixtureRegression.test.ts`
  - `cmd /c npm.cmd test -- --runInBand`
  - `node .\node_modules\typescript\lib\tsc.js --noEmit`
- Build verification remains blocked in the current automation environment:
  - direct probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` failed with `EPERM`
  - `cmd /c npm.cmd run build` failed with `spawn EPERM` before `esbuild` completed

## Acceptance criteria

- [x] Parse `.listStyle(...)` for the current literal style family used by the Stage 2 IR (`plain`, `grouped`, `inset`, `insetGrouped`, `sidebar`, and `automatic`)
- [x] Parse `.listRowSeparator(...)` for literal `Visibility` values (`automatic`, `visible`, `hidden`) without widening into renderer behavior
- [x] Parse `.listRowInsets(EdgeInsets(top:leading:bottom:trailing:))` when each inset is a numeric literal
- [x] Preserve modifier order relative to existing Stage 2 modifiers on both `List` roots and list row children
- [x] Add focused Stage 2 list extractor assertions plus fixture-backed regression coverage in the existing `lists` fixture path
- [x] Keep the task inside Stage 2 extraction only; do not widen into toolbar/navigationDestination work, list row background, layout semantics, or renderer styling
- [x] `cmd /c npm.cmd test -- --runInBand` passes
- [ ] `cmd /c npm.cmd run build` passes
- [x] `node .\node_modules\typescript\lib\tsc.js --noEmit` passes

## Files touched

- `src/parser/extractors/modifiers/coreModifiers.ts`
- `src/ir/types.ts`
- `tests/parser/extractors/lists.test.ts`
- `tests/fixtures/parser/lists.swift`
- `tests/fixtures/parser/lists.json`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/runtime-prompts/**`

## Out of scope

- `toolbar`, `navigationDestination`, `listRowBackground`, or any later Stage 2 modifier family outside this list slice
- Non-literal `listStyle` expressions, `listRowInsets(nil)`, or non-numeric `EdgeInsets(...)` arguments
- Stage 3 resolver work, Stage 4 layout semantics, Stage 5 rendering, device chrome, or repo-local build-tooling changes
