# Active Fix Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver scaffolding
Research Layer: Layer 3 result-builder transforms + IR property-wrapper stubs
Role: issue-fixer

## Current objective

Fix only valid `BUG` or `ACTIVE_STAGE_GAP` findings in the bounded Stage 3 resolver scaffolding slice.

This is not a parser or build-tooling task anymore. The recurring build gate is carry-forward context only.

## Required docs to read before doing any work

1. `docs/reference/INDEX.md`
2. `docs/agents/ORCHESTRATION.md`
3. `docs/agents/PHASE_STATE.md`
4. `docs/agents/HANDOFF.md`
5. `docs/agents/ROADMAP_CHECKLIST.md`
6. `docs/agents/TASK.md`
7. `docs/agents/REVIEW.md`
8. `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
9. `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
10. `docs/reference/ir/property-wrapper-stubs.md`
11. `docs/reference/ir/viewnode-types.md`
12. `docs/CLAUDE.md`
13. `src/resolver/index.ts`
14. `src/resolver/stateStubber.ts`
15. `src/resolver/modifierFlattener.ts`
16. `tests/resolver/resolver.test.ts`

If `$context-prompt-engineering` is available, use it before acting so the task stays explicit, bounded, and verification-driven.

If a debugging skill is available, use it before proposing a fix.

## Verified carry-forward facts

- The recurring build/WASM gate has already been classified and hardened in `esbuild.config.js`
- In this automation environment, `cmd /c npm.cmd run build` may still fail with:
  - `Build verification blocked before esbuild started: child-process execution is denied in the current environment.`
  - `Direct probe: spawnSync C:\Program Files\nodejs\node.exe -> EPERM`
- Treat that exact classified build result as a carry-forward external blocker unless the direct probe or message shape changes

## Scope boundary

Stay inside the current resolver scaffold allowlist from `docs/agents/TASK.md`.

Do not edit parser, layout, renderer, or build/tooling files unless the classified build message changes or resolver verification directly implicates them.

Do not widen into real property-wrapper semantics, modifier flattening behavior, or later pipeline stages.

## Non-negotiable repo rules

- Keep Stage 3 logic pure and degrade gracefully instead of throwing
- Preserve modifier order
- Return the original node/tree unmodified if scaffolded resolver code fails
- Keep the existing `ViewNode[]` contract rather than inventing a parallel type system
- Do not hide failures with skipped tests or weakened assertions

## Required verification

Run these unless a stronger bounded equivalent is justified explicitly:

1. `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
2. `node .\node_modules\typescript\lib\tsc.js --noEmit`
3. `cmd /c npm.cmd test -- --runInBand`
4. `cmd /c npm.cmd run build`

If the build command still emits the classified `EPERM` message above, record it as a carry-forward blocker and do not treat it as a new resolver defect by default.

## Exit condition

This prompt is complete only when one of these is true:

- all `BUG` / `ACTIVE_STAGE_GAP` findings in the bounded resolver scaffold diff are fixed and verification is recorded, or
- the slice is blocked with explicit current-stage evidence and no stage-boundary drift

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
