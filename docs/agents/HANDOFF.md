# HANDOFF NOTE
From: workflow maintainer
To: component primitives implementer
Session date: 2026-04-30

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
- Added follow-up product DNA for native preview:
  - EAS can build iOS SwiftUI artifacts on cloud macOS infrastructure.
  - EAS cloud build is not the same as a live local iOS Simulator.
  - Side-by-side iOS SwiftUI and Android Compose preview should be modeled as two connected
    runtime sessions in a future visual editor.
  - New reference: `docs/reference/expo/eas-native-preview.md`.
  - New research prompt: `docs/agents/research-prompts/expo-agent-ui/MEDIUM-04-eas-native-preview-workflows.md`.
- Added platform skill routing DNA:
  - New reference: `docs/reference/agent/platform-skill-routing.md`.
  - Agent UI may route to Expo, React Native, composition, native accessibility, native app design,
    Apple, Android, and context-engineering skills only when the task needs them.
  - Skill knowledge stays hidden in agent workflow notes, references, validation plans, or code
    decisions, not visible app UI or runtime dependencies.
- Vendored repo-local platform skill copies under `docs/reference/agent/platform-skills/`, with an
  index at `docs/reference/agent/platform-skills/INDEX.md`, so future agents can load these skills
  from the repository instead of relying on host-global skill paths.
- Added the MCP-facing platform skill specification at
  `docs/reference/agent/platform-skill-mcp-surface.md`:
  - expose skill context as read-only resources, scoped prompts, and deterministic lookup tools,
  - keep runtime-control tools separate from skill-context tools,
  - keep skill markdown out of `packages/core` and the mobile runtime.
- Refactored `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md` so scheduled runs now cover the
  full Expo Agent UI lifecycle instead of old SwiftUI Preview / VS Code extension work.
- Added the repo-local systematic debugging adapter at
  `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md`.
- Wired systematic debugging into the platform skill index, skill router, MCP skill surface,
  reference index, prompt rotation protocol, runtime prompt status, roadmap, and `AGENTS.md`.

## What I Found

- The old implementation surfaces were still present even though active docs had already pivoted.
- The useful parts of the old docs were design principles, not implementation contracts.
- Old role prompts were a real drift risk because they still routed agents to parser, resolver,
  layout, renderer, and VS Code work.
- Remote old branches still exist on `origin`; I did not delete remote branches because that is a
  shared-repository operation that should be explicitly requested.
- The scheduled automation path intentionally keeps the legacy misspelling
  `swiftui-automous-agent-loop` because that is the active automation memory location.
- `rg.exe` can be unavailable in this app environment even when npm verification works. The
  scheduled prompt now treats that as a fallback-search limitation instead of a source blocker by
  itself.

## Verification Completed

- This workflow maintenance pass:
  - `git diff --check`
  - `npm run typecheck --workspaces --if-present`
  - Read-back verification of changed workflow docs.
- Earlier cleanup/package verification in this handoff history:
  - `npm run typecheck --workspaces --if-present`
  - `npm run build --workspaces --if-present`
  - `npm test --workspaces --if-present`

Build output folders under `packages/*/dist` were removed after the earlier build verification.

## What The Next Agent Must Do First

1. Read `docs/PROJECT_BRIEF.md`.
2. Read `docs/reference/INDEX.md`.
3. Read `docs/reference/react-native/accessibility-semantics.md`.
4. Read `docs/reference/design/swiftui-layout-dna.md`.
5. Read `docs/reference/design/ios-tokens.md`.
6. Read `docs/agents/TASK.md`.
7. Check `git status --short --branch`.
8. Use `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` before fixing any bug,
   failed command, blocked verification, runner environment issue, bridge/MCP failure, or flaky
   async behavior.

## What The Next Agent Must Not Do

- Do not recreate old SwiftUI parser, resolver, tree-sitter, WASM, VS Code extension, or Canvas
  renderer assets.
- Do not implement Stage 3 semantic registry behavior inside the Stage 2 primitive task.
- Do not make `@expo/ui`, Expo Router, React Navigation, MCP SDK, or native modules mandatory in
  `packages/core`.
- Do not expose MCP tools before the runtime exists.
- Do not promise that one simulator/emulator can render both iOS SwiftUI and Android Compose.
- Do not describe EAS cloud builds as a persistent interactive iOS simulator; separate artifact
  build, runtime hosting, and cloud workflow capture.
- Do not copy external platform skills wholesale into runtime code or visible product UI. Route to
  them on demand and summarize only task-relevant decisions.
- Do not treat `docs/reference/agent/platform-skills/` as package source. It is a docs/reference
  snapshot for agents.
- Do not implement mutating skill tools such as `applySkill`, `installSkill`, or `runSkill` in v0.
  Skill MCP tools are lookup/selection helpers only.
- Do not replace the legacy scheduled automation memory path with the corrected spelling unless the
  automation id/path itself is intentionally migrated.

## Confidence Level

- Cleanup completeness for active context: 90%
- Stage 2 readiness: 85%
- Scheduled automation prompt readiness: 90%
- Systematic debugging integration: 90%
- Need for remote branch cleanup: 60%, pending explicit user decision
- Dependency audit readiness: 60% because npm still reports moderate findings from the dependency
  graph
