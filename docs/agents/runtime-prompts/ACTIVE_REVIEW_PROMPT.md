# Active Review Prompt

Roadmap Phase: Phase 2 - Resolver
Pipeline Stage: Stage 3 - Resolver traversal
Role: phase-reviewer

## Current objective

Review only the bounded Stage 3 resolver traversal diff.

## Scope boundary

- Focus on `src/resolver/index.ts`, `src/resolver/stateStubber.ts`, `src/resolver/modifierFlattener.ts`, `tests/resolver/resolver.test.ts`, and the matching state/runtime updates
- Do not reopen parser, layout, renderer, or build/tooling files unless current verification changes the build result or reproduces the historical `EPERM` failure shape
- Classify findings only as `BUG`, `ACTIVE_STAGE_GAP`, `FUTURE_STAGE_GAP`, `RESEARCH_GAP`, or `BLOCKED`

## Required docs to read

- `docs/agents/TASK.md`
- `docs/agents/REVIEW_CHECKLIST.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/ir/viewnode-types.md`
- `docs/CLAUDE.md`

## Review focus

- The traversal work stays inside Stage 3 and does not mutate Stage 2 extraction behavior
- Recursive walking covers the bounded child-bearing node shapes and view-valued modifiers promised in `TASK.md`
- Resolver failures degrade gracefully to the original node/tree instead of throwing
- Modifier order remains unchanged in the traversal flow
- The targeted resolver tests actually prove the intended traversal contract
- Verification evidence is sufficient, including the current build result; if the environment regresses, require the same-run direct probe plus the classified build message before calling it blocked

## Exit condition

- Either no `BUG` / `ACTIVE_STAGE_GAP` findings remain, or real bounded-task findings are documented in `docs/agents/REVIEW.md`

## Required final status token

`DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
