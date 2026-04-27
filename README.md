# Expo Agent UI

Expo Agent UI is a rebuild of this repository into a lightweight Expo + React Native package
for semantically rich, SwiftUI-inspired, agent-controllable mobile apps.

The old SwiftUI static parser and VS Code preview extension are no longer the active product.
Their implementation and old reference tree have been removed from active context. Reusable design
ideas were compressed into the current `docs/reference/design`, `docs/reference/motion`, and
`docs/reference/native` references.

## North Star

Turn any Expo React Native app into a semantically rich, SwiftUI-inspired, agent-controllable
mobile environment through:

- React Native-first component primitives,
- a live semantic runtime,
- local structured agent tools,
- a local MCP server,
- and a reusable agent skill.

## Current Status

This repository is in rebuild mode.

- Stage 0 repo/context reset is complete enough to proceed.
- Stage 1 package foundation is scaffolded.
- Stage 2 component primitives are the active next task.
- Runtime semantics, bridge tools, MCP behavior, motion presets, Expo UI adapters, and the agent
  skill are planned but not implemented yet.

## Workspace Packages

```text
packages/
  core/          JS-only core package shell
  expo-plugin/   optional Expo config plugin shell
  mcp-server/    local MCP server package shell
  cli/           command-line package shell
  example-app/   Expo example app shell
```

## Non-Goals

- This is not a new mobile framework.
- This is not a SwiftUI clone.
- This is not a Swift parser.
- This is not a VS Code WebView previewer.
- This does not replace Expo, React Native, Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- This is not a screenshot-first or coordinate-first automation system.

## Start Here

For current architecture and execution rules, read these files in order:

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
3. [`docs/reference/INDEX.md`](docs/reference/INDEX.md)
4. [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md)
5. [`docs/agents/PHASE_STATE.md`](docs/agents/PHASE_STATE.md)
6. [`docs/agents/TASK.md`](docs/agents/TASK.md)

## Development

```bash
npm install
npm run typecheck --workspaces --if-present
npm run build --workspaces --if-present
npm test --workspaces --if-present
```

The package shells currently compile, but most scripts are placeholders until the relevant product
stage implements real behavior.

## Planning References

- [`docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`](docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md)
- [`docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`](docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md)
- [`docs/reference/expo/package-foundation.md`](docs/reference/expo/package-foundation.md)
- [`docs/reference/react-native/accessibility-semantics.md`](docs/reference/react-native/accessibility-semantics.md)
- [`docs/reference/agent/mcp-transport-architecture.md`](docs/reference/agent/mcp-transport-architecture.md)
