# PHASE STATE
Updated: 2026-04-17
Active Phase: Phase 1 - Parser Foundation
Active Stage: Stage 2 - Expected IR fixture coverage
Active File: docs/agents/TASK.md

## Completed this session

- [x] Added `tests/parser/fixtureRegression.test.ts` for file-backed Stage 2 IR regression coverage
- [x] Added expected IR fixture pairs under `tests/fixtures/parser/` for stacks/content, navigation, lists, forms, and scroll/geometry
- [x] Split the build entry into import-safe `esbuild.config.js` plus thin CLI wrapper `esbuild.js`
- [x] Preserved exact WASM filename copying and kept watch mode on `esbuild.context()` while routing one-shot builds through `esbuild.build()`
- [x] Updated `tests/build/esbuild.test.ts` to verify exact filenames, stale-output cleanup, and the one-shot programmatic build path
- [x] Re-ran `cmd /c npm.cmd test -- --runInBand tests/build/esbuild.test.ts tests/build/packaging.test.ts` and passed (`2` suites, `8` tests)
- [x] Re-ran `cmd /c npm.cmd test -- --runInBand` and passed (`10` suites, `51` tests)
- [x] Re-ran `node .\node_modules\typescript\lib\tsc.js --noEmit` and passed
- [x] Re-ran `cmd /c npm.cmd run build` and passed
- [x] Re-ran the direct child-process probe and it exited cleanly with status `0`

## Baseline repo status

- [x] Stage 1 parser runtime is implemented
- [x] Stage 2 core extraction is implemented for stacks, text, button, image, spacer, navigation, list-family containers, `ScrollView`, `GeometryReader`, `Form`, `Toggle`, `TextField`, and `SecureField`
- [x] Built-in `Label` extraction exists for Stage 2 consumers that need a concrete label view
- [x] Per-extractor test files exist for navigation, lists, scroll, forms, stacks, and core content extractors
- [x] File-backed expected IR fixtures now exist for the currently supported major Stage 2 view families covered in this slice
- [x] The in-process build-test pattern remains in place for `tests/build/esbuild.test.ts`
- [x] Build/package hardening now uses an import-safe one-shot build path with exact WASM filename preservation
- [x] Full repo verification for the completed Stage 2 fixture coverage slice is closed
- [ ] Resolver, layout, renderer, device, and navigation modules are not yet implemented

## In progress

- [ ] Seed the next bounded Phase 1 / Stage 2 task from `docs/agents/ROADMAP_CHECKLIST.md`

## Blocked

- None for the closed build/WASM gate

## Next agent must start with

1. Read `docs/agents/TASK.md`, `docs/agents/REVIEW.md`, `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and `docs/agents/runtime-prompts/RUNTIME_STATUS.md`
2. Retire the reopened build/WASM runtime prompt for normal work; use `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` or the relevant stage template for the next issue
3. Create the next bounded Phase 1 / Stage 2 task from the next unchecked roadmap bullet
4. Preserve the current build contract: exact WASM filenames, one-shot builds via `runBuild()` / `esbuild.build()`, and watch mode via `esbuild.context()`
5. Reopen build/tooling work only if a fresh failure reproduces on the current refactor

## Suggested next target

- Convert the next unchecked Phase 1 / Stage 2 roadmap item into a bounded task now that verification is closed
