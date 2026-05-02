# Expo Agent UI

Turn any Expo React Native app into a semantically rich, SwiftUI-inspired, agent-controllable mobile environment.

## What is Expo Agent UI

Expo Agent UI is a lightweight Expo + React Native toolkit that lets AI agents reason about, inspect, and control your mobile app through a structured semantic layer. It provides React Native-first component primitives, a live semantic runtime, a local WebSocket agent bridge, a local MCP server, a reusable agent skill, a flow runner, patch proposals, motion presets, and native SwiftUI / Jetpack Compose adapter lanes.

### What this is

- A drop-in library for Expo apps using stable semantic IDs, roles, states, and actions.
- A SwiftUI-inspired declarative UI vocabulary (`VStack`, `HStack`, `ZStack`, `List`, `Form`, `Picker`, `Stepper`, etc.) for React Native.
- A semantic runtime that registers every primitive, builds a live tree, and dispatches agent actions.
- A local WebSocket bridge that lets agents inspect and control a running app during development.
- An MCP server for agent hosts (Claude Desktop, Codex, or any MCP client) with runtime-control tools, skill-context tools, and platform skill resources.
- A reusable agent skill (`skills/expo-agent-ui`) that teaches agents how to use primitives, semantic IDs, tools, and the flow runner.
- A flow runner that executes repeatable semantic flows and exports them to Maestro YAML.
- A patch proposal system that agents use to suggest structured source-code changes.
- A multi-session native preview comparison engine for side-by-side iOS SwiftUI and Android Jetpack Compose inspection.
- A platform skill routing layer that loads repo-local knowledge (Expo, React Native, native accessibility, platform design, systematic debugging) on demand.

### What this is not

- Not a new mobile framework, SwiftUI clone, or Swift parser.
- Not a replacement for Expo, React Native, Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- Not a paid remote MCP service or a wrapper around Maestro, Maestro Cloud, Revyl, Appium, Detox, or any device farm.
- Not a screenshot-first or coordinate-first automation system.
- Not a full IDE or VS Code WebView previewer.

## Architecture

```
Expo app
  |
  v
AgentUIProvider
  |
  +-- React Native-first primitives (19 components)
  +-- explicit Expo UI SwiftUI adapter
  +-- explicit Expo UI Jetpack Compose adapter
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
Local bridge (WebSocket)
  |
  +-- development-only session
  +-- pairing token
  +-- capability checks
  +-- fail-closed, loopback-first
  |
  v
MCP stdio server
  |
  +-- 10 runtime-control tools
  +-- 4 skill-context tools
  +-- 1 diagnostic tool (compareNativePreviews)
  +-- read-only platform skill resources
  +-- 6 MCP prompts
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

## Installation

### Prerequisites

| Dependency | Version |
|---|---|
| Node.js | >= 20.19.4 |
| Expo SDK | ~55.0.18 |
| React | 19.2.0 |
| React Native | 0.83.6 |
| react-native-reanimated | ^4.0.0 |
| react-native-worklets | ^0.8.0 |

### 1. Install the core package

```bash
npm install @agent-ui/core
```

### 2. Install motion peer dependencies

```bash
npx expo install react-native-reanimated react-native-worklets
```

### 3. Install the MCP server (developer machine only)

```bash
npm install -g @agent-ui/mcp-server
```

### 4. Install the CLI (developer machine only)

```bash
npm install -g @agent-ui/cli
```

### 5. Add the Expo config plugin (if using native adapters)

```bash
npm install @agent-ui/expo-plugin
```

Then add to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@agent-ui/expo-plugin"
    ]
  }
}
```

## Quick Start

### Wrap your app with AgentUIProvider

```tsx
import { AgentUIProvider } from '@agent-ui/core'
import { App } from './App'

export default function Root() {
  return (
    <AgentUIProvider
      bridge={{
        enabled: __DEV__,
        url: 'ws://localhost:9721',
        pairingToken: 'agentui_your_token_here',
        executionEnvironment: 'bare'
      }}
    >
      <App />
    </AgentUIProvider>
  )
}
```

### Add primitives to a screen

```tsx
import {
  Screen,
  VStack,
  HStack,
  Text,
  Button,
  TextField,
  Toggle,
  Slider,
  Form,
  Section
} from '@agent-ui/core'

function LoginScreen() {
  return (
    <Screen name='login' title='Login'>
      <VStack spacing={16} style={{ padding: 24 }}>
        <Text variant='title'>Welcome Back</Text>
        <Form id='login-form'>
          <Section title='Credentials' spacing={12}>
            <TextField
              id='email'
              label='Email'
              placeholder='you@example.com'
              accessibilityLabel='Email address'
            />
            <TextField
              id='password'
              label='Password'
              placeholder='Enter password'
              secureTextEntry
              accessibilityLabel='Password'
            />
          </Section>
        </Form>
        <Toggle
          id='remember-me'
          label='Remember me'
          value={false}
          onValueChange={(val) => console.log('Toggle:', val)}
        />
        <Slider
          id='volume'
          label='Volume'
          value={0.5}
          minimumValue={0}
          maximumValue={1}
        />
        <Button id='login-btn' onPress={() => console.log('Login')}>
          Sign In
        </Button>
      </VStack>
    </Screen>
  )
}
```

### Connect the MCP server

Start the MCP server on your developer machine:

```bash
npx agent-ui-mcp
```

Configure your agent host (Claude Desktop example):

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": ["@agent-ui/mcp-server"],
      "env": {
        "AGENT_UI_PAIRING_TOKEN": "agentui_your_token_here"
      }
    }
  }
}
```

## Component Primitives

`@agent-ui/core` exports 19 React Native-first components. Every component registers a semantic node with the runtime and emits accessibility properties. Components follow a 2-space indent, single-quote, no-semicolon TypeScript style. Props are typed with interfaces. Components use `React.memo`.

### Layout

#### Screen

Root view for a logical screen. Registers a `screen` semantic node.

```tsx
import { Screen } from '@agent-ui/core'

<Screen
  id='home'
  name='home'
  title='Home'
  accessibilityLabel='Home screen'
>
  {/* children */}
</Screen>
```

**Key props:** `name`, `title`, `id`, `accessibilityLabel`, `intent`, `testID`, `style`

#### VStack

Vertical stack layout (`flexDirection: 'column'`).

```tsx
import { VStack } from '@agent-ui/core'

<VStack spacing={12} alignment='start'>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>
```

**Key props:** `alignment` (`'start'` | `'center'` | `'end'` | `'stretch'`), `spacing`, `id`, `accessibilityLabel`, `intent`

#### HStack

Horizontal stack layout (`flexDirection: 'row'`).

```tsx
import { HStack } from '@agent-ui/core'

<HStack spacing={8} alignment='center'>
  <Icon name='star' />
  <Text>Favorite</Text>
</HStack>
```

**Key props:** same as `VStack`

#### ZStack

Overlay stack. Children are layered on top of each other.

```tsx
import { ZStack } from '@agent-ui/core'

<ZStack fill>
  <Image source={{ uri: 'bg.png' }} />
  <Text variant='headline'>Overlay text</Text>
</ZStack>
```

**Key props:** `fill` (fills container), plus all `StackProps`

#### Spacer

Flexible space that pushes adjacent content apart.

```tsx
import { Spacer } from '@agent-ui/core'

<VStack>
  <Text>Top</Text>
  <Spacer minLength={24} />
  <Text>Bottom</Text>
</VStack>
```

**Key props:** `minLength`, `id`, `style`

#### Scroll

Scrollable container wrapping `ScrollView`. Registers `scroll` and `observe` actions.

```tsx
import { Scroll } from '@agent-ui/core'

<Scroll id='feed-scroll' contentSpacing={12}>
  <Text>Long content...</Text>
</Scroll>
```

**Key props:** `id` (required for agent scrolling), `contentSpacing`, `accessibilityLabel`

### Collection

#### List

Semantic list container with `accessibilityRole='list'`. Registers `observe` action.

```tsx
import { List } from '@agent-ui/core'

<List id='items' spacing={8}>
  <Label>Item 1</Label>
  <Label>Item 2</Label>
</List>
```

**Key props:** `id`, `spacing`, `accessibilityLabel`

#### Section

Grouped content with header, body, and footer.

```tsx
import { Section } from '@agent-ui/core'

<Section
  id='account-section'
  title='Account'
  footer='Manage your settings'
  spacing={8}
>
  <TextField id='name' label='Name' />
</Section>
```

**Key props:** `id`, `title`, `header`, `footer`, `spacing`, `titleStyle`, `footerStyle`

#### Form

Semantic form container. Registers `observe` action.

```tsx
import { Form } from '@agent-ui/core'

<Form id='checkout-form' spacing={16}>
  <Section title='Shipping' spacing={8}>
    <TextField id='address' label='Address' />
  </Section>
  <Button id='submit-order'>Place Order</Button>
</Form>
```

**Key props:** `id`, `spacing`, `accessibilityLabel`

### Display

#### Text

Typographic primitive with variant support.

```tsx
import { Text } from '@agent-ui/core'

<Text variant='body'>Hello World</Text>
<Text variant='title'>Page Title</Text>
<Text variant='headline'>Breaking News</Text>
<Text variant='caption'>Last updated today</Text>
```

**Key props:** `variant` (`'body'` | `'title'` | `'headline'` | `'caption'`), `id`, `accessibilityLabel`, `intent`

#### Image

Renders an image with accessibility metadata.

```tsx
import { Image } from '@agent-ui/core'

<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  accessibilityLabel='Profile photo'
  decorative={false}
/>
```

**Key props:** `decorative` (whether it is purely decorative, defaults to `false`), `accessibilityLabel`, `id`, `intent`

#### Icon

Icon primitive. Decorative by default. When informative, provide an `accessibilityLabel`.

```tsx
import { Icon } from '@agent-ui/core'

<Icon name='star' size={24} color='#FFD700' decorative />
<Icon name='warning' accessibilityLabel='Warning: low battery' decorative={false} />
```

**Key props:** `name` (the icon name string), `size` (defaults to `18`), `color`, `decorative` (defaults to `true`), `accessibilityLabel`

#### Label

Row layout with optional leading icon and text children.

```tsx
import { Label } from '@agent-ui/core'

<Label icon='person' spacing={8} accessibilityLabel='John Doe'>
  John Doe
</Label>
```

**Key props:** `icon`, `iconChildren`, `iconStyle`, `spacing` (defaults to `8`), `textStyle`, `id`, `accessibilityLabel`

### Controls

Every control requires a non-empty stable `id`. Controls register action handlers for agent dispatch.

#### Button

Tappable control. Registers `activate` and `tap` actions.

```tsx
import { Button } from '@agent-ui/core'

<Button
  id='save-btn'
  disabled={false}
  busy={false}
  onPress={() => console.log('Saved')}
  accessibilityLabel='Save changes'
>
  Save
</Button>
```

**Key props:** `id` (required), `disabled`, `busy`, `onPress`, `accessibilityLabel`, `intent`, `style`, `textStyle`

#### TextField

Text input control. Registers `focus`, `input`, `clear`, `submit` actions.

```tsx
import { TextField } from '@agent-ui/core'

<TextField
  id='email'
  label='Email'
  placeholder='you@example.com'
  value={email}
  onChangeText={setEmail}
  editable
  accessibilityLabel='Email address'
/>
```

**Key props:** `id` (required), `label`, `value`, `defaultValue`, `placeholder`, `onChangeText`, `editable` (defaults to `true`), `disabled`, `busy`

#### SecureField

Password / secure text input. Identical to `TextField` but renders with `secureTextEntry`. Semantic value is redacted by default.

```tsx
import { SecureField } from '@agent-ui/core'

<SecureField
  id='password'
  label='Password'
  placeholder='Enter password'
  value={password}
  onChangeText={setPassword}
  accessibilityLabel='Password'
/>
```

**Key props:** same as `TextField`. Semantic `privacy` is set to `'redacted'`.

#### Toggle

Boolean switch control. Registers `toggle` and `activate` actions.

```tsx
import { Toggle } from '@agent-ui/core'

<Toggle
  id='notifications'
  label='Enable notifications'
  value={true}
  disabled={false}
  onValueChange={(val) => setNotifications(val)}
/>
```

**Key props:** `id` (required), `value` (boolean, required), `label`, `disabled`, `busy`, `onValueChange`

#### Slider

Range input control. Renders as an adjustable `Pressable` with track, fill, and thumb. Registers `increment`, `decrement`, and `set_value` actions.

```tsx
import { Slider } from '@agent-ui/core'

<Slider
  id='volume'
  label='Volume'
  value={0.7}
  minimumValue={0}
  maximumValue={1}
  step={0.1}
  onValueChange={(val) => setVolume(val)}
  valueFormatter={(v) => `${Math.round(v * 100)}%`}
/>
```

**Key props:** `id` (required), `value` (number, required), `minimumValue`, `maximumValue`, `step`, `label`, `disabled`, `onValueChange`, `valueFormatter`, `fillStyle`, `trackStyle`, `thumbStyle`

#### Picker

Radio group for selecting one option from a list. Registers `select` action.

```tsx
import { Picker } from '@agent-ui/core'

const options = [
  { id: 'light', label: 'Light', value: 'light' },
  { id: 'dark', label: 'Dark', value: 'dark' },
  { id: 'system', label: 'System', value: 'system' }
]

<Picker
  id='theme-picker'
  label='Theme'
  options={options}
  selectedValue='system'
  onValueChange={(value, option) => setTheme(value)}
/>
```

**Key props:** `id` (required), `options` (array of `{ id, label, value }`), `selectedValue`, `label`, `disabled`, `busy`, `onValueChange`, `spacing`, `optionStyle`, `selectedOptionStyle`

#### Stepper

Numeric increment/decrement control. Registers `increment`, `decrement`, and `set_value` actions.

```tsx
import { Stepper } from '@agent-ui/core'

<Stepper
  id='quantity'
  label='Quantity'
  value={1}
  minimumValue={0}
  maximumValue={10}
  step={1}
  onValueChange={(val) => setQuantity(val)}
/>
```

**Key props:** `id` (required), `value` (number, required), `minimumValue`, `maximumValue`, `step`, `label`, `disabled`, `incrementLabel`, `decrementLabel`, `onValueChange`, `valueFormatter`

## Semantic Runtime

The semantic runtime lives inside `AgentUIProvider`. Every component registers a `SemanticPrimitive` on mount and unregisters on unmount. The runtime builds a tree from all mounted primitives, applies screen scoping, prunes hidden subtrees, detects duplicate stable IDs, and dispatches actions.

### How registration works

1. Each component calls `useDeferredSemanticPrimitive` during render, which builds a `SemanticPrimitive` object containing `role`, `id`, `label`, `actions`, `actionHandlers`, `screen`, `state`, and `value`.
2. On mount, the `useEffect` inside the hook calls `runtime.registerPrimitive(primitive)`, which returns an unregister function.
3. On unmount, the unregister function removes the primitive from the registry.
4. The `SemanticBoundary` component propagates `mountKey` and `screen` context down the tree, establishing parent-child relationships.

### Tree inspection

The registry exposes `getSnapshot(options?)` which returns:

```ts
interface AgentUISemanticSnapshot {
  mountedNodeCount: number
  generatedNodeCount: number
  nodes: AgentUISemanticNode[]
}
```

Each node has the shape:

```ts
interface AgentUISemanticNode {
  id: string
  type: 'screen' | 'stack' | 'text' | 'button' | 'image' | 'icon' | 'label'
    | 'textInput' | 'scroll' | 'list' | 'section' | 'form' | 'toggle'
    | 'slider' | 'picker' | 'stepper'
  state: { busy?: boolean; disabled?: boolean; checked?: boolean; selected?: boolean; hidden?: boolean; expanded?: boolean }
  actions: { name: string; source: 'agent-ui' }[]
  children: AgentUISemanticNode[]
  label?: string
  intent?: string
  screen?: string
  privacy?: 'none' | 'redacted' | 'dev-only'
  value?: {
    checked?: boolean; hasValue?: boolean; max?: number; min?: number;
    now?: number; redaction?: string; selected?: string; step?: number; text?: string
  }
  generated?: boolean
}
```

### Stable IDs

Every actionable component requires a non-empty `id`. The `id` becomes the `testID` by default (overridable with the `testID` prop). Stable IDs must be unique within a screen scope. The runtime warns in development when duplicate stable IDs are detected.

### Redaction

Sensitive semantic values are redacted. `SecureField` sets `privacy: 'redacted'` on its node. Before serialization for MCP responses, redacted values are stripped. The bridge event log is inspectable but does not record raw sensitive field content.

## Motion Layer

The motion layer provides SwiftUI-inspired animation presets through a three-tier adapter architecture. Tier 1 (Reanimated 4) is the cross-platform default. Tier 2 (SwiftUI) and Tier 3 (Jetpack Compose) are native adapter lanes that activate when their respective `@expo/ui` modules are available.

### Presets

| Preset | Type | Duration | Description |
|---|---|---|---|
| `agentUISpring` | Spring | 420ms, dampingRatio 1 | Smooth default spring (critically damped) |
| `agentUIBouncy` | Spring | damping 12, stiffness 200 | Bouncy spring for delight |
| `agentUISnappy` | Spring | damping 18, stiffness 400 | Snappy spring for micro-interactions |
| `agentUIEaseInOut` | Timing | 300ms | Standard ease-in-out timing |
| `agentUIGentle` | Timing | 180ms, easeOut | Gentle enter/appear timing |
| `agentUIOpacityTransition` | Transition | 200ms, easeOut | Opacity fade transition |
| `agentUISlideTransition` | Transition | 250ms, easeInOut | Slide from edge (default `bottom`) |
| `agentUIScaleTransition` | Transition | 200ms, easeOut, fromScale 0.96 | Scale transition |
| `agentUILayoutTransitionSmooth` | Layout | 250ms | Smooth layout transition |
| `agentUIGestureConfig` | Gesture | varies | Gesture strategy config |
| `createAgentUIMotionEvent` | Event | n/a | Coarse semantic motion event factory |

### Usage

```tsx
import {
  agentUISpring,
  agentUIBouncy,
  agentUISlideTransition,
  createAgentUIMotionEvent,
  resolveAgentUIMotionAdapter,
  resolveAgentUIReducedMotion,
  effectiveAgentUIReducedMotion
} from '@agent-ui/core'

// Get the best available motion adapter for the current platform
const adapter = resolveAgentUIMotionAdapter('ios')

// Create a spring config for Reanimated withSpring
const springConfig = agentUISpring({ duration: 500 })

// Create a bouncy spring
const bouncyConfig = agentUIBouncy({ stiffness: 250 })

// Create a slide transition config
const slideConfig = agentUISlideTransition({ edge: 'left' })

// Check reduced motion
const osReduced = await resolveAgentUIReducedMotion()
const effective = effectiveAgentUIReducedMotion('system', osReduced)

// Dispatch a coarse motion event
const event = createAgentUIMotionEvent({
  type: 'animation_completed',
  targetId: 'save-btn'
})
```

### Reduced motion policy

- `'system'` — honour the OS-level reduced-motion setting (default).
- `'reduce'` — always use reduced motion.
- `'never'` — always run full animation.

The OS preference is resolved via `AccessibilityInfo.isReduceMotionEnabled()` and cached. Call `resetAgentUIReducedMotionCache()` to clear the cache in tests.

### Gesture strategies

Six gesture strategies are available: `'pressable'`, `'pan'`, `'drag'`, `'swipe'`, `'pinch'`, `'longPress'`. Use `agentUIGestureConfig(strategy, overrides)` to create a config for gesture-handler wiring.

### Adapter tiers

| Tier | Name | Platform | Availability |
|---|---|---|---|
| 1 | Reanimated 4 | Cross-platform | Always available |
| 2 | SwiftUI Motion | iOS | Requires `@expo/ui/swift-ui` |
| 3 | Jetpack Compose Motion | Android | Requires `@expo/ui/jetpack-compose` |

Resolution: `resolveAgentUIMotionAdapter(platform)` returns the highest available tier for the platform, falling back to Tier 1.

## Agent Tool Bridge

The bridge connects the app runtime to the MCP server over WebSocket. It is development-only, fail-closed, and loopback-first.

### Enabling the bridge

```tsx
<AgentUIProvider
  bridge={{
    enabled: __DEV__,
    url: 'ws://localhost:9721',
    pairingToken: 'agentui_your_secure_token',
    executionEnvironment: 'bare',
    capabilities: ['inspectTree', 'getState', 'tap', 'input', 'observeEvents', 'waitFor', 'runFlow']
  }}
>
  <App />
</AgentUIProvider>
```

### Bridge gate

The `createAgentUIBridgeGate` function enforces these gates before any WebSocket connection is opened:

1. `bridge.enabled` must be `true`.
2. `__DEV__` must be `true` (production builds fail closed).
3. `executionEnvironment` must be `'bare'` or `'storeClient'` (not `'standalone'` or `'unknown'`).
4. A non-empty `pairingToken` is required.
5. `url` must be a valid `ws://` or `wss://` URL.
6. Loopback hosts (`localhost`, `127.0.0.1`, `::1`) are auto-detected. Android emulator host `10.0.2.2` is supported.
7. Tunnel mode is unsupported in v0.
8. LAN (non-loopback) requires explicit `unsafeAllowLAN: true`.

### Pairing token

Generate a pairing token with `generateAgentUIPairingToken()`. It produces a 64-character hex string prefixed with `agentui_`. The MCP server compares the received token using constant-time equality (`timingSafeEqual`).

### Bridge capabilities

Default capabilities: `inspectTree`, `getState`, `tap`, `input`, `observeEvents`, `waitFor`, `runFlow`.

| Capability | Description |
|---|---|
| `inspectTree` | Read the current semantic tree |
| `getState` | Read the state of a specific node |
| `tap` | Dispatch a tap/press action |
| `input` | Set text in an input field |
| `observeEvents` | Query the event log |
| `waitFor` | Poll for semantic conditions |
| `runFlow` | Execute a flow of semantic steps |

### Event log

The bridge maintains an event log (capped at 1000 entries by default). Events track connection lifecycle (`bridge.session.connected`, `bridge.session.paired`, `bridge.session.disconnected`, `bridge.session.expired`), command dispatch (`bridge.command.received`, `bridge.command.completed`, `bridge.command.failed`), and bridge errors (`bridge.error`).

## MCP Server

`@agent-ui/mcp-server` exposes a local stdio MCP server with 15 tools, MCP resources, and 6 prompts. It connects to the app via the WebSocket listener on port 9721 (configurable).

### Starting the server

```bash
npx @agent-ui/mcp-server
```

Or configure in your MCP client configuration file.

### Tool reference

#### Runtime-control tools (session required)

| Tool | Input | Description |
|---|---|---|
| `inspectTree` | `screen?`, `rootId?`, `includeHidden?`, `includeBounds?`, `maxDepth?`, `sessionId?` | Inspect the semantic tree of the connected app |
| `getState` | `id` (required), `sessionId?`, `includeChildren?` | Get the semantic state of a node by stable id |
| `tap` | `id` (required), `sessionId?`, `screen?`, `action?`, `timeoutMs?` | Dispatch a tap action on a semantic node |
| `input` | `id` (required), `value` (required), `sessionId?`, `screen?`, `timeoutMs?` | Set the text value of a semantic input node |
| `observeEvents` | `sessionId?`, `since?`, `types?`, `limit?` | Retrieve bridge session events from the event log |
| `waitFor` | `conditions` (required, array), `sessionId?`, `timeoutMs?` | Wait for semantic conditions to be satisfied |
| `scroll` | `id` (required), `sessionId?`, `direction?`, `amount?`, `targetId?`, `timeoutMs?` | Scroll a semantic scroll container |
| `navigate` | `sessionId?`, `screen?`, `route?`, `params?`, `replace?`, `timeoutMs?` | Navigate to a screen or route |
| `runFlow` | `sessionId?`, `name?`, `steps?`, `stopOnFailure?`, `timeoutMs?` | Execute a sequence of semantic flow steps |
| `proposePatch` | `title`, `description`, `source`, `changes` (all required) | Propose a structured source-code patch |

#### Skill-context tools (no session required)

| Tool | Input | Description |
|---|---|---|
| `listPlatformSkills` | (none) | List available repo-local platform skills |
| `getPlatformSkill` | `name` (required) | Read a platform skill by name |
| `searchPlatformSkills` | `query` (required), `skillNames?`, `limit?`, `includeSnippets?` | Search platform skills by query terms |
| `recommendPlatformSkills` | `task` (required), `stage?`, `platforms?`, `scaffoldIntent?` | Recommend skills for a task |

#### Diagnostic tool (no session required)

| Tool | Input | Description |
|---|---|---|
| `compareNativePreviews` | `sessionId?`, `iosSessionId?`, `androidSessionId?` | Compare semantic trees across native preview sessions |

### MCP resources (read-only)

| URI | Description |
|---|---|
| `agent-ui://platform-skills/index` | Platform skills catalog |
| `agent-ui://platform-skills/routing` | Skill routing reference |
| `agent-ui://platform-skills/<name>` | Individual skill content (9 skills) |
| `agent-ui://sessions` | Active app session metadata |
| `agent-ui://diagnostics` | Listener, bridge, server diagnostics |
| `agent-ui://serve-sim/sessions` | Discovered serve-sim iOS Simulator sessions |
| `agent-ui://native-preview/comparison` | Side-by-side native preview comparison data |

### MCP prompts

| Prompt | Arguments | Description |
|---|---|---|
| `choose_platform_skills` | `task` (required), `stage?`, `platforms?` | Select platform skills for a task |
| `plan_native_scaffold` | `scaffoldIntent?`, `platform?`, `stage?` | Create a scoped native scaffold plan |
| `review_accessibility_semantics` | `platform?`, `screenOrComponent?`, `codeContext?` | Review accessibility semantics |
| `prepare_visual_editor_notes` | `sessions?`, `platforms?`, `adapterCapabilities?` | Prepare development-only editor notes |
| `write_agent_task_notes` | `task` (required), `stage?`, `selectedSkills?` | Write hidden agent task notes |
| `debug_stage_failure` | `stage` (required), `commandOrSymptom` (required), `package?`, `evidence?` | Create root-cause investigation plan |

### Configuration: Claude Desktop

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": ["@agent-ui/mcp-server"],
      "env": {
        "AGENT_UI_PAIRING_TOKEN": "agentui_your_token_here"
      }
    }
  }
}
```

### Configuration: Codex

```yaml
mcp_servers:
  agent-ui:
    command: npx
    args: ["@agent-ui/mcp-server"]
    env:
      AGENT_UI_PAIRING_TOKEN: "agentui_your_token_here"
```

## Agent Skill

The Expo Agent UI agent skill at `skills/expo-agent-ui/SKILL.md` teaches agents how to use primitives, semantic IDs, tools, and the flow runner correctly. It includes:

- Component primitive reference with every prop and semantic role.
- Semantic runtime contract: registration, tree building, screen scoping, redaction.
- Bridge and MCP tool reference: every tool, its input schema, and its output shape.
- Flow runner schema and step types.
- Patch proposal schema and validation rules.
- Motion layer presets and adapter resolution.
- Native adapter detection and fallback behavior.
- Platform skill routing rules: load only the skills needed, summarize decisions, do not bundle markdown into the app runtime.
- Validation scripts and example scaffolds.

### Loading the skill

The skill is a repo-local file. Agent hosts that support skill loading can point to `skills/expo-agent-ui/SKILL.md`. The MCP server exposes the skill's content through the platform skill resource system (`agent-ui://platform-skills/expo-skill` for Expo domain knowledge).

## Flow Runner

The flow runner executes repeatable semantic flows against the connected app. It is defined in `@agent-ui/core` and dispatched via the bridge's `runFlow` command.

### Flow schema

```ts
type SemanticFlow = {
  name: string
  steps: SemanticFlowStep[]
  stopOnFailure: boolean
  timeoutMs?: number
}

type SemanticFlowStep = {
  type: 'tap' | 'input' | 'scroll' | 'navigate' | 'waitFor' | 'assert' | 'observeEvents'
  targetId?: string
  value?: string
  conditions?: WaitCondition[]
  screen?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  amount?: number
}

type WaitCondition = {
  kind: 'nodeExists' | 'nodeVisible' | 'nodeState' | 'nodeAbsent'
  nodeId: string
  expected?: Record<string, unknown>
}
```

### Running a flow via MCP

```json
{
  "name": "runFlow",
  "arguments": {
    "name": "login-flow",
    "stopOnFailure": true,
    "timeoutMs": 30000,
    "steps": [
      { "type": "tap", "targetId": "login-btn" },
      { "type": "input", "targetId": "email", "value": "user@test.com" },
      { "type": "input", "targetId": "password", "value": "password123" },
      { "type": "tap", "targetId": "submit-btn" },
      { "type": "waitFor", "conditions": [{ "kind": "nodeExists", "nodeId": "home-screen" }] },
      { "type": "assert", "conditions": [{ "kind": "nodeVisible", "nodeId": "welcome-text" }] }
    ]
  }
}
```

### Flow runner result

```ts
type FlowRunnerResult = {
  flowName: string
  completed: boolean
  totalSteps: number
  completedSteps: number
  failedStep?: number
  failedStepType?: string
  durationMs: number
  error?: string
}
```

### Step validation

The `validateFlow()` function checks that every step has the required fields. `tap`, `input`, and `scroll` steps require `targetId`. `input` steps require `value`. `waitFor` and `assert` steps require `conditions` with valid `kind` values and `nodeId`. `navigate` steps require `screen` or `targetId`.

### Approval gates

Each step goes through `stepRequiresApproval()` before execution. Currently all steps pass through without approval. Approval gates are a Stage 9 feature for destructive operations.

## Maestro YAML Export

Agent UI semantic flows can be exported to Maestro YAML through the CLI.

### CLI commands

The `@agent-ui/cli` package provides 6 commands:

| Command | Description |
|---|---|
| `agent-ui init` | Initialize a new Agent UI project |
| `agent-ui doctor` | Check project health and configuration |
| `agent-ui validate` | Validate a semantic flow JSON file |
| `agent-ui export-maestro` | Export a semantic flow JSON to Maestro YAML |
| `agent-ui maestro-run` | Run a Maestro YAML flow via Maestro CLI |
| `agent-ui maestro-heal` | Generate self-healing proposals from Maestro run failures |

### Export a flow to Maestro YAML

```bash
agent-ui export-maestro ./flows/login-flow.json --output ./flows/login-flow.yaml
```

### Step type mapping

| Agent UI step | Maestro equivalent |
|---|---|
| `tap` | `- tapOn: id: "<targetId>"` |
| `input` | `- tapOn: id: "<targetId>"` then `- inputText: "<value>"` |
| `scroll` | `- swipe: direction: <UP/DOWN/LEFT/RIGHT>` |
| `navigate` | `- launchApp: clearState: false` |
| `waitFor` / `assert` (nodeVisible) | `- assertVisible: id: "<nodeId>"` |
| `waitFor` / `assert` (nodeAbsent) | `- assertNotVisible: id: "<nodeId>"` |
| `observeEvents` | Comment only |

### Run a Maestro flow

```bash
agent-ui maestro-run ./flows/login-flow.yaml --device emulator-5554
```

This requires the Maestro CLI to be installed. If Maestro is unavailable, the command returns `MAESTRO_UNAVAILABLE` with install instructions.

## Patch Proposals

Patch proposals let agents suggest structured source-code changes without auto-applying them. Every proposal requires explicit human review.

### Schema

```ts
type PatchChangeKind = 'add_prop' | 'remove_prop' | 'change_prop' | 'add_component' | 'remove_component'

type PatchChange = {
  kind: PatchChangeKind
  targetId: string
  propName?: string
  propValue?: unknown
  oldValue?: unknown
  reason: string
}

type PatchProposal = {
  id: string
  title: string
  description: string
  source: 'flow_failure' | 'accessibility_audit' | 'semantic_audit' | 'agent_request'
  changes: PatchChange[]
  autoApply: false       // Always false — never auto-apply
  requiresApproval: true // Always true — always require human review
  createdAt: string
}
```

### Via MCP: proposePatch tool

```json
{
  "name": "proposePatch",
  "arguments": {
    "title": "Add accessibility label to save button",
    "description": "The save button is missing an accessibility label, making it invisible to screen readers.",
    "source": "accessibility_audit",
    "changes": [
      {
        "kind": "add_prop",
        "targetId": "save-btn",
        "propName": "accessibilityLabel",
        "propValue": "Save changes",
        "reason": "Required for screen reader accessibility"
      }
    ]
  }
}
```

### Validation

The `validatePatchProposal()` function enforces: every change must have `kind`, `targetId`, and `reason`. `add_prop` and `change_prop` changes require `propName`. `autoApply` must be `false`. At least one change is required.

### Merging

`mergePatchProposals()` combines multiple proposals into one, useful when an agent generates several related patches from a single audit.

## Native Adapters

Agent UI provides two native adapter lanes: SwiftUI for iOS (Tier 2) and Jetpack Compose for Android (Tier 3). Core primitives render as React Native first, but native adapters give agents access to platform-native control surfaces when `@expo/ui` is installed in a development build.

### SwiftUI adapter (Tier 2, iOS)

**Adapter:** `agentUISwiftUIAdapter`
**Platform:** iOS
**Requires:** `@expo/ui/swift-ui`

**14 capability flags:** `button`, `toggle`, `textField`, `secureField`, `slider`, `picker`, `host`, `rnHostView`, `list`, `form`, `section`, `bottomSheet`, `popover`, `menu`

**Detection:**

```ts
import { detectAgentUISwiftUINativeModule, refreshAgentUISwiftUIAdapter } from '@agent-ui/core'

const available = detectAgentUISwiftUINativeModule() // lazy, cached

// Force re-detection
refreshAgentUISwiftUIAdapter()
```

Detection checks `Platform.OS === 'ios'` and attempts a dynamic `require('@expo/ui/swift-ui')`. Results are memoized.

**Component factories:**
- `createAgentUISwiftUIButton(nativeRenderer?)`
- `createAgentUISwiftUIToggle(nativeRenderer?)`
- `createAgentUISwiftUITextField(nativeRenderer?)`
- `createAgentUISwiftUISecureField(nativeRenderer?)`
- `createAgentUISwiftUISlider(nativeRenderer?)`
- `createAgentUISwiftUIPicker(nativeRenderer?)`

Each factory returns a `React.FC` wrapped in `React.memo`. When the native renderer is unavailable, factories render React Native fallbacks and emit a development warning. SwiftUI components require a `Host` boundary (`requiresHost: true`).

### Jetpack Compose adapter (Tier 3, Android)

**Adapter:** `agentUIComposeAdapter`
**Platform:** Android
**Requires:** `@expo/ui/jetpack-compose`

**29 capability flags:** `button`, `filledTonalButton`, `outlinedButton`, `elevatedButton`, `textButton`, `textField`, `switchControl`, `checkbox`, `radioButton`, `slider`, `column`, `row`, `box`, `surface`, `lazyColumn`, `listItem`, `card`, `chip`, `icon`, `iconButton`, `alertDialog`, `basicAlertDialog`, `modalBottomSheet`, `tooltip`, `dropdownMenu`, `contextMenu`, `searchBar`, `host`, `rnHostView`, `spacer`

**Detection:**

```ts
import { detectAgentUIComposeNativeModule, refreshAgentUIComposeAdapter } from '@agent-ui/core'

const available = detectAgentUIComposeNativeModule() // lazy, cached

// Force re-detection
refreshAgentUIComposeAdapter()
```

Detection checks `Platform.OS === 'android'` and attempts a dynamic `require('@expo/ui/jetpack-compose')`. Compose components also require a `Host` boundary (`requiresHost: true`). For Android development builds, enable `EAS_GRADLE_CACHE=1` to speed up repeated builds.

**Component factories:**
- `createAgentUIComposeButton()`
- `createAgentUIComposeTextField()`
- `createAgentUIComposeSwitch()`
- `createAgentUIComposeSlider()`

### Adapter registry

The combined registry is exported from the root `@agent-ui/core`:

```ts
import {
  agentUINativeAdapters,       // readonly array
  listAgentUINativeAdapters,   // filter by platform
  resolveAgentUINativeAdapter  // resolve by platform
} from '@agent-ui/core'

// List all adapters
const all = listAgentUINativeAdapters()

// List iOS adapters only
const ios = listAgentUINativeAdapters({ platform: 'ios' })

// Resolve the best adapter for a platform
const adapter = resolveAgentUINativeAdapter('ios') // agentUISwiftUIAdapter
```

### EAS builds for native adapters

Native adapters require development builds, not Expo Go. Use EAS Build:

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

For Android, enable Gradle cache:

```bash
EAS_GRADLE_CACHE=1 eas build --platform android --profile development
```

Verify cache hits in the Run Gradle build logs as `FROM CACHE`.

## Native Preview Comparison

The native preview comparison engine compares two connected runtime sessions (one iOS SwiftUI, one Android Jetpack Compose) across three dimensions: semantic IDs, capabilities, and diagnostics.

### Multi-session diff engine

The `compareNativePreviews` MCP tool runs the comparison. It requires two active app sessions. Each session contributes its semantic tree nodes, adapter capability flags, and session diagnostics (node count, screen count, uptime, reducibility).

### Comparison dimensions

| Dimension | What is compared |
|---|---|
| Semantic ID diffs | Each semantic node ID across both sessions: `match`, `missing_ios`, `missing_android`, `type_mismatch`, `state_diff` |
| Capability diffs | Each capability flag: does iOS have it? Does Android? Do they match? |
| Diagnostic diffs | `semanticNodeCount`, `screenCount`, `reducible` fields across sessions |

### Comparison output shape

```ts
type SideBySideComparison = {
  comparisonId: string
  createdAt: string
  iosSession: { sessionId: string; platform: 'ios' }
  androidSession: { sessionId: string; platform: 'android' }
  semanticIdDiffs: SemanticIdDiff[]
  capabilityDiffs: CapabilityDiff[]
  diagnosticDiffs: DiagnosticDiff[]
  summary: {
    totalSemanticIds: number
    matchingIds: number
    mismatchedIds: number
    totalCapabilities: number
    matchingCapabilities: number
    mismatchedCapabilities: number
    overallMatch: boolean
  }
}
```

### Development-only

The comparison tool is gated behind `__DEV__`. It does not operate in production builds. One simulator cannot render another platform's native UI — the comparison requires two separate runtime sessions.

## Platform Skills

Agent UI includes 9 repo-local platform skills under `docs/reference/agent/platform-skills/`. These are agent-side reference materials, not runtime code.

### Available skills

| Skill | Entrypoint | Description |
|---|---|---|
| Android ecosystem | `android-ecosystem-skill/SKILL.md` | Jetpack Compose, Material 3, Gradle, Play release |
| Apple ecosystem | `apple-ecosystem-app-building/SKILL.md` | SwiftUI, Xcode, UIKit, App Store release |
| Native accessibility | `native-accessibility-engineering/SKILL.md` | VoiceOver, TalkBack, Dynamic Type, semantics |
| Native app design | `native-app-design-engineering/SKILL.md` | Polish, motion, haptics, transitions |
| Expo | `expo-skill/SKILL.md` | Expo Router, config plugins, EAS, dev clients |
| Context prompt engineering | `context-prompt-engineering/SKILL.md` | Prompt resources, task notes, handoffs, validation |
| Systematic debugging | `systematic-debugging/SKILL.md` | TTD/TDD red-green debugging |
| Vercel React Native | `vercel-react-native-skills/SKILL.md` | Components, lists, performance, monorepo |
| Vercel composition patterns | `vercel-composition-patterns/SKILL.md` | Component APIs, compound components |

### Routing

The skill router at `docs/reference/agent/platform-skill-routing.md` maps tasks to skills. Load order:

1. Read the project brief, reference index, and active task state.
2. Read the skill routing reference.
3. Open only the repo-local skill that matches the task.
4. Load the narrowest referenced sub-file.
5. Summarize decisions into code, tests, docs, or patch proposals.

### MCP surface

The MCP server exposes platform skills as read-only resources (`agent-ui://platform-skills/<name>`), with 4 skill-context tools (`listPlatformSkills`, `getPlatformSkill`, `searchPlatformSkills`, `recommendPlatformSkills`) that are session-free and do not require a connected app.

## Security Model

### Development-only gates

Agent control is disabled by default. The bridge gate (`createAgentUIBridgeGate`) enforces:

1. `bridge.enabled` must be explicitly `true`.
2. `__DEV__` must be `true`. Production and standalone builds fail closed.
3. `executionEnvironment` must be `'bare'` or `'storeClient'` — not `'standalone'` or `'unknown'`.
4. A non-empty pairing token is required.
5. The bridge URL must be a valid `ws://` or `wss://` URL.
6. LAN mode requires explicit `unsafeAllowLAN: true`.

### Loopback binding default

The MCP listener binds to `127.0.0.1` by default (port 9721). Android emulator host `10.0.2.2` is treated as local. The listener accepts only WebSocket connections from the app.

### Pairing tokens

Tokens are generated with `generateAgentUIPairingToken()` (64 hex chars, `agentui_` prefix). Token comparison uses Node.js `timingSafeEqual` for constant-time equality, preventing timing side-channel attacks.

### Short-lived sessions

Bridge sessions are short-lived. The heartbeat interval is 15 seconds; 3 missed heartbeats (45 seconds) trigger session expiry and cleanup.

### Redaction

Sensitive semantic values are redacted before serialization:
- `SecureField` nodes carry `privacy: 'redacted'`.
- The bridge `redactedValue` marker replaces raw values in MCP responses.
- Route params, passwords, tokens, and any `privacy: 'redacted'` or `privacy: 'dev-only'` content is stripped.
- Event log entries do not carry raw field values.

### Tool authorization

Tool authorization is deterministic. The MCP server checks capabilities against the session's declared capability set. Actions on disabled or busy nodes return `ACTION_DISABLED`. Actions not declared in the node's action list return `ACTION_UNSUPPORTED`. Tool dispatch does not rely on model judgment.

### Constant-time token comparison

The MCP listener uses `Buffer.from(token)` and `timingSafeEqual` with zero-padded buffers to compare pairing tokens in constant time.

## Compatibility

### Peer dependency matrix

| Package | Version |
|---|---|
| `expo` | ~55.0.18 |
| `react` | 19.2.0 |
| `react-native` | 0.83.6 |
| `react-native-reanimated` | ^4.0.0 |
| `react-native-worklets` | ^0.8.0 |

### Package versions

| Package | Version |
|---|---|
| `@agent-ui/core` | 0.0.0 |
| `@agent-ui/expo-plugin` | 0.0.0 |
| `@agent-ui/mcp-server` | 0.0.0 |
| `@agent-ui/cli` | 0.0.0 |

### Node.js

Requires Node.js >= 20.19.4.

### MCP SDK

`@agent-ui/mcp-server` depends on `@modelcontextprotocol/sdk` ^1.29.0.

### Runtime environments

- **Expo Go:** The core primitives and semantic runtime work in Expo Go. Motion presets work in Expo Go (Tier 1 Reanimated). Native adapters do not work in Expo Go — they require development builds.
- **Development builds:** Full bridge, native adapters, and all MCP tools are available.
- **Standalone/production builds:** The bridge is disabled. Semantic registration is disabled (uses `noopRuntime`). Only the UI primitives render without semantic metadata.

### Platform support

| Feature | iOS | Android | Web |
|---|---|---|---|
| Core primitives (19 components) | Yes | Yes | Yes |
| Semantic runtime | Yes | Yes | Yes |
| Bridge | Yes | Yes | No |
| MCP server | Yes (Node.js) | Yes (Node.js) | Yes (Node.js) |
| Motion Tier 1 (Reanimated) | Yes | Yes | Yes |
| Motion Tier 2 (SwiftUI) | Yes | No | No |
| Motion Tier 3 (Compose) | No | Yes | No |
| SwiftUI adapter | Yes (dev build only) | No | No |
| Compose adapter | No | Yes (dev build only) | No |
| Native preview comparison | Yes (Node.js) | Yes (Node.js) | Yes (Node.js) |

## Troubleshooting

### Bridge not connecting

1. Verify `__DEV__` is `true` (`bridge.enabled` must be explicitly `true` and `__DEV__` must be `true`).
2. Check `executionEnvironment` is `'bare'` (not `'standalone'`).
3. Ensure a non-empty `pairingToken` is provided.
4. Verify the WebSocket URL is `ws://localhost:9721` (or your configured port).
5. Ensure the MCP server is running before the app connects.
6. For Android emulator, use `ws://10.0.2.2:9721` to reach the host machine.
7. Check that the MCP listener port (default 9721) is not blocked by a firewall.

### "BRIDGE_DISABLED" gate result

The bridge is not explicitly enabled. Set `bridge.enabled: true` in `AgentUIProvider`.

### "NOT_DEVELOPMENT" gate result

You are running in a production build. The bridge only works in development (`__DEV__ === true`).

### "MISSING_PAIRING_TOKEN" gate result

No pairing token was provided. Generate one with `generateAgentUIPairingToken()` and pass it to both `AgentUIProvider` and the MCP server.

### "LAN_REQUIRES_EXPLICIT_UNSAFE_OPT_IN" gate result

The WebSocket URL resolves to a non-loopback host. Set `unsafeAllowLAN: true` if you explicitly accept the risk.

### "MAESTRO_UNAVAILABLE" on maestro-run

Maestro CLI is not installed. Install with:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Native adapter not available

1. Native adapters require `@expo/ui` to be installed.
2. Native adapters require development builds (not Expo Go).
3. SwiftUI adapter only works on iOS (`Platform.OS === 'ios'`).
4. Compose adapter only works on Android (`Platform.OS === 'android'`).
5. Call `detectAgentUISwiftUINativeModule()` or `detectAgentUIComposeNativeModule()` to verify.
6. Call `refreshAgentUISwiftUIAdapter()` or `refreshAgentUIComposeAdapter()` to force re-detection.

### Duplicate stable ID warnings

The runtime warns when two visible nodes share the same `id` within a screen scope. Make every actionable node's `id` unique within its screen.

### Semantic node not found

1. The node may not be mounted (check the component is rendered).
2. The node may be hidden (`hidden: true` in state prunes it from the visible tree).
3. The node may be on a different screen — use `screen` scope in `getState` or `getNodeById`.
4. The `id` may have whitespace — all IDs are trimmed before lookup.

### MCP tools returning "SESSION_NOT_CONNECTED"

No app has paired with the MCP server. Start your app with the bridge enabled, ensure it can reach the MCP listener WebSocket, and wait for the "paired" state.

## License

MIT
