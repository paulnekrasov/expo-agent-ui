# Expo Package Foundation Research

## Executive Summary
- **Adopt Expo SDK 55 as the strict baseline:** SDK 55 firmly removes the Legacy Architecture, preventing the need to maintain dual-architecture support [cite: 1].
- **Enforce JS-only runtime for Stage 1:** Develop `packages/core` without a native bridge to ensure zero-friction adoption across both managed and bare workflows. 
- **Align package versions with SDK rules:** Implement the Expo SDK 55 package versioning convention where applicable; current npm metadata shows `expo`, `expo-router`, and `@expo/ui` all published in the `55.0.x` line [cite: 1, 28, 29, 30].
- **Separate the MCP server from the runtime:** Build `packages/mcp-server` as an out-of-app Node.js integration over standard `stdio`, leaving the app runtime lightweight and secure [cite: 10]. Keep the package shell dependency-free until Stage 5 code imports the MCP SDK.
- **Defer Config Plugins to Stage 7+:** Keep the default installation pure JavaScript. Utilize `packages/expo-plugin` only if later stages require `AndroidManifest.xml` or `Info.plist` mutations for OS-level automation frameworks.
- **Isolate Reanimated 4 worklets:** Ensure `react-native-worklets` is explicitly handled as a peer dependency alongside `react-native-reanimated`, updating documentation to include its required Babel plugin [cite: 5, 6].

## Verified Version Matrix

| Surface | Current version or supported range | Source URL | Notes / risk |
| :--- | :--- | :--- | :--- |
| Expo SDK | `^55.0.0` | https://expo.dev/changelog/sdk-55 | SDK 55 is stable (Feb 2026). Enforces New Architecture [cite: 1]. |
| React | `19.2.0` | https://reactnative.dev/blog/2025/12/10/react-native-0.83 | Integrated natively into RN 0.83. Introduces `<Activity>` [cite: 3]. |
| React Native | `0.83.x` | https://reactnative.dev/blog/2025/12/10/react-native-0.83 | First release with no user-facing breaking changes for 0.82 upgraders [cite: 3]. |
| Node | `^20.19.4`, `^22.13.0`, `^24.3.0`, `^25.0.0` | https://expo.dev/changelog/sdk-55 | Raised minimum version requirements for the CLI [cite: 1]. |
| TypeScript | `^5.9.2` for Expo module package tooling | https://www.npmjs.com/package/expo-module-scripts | `expo-module-scripts@55.0.2` depends on TypeScript `^5.9.2`; app consumers should still follow the Expo template/tooling default [cite: 28]. |
| Reanimated | `~4.x` | https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/ | Drops Legacy Architecture. Separates worklets [cite: 6]. |
| Worklets | `~0.8.x` | https://www.npmjs.com/package/react-native-worklets | Extracted from Reanimated. Requires `react-native-worklets/plugin` [cite: 5, 13]. |
| Expo Router | `^55.0.0` | https://www.npmjs.com/package/expo-router | npm reports `expo-router@55.0.13`; use as an optional peer only for router integration [cite: 29]. |
| `@expo/ui` | `^55.0.0` | https://www.npmjs.com/package/@expo/ui | npm reports `@expo/ui@55.0.12`; SwiftUI and Jetpack Compose adapters should remain optional [cite: 8, 30]. |
| MCP SDK | `^1.29.0` | https://www.npmjs.com/package/@modelcontextprotocol/sdk | Stage 5 target. Current npm metadata reports `@modelcontextprotocol/sdk@1.29.0`; add it to `packages/mcp-server` when server implementation imports it, not before [cite: 10]. |

## Recommended Package Layout
The repository should adopt an npm workspace structure to securely isolate environments (Node context vs. React Native context) while enabling unified CI/CD.

```text
packages/
├── core/            # The JS-only semantic runtime and UI primitive components. Must be lean and runnable on devices.
├── expo-plugin/     # Optional automated native app configurations for prebuild. Kept separate to prevent bundling Node APIs into the app.
├── mcp-server/      # The local stdio server package shell. Add `@modelcontextprotocol/sdk` when implemented tools exist. Runs in Node.js on the host machine.
├── cli/             # CLI tools for initializing the configuration and launching the local MCP server over Metro.
└── example-app/     # An Expo SDK 55 testing ground mimicking a consumer application to run E2E tests and validate semantic IDs.
```

## Peer Dependency Strategy

| Package | Dependency type | Recommended range | Reason | Risk |
| :--- | :--- | :--- | :--- | :--- |
| `expo` | `peerDependency` | `^55.0.0` | Forces alignment with the New Architecture and standardizes the underlying environment [cite: 1, 2]. | Excludes SDK 54 apps. |
| `react` | `peerDependency` | `19.2.0` | Matches RN 0.83 requirements [cite: 3]. | Low. |
| `react-native` | `peerDependency` | `0.83.x` | Required by SDK 55 [cite: 1]. | Low. |
| `react-native-reanimated` | `peerDependency` | `^4.0.0` | Powers the SwiftUI-inspired high-fidelity motion layer [cite: 15]. | API divergence from v3. |
| `react-native-worklets` | `peerDependency` | `^0.8.0` | Mandatory decoupled multithreading dependency for Reanimated 4 [cite: 5, 6]. | Users may forget the Babel plugin. |
| `@expo/ui` | optional `peerDependency` | `^55.0.0` | Required only if developers utilize the `swift-ui` or `jetpack-compose` adapters [cite: 16, 30]. | High churn as it matures. |
| `expo-router` | optional `peerDependency` | `^55.0.0` | Used for `navigate()` intents if the app relies on file-based routing [cite: 29]. | Navigation APIs evolve rapidly. |

## Config Plugin Findings

- **File Layout:** The plugin should be distributed as a standalone package (`packages/expo-plugin`) compiled with `expo-module-scripts` [cite: 12]. The main entry must be exported in `app.plugin.js` at the package root [cite: 12].
- **`app.plugin.js`:** Written in TypeScript (`src/index.ts`) and compiled to JS. Signature: `(config: ExpoConfig, props: Props) => ExpoConfig` [cite: 17].
- **Plugin Options:** Accepts configuration parameters (e.g., opting into experimental native bridges) mapped from the consumer's `app.json` `plugins` array [cite: 18].
- **iOS Mutation APIs:** Utilize `withInfoPlist` for property list changes, which are safe JSON-like object mutations. `withXcodeProject` is available but riskier [cite: 17, 19].
- **Android Mutation APIs:** Utilize `withAndroidManifest` for permission insertions. For Gradle files, `withAppBuildGradle` exists but requires `withDangerousMod` string replacements, which are fragile [cite: 19].
- **Idempotency Rules:** Plugins execute during every `expo prebuild`. Mutations must actively check for pre-existing modifications (e.g., checking if a permission already exists) before appending data to prevent duplicating entries across builds [cite: 17, 19].
- **Managed vs. Bare Implications:** Config plugins enable "Continuous Native Generation" (CNG). Bare workflow users without CNG will not benefit unless they manually run `npx expo prebuild` [cite: 17].
- **When to Avoid:** The Expo Agent UI project should completely bypass config plugins for the Stage 1-4 deliverables. The core functionality (semantics, tools, UI primitives) does not require altering native permissions or injecting native SDK initialization code.

## Expo Modules API Findings

- **When a Native Module is Needed:** Required strictly if JS-level introspection fails to capture specific Accessibility APIs, or if synthesizing touch events (`tap`, `input`) securely blocked by React Native's JS layer requires OS-level automation frameworks.
- **Source Layout:** Modules define a core class in Swift/Kotlin inheriting from `Module()` and registering functions via the `Name()` and `Function()` macros [cite: 20].
- **TypeScript Surface:** Automatically infers bindings from the native macros through a JSI (JavaScript Interface) abstraction, offering synchronous execution without serialization overhead [cite: 20, 21].
- **Autolinking:** Since SDK 54, autolinking mimics Node.js module resolution recursively [cite: 7]. The package only requires `expo-module.config.json` at its root indicating the supported `platforms` [cite: 22].
- **Prebuild / CNG Behavior:** Fully integrated. Calling `npx expo install` automatically links the code.
- **Bare Workflow Behavior:** Supported out-of-the-box via `expo-modules-autolinking` as long as the bare project uses Expo [cite: 22, 23].
- **Risks for this Project:** Introducing native code dramatically increases adoption friction, forces prebuild executions, and risks breaking down over Swift/Kotlin version updates. Avoid until absolutely mandated.

## JS-Only V0 Feasibility

| Capability | Classification | Rationale |
| :--- | :--- | :--- |
| Semantic registry | JS-only | Fully manageable via React Context and in-memory JS stores. |
| `inspectTree` | JS-only | Queryable locally by iterating the JS registry state. |
| `tap(id)` | Likely JS-only with limitations | Components can expose a synthetic `onAgentPress` prop or forward refs to trigger `onPress`, but simulating precise OS-level gesture coordinates relies on workarounds [cite: 24, 25]. |
| `input(id, value)` | Likely JS-only with limitations | Can forcibly update bound state or invoke `onChangeText` via ref, but bypasses the native keyboard lifecycle events [cite: 24]. |
| `scroll(id)` | Likely JS-only with limitations | Standard `ScrollView` exposes `scrollTo` via refs, achievable purely in JS if the wrapper component retains the ref [cite: 24]. |
| `navigate(screen)` | JS-only | Controlled directly through Expo Router or React Navigation APIs. |
| Event log | JS-only | Hook-based observers and global context loggers. |
| Flow runner | JS-only | Async JS queues handling the execution loop. |
| Animation event reporting | JS-only | Utilizing Reanimated 4 `runOnJS` callbacks [cite: 26]. |
| MCP server connection | JS-only | Can operate via WebSocket between the running JS app and the local Node.js server. Notably, `expo-dev-mcp` utilizes built-in Metro DevTools websockets without native app alterations [cite: 27]. |

## Install And Init Flow
*Note: These commands are structural recommendations outlining the intended developer experience.*

1.  **Install Library**
    ```sh
    npx expo install @expo-agent-ui/core react-native-reanimated react-native-worklets
    ```
    *Action:* Injects the core semantic runtime into the target app. Reanimated and Worklets are explicitly installed as peer requirements [cite: 5].

2.  **Initialize Configuration**
    ```sh
    npx agent-ui init
    ```
    *Action:* Validates the peer dependencies, automatically adds the `react-native-worklets/plugin` to `babel.config.js` [cite: 6], and generates a baseline `agent-flow.json` configuration file.

3.  **Run Agent Server**
    ```sh
    npx agent-ui dev
    ```
    *Action:* Spawns the local Node.js MCP server using `@modelcontextprotocol/sdk` over `stdio` [cite: 10], opening a WebSocket tunnel directly into the active Metro instance [cite: 27] to bridge the local semantic runtime with AI clients.

## Open Questions
-  **Metro Intercept Feasibility:** Can we piggyback on Expo's existing DevTools Chrome Debugger Protocol WebSocket to extract semantic data silently, or must we instantiate our own standard `WebSocket` connection inside the app [cite: 27]?
-  **React Native 0.83 `<Activity>` Usage:** Should the Agent UI `Screen` primitives automatically wrap inactive screens in React 19's `<Activity mode="hidden">` to optimize performance, or will that destruct semantic introspection [cite: 3]?
-  **Bypass Native Touches:** If a developer applies an `id` to a third-party standard `<Button>`, how exactly does the JS-only runtime forcibly trigger its `onPress` without altering the host source code?

## Source Index
- **[cite: 20]** *Expo Modules API Docs* - https://docs.expo.dev/modules/module-api/ (Accessed 2026-04-26) - Defines native module source layout, macros, and function registration.
- **[cite: 22]** *Expo Autolinking Docs* - https://docs.expo.dev/modules/autolinking/ (Accessed 2026-04-26) - Outlines `expo-module.config.json` requirements and the transition to Node-resolution autolinking.
- **[cite: 7]** *Kitten's Blog: Autolinking's Broken Promise* - https://kitten.sh/blog/autolinkings-broken-promise (Accessed 2026-04-26) - Explains how SDK 54/55 resolves Expo modules identically to Node modules.
- **[cite: 23]** *Using Expo Modules in React Native CLI* - https://medium.com/@muneebmuhammad444/using-expo-modules-in-react-native-cli-complete-setup-guide-for-2026-4679f5528d55 (Accessed 2026-04-26) - Validates bare workflow compatibility and the requirement for `expo-modules-core`.
- **[cite: 12]** *Expo Config Plugin Library Docs* - https://docs.expo.dev/config-plugins/development-for-libraries/ (Accessed 2026-04-26) - Explains `app.plugin.js`, compilation with `expo-module-scripts`.
- **[cite: 17]** *Mintlify Expo Config Plugins Introduction* - https://www.mintlify.com/expo/expo/config-plugins/introduction (Accessed 2026-04-26) - Documents Prebuild modifications, `withDangerousMod`, and `withInfoPlist` behaviors.
- **[cite: 19]** *Doing More with Expo Using Custom Native Code* - https://www.sitepen.com/blog/doing-more-with-expo-using-custom-native-code (Accessed 2026-04-26) - Corroborates idempotency risks related to `withDangerousMod`.
- **[cite: 18]** *Expo Config Plugin Passing Parameters* - https://docs.expo.dev/config-plugins/plugins/ (Accessed 2026-04-26) - Supports how plugins accept schema arrays via `app.json`.
- **[cite: 1]** *Expo SDK 55 Changelog* - https://expo.dev/changelog/sdk-55 (Accessed 2026-04-26) - Confirms SDK 55 includes React Native 0.83 and mandates the New Architecture.
- **[cite: 2]** *Expo SDK 54 Changelog* - https://expo.dev/changelog/sdk-54 (Accessed 2026-04-26) - States SDK 54 is the final release supporting Legacy Architecture.
- **[cite: 5]** *Reanimated Getting Started* - https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/ (Accessed 2026-04-26) - Verifies `react-native-worklets` split and `react-native-worklets/plugin` necessity.
- **[cite: 15]** *How to Create Fluid Animations* - https://www.freecodecamp.org/news/how-to-create-fluid-animations-with-react-native-reanimated-v4/ (Accessed 2026-04-26) - Further proof that Fabric (New Architecture) is required for Reanimated 4.
- **[cite: 27]** *Libraries.io expo-dev-mcp* - https://libraries.io/npm/expo-dev-mcp (Accessed 2026-04-26) - Shows that MCP servers can route via Metro's WebSocket without native changes.
- **[cite: 26]** *React Native Gesture Handler Docs* - https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/use-tap-gesture/ (Accessed 2026-04-26) - Highlights touch boundaries and `runOnJS` capabilities.
- **[cite: 24]** *React Native TextInput Docs* - https://reactnative.dev/docs/textinput (Accessed 2026-04-26) - Illustrates limitations of synthetic input firing.
- **[cite: 25]** *React Native Handling Touches* - https://reactnative.dev/docs/handling-touches (Accessed 2026-04-26) - Identifies JS-level touchable abstractions.
- **[cite: 6]** *Reanimated 4 Migration Guide* - https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/ (Accessed 2026-04-26) - Highlights API breaking changes and dependency replacements.
- **[cite: 16]** *Expo UI SwiftUI Agent Skill* - https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-ui-swift-ui/SKILL.md (Accessed 2026-04-26) - Maps the usage of `@expo/ui/swift-ui` components and the `Host` wrapper.
- **[cite: 8]** *Expo UI in SDK 55 Blog* - https://expo.dev/blog/expo-ui-in-sdk-55-jetpack-compose-now-available-for-react-native-apps (Accessed 2026-04-26) - Confirms SwiftUI updates and Jetpack Compose reaching beta status.
- **[cite: 3]** *React Native 0.83 Release Blog* - https://reactnative.dev/blog/2025/12/10/react-native-0.83 (Accessed 2026-04-26) - Validates RN 0.83 has no user-facing breaking changes and adds `<Activity>`.
- **[cite: 13]** *react-native-worklets NPM* - https://www.npmjs.com/package/react-native-worklets (Accessed 2026-04-26) - Details the NPM package state for worklets.
- **[cite: 1]** *Expo Node Support Notes* - https://expo.dev/changelog/sdk-55 (Accessed 2026-04-26) - Verifies Node.js minimum boundaries (LTS ^20.19.4, ^22.13.0).
- **[cite: 10]** *@modelcontextprotocol/sdk NPM* - https://www.npmjs.com/package/@modelcontextprotocol/sdk (Accessed 2026-04-27) - Documents usage of stdio transport for the MCP protocol and current package version.
- **[cite: 28]** *expo-module-scripts NPM metadata* - https://www.npmjs.com/package/expo-module-scripts (Accessed 2026-04-27) - Supports Expo module package tooling version facts, including TypeScript dependency.
- **[cite: 29]** *expo-router NPM metadata* - https://www.npmjs.com/package/expo-router (Accessed 2026-04-27) - Supports current Expo Router package version facts.
- **[cite: 30]** *@expo/ui NPM metadata* - https://www.npmjs.com/package/@expo/ui (Accessed 2026-04-27) - Supports current `@expo/ui` package version facts.

## Final Recommendation
**Proceed immediately to Stage 1.** The target stack is fully stabilized. Expo SDK 55 officially deprecates the Legacy Architecture, guaranteeing standard execution. Reanimated 4 and React Native 0.83 provide high-fidelity hooks necessary for the framework. Because the JS-Only implementation is validated for core state and introspection routines, construct the npm workspaces ensuring `@expo-agent-ui/core` is strictly decoupled from `@expo-agent-ui/expo-plugin`.

DONE
