# HANDOFF NOTE
From: stage-orchestrator
To: next orchestrator, implementer, reviewer, or fixer
Session date: 2026-04-17

## What I did

- Validated the reopened build/WASM prompt against the live worktree instead of the stale `spawn EPERM` report
- Confirmed `esbuild.config.js` now owns the import-safe build contract and `esbuild.js` is the thin CLI wrapper
- Confirmed the one-shot build path uses `esbuild.build()` for both bundles while watch mode still uses `esbuild.context()`
- Re-ran:
  - direct probe `spawnSync(process.execPath, ['-e', 'process.exit(0)'])`
  - `node .\node_modules\typescript\lib\tsc.js --noEmit`
  - `cmd /c npm.cmd test -- --runInBand tests/build/esbuild.test.ts tests/build/packaging.test.ts`
  - `cmd /c npm.cmd test -- --runInBand`
  - `cmd /c npm.cmd run build`

## What I found

- The reopened blocker is closed in-repo: `cmd /c npm.cmd run build` and the direct spawn probe both pass in the current environment
- Exact WASM filename preservation remains intact: build output still copies `web-tree-sitter.wasm` and `tree-sitter-swift.wasm` unchanged
- `tests/build/esbuild.test.ts` now covers the import-safe one-shot build path without shelling out, so the build contract is verified in-process
- The earlier `spawn EPERM` narrative is stale relative to the current worktree and should not be reused as the active repo state

## What the next agent must do first

- Stop using `docs/agents/runtime-prompts/ACTIVE_FIX_PROMPT.md` unless a fresh build/WASM regression appears
- Seed the next bounded Phase 1 / Stage 2 task from `docs/agents/ROADMAP_CHECKLIST.md`
- Preserve the current no-watch build strategy and exact-name WASM copying unless a new failure proves it insufficient

## What the next agent must not do

- Do not reopen the old `EPERM` blocker without a fresh reproduction on the current worktree
- Do not replace exact-name WASM copying with hashed loader output
- Do not reintroduce subprocess-based build assertions into `tests/build/esbuild.test.ts`
- Do not widen this closed build/tooling fix into resolver, layout, renderer, device, or navigation runtime work

## Confidence level on current build

- Phase 1 / Parser Foundation: 96% (Stage 2 parser/test work is green and the repo build gate now passes)
- Phase 2 / Resolver: 0%
- Phase 3 / Layout Foundation: 0%
- Phase 4 / Renderer Foundation: 0%
- Phase 5 / Device and Interaction: 0%
- Phase 6 / MCP Surface: 0%
