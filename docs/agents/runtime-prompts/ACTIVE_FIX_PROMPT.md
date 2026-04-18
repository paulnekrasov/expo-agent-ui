# Active Fix Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver traversal
Research Layer: Layer 3 result-builder transforms + IR ViewNode traversal contracts
Role: issue-fixer

## Current objective

Fix only valid `BUG` or `ACTIVE_STAGE_GAP` findings in the bounded Stage 3 resolver traversal slice.

This is not a parser or build-tooling task anymore. The historical build/WASM gate is context only unless it fails again in the current run.

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
10. `docs/reference/ir/viewnode-types.md`
11. `docs/CLAUDE.md`
12. `src/resolver/index.ts`
13. `src/resolver/stateStubber.ts`
14. `src/resolver/modifierFlattener.ts`
15. `tests/resolver/resolver.test.ts`

If `$context-prompt-engineering` is available, use it before acting so the task stays explicit, bounded, and verification-driven.

If a debugging skill is available, use it before proposing a fix.

## Verified carry-forward facts

- The recurring build/WASM gate has already been classified and hardened in `esbuild.config.js`
- Latest local verification on 2026-04-18 passed:
  - direct child-process probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` -> `status=0`
  - `cmd /c npm.cmd run build` -> `Copied web-tree-sitter.wasm`, `Copied tree-sitter-swift.wasm`, `Build complete`
- If the historical `EPERM` failure shape reappears in another environment, re-check the direct probe in the same run before treating it as an environment-sensitive blocker

## Scope boundary

Stay inside the current resolver allowlist from `docs/agents/TASK.md`.

Do not edit parser, layout, renderer, or build/tooling files unless build verification regresses or resolver verification directly implicates them.

Do not widen into real property-wrapper semantics, modifier rewriting behavior, parser-side wrapper extraction, or later pipeline stages.

## Non-negotiable repo rules

- Keep Stage 3 logic pure and degrade gracefully instead of throwing
- Preserve `id`, `sourceRange`, and modifier order
- Return the original node/tree unmodified if traversal code fails
- Keep the existing `ViewNode[]` contract rather than inventing a parallel type system
- Do not hide failures with skipped tests or weakened assertions

## Required verification

Run these unless a stronger bounded equivalent is justified explicitly:

1. `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
2. `node .\node_modules\typescript\lib\tsc.js --noEmit`
3. `cmd /c npm.cmd test -- --runInBand`
4. `cmd /c npm.cmd run build`

If the build command emits the historical classified `EPERM` message again, record the same-run direct probe result and do not treat it as a new resolver defect by default.

## Exit condition

This prompt is complete only when one of these is true:

- all `BUG` / `ACTIVE_STAGE_GAP` findings in the bounded resolver traversal diff are fixed and verification is recorded, or
- the slice is blocked with explicit current-stage evidence and no stage-boundary drift

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
