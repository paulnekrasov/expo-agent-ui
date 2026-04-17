# Runtime Prompt Status

Updated: 2026-04-17

## Status

The reopened build/WASM fix prompt achieved its goal. Repo-side build verification is green again, so the next run should stop using `docs/agents/runtime-prompts/ACTIVE_FIX_PROMPT.md` unless a fresh build/tooling/WASM failure reproduces.

## Current run outcome

- Direct probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])` passed with exit status `0`
- `cmd /c npm.cmd test -- --runInBand tests/build/esbuild.test.ts tests/build/packaging.test.ts` passed (`2` suites, `8` tests)
- `node .\node_modules\typescript\lib\tsc.js --noEmit` passed
- `cmd /c npm.cmd test -- --runInBand` passed (`10` suites, `51` tests)
- `cmd /c npm.cmd run build` passed with `Copied web-tree-sitter.wasm`, `Copied tree-sitter-swift.wasm`, and `Build complete`
- The current build contract now lives in `esbuild.config.js`, while `esbuild.js` remains the CLI wrapper for `npm run build`

## What the next automation run should do first

1. Read `docs/agents/TASK.md`, `docs/agents/REVIEW.md`, `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and this file
2. Do not reuse `docs/agents/runtime-prompts/ACTIVE_FIX_PROMPT.md` unless a fresh build/tooling/WASM failure is reproduced first
3. Seed the next bounded Phase 1 / Stage 2 task from `docs/agents/ROADMAP_CHECKLIST.md`
4. If the next issue is not build/tooling/WASM-centered, regenerate prompts from `docs/agents/DEBUGGING_PROMPT_TEMPLATE.md` or the relevant stage-specific template
5. Preserve the current build contract unless a new failure proves it insufficient

## Notes

- Stable prompt templates under `docs/agents/` were not modified by this pass.
- The stale `spawn EPERM` narrative was disproved by the current worktree.
- Exact WASM filename preservation and packaging assertions remain in place.
