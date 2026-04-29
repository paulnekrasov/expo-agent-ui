# Agent Bridge, MCP, And Runtime Transport Research

## Executive Summary

- Agent UI should provide its own local MCP stdio server for semantic control. Expo MCP is valuable interop, but it is a paid remote MCP service with optional local capabilities centered on Expo project operations, screenshots, `testID`, coordinates, logs, DevTools, and simulator workflows.
- Agent UI should interoperate with Expo MCP for official Expo documentation lookup, compatible `expo install` dependency guidance, EAS workflows/builds, TestFlight diagnostics, Expo Router sitemap inspection, logs, DevTools, screenshots, and simulator fallback checks.
- Agent UI's unique capability is a live semantic runtime: stable semantic IDs, roles, labels, state, values, actions, route/screen context, tree revisions, event history, and structured action dispatch without relying on screenshots as the primary interface.
- The v0 app-to-server bridge should be a development-only outbound WebSocket from the running Expo app to a local Agent UI process. React Native exposes a global `WebSocket`, so this path works from JavaScript in managed and bare workflows without a native module.
- The MCP-facing transport should be stdio. MCP clients commonly spawn local servers, the spec requires stdout to contain only MCP JSON-RPC messages, and all Agent UI process logs must go to stderr or a diagnostics resource.
- Use `@modelcontextprotocol/sdk` v1.x for v0. On 2026-04-29, `npm view @modelcontextprotocol/sdk` reports `1.29.0` as `latest`, Node `>=18`, ESM/CJS exports, and Zod-compatible schema support. The split `@modelcontextprotocol/server` package is `2.0.0-alpha.2` and requires Node `>=20`, so it should not anchor v0 production work.
- MCP tools should provide `inputSchema`, use `outputSchema` where structured output is stable, return `structuredContent` plus text content for compatibility, and use tool execution errors with `isError: true` for semantic runtime failures such as `NODE_NOT_FOUND`, `SESSION_NOT_CONNECTED`, `STALE_NODE_ID`, and `UNSUPPORTED_ACTION`.
- Sessions must be explicit. Every app connection needs a session id, app identity, platform, device descriptor, runtime metadata, capability set, heartbeat timestamp, semantic-tree revision, event cursor, and reconnect epoch.
- Minimum v0 tool surface should be `inspectTree`, `getState`, `tap`, `input`, `observeEvents`, and `waitFor`. Keep `scroll`, `navigate`, and `runFlow` behind capability checks until the runtime has stable scroll wrappers, navigation adapters, and flow execution.
- No true research blockers remain. The remaining items are implementation constraints to resolve during Stage 4 and Stage 5 design and verification.

## Expo MCP Capability Map

| Capability | Expo MCP support | Requirements / limitations | Should Agent UI interoperate? | Should Agent UI implement separately? | Source URL |
|---|---|---|---|---|---|
| Official Expo documentation search/read/learn | Server tools include `search_documentation`, `read_documentation`, and `learn`. | Expo MCP Server requires an EAS paid plan and remote MCP support in the agent host. | Yes. Use Expo MCP when available for current Expo API facts. | Only for Agent UI's own local docs and resources. | https://docs.expo.dev/eas/ai/mcp/ |
| Compatible Expo dependency installation | Server tool `add_library` installs recommended Expo-compatible packages. | Requires authenticated Expo MCP access; Expo docs describe use of `npx expo install`. | Yes. Prefer Expo MCP for Expo package compatibility when available. | No. Agent UI should not duplicate Expo package compatibility logic. | https://docs.expo.dev/eas/ai/mcp/ |
| EAS workflows | Server tools cover workflow create, list, info, logs, run, cancel, and validate. | Requires EAS project/account context. | Yes. Keep build/workflow automation in Expo MCP. | No. | https://docs.expo.dev/eas/ai/mcp/ |
| EAS builds and submit | Server tools cover build list/info/logs/run/cancel/submit. | `build_run` requires a connected GitHub repository according to Expo docs. | Yes. Use Expo MCP for cloud build operations. | No. | https://docs.expo.dev/eas/ai/mcp/ |
| TestFlight crash and feedback data | Server tools include `testflight_crashes` and `testflight_feedback`. | Requires relevant iOS/TestFlight project access. | Yes. | No. | https://docs.expo.dev/eas/ai/mcp/ |
| Local capabilities setup | Expo docs require `expo-mcp`, SDK 54 or later, matching Expo login, and `EXPO_UNSTABLE_MCP_SERVER=1 npx expo start`. | Requires a running local Expo development server; agent hosts must reconnect/restart MCP after dev server start/stop. | Yes. Document side-by-side usage. | Agent UI should implement semantic bridge separately because Expo MCP local capability shape is not semantic-tree control. | https://docs.expo.dev/eas/ai/mcp/ |
| Expo Router sitemap | Local tool `expo_router_sitemap`. | Requires local capabilities and `expo-router`. | Yes, for route discovery when the app uses Expo Router. | Later as a semantic route adapter, not as a duplicate sitemap tool. | https://docs.expo.dev/eas/ai/mcp/ |
| React Native DevTools opening | Local tool `open_devtools`. | RN DevTools is for debugging React concerns and is not documented as a stable automation transport. | Yes, for diagnostics. | No. | https://docs.expo.dev/eas/ai/mcp/; https://reactnative.dev/docs/react-native-devtools |
| App/native/JS log collection | Local tool `collect_app_logs`. | Requires local capabilities and connected development environment. | Yes. | Only Agent UI-specific event logs and bridge diagnostics. | https://docs.expo.dev/eas/ai/mcp/ |
| Screenshot capture | Local tool `automation_take_screenshot` captures the full app or a view by `testID`. | Screenshot verification is visual and lower level than semantic runtime inspection. | Yes, for visual verification and fallback debugging. | Not as the primary Agent UI interface. | https://docs.expo.dev/eas/ai/mcp/ |
| Coordinate or `testID` tap | Local tool `automation_tap` accepts coordinates or `testID`. | Coordinate-first automation is brittle; `testID` is lower-level than semantic id/role/intent. | Yes, as an escape hatch. | Yes. Agent UI should implement semantic `tap` through runtime action dispatch. | https://docs.expo.dev/eas/ai/mcp/ |
| View lookup by `testID` | Local tool `automation_find_view` dumps view properties by `testID`. | Useful for platform diagnostics but not a semantic tree. | Yes, for diagnostics. | Yes. Agent UI should implement semantic queries by id, role, label, intent, screen, state, and capability. | https://docs.expo.dev/eas/ai/mcp/ |
| Single development server limitation | Expo MCP docs state current local capabilities support only one development server connection at a time. | Limits multi-app or multi-preview workflows. | Yes, when using Expo MCP. | Yes. Agent UI bridge should support multiple app sessions by design. | https://docs.expo.dev/eas/ai/mcp/ |
| iOS local capability constraints | Expo MCP local iOS support is simulator-only and macOS-host-only; physical iOS devices are not yet supported. | Not suitable as the only Agent UI control path. | Yes, when a macOS iOS simulator is available. | Yes. Agent UI's JS WebSocket bridge should work anywhere the app can reach the local server. | https://docs.expo.dev/eas/ai/mcp/ |
| Android local capability path | Expo MCP lists local automation and does not apply the macOS-only limitation to Android. | Still requires Expo MCP local setup and a dev server. | Yes. | Yes. Semantic control should not depend on simulator automation. | https://docs.expo.dev/eas/ai/mcp/ |

## MCP TypeScript SDK Findings

- Package name: use `@modelcontextprotocol/sdk` for v0. Local npm metadata on 2026-04-29 reports version `1.29.0`, `latest` dist-tag `1.29.0`, Node engine `>=18`, package `type: module`, ESM and CJS exports, peer dependencies on `@cfworker/json-schema` and `zod`, and dependencies that include Streamable HTTP server helpers.
- Version posture: the SDK GitHub `main` README says v2 is still in development/pre-alpha and that v1.x remains recommended for production. Local npm metadata reports `@modelcontextprotocol/server@2.0.0-alpha.2` with Node `>=20`, so Agent UI should avoid the split v2 packages for v0 unless the ecosystem stabilizes before implementation starts.
- Server setup: v1 documentation creates servers with `McpServer`, registers tools/resources/prompts on that server, creates a transport such as `StdioServerTransport`, and connects the server to the transport.
- Tool registration: v1 documentation uses `registerTool` with metadata such as title, description, input schema, and output schema, and a handler that returns MCP content. The latest MCP tools spec requires unique tool names, human-readable descriptions, valid JSON Schema input schemas, optional output schemas, and model-controlled invocation semantics.
- Schema validation: v1 SDK docs require Zod as a peer dependency, import internally from `zod/v4`, and remain compatible with projects on Zod v3.25 or later. Agent UI should keep tool schemas as source-of-truth runtime schemas and export MCP JSON Schema through the SDK path.
- stdio transport: the latest MCP transport spec defines stdio as a client-spawned subprocess reading JSON-RPC from stdin and writing JSON-RPC to stdout. It allows logging on stderr and forbids non-MCP output on stdout. This matches local agent hosts and keeps Agent UI's MCP surface free from HTTP auth complexity in v0.
- Resources: MCP resources are URI-identified, application-driven context. Agent UI should expose read-only resources such as `agent-ui://sessions`, `agent-ui://semantic-tree`, `agent-ui://screens`, `agent-ui://flows`, `agent-ui://diagnostics`, `agent-ui://project-brief`, `agent-ui://reference-index`, `agent-ui://active-task`, `agent-ui://validation-rules`, and `agent-ui://handoff`.
- Prompts: MCP prompts are user-controlled templates discoverable by clients. Agent UI should expose prompts only when their backing skill docs exist, starting with `build_screen`, `debug_flow`, `improve_semantics`, `patch_screen`, `plan_task`, `review_stage`, and `resume_handoff`.
- Error handling: the MCP tools spec distinguishes protocol errors from tool execution errors. Agent UI should reserve JSON-RPC protocol errors for malformed MCP requests and unknown tools; semantic/runtime failures should return tool results with `isError: true`, a stable error code, a human-readable message, and candidates or remediation context when available.
- Structured outputs: the latest tools spec supports `structuredContent` and optional `outputSchema`. Agent UI should return structured JSON for agents and include serialized text content for backward compatibility.
- npx packaging: `packages/mcp-server` should publish a Node CLI with a `bin` entry, ESM build output, Node `>=18`, no stdout logging, and launch compatibility through commands such as `npx -y @agent-ui/mcp-server`. If a root CLI package is added later, it can wrap the same server binary as a subcommand.
- Source URLs: SDK v1 docs at https://ts.sdk.modelcontextprotocol.io/ and https://ts.sdk.modelcontextprotocol.io/documents/server.html; SDK source README at https://github.com/modelcontextprotocol/typescript-sdk; package metadata at https://www.npmjs.com/package/%40modelcontextprotocol/sdk and https://www.npmjs.com/package/%40modelcontextprotocol/server.

## Proposed Agent UI Tool Surface

Runtime-control tools are separate from platform-skill context tools. The tools in this section
operate against a connected app session and require implemented runtime capabilities.

| Tool | Input schema | Output schema | Required runtime support | Failure modes | V0 or later |
|---|---|---|---|---|---|
| `inspectTree` | Fields: optional `sessionId`, `screen`, `rootId`, `includeHidden`, `includeBounds`, `maxDepth`. | Fields: `ok`, `sessionId`, `revision`, `tree`, `capabilities`, `warnings`. | Semantic registry, parent-child relationships, mounted state, visibility, action metadata, revision counter. | `NO_ACTIVE_SESSION`, `SESSION_NOT_FOUND`, `TREE_UNAVAILABLE`, `MAX_DEPTH_EXCEEDED`. | v0 |
| `getState` | Fields: required `id`; optional `sessionId`, `includeChildren`. | Fields: `ok`, `node`, `revision`, optional `candidates`, optional `redactions`. | Stable semantic ID lookup, state snapshot, value redaction, duplicate-id detection. | `NODE_NOT_FOUND`, `DUPLICATE_NODE_ID`, `SENSITIVE_VALUE_REDACTED`, `SESSION_NOT_CONNECTED`. | v0 |
| `tap` | Fields: required `id`; optional `sessionId`, `action`, `timeoutMs`, `expectedRevision`. | Fields: `ok`, `id`, `actionResult`, `revisionBefore`, optional `revisionAfter`, `events`. | Mounted node action table, enabled/disabled state, press dispatch, event capture. | `NODE_NOT_FOUND`, `NODE_DISABLED`, `ACTION_NOT_SUPPORTED`, `ACTION_FAILED`, `STALE_NODE_ID`. | v0 for press-capable Agent UI controls |
| `input` | Fields: required `id`, `value`; optional `sessionId`, `submit`, `timeoutMs`, `expectedRevision`. | Fields: `ok`, `id`, `valueState`, `events`, optional `redactions`. | Text input registration, value observation, change-text dispatch, secure-field redaction. | `NODE_NOT_FOUND`, `NOT_INPUT_NODE`, `INPUT_REJECTED`, `SECURE_VALUE_WRITE_ONLY`, `ACTION_FAILED`. | v0 for Agent UI text fields; later for arbitrary wrapped RN inputs |
| `scroll` | Fields: required `id`; optional `sessionId`, `direction`, `amount`, `targetId`, `timeoutMs`. | Fields: `ok`, `id`, optional `offset`, optional `visibleRange`, `events`. | Semantic scroll container wrapper, ref-based scroll dispatch, visible range tracking. | `NODE_NOT_FOUND`, `NOT_SCROLL_CONTAINER`, `SCROLL_REF_UNAVAILABLE`, `DIRECTION_UNSUPPORTED`. | Later unless the first primitive layer ships a stable `Scroll` wrapper |
| `navigate` | Fields: optional `sessionId`, `screen`, `route`, `params`, `replace`, `timeoutMs`. | Fields: `ok`, `currentScreen`, optional `route`, `revision`, `events`. | Expo Router or React Navigation adapter, available-route query, route/param redaction. | `NAVIGATION_UNAVAILABLE`, `ROUTE_NOT_FOUND`, `PARAMS_INVALID`, `NAVIGATION_REJECTED`. | Later unless scoped to an explicit example-app adapter |
| `runFlow` | Fields: optional `sessionId`, `name`, `steps`, `stopOnFailure`, `timeoutMs`. | Fields: `ok`, `flow`, `steps`, `finalTreeRevision`, `events`. | Flow schema, sequential executor, wait/assert primitives, event capture, failure reporting. | `FLOW_NOT_FOUND`, `STEP_FAILED`, `ASSERTION_FAILED`, `TIMEOUT`, `UNSUPPORTED_STEP`. | Later; define schema before exposing as stable |
| `observeEvents` | Fields: optional `sessionId`, `since`, `types`, `limit`, `waitMs`. | Fields: `ok`, `events`, `nextCursor`, optional `droppedCount`. | Bounded event ring buffer, monotonic cursor, per-session event isolation, redaction. | `NO_ACTIVE_SESSION`, `CURSOR_EXPIRED`, `EVENT_BUFFER_EMPTY`, `SESSION_DISCONNECTED`. | v0 |
| `waitFor` | Fields: required `condition`; optional `sessionId`, `id`, `timeoutMs`, `pollMs`, `sinceRevision`. | Fields: `ok`, `matched`, optional `node`, `revision`, `elapsedMs`, optional `events`. | Tree snapshots, event-driven or polling wait loop, stable condition evaluator. | `TIMEOUT`, `INVALID_CONDITION`, `SESSION_DISCONNECTED`, `NODE_NOT_FOUND`. | v0 |

## Platform Skill Context Surface

The MCP server may also expose repo-local platform skills as read-only agent context. This surface
does not require an app session and must not mutate app state. It is specified in
`docs/reference/agent/platform-skill-mcp-surface.md`.

Initial resources:

- `agent-ui://platform-skills/index`
- `agent-ui://platform-skills/routing`
- `agent-ui://platform-skills/expo`
- `agent-ui://platform-skills/react-native`
- `agent-ui://platform-skills/composition`
- `agent-ui://platform-skills/native-accessibility`
- `agent-ui://platform-skills/native-design`
- `agent-ui://platform-skills/android`
- `agent-ui://platform-skills/apple`
- `agent-ui://platform-skills/context-prompt-engineering`

Initial prompts:

- `choose_platform_skills`
- `plan_native_scaffold`
- `review_accessibility_semantics`
- `prepare_visual_editor_notes`
- `write_agent_task_notes`

Initial read-only tools:

- `listPlatformSkills`
- `getPlatformSkill`
- `searchPlatformSkills`
- `recommendPlatformSkills`

Implementation rule: skill-context resources/tools can launch before an app bridge is connected,
but mutating runtime-control tools must still require an active, paired, development-only app
session with implemented capabilities.

## Transport Options Matrix

| Transport option | How it works | Managed workflow compatibility | Bare workflow compatibility | iOS support | Android support | Web support | Reliability | Security risk | Implementation complexity | Recommendation |
|---|---|---|---|---|---|---|---|---|---|---|
| WebSocket from app to local server | App opens an outbound WebSocket to the Agent UI process; the process routes MCP tool calls to app sessions and receives snapshots/events. | Good; pure JS setup if host networking is reachable. | Good. | Good for simulator and physical devices that can reach the host. | Good for emulator and physical devices that can reach the host. | Good. | High for foreground dev sessions; needs heartbeat and reconnect. | Medium; require dev-only gate, token, localhost default, explicit LAN mode. | Medium. | Recommended v0 app bridge. |
| HTTP polling | App polls the local process for commands and posts snapshots/events. | Good. | Good. | Good. | Good. | Good. | Moderate; higher latency and extra polling work. | Medium; same local exposure concerns as WebSocket. | Low to medium. | Keep as fallback if WebSocket is blocked. |
| Server-Sent Events | Server streams commands/events over HTTP; app posts results separately. | Mixed; RN support is less direct than WebSocket. | Mixed. | Mixed. | Mixed. | Good. | Moderate; reconnect rules are manageable but split command/result channels add complexity. | Medium. | Medium. | Not v0 primary. |
| Metro or Expo dev-server middleware | Adds Agent UI endpoints to the development server or routes through Expo MCP-style local capabilities. | Unclear for package consumers; coupled to dev-server lifecycle. | Possible but coupled. | Good when Metro is present. | Good when Metro is present. | Good. | Tied to `expo start` and server restarts. | Medium. | Medium to high. | Later interop path, not v0 core. |
| React Native DevTools hook | Uses DevTools/React inspection internals as a control path. | Poor as product API. | Poor as product API. | DevTools supports Hermes apps but disconnects on app/server/device lifecycle changes. | Same. | Not relevant. | Unfit for stable control; useful for diagnostics. | Medium. | High. | Do not use as control transport. |
| Expo module or native bridge | Native code provides bridge, socket, or automation integration. | Requires config plugin, prebuild, or development build when native code is added. | Good after native setup. | Good. | Good. | No. | High after install. | Medium to high because it expands native attack/setup surface. | High. | Avoid for v0 unless JS bridge fails a proven requirement. |
| Simulator automation | Uses platform automation, screenshots, coordinates, accessibility, or `testID` lookup. | Requires simulator/emulator tooling and local setup. | Same. | Expo MCP local iOS support is macOS simulator-only. | More flexible, but still external automation. | No. | Useful for visual verification, brittle as primary semantic control. | Medium. | High. | Interoperate with Expo MCP; do not make primary. |
| Direct JS bridge for tests | Test harness imports Agent UI runtime and calls registry/action APIs in process. | Good for tests. | Good for tests. | Not a live-device transport. | Not a live-device transport. | Good. | Very high in tests. | Low. | Low. | Use for unit and integration tests, not live agent hosts. |

## Session And Device Model

The local Agent UI process should start the MCP stdio server and the app WebSocket listener in one process for v0. The process should print human-facing diagnostics to stderr and expose machine-readable diagnostics through resources and tools, because stdout is reserved for MCP JSON-RPC frames.

App session discovery should be explicit. The CLI starts a local listener, creates an ephemeral pairing token, and provides configuration through a development-only provider option, environment variable, QR/deep link, or generated local config. The running app connects outbound and sends a hello envelope containing protocol version, app id/name, platform, runtime, device descriptor, capability set, previous session token when reconnecting, current route/screen when known, and the pairing token. The token value must never be printed by tools after setup.

Device identification is descriptive, not trusted identity. Store platform, simulator/emulator/physical classification when known, device name when available, OS version when available, Expo project id when available, app id, runtime kind, remote address, and the assigned bridge session id. Do not rely on Expo MCP's local device model for semantic control.

Reconnect should preserve logical continuity when the same app instance reconnects quickly with a valid previous session token. After reconnect, the server must require a full semantic-tree snapshot before accepting mutating tools. Heartbeats should mark stale sessions, and mutating tools should fail with `SESSION_DISCONNECTED` if a heartbeat expires.

Fast Refresh, hot reload, and native rebuilds should increment a runtime epoch. The app should clear stale node handles, emit a tree reset event, send a new full snapshot, and resume deltas only after the full snapshot is acknowledged. Tool calls may include an expected revision or epoch to catch stale agent plans.

Stale semantic IDs are handled at the runtime layer. If a node id is not mounted in the latest tree, the tool must return `STALE_NODE_ID` or `NODE_NOT_FOUND` and provide candidates based on id prefix, label, role, intent, screen, and recently unmounted nodes when safe. It must not silently fall back to coordinates.

Multiple app sessions should be supported from the bridge design even if the v0 UX defaults to one active app. When exactly one compatible session is connected, tools may default to it. When multiple sessions match, tools must return `MULTIPLE_SESSIONS` with redacted candidates and require `sessionId`. Event buffers, semantic revisions, capabilities, and pairing state are isolated per session.

## V0 Architecture Recommendation

Build the Stage 4 bridge around three pieces.

First, add a development-only in-app bridge in the core runtime. `AgentUIProvider` should accept bridge configuration only when agent control is enabled for development. It connects with WebSocket, authenticates with a pairing token, sends a full semantic-tree snapshot on connect/reload, sends deltas and semantic events after updates, and receives commands only for capabilities registered by mounted nodes.

Second, add `packages/mcp-server` as a Node CLI. The same process starts an MCP stdio server and a local WebSocket listener. MCP tool calls are translated into bridge commands addressed to a specific app session. App responses become MCP results with structured output, stable error codes, and text fallback content.

Third, implement diagnostics and safety defaults from the start. Bind local MCP/HTTP surfaces to `127.0.0.1` by default, require explicit LAN mode for physical devices, require a pairing token for app sessions, redact secure values, reject mutating control when `__DEV__` is false unless a later internal-testing mode explicitly opts in, and expose session/bridge state through read-only diagnostics resources.

Do not require a custom Expo module for v0. Do not depend on Expo MCP for semantic control. Do not use React Native DevTools internals as the command channel. Do document Expo MCP as an interop companion for official docs, EAS operations, logs, DevTools, screenshots, and simulator fallback automation.

## Open Questions And Blockers

- [x] Research blocker review: no unresolved research blockers remain for Stage 4/Stage 5 planning.
- [ ] Implementation constraint: choose the physical-device host discovery UX, such as manual URL, QR/deep link, Expo host inference, generated config, or a combination.
- [ ] Implementation constraint: choose package naming, either a standalone `@agent-ui/mcp-server` package, a root CLI subcommand, or both.
- [ ] Implementation constraint: decide whether `scroll` enters v0 based on whether Stage 2 ships a stable semantic scroll wrapper.
- [ ] Implementation constraint: define how much Expo Router metadata can be collected without making Expo Router a hard dependency.
- [ ] Implementation constraint: choose whether sessions are primarily exposed through `agent-ui://sessions`, a diagnostics tool, or both.
- [ ] Implementation constraint: finalize the redaction policy for secure fields, tokens, personal data, business data, route params, logs, and event payloads.
- [ ] Implementation constraint: decide whether bridge WebSocket accepts LAN connections by default or only with an explicit `--host lan`/equivalent opt-in.
- [ ] Implementation constraint: decide whether internal production-like builds can opt into agent control and, if so, what build flag and consent model are required.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Using Model Context Protocol (MCP) with Expo | https://docs.expo.dev/eas/ai/mcp/ | 2026-04-29 | Expo MCP paid-plan requirement; remote Streamable HTTP/OAuth setup; local `expo-mcp` setup; SDK 54 local capability floor; server and local tool lists; screenshots, `testID` and coordinate automation; DevTools/logs/router sitemap; one-dev-server, iOS simulator-only, and macOS-host iOS limitations; page last updated 2026-04-28. |
| Expo MCP docs source | https://raw.githubusercontent.com/expo/expo/main/docs/pages/eas/ai/mcp.mdx | 2026-04-29 | Source confirmation for paid-plan requirement, local capabilities setup, server/local capability split, and current limitations. |
| MCP Specification latest overview | https://modelcontextprotocol.io/specification/latest | 2026-04-29 | Latest MCP spec version is 2025-11-25; MCP uses JSON-RPC 2.0; core server features are resources, prompts, and tools; security principles require consent, control, privacy, and tool safety. |
| MCP Transports specification 2025-11-25 | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | 2026-04-29 | stdio and Streamable HTTP are standard transports; stdio subprocess/stdin/stdout/stderr rules; stdout must contain only MCP messages; Streamable HTTP origin validation, localhost binding, authentication, session id, and protocol-version guidance. |
| MCP Tools specification 2025-11-25 | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | 2026-04-29 | Tool metadata and naming; `inputSchema`, optional `outputSchema`, `structuredContent`, resource links, protocol errors versus tool execution errors, and `isError: true` guidance. |
| MCP Resources specification 2025-11-25 | https://modelcontextprotocol.io/specification/2025-11-25/server/resources | 2026-04-29 | Resources are URI-identified application-driven context; resource capabilities, listing, reading, templates, subscriptions, annotations, and URI scheme support. |
| MCP Prompts specification 2025-11-25 | https://modelcontextprotocol.io/specification/2025-11-25/server/prompts | 2026-04-29 | Prompts are user-controlled templates; prompt capabilities, listing/getting prompts, arguments, messages, and list-change notifications. |
| MCP TypeScript SDK v1 docs | https://ts.sdk.modelcontextprotocol.io/ | 2026-04-29 | v1 install path, Zod peer dependency, server/client concepts, supported transports, tools/resources/prompts, client helpers, examples, and v1 documentation location. |
| MCP TypeScript SDK server docs | https://ts.sdk.modelcontextprotocol.io/documents/server.html | 2026-04-29 | v1 `McpServer`, `StdioServerTransport`, `registerTool`, structured output, `isError`, `registerResource`, `registerPrompt`, tool/resource/prompt list-change notifications, DNS rebinding and localhost host validation guidance. |
| MCP TypeScript SDK GitHub README | https://github.com/modelcontextprotocol/typescript-sdk | 2026-04-29 | Source repository identity; `main` branch v2 pre-alpha warning; v1.x production recommendation; split v2 package shape. |
| npm metadata for `@modelcontextprotocol/sdk` | https://www.npmjs.com/package/%40modelcontextprotocol/sdk | 2026-04-29 | Local `npm view` reported version `1.29.0`, latest dist-tag `1.29.0`, Node `>=18`, `type: module`, ESM/CJS exports, dependencies, and peer dependencies on `@cfworker/json-schema` and Zod. |
| npm metadata for `@modelcontextprotocol/server` | https://www.npmjs.com/package/%40modelcontextprotocol/server | 2026-04-29 | Local `npm view` reported version `2.0.0-alpha.2`, latest/alpha dist-tags, Node `>=20`, ESM-only exports, and alpha split-package status. |
| npm metadata for `expo-mcp` | https://www.npmjs.com/package/expo-mcp | 2026-04-29 | Local `npm view` reported `expo-mcp@0.2.4`, binary `expo-mcp`, description "Local MCP capabilities provider for Expo", and dependencies including `ws`, `zod`, `@expo/mcp-tunnel`, and `@modelcontextprotocol/sdk`. |
| React Native WebSocket global | https://reactnative.dev/docs/global-WebSocket | 2026-04-29 | React Native exposes a global `WebSocket` class aligned with web specifications, supporting a JS WebSocket bridge. |
| React Native DevTools | https://reactnative.dev/docs/react-native-devtools | 2026-04-29 | RN DevTools is a debugging experience for React concerns, not a replacement for native tools or a stable app-control transport; it can disconnect when app/server/device lifecycle changes. |
| Expo development and production modes | https://docs.expo.dev/workflow/development-mode/ | 2026-04-29 | `npx expo start` runs locally in development mode by default; production mode sets `__DEV__` false through `--no-dev --minify`; development mode provides warnings/debugging tools. |
| Expo development builds introduction | https://docs.expo.dev/develop/development-builds/introduction/ | 2026-04-29 | Development builds include `expo-dev-client`; the JavaScript bundle served by `npx expo start` contains UI code and business logic; development builds can switch between development servers. |

## Final Recommendation

Stage 4 should implement the Agent Tool Bridge as a development-only outbound WebSocket from the running Expo app to a local Agent UI process. The initial stable runtime capabilities should be semantic tree inspection, state lookup, press dispatch, text input dispatch, event observation, and wait conditions. Every mutating tool must target semantic IDs, check session/revision freshness, and return structured self-correction context instead of falling back to coordinates.

Stage 5 should implement the MCP server as a stdio-launched Node CLI using `@modelcontextprotocol/sdk` v1.x, runtime schemas, structured MCP outputs, read-only resources, and prompt templates only where backing docs exist. Expo MCP remains an interop surface for official Expo docs, EAS operations, DevTools, logs, screenshots, and simulator fallback automation; it is not a dependency for Agent UI semantic control.

DONE
