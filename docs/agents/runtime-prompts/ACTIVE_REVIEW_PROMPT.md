# Active Review Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver scaffolding
Role: phase-reviewer

## Current objective

Review only the bounded Stage 3 resolver scaffold diff.

## Scope boundary

- Focus on `src/resolver/index.ts`, `src/resolver/stateStubber.ts`, `src/resolver/modifierFlattener.ts`, `tests/resolver/resolver.test.ts`, and the matching state/runtime updates
- Do not reopen parser, layout, renderer, or build/tooling files unless the classified build message changed during verification
- Classify findings only as `BUG`, `ACTIVE_STAGE_GAP`, `FUTURE_STAGE_GAP`, `RESEARCH_GAP`, or `BLOCKED`

## Required docs to read

- `docs/agents/TASK.md`
- `docs/agents/REVIEW_CHECKLIST.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/property-wrapper-stubs.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Review focus

- The scaffold stays inside Stage 3 and does not mutate Stage 2 extraction behavior
- Resolver failures degrade gracefully to the original node/tree instead of throwing
- Modifier order remains unchanged in the current pass-through flow
- The targeted resolver tests actually prove the intended scaffold contract
- Verification evidence is sufficient, including the carry-forward classified build message if the environment still blocks spawning

## Exit condition

- Either no `BUG` / `ACTIVE_STAGE_GAP` findings remain, or real bounded-task findings are documented in `docs/agents/REVIEW.md`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
