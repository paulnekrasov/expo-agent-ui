# MCP Configuration

Last updated: 2026-05-02
Applies to: @agent-ui/mcp-server v0.0.0

## How The MCP Server Works

The Agent UI MCP server is a local Node.js process that communicates over stdio with MCP-compatible agent hosts. It runs on the developer's machine — not in the cloud — and does not require a paid plan, authentication provider, or external service.

```text
Agent host (Claude Desktop, Codex, etc.)
  |
  | stdio (JSON-RPC 2.0 over stdin/stdout)
  |
  v
agent-ui-mcp process
  |
  | WebSocket listener (127.0.0.1:9721 by default)
  |
  v
Expo app (AgentUIProvider with agentControl enabled)
```

The stdio transport carries MCP messages between the host and the server. All MCP protocol output goes to stdout. All human-facing diagnostics go to stderr. This keeps the stdio channel MCP protocol-clean.

The WebSocket listener accepts connections from apps running in simulators, emulators, or physical devices that can reach the host. Each app connection is a session. The server bridges MCP tool calls to app sessions and returns structured results.

## CLI Flags

```
agent-ui-mcp [--skills-dir PATH] [--host HOST] [--port PORT] [--pairing-token TOKEN]
```

| Flag | Description | Default |
|---|---|---|
| `--skills-dir PATH` | Override the directory for platform skill files. Used when repo-local copies are in a custom location. | Bundled skills in `dist/skills/` |
| `--host HOST` | WebSocket listener host address. Use `127.0.0.1` for local-only access. Use `0.0.0.0` or a specific IP for LAN access (requires explicit opt-in). | `127.0.0.1` |
| `--port PORT` | WebSocket listener port. Must be an integer between 1 and 65535. | `9721` |
| `--pairing-token TOKEN` | Pre-shared pairing token that apps must present to connect. Use `auto` to generate a random token at startup. | Auto-generated random hex token |

## Claude Desktop Configuration

Add the following to your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": [
        "-y",
        "@agent-ui/mcp-server",
        "--host",
        "127.0.0.1",
        "--port",
        "9721"
      ]
    }
  }
}
```

For local development with the cloned repository, use the local workspace binary:

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "node",
      "args": [
        "./packages/mcp-server/dist/cli.js",
        "--skills-dir",
        "./docs/reference/agent/platform-skills",
        "--host",
        "127.0.0.1",
        "--port",
        "9721"
      ]
    }
  }
}
```

## Codex Configuration

Add the Agent UI MCP server to the Codex agent host configuration:

```yaml
mcp_servers:
  agent-ui:
    command: npx
    args:
      - -y
      - '@agent-ui/mcp-server'
      - '--host'
      - '127.0.0.1'
      - '--port'
      - '9721'
```

For workspace-local development:

```yaml
mcp_servers:
  agent-ui:
    command: node
    args:
      - ./packages/mcp-server/dist/cli.js
      - '--skills-dir'
      - ./docs/reference/agent/platform-skills
      - '--host'
      - '127.0.0.1'
      - '--port'
      - '9721'
```

## Generic MCP Host Configuration

Any MCP-compatible agent host that supports stdio subprocess spawning can use the following shape:

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": ["-y", "@agent-ui/mcp-server"],
      "env": {
        "AGENT_UI_PAIRING_TOKEN": "auto"
      }
    }
  }
}
```

Start the app with the matching pairing token.

## MCP Tool Authorization Model

The MCP server exposes 15 tools organized into three authorization tiers:

### Tier 1: Skill-Context Tools (Always Available)

No app session required. These tools read repo-local platform skill files and are strictly read-only.

| Tool | Purpose |
|---|---|
| `listPlatformSkills` | List all available platform skills with descriptions and resource URIs. |
| `getPlatformSkill` | Read a platform skill by name. Returns full SKILL.md content with truncation metadata. |
| `searchPlatformSkills` | Search platform skills by query terms. Returns ranked matches with scores and snippets. |
| `recommendPlatformSkills` | Recommend platform skills for a task using keyword matching with reasons and warnings. |

### Tier 2: Session-Independent Runtime Tools (Always Available)

No app session required. These tools return development-only metadata.

| Tool | Purpose |
|---|---|
| `proposePatch` | Create a structured source-code patch proposal. Proposals require manual review and are never auto-applied. |
| `compareNativePreviews` | Compare semantic trees across native preview sessions. Requires 2+ connected sessions for side-by-side comparison. |

### Tier 3: Runtime-Control Tools (Session + Pairing Required)

An active paired app session is required. These tools mutate app state through the agent bridge.

| Tool | Purpose | Session Required |
|---|---|---|
| `inspectTree` | Inspect the semantic tree of the connected app. Returns tree structure, revision, capabilities. | Yes |
| `getState` | Get semantic state of a node by stable id. Returns node metadata, candidates, redaction markers. | Yes |
| `tap` | Dispatch a tap action on a semantic node. Returns action result and structured error codes. | Yes |
| `observeEvents` | Retrieve bridge session events with cursor-based pagination and type filtering. | Yes |
| `waitFor` | Wait for semantic conditions (nodeExists, nodeVisible, nodeState, nodeAbsent) with timeout. | Yes |
| `scroll` | Scroll a semantic scroll container by direction, amount, or target-child. | Yes |
| `navigate` | Navigate to a screen or route. Supports screen name, route path, params, and replace. | Yes |
| `runFlow` | Execute a sequence of semantic flow steps. Returns flow results and failure diagnostics. | Yes |
| `input` | Set text value of a semantic input node. Redacts secure field values. | Yes |

### Authorization Rules

- Skill-context tools (Tier 1) and session-independent tools (Tier 2) function without an app bridge.
- Runtime-control tools (Tier 3) return `SESSION_NOT_CONNECTED` when no paired app session is active.
- The server requires a valid pairing token from the app before accepting any bridge connection.
- Tool schemas, names, and resource URIs are defined in the server source. App-provided semantic text does not define tool names or schemas.
- Mutating tool results include `isError: true` for runtime failures with stable error codes (`NODE_NOT_FOUND`, `NODE_DISABLED`, `SECURE_VALUE_WRITE_ONLY`, `STALE_NODE_ID`, etc.).

## Session Lifecycle

```text
1. STARTUP
   agent-ui-mcp starts
   |-- stdio transport connects to agent host
   |-- WebSocket listener binds to 127.0.0.1:9721
   |-- pairing token printed to stderr
   |-- platform skills loaded from dist/skills/

2. APP CONNECT
   Expo app opens WebSocket to listener
   |-- app sends hello envelope: protocol version, app id, platform, capabilities
   |-- server validates pairing token
   |-- if invalid: connection rejected
   |-- if valid: session created, session id assigned
   |-- app sends full semantic tree snapshot
   |-- tree revision counter initialized
   |-- event cursor initialized

3. ACTIVE SESSION
   Agent host invokes tools over stdio
   |-- runtime-control tool: server translates to bridge command
   |-- bridge command sent over WebSocket to app
   |-- app processes command: dispatches action, queries registry
   |-- app returns result over WebSocket
   |-- server translates result to structured MCP content
   |-- revision counter incremented on tree mutations
   |-- events buffered in per-session ring buffer
   |
   Heartbeats: app sends periodic pings
   |-- if heartbeat expires: session marked stale
   |-- mutating tools fail with SESSION_DISCONNECTED

4. FAST REFRESH / HOT RELOAD
   App JavaScript bundle reloads
   |-- runtime epoch incremented
   |-- stale node handles cleared
   |-- tree reset event emitted
   |-- full new snapshot sent
   |-- deltas resume only after full snapshot acknowledged
   |
   Tool calls may include expected revision to catch stale plans.

5. RECONNECT
   App disconnects (background, navigation, crash)
   |-- session state set to disconnected
   |-- tools return SESSION_DISCONNECTED or SESSION_NOT_CONNECTED
   |
   App reconnects with previous session token
   |-- logical continuity preserved if reconnection is fast
   |-- full semantic tree snapshot required before mutating tools resume
   |-- heartbeat timer reset

6. SHUTDOWN
   SIGINT or SIGTERM received
   |-- active WebSocket connections closed gracefully
   |-- MCP server closed
   |-- process exits with code 0
```

## MCP Resources

The server exposes 15 read-only resources. Resources are application-driven context selected by the agent or by helper tools. They are not automatically injected into every prompt.

### Platform Skill Resources (11)

| URI | Backing File |
|---|---|
| `agent-ui://platform-skills/index` | Platform skill catalog and loading rules |
| `agent-ui://platform-skills/routing` | Task-to-skill router |
| `agent-ui://platform-skills/expo` | Expo implementation and EAS entrypoint |
| `agent-ui://platform-skills/react-native` | React Native and Expo performance entrypoint |
| `agent-ui://platform-skills/composition` | Component API and composition entrypoint |
| `agent-ui://platform-skills/native-accessibility` | Native and cross-platform accessibility entrypoint |
| `agent-ui://platform-skills/native-design` | Native motion, polish, haptics entrypoint |
| `agent-ui://platform-skills/android` | Android ecosystem and Compose entrypoint |
| `agent-ui://platform-skills/apple` | Apple ecosystem and SwiftUI entrypoint |
| `agent-ui://platform-skills/context-prompt-engineering` | Prompt, workflow, handoff entrypoint |
| `agent-ui://platform-skills/systematic-debugging` | Root-cause debugging and TTD/TDD evidence entrypoint |

### Runtime Resources (4)

| URI | Description |
|---|---|
| `agent-ui://sessions` | Current app session metadata: session id, app identity, platform, capabilities, connection state, uptime. |
| `agent-ui://diagnostics` | Listener, bridge, server diagnostics: transport mode, bind address, port, session count, motion adapter status, native adapter availability. |
| `agent-ui://serve-sim/sessions` | Discovered serve-sim iOS Simulator preview sessions. Returns stream URLs and device identifiers. macOS-only. |
| `agent-ui://native-preview/comparison` | Side-by-side semantic comparison metadata. Requires 2+ connected sessions. Development-only, redaction-gated. |

### Resource Rules

- All resources are read-only.
- Platform skill resources resolve from `dist/skills/` by default, overridden by `--skills-dir`.
- Path traversal outside the skills directory is rejected.
- Content is capped and includes truncation metadata when truncated.
- Secrets, tokens, app state, route params, and bridge payloads are never included in skill resources.

## MCP Prompts

The server exposes 6 prompts. Prompts are user-controlled templates. They return scoped plans or notes and do not execute app actions or claim unimplemented runtime capabilities exist.

| Prompt | Inputs | Purpose |
|---|---|---|
| `choose_platform_skills` | `task` (required), `stage`, `platforms` | Select platform skills to load based on task, stage, and target platforms. |
| `plan_native_scaffold` | `scaffoldIntent`, `platform`, `stage` | Create a scoped scaffold plan with file paths, imports, semantic IDs, and verification steps. |
| `review_accessibility_semantics` | `platform`, `screenOrComponent`, `codeContext` | Audit accessibility semantics: roles, labels, Dynamic Type, contrast, screen reader order. |
| `prepare_visual_editor_notes` | `sessions`, `platforms`, `adapterCapabilities` | Prepare development-only editor notes with multi-session and redaction constraints. |
| `write_agent_task_notes` | `task` (required), `stage`, `selectedSkills` | Write hidden agent task notes covering scope, assumptions, verification, and handoff. |
| `debug_stage_failure` | `stage` (required), `commandOrSymptom` (required), `package`, `evidence` | Create a root-cause investigation plan with one falsifiable hypothesis and TTD/TDD red-green rerun target. |

## Example Tool Invocations

### inspectTree

Request:
```json
{
  "name": "inspectTree",
  "arguments": {
    "screen": "home",
    "includeHidden": false,
    "maxDepth": 3
  }
}
```

Response (success):
```json
{
  "ok": true,
  "tree": {
    "id": "root-home",
    "type": "screen",
    "label": "Home",
    "screen": "home",
    "state": { "mounted": true },
    "children": [
      {
        "id": "greeting",
        "type": "heading",
        "label": "Welcome",
        "state": { "mounted": true, "visible": true },
        "actions": [],
        "children": [
          { "id": "greeting-text", "type": "text", "label": "Welcome to Expo Agent UI", "state": { "mounted": true }, "children": [] }
        ]
      },
      {
        "id": "start-action",
        "type": "button",
        "label": "Get Started",
        "state": { "mounted": true, "visible": true, "enabled": true },
        "actions": [{ "kind": "press", "dispatch": "onPress" }],
        "children": []
      }
    ]
  },
  "revision": 3,
  "capabilities": {
    "treeInspection": true,
    "taps": true,
    "inputs": true,
    "scrolls": true,
    "navigation": true,
    "flowExecution": true
  },
  "timestamp": 1746172800000
}
```

Response (no session):
```json
{
  "ok": false,
  "code": "SESSION_NOT_CONNECTED",
  "message": "no active app session is connected"
}
```

### tap

Request:
```json
{
  "name": "tap",
  "arguments": {
    "id": "start-action"
  }
}
```

Response (success):
```json
{
  "ok": true,
  "id": "start-action",
  "result": "OK",
  "timestamp": 1746172800123
}
```

Response (node disabled):
```json
{
  "ok": false,
  "code": "NODE_DISABLED",
  "message": "tap on 'submit-button' failed"
}
```

### input

Request:
```json
{
  "name": "input",
  "arguments": {
    "id": "email-field",
    "value": "user@example.com"
  }
}
```

Response (success):
```json
{
  "ok": true,
  "id": "email-field",
  "result": "OK",
  "timestamp": 1746172800456
}
```

Response (secure field — value redacted):
```json
{
  "ok": false,
  "code": "SECURE_VALUE_WRITE_ONLY",
  "message": "input on 'password-field' failed"
}
```

### runFlow

Request:
```json
{
  "name": "runFlow",
  "arguments": {
    "name": "checkout-happy-path",
    "stopOnFailure": true,
    "steps": [
      { "type": "tap", "targetId": "checkout-button" },
      { "type": "waitFor", "condition": { "kind": "nodeExists", "nodeId": "checkout-screen" } },
      { "type": "input", "targetId": "name-field", "value": "Jane Doe" },
      { "type": "tap", "targetId": "submit-order" },
      { "type": "waitFor", "condition": { "kind": "nodeVisible", "nodeId": "confirmation-message" }, "timeoutMs": 5000 }
    ]
  }
}
```

Response (success):
```json
{
  "ok": true,
  "flow": "checkout-happy-path",
  "completed": true,
  "steps": [
    { "type": "tap", "targetId": "checkout-button", "result": "OK" },
    { "type": "waitFor", "satisfied": true },
    { "type": "input", "targetId": "name-field", "result": "OK" },
    { "type": "tap", "targetId": "submit-order", "result": "OK" },
    { "type": "waitFor", "satisfied": true }
  ],
  "stepCount": 5,
  "timestamp": 1746172801000
}
```

Response (step failed):
```json
{
  "ok": false,
  "code": "STEP_FAILED",
  "message": "one or more flow steps failed"
}
```

### listPlatformSkills

Request:
```json
{
  "name": "listPlatformSkills",
  "arguments": {}
}
```

Response:
```json
{
  "ok": true,
  "skills": [
    {
      "name": "expo-skill",
      "entrypoint": "agent-ui://platform-skills/expo",
      "summary": "Expo app structure, Expo Router, config plugins, EAS, dev clients, Expo UI, Expo Modules, deployment.",
      "references": [
        "eas-update-insights",
        "expo-ui-jetpack-compose",
        "expo-ui-swift-ui",
        "expo-module",
        "use-dom",
        "expo-api-routes",
        "expo-dev-client",
        "expo-deployment",
        "expo-cicd-workflows",
        "upgrading-expo",
        "expo-tailwind-setup",
        "native-data-fetching",
        "building-native-ui"
      ]
    }
  ]
}
```

### getPlatformSkill

Request:
```json
{
  "name": "getPlatformSkill",
  "arguments": {
    "name": "systematic-debugging"
  }
}
```

Response (truncated content shown):
```json
{
  "ok": true,
  "skill": {
    "name": "systematic-debugging",
    "uri": "agent-ui://platform-skills/systematic-debugging",
    "mimeType": "text/markdown",
    "content": "# Systematic Debugging...",
    "truncated": false,
    "totalBytes": 12540
  }
}
```

Response (skill not found):
```json
{
  "ok": false,
  "code": "SKILL_NOT_FOUND",
  "message": "skill 'unknown-skill' not found"
}
```

## Security Constraints

- Agent control is disabled outside development by default. Production builds fail closed.
- The WebSocket listener binds to `127.0.0.1` by default. LAN access requires explicit `--host` configuration.
- Every bridge session requires a pairing token. Tokens are short-lived and session-scoped.
- Semantic values (text content, labels, secure field data) are redacted before MCP responses and logs.
- Tool authorization is deterministic: runtime-control tools require an active paired session; skill-context tools are always available.
- App text, labels, logs, route params, and server errors are untrusted data sources. They do not define tool schemas or resource URIs.
- Read-only resources and prompts do not mutate app state.
- The `proposePatch` tool creates proposals that require explicit manual approval. `autoApply` is always `false`.
- stdout contains only MCP JSON-RPC messages. All logging goes to stderr.
