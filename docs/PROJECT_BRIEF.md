# Project Brief: Expo Agent UI

Last updated: 2026-04-27
Status: active rebuild direction

## Project Identity

Expo Agent UI is a lightweight Expo + React Native package that turns apps into semantically
rich, SwiftUI-inspired, agent-controllable mobile environments.

It is not a continuation of the old SwiftUI static parser. The old parser work remains useful
as context-engineering history and some design inspiration, but it is not the active product.

## North Star

Turn any Expo React Native app into a semantically rich, SwiftUI-inspired, agent-controllable
mobile environment through:

- React Native-first component primitives,
- a live semantic runtime,
- local structured agent tools,
- a local MCP server,
- and a reusable agent skill.

## What This Is

- A drop-in library for Expo apps.
- A SwiftUI-inspired declarative UI vocabulary for React Native.
- A semantic UI layer that lets agents reason by stable IDs, roles, labels, state, actions,
  intent, and screen context.
- A local tool bridge that lets agents inspect and control a running app through structured
  commands.
- An MCP server for compatible agent hosts.
- An agent skill that teaches agents how to use the primitives, semantic IDs, tools, and flow
  runner correctly.

## What This Is Not

- Not a new mobile framework.
- Not a SwiftUI clone.
- Not a Swift parser.
- Not a VS Code WebView previewer.
- Not a replacement for Expo, React Native, Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- Not a paid remote MCP service.
- Not a screenshot-first or coordinate-first automation system.
- Not a full IDE.

## Core Architecture

```text
Expo app
  |
  v
AgentUIProvider
  |
  +-- React Native-first primitives
  +-- optional Expo UI SwiftUI adapter
  +-- Reanimated motion helpers
  |
  v
Semantic runtime
  |
  +-- semantic tree
  +-- action registry
  +-- state snapshots
  +-- redacted event log
  |
  v
Local bridge
  |
  +-- development-only WebSocket session
  +-- pairing token
  +-- capability checks
  |
  v
MCP stdio server
  |
  +-- inspectTree
  +-- getState
  +-- tap
  +-- input
  +-- waitFor
  +-- observeEvents
```

## Product Stages

### Stage 0 - Repo Reset

Replace old SwiftUI parser context with Expo Agent UI context. The dedicated cleanup pass has now
removed the retired parser, VS Code extension, tree-sitter, WASM, Canvas renderer, and old
layer-reference assets from active context.

### Stage 1 - Package Foundation

Create npm workspace structure and package boundaries:

- `packages/core`
- `packages/expo-plugin`
- `packages/mcp-server`
- `packages/cli`
- `packages/example-app`

The current research recommendation is Expo SDK 55, React Native 0.83, React 19.2, Reanimated
4, Worklets 0.8, and MCP SDK 1.x. Treat exact versions as implementation-time verified facts.

### Stage 2 - Component Primitives

Build React Native-first JSX primitives:

- `AgentUIProvider`
- `Screen`
- `VStack`, `HStack`, `ZStack`
- `Spacer`, `Scroll`, `List`, `Section`, `Form`
- `Text`, `Image`, `Icon`, `Label`
- `Button`, `TextField`, `SecureField`, `Toggle`, `Slider`, `Picker`, `Stepper`

Primitives must emit accessibility props and semantic metadata.

### Stage 3 - Semantic Runtime

Build the live semantic registry and tree inspector. Actionable nodes require stable IDs,
labels, actions, state, and privacy metadata.

### Stage 4 - Agent Tool Bridge

Build a development-only bridge between app runtime and local agent tools. The bridge must be
fail-closed, token-paired, loopback-first, capability-scoped, and redacted before serialization.

### Stage 5 - MCP Server

Expose implemented runtime capabilities through a local stdio MCP server. Do not expose tools
that the runtime cannot fulfill.

### Stage 6 - Motion Layer

Wrap Reanimated primitives in SwiftUI-inspired presets. Honor reduced motion. Prefer transform
and opacity. Emit coarse semantic motion events only when useful.

### Stage 7 - Expo UI Adapter

Add optional `@expo/ui/swift-ui` adapters behind explicit imports. Core primitives must remain
usable without `@expo/ui`.

### Stage 8 - Agent Skill

Create `skills/expo-agent-ui` with a lean `SKILL.md`, references, examples, and validation
scripts.

### Stage 9 - Flow Runner And Patch Proposals

Define repeatable semantic flows and structured patch proposals. Do not implement automatic
source patching until the proposal schema is stable.

### Stage 10 - Publish Readiness

Add README, compatibility matrix, install docs, troubleshooting, and release automation.

## Semantic Node Contract

The runtime should converge on this shape:

```ts
type SemanticNode = {
  id: string;
  type: SemanticRole;
  label?: string;
  screen?: string;
  state: SemanticState;
  actions: SemanticAction[];
  intent?: string;
  value?: unknown;
  children: SemanticNode[];
  bounds?: Rect;
  props?: Record<string, unknown>;
  privacy?: SemanticPrivacy;
};
```

Implementation must refine this through tests and reference docs before locking public API.

## Security Baseline

- Agent control is disabled outside development by default.
- Standalone/release builds fail closed.
- Local bridge binds to loopback by default.
- LAN mode requires explicit opt-in and warning.
- Every bridge session requires a short-lived pairing token.
- Semantic values are redacted before MCP responses and logs.
- Tool authorization is deterministic and outside model judgment.
- App text, labels, logs, route params, and server errors are untrusted data.

## Research Status

The research prompt set has produced high-, medium-, and low-priority reports under
`docs/reference/**`. The coordinator report is:

`docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`

Research marked `DONE_WITH_CONCERNS` is usable for planning but must preserve concerns as
implementation gates.

## Active Constraints

- Core v0 should stay JS-only.
- `@expo/ui` stays optional.
- Expo Router and React Navigation are adapters, not hard dependencies.
- Reanimated and Worklets are peer expectations for the motion layer.
- MCP server runs outside the app in Node.
- Screenshots and simulator automation are optional interop, not the primary model.
