# Active Implementer Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver traversal
Role: resolver-implementer

## Current objective

Implement the bounded Stage 3 resolver traversal slice without reopening completed Stage 2 parser work or unrelated build/tooling files. The historical build/WASM gate is not currently active in the local environment.

## Required docs to read

- `docs/reference/INDEX.md`
- `docs/agents/ORCHESTRATION.md`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## File boundary

- Allowed: `src/resolver/index.ts`
- Allowed: `src/resolver/stateStubber.ts`
- Allowed: `src/resolver/modifierFlattener.ts`
- Allowed: `tests/resolver/resolver.test.ts`
- Allowed state/runtime updates only after the bounded task materially advances
- Do not edit parser, layout, renderer, or build/tooling files unless build verification regresses or resolver verification directly implicates them

## Implementation rules

- Keep Stage 3 logic pure and no-throw
- Recurse through the current view graph shapes without changing values yet
- Preserve `id`, `sourceRange`, modifier order, and existing `ViewNode` semantics
- Do not start real property-wrapper stub values or modifier rewriting in this slice
- Log a warning and return the original node/tree unmodified if traversal code fails
- Re-use the current `ViewNode[]` contract instead of inventing a parallel resolver IR

## Exit condition

- resolver traversal lands with focused tests and bounded verification, or
- the task is blocked with specific evidence and no stage-boundary drift

## Verification commands

- `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- `node .\node_modules\typescript\lib\tsc.js --noEmit`
- `cmd /c npm.cmd test -- --runInBand`
- `cmd /c npm.cmd run build`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
