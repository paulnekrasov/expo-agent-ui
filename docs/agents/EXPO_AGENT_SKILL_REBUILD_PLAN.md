# Proposed Rebuild Plan: Expo SwiftUI Agent Environment

Status: proposal only
Date: 2026-04-24
Source directive: user research summary, X + web, April 2026
Old repo identity: SwiftUI static parser and VS Code preview
New repo identity: Expo drop-in component, semantic runtime, local agent tools, and agent skill

## April 26, 2026 Expo UI Capability Update

Expo UI's SwiftUI surface now supports custom SwiftUI views and custom modifiers through
`@expo/ui/swift-ui` extension points. This is a major improvement for the optional iOS-native
adapter path, but it does not change the project's scope.

Planning impact:

- Keep Expo Agent UI as a lightweight Expo + React Native package, local agent tool bridge, MCP
  server, and reusable agent skill.
- Keep the core runtime React Native-first, JavaScript-only for v0, and usable without `@expo/ui`.
- Keep Reanimated for cross-platform motion, gestures, layout transitions, and Android/web
  fallbacks.
- Adapt seamlessly when the host app already uses real native SwiftUI through `@expo/ui/swift-ui`,
  including app-owned custom SwiftUI views and modifiers.
- Use real native SwiftUI on iOS for Agent UI-owned adapter features when it materially improves
  fidelity, platform controls, custom native modifiers, or native presentation behavior.
- Treat native SwiftUI as an adapter/rendering capability, not as the source of truth for agent
  semantics. The JavaScript semantic registry remains authoritative.
- Do not turn the project into a SwiftUI clone, native UI framework, or mandatory native-module
  package.

Concrete Stage 7 implication: the optional SwiftUI adapter must preserve and wrap user-owned
custom SwiftUI views/modifiers instead of forcing a rewrite. Agent UI may also expose its own
native custom components and modifiers such as `agentHighlight`, native focus/debug overlays, or
app-specific control styles. Each Agent UI-owned native addition still needs a clear use case,
fallback behavior, development-build compatibility notes, and semantic wrapper tests.

## Goal

Rebuild this repository into a lightweight Expo and React Native package that gives agents a
SwiftUI-inspired declarative component layer, a semantic UI runtime, structured local control
tools, and a reusable agent skill.

The new project must sit on top of Expo. It must not replace Expo, React Native, Reanimated,
Expo Router, `@expo/ui`, or the Expo MCP ecosystem.

## Non-goals

- Do not continue the old tree-sitter Swift parser project.
- Do not keep the VS Code Swift preview extension as an active product surface.
- Do not build a new mobile framework.
- Do not build a SwiftUI clone.
- Do not require a Mac-only simulator automation flow for the core semantic layer.
- Do not require a paid remote MCP service.
- Do not replace Expo MCP. Interoperate with it where useful.
- Do not make screenshots or coordinates the primary control API.

## New One-Sentence North Star

Turn any Expo React Native app into a semantically rich, SwiftUI-inspired, agent-controllable
mobile environment through a drop-in library, optional config plugin, local MCP-style tools,
and an agent skill.

## Line-by-Line Analysis Of The New Motif

### "A lightweight, drop-in Expo plugin / agent skill"

This changes the product shape from a single VS Code extension into a package plus agent
experience. The implementation should be an npm package first, with:

- a runtime library consumed by Expo apps,
- an Expo config plugin only for native setup that is actually required,
- a local tool server for agents,
- a skill directory that teaches agents how to use the library correctly.

The phrase "drop-in" means adoption friction must be extremely low. The first install path
should look like:

```sh
npx expo install @agent-ui/expo
```

Then, for apps that need agent tools:

```sh
npx agent-ui init
npx agent-ui dev
```

The config plugin should be optional unless native changes are required. Expo official docs
emphasize config plugins as native project automation during prebuild, not a general runtime
extension mechanism.

### "Turns any React Native + Expo app into..."

The package must work with ordinary React Native components and Expo apps, not only with apps
written entirely in the new primitives. The semantic registry therefore cannot depend on a
single root renderer. It needs providers and wrappers that can be introduced gradually:

- `AgentUIProvider` at app root
- semantic wrappers around existing components
- SwiftUI-inspired primitives for new screens
- adapters for `@expo/ui/swift-ui` where available
- optional Expo Router integration

"Any" must be treated as a product ambition, not a first release guarantee. The actual v0
should support Expo SDK 55+, React Native New Architecture-compatible apps, Expo Router apps,
and plain React Navigation apps through documented adapters.

### "Semantically rich"

This is the real pivot. The old project tried to statically extract meaning from Swift source.
The new project should generate meaning at authoring and runtime time. Semantic metadata must
be a first-class type system:

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
};
```

This metadata must be machine-readable, stable, and queryable without a screenshot.

### "SwiftUI-inspired"

This does not mean "execute Swift" or "parse SwiftUI source." It means importing SwiftUI's
useful mental model into React Native:

- `VStack`, `HStack`, `ZStack`
- predictable modifier composition
- environment values
- semantic colors
- declarative navigation concepts
- native-feeling layout defaults
- animation APIs that feel like SwiftUI springs and transitions

The old SwiftUI parser references should not be used as implementation contracts anymore.
They can survive as design DNA for layout, modifier ordering, semantic colors, and animation
feel.

The April 2026 Expo UI SwiftUI extension points strengthen this layer on iOS: Agent UI can use
actual native SwiftUI components and modifiers behind the optional adapter where they are a better
fit than React Native or Reanimated approximations. The public product language should still say
"SwiftUI-inspired" because the package must remain cross-platform and Expo-first.

### "Fully agent-controllable mobile environment"

This requires a runtime bridge, not only components. Agents need stable commands:

- inspect the current semantic tree
- find nodes by id, role, label, intent, or screen
- tap a semantic node
- input text into a semantic node
- scroll a semantic container
- navigate by route or screen id
- read state snapshots
- run named flows
- collect logs and diagnostics
- propose or apply patches

The plugin must expose both:

- in-app runtime APIs for semantic registration and dispatch,
- out-of-app tools for agents to call from Codex, Claude Code, Cursor, or similar hosts.

### "Sits cleanly on top of Expo"

This is an architectural constraint. The package should compose with Expo's current model:

- Expo config plugin for native permissions or dev-menu hooks only when required.
- Expo Modules API only if JS-only implementation cannot meet runtime needs.
- Expo Router support through adapters, not hard dependency.
- EAS and Expo MCP compatibility, not replacement.

Official Expo docs describe config plugins as automated native project configuration during
prebuild and recommend idempotent plugin changes. That means the default runtime should avoid
native file mutation unless it buys a concrete capability.

### "Works with both managed and bare workflows"

Managed compatibility means no mandatory manual edits to `ios/` or `android/`. Bare compatibility
means the package must not assume CNG-only regeneration. The package should:

- support CNG and prebuild,
- expose a standard `app.plugin.js`,
- document manual native setup only for optional advanced capabilities,
- keep native dependencies minimal,
- use `expo install` compatible peer ranges.

Expo's Adopt Prebuild guide also matters: React Native CLI projects can adopt Expo modules by
installing `expo` and using prebuild, but React Native versions must match an Expo SDK.

### "Does not replace Expo, React Native, Reanimated, or @expo/ui"

This is the strongest anti-framework guardrail. The package should provide:

- SwiftUI-inspired component syntax over React Native and Expo primitives,
- motion primitives over Reanimated,
- native view adapters over `@expo/ui/swift-ui`,
- semantic metadata and agent control APIs around all of the above.

It should not create its own navigation stack, animation engine, or native component framework
unless the underlying ecosystem lacks a required capability.

### "It is an agent skill that any AI agent can load"

This means the project must ship instruction artifacts, not only code:

- `skills/expo-agent-ui/SKILL.md`
- references for component primitives, semantic IDs, actions, flow testing, patching rules
- examples of good screen generation
- validation scripts or templates
- optional command prompts and local agent definitions

The skill must use progressive disclosure. The main `SKILL.md` should be lean; detailed API
tables and examples should live under `skills/expo-agent-ui/references/`.

### "Generate real screens using SwiftUI-inspired declarative primitives"

Agents need a constrained component vocabulary that produces real React Native screens. The
first release should include:

- containers: `VStack`, `HStack`, `ZStack`, `Scroll`, `List`, `Section`, `Spacer`
- content: `Text`, `Image`, `Icon`, `Label`
- controls: `Button`, `TextField`, `SecureField`, `Toggle`, `Slider`, `Picker`, `Stepper`
- navigation helpers: `Screen`, `Toolbar`, `TabItem`, `NavigationLink`
- surfaces: `Form`, `Card`, `Sheet`, `Alert`, `Menu`

The implementation should output normal React Native JSX and, on iOS where appropriate,
delegate to `@expo/ui/swift-ui` components inside `Host`.

### "Understand and reason about the live UI with semantic meaning"

The old project generated a static IR. The new project needs a live semantic tree. The tree
must reflect:

- current screen and route
- visible nodes
- enabled or disabled state
- values in controls
- possible actions
- pending/loading/busy state
- validation errors
- accessibility labels and roles
- semantic intent

This tree should be inspected through code, devtools, and local agent tools.

### "Interact with the running app through structured, reliable tools"

The tool surface should be strict, typed, and non-coordinate-first:

```ts
tap({ id: "checkout.confirmOrder" })
input({ id: "checkout.cardNumber", value: "4242 4242 4242 4242" })
scroll({ id: "checkout.items", direction: "down" })
navigate({ screen: "CheckoutScreen" })
getState({ id: "checkout.confirmOrder" })
inspectTree({ screen: "CheckoutScreen" })
runFlow({ name: "checkout.happyPath" })
```

Coordinates should exist only as a fallback or interop path with Expo MCP/simulator tools.

### "Observe state, trigger animations, run flows, propose patches, and iterate"

This requires an event log and flow runner:

- semantic state snapshot
- mutation events
- action results
- animation start/end events
- validation output
- patch suggestions mapped to files

"Propose patches" should initially mean generating a structured patch plan, not silently
rewriting app code. Applying patches can come later with agent-specific permissions.

### "SwiftUI-Inspired Component Layer"

This is the design DNA, not the whole product. It must be thin, typed, and idiomatic React.
The old `ViewNode` IR can inspire naming, but the new API must be JSX-first.

Example:

```tsx
<Screen id="checkout" title="Checkout">
  <VStack spacing={12} padding="screen">
    <Text variant="title2">Review Order</Text>
    <Button id="checkout.confirmOrder" intent="submit_order">
      Confirm Order
    </Button>
  </VStack>
</Screen>
```

### "High-Fidelity Motion Layer"

Use Reanimated 4. Expo SDK latest currently bundles Reanimated 4.2.1 and installs
`react-native-worklets` alongside it. Reanimated docs define shared values as the driving
factor of animations and expose layout transitions, `withSpring`, `withTiming`, and
gesture support.

The new package should provide SwiftUI-named presets:

- `motion.spring()`
- `motion.snappy()`
- `motion.bouncy()`
- `motion.easeInOut()`
- `transition.opacity`
- `transition.slide`
- `layoutTransition.smooth`

These map to Reanimated APIs. They must honor reduced motion.

### "Semantic UI Layer (The Real Innovation)"

This deserves its own runtime package. Components must register themselves automatically
with the semantic registry and keep metadata up to date.

The registry must be independent of screenshots and must be queryable from JS. It should
also align with React Native accessibility properties:

- `accessibilityRole`
- `accessibilityLabel`
- `accessibilityState`
- `accessibilityValue`
- `accessibilityActions`
- `testID`

React Native docs define these as the native accessibility bridge; the plugin should not
invent a parallel world that ignores them. It should enrich them.

### "Agent Interaction Layer (MCP-style Skill)"

This should likely be a local stdio MCP server plus a direct JS client:

- `packages/mcp-server` for actual MCP tools
- `packages/runtime` for in-app semantic bridge
- `packages/cli` for launching and diagnostics
- `skills/expo-agent-ui` for the agent instruction layer

MCP itself provides tools, prompts, and resources through JSON-RPC 2.0. The local server
should expose tools only for capabilities implemented by the runtime.

### "Context Engineering Layer"

This is part of the product, but it is not user-facing UI. Treat it as the hidden intelligence
backend of the plugin: the private agent-control plane that lets agents plan, build, inspect,
debug, validate, hand off, and safely evolve an Expo Agent UI app.

The old pipeline stages are obsolete, but the context-engineering method is core product DNA. It
should survive as structured agent backend state:

- project brief and non-goals
- reference router and stage-specific references
- bounded task specs
- phase/product-stage state
- handoff notes and review logs
- validation rules and review checklists
- prompt resources and prompt rotation protocol
- research status and implementation gates
- flow specs and patch proposal policies

Visibility boundary:

- App end users must not see this layer.
- The mobile app should not render this layer as settings, debug panels, or visible copy.
- Agents and local developer tooling may read it through skill files, local docs, MCP resources,
  prompts, or CLI diagnostics.
- Anything exported through MCP must be intentionally scoped, redacted, and useful for agent work.

The context backend should power:

- what references an agent loads,
- what stage the project is in,
- which task is active,
- which files are in scope,
- which capabilities are implemented,
- what validation must pass before work is considered done,
- how agents propose patches without unsafe automatic mutation,
- how future agents resume work without relying on chat history.

The new system should rename "pipeline stages" to product slices:

1. Package foundation
2. Component primitives
3. Semantic runtime
4. Agent bridge and MCP tools
5. Motion and gestures
6. Expo UI/native adapters
7. Skill and examples
8. Validation and publishing

### "What I'm NOT Building"

These non-goals must be promoted into the new `docs/PROJECT_BRIEF.md` and `AGENTS.md`.
The most important consequence is that old parser code cannot be preserved by default.
It is not a hidden asset for this new target; it is a different product.

## Current Repo Audit

### Keep As-Is Initially

These are valuable as workflow infrastructure:

- `AGENTS.md`: keep the startup discipline, but rewrite the content for the new project.
- `docs/agents/ORCHESTRATION.md`: keep the bounded-task loop and file roles.
- `docs/agents/FILE_TEMPLATES.md`: keep with renamed fields.
- `docs/agents/PROMPT_ROTATION_PROTOCOL.md`: keep the stable/runtime prompt distinction.
- `docs/agents/REVIEW_CHECKLIST.md`: keep the review structure, replace stage checks.
- `.agents/agents/stage-orchestrator.md`: keep concept, rewrite for new stages.
- `.agents/agents/phase-reviewer.md`: keep concept, rewrite for new stage checks.
- `.agents/agents/issue-fixer.md`: keep concept.
- `.agents/agents/research-librarian.md`: keep concept.
- `docs/agents/HANDOFF.md`, `PHASE_STATE.md`, `TASK.md`, `REVIEW.md`: keep file names,
  reset contents once execution starts.

### Keep But Rewrite Heavily

These contain useful knowledge but are tied to the old product:

- `docs/CLAUDE.md`: replace with a new project brief. Preserve only meta-rules:
  stage boundaries, Windows-safe paths, no unverified completion, no unrelated drift.
- `docs/reference/INDEX.md`: rebuild as the router for Expo, RN, semantic runtime, MCP,
  Reanimated, Expo UI, accessibility, testing, packaging, and skills.
- `docs/agents/ROADMAP_CHECKLIST.md`: replace with a new execution roadmap.
- `README.md`: replace old archive narrative with new package identity.
- `package.json`: replace VS Code extension metadata with npm workspace/package metadata.
- `tsconfig.json`: keep strict TypeScript posture.
- `tests/build/*`: keep the idea of build/environment diagnostics, not the VS Code-specific tests.
- `scripts/build-diagnostics.js`: preserve the principle if still useful, rewrite for package build.

### Mine For Reusable Concepts, Then Delete Or Archive

These are old implementation assets, not active code for the new product:

- `src/parser/**`
- `src/resolver/**`
- `src/extension/**`
- `src/webview/**`
- `tree-sitter-swift/`
- `tree-sitter-swift.wasm`
- parser fixtures under `tests/fixtures/parser`
- parser tests under `tests/parser`
- old resolver tests under `tests/resolver`
- `docs/reference/layer-1-grammar/**`
- `docs/reference/layer-2-parser-api/**`
- most of `docs/reference/layer-3-viewbuilder/**`
- Swift syntax references under `docs/reference/swift-syntax/**`

Before deletion, extract the useful patterns into new docs:

- modifier order matters
- unknown/fallback nodes must not crash
- IR/schema-driven thinking
- staged extraction/resolution/testing discipline
- layout and color reference discipline

### Keep Select SwiftUI Design References

The following old references can be repurposed as "design DNA" for the component layer:

- `docs/reference/layer-4-layout/core-containers.md`
- `docs/reference/layer-4-layout/scrollview.md`
- `docs/reference/layer-4-layout/navigation-tabview.md`
- `docs/reference/layer-5-hig/touch-typography-colors.md`
- `docs/reference/layer-5-hig/navigation-toolbars-lists.md`
- `docs/reference/layer-5-hig/control-visual-specs.md`
- `docs/reference/layer-9-animations/navigation-transitions.md`
- `docs/reference/layer-9-animations/swiftui-transitions.md`
- `docs/reference/renderer/sf-symbols-rendering.md`

These should move into new reference names:

- `docs/reference/design/swiftui-layout-dna.md`
- `docs/reference/design/ios-tokens.md`
- `docs/reference/design/control-chrome.md`
- `docs/reference/motion/swiftui-motion-mapping.md`
- `docs/reference/native/symbols-and-icons.md`

They must be labeled inspiration/reference, not parser obligations.

## Proposed New Repository Structure

```text
.
|- AGENTS.md
|- README.md
|- package.json
|- tsconfig.base.json
|- docs/
|  |- PROJECT_BRIEF.md
|  |- reference/
|  |  |- INDEX.md
|  |  |- expo/
|  |  |  |- config-plugins.md
|  |  |  |- modules-api.md
|  |  |  |- expo-ui-swift-ui.md
|  |  |  `- expo-mcp-interop.md
|  |  |- react-native/
|  |  |  |- accessibility-semantics.md
|  |  |  |- testing-and-devtools.md
|  |  |  `- navigation-adapters.md
|  |  |- design/
|  |  |  |- swiftui-layout-dna.md
|  |  |  |- ios-tokens.md
|  |  |  `- primitive-api.md
|  |  |- motion/
|  |  |  |- reanimated-4.md
|  |  |  `- swiftui-motion-mapping.md
|  |  |- agent/
|  |  |  |- semantic-tree-contract.md
|  |  |  |- tool-contract.md
|  |  |  |- flow-runner.md
|  |  |  `- patch-proposal-contract.md
|  |  `- packaging/
|  |     |- npm-workspaces.md
|  |     |- release.md
|  |     `- compatibility.md
|  `- agents/
|     |- ORCHESTRATION.md
|     |- PHASE_STATE.md
|     |- TASK.md
|     |- HANDOFF.md
|     |- REVIEW.md
|     |- REVIEW_CHECKLIST.md
|     `- ROADMAP_CHECKLIST.md
|- packages/
|  |- core/
|  |  |- src/
|  |  |  |- components/
|  |  |  |- modifiers/
|  |  |  |- motion/
|  |  |  |- semantics/
|  |  |  |- navigation/
|  |  |  `- index.ts
|  |  `- package.json
|  |- expo-plugin/
|  |  |- src/
|  |  |  |- index.ts
|  |  |  |- withAndroid.ts
|  |  |  `- withIos.ts
|  |  |- app.plugin.js
|  |  `- package.json
|  |- mcp-server/
|  |  |- src/
|  |  |  |- server.ts
|  |  |  |- tools/
|  |  |  |- resources/
|  |  |  `- schemas.ts
|  |  `- package.json
|  |- cli/
|  |  |- src/
|  |  |  |- init.ts
|  |  |  |- dev.ts
|  |  |  `- doctor.ts
|  |  `- package.json
|  `- example-app/
|     |- app/
|     |- app.json
|     `- package.json
|- skills/
|  `- expo-agent-ui/
|     |- SKILL.md
|     |- references/
|     |  |- components.md
|     |  |- semantics.md
|     |  |- tools.md
|     |  `- patching.md
|     |- examples/
|     |  |- settings-screen.tsx
|     |  |- checkout-flow.tsx
|     |  `- agent-flow.json
|     `- scripts/
|        `- validate-semantic-ids.js
`- tests/
   |- core/
   |- mcp-server/
   |- expo-plugin/
   `- integration/
```

## New Product Stages

### Stage 0 - Reset And Preserve

Objective: safely convert the repo from old SwiftUI parser to new Expo agent UI project.

Actions:

- Create a branch such as `codex/rebuild-expo-agent-ui`.
- Preserve dirty automation edits unless explicitly superseded.
- Add this proposal as durable planning context.
- Create an `archive/old-swiftui-parser-notes/` only if the user wants old docs preserved in repo.
- Otherwise delete obsolete parser source and generated artifacts in a dedicated cleanup commit.
- Rewrite `AGENTS.md`, `docs/PROJECT_BRIEF.md`, and `docs/reference/INDEX.md`.

Acceptance criteria:

- Old active Stage 3 task is no longer treated as live.
- New roadmap and phase state point to Stage 1 package foundation.
- No source implementation is migrated accidentally.

### Stage 1 - Package Foundation

Objective: establish a TypeScript npm workspace for the library, plugin, CLI, MCP server, and example app.

Files:

- root `package.json`
- `tsconfig.base.json`
- `packages/core/package.json`
- `packages/expo-plugin/package.json`
- `packages/mcp-server/package.json`
- `packages/cli/package.json`
- `packages/example-app/package.json`

Implementation:

- Use npm workspaces unless there is a strong reason to switch.
- Keep TypeScript strict.
- Use build tooling compatible with Expo module packages.
- Add a minimal example app using current Expo SDK.
- Add `npx expo install` compatible peer dependency ranges.

Verification:

- `npm install`
- `npm run typecheck`
- `npm run test`
- `npm run build`

### Stage 2 - Component Primitives

Objective: implement SwiftUI-inspired JSX primitives over React Native and Expo UI.

Core components:

- `AgentUIProvider`
- `Screen`
- `VStack`
- `HStack`
- `ZStack`
- `Spacer`
- `Text`
- `Button`
- `TextField`
- `Toggle`
- `Slider`
- `List`
- `Section`
- `Form`
- `Image`
- `Icon`

Rules:

- Components must be real React Native components.
- Components must accept `id`, `intent`, and semantic props where applicable.
- Components must emit accessibility props by default.
- Components must not require `@expo/ui/swift-ui`; it is an adapter path, not a hard dependency for every primitive.
- iOS `@expo/ui/swift-ui` usage must go through `Host` where required by Expo UI docs.

Verification:

- Unit tests for prop mapping.
- React Native Testing Library tests for rendered roles/labels.
- Example app screen renders.

### Stage 3 - Semantic Runtime

Objective: build the live semantic registry and tree inspector.

Core APIs:

```ts
registerNode(node: SemanticRegistration): Unregister;
updateNode(id: string, patch: Partial<SemanticNode>): void;
inspectTree(options?: InspectTreeOptions): SemanticTree;
getNode(id: string): SemanticNode | null;
dispatchAction(id: string, action: SemanticAction, payload?: unknown): Promise<ActionResult>;
```

Runtime requirements:

- Stable IDs are mandatory for agent-facing actions.
- Auto-generated IDs may exist for debug output but must be marked unstable.
- Missing duplicate IDs should warn in development.
- The registry must track mounted/unmounted state.
- The registry must maintain parent-child relationships.
- The registry must integrate with accessibility state.
- Unknown components can be wrapped manually with `SemanticView`.

Verification:

- Tests for mount/unmount.
- Tests for nested tree shape.
- Tests for duplicate ID warnings.
- Tests for action dispatch.
- Tests for state changes.

### Stage 4 - Agent Tool Bridge

Objective: expose structured local control tools.

Initial tools:

- `inspect_tree`
- `get_state`
- `tap`
- `input`
- `scroll`
- `navigate`
- `run_flow`
- `wait_for`
- `collect_events`

Transport options:

- local WebSocket from running app to local server,
- Metro/dev-server middleware if feasible,
- direct JS bridge for tests,
- MCP stdio server for agent hosts.

Tool principles:

- Tools use semantic IDs first.
- Tools return structured results with machine-readable error codes.
- Tools include enough context for an agent to self-correct.
- Tools do not pretend to support actions the runtime cannot perform.

Example result:

```json
{
  "ok": false,
  "code": "NODE_NOT_FOUND",
  "message": "No mounted semantic node matched checkout.confirmOrder",
  "candidates": [
    { "id": "checkout.review.confirmOrder", "label": "Confirm Order" }
  ]
}
```

### Stage 5 - MCP Server

Objective: implement a local MCP server that exposes the agent tools.

Why MCP:

- MCP standardizes tools, prompts, and resources through JSON-RPC.
- Agents already understand this shape.
- Expo's own MCP server proves that this is now a normal Expo-agent integration surface,
  but it requires a paid EAS plan and macOS simulators for iOS local capabilities.

This project's local MCP server should focus on free semantic control and structured
introspection. It can interoperate with Expo MCP screenshots and simulator automation later.

MCP tools:

- `inspectTree`
- `getState`
- `tap`
- `input`
- `scroll`
- `navigate`
- `runFlow`
- `observeEvents`

MCP resources:

- `agent-ui://semantic-tree`
- `agent-ui://screens`
- `agent-ui://flows`
- `agent-ui://diagnostics`
- `agent-ui://project-brief`
- `agent-ui://reference-index`
- `agent-ui://active-task`
- `agent-ui://validation-rules`
- `agent-ui://handoff`

MCP prompts:

- `build_screen`
- `debug_flow`
- `improve_semantics`
- `patch_screen`
- `plan_task`
- `review_stage`
- `resume_handoff`

Verification:

- MCP server starts over stdio.
- Tool schemas validate.
- Tool calls return JSON-compatible content.
- Inspector/manual MCP client can call every tool.

### Stage 6 - Motion Layer

Objective: provide SwiftUI-feeling animation helpers over Reanimated.

APIs:

```ts
motion.spring()
motion.bouncy()
motion.snappy()
motion.easeInOut({ duration })
useAgentTransition()
LayoutTransitionPreset
```

Rules:

- Use Reanimated shared values and animation helpers.
- Prefer transform and opacity.
- Provide reduced motion behavior.
- Emit semantic animation events for agents when useful.
- Avoid layout-thrashing animations.

Verification:

- Unit tests for preset mapping.
- Example app motion screen.
- Reduced motion test path.

### Stage 7 - Expo UI And Native Adapters

Objective: selectively bridge to `@expo/ui/swift-ui` and Expo native UI.

Official Expo UI docs establish:

- components import from `@expo/ui/swift-ui`,
- `Host` is required to cross from React Native/UIKit to SwiftUI,
- modifiers import from `@expo/ui/swift-ui/modifiers`,
- custom SwiftUI components can be exposed to React Native through Expo native views,
- custom SwiftUI modifiers can be registered natively and created from JavaScript modifier
  helpers,
- Expo UI is a primitives library, not an opinionated design kit,
- universal support is still staged; strong SwiftUI support is the first milestone.

Implementation:

- `@agent-ui/expo/swift-ui` adapter exports components that wrap Expo UI when installed.
- Core components remain usable without Expo UI.
- Adapter code should be tree-shakeable and optional.
- Android should degrade to React Native primitives or future Jetpack Compose adapter.
- User-owned custom SwiftUI views/modifiers are first-class interop surfaces. The adapter should
  preserve unknown custom modifier configs, allow semantic wrappers around custom native views,
  and avoid requiring users to rewrite existing Expo UI SwiftUI code.
- Agent UI-owned native custom SwiftUI views/modifiers belong behind this adapter boundary and
  require documented fallbacks.
- Agent semantic metadata is registered in JavaScript wrappers before native rendering; native
  SwiftUI accessibility modifiers mirror semantics for the OS but do not replace the registry.

Verification:

- Example iOS screen using Expo UI `Host`.
- Fallback screen without Expo UI.
- Tests guard optional dependency behavior.
- Smoke tests for any custom native SwiftUI component or modifier before it becomes public API.

### Stage 8 - Agent Skill

Objective: ship the agent-facing skill that teaches usage.

Skill structure:

```text
skills/expo-agent-ui/
|- SKILL.md
|- references/
|  |- components.md
|  |- semantics.md
|  |- tools.md
|  |- flows.md
|  `- patching.md
|- examples/
|  |- settings-screen.tsx
|  |- checkout-screen.tsx
|  `- flow.json
`- scripts/
   `- validate-semantic-ids.js
```

Skill requirements:

- frontmatter description must include specific trigger phrases,
- body must stay lean,
- detailed API tables go in references,
- examples must be complete,
- validation script must catch duplicate IDs and missing intents on actionable nodes.
- skill behavior must use the hidden context backend through progressive disclosure: load only the
  brief, task, references, validation rules, and handoff notes needed for the current job.
- context backend content is for agents and developer tooling only; it must not be generated as
  visible mobile UI or exposed to app end users.

Potential trigger phrases:

- "build an Expo screen with Agent UI"
- "make this Expo app agent-controllable"
- "inspect the semantic tree"
- "add semantic IDs to this React Native screen"
- "run an agent flow"
- "use SwiftUI-inspired primitives in Expo"

### Stage 9 - Flow Runner And Patch Proposals

Objective: support repeatable agent workflows and structured patch planning.

Flow schema:

```json
{
  "name": "checkout.happyPath",
  "steps": [
    { "action": "navigate", "screen": "CheckoutScreen" },
    { "action": "input", "id": "checkout.name", "value": "Ada Lovelace" },
    { "action": "tap", "id": "checkout.confirmOrder" },
    { "assert": "state", "id": "checkout.status", "equals": "submitted" }
  ]
}
```

Patch proposal schema:

```json
{
  "summary": "Add missing semantic IDs to checkout form controls",
  "files": [
    {
      "path": "app/checkout.tsx",
      "changes": [
        {
          "kind": "insert_prop",
          "component": "TextField",
          "reason": "Agent input tool requires stable id"
        }
      ]
    }
  ]
}
```

Do not implement automatic source patching until the proposal format is stable.

### Stage 10 - Publishing And Compatibility

Objective: prepare for real usage.

Deliverables:

- npm package metadata
- README install paths
- compatibility matrix
- example app
- local MCP configuration snippets
- skill install instructions
- troubleshooting guide

Compatibility matrix should track:

- Expo SDK version
- React Native version
- Reanimated version
- `@expo/ui` version
- iOS support level
- Android fallback behavior
- web fallback behavior

## New Knowledge Needed

### High Priority

- Current Expo SDK 55 package and peer dependency expectations.
- Current `@expo/ui/swift-ui` component and modifier API surface.
- Whether `@expo/ui/swift-ui` is safe as a peer dependency or must remain optional.
- Expo config plugin package layout for npm publishing.
- Expo Modules API requirements if a native bridge is needed.
- Reanimated 4 API details for layout transitions, gestures, reduced motion, and worklets.
- React Native accessibility semantics across iOS and Android.
- Current Expo MCP local capability model and how to avoid duplicating it badly.
- MCP TypeScript SDK current API and packaging shape.
- Best local transport from app runtime to agent server: WebSocket, Metro middleware, devtools hook, or custom Expo module.

### Medium Priority

- Expo Router route tree introspection APIs.
- React Navigation adapter strategy.
- React Native DevTools integration options.
- React Native Testing Library role/query behavior.
- Maestro/Detox/Appium interop if needed later.
- Security model for local agent tools.
- How to gate agent control behind development mode only.
- How to expose semantic tree without leaking secrets from app state.

### Lower Priority

- Jetpack Compose adapter through `@expo/ui/jetpack-compose`.
- Web/DOM adapter.
- Figma/design-system import.
- Cloud recording of flows.
- Visual screenshot comparison.

## Knowledge To Delete From Active Context

Delete or archive these active assumptions:

- Tree-sitter node name accuracy is no longer a product constraint.
- `UnknownNode` fallback in parser extraction is no longer the central fallback.
- WebView Canvas rendering is no longer the main rendering strategy.
- VS Code extension activation is no longer the primary host.
- Static SwiftUI source parsing is no longer the main approach.
- No React rule from the old repo must be deleted; the new product is React Native.
- "No shell commands" from the VS Code extension brief does not apply to a CLI/MCP package,
  though commands must remain safe and documented.

## Knowledge To Preserve

Preserve these concepts:

- Bounded task execution.
- Stage isolation.
- Durable state in files, not chat memory.
- Review before declaring done.
- Strict TypeScript.
- Schema-first IR thinking.
- Graceful degradation.
- Stable fallback behavior.
- Modifier order matters.
- iOS semantic colors and typography as design references.
- SwiftUI layout mental models for component ergonomics.
- Navigation transition taste.
- Windows-safe paths for tooling.
- Do not add dependencies casually.

## Dependency Strategy

Required or likely:

- `expo`
- `react`
- `react-native`
- `react-native-reanimated`
- `react-native-worklets`
- `zod` or another schema library for tool schemas
- `@modelcontextprotocol/sdk` for MCP server

Optional peer dependencies:

- `@expo/ui`
- `expo-router`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `@react-navigation/native`

Avoid until proven necessary:

- Native module code
- Custom renderer
- Heavy state management libraries
- Visual diff tooling
- Simulator automation as a core dependency

## Risk Register

### Risk: Semantic IDs become inconsistent

Mitigation:

- Require stable `id` for actionable nodes.
- Provide dev warnings and validation script.
- Add naming conventions: `screen.section.control`.

### Risk: The package becomes a framework

Mitigation:

- Keep primitives thin.
- Delegate navigation, animation, and native UI to existing libraries.
- Keep adapters optional.

### Risk: Agents mutate production state unsafely

Mitigation:

- Tool bridge development-only by default.
- Require explicit provider flag for agent control.
- Redact sensitive values.
- Use allowlisted actions.

### Risk: Expo UI API changes

Mitigation:

- Keep `@expo/ui` optional.
- Wrap it in an adapter layer.
- Maintain versioned reference docs.
- Preserve user-owned custom SwiftUI components/modifiers through pass-through and semantic
  wrapping rather than replacement.
- Keep Agent UI-owned custom native SwiftUI components and modifiers narrow, documented, and
  fallback-backed.
- Do not expose native custom modifiers as core API until managed and bare workflows are verified.

### Risk: MCP surface promises too much

Mitigation:

- Expose only implemented capabilities.
- Return structured "unsupported" errors.
- Separate semantic tools from simulator tools.

### Risk: Bare workflow setup diverges

Mitigation:

- Keep config plugin idempotent.
- Document manual native changes if any.
- Avoid native changes in core v0.

## Proposed First Bounded Task After Approval

# Implementation Plan: Reset Project Brief And Router

**Goal:** Replace the old SwiftUI parser execution context with the new Expo Agent UI project context.
**Non-goals:** No source code implementation, no package deletion, no dependency installation.
**Files affected:**

- `AGENTS.md`
- `docs/PROJECT_BRIEF.md`
- `docs/reference/INDEX.md`
- `docs/agents/ROADMAP_CHECKLIST.md`
- `docs/agents/PHASE_STATE.md`
- `docs/agents/TASK.md`
- `docs/agents/HANDOFF.md`
- `docs/agents/REVIEW_CHECKLIST.md`

**Verification:** read all changed docs and confirm no old Stage 3 resolver task remains active.

## Proposed Roadmap Checklist

### Phase 0 - Repo Reset

- [ ] Rewrite project brief for Expo Agent UI.
- [ ] Replace old reference router.
- [ ] Reset live agent state.
- [ ] Decide whether old parser assets are archived or deleted.
- [ ] Create cleanup task.

### Phase 1 - Package Foundation

- [ ] Convert to npm workspaces.
- [ ] Add `packages/core`.
- [ ] Add `packages/example-app`.
- [ ] Add strict TS build.
- [ ] Add baseline tests.

### Phase 2 - Component Layer

- [ ] Implement provider and registry shell.
- [ ] Implement stack primitives.
- [ ] Implement text/button/input controls.
- [ ] Implement list/form/section primitives.
- [ ] Add example settings screen.

### Phase 3 - Semantic Runtime

- [ ] Define semantic tree schema.
- [ ] Implement registration.
- [ ] Implement action dispatch.
- [ ] Implement state snapshot.
- [ ] Add semantic validation script.

### Phase 4 - Agent Tools

- [ ] Implement local bridge.
- [ ] Implement inspect/get/tap/input/scroll/navigate tools.
- [ ] Add structured error codes.
- [ ] Add event log.

### Phase 5 - MCP Server

- [ ] Add MCP package.
- [ ] Add stdio transport.
- [ ] Add tool schemas.
- [ ] Add resources and prompts.
- [ ] Test with MCP inspector/client.

### Phase 6 - Motion

- [ ] Add Reanimated preset mapping.
- [ ] Add layout transitions.
- [ ] Add gesture helpers.
- [ ] Add reduced motion support.

### Phase 7 - Expo UI Adapter

- [ ] Add optional `@expo/ui/swift-ui` adapter.
- [ ] Wrap `Host`.
- [ ] Map modifiers.
- [ ] Add fallback behavior.

### Phase 8 - Skill

- [ ] Create `skills/expo-agent-ui/SKILL.md`.
- [ ] Add references.
- [ ] Add examples.
- [ ] Add validation script.
- [ ] Test trigger phrases manually.

### Phase 9 - Publish Readiness

- [ ] Add README.
- [ ] Add compatibility matrix.
- [ ] Add install docs.
- [ ] Add troubleshooting.
- [ ] Add release script.

## Source References Checked During Planning

- Expo config plugin docs: https://docs.expo.dev/config-plugins/development-for-libraries/
- Expo UI SwiftUI guide: https://docs.expo.dev/guides/expo-ui-swift-ui/
- Expo UI SwiftUI API index: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/
- Expo Skills docs: https://docs.expo.dev/skills/
- Expo MCP docs: https://docs.expo.dev/eas/ai/mcp/
- Expo Modules API overview: https://docs.expo.dev/modules/overview/
- Expo Modules API reference: https://docs.expo.dev/modules/module-api/
- Expo Adopt Prebuild docs: https://docs.expo.dev/guides/adopting-prebuild/
- Expo Reanimated SDK docs: https://docs.expo.dev/versions/latest/sdk/reanimated/
- Reanimated 4 docs: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation/
- Reanimated layout transitions: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/
- React Native accessibility docs: https://reactnative.dev/docs/0.84/accessibility
- MCP specification: https://modelcontextprotocol.io/specification/draft
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
