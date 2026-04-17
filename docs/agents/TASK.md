# TASK SPECIFICATION
Created by: stage-orchestrator
Date: 2026-04-17
Roadmap Phase: Phase 1 - Parser Foundation
Pipeline Stage: Stage 2 - Extractor
Research Layer: Layer 1, Layer 2, and Layer 3

## Objective

Implement the next bounded Stage 2 extractor slice for `Form`, `Toggle`, `TextField`, and `SecureField` without widening into layout, renderer, or build-tooling work.

## Current status

- Stage 2 forms and controls extraction landed in `src/parser/extractors/views/forms.ts` and is wired through `src/parser/extractors/views/index.ts`
- Snippet-based coverage exists in `tests/parser/extractors/forms.test.ts`, and the adjacent list, navigation, scroll, and parser smoke tests were updated to reflect supported `Toggle` extraction
- Targeted Stage 2 suites pass (`5` suites, `27` tests), and `node .\node_modules\typescript\lib\tsc.js --noEmit` passes on the current worktree
- Full verification is blocked in the current automation environment: `cmd /c npm.cmd test -- --runInBand` fails only in `tests/build/esbuild.test.ts`, and `cmd /c npm.cmd run build` fails with the same `spawnSync C:\Program Files\nodejs\node.exe EPERM` preflight error before esbuild starts

## Acceptance criteria

- [x] `Form` extracts as a container view and routes its child content through existing recursive extraction with `UnknownNode` preserved as the final fallback
- [x] `Toggle`, `TextField`, and `SecureField` extract their common initializer shapes without throwing in Stage 1 or Stage 2
- [x] Add snippet-based tests under `tests/parser/extractors` for the new forms and controls slice
- [ ] Verify `cmd /c npm.cmd test -- --runInBand`, `node .\node_modules\typescript\lib\tsc.js --noEmit`, and `cmd /c npm.cmd run build`
- [x] Keep the task inside Stage 2 only; no resolver, layout, renderer, device, navigation, or further build-tooling work

## Files to touch

- `src/parser/extractors/views/forms.ts`
- `src/parser/extractors/views/index.ts`
- `tests/parser/extractors/forms.test.ts`
- `tests/parser/extractors/lists.test.ts`
- `tests/parser/extractors/navigation.test.ts`
- `tests/parser/extractors/scroll.test.ts`
- `tests/parser/parseSwiftFile.test.ts`
- `docs/agents/TASK.md`
- `docs/agents/REVIEW.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/runtime-prompts/ACTIVE_COORDINATOR_PROMPT.md`
- `docs/agents/runtime-prompts/ACTIVE_IMPLEMENTER_PROMPT.md`
- `docs/agents/runtime-prompts/ACTIVE_REVIEW_PROMPT.md`
- `docs/agents/runtime-prompts/ACTIVE_FIX_PROMPT.md`
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md`

## Reference docs to read before starting

- `docs/reference/layer-1-grammar/node-types.md`
- `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- `docs/reference/swift-syntax/view-initializer-signatures.md`
- `docs/reference/layer-2-parser-api/web-tree-sitter-api.md`
- `docs/CLAUDE.md`
- `docs/agents/ORCHESTRATION.md`
- `docs/agents/PROMPT_ROTATION_PROTOCOL.md`
- `docs/agents/REVIEW_CHECKLIST.md`

## Known traps

- Do not guess tree-sitter node names or fall back to unofficial names like `argument` or `closure_expression`
- Preserve `UnknownNode` as the final extractor fallback
- `Toggle`, `TextField`, and `SecureField` have multiple initializer shapes; support the common text and view-builder label forms from the canonical initializer signatures before widening further
- Keep Stage 2 extraction structural only; do not add layout or renderer-specific control chrome in this task
- Keep Windows-safe path handling untouched

## Out of scope

- Hardening `esbuild.js`, packaging hooks, or VSIX contents
- Control rendering, styling, focus, submit behavior, or other later-stage UI behavior
- New modifier families unrelated to the bounded forms and controls slice
- Resolver, layout, renderer, device, navigation, or automation-runtime redesign work
