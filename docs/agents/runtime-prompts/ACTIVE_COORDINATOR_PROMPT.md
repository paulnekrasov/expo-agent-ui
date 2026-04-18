# Active Coordinator Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver traversal
Role: stage-orchestrator

## Current objective

Manage the bounded Stage 3 resolver traversal slice while keeping the live build state aligned with the current local verification.

## Required docs to read

- `docs/reference/INDEX.md`
- `docs/agents/ORCHESTRATION.md`
- `docs/agents/PROMPT_ROTATION_PROTOCOL.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Scope boundary

- Keep edits inside the resolver allowlist in `docs/agents/TASK.md`
- Build verification currently passes locally as of 2026-04-18; do not carry forward the historical `Build verification blocked before esbuild started ... EPERM` blocker unless the direct probe or build command regresses
- Update state files and runtime prompts before finishing

## Exit condition

- The Stage 3 resolver traversal slice is implemented, reviewed, and state is updated, or
- the slice is re-bounded or marked blocked with evidence and the runtime prompts are rotated accordingly

## Verification commands

- `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- `node .\node_modules\typescript\lib\tsc.js --noEmit`
- `cmd /c npm.cmd test -- --runInBand`
- `cmd /c npm.cmd run build`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
