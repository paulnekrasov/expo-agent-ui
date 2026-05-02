# Installation Guide

Last updated: 2026-05-02
Applies to: Expo Agent UI v0.1.0

## Prerequisites

Before installing, verify your environment meets these requirements:

- **Node.js** >= 20.19.4 (also supports ^22.13.0, ^24.3.0, ^25.0.0)
- **Expo project** targeting SDK 55 (^55.0.0). Run `npx expo --version` to confirm.
- **React** 19.2.0 and **React Native** 0.83.6 (bundled with Expo SDK 55)
- **npm** 11.9.0 or compatible

Create or open an existing Expo SDK 55 project:

```sh
npx create-expo-app@latest my-app --template blank-typescript
cd my-app
```

## Step 1: Install Core Package

The core package provides the semantic runtime, component primitives, and agent tool bridge.

```sh
npx expo install @expo-agent-ui/core
```

This installs `@expo-agent-ui/core` and verifies compatibility with Expo SDK 55 peer dependencies.

## Step 2: Install Motion Dependencies

Reanimated 4 provides cross-platform animation presets. Worklets enables multithreaded animation work.

```sh
npx expo install react-native-reanimated react-native-worklets
```

## Step 3: Add Reanimated Babel Plugin

Edit `babel.config.js` to include both `babel-preset-expo` and the worklets plugin:

```js
module.exports = function configureBabel(api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin']
  }
}
```

After editing, clear the Metro cache:

```sh
npx expo start --clear
```

## Step 4: Run CLI Init

The CLI validates peer dependencies, adds required Babel plugins if not already present, and generates a baseline configuration.

```sh
npx @expo-agent-ui/cli init
```

This command:
- Validates that `expo`, `react`, `react-native`, `react-native-reanimated`, and `react-native-worklets` are installed at compatible versions
- Adds `react-native-worklets/plugin` to `babel.config.js` if not already configured
- Generates an `agent-flow.json` configuration file

## Step 5: Install MCP Server

The MCP server runs locally in Node.js and bridges your app's semantic runtime to AI agent hosts.

```sh
npm install @expo-agent-ui/mcp-server --save-dev
```

This installs the stdio server, the `agent-ui-mcp` binary, and its dependencies (`@modelcontextprotocol/sdk`, `ws`).

## Step 6: Wrap App in AgentUIProvider

Import and wrap your root component in `AgentUIProvider`. This activates the semantic runtime, component registry, and development-only agent bridge.

```tsx
import { AgentUIProvider, Screen, VStack, Text, Button } from '@expo-agent-ui/core'

export default function App() {
  return (
    <AgentUIProvider
      agentControl
      bridgeConfig={{
        host: '127.0.0.1',
        port: 9721,
        pairingToken: 'your-token-from-mcp-server'
      }}
    >
      <Screen screenId='home'>
        <VStack>
          <Text id='greeting' role='heading' label='Welcome'>
            Welcome to Expo Agent UI
          </Text>
          <Button
            id='start-action'
            label='Get Started'
            onPress={() => console.log('pressed')}
          />
        </VStack>
      </Screen>
    </AgentUIProvider>
  )
}
```

Key props:
- `agentControl` — Enables the development-only agent bridge. Disabled in production builds.
- `bridgeConfig.host` — The WebSocket listener host (default: `127.0.0.1`).
- `bridgeConfig.port` — The WebSocket listener port (default: `9721`).
- `bridgeConfig.pairingToken` — The token printed by the MCP server at startup.

## Step 7: Post-Install Verification

Start the Expo development server:

```sh
npx expo start
```

Start the MCP server in a separate terminal:

```sh
npx agent-ui-mcp --pairing-token your-token
```

The MCP server outputs:
```
[agent-ui-mcp] starting listener on 127.0.0.1:9721
[agent-ui-mcp] pairing token: <your-token>
[agent-ui-mcp] listener started
[agent-ui-mcp] server connected via stdio
```

Open the app on a simulator or device. The development tools sidebar shows connected semantic nodes. The MCP server receives a session hello when the app bridge connects.

## Per-Package Install

### @expo-agent-ui/core

```sh
npx expo install @expo-agent-ui/core
```

Required in every app. The JS-only runtime. No native modules.

### @expo-agent-ui/expo-plugin

```sh
npx expo install @expo-agent-ui/expo-plugin
```

Add to `app.json` plugins array:

```json
{
  "expo": {
    "plugins": ["@expo-agent-ui/expo-plugin"]
  }
}
```

Run `npx expo prebuild` to apply native mutations. Defer this package unless your stage requires `AndroidManifest.xml` or `Info.plist` changes.

### @expo-agent-ui/mcp-server

```sh
npm install @expo-agent-ui/mcp-server --save-dev
```

Add an npm script for convenience:

```json
{
  "scripts": {
    "agent-mcp": "agent-ui-mcp --skills-dir ./skills"
  }
}
```

### @expo-agent-ui/cli

```sh
npm install @expo-agent-ui/cli --save-dev
```

Available commands:

| Command | Purpose |
|---|---|
| `agent-ui init` | Validate deps and generate baseline config |
| `agent-ui dev` | Start the local agent development server |
| `agent-ui doctor` | Check environment and dependency health |
| `agent-ui export-maestro` | Export semantic flows to Maestro YAML |
| `agent-ui maestro-run` | Execute exported Maestro flows |
| `agent-ui maestro-heal` | Generate self-healing proposals for failed flow selectors |

### @expo-agent-ui/example-app

Consumers do not install `@expo-agent-ui/example-app`. It is a development testing ground inside the monorepo. Use it as a reference implementation.

## Monorepo Install Path

If your project uses npm workspaces, add Agent UI packages to your workspace root:

```json
{
  "workspaces": [
    "packages/*",
    "node_modules/@expo-agent-ui/*"
  ]
}
```

Then install as workspace dependencies:

```sh
npm install @expo-agent-ui/core --workspace=my-app
npm install @expo-agent-ui/mcp-server --save-dev --workspace=my-app
```

## Dev Build vs Expo Go

| Feature | Expo Go | Development Build |
|---|---|---|
| Core primitives (VStack, Text, Button, etc.) | Supported | Supported |
| Semantic runtime and tree inspection | Supported | Supported |
| Reanimated motion presets | Supported | Supported |
| Agent tool bridge (WebSocket) | Supported | Supported |
| Native SwiftUI adapter (@expo/ui/swift-ui) | Not available | Required |
| Native Jetpack Compose adapter (@expo/ui/jetpack-compose) | Not available | Required |
| Config plugin native mutations | Not applicable | Required (after `expo prebuild`) |

Use Expo Go for rapid iteration on JS-only features. Create a development build when native adapters or config plugins are needed:

```sh
npx expo run:ios    # iOS development build
npx expo run:android # Android development build
```

## Metro Config Notes

The default Metro configuration from Expo SDK 55 works without changes for Agent UI packages. If you encounter module resolution issues with workspace packages, add watch folders:

```js
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.watchFolders = [
  ...config.watchFolders,
  // add monorepo root if using workspaces
]

module.exports = config
```
