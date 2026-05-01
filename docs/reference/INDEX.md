# Reference Index - Expo Agent UI

Read this file at the start of every coding or research session. It is the router into the
current reference library for the Expo Agent UI rebuild.

The old SwiftUI parser, tree-sitter, VS Code WebView, and Canvas renderer reference trees have
been removed from active context. Use this index as the complete router for current work.

## Session-Start Protocol

1. Read `docs/PROJECT_BRIEF.md`.
2. Read this file.
3. Read `docs/agents/ORCHESTRATION.md`.
4. Read `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and
   `docs/agents/ROADMAP_CHECKLIST.md`.
5. Read `docs/agents/TASK.md` if it is populated.
6. Open only the reference docs required by the active stage.

## Current High-Signal References

| Work Area | Open First |
|---|---|
| Overall rebuild plan | `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` |
| Deep debugging autonomous loop | `docs/agents/DEEP_DEBUGGING_AUTONOMOUS_AGENT_LOOP_PROMPT.md` |
| Research completion status | `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md` |
| Package foundation and Expo SDK | `expo/package-foundation.md` |
| Expo UI SwiftUI adapter | `expo/expo-ui-swift-ui.md` |
| Expo UI Jetpack Compose adapter | `expo/expo-ui-jetpack-compose.md` |
| EAS native preview and adapter comparison | `expo/eas-native-preview.md` |
| Reanimated motion layer | `motion/reanimated-4.md` |
| Semantic accessibility contract | `react-native/accessibility-semantics.md` |
| Runtime bridge and MCP transport | `agent/mcp-transport-architecture.md` |
| Security and privacy | `agent/security-privacy.md` |
| Platform skill routing | `agent/platform-skill-routing.md` |
| Repo-local platform skill library | `agent/platform-skills/INDEX.md` |
| Platform skill MCP surface | `agent/platform-skill-mcp-surface.md` |
| Maestro semantic flow adapter | `agent/maestro-semantic-flow-adapter.md` |
| Systematic debugging and blocked verification | `agent/platform-skills/systematic-debugging/SKILL.md` |
| Navigation adapters | `react-native/navigation-adapters.md` |
| Testing and devtools | `react-native/testing-and-devtools.md` |
| SwiftUI-inspired layout DNA | `design/swiftui-layout-dna.md` |
| iOS-inspired tokens | `design/ios-tokens.md` |
| Control chrome guidance | `design/control-chrome.md` |
| SwiftUI motion mapping | `motion/swiftui-motion-mapping.md` |
| Symbols and icons | `native/symbols-and-icons.md` |
| Cross-platform future adapters | `expo/cross-platform-adapters.md` |
| Figma/design-system future import | `design/figma-design-system-import.md` |
| Cloud flows and visual comparison | `agent/cloud-flows-visual-comparison.md` |

## Stage-To-Reference Map

| Product Stage | Required References |
|---|---|
| Stage 0 - Repo Reset | `docs/PROJECT_BRIEF.md`, this index, `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`, `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md` |
| Stage 1 - Package Foundation | `expo/package-foundation.md` |
| Stage 2 - Component Primitives | `react-native/accessibility-semantics.md`, `design/swiftui-layout-dna.md`, `design/ios-tokens.md`, `design/control-chrome.md`, `native/symbols-and-icons.md`, `expo/expo-ui-swift-ui.md` for optional adapter boundaries |
| Stage 3 - Semantic Runtime | `react-native/accessibility-semantics.md`, `agent/security-privacy.md` |
| Stage 4 - Agent Tool Bridge | `agent/mcp-transport-architecture.md`, `agent/security-privacy.md`, `react-native/navigation-adapters.md` when navigation tools are in scope |
| Stage 5 - MCP Server | `agent/mcp-transport-architecture.md`, `agent/platform-skill-mcp-surface.md`, `agent/security-privacy.md`, `agent/maestro-semantic-flow-adapter.md` when external Maestro MCP interop is in scope |
| Stage 6 - Motion Layer | `motion/reanimated-4.md`, `motion/swiftui-motion-mapping.md` |
| Stage 7 - Expo UI Adapter | `expo/expo-ui-swift-ui.md`, `expo/expo-ui-jetpack-compose.md`, `expo/cross-platform-adapters.md`, `expo/eas-native-preview.md` for native preview and build boundaries |
| Stage 8 - Agent Skill | `agent/platform-skill-routing.md`, `agent/platform-skill-mcp-surface.md`, `agent/platform-skills/INDEX.md`, `docs/agents/research-prompts/expo-agent-ui/README.md`, `react-native/accessibility-semantics.md`, `agent/mcp-transport-architecture.md`, `agent/maestro-semantic-flow-adapter.md` for flow-generation guidance |
| Stage 9 - Flow Runner, Patch Proposals, And Native Preview Comparison | `agent/platform-skill-routing.md`, `agent/platform-skill-mcp-surface.md`, `agent/platform-skills/INDEX.md`, `agent/mcp-transport-architecture.md`, `agent/security-privacy.md`, `react-native/testing-and-devtools.md`, `agent/cloud-flows-visual-comparison.md`, `agent/maestro-semantic-flow-adapter.md`, `expo/eas-native-preview.md` |
| Stage 10 - Publish Readiness | `agent/platform-skill-routing.md`, `agent/platform-skill-mcp-surface.md`, `agent/platform-skills/INDEX.md`, `expo/package-foundation.md`, `expo/eas-native-preview.md`, all compatibility and install decisions from research status |
| Cross-stage bug, test failure, or blocked verification | `agent/platform-skills/systematic-debugging/SKILL.md`, plus the active stage references above |

## MVP Decisions From Research

- Proceed with Expo SDK 55 as the researched baseline, but verify exact package metadata during
  implementation.
- Build core runtime JS-only.
- Use npm workspaces.
- Keep config plugin optional and defer native modules.
- Keep `@expo/ui` optional for core/root imports and isolate it behind explicit native adapter
  imports.
- Treat native adapters as platform-bound Stage 7 deliverables: SwiftUI on Apple runtimes,
  Jetpack Compose on Android runtimes, with React Native fallback as the shared baseline.
- Use React Native accessibility props as the semantic foundation.
- Map stable semantic IDs to `testID`, but do not treat `testID` alone as sufficient semantics.
- Build local stdio MCP over a development-only app WebSocket bridge.
- Bind bridge to loopback by default and require pairing tokens.
- Use MCP SDK v1.x for v0 unless implementation-time research says otherwise.
- Use Jest and React Native Testing Library for v0 semantic correctness.
- Treat Maestro as the first optional semantic-flow export/execution adapter after Agent UI's own
  flow schema is stable. Detox, Appium, Figma import, cloud flows, visual diff, and side-by-side
  native preview/editor work remain optional later adapters or post-v0 surfaces.
- EAS Build can produce iOS SwiftUI artifacts on cloud Macs, but live interactive iOS preview
  still requires an iOS runtime: simulator, device, remote Mac, or cloud workflow capture.
- For Android native adapter builds on EAS, enable Gradle cache with `EAS_GRADLE_CACHE=1` when
  the profile compiles `@expo/ui/jetpack-compose`, and verify `FROM CACHE` entries in Run Gradle
  logs on later builds.
- Treat Expo, React Native, composition, native accessibility, native design, Android, Apple, and
  context-engineering skills as on-demand agent knowledge, not package/runtime dependencies. Use the
  repo-local copies under `agent/platform-skills/` before global skill installs.

## Known Implementation Gates

- Verify Expo/Reanimated package versions before writing peer ranges.
- Verify Worklets Babel/plugin setup in managed and bare lanes.
- Define bridge pairing/session-discovery UX before implementing Stage 4.
- Implement redaction before any semantic tree leaves the app runtime.
- Do not support physical-device LAN bridge by default until the secure setup is verified.
- Do not promise native automation selector mappings until compiled fixtures confirm behavior.
- Do not promise Maestro export support until compiled fixture apps prove Agent UI `testID`
  selectors are targetable as Maestro `id` selectors on both iOS and Android. Keep Maestro CLI/MCP
  optional and outside `packages/core`.
- Do not promise that one simulator can render both iOS SwiftUI and Android Compose. Side-by-side
  native comparison requires multiple connected runtime sessions.
- Do not defer the Android Compose adapter below the SwiftUI adapter. Keep Compose alpha status,
  development-build requirements, `Host` sizing, and TalkBack/accessibility verification as Stage 7
  implementation gates.
- Do not copy whole external platform skills into the Agent UI runtime or expose them as visible app
  content. Summarize only the task-relevant decisions into hidden agent notes or docs.
- Use the repo-local systematic debugging adapter before fixing bugs, failing verification,
  runner-environment failures, bridge/MCP failures, or unexpected behavior. Record evidence before
  changing source, then follow the project TTD/TDD red-green loop: failing test/probe/command before
  the fix, same check passing after the fix.

## Cleanup Status

The retired parser/reference tree was intentionally cleaned up after the Expo Agent UI pivot.
Reusable ideas were compressed into:

- `design/swiftui-layout-dna.md`
- `design/ios-tokens.md`
- `design/control-chrome.md`
- `motion/swiftui-motion-mapping.md`
- `native/symbols-and-icons.md`

Do not recreate old parser, resolver, VS Code extension, WASM, or Canvas renderer references unless
the user explicitly asks for historical archive analysis.
