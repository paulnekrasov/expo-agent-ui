# Troubleshooting — Expo Agent UI

This guide covers common issues across installation, build, bridge, MCP, semantic runtime,
flow runner, native adapters, Maestro, native preview comparison, testing, and platform-specific
workflows. Every error code listed here is sourced from the actual codebase in `packages/mcp-server/src/cli.ts`,
`packages/mcp-server/src/listener.ts`, `packages/mcp-server/src/platform-skills.ts`, and
`packages/cli/src/commands/maestro-run.ts`.

---

## 1. Installation Issues

### Wrong Node.js Version

**Symptom:** npm install fails with an engine mismatch or unexplained native-module errors.

**Check:**
```sh
node --version
```

**Required:** `>=20.19.4` (declared in root `package.json` `engines.node`).

**Fix:**
```sh
nvm install 20
nvm use 20
```

### Missing Peer Dependencies

**Symptom:** `ERESOLVE unable to resolve dependency tree` or peer-conflict warnings during `npm install`.

**Check peer ranges (from `packages/core/package.json`):**
```text
expo             ~55.0.18
react            19.2.0
react-native     0.83.6
react-native-reanimated  ^4.0.0 (optional, via peerDependenciesMeta)
react-native-worklets    ^0.8.0 (optional, via peerDependenciesMeta)
```

**Fix:**
```sh
npx expo install react-native-reanimated@^4.0.0 react-native-worklets@^0.8.0
```

### Expo SDK Mismatch

**Symptom:** TypeScript build errors about missing Expo types, or runtime crashes referencing unknown SDK APIs.

**Check:**
```sh
npx expo --version
```

The workspace pins Expo at `~55.0.18`. Any other major SDK version can cause `@agent-ui/core` typecheck failures.

**Fix:** Update `expo` in your app to `~55.0.18` and install matching `jest-expo`, `babel-preset-expo`.

### npm Workspace Resolution

**Symptom:** `npm install` inside an npm workspace that includes `@agent-ui/*` packages fails with "cannot find package" or links to workspace-local versions instead of the registry.

**Check:**
```sh
cmd /c npm.cmd ls --all --include-workspace-root
```

The root `package.json` declares workspaces: `packages/core`, `packages/expo-plugin`, `packages/mcp-server`, `packages/cli`, `packages/example-app`.

**Fix:** If your project's own `package.json` declares overlapping workspaces, exclude the Agent UI packages from your workspace array. Install them as regular dependencies instead.

---

## 2. Build / TypeScript Errors

### `exactOptionalPropertyTypes` (TS2379)

**Symptom:**
```text
error TS2379: Argument of type '{ prop?: string }' is not assignable to parameter of type ...
```

**Cause:** The shared `tsconfig.base.json` enables `"exactOptionalPropertyTypes": true`. This disallows passing `undefined` for an optional property explicitly typed as `string?`.

**Fix:** Change function parameter types from `param?: string` to `param: string | undefined` for call-sites that pass `undefined` explicitly. Do not weaken the tsconfig setting.

### `noImplicitReturns` (TS7030)

**Symptom:**
```text
error TS7030: Not all code paths return a value.
```

**Cause:** `"noImplicitReturns": true` is set in `tsconfig.base.json`. `useEffect` callbacks and arrow functions must have an explicit `return` statement even when the return type is `void`.

**Fix:** Add `return;` at the end of every `useEffect` callback and every arrow function whose return type is `void` but whose body has branching paths.

### Missing Exports After Build

**Symptom:** TypeScript in one workspace package cannot find exports that exist in `@agent-ui/core` source.

**Cause:** The consuming package resolves `dist/index.d.ts`, which is stale if `packages/core` was not rebuilt after source changes.

**Fix:**
```sh
cmd /c npm.cmd run build --workspace=@agent-ui/core
cmd /c npm.cmd run typecheck --workspaces --if-present
```

### Module Resolution Errors (Node16)

**Symptom:** `Cannot find module '...'` despite the file existing.

**Cause:** `"moduleResolution": "node16"` in `tsconfig.base.json` requires `.js` extensions in relative imports for ESM contexts, and disallows importing without explicit extensions.

**Fix:** Ensure all relative imports within CJS packages use `.js` extensions (e.g., `import { x } from "./module.js"`).

---

## 3. Bridge Connection Failures

### WebSocket Refused

**Symptom:**
```text
Error: connect ECONNREFUSED 127.0.0.1:<port>
```

**Cause:** The local bridge listener in `packages/mcp-server/src/listener.ts` is not running, or the port is in use.

**Check:**
```sh
# Is the MCP server running?
tasklist | findstr "node"
```

**Fix:**
1. Verify the dev-only gate: `const gate = createAgentUIBridgeGate({ requireDevMode: true })` — the bridge refuses connections in production builds.
2. The default loopback host is `127.0.0.1`. Do not bind to `0.0.0.0` unless behind another dev gate.
3. Change the port with `--port` flag: `node dist/cli.js --port 4096`.

### Pairing Token Mismatch

**Symptom:** Bridge hello succeeds but the next command returns a handshake error.

**Cause:** `createAgentUIBridgeHelloEnvelope` or `createAgentUIBridgeConnection` received a token that does not match the server's `--pairing-token`.

**Fix:**
1. Generate a token: `node -e "console.log(require('@agent-ui/core').generateAgentUIPairingToken())"`
2. Pass it to both the app bridge and the MCP server start command:
   ```sh
   node packages/mcp-server/dist/cli.js --pairing-token "generated-token"
   ```
3. The server validates with `constantTimeEqual` in `listener.ts`. Token must be a non-empty string.

### Loopback Binding

**Symptom:** Bridge works on the same machine but fails from another host.

**Cause:** The default listener binds to `127.0.0.1` (loopback only), which is the secure default for local agent tool bridging. Remote connections are intentionally blocked.

**Fix:** Use the `--host` flag only for same-machine debugging:
```sh
node dist/cli.js --host 127.0.0.1 --port 4096
```

---

## 4. MCP Session Errors

### `SESSION_NOT_CONNECTED`

**Symptom:** Every runtime-control MCP tool returns:
```json
{ "ok": false, "error": "No active Agent UI bridge session", "code": "SESSION_NOT_CONNECTED" }
```

**Cause:** The MCP server is running but no Expo app has connected via the bridge. Runtime-control tools (inspectTree, getState, tap, input, observeEvents, waitFor, scroll, navigate, runFlow, proposePatch) require an active session.

**Fix:**
1. Start the MCP server: `npx agent-ui-mcp`
2. Start the Expo app with `__DEV__ === true` and `AgentUIProvider` wrapping the root component.
3. Verify the app creates a bridge connection to the MCP server's WebSocket port.
4. Check `agent-ui://sessions` resource — `connected` must be `true`.

Note: Skill-context tools (listPlatformSkills, getPlatformSkill, searchPlatformSkills, recommendPlatformSkills) and the compareNativePreviews diagnostic tool do not require a session.

### Tool Authorization

**Symptom:** A tool returns an error code (e.g., `INVALID_ARGUMENT`) even with an active session.

**Cause:** The tool input schema validation failed or the runtime environment does not support the requested operation.

**Check:** Read `agent-ui://diagnostics` resource for active session metadata.

### Stdio Protocol Issues

**Symptom:** The MCP client (Claude Desktop, Codex, etc.) cannot start the server or receives garbled output.

**Cause:** The MCP server writes log output to `process.stderr`, keeping `process.stdout` clean for JSON-RPC protocol messages. If `console.log` is used in the server source, it will corrupt the stdio transport.

**Fix:** All source-level logging in `packages/mcp-server/src/` must use `process.stderr.write()` or `console.error()`. Do not use `console.log()` in any MCP server source file.

**Verify:**
```sh
node packages/mcp-server/dist/cli.js --help 2>/dev/null
```

---

## 5. Semantic Runtime Issues

### Duplicate Semantic IDs

**Symptom:** Console warning in development:
```text
[AgentUI] Duplicate semantic ID detected: "submit-button"
```

**Cause:** Two primitives in the same screen registered with the same `id` prop. The semantic registry (in `packages/core`) requires stable, unique IDs per screen.

**Fix:**
1. Audit `id` props on all primitives within each screen.
2. Use kebab-case IDs: `"checkout-email"`, `"checkout-submit"`.
3. Run the validation script:
   ```sh
   node skills/expo-agent-ui/scripts/validate-semantic-ids.js <path-to-screen-file>
   ```

### Missing Stable IDs

**Symptom:** Agent tools like `tap` or `getState` return `RESOURCE_NOT_FOUND` for a node, but the component is visually present.

**Cause:** The semantic ID was not assigned, or the component was not wrapped in an `AgentUIProvider`.

**Fix:** Add explicit `id` props to all actionable primitives (Button, TextField, SecureField, Toggle, Slider, Picker, Stepper). The skill reference `references/semantics.md` lists all roles that require stable IDs.

### Component Not In Tree

**Symptom:** `inspectTree` does not include a component visible on screen.

**Cause:** The component may not be mounted yet (conditional render), may not be inside an `AgentUIProvider`, or may be opted out via the semantic control prop.

**Fix:**
1. Verify `AgentUIProvider` wraps the target screen.
2. Check that `agentEnabled` is `true` (the provider default honors `__DEV__`).
3. Ensure the component is rendered unconditionally or is in the currently mounted screen.

### Redaction

**Symptom:** Values in `getState` responses appear as `"***REDACTED***"` instead of the actual text.

**Cause:** The component's props include `redact: true`, which marks the runtime values as sensitive. The bridge redacts these values before they leave the app runtime.

**Behavior:** This is correct by design. Agent-side redaction cannot be bypassed. If a value should be observable, remove the `redact` prop from the component.

---

## 6. Flow Runner Issues

### `FLOW_NOT_FOUND`

**Symptom:**
```json
{ "ok": false, "error": "flow '<name>' was not found", "code": "FLOW_NOT_FOUND" }
```

**Cause:** The `runFlow` MCP tool was called with a `name` that does not match any registered flow, and no inline `steps` were provided.

**Fix:**
1. Provide inline `steps` in the `runFlow` call, OR
2. Verify the flow name is registered in the flow runner's flow catalog.

### `STEP_FAILED`

**Symptom:**
```json
{ "ok": false, "error": "one or more flow steps failed", "code": "STEP_FAILED", "failedStep": <index> }
```

**Cause:** A step in the flow could not execute. Check the `failedStep` index and the `results` array for per-step error details.

**Common step-type errors:**
- `tap` / `input`: target ID not found in semantic tree.
- `scroll`: target is `NOT_SCROLL_CONTAINER` or `DIRECTION_UNSUPPORTED`.
- `navigate`: `NAVIGATION_UNAVAILABLE` or `ROUTE_NOT_FOUND`.
- `waitFor`: `CONDITIONS_REQUIRED` or `INVALID_CONDITION`.
- `assert`: assertion failed (value mismatch, visibility mismatch).
- `observeEvents`: expected events not emitted.

### `TIMEOUT`

**Symptom:**
```json
{ "ok": false, "error": "flow execution timed out", "code": "TIMEOUT" }
```

**Cause:** Flow execution exceeded `timeoutMs` (default: 30000ms). This is most common with `waitFor` steps that never satisfy their conditions.

**Fix:**
1. Increase `timeoutMs` for long-running flows.
2. Add explicit timeouts to individual `waitFor` steps.
3. Verify conditions are satisfiable (node exists, visible, correct state).

### Invalid Step Types

**Symptom:** `runFlow` MCP tool returns `INVALID_ARGUMENT` with a message about unknown step types.

**Valid step types:** `tap`, `input`, `scroll`, `navigate`, `waitFor`, `assert`, `observeEvents`.

**Fix:** Audit flow JSON against `skills/expo-agent-ui/references/flows.md` for the canonical step schema. Run:
```sh
node skills/expo-agent-ui/scripts/validate-skill.js
```
This validates `examples/flow.json` against the step type enum.

### Approval Gates

**Symptom:** Flow stops at step N with `requiresApproval: true` in flow metadata but no approval was given.

**Cause:** The flow runner `createFlowRunner` checks `metadata.gatedSteps` and requires `approvalStep(steps[i])` to return `true` before executing gated steps.

**Fix:**
1. Provide an `approvalStep` callback in the runner options that returns `true` for approved steps.
2. Remove the step index from `gatedSteps` if the step should execute without explicit approval.
3. Set `requiresApproval: false` in the flow metadata.

---

## 7. Native Adapter Issues

### Detection Fails

**Symptom:** `isAvailable()` returns `false` on both SwiftUI and Compose adapters, and all capability flags are `false`.

**Cause:** `@expo/ui` native modules are not installed in the workspace. The detection functions (`detectAgentUISwiftUINativeModule`, `detectAgentUIComposeNativeModule`) use `dynamic require` and return `false` when the module cannot be resolved.

**Check:**
```ts
import { detectAgentUISwiftUINativeModule, detectAgentUIComposeNativeModule } from "@agent-ui/core";
console.log("SwiftUI:", detectAgentUISwiftUINativeModule());
console.log("Compose:", detectAgentUIComposeNativeModule());
```

**Current state:** No `@expo/ui` or native modules are installed in this monorepo. Native adapter tests use stubs and contracts. All native adapter component factories render React Native fallbacks with dev-mode console warnings.

### Platform.OS Mismatch

**Symptom:** Detection returns `false` on the correct platform.

**Cause:** Detection functions short-circuit on platform mismatch:
- `detectAgentUISwiftUINativeModule()` returns `false` if `Platform.OS !== "ios"`.
- `detectAgentUIComposeNativeModule()` returns `false` if `Platform.OS !== "android"`.

**Fix:** Run the detection on the correct platform. In Jest, `Platform.OS` defaults to a test value and both return `false`.

### Dynamic Require Errors

**Symptom:** Runtime `Error: Cannot find module '@expo/ui/swift-ui'` or `'@expo/ui/jetpack-compose'`.

**Cause:** The native module packages are not in `node_modules`. Detection catches this and returns `false`, but code outside the try/catch may throw.

**Fix:** The detection functions are wrapped in try/catch and return `false` safely. Do not import `@expo/ui/swift-ui` or `@expo/ui/jetpack-compose` directly; always use the detection functions.

### Capability Flags All False

**Symptom:** `agentUISwiftUICapabilities.button`, `.toggle`, etc. are all `false` even after refreshing.

**Current state:** Capability flags are set uniformly — all `true` on detection success, all `false` otherwise. Individual per-control flag mapping from actual module API inspection is deferred.

**Flush detection cache for testing:**
```ts
import { refreshAgentUISwiftUIAdapter, refreshAgentUIComposeAdapter } from "@agent-ui/core";
refreshAgentUISwiftUIAdapter();
refreshAgentUIComposeAdapter();
```

---

## 8. Maestro CLI Issues

### `MAESTRO_UNAVAILABLE`

**Symptom:**
```text
MAESTRO_UNAVAILABLE: Maestro CLI is not installed.
```

**Cause:** `maestro` is not on the system PATH. The CLI command `maestro-run` calls `child_process.execSync("maestro --version")` and returns this error on failure.

**Fix (macOS/Linux):**
```sh
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Windows:** Maestro CLI does not support Windows natively. Use WSL or a macOS build agent for `maestro-run` and `maestro-heal` commands. Windows-safe alternatives are available: run `agent-ui test` instead, which uses the local Jest suite.

### YAML Export Validation

**Symptom:** `agent-ui export-maestro <flow.json>` produces YAML but Maestro fails to parse it.

**Check:**
1. The flow JSON must have a `flow` object with `name` and `steps` fields.
2. Each step must have a valid `type` (tap, input, scroll, navigate, waitFor, assert, observeEvents).
3. `targetId` must be set for steps that operate on a specific semantic node.

**Validation command:**
```sh
node skills/expo-agent-ui/scripts/validate-skill.js
```
This checks `examples/flow.json` shape, step types, and fixture reference safety.

### Self-Healing

**Symptom:** Maestro flow fails on a selector that changed in the app.

**Command:** `agent-ui maestro-heal <failed-flow.yaml> <app-source-dir>`

**Behavior:** The `maestro-heal` command reads the failed Maestro YAML, maps selectors back to semantic IDs via the flow JSON source of truth, and generates a patch proposal with updated selectors. It does not auto-apply changes — all patches require explicit approval.

---

## 9. Native Preview Comparison

### Placeholder Results

**Symptom:** `compareNativePreviews` MCP tool returns:
```json
{ "ok": true, "result": "placeholder", "message": "Requires 2+ active native runtime sessions" }
```

**Cause:** The tool requires at least 2 active native runtime sessions (one iOS SwiftUI, one Android Compose). Less than 2 active sessions triggers the placeholder.

**Current state:** This is a known deferred concern. Side-by-side iOS + Android native preview comparison needs multiple connected runtime sessions. Future implementation will connect multiple sessions.

### Single Session

**Symptom:** Comparison returns diagnostic data for only one platform (only iOS or only Android).

**Workaround:** Connect a second native runtime session via the bridge. Both the iOS app and Android app must be running with `AgentUIProvider` and bridge enabled.

### Incomplete Diff

**Symptom:** `computeSemanticIdDiff` returns fewer entries than expected.

**Cause:** Semantic IDs are redacted when their values are marked sensitive. The diff engine compares only redacted-safe metadata. Values marked with `redact: true` are excluded from diff output.

---

## 10. Jest / Test Issues

### Jest "Did Not Exit" Warning

**Symptom:**
```text
Jest did not exit one second after the test run has completed.
This usually means that there are asynchronous operations that weren't stopped in your tests.
```

**Cause:** WebSocket listeners, timers, or async I/O in `packages/mcp-server` are not properly torn down after tests.

**Fix:**
1. Use `--forceExit` as a last resort: `jest --forceExit`
2. Prefer `--runInBand` for tests that manage sockets:
   ```sh
   npx jest --config jest.config.js --runInBand
   ```
3. Every test file that creates WebSocket listeners must call `server.close()` or `ws.close()` in `afterAll`/`afterEach`.
4. The mcp-server tests use `--runInBand` in `package.json` script to avoid port contention.

### `--forceExit`

**When to use:**
```sh
cmd /c npm.cmd test --workspace=@agent-ui/mcp-server -- --runInBand
```

The `--forceExit` flag should only be added when Jest hangs after all tests pass. The standard approach is `--runInBand` with proper cleanup.

### Mock Setup

**Symptom:** `ReferenceError: react is not defined` or missing Expo globals in test environment.

**Check:** The example-app `package.json` includes:
```json
"jest-expo": "~55.0.16",
"@testing-library/react-native": "^13.3.3"
```

**Preset:** Use `jest-expo` preset in `jest.config.js`:
```js
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(...)/)"
  ]
};
```

**Mocking `@expo/ui` in tests:** All native adapter tests mock the detection path because `@expo/ui` is not installed. Detection returns `false` in Jest. Tests that need `isAvailable() === true` must mock the dynamic require.

---

## 11. Platform-Specific Issues

### iOS Simulator

**Symptom:** Bridge WebSocket connection fails on iOS Simulator.

**Common causes:**
- iOS Simulator does not share `localhost` with the host machine. Use the host's IP address (typically `10.0.2.2` or the local network IP visible to the simulator).
- For iOS Simulator, `127.0.0.1` resolves to the simulator itself, not the host.
- The MCP server binds to `127.0.0.1` by default. Change to `--host 0.0.0.0` for simulator access, but gate this behind dev-only checks.

**Fix:**
```sh
node dist/cli.js --host 0.0.0.0 --port 4096
```
Then connect from the app using the host machine's LAN IP.

### Android Emulator

**Symptom:** Bridge WebSocket connection fails on Android Emulator.

**Fix:** Android Emulator maps `10.0.2.2` to the host's `127.0.0.1`. Configure the bridge to connect to `ws://10.0.2.2:4096` in the app.

The Compose adapter detection returns `false` on non-Android platforms. Android Emulator reports `Platform.OS === "android"`, so detection proceeds normally.

### Windows Path Handling

**Symptom:** `path.resolve` or `path.join` produces paths with backslashes that break in CI, script chaining, or the MCP skill resolver.

**Fix:** All tooling uses `path.resolve` and `path.join` (Node standard library), which handle Windows paths correctly. When constructing URIs or command-line arguments manually, use forward slashes:
```sh
# Correct (Windows-safe)
cmd /c npm.cmd run test --workspaces --if-present

# Incorrect (may fail on Windows)
npm run test --workspaces --if-present
```

The root `package.json` scripts use `cmd /c npm.cmd` prefix for Windows compatibility. CI and automation should use `npm.cmd` on Windows, `npm` on Unix.

### Examples with Windows Commands

| Operation | Windows Command |
|---|---|
| Typecheck all packages | `cmd /c npm.cmd run typecheck --workspaces --if-present` |
| Build all packages | `cmd /c npm.cmd run build --workspaces --if-present` |
| Run all tests | `cmd /c npm.cmd test --workspaces --if-present` |
| Audit dependencies | `cmd /c npm.cmd audit --audit-level=moderate` |
| List workspace packages | `cmd /c npm.cmd ls --all --include-workspace-root` |
| Validate skill | `node skills/expo-agent-ui/scripts/validate-skill.js` |
| Run MCP server | `node packages/mcp-server/dist/cli.js` |
| CLI help | `node packages/cli/dist/cli.js --help` |

---

## 12. Managed vs Bare Workflow

### Expo Go

**Symptom:** Bridge or native adapter detection returns an error in Expo Go.

**Behavior:** Expo Go does not include custom native modules (`@expo/ui` not available). All native adapter detection returns `false` in Expo Go. The semantic runtime, bridge, and MCP server work in Expo Go, but native adapters are unavailable.

**Check:**
```ts
import { agentUISwiftUIAdapter } from "@agent-ui/core";
console.log("Expo Go:", agentUISwiftUIAdapter.isExpoGo()); // true => no native adapters
```

### Dev Build

**Symptom:** Native adapters are still unavailable after running `npx expo prebuild` and building with `eas build`.

**Requirements for native adapter availability:**
1. Run `npx expo prebuild` to generate `ios/` and `android/` directories.
2. Include `@agent-ui/expo-plugin` in the `plugins` array of `app.json`:
   ```json
   {
     "expo": {
       "plugins": ["@agent-ui/expo-plugin"]
     }
   }
   ```
3. Install native adapter peer dependencies (if using `@expo/ui` adapters):
   ```sh
   npx expo install @expo/ui
   ```
4. Build with EAS (managed workflow cannot compile native code):
   ```sh
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```
5. The compiled dev build must be installed on the device/simulator.

**For Gradle cache (Android):**
```sh
EAS_GRADLE_CACHE=1 eas build --profile development --platform android
```

### Prebuild Requirements

**Symptom:** `@agent-ui/expo-plugin` fails with "missing ios/ or android/ directory".

**Fix:**
```sh
npx expo prebuild --clean
```

The expo-plugin is an Expo config plugin that modifies `ios/` and `android/` build files during prebuild. It does NOT introduce native modules — it only configures existing Expo native projects to recognize Agent UI capabilities.

---

## Error Code Quick Reference

| Code | Source | Meaning |
|---|---|---|
| `SESSION_NOT_CONNECTED` | cli.ts | No active app bridge session |
| `INVALID_ARGUMENT` | cli.ts | Tool input failed validation |
| `SKILL_NOT_FOUND` | platform-skills.ts | Platform skill name not registered |
| `SKILL_INDEX_UNAVAILABLE` | cli.ts | Platform skill index could not be loaded |
| `RESOURCE_READ_FAILED` | platform-skills.ts | Could not read resource file from disk |
| `RESOURCE_NOT_FOUND` | platform-skills.ts | Resource URI not in registry |
| `CONDITIONS_REQUIRED` | cli.ts | waitFor called without conditions array |
| `INVALID_CONDITION` | cli.ts | waitFor condition missing kind or nodeId |
| `ACTION_FAILED` | cli.ts | Generic action execution failure |
| `COMMAND_FAILED` | cli.ts | Generic command dispatch failure |
| `NOT_SCROLL_CONTAINER` | cli.ts | Target node is not scrollable |
| `DIRECTION_UNSUPPORTED` | cli.ts | Scroll direction not valid for target |
| `NAVIGATION_UNAVAILABLE` | cli.ts | Navigation not available in session |
| `ROUTE_NOT_FOUND` | cli.ts | Target route or screen not found |
| `FLOW_NOT_FOUND` | cli.ts | Flow name not in flow catalog |
| `STEP_FAILED` | cli.ts | One or more flow steps failed |
| `TIMEOUT` | cli.ts | Flow or operation timed out |
| `MAESTRO_UNAVAILABLE` | maestro-run.ts | Maestro CLI not installed |
