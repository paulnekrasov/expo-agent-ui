# PHASE STATE
Updated: 2026-04-30
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
- [x] Added EAS/native preview project DNA:
  - EAS cloud Macs can build iOS SwiftUI artifacts.
  - Live iOS preview still needs an iOS runtime.
  - Side-by-side iOS SwiftUI and Android Compose preview is a multi-session editor problem.
  - Added `docs/reference/expo/eas-native-preview.md` and
    `docs/agents/research-prompts/expo-agent-ui/MEDIUM-04-eas-native-preview-workflows.md`.
- [x] Added platform skill routing DNA:
  - Expo, React Native, composition, native accessibility, native app design engineering, Apple,
    Android, and context-engineering skills are on-demand agent knowledge.
  - Added `docs/reference/agent/platform-skill-routing.md`.
  - Updated brief, reference index, roadmap, README, rebuild plan, and agent roles so skill routing
    stays hidden, just-in-time, and outside the app runtime.
- [x] Vendored repo-local platform skill copies under `docs/reference/agent/platform-skills/`:
  - Android ecosystem
  - Apple ecosystem
  - native accessibility engineering
  - native app design engineering
  - Expo
  - context prompt engineering
  - Vercel React Native
  - Vercel composition patterns
- [x] Added platform skill MCP surface specification:
  - New reference: `docs/reference/agent/platform-skill-mcp-surface.md`.
  - Platform skills may be exposed through MCP as read-only resources, scoped prompts, and
    deterministic lookup tools.
  - Skill context remains separate from app runtime-control tools and must not enter
    `packages/core` or the running mobile app.
- [x] Refactored the scheduled automation loop prompt for the full Expo Agent UI lifecycle:
  - Stable prompt: `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md`.
  - Preserves the legacy automation memory path
    `C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md`.
  - Uses current workspace verification commands and avoids old parser scheduling instructions.
- [x] Added a repo-local systematic debugging adapter:
  - New skill entrypoint: `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md`.
  - Integrated into platform skill routing, MCP skill surface, reference index, prompt rotation,
    roadmap, and runtime prompt status.
  - Uses the original global skill principles from
    `C:\Users\Asus\.codex\skills\systematic-debugging\`.

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
- [x] Scheduled automation and systematic debugging workflow docs now target Expo Agent UI instead
  of the old VS Code extension/parser project.
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
- [ ] Multi-session native visual editor remains future Stage 9+ work after bridge sessions,
  adapter capability flags, redaction, and local flow capture exist.

## Next Agent Must Start With

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `docs/agents/TASK.md`.
5. Read `docs/reference/react-native/accessibility-semantics.md`.
6. Read `docs/reference/design/swiftui-layout-dna.md`.
7. Read `docs/reference/expo/eas-native-preview.md` before making native adapter preview or visual
   editor claims.
8. Read `docs/reference/agent/platform-skill-routing.md` before making scaffold, platform-skill,
   native polish, accessibility, or visual editor routing claims.
9. Read `docs/reference/agent/platform-skill-mcp-surface.md` before making MCP resource, prompt, or
   skill-context tool claims.
10. Read `docs/reference/agent/platform-skills/INDEX.md` before loading a vendored platform skill.
11. Read `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` before fixing bugs,
    failed verification, runner environment failures, bridge/MCP failures, or flaky async behavior.
12. Verify the current dirty worktree before editing; preserve unrelated research files and
   workspace metadata.

## Suggested Next Target

- Implement the Stage 2 component primitive slice in `packages/core/src`.
