# AGENTS.md

Shared startup guide for Codex, Claude, Gemini, and any other agent working in this repository.

The old SwiftUI static parser project is no longer the active direction. The active project is
Expo Agent UI: a lightweight Expo + React Native package, optional Expo config plugin, local
agent tool bridge, MCP server, and reusable agent skill.

`docs/PROJECT_BRIEF.md` is the detailed project brief and current architectural rulebook.
`docs/CLAUDE.md` is kept only as a historical compatibility shim that points to the same brief.

## Start Here

1. Read `docs/PROJECT_BRIEF.md` before touching code or making assumptions.
2. Read `docs/reference/INDEX.md` to find the correct reference file for the work.
3. Read `docs/agents/ORCHESTRATION.md` for the workflow protocol and file roles.
4. Read `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and
   `docs/agents/ROADMAP_CHECKLIST.md` before choosing work.
5. If `docs/agents/TASK.md` exists and is populated, treat it as the active bounded task.
6. Open only the reference files required for the active product stage.
7. If research is incomplete, use the prompt library under
   `docs/agents/research-prompts/expo-agent-ui/`.

## Fast Entrypoints

- Rebuild plan: `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`
- Research status: `docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`
- Expo package foundation: `docs/reference/expo/package-foundation.md`
- Expo UI SwiftUI adapter: `docs/reference/expo/expo-ui-swift-ui.md`
- Expo UI Jetpack Compose adapter: `docs/reference/expo/expo-ui-jetpack-compose.md`
- EAS native preview and adapter comparison: `docs/reference/expo/eas-native-preview.md`
- Reanimated motion layer: `docs/reference/motion/reanimated-4.md`
- React Native semantic accessibility: `docs/reference/react-native/accessibility-semantics.md`
- MCP and runtime transport: `docs/reference/agent/mcp-transport-architecture.md`
- Agent security and privacy: `docs/reference/agent/security-privacy.md`
- Platform skill routing: `docs/reference/agent/platform-skill-routing.md`
- Repo-local platform skills: `docs/reference/agent/platform-skills/INDEX.md`
- Platform skill MCP surface: `docs/reference/agent/platform-skill-mcp-surface.md`
- Maestro semantic flow adapter: `docs/reference/agent/maestro-semantic-flow-adapter.md`
- Systematic debugging adapter: `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md`
- Scheduled automation loop prompt: `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md`
- Deep debugging autonomous loop prompt: `docs/agents/DEEP_DEBUGGING_AUTONOMOUS_AGENT_LOOP_PROMPT.md`
- Navigation adapters: `docs/reference/react-native/navigation-adapters.md`
- Testing and devtools: `docs/reference/react-native/testing-and-devtools.md`
- SwiftUI-inspired layout DNA: `docs/reference/design/swiftui-layout-dna.md`
- iOS-inspired tokens: `docs/reference/design/ios-tokens.md`
- Control chrome guidance: `docs/reference/design/control-chrome.md`

## Active Product Stages

| Stage | Scope |
|---|---|
| Stage 0 - Repo Reset | Replace old parser context with Expo Agent UI context |
| Stage 1 - Package Foundation | npm workspaces, package boundaries, example app shell |
| Stage 2 - Component Primitives | React Native-first SwiftUI-inspired JSX primitives |
| Stage 3 - Semantic Runtime | semantic registry, tree inspection, action metadata |
| Stage 4 - Agent Tool Bridge | local app bridge, sessions, tool dispatch, event log |
| Stage 5 - MCP Server | stdio MCP server, tools, resources, prompts |
| Stage 6 - Motion Layer | Reanimated presets, transitions, gestures, reduced motion |
| Stage 7 - Expo UI Adapter | explicit SwiftUI and Jetpack Compose `@expo/ui` adapters, fallbacks, and platform build lanes |
| Stage 8 - Agent Skill | `skills/expo-agent-ui` skill, references, examples |
| Stage 9 - Flow Runner, Patch Proposals, And Native Preview Comparison | repeatable flows, structured patch plans, and multi-session native preview comparison |
| Stage 10 - Publish Readiness | README, compatibility, install docs, release path |

## Non-Negotiables

- Do not continue the old tree-sitter Swift parser as active product work.
- Do not build a new mobile framework or SwiftUI clone.
- Do not replace Expo, React Native, Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- Do not make screenshots or coordinates the primary agent-control model.
- Keep the core v0 runtime JS-only unless research proves a native bridge is required.
- Keep `@expo/ui` optional behind adapter boundaries.
- Do not defer Android Jetpack Compose below SwiftUI; Stage 7 builds both platform-native adapter
  lanes behind explicit adapter imports.
- Treat native adapters as platform-bound. EAS can build iOS SwiftUI artifacts on cloud Macs, but
  live iOS preview still needs an iOS runtime; Android Compose preview needs an Android runtime.
- Do not promise one simulator can render both iOS SwiftUI and Android Jetpack Compose. Future
  side-by-side native preview must connect multiple runtime sessions.
- Treat platform skills as on-demand agent knowledge, not runtime dependencies or automatic scope
  expansion. Prefer the repo-local copies under `docs/reference/agent/platform-skills/`.
- Skill-context MCP resources/tools must be read-only and separate from app runtime-control tools.
- Maestro is an optional external execution adapter, not a core runtime dependency. Keep Agent UI
  semantic flows as the source of truth and generated Maestro YAML as an export artifact.
- Do not depend on Revyl or any paid cloud device farm. Borrow natural-language flow generation,
  visual replay, YAML sync, reusable modules, and self-healing ideas only as local-first Agent UI
  features.
- Gate agent control behind development-only safety checks.
- Redact sensitive semantic values before they leave the app runtime.
- Use stable semantic IDs for actionable nodes.
- Use React Native accessibility semantics as the base, not a conflicting parallel model.
- Expose only tools backed by implemented runtime capabilities.
- Keep product stages clean. Package foundation does not implement UI primitives; primitives do
  not implement MCP; MCP does not invent app runtime behavior.
- Use Windows-safe path handling in tooling.
- Do not add dependencies casually. Every dependency must be justified by the relevant reference.
- For bugs, security findings, failed verification, runner failures, bridge/MCP failures, and flaky
  async behavior, use the repo-local systematic debugging adapter and record TTD/TDD red-green
  evidence before claiming the fix: failing test/probe/command first, same check passing after.
- Do not recreate old parser, tree-sitter, WASM, VS Code extension, or Canvas renderer assets
  unless the user explicitly asks for historical archive work.

## Git Workflow

Repository: `https://github.com/paulnekrasov/swiftui-parser`

The historical default branch is `master`. Do not commit directly to `master`.

Use the `codex/` branch prefix for rebuild work unless the developer requests otherwise.
The current rebuild branch is expected to be `codex/expo-agent-ui-rebuild`.

Recommended commit message format:

```text
Stage 0 (Reset): rewrite project context for Expo Agent UI
Stage 0 (Cleanup): remove retired parser and VS Code extension assets
Stage 1 (Package): add npm workspace scaffold
Stage 3 (Semantic Runtime): add semantic node registry
```

## Execution Memory

- `docs/PROJECT_BRIEF.md` is the durable product brief.
- `docs/reference/INDEX.md` is the router into the reference library.
- `docs/agents/ROADMAP_CHECKLIST.md` is the execution roadmap.
- `docs/agents/PHASE_STATE.md` is the live project state.
- `docs/agents/HANDOFF.md` is the last agent-to-agent note.
- `docs/agents/TASK.md` is the current bounded task.
- `docs/agents/REVIEW_CHECKLIST.md` is the stage-scoped review checklist.
- `docs/agents/REVIEW.md` is the living review log.
- `docs/reference/agent/platform-skill-routing.md` is the durable router for optional platform,
  accessibility, design, Expo, React Native, composition, and context-engineering skills.
- `docs/reference/agent/platform-skills/INDEX.md` is the repo-local catalog of vendored skill
  copies available to agents.
- `docs/reference/agent/platform-skill-mcp-surface.md` defines how those skills can be exposed as
  MCP resources, prompts, and read-only lookup tools.

## Current Rule

Research can continue in parallel, but implementation proceeds from the current bounded task.
If a research report has `DONE_WITH_CONCERNS`, preserve the concerns as implementation gates
rather than blocking unrelated earlier stages.
