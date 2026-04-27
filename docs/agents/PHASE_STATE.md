# PHASE STATE
Updated: 2026-04-27
Active Phase: Phase 2 - Component Primitives
Active Stage: Stage 2 - Component Primitives
Active File: docs/agents/TASK.md

## Completed This Session

- [x] Continued the Expo Agent UI rebuild on branch `codex/expo-agent-ui-rebuild`.
- [x] Used `$context-prompt-engineering` to guide markdown rewrites for role, task, constraint,
  output, progressive-disclosure, and verification clarity.
- [x] Completed the dedicated cleanup/archive pass authorized by the user.
- [x] Removed retired old-project assets:
  - top-level `src/`
  - top-level `tests/`
  - old `scripts/`
  - old `out/`
  - `tree-sitter-swift`
  - `tree-sitter-swift.wasm`
  - `.gitmodules`
  - `.vscodeignore`
  - `esbuild.js`
  - `esbuild.config.js`
  - old repo-local `skills/`
  - old layer-based parser, Swift syntax, VS Code, Canvas renderer, and planning references
  - old root-level SwiftUI preview research and planning markdown files under `docs/`
  - stale parser/WASM/debugging prompt templates
- [x] Preserved useful design DNA in compact new references:
  - `docs/reference/design/swiftui-layout-dna.md`
  - `docs/reference/design/ios-tokens.md`
  - `docs/reference/design/control-chrome.md`
  - `docs/reference/motion/swiftui-motion-mapping.md`
  - `docs/reference/native/symbols-and-icons.md`
- [x] Rewrote repo-local agent catalog and role prompts around Expo Agent UI product stages.
- [x] Updated active docs so they say old parser assets are cleaned from active context, not waiting
  for future deletion.

## Baseline Repo Status

- [x] Rebuild proposal exists at `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`.
- [x] Research prompt library exists at `docs/agents/research-prompts/expo-agent-ui/`.
- [x] Research status exists at `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`.
- [x] High-priority research reports exist for package foundation, Expo UI, Reanimated,
  accessibility semantics, MCP transport, and security.
- [x] npm workspace package foundation is implemented.
- [x] Core package remains JS-only and has no native module implementation.
- [x] Old SwiftUI parser, VS Code extension, tree-sitter, WASM, Canvas renderer, and old reference
  surfaces have been removed from active context.
- [ ] Component primitives are not yet implemented.
- [ ] Semantic runtime is not yet implemented.
- [ ] Agent bridge and MCP server are not yet implemented beyond package shells.

## In Progress

- [ ] Current bounded task: implement the first Stage 2 component primitive slice.

## Blocked

- [ ] No current blocker for Stage 2 component primitives.
- [ ] Full example app typechecking may require installing refreshed Expo workspace dependencies.
- [ ] Physical-device bridge transport remains a future Stage 4 concern.
- [ ] Native automation selector mapping remains a future post-v0 concern.

## Next Agent Must Start With

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `docs/agents/TASK.md`.
5. Read `docs/reference/react-native/accessibility-semantics.md`.
6. Read `docs/reference/design/swiftui-layout-dna.md`.
7. Verify the current dirty worktree before editing; preserve unrelated research files and
   workspace metadata.

## Suggested Next Target

- Implement the Stage 2 component primitive slice in `packages/core/src`.
