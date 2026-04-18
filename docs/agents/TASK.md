# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-18
Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver traversal
Research Layer: Layer 3 result-builder transforms + IR ViewNode traversal contracts

## Objective

Expand the Stage 3 resolver scaffold so both resolver passes walk the current `ViewNode` tree shapes and view-valued modifiers without changing semantics yet.

## Final status

IN_PROGRESS

## Verified situation

- The bounded Stage 3 resolver scaffold now exists in `src/resolver/index.ts`, `src/resolver/stateStubber.ts`, and `src/resolver/modifierFlattener.ts`
- `resolveViewTree` now threads `ViewNode[]` through both passes, logs a warning, and returns the original tree unmodified if a resolver stage throws
- Current verification baseline:
  - `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts` passed (`1` suite, `4` tests)
  - `node .\node_modules\typescript\lib\tsc.js --noEmit` passed
  - `cmd /c npm.cmd test -- --runInBand` passed (`11` suites, `65` tests)
- Latest local build verification on 2026-04-18 is green:
  - direct child-process probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` passed (`status=0`)
  - `cmd /c npm.cmd run build` passed (`Copied web-tree-sitter.wasm`, `Copied tree-sitter-swift.wasm`, `Build complete`)
- Historical note: the recurring child-process `EPERM` build failure is now treated as an environment-sensitive failure shape only if the direct probe and build command fail again in the same run
- `stateStubber.ts` and `modifierFlattener.ts` are still shallow pass-throughs; they do not recurse into nested child-bearing nodes or modifier-embedded views yet

## Acceptance criteria

- [ ] Update `src/resolver/stateStubber.ts` to recurse through the currently emitted Stage 2 view graph shapes without changing values yet
- [ ] Update `src/resolver/modifierFlattener.ts` to recurse through the same shapes while preserving modifier order exactly
- [ ] Preserve node `id`, `sourceRange`, and existing modifier arrays in the traversal result
- [ ] Keep Stage 3 catch-all behavior in `src/resolver/index.ts`: resolver failures return the original node/tree unmodified and log a warning instead of throwing
- [ ] Add focused resolver coverage proving traversal touches:
  - array-children containers,
  - single-child containers,
  - label and destination child links,
  - view-valued modifiers such as `background`, `overlay`, `toolbar`, `listRowBackground`, `sheet`, and `fullScreenCover` where present in the current IR
- [ ] Re-run `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- [ ] Re-run `node .\node_modules\typescript\lib\tsc.js --noEmit`
- [ ] Re-run `cmd /c npm.cmd test -- --runInBand`
- [ ] Re-run `cmd /c npm.cmd run build` and record the current result; if the historical classified `Build verification blocked before esbuild started ... EPERM` message reappears, re-check the direct probe in the same run and treat it as an environment-sensitive blocker only if both failures reproduce

## Files touched

- `src/resolver/index.ts`
- `src/resolver/stateStubber.ts`
- `src/resolver/modifierFlattener.ts`
- `tests/resolver/resolver.test.ts`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/runtime-prompts/**`

## Reference docs to read before starting

- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Known traps

- Do not start real `@State` / `@Binding` stub semantics or parser-side property-wrapper extraction in this traversal task
- Do not reorder modifiers while adding traversal plumbing
- Do not drop `UnknownNode` or later-stage nodes when walking nested structures
- Do not widen into Stage 2 extractor changes or Stage 4 layout work
- Do not keep carrying forward the historical `EPERM` blocker if the current direct probe and build command pass
- Do not reopen build/tooling files unless the classified build message changes or resolver verification directly implicates them

## Out of scope

- Real property-wrapper stub injection semantics
- Real modifier flattening semantics beyond traversal-preserving pass-through
- Parser/extractor changes
- Layout, renderer, device, interaction, or MCP work
