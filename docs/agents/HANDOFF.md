# HANDOFF NOTE
From: cleanup archivist
To: component primitives implementer
Session date: 2026-04-27

## What I Did

- Continued the Expo Agent UI rebuild cleanup.
- Loaded and applied `$context-prompt-engineering` for markdown rewrite structure.
- Deleted the retired old-project implementation and build surfaces:
  - old `src/`, `tests/`, `scripts/`, and `out/`
  - `tree-sitter-swift`, `tree-sitter-swift.wasm`, and `.gitmodules`
  - `.vscodeignore`, `esbuild.js`, and `esbuild.config.js`
  - old repo-local `skills/`
- Removed old layer-based reference folders for tree-sitter, parser, resolver, VS Code, Canvas
  renderer, Swift syntax, device frames, and old planning.
- Removed old root-level SwiftUI preview research and planning markdown files under `docs/`.
- Removed stale parser/WASM/debugging prompt templates from `docs/agents`.
- Added compact replacement references for layout DNA, iOS tokens, control chrome, motion mapping,
  and icons.
- Rewrote `.agents/agents/*` from old parser/resolver roles into Expo Agent UI product-stage
  roles.
- Updated `AGENTS.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/reference/INDEX.md`, roadmap,
  runtime prompt status, and review/orchestration rules to reflect cleanup completion.

## What I Found

- The old implementation surfaces were still present even though active docs had already pivoted.
- The useful parts of the old docs were design principles, not implementation contracts.
- Old role prompts were a real drift risk because they still routed agents to parser, resolver,
  layout, renderer, and VS Code work.
- Remote old branches still exist on `origin`; I did not delete remote branches because that is a
  shared-repository operation that should be explicitly requested.

## Verification Completed

- `npm run typecheck --workspaces --if-present`
- `npm run build --workspaces --if-present`
- `npm test --workspaces --if-present`

Build output folders under `packages/*/dist` were removed after verification.

## What The Next Agent Must Do First

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/reference/react-native/accessibility-semantics.md`.
4. Read `docs/reference/design/swiftui-layout-dna.md`.
5. Read `docs/reference/design/ios-tokens.md`.
6. Read `docs/agents/TASK.md`.
7. Check `git status --short --branch`.

## What The Next Agent Must Not Do

- Do not recreate old SwiftUI parser, resolver, tree-sitter, WASM, VS Code extension, or Canvas
  renderer assets.
- Do not implement Stage 3 semantic registry behavior inside the Stage 2 primitive task.
- Do not make `@expo/ui`, Expo Router, React Navigation, MCP SDK, or native modules mandatory in
  `packages/core`.
- Do not expose MCP tools before the runtime exists.

## Confidence Level

- Cleanup completeness for active context: 90%
- Stage 2 readiness: 85%
- Need for remote branch cleanup: 60%, pending explicit user decision
- Dependency audit readiness: 60% because npm still reports moderate findings from the dependency
  graph
