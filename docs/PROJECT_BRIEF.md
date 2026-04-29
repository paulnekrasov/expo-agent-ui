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
- a reusable agent skill,
- an on-demand platform skill router,
- and a hidden context-engineering backend that guides agent planning, memory, validation, and
  handoff behavior.

## What This Is

- A drop-in library for Expo apps.
- A SwiftUI-inspired declarative UI vocabulary for React Native.
- A semantic UI layer that lets agents reason by stable IDs, roles, labels, state, actions,
  intent, and screen context.
- A local tool bridge that lets agents inspect and control a running app through structured
  commands.
- An MCP server for compatible agent hosts, including runtime-control tools and read-only
  platform-skill resources/prompts.
- A future development-only visual editor that can compare multiple connected native runtime
  sessions by semantics and redacted evidence.
- An agent skill that teaches agents how to use the primitives, semantic IDs, tools, and flow
  runner correctly.
- A hidden skill-routing layer that loads Expo, React Native, composition, accessibility, native
  design, Apple, Android, and context-engineering knowledge only when the active task needs it.
- A private context-engineering layer for agents: project brief, reference routing, active task
  state, validation rules, review notes, handoffs, and prompt resources.

## What This Is Not

- Not a new mobile framework.
- Not a SwiftUI clone.
- Not a Swift parser.
- Not a VS Code WebView previewer.
- Not a replacement for Expo, React Native, Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- Not a paid remote MCP service.
- Not a screenshot-first or coordinate-first automation system.
- Not a full IDE.
- Not a user-visible mobile UI surface. The context-engineering layer is hidden agent backend
  behavior, not app content or app settings.
- Not a mobile runtime bundle of platform skill markdown, prompt libraries, or agent instructions.

## Core Architecture

```text
Expo app
  |
  v
AgentUIProvider
  |
  +-- React Native-first primitives
  +-- optional Expo UI SwiftUI adapter
  +-- future optional Jetpack Compose adapter
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
  +-- read-only platform skill resources/prompts
  |
  v
Agent skill + hidden context backend
  |
  +-- project brief and reference router
  +-- on-demand platform skill router
  +-- active task and phase state
  +-- validation and review rules
  +-- handoff and prompt resources
```

The context backend is an agent-facing control plane. It may be exposed to local agent hosts as
resources, prompts, validation rules, or task state, but it must not render inside the mobile app
or become visible to app end users.

The platform skill router is part of that hidden control plane. It can select Expo, React Native,
composition, native accessibility, native design, Apple, Android, or context-engineering references
for the agent, but those skills do not become runtime dependencies or product UI.

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

The server may also expose repo-local platform skills as read-only resources, scoped prompts, and
small deterministic lookup tools. These are skill-context capabilities, not app runtime-control
capabilities, and they must not require a connected app session.

### Stage 6 - Motion Layer

Wrap Reanimated primitives in SwiftUI-inspired presets. Honor reduced motion. Prefer transform
and opacity. Emit coarse semantic motion events only when useful.

### Stage 7 - Expo UI Adapter

Add optional `@expo/ui/swift-ui` adapters behind explicit imports. Core primitives must remain
usable without `@expo/ui`.

Android Jetpack Compose through `@expo/ui/jetpack-compose` is a separate optional adapter path.
It must not be treated as SwiftUI parity or required for core v0.

### Stage 8 - Agent Skill

Create `skills/expo-agent-ui` with a lean `SKILL.md`, references, examples, and validation
scripts. The skill must include on-demand routing for platform-specific scaffolds, accessibility
audits, native polish, Expo implementation details, React Native performance, composition patterns,
and context-engineered notes without loading every skill for every task.

### Stage 9 - Flow Runner, Patch Proposals, And Native Preview Comparison

Define repeatable semantic flows and structured patch proposals. Do not implement automatic
source patching until the proposal schema is stable.

Side-by-side native preview belongs here or later. It should compare multiple connected runtime
sessions, such as one iOS SwiftUI session and one Android Compose session, through semantic IDs,
capabilities, diagnostics, and optional redacted screenshots. It must not imply that one simulator
can render another platform's native UI.

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
- Native adapters are platform-bound: SwiftUI renders on Apple runtimes, while Jetpack Compose
  renders on Android runtimes.
- EAS Build can produce iOS SwiftUI artifacts on Expo macOS cloud infrastructure, but an
  interactive iOS preview still needs an iOS Simulator, iOS device, remote Mac session, or cloud
  workflow capture.
- A future visual editor should support side-by-side native comparison by connecting two runtime
  sessions, not by trying to run iOS SwiftUI and Android Compose inside one simulator.
- External platform skills are agent-side knowledge resources. They must be loaded just-in-time,
  summarized into bounded notes or implementation decisions, and kept out of the app runtime unless
  a stage-specific implementation explicitly calls for a package dependency.
- Platform skills may become MCP-facing read-only resources, prompts, and lookup tools in
  `packages/mcp-server`. They must not be imported by `packages/core` or bundled into the running
  mobile app.
- Systematic debugging is agent-side workflow knowledge. Use it for bugs, failed verification,
  runner-environment failures, bridge/MCP failures, and flaky async behavior, but do not bundle the
  skill into app runtime code.
