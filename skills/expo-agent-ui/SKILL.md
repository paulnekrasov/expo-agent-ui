---
name: expo-agent-ui
description: >
  Build Expo React Native screens with SwiftUI-inspired declarative primitives that are
  automatically agent-controllable through stable semantic IDs. Use when the user asks to
  "build an Expo screen with Agent UI", "make this Expo app agent-controllable", "add semantic
  IDs to this React Native screen", "inspect the semantic tree", "run an agent flow", "use
  SwiftUI-inspired primitives in Expo", "use Agent UI components", "set up Agent UI MCP", or
  "connect an agent to an Expo app". Covers component primitives, semantic registration, MCP
  tools, flow running, patch proposals, platform skill routing, and native adapter guidance.
---

# Expo Agent UI — Agent Skill

A lightweight Expo + React Native package that turns apps into semantically rich,
SwiftUI-inspired, agent-controllable mobile environments.

## Non-Negotiables

- Do NOT build a custom navigation stack. Use Expo Router or React Navigation.
- Do NOT make `@expo/ui` a hard dependency. It is an optional adapter behind explicit imports.
- Do NOT use screenshots or coordinates as the primary control model. Use semantic IDs.
- Do NOT expose agent control in production builds (`__DEV__` must be true).
- Do NOT load all platform skills at once. Route on demand via `recommendPlatformSkills`.
- Do NOT regenerate old SwiftUI parser, tree-sitter, WASM, or VS Code extension code.

## Quickstart: Make an Expo App Agent-Controllable

### 1. Install

```sh
npx expo install @expo-agent-ui/core react-native-reanimated react-native-worklets
npx @expo-agent-ui/cli init
```

### 2. Wrap Your App

```tsx
// app/_layout.tsx or App.tsx
import { AgentUIProvider } from "@expo-agent-ui/core";

export default function App() {
  return (
    <AgentUIProvider agentEnabled={__DEV__}>
      {/* your screens here */}
    </AgentUIProvider>
  );
}
```

### 3. Give Actionable Nodes Stable IDs

Every component the agent should interact with needs a stable `id` prop:

```tsx
import { Screen, VStack, Text, Button, TextField } from "@expo-agent-ui/core";

<Screen id="checkout" title="Checkout">
  <VStack spacing={16} padding="screen">
    <Text variant="title2">Review Order</Text>
    <TextField
      id="checkout.name"
      label="Name"
      placeholder="Full name"
    />
    <TextField
      id="checkout.cardNumber"
      label="Card Number"
      keyboardType="numeric"
    />
    <Button id="checkout.confirmOrder" intent="submit_order">
      Confirm Order
    </Button>
  </VStack>
</Screen>
```

**Semantic ID convention:** `screen.section.control` — stable, hierarchical, lowercase, no spaces.

### 4. Start the MCP Server

```sh
npx @expo-agent-ui/mcp-server
# Outputs a pairing token — use this in your app's bridge config
```

### 5. Configure Your Agent Host

```json
// .mcp.json (Claude Code / Codex)
{
  "mcpServers": {
    "agent-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["@expo-agent-ui/mcp-server"]
    }
  }
}
```

## Available MCP Tools

Runtime-control tools (require an active, paired app session):

| Tool | Description |
|---|---|
| `inspectTree` | Dump the full semantic tree of the connected app |
| `getState` | Read state of a specific node by stable id |
| `tap` | Press a semantic node by stable id |
| `input` | Type text into a semantic input field by id |
| `scroll` | Scroll a container by id with direction/amount |
| `navigate` | Navigate to a screen or route |
| `runFlow` | Execute a sequence of semantic flow steps |
| `waitFor` | Wait for node conditions (exists, visible, state, absent) |
| `observeEvents` | Read the bridge event log with cursor-based pagination |

Skill-context tools (no app session required):

| Tool | Description |
|---|---|
| `listPlatformSkills` | List all available platform skill resources |
| `getPlatformSkill` | Read a full platform skill's SKILL.md |
| `searchPlatformSkills` | Search skills by keyword query |
| `recommendPlatformSkills` | Recommend skills for a given task |

See `references/tools.md` for full input/output schemas.

## Semantic ID Rules

1. **Stable** — IDs must not change between renders. Use string literals, not computed values.
2. **Unique** — No two mounted nodes may share the same id within a screen.
3. **Hierarchical** — Use dot-separated segments: `screen.section.control`
4. **Actionable nodes REQUIRED** — Buttons, text fields, toggles, sliders, pickers, steppers.
5. **Container nodes RECOMMENDED** — Screens, sections, forms, lists.
6. **Intent metadata RECOMMENDED** — `intent="submit_order"`, `intent="navigate_next"`.

Run the validation script to catch issues:
```sh
node skills/expo-agent-ui/scripts/validate-semantic-ids.js app/
```

## Platform Skill Routing

When building platform-specific features, Scorb or debugging native adapters, route to the
right skill on demand instead of loading all at once. Use `recommendPlatformSkills` with a task
description to get relevance-ranked results.

| Skill | When to load |
|---|---|
| `expo-skill` | Expo config, EAS, Router, dev clients, OTA updates |
| `vercel-react-native-skills` | Lists, images, animations, performance, monorepo |
| `vercel-composition-patterns` | Component APIs, compound components, providers |
| `native-accessibility-engineering` | VoiceOver, TalkBack, semantic accessibility audits |
| `native-app-design-engineering` | Motion, haptics, transitions, platform UI feel |
| `android-ecosystem-skill` | Compose adapter, Gradle, Material 3, Play release |
| `apple-ecosystem-app-building` | SwiftUI adapter, Xcode, iOS performance, App Store |
| `systematic-debugging` | Root-cause debugging, TTD/TDD red-green evidence |
| `context-prompt-engineering` | Prompt design, agent notes, handoffs, validation plans |

Load skills via `getPlatformSkill` with the skill name as shown above.

## Component Primitives

All primitives import from `@expo-agent-ui/core`. See `references/components.md` for the full API
table with props, semantic roles, and accessibility defaults.

| Category | Components |
|---|---|
| Provider | `AgentUIProvider` |
| Containers | `Screen`, `VStack`, `HStack`, `ZStack`, `Spacer`, `Scroll`, `List`, `Section`, `Form` |
| Content | `Text`, `Image`, `Icon`, `Label` |
| Controls | `Button`, `TextField`, `SecureField`, `Toggle`, `Slider`, `Picker`, `Stepper` |
| Native adapters | `@expo-agent-ui/core/swift-ui`, `@expo-agent-ui/core/jetpack-compose` (optional, explicit imports) |

## Flow and Patch Proposals

See `references/flows.md` for the semantic flow schema, step types, wait conditions, and
Maestro YAML export mapping. See `references/patching.md` for the patch proposal format and
change kinds. Flows use semantic IDs, not coordinates. Patch proposals are structured change
plans — they do not auto-apply without human approval.

For optional Maestro YAML export: Agent UI semantic flows are the source of truth. The
`runFlow` MCP tool executes flows locally through the bridge. Maestro YAML is an export
artifact generated from semantic flows for external E2E execution via Maestro CLI/MCP. See
`references/flows.md` for the YAML generation contract, Maestro integration best practices,
self-healing selector patterns, and generated YAML examples.

## Verification

Before declaring work done:
1. Run `npx @expo-agent-ui/cli doctor` — checks peer dependencies, babel config, semantic ID validity.
2. Confirm all actionable nodes have stable semantic IDs.
3. Confirm `__DEV__` gating for agent control.
4. Run the app's test suite with `npm test`.
5. Run `inspectTree` via MCP and verify all expected nodes appear.

## References (Load on Demand)

| Reference | When to load |
|---|---|
| `references/components.md` | Building screens; need full prop tables for every primitive |
| `references/semantics.md` | Designing semantic IDs; understanding the semantic node schema |
| `references/tools.md` | Calling MCP tools; need full input/output schemas and error codes |
| `references/flows.md` | Writing semantic flows; understanding step types and assertions |
| `references/patching.md` | Proposing source patches; understanding the patch schema |
