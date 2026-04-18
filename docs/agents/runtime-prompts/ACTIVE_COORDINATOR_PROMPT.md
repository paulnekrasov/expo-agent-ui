# Active Coordinator Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver scaffolding
Role: stage-orchestrator

## Current objective

Manage the bounded Stage 3 resolver scaffolding slice while carrying forward the classified external build blocker.

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
- `docs/reference/ir/property-wrapper-stubs.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Scope boundary

- Keep edits inside the resolver scaffold allowlist in `docs/agents/TASK.md`
- Treat the classified `Build verification blocked before esbuild started ... EPERM` result as a carry-forward external blocker unless the direct probe or message shape changes
- Update state files and runtime prompts before finishing

## Exit condition

- The Stage 3 resolver scaffold is implemented, reviewed, and state is updated, or
- the slice is re-bounded or marked blocked with evidence and the runtime prompts are rotated accordingly

## Verification commands

- `cmd /c npm.cmd test -- --runInBand tests/resolver/resolver.test.ts`
- `node .\node_modules\typescript\lib\tsc.js --noEmit`
- `cmd /c npm.cmd test -- --runInBand`
- `cmd /c npm.cmd run build`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
