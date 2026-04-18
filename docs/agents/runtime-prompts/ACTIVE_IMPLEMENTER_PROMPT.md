# Active Implementer Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver scaffolding
Role: resolver-implementer

## Current objective

Implement the bounded Stage 3 resolver scaffold without reopening completed Stage 2 parser work or the already classified build/WASM gate.

## Required docs to read

- `docs/reference/INDEX.md`
- `docs/agents/ORCHESTRATION.md`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/property-wrapper-stubs.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## File boundary

- Allowed: `src/resolver/index.ts`
- Allowed: `src/resolver/stateStubber.ts`
- Allowed: `src/resolver/modifierFlattener.ts`
- Allowed: `tests/resolver/resolver.test.ts`
- Allowed state/runtime updates only after the bounded task materially advances
- Do not edit parser, layout, renderer, or build/tooling files unless the classified build message changes or resolver verification directly implicates them

## Implementation rules

- Keep Stage 3 logic pure and no-throw
- Start with pass-through scaffolding only; real stub injection and modifier flattening come later
- Preserve modifier order and existing `ViewNode` semantics
- Log a warning and return the original node/tree unmodified if scaffolded resolver code fails
- Re-use the current `ViewNode[]` contract instead of inventing a parallel resolver IR

## Exit condition

- resolver scaffolding lands with focused tests and bounded verification, or
- the task is blocked with specific evidence and no stage-boundary drift

## Verification commands

- `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- `node .\node_modules\typescript\lib\tsc.js --noEmit`
- `cmd /c npm.cmd test -- --runInBand`
- `cmd /c npm.cmd run build`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
