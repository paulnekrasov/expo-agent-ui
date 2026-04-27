# Agent Bridge, MCP, And Runtime Transport Research

## Executive Summary
- Agent UI should ship its own local MCP stdio server for semantic control, not depend on Expo MCP for the core path, because Expo MCP requires an EAS paid plan and its local app-control tools are screenshot, coordinate, and `testID` oriented.
- Agent UI should interoperate with Expo MCP for Expo documentation search, compatible dependency installation, EAS workflows/builds, React Native DevTools opening, logs, screenshots, and simulator visual verification.
- Agent UI's unique capability should be a live semantic tree exposed by the app runtime: stable node IDs, roles, labels, state, actions, screen/route identity, and structured action dispatch.
- The v0 app-to-server bridge should be a development-only WebSocket where the running app connects outbound to a local Agent UI bridge server. This works in managed and bare workflows without a native module.
- The MCP-facing transport should be stdio for local agent hosts. The MCP server process can also run the WebSocket bridge internally or connect to a sibling bridge process.
- Use `@modelcontextprotocol/sdk` v1.x for v0 production work. On 2026-04-27, npm reports `@modelcontextprotocol/sdk@1.29.0` as `latest`; the split v2 packages exist but `@modelcontextprotocol/server@2.0.0-alpha.2` is alpha.
- MCP tools should return both `content` text and `structuredContent` JSON when structured results are useful, and should use tool execution errors (`isError: true`) for domain failures such as missing nodes or stale sessions.
- `packages/mcp-server` should expose a CLI binary, use Node ESM output, depend on `@modelcontextprotocol/sdk`, `zod`, and `ws`, and avoid promising tools until matching runtime capabilities exist.
- Session handling must be explicit: every app connection gets a session id, device descriptor, platform, app id, route snapshot, heartbeat timestamp, semantic-tree revision, and capability set.
- Minimum v0: `inspectTree`, `getState`, `tap`, `input`, `waitFor`, and `observeEvents` over semantic IDs; keep `scroll`, `navigate`, and `runFlow` behind capability checks until runtime adapters are implemented.

## Expo MCP Capability Map

| Capability | Expo MCP support | Requirements / limitations | Should Agent UI interoperate? | Should Agent UI implement separately? | Source URL |
|---|---|---|---|---|---|
| Official Expo documentation search/read | Server tools: `search_documentation`, `read_documentation`, `learn` | Requires Expo MCP remote server and EAS paid plan; does not require a local dev server | Yes. Prefer Expo MCP for current Expo API answers when available | No, except local Agent UI docs/resources | https://docs.expo.dev/eas/ai/mcp/ |
| Compatible Expo dependency installation | Server tool: `add_library`, using Expo's recommended package install path | Requires authenticated Expo MCP remote server | Yes, for Expo package installs and compatibility guidance | No | https://docs.expo.dev/eas/ai/mcp/ |
| EAS workflows | Server tools include workflow create/list/info/logs/run/cancel/validate | Requires EAS project/account context; paid plan requirement applies to Expo MCP server | Yes | No | https://docs.expo.dev/eas/ai/mcp/ |
| EAS builds and submit | Server tools include build list/info/logs/run/cancel/submit | Requires EAS project/account context; build run requires a connected GitHub repo per docs | Yes | No | https://docs.expo.dev/eas/ai/mcp/ |
| TestFlight crash and feedback data | Server tools include `testflight_crashes` and `testflight_feedback` | iOS/App Store/TestFlight account context required | Yes | No | https://docs.expo.dev/eas/ai/mcp/ |
| Expo Router sitemap | Local tool: `expo_router_sitemap` | Requires local capabilities and `expo-router`; Expo docs state local capabilities require a running Expo development server | Yes, if the user's app uses Expo Router | Maybe later as a semantic route adapter, not as a duplicate sitemap tool | https://docs.expo.dev/eas/ai/mcp/ |
| React Native DevTools open | Local tool: `open_devtools` | Requires local capabilities; RN DevTools is for debugging React concerns, not a stable app-control protocol | Yes, for debugging workflows | No | https://docs.expo.dev/eas/ai/mcp/ and https://reactnative.dev/docs/0.84/react-native-devtools |
| App/native/JS log collection | Local tool: `collect_app_logs` | Requires local capabilities and connected development environment | Yes | Maybe later for Agent UI-specific event logs only | https://docs.expo.dev/eas/ai/mcp/ |
| Screenshot capture | Local tool: `automation_take_screenshot` | Requires local capabilities; can target full app or `testID` | Yes, for visual verification | Only as optional interop/fallback; not primary Agent UI interface | https://docs.expo.dev/eas/ai/mcp/ |
| Coordinate or `testID` tap | Local tool: `automation_tap` | Requires local capabilities; accepts coordinates or `testID`; coordinate-first flows are not semantic | Yes, fallback only | Yes, separately implement semantic `tap({ id })` through Agent UI runtime | https://docs.expo.dev/eas/ai/mcp/ |
| View lookup by `testID` | Local tool: `automation_find_view` | Requires local capabilities; `testID` is lower-level than semantic roles/intents | Yes, for diagnostics | Yes, separately implement semantic tree query by id, role, label, intent, screen, and state | https://docs.expo.dev/eas/ai/mcp/ |
| Single local dev-server connection | Expo MCP limitation | Docs state current implementation supports only one development server connection at a time | Agent UI should tolerate this when interoperating | Yes, Agent UI should design for multiple app sessions from v0 | https://docs.expo.dev/eas/ai/mcp/ |
| iOS local app control | Expo MCP supports iOS local capabilities only on macOS simulators | Docs state physical iOS devices are not yet supported and iOS local capabilities require macOS hosts | Yes, when a macOS simulator exists | Yes, Agent UI WebSocket bridge should work from any development app that can reach the local server | https://docs.expo.dev/eas/ai/mcp/ |
| Android local app control | Expo MCP local automation list includes device interaction; docs do not list the same macOS-only limitation for Android | Requires local Expo development server and `expo-mcp` local capability setup | Yes | Yes, semantic bridge should support Android without simulator automation as a core dependency | https://docs.expo.dev/eas/ai/mcp/ |

## MCP TypeScript SDK Findings

- Package name: For v0, use `@modelcontextprotocol/sdk`. `npm view @modelcontextprotocol/sdk` on 2026-04-27 reported `1.29.0` as `latest`, with peer dependencies on `@cfworker/json-schema` and `zod`. The SDK docs describe installing `@modelcontextprotocol/sdk zod`.
- Version caution: The TypeScript SDK GitHub `main` branch documents v2 as development/pre-alpha and says v1.x remains recommended for production until stable v2 release. `npm view @modelcontextprotocol/server` on 2026-04-27 reported `2.0.0-alpha.2`, so Agent UI should not base v0 on the split v2 packages.
- Server setup: v1 docs show creating `new McpServer({ name, version })`, registering capabilities on that server, creating a transport, then `await server.connect(transport)`.
- Tool registration: v1 docs use `server.registerTool(name, { description, inputSchema }, handler)`. The MCP spec requires each tool to have a unique `name`, a human-readable description, an `inputSchema`, and optionally an `outputSchema`.
- Schema validation: The SDK docs say Zod is a peer dependency and internally uses `zod/v4` while supporting projects using Zod v3.25 or later. Use Zod schemas as the source of truth and derive JSON Schema through the SDK.
- Stdio transport: v1 docs show `StdioServerTransport`. The MCP transport spec says stdio servers are launched as subprocesses, read JSON-RPC from stdin, write JSON-RPC to stdout, may log to stderr, and must not write non-MCP messages to stdout.
- Resources: MCP resources are application-driven, URI-addressed context. Agent UI should expose read-only resources such as `agent-ui://semantic-tree`, `agent-ui://screens`, `agent-ui://flows`, and `agent-ui://diagnostics`.
- Prompts: MCP prompts are user-controlled templates discoverable by clients. Agent UI should expose prompts such as `build_screen`, `debug_flow`, `improve_semantics`, and `patch_screen` only after the corresponding docs and examples exist.
- Error handling: MCP distinguishes JSON-RPC protocol errors from tool execution errors. Use protocol errors for unknown tools or invalid arguments; use tool execution errors with `isError: true` and structured payloads for app-domain failures such as `NODE_NOT_FOUND`, `SESSION_NOT_CONNECTED`, `STALE_NODE_ID`, and `UNSUPPORTED_ACTION`.
- Structured outputs: The 2025-06-18 tools spec supports `structuredContent` plus optional `outputSchema`. It also recommends serializing structured output into text content for backwards compatibility.
- npx packaging: `packages/mcp-server` should publish a package with a `bin` entry such as `agent-ui-mcp`, allowing MCP client configs to launch it with `npx agent-ui-mcp` or `npx @agent-ui/mcp-server`. Keep stdout reserved for MCP frames.
- Source URL: https://ts.sdk.modelcontextprotocol.io/, https://github.com/modelcontextprotocol/typescript-sdk, https://modelcontextprotocol.io/specification/2025-06-18/basic/transports, https://modelcontextprotocol.io/specification/2025-06-18/server/tools, https://www.npmjs.com/package/%40modelcontextprotocol/sdk

## Proposed Agent UI Tool Surface

### `inspectTree`
- Input schema: `{ sessionId?: string, screen?: string, rootId?: string, includeHidden?: boolean, includeBounds?: boolean, maxDepth?: number }`
- Output schema: `{ ok: boolean, sessionId: string, revision: number, tree: SemanticNode, capabilities: string[], warnings: Diagnostic[] }`
- Required runtime support: semantic registry, parent-child relationships, mounted state, visibility, action metadata, tree revision counter.
- Failure modes: `NO_ACTIVE_SESSION`, `SESSION_NOT_FOUND`, `TREE_UNAVAILABLE`, `MAX_DEPTH_EXCEEDED`.
- v0 or later: v0.

### `getState`
- Input schema: `{ id: string, sessionId?: string, includeChildren?: boolean }`
- Output schema: `{ ok: boolean, node: SemanticNodeState, revision: number, candidates?: NodeCandidate[] }`
- Required runtime support: lookup by stable semantic ID, redaction policy for sensitive values, stale-id candidate matching.
- Failure modes: `NODE_NOT_FOUND`, `DUPLICATE_NODE_ID`, `SENSITIVE_VALUE_REDACTED`, `SESSION_NOT_CONNECTED`.
- v0 or later: v0.

### `tap`
- Input schema: `{ id: string, sessionId?: string, action?: string, timeoutMs?: number }`
- Output schema: `{ ok: boolean, id: string, actionResult: ActionResult, revisionBefore: number, revisionAfter?: number, events: SemanticEvent[] }`
- Required runtime support: action dispatch table for mounted nodes, enabled/disabled state, optional post-action event wait.
- Failure modes: `NODE_NOT_FOUND`, `NODE_DISABLED`, `ACTION_NOT_SUPPORTED`, `ACTION_FAILED`, `STALE_NODE_ID`.
- v0 or later: v0 for controls that register a press action.

### `input`
- Input schema: `{ id: string, value: string, sessionId?: string, submit?: boolean, timeoutMs?: number }`
- Output schema: `{ ok: boolean, id: string, valueState: SemanticValueState, events: SemanticEvent[] }`
- Required runtime support: text-input registration, controlled/uncontrolled value observation, redaction for secure fields, change-text dispatch.
- Failure modes: `NODE_NOT_FOUND`, `NOT_INPUT_NODE`, `INPUT_REJECTED`, `SECURE_VALUE_WRITE_ONLY`, `ACTION_FAILED`.
- v0 or later: v0 for Agent UI text fields; later for arbitrary wrapped RN inputs.

### `scroll`
- Input schema: `{ id: string, direction?: "up" | "down" | "left" | "right", amount?: "small" | "page" | "end" | number, sessionId?: string }`
- Output schema: `{ ok: boolean, id: string, offset?: RectPoint, visibleRange?: VisibleRange, events: SemanticEvent[] }`
- Required runtime support: semantic scroll container wrapper, ref-based scroll dispatch, visible range tracking.
- Failure modes: `NODE_NOT_FOUND`, `NOT_SCROLL_CONTAINER`, `SCROLL_REF_UNAVAILABLE`, `DIRECTION_UNSUPPORTED`.
- v0 or later: later unless the first component layer includes a stable `Scroll` primitive.

### `navigate`
- Input schema: `{ sessionId?: string, screen?: string, route?: string, params?: Record<string, unknown>, replace?: boolean }`
- Output schema: `{ ok: boolean, currentScreen: string, route?: string, revision: number, events: SemanticEvent[] }`
- Required runtime support: navigation adapter for Expo Router or React Navigation, route redaction, route availability query.
- Failure modes: `NAVIGATION_UNAVAILABLE`, `ROUTE_NOT_FOUND`, `PARAMS_INVALID`, `NAVIGATION_REJECTED`.
- v0 or later: later, unless scoped to an explicit example-app adapter.

### `runFlow`
- Input schema: `{ name?: string, steps?: FlowStep[], sessionId?: string, stopOnFailure?: boolean, timeoutMs?: number }`
- Output schema: `{ ok: boolean, flow: string, steps: FlowStepResult[], finalTreeRevision: number }`
- Required runtime support: flow schema, sequential tool executor, wait/assert primitives, event capture.
- Failure modes: `FLOW_NOT_FOUND`, `STEP_FAILED`, `ASSERTION_FAILED`, `TIMEOUT`, `UNSUPPORTED_STEP`.
- v0 or later: later. Define schema early but do not expose as stable until core actions are proven.

### `observeEvents`
- Input schema: `{ sessionId?: string, since?: number, types?: SemanticEventType[], limit?: number, waitMs?: number }`
- Output schema: `{ ok: boolean, events: SemanticEvent[], nextCursor: number }`
- Required runtime support: bounded event ring buffer, monotonic event cursor, event redaction.
- Failure modes: `NO_ACTIVE_SESSION`, `CURSOR_EXPIRED`, `EVENT_BUFFER_EMPTY`.
- v0 or later: v0.

### `waitFor`
- Input schema: `{ sessionId?: string, id?: string, condition: WaitCondition, timeoutMs?: number, pollMs?: number }`
- Output schema: `{ ok: boolean, matched: boolean, node?: SemanticNodeState, revision: number, elapsedMs: number }`
- Required runtime support: tree snapshots, event-driven or polling wait loop, stable condition evaluator.
- Failure modes: `TIMEOUT`, `INVALID_CONDITION`, `SESSION_DISCONNECTED`, `NODE_NOT_FOUND`.
- v0 or later: v0.

## Transport Options Matrix

| Transport option | How it works | Managed workflow compatibility | Bare workflow compatibility | iOS support | Android support | Web support | Reliability | Security risk | Implementation complexity | Recommendation |
|---|---|---|---|---|---|---|---|---|---|---|
| WebSocket from app to local server | App opens `ws://<host>:<port>` to the Agent UI bridge; bridge forwards calls/events between MCP server and runtime | Good; no native module needed if app can reach host | Good | Good for simulator and physical device if host networking is configured | Good for emulator and device if host networking is configured | Good | High in foreground dev sessions; needs reconnect/heartbeat | Medium; must bind localhost by default, use pairing token, and dev-only gate | Medium | Recommended v0 |
| HTTP polling | App polls server for commands and posts snapshots/events | Good | Good | Good | Good | Good | Moderate; more latency and wasted work | Medium; easier request logging but same local exposure risk | Low to medium | Acceptable fallback, not primary |
| Server-Sent Events | Server streams commands/events over HTTP; app posts command results separately | Good for web; React Native support is less standard than WebSocket | Good with polyfills if needed | Mixed | Mixed | Good | Moderate | Medium | Medium | Not v0 primary |
| Metro middleware | Add an endpoint to the Expo/Metro dev server for commands or snapshots | Unclear for package consumers; Expo local MCP already integrates with `expo start` using `EXPO_UNSTABLE_MCP_SERVER=1` | Possible but coupled to dev server internals | Good when Metro is present | Good when Metro is present | Good | Tied to dev server lifecycle | Medium | Medium to high | Later interop option, not v0 core |
| React Native DevTools hook | Piggyback on RN DevTools/React DevTools debugging connection | No public stable app-control contract for Agent UI needs | Same | DevTools supports Hermes apps, but disconnects when app/server/device lifecycle changes | Same | N/A | Unfit as product API; good diagnostics UI only | Medium | High | Do not use as control transport |
| Expo module / native bridge | Native module exposes direct socket/device integration or native automation | Requires config plugin/prebuild/development build if native code is added | Good after native setup | Good | Good | No | High after install | Medium to high; native attack surface and setup burden | High | Avoid for v0 unless WebSocket cannot meet requirements |
| Simulator automation | Use platform automation, screenshots, coordinates, or accessibility/testID lookup | Usually requires simulator/emulator tooling and local setup | Same | Expo MCP iOS local capability is macOS simulator only | Better Android host flexibility, but still external automation | No | Useful for visual verification, brittle for semantic actions | Medium | High | Interoperate with Expo MCP; do not make primary |
| Direct JS bridge for tests | Test harness imports runtime and calls registry/action APIs in-process | Good for unit/integration tests | Good | N/A | N/A | Good | Very high in tests | Low | Low | Use for tests, not live agent host |

## Session And Device Model

The local bridge server should be session-first. When an app runtime starts with agent control enabled, it opens a WebSocket to the bridge and sends a `hello` message:

```json
{
  "protocol": "agent-ui-bridge",
  "version": 1,
  "appId": "com.example.app",
  "appName": "Example",
  "platform": "ios",
  "runtime": "expo",
  "device": {
    "kind": "simulator",
    "name": "iPhone 16 Pro",
    "osVersion": "26.0"
  },
  "capabilities": ["semanticTree", "press", "input", "events"],
  "pairingToken": "<redacted>"
}
```

The server assigns or confirms a `sessionId`, records the remote address, current route/screen if available, app build/runtime metadata, and starts a heartbeat. The app sends incremental semantic-tree updates with a monotonically increasing `revision`. MCP tools default to the active session only when exactly one compatible app session is connected; otherwise they return `MULTIPLE_SESSIONS` with session candidates.

Device identification should be descriptive, not trusted identity. Use fields such as platform, device name, simulator/emulator/physical classification when known, Expo project id when available, app id, and bridge session id. Do not assume Expo MCP's local device model; Agent UI should be able to run without Expo MCP.

Reconnect should preserve the logical session if the same app instance reconnects quickly with the previous session token. After a reconnect, the server must require a full semantic-tree snapshot before accepting mutating tools. If the app reloads through Fast Refresh or hot reload, the runtime should increment an epoch, clear stale node handles, rebuild the tree, and emit `TREE_RESET` followed by a fresh snapshot.

Stale IDs should be handled at the semantic layer. If an action targets a node id that is not mounted in the latest revision, return `STALE_NODE_ID` or `NODE_NOT_FOUND` with candidates based on label, role, intent, and nearby id prefixes. Do not fall back to coordinates silently.

Multiple app sessions should be supported from the bridge design even if v0 defaults to one active session. The server should expose `agent-ui://sessions` or include session lists in diagnostics, require `sessionId` when more than one app matches, and isolate event buffers per session.

## V0 Architecture Recommendation

Build three pieces:

1. In-app runtime bridge in `packages/core`: a development-only `AgentUIProvider` option such as `agentBridge={{ enabled: __DEV__, url, token }}`. It connects via WebSocket, registers semantic nodes, sends full snapshots on connect/reload, sends deltas/events after updates, and receives command messages for supported actions.
2. Local bridge/MCP process in `packages/mcp-server`: a Node CLI that starts an MCP stdio server and a localhost WebSocket listener. MCP client traffic arrives over stdio; app sessions connect over WebSocket. The process translates MCP tool calls into bridge commands and returns structured MCP results.
3. Diagnostics and security defaults: bind to `127.0.0.1` by default, require an ephemeral pairing token displayed by the CLI or stored in a local dev-only config, redact secure field values, reject control when `__DEV__` is false unless explicitly overridden, and expose a `doctor` command through the CLI.

Do not require a custom Expo module for v0. Do not depend on Expo MCP for semantic control. Do not integrate with React Native DevTools internals as a command channel. Add Expo MCP interop documentation that recommends using Expo MCP for docs, EAS workflows, logs, screenshots, and simulator fallback checks.

## Open Questions And Blockers

- [ ] Exact host discovery UX for physical devices on Wi-Fi: manual URL, QR code, Expo Constants host inference, or CLI-generated config.
- [ ] Whether to publish MCP as `@agent-ui/mcp-server`, `@agent-ui/expo-mcp`, or as a subcommand of `@agent-ui/cli`.
- [ ] Whether v0 should include `scroll` if the first primitive set includes a semantic scroll wrapper.
- [ ] How much route metadata can be collected from Expo Router without taking a hard dependency.
- [ ] How to expose app sessions to MCP clients: tool-only diagnostics, MCP resources, or both.
- [ ] Final redaction policy for semantic state values, especially secure text fields, tokens, personal data, and app business state.
- [ ] Whether bridge WebSocket should accept LAN connections by default for physical devices or require an explicit `--host lan` flag.
- [ ] Whether the package should support production-like internal testing builds with agent control, and what explicit opt-in is required.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Using Model Context Protocol (MCP) with Expo | https://docs.expo.dev/eas/ai/mcp/ | 2026-04-27 | Expo MCP requires an EAS paid plan; remote server URL/auth model; local capabilities require SDK 54+, `expo-mcp`, `EXPO_UNSTABLE_MCP_SERVER=1 npx expo start`; capabilities include docs, dependencies, EAS workflows/builds, screenshots, testID/coordinate tap, view find, DevTools, logs, router sitemap; limitations include one dev-server connection, iOS simulator only, and macOS host requirement for iOS local capabilities. |
| MCP TypeScript SDK docs | https://ts.sdk.modelcontextprotocol.io/ | 2026-04-27 | v1 SDK installation, Zod peer dependency, `McpServer`, stdio and Streamable HTTP support, tools/resources/prompts concepts, examples, and client/server capabilities. |
| MCP TypeScript SDK GitHub README | https://github.com/modelcontextprotocol/typescript-sdk | 2026-04-27 | `main` branch is v2 pre-alpha; v1.x remains recommended for production; split v2 packages exist; minimal server example with `McpServer`, `registerTool`, and `StdioServerTransport`. |
| MCP Transports specification 2025-06-18 | https://modelcontextprotocol.io/specification/2025-06-18/basic/transports | 2026-04-27 | MCP uses JSON-RPC UTF-8 messages; standard transports are stdio and Streamable HTTP; stdio rules for stdin/stdout/stderr; stdout must contain only valid MCP messages. |
| MCP Tools specification 2025-06-18 | https://modelcontextprotocol.io/specification/2025-06-18/server/tools | 2026-04-27 | Tool discovery/calls, tool metadata, `inputSchema`, optional `outputSchema`, `structuredContent`, list-changed notification, and protocol versus execution error distinction. |
| MCP Resources specification 2025-06-18 | https://modelcontextprotocol.io/specification/2025-06-18/server/resources | 2026-04-27 | Resources are URI-identified context exposed by servers and are application-driven. |
| MCP Prompts specification 2025-06-18 | https://modelcontextprotocol.io/specification/2025-06-18/server/prompts | 2026-04-27 | Prompts are user-controlled templates that clients can list and retrieve. |
| npm metadata for `@modelcontextprotocol/sdk` | https://www.npmjs.com/package/%40modelcontextprotocol/sdk | 2026-04-27 | Local `npm view` reported version `1.29.0`, latest dist-tag `1.29.0`, and peer dependencies on `@cfworker/json-schema` and `zod`. |
| npm metadata for `@modelcontextprotocol/server` | https://www.npmjs.com/package/%40modelcontextprotocol/server | 2026-04-27 | Local `npm view` reported version `2.0.0-alpha.2`, latest and alpha dist-tags, confirming split server package is alpha as of access date. |
| npm metadata for `expo-mcp` | https://www.npmjs.com/package/expo-mcp | 2026-04-27 | Local `npm view` reported version `0.2.4`, description "Local MCP capabilities provider for Expo", and dependencies including `ws`, `zod`, `@expo/mcp-tunnel`, and `@modelcontextprotocol/sdk`. |
| Development and production modes - Expo | https://docs.expo.dev/workflow/development-mode/ | 2026-04-27 | `npx expo start` runs local projects in development mode by default; production-like mode uses `npx expo start --no-dev --minify`; development mode includes warnings and debugging tools. |
| Introduction to development builds - Expo | https://docs.expo.dev/develop/development-builds/introduction/ | 2026-04-27 | Expo development builds include `expo-dev-client`; `npx expo start` serves the JavaScript bundle containing UI code and business logic. |
| React Native DevTools 0.84 | https://reactnative.dev/docs/0.84/react-native-devtools | 2026-04-27 | RN DevTools is a debugging experience for Hermes apps, not a native tooling replacement; it can disconnect when app/server/device lifecycle changes; Components panel can inspect props/state but this is not documented as a stable automation protocol. |
| React Native WebSocket global | https://reactnative.dev/docs/global-WebSocket | 2026-04-27 | React Native provides a global `WebSocket` class aligned with web specifications, supporting the feasibility of a JS WebSocket bridge. |

## Final Recommendation

Stage 4 should implement the local Agent Tool Bridge as a development-only WebSocket bridge from the running Expo app to a local Node process. The first stable runtime capabilities should be semantic inspection, state lookup, press action dispatch, text input dispatch, event observation, and wait conditions. Every mutating command must target semantic IDs and return structured error codes with self-correction context.

Stage 5 should implement the MCP server as a stdio-launched Node CLI using `@modelcontextprotocol/sdk` v1.x, Zod schemas, and JSON-compatible structured outputs. It should expose only tools backed by runtime capabilities, plus read-only resources for sessions, semantic tree, screens, flows, and diagnostics. Expo MCP should remain an interop path for official Expo docs, EAS operations, DevTools, logs, screenshots, and simulator fallback automation, not a dependency for Agent UI semantic control.

DONE_WITH_CONCERNS
