# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-18
Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver scaffolding
Research Layer: Layer 3 result-builder transforms + IR property-wrapper stubs

## Objective

Add the initial Stage 3 resolver module structure so the repo has a typed, no-throw resolver entry point before real state stubbing and modifier flattening land.

## Final status

IN_PROGRESS

## Verified situation

- The bounded Phase 1 / Stage 2 `LazyVGrid` / `LazyHGrid` extraction slice is implemented and review-clean in the current worktree
- Current verification baseline:
  - `cmd /c npm.cmd test -- --runInBand tests/parser/extractors/lists.test.ts tests/parser/fixtureRegression.test.ts` passed (`2` suites, `15` tests)
  - `node .\node_modules\typescript\lib\tsc.js --noEmit` passed
  - `cmd /c npm.cmd test -- --runInBand` passed (`10` suites, `61` tests)
- The recurring build/WASM gate remains externally blocked in this automation environment:
  - `cmd /c npm.cmd run build` fails fast with `Build verification blocked before esbuild started: child-process execution is denied in the current environment.`
  - direct probe remains `spawnSync(process.execPath, ['-e', 'process.exit(0)']) -> EPERM`
- `src/resolver/` does not exist yet, so there is no Stage 3 entry point, no state stubber module, and no modifier flattener module

## Acceptance criteria

- [ ] Add `src/resolver/index.ts`
- [ ] Add `src/resolver/stateStubber.ts`
- [ ] Add `src/resolver/modifierFlattener.ts`
- [ ] Export a bounded Stage 3 entry point that threads `ViewNode[]` through the resolver scaffolding without changing semantics yet
- [ ] Keep Stage 3 catch-all behavior: resolver failures return the original node/tree unmodified and log a warning instead of throwing
- [ ] Keep modifier order unchanged in the scaffolded flow
- [ ] Add focused resolver smoke coverage under `tests/resolver/`
- [ ] Re-run `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- [ ] Re-run `node .\node_modules\typescript\lib\tsc.js --noEmit`
- [ ] Re-run `cmd /c npm.cmd test -- --runInBand`
- [ ] Re-run `cmd /c npm.cmd run build` and treat the classified `Build verification blocked before esbuild started ... EPERM` result as the known external blocker unless its message shape changes

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
- `docs/reference/ir/property-wrapper-stubs.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Known traps

- Do not start real `@State` / `@Binding` AST extraction in this scaffold task
- Do not reorder modifiers while wiring the Stage 3 pass-through flow
- Do not widen into Stage 2 extractor changes or Stage 4 layout work
- Do not reopen build/tooling files unless the classified build message changes or resolver verification directly implicates them

## Out of scope

- Real property-wrapper stub injection semantics
- Real modifier flattening semantics beyond no-op scaffolding
- Parser/extractor changes
- Layout, renderer, device, interaction, or MCP work
