# Compatibility Matrix

Last updated: 2026-05-02
Applies to: Expo Agent UI v0.0.0

## Runtime Stack

| Surface | Supported Range | Pinned In Lock | Notes |
|---|---|---|---|
| Expo SDK | ^55.0.0 | ~55.0.18 | SDK 55 enforces New Architecture. SDK 54 and earlier are not supported (Legacy Architecture removed). SDK 56+ will require re-verification of React Native version and New Architecture breaking changes. |
| React | 19.2.0 | 19.2.0 | Aligned with React Native 0.83 integration. Introduces `<Activity>`. |
| React Native | 0.83.6 | 0.83.6 | First RN release with no user-facing breaking changes for 0.82 upgraders. New Architecture required. |
| Node.js | >=20.19.4 | — | Also tested against ^22.13.0, ^24.3.0, ^25.0.0. Required for CLI tooling and MCP server. |
| TypeScript | ^5.9.2 | ^5.9.2 | Required for package tooling and typecheck. App consumers should follow Expo template defaults. |
| react-native-reanimated | ^4.0.0 | — | Peer dependency for the motion layer. Drops Legacy Architecture. Separates worklets. |
| react-native-worklets | ^0.8.0 | — | Peer dependency extracted from Reanimated 4. Requires `react-native-worklets/plugin` in Babel config. |
| @expo/ui | ^55.0.0 | — | Used by native SwiftUI and Jetpack Compose adapters. Not imported by core root. |
| expo-router | ^55.0.0 | — | Used by navigation adapters when file-based routing is present. |
| @modelcontextprotocol/sdk | ^1.29.0 | — | MCP server dependency. v1.x is the production-recommended line. v2 alpha packages are not used. |

## Package Inter-Compatibility

| Package | Depends On | Required For |
|---|---|---|
| @expo-agent-ui/core | expo, react, react-native, react-native-reanimated, react-native-worklets | All Agent UI usage. The JS-only semantic runtime. |
| @expo-agent-ui/expo-plugin | expo | Automated native app configuration. Required only if later stages add native module mutations. |
| @expo-agent-ui/mcp-server | @expo-agent-ui/core, @modelcontextprotocol/sdk, ws | Local MCP stdio server. Runs in Node.js outside the app. |
| @expo-agent-ui/cli | @expo-agent-ui/mcp-server | CLI tools: init, dev, doctor, maestro export/run/heal. |
| @expo-agent-ui/example-app | @expo-agent-ui/core | Development testing and E2E validation. |

## Workflow Support

### Managed Workflow

Fully supported. Install with `npx expo install` which resolves compatible Expo SDK versions. No native build step required for core runtime. The JS-only semantic runtime, primitives, motion layer, and bridge work in managed apps.

### Bare Workflow

Fully supported. Requires `npx expo prebuild` after installation to regenerate native projects. Config plugins fire during prebuild when `@expo-agent-ui/expo-plugin` is present in the plugins array. Without CNG, native mutations must be applied manually.

## Platform Support

### iOS

Full support. All Agent UI primitives, semantic runtime, Reanimated motion presets, and the app bridge operate on iOS. Native SwiftUI adapter (`@expo/ui/swift-ui`) renders SwiftUI components when `@expo/ui` is installed and a development build is used. Expo Go does not include `@expo/ui` native code.

### Android

Full support. All Agent UI primitives, semantic runtime, Reanimated motion presets, and the app bridge operate on Android. Native Jetpack Compose adapter (`@expo/ui/jetpack-compose`) renders Compose components when `@expo/ui` is installed and a development build is used. Expo Go does not include `@expo/ui` native code.

### Web

JS-only primitives via React Native Web. Semantic runtime, tree inspection, and agent tool bridge are supported. Native SwiftUI and Jetpack Compose adapters are not available on web — they require native iOS/Android runtimes. The bridge can connect from a web app where `WebSocket` is available.

## EAS Build Compatibility

| Capability | Support | Requirements |
|---|---|---|
| iOS development build | Supported | EAS macOS cloud workers. SwiftUI adapter requires `@expo/ui` in dependencies. |
| iOS simulator build | Supported | Simulator builds produce `.app` bundles for macOS simulators. Cannot run interactive preview on non-macOS hosts. |
| Android development build | Supported | Android build lane in EAS. Gradle cache with `EAS_GRADLE_CACHE=1`. |
| Android Gradle cache | Supported | Set `EAS_GRADLE_CACHE=1` in the build profile environment. Verify `FROM CACHE` entries in Run Gradle build logs. |
| Expo Go | Limited | Core JS-only primitives work. Native adapters (`@expo/ui/swift-ui`, `@expo/ui/jetpack-compose`) require development builds. No native module auto-linking in Expo Go. |

### EAS Build Profile Example

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EAS_GRADLE_CACHE": "1"
      }
    }
  }
}
```

## Native Adapter Requirements

| Adapter | Platform | Import Path | Development Build Required | @expo/ui Required |
|---|---|---|---|---|
| SwiftUI | iOS | @expo-agent-ui/core/swift-ui | Yes | Yes (^55.0.0) |
| Jetpack Compose | Android | @expo-agent-ui/core/jetpack-compose | Yes | Yes (^55.0.0) |
| React Native fallback | Cross-platform | @expo-agent-ui/core | No | No |

Native adapters detect availability via dynamic require at runtime. Detection is lazy and memoized. If `@expo/ui` is not installed, adapters report `available: false` and primitives fall back to React Native implementations with development warnings.

## Peer Dependency Strategy

| Package | Dependency Type | Range | Reason |
|---|---|---|---|
| expo | peerDependency | ^55.0.0 | Enforces New Architecture and standardizes runtime. |
| react | peerDependency | 19.2.0 | Matches React Native 0.83 requirements. |
| react-native | peerDependency | 0.83.6 | Required by Expo SDK 55. |
| react-native-reanimated | peerDependency | ^4.0.0 | Powers the three-tier motion layer. |
| react-native-worklets | peerDependency | ^0.8.0 | Decoupled multithreading for Reanimated 4. |
| @expo/ui | peerDependency | ^55.0.0 | Required for native SwiftUI/Compose adapters. gated behind explicit adapter imports. |
| expo-router | peerDependency | ^55.0.0 | Used for navigate() intents when file-based routing is configured. |
