# MCP Tool Reference

The Agent UI MCP server exposes 13 tools split into two categories: **runtime-control** (require an active app session) and **skill-context** (work independently, no session required).

## Session Lifecycle

1. **Server starts** over stdio: `npx @expo-agent-ui/mcp-server`. The server opens a local WebSocket listener for app connections (default `127.0.0.1:9721`). Pairing info and errors go to stderr; MCP protocol messages go to stdout.
2. **App connects** — a development Expo app pairs with the server via WebSocket using the pairing token.
3. **Session becomes active** — the server tracks `state` (`connecting` → `paired` → `disconnected`). Runtime tools require `state === "paired"`.
4. **Runtime tools fail closed** — when no session is active (or the session is disconnected), every runtime tool returns `SESSION_NOT_CONNECTED`.
5. **Skill-context tools** work independently at any time without an app session.

**Resources** available for session inspection:
| URI | Content |
|---|---|
| `agent-ui://sessions` | Active session metadata (sessionId, appId, appName, capabilities, state, connectedAt, uptimeMs) |
| `agent-ui://diagnostics` | Server, listener, motion adapter, and native adapter diagnostics |
| `agent-ui://serve-sim/sessions` | Discovered serve-sim iOS Simulator preview sessions (macOS only, read-only) |

---

## Runtime-Control Tools

All nine runtime tools require an active session. Without one, they return:

```json
{ "ok": false, "code": "SESSION_NOT_CONNECTED", "message": "no active app session is connected" }
```

### 1. `inspectTree`

Inspect the semantic tree of the connected app.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "screen":     { "type": "string", "description": "Optional screen scope to restrict the tree." },
    "rootId":     { "type": "string", "description": "Optional root semantic id." },
    "includeHidden": { "type": "boolean", "description": "Include hidden subtrees in the result." },
    "includeBounds": { "type": "boolean", "description": "Include bounding-rect metadata." },
    "maxDepth":   { "type": "number", "description": "Maximum tree depth." }
  }
}
```

**Example call:**

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

**Success output:**

```json
{
  "ok": true,
  "tree": { "revision": 12, "nodes": [ ... ] },
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `TREE_UNAVAILABLE`, `COMMAND_FAILED`.

---

### 2. `getState`

Get the semantic state of a specific node by stable id.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "id":              { "type": "string", "description": "Required stable semantic node id." },
    "sessionId":       { "type": "string", "description": "Optional active session id." },
    "includeChildren": { "type": "boolean", "description": "Include child nodes in the result." }
  },
  "required": ["id"]
}
```

**Example call:**

```json
{
  "name": "getState",
  "arguments": {
    "id": "settings-notifications-toggle"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "node": { "id": "settings-notifications-toggle", "role": "switch", "state": "on", "label": "Notifications" },
  "nodeId": "settings-notifications-toggle",
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `NODE_NOT_FOUND` (id not in visible tree), `DUPLICATE_NODE_ID` (multiple nodes share the id — provide a `screen` scope), `INVALID_ARGUMENT` (missing `id`), `COMMAND_FAILED`.

---

### 3. `tap`

Dispatch a tap (press) action on a semantic node by stable id.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "id":        { "type": "string", "description": "Required stable semantic node id to tap." },
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "screen":    { "type": "string", "description": "Optional screen scope to resolve the node id." },
    "action":    { "type": "string", "description": "Optional action name (default 'tap')." },
    "timeoutMs": { "type": "number", "description": "Optional command timeout in milliseconds." }
  },
  "required": ["id"]
}
```

**Example call:**

```json
{
  "name": "tap",
  "arguments": {
    "id": "settings-save-btn",
    "action": "primary"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "id": "settings-save-btn",
  "result": "OK",
  "timestamp": 1714250100000
}
```

**Partial failure output (action dispatched but app returned an error):**

```json
{
  "ok": false,
  "id": "settings-save-btn",
  "result": "ERROR",
  "error": "node is disabled",
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `INVALID_ARGUMENT` (missing `id`), `ACTION_FAILED`, `COMMAND_FAILED`.

---

### 4. `input`

Set the text value of a semantic input node by stable id.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "id":        { "type": "string", "description": "Required stable semantic node id of the input field." },
    "value":     { "type": "string", "description": "Required text value to input." },
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "screen":    { "type": "string", "description": "Optional screen scope to resolve the node id." },
    "timeoutMs": { "type": "number", "description": "Optional command timeout in milliseconds." }
  },
  "required": ["id", "value"]
}
```

**Example call:**

```json
{
  "name": "input",
  "arguments": {
    "id": "profile-email-field",
    "value": "user@example.com"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "id": "profile-email-field",
  "result": "OK",
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `INVALID_ARGUMENT` (missing `id` or `value`), `ACTION_FAILED`, `COMMAND_FAILED`.

---

### 5. `observeEvents`

Retrieve bridge session events from the event log. Supports cursor-based pagination, type filtering, and result limiting.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "since":     { "type": "number", "description": "Optional cursor to fetch events after." },
    "types":     {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "bridge.session.connected",
          "bridge.session.paired",
          "bridge.session.disconnected",
          "bridge.session.expired",
          "bridge.command.received",
          "bridge.command.completed",
          "bridge.command.failed",
          "bridge.error"
        ]
      },
      "description": "Optional event type filter."
    },
    "limit":     { "type": "number", "description": "Optional maximum number of events to return." }
  }
}
```

**Example call:**

```json
{
  "name": "observeEvents",
  "arguments": {
    "types": ["bridge.command.completed", "bridge.command.failed"],
    "limit": 20
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "events": [
    { "type": "bridge.command.completed", "command": "tap", "targetId": "login-btn", "timestamp": 1714250100000 }
  ],
  "nextCursor": 1714250100001,
  "droppedCount": 0,
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `COMMAND_FAILED`.

---

### 6. `waitFor`

Wait for one or more semantic conditions to be satisfied.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "conditions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "kind": {
            "type": "string",
            "enum": ["nodeExists", "nodeVisible", "nodeState", "nodeAbsent"]
          },
          "nodeId":        { "type": "string" },
          "screen":        { "type": "string" },
          "expectedState": { "description": "Expected state value (used with nodeState kind)." }
        },
        "required": ["kind", "nodeId"]
      },
      "description": "Required array of wait conditions."
    },
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "timeoutMs": { "type": "number", "description": "Optional timeout in milliseconds." }
  },
  "required": ["conditions"]
}
```

**Condition kinds:**

| Kind | Behavior |
|---|---|
| `nodeExists` | Node is registered in the semantic tree. |
| `nodeVisible` | Node is registered and not hidden. |
| `nodeState` | Node exists and has a matching `expectedState`. |
| `nodeAbsent` | Node is not present in the tree. |

**Example call:**

```json
{
  "name": "waitFor",
  "arguments": {
    "conditions": [
      { "kind": "nodeVisible", "nodeId": "home-screen" },
      { "kind": "nodeState", "nodeId": "sync-toggle", "expectedState": "on" }
    ],
    "timeoutMs": 5000
  }
}
```

**Success output (all conditions met):**

```json
{
  "ok": true,
  "satisfied": true,
  "matchedConditions": 2,
  "totalConditions": 2,
  "timestamp": 1714250100000
}
```

**Partial match output (not all conditions satisfied before timeout):**

```json
{
  "ok": false,
  "satisfied": false,
  "matchedConditions": 1,
  "totalConditions": 2,
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `CONDITIONS_REQUIRED` (empty or missing conditions), `INVALID_CONDITION` (invalid kind or missing nodeId), `ACTION_FAILED`, `COMMAND_FAILED`.

---

### 7. `scroll`

Scroll a semantic scroll container by stable id.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "id":        { "type": "string", "description": "Required stable semantic node id of the scroll container." },
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "direction": {
      "type": "string",
      "enum": ["up", "down", "left", "right"],
      "description": "Optional scroll direction (default 'down')."
    },
    "amount":    { "type": "number", "description": "Optional scroll amount in logical pixels." },
    "targetId":  { "type": "string", "description": "Optional target node id to scroll to." },
    "timeoutMs": { "type": "number", "description": "Optional command timeout in milliseconds." }
  },
  "required": ["id"]
}
```

**Example call — scroll by direction:**

```json
{
  "name": "scroll",
  "arguments": {
    "id": "chat-list",
    "direction": "down",
    "amount": 200
  }
}
```

**Example call — scroll to target:**

```json
{
  "name": "scroll",
  "arguments": {
    "id": "chat-list",
    "targetId": "chat-msg-42"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "id": "chat-list",
  "offset": 200,
  "visibleRange": { "first": "chat-msg-3", "last": "chat-msg-17" },
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `INVALID_ARGUMENT` (missing `id`), `NOT_SCROLL_CONTAINER`, `DIRECTION_UNSUPPORTED`, `ACTION_FAILED`, `COMMAND_FAILED`.

---

### 8. `navigate`

Navigate to a screen or route in the connected app.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "sessionId": { "type": "string", "description": "Optional active session id." },
    "screen":    { "type": "string", "description": "Optional target screen name." },
    "route":     { "type": "string", "description": "Optional route path." },
    "params":    {
      "type": "object",
      "description": "Optional route or screen parameters (redacted before exposure)."
    },
    "replace":   { "type": "boolean", "description": "Optional replace current screen instead of pushing (default false)." },
    "timeoutMs": { "type": "number", "description": "Optional command timeout in milliseconds." }
  }
}
```

At least one of `screen` or `route` must be provided.

**Example call — push a screen:**

```json
{
  "name": "navigate",
  "arguments": {
    "screen": "settings"
  }
}
```

**Example call — replace current with a route:**

```json
{
  "name": "navigate",
  "arguments": {
    "route": "/profile/123",
    "replace": true
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "currentScreen": "settings",
  "route": "/profile/123",
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `INVALID_ARGUMENT` (neither screen nor route provided), `NAVIGATION_UNAVAILABLE`, `ROUTE_NOT_FOUND`, `ACTION_FAILED`, `COMMAND_FAILED`.

---

### 9. `runFlow`

Execute a sequence of semantic flow steps sequentially against the connected app.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "sessionId":     { "type": "string", "description": "Optional active session id." },
    "name":          { "type": "string", "description": "Optional flow name for discovery and reporting." },
    "steps":         {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type":       {
            "type": "string",
            "enum": ["tap", "input", "scroll", "navigate", "waitFor", "assert", "observeEvents"]
          },
          "targetId":   { "type": "string" },
          "value":      { "type": "string" },
          "conditions": { "type": "array" },
          "screen":     { "type": "string" }
        },
        "required": ["type"]
      },
      "description": "Optional array of flow steps to execute sequentially."
    },
    "stopOnFailure": { "type": "boolean", "description": "Optional stop flow execution on first failure (default true)." },
    "timeoutMs":     { "type": "number", "description": "Optional per-step timeout in milliseconds." }
  }
}
```

**Step types:**

| `type` | Description |
|---|---|
| `tap` | Tap a semantic node. Requires `targetId`. |
| `input` | Set text on an input node. Requires `targetId` and `value`. |
| `scroll` | Scroll a container. Requires `targetId`. |
| `navigate` | Navigate to a screen/route. Supports `screen`, `value` (as route), and optional `conditions` for params. |
| `waitFor` | Wait for conditions. Requires `conditions` array. |
| `assert` | Assert a condition at a point in the flow. |
| `observeEvents` | Observe events during flow execution. |

**Example call:**

```json
{
  "name": "runFlow",
  "arguments": {
    "name": "login-flow",
    "steps": [
      { "type": "tap", "targetId": "login-email-btn" },
      { "type": "input", "targetId": "login-email-field", "value": "test@example.com" },
      { "type": "input", "targetId": "login-password-field", "value": "********" },
      { "type": "tap", "targetId": "login-submit-btn" },
      { "type": "waitFor", "conditions": [{ "kind": "nodeVisible", "nodeId": "home-screen" }] }
    ],
    "stopOnFailure": true,
    "timeoutMs": 30000
  }
}
```

**Success output (all steps completed):**

```json
{
  "ok": true,
  "flow": "login-flow",
  "completed": true,
  "steps": [
    { "type": "tap", "result": "OK" },
    { "type": "input", "result": "OK" },
    { "type": "input", "result": "OK" },
    { "type": "tap", "result": "OK" },
    { "type": "waitFor", "matchedConditions": 1, "totalConditions": 1 }
  ],
  "stepCount": 5,
  "timestamp": 1714250100000
}
```

**Failure output (step 3 failed):**

```json
{
  "ok": false,
  "flow": "login-flow",
  "completed": false,
  "steps": [
    { "type": "tap", "result": "OK" },
    { "type": "input", "result": "OK" },
    { "type": "input", "result": "ERROR", "error": "node is disabled" }
  ],
  "stepCount": 3,
  "failedStep": { "type": "input", "targetId": "login-password-field", "error": "node is disabled" },
  "timestamp": 1714250100000
}
```

**Error codes:** `SESSION_NOT_CONNECTED`, `INVALID_ARGUMENT` (bad step type), `FLOW_NOT_FOUND`, `STEP_FAILED`, `TIMEOUT`, `COMMAND_FAILED`.

---

## Skill-Context Tools

These four tools require NO app session. They provide read-only access to repo-local platform skill documentation.

### 10. `listPlatformSkills`

List available repo-local platform skills.

**Input schema:**

```json
{
  "type": "object",
  "properties": {}
}
```

**Example call:**

```json
{
  "name": "listPlatformSkills",
  "arguments": {}
}
```

**Success output:**

```json
{
  "ok": true,
  "skills": [
    { "name": "systematic-debugging", "description": "Root-cause investigation protocol with TTD/TDD red-green evidence.", "resourceUri": "agent-ui://platform-skills/systematic-debugging" },
    { "name": "expo-skill", "description": "Expo Modules, config plugins, EAS, and deployment guidance.", "resourceUri": "agent-ui://platform-skills/expo" },
    { "name": "react-native-skill", "description": "React Native performance, composition, and native bridge patterns.", "resourceUri": "agent-ui://platform-skills/react-native" }
  ]
}
```

**Error codes:** `SKILL_INDEX_UNAVAILABLE`.

---

### 11. `getPlatformSkill`

Read a repo-local platform skill by name. Returns full `SKILL.md` content with truncation metadata.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Required skill name (e.g. 'expo-skill', 'systematic-debugging')." }
  },
  "required": ["name"]
}
```

**Example call:**

```json
{
  "name": "getPlatformSkill",
  "arguments": {
    "name": "systematic-debugging"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "name": "systematic-debugging",
  "uri": "agent-ui://platform-skills/systematic-debugging",
  "mimeType": "text/markdown",
  "text": "# Systematic Debugging\n\n## Protocol\n\n...",
  "byteLength": 12400,
  "truncated": false,
  "maxBytes": 262144
}
```

**Structured error:**

```json
{ "ok": false, "code": "SKILL_NOT_FOUND", "message": "platform skill 'unknown-skill' was not found" }
```

**Error codes:** `SKILL_NOT_FOUND`, `INVALID_ARGUMENT` (missing or empty `name`).

---

### 12. `searchPlatformSkills`

Search repo-local platform skills by query terms. Returns ranked matches.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "query":           { "type": "string", "description": "Required search query string." },
    "skillNames":      {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional skill names to scope the search."
    },
    "limit":           { "type": "number", "description": "Optional maximum number of results." },
    "includeSnippets": { "type": "boolean", "description": "Optional include description snippets in results." }
  },
  "required": ["query"]
}
```

**Example call:**

```json
{
  "name": "searchPlatformSkills",
  "arguments": {
    "query": "accessibility voiceover",
    "limit": 5,
    "includeSnippets": true
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "matches": [
    { "skill": "native-accessibility-engineering", "score": 0.92, "snippet": "Audit accessibility semantics for VoiceOver and TalkBack..." },
    { "skill": "apple-skill", "score": 0.67, "snippet": "iOS native concurrency, testing strategies, SF Symbols..." },
    { "skill": "expo-skill", "score": 0.41, "snippet": "Expo config plugins, EAS build profiles, and native module patterns..." }
  ]
}
```

**Error codes:** `QUERY_EMPTY` (missing or blank `query`), `SEARCH_UNAVAILABLE`.

---

### 13. `recommendPlatformSkills`

Recommend platform skills for a task using keyword matching.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "task":            { "type": "string", "description": "Required task description to match skills against." },
    "stage":           { "type": "string", "description": "Optional product stage for context-aware recommendations." },
    "platforms":       {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional target platforms."
    },
    "scaffoldIntent":  { "type": "string", "description": "Optional scaffold intent for narrowing recommendations." }
  },
  "required": ["task"]
}
```

**Example call:**

```json
{
  "name": "recommendPlatformSkills",
  "arguments": {
    "task": "Build an iOS settings screen with native SwiftUI toggle",
    "stage": "Stage 7",
    "platforms": ["ios"],
    "scaffoldIntent": "native settings screen"
  }
}
```

**Success output:**

```json
{
  "ok": true,
  "recommendations": [
    {
      "skill": "apple-skill",
      "resourceUri": "agent-ui://platform-skills/apple",
      "reasons": ["Matches platform ios", "Matched keyword: swiftui"],
      "warnings": []
    },
    {
      "skill": "expo-skill",
      "resourceUri": "agent-ui://platform-skills/expo",
      "reasons": ["Matched keyword: screen"],
      "warnings": ["Not specific to native adapter patterns; load apple-skill first"]
    }
  ]
}
```

**Error codes:** `TASK_EMPTY` (missing or blank `task`).

---

## Universal Error Codes

Every tool may return a structured error with the shape `{ ok: false, code: "...", message: "..." }`.

| Code | Applies to | Meaning |
|---|---|---|
| `SESSION_NOT_CONNECTED` | All runtime tools | No active app session is connected. Start the MCP server with the pairing token, then connect the development app via the bridge. |
| `INVALID_ARGUMENT` | `getState`, `tap`, `input`, `scroll`, `navigate`, `getPlatformSkill` | A required argument is missing or malformed. |
| `COMMAND_FAILED` | All tools | The bridge dispatched but encountered an unexpected internal error. |
| `UNKNOWN_TOOL` | Any | The tool name is not registered on this MCP server. |
| `SKILL_NOT_FOUND` | `getPlatformSkill` | The requested platform skill does not exist in the repo-local copy. |
| `QUERY_EMPTY` | `searchPlatformSkills` | The search query is missing or blank. |
| `TASK_EMPTY` | `recommendPlatformSkills` | The task description is missing or blank. |
| `SKILL_INDEX_UNAVAILABLE` | `listPlatformSkills` | Could not read the platform skill index directory. |
| `SEARCH_UNAVAILABLE` | `searchPlatformSkills` | Internal search infrastructure failure. |

### Tool-specific error codes

| Code | Tool(s) | Meaning |
|---|---|---|
| `NODE_NOT_FOUND` | `getState` | The semantic id is not in the visible tree. Run `inspectTree` to discover active ids. |
| `DUPLICATE_NODE_ID` | `getState` | Multiple nodes share the same id. Provide a `screen` scope to disambiguate. |
| `TREE_UNAVAILABLE` | `inspectTree` | The semantic tree could not be retrieved from the app. |
| `CONDITIONS_REQUIRED` | `waitFor` | The `conditions` array is missing or empty. |
| `INVALID_CONDITION` | `waitFor` | A condition has an invalid `kind` or missing `nodeId`. |
| `NOT_SCROLL_CONTAINER` | `scroll` | The node is not a scrollable container. |
| `DIRECTION_UNSUPPORTED` | `scroll` | The requested scroll direction is not supported for this container. |
| `NAVIGATION_UNAVAILABLE` | `navigate` | Navigation is not available in the connected app session (no navigator registered). |
| `ROUTE_NOT_FOUND` | `navigate` | The requested screen or route was not found in the app. |
| `FLOW_NOT_FOUND` | `runFlow` | A named flow was not found. |
| `STEP_FAILED` | `runFlow` | One or more flow steps failed execution. |
| `TIMEOUT` | `runFlow` | Flow execution timed out before completing. |

---

## MCP Resources

The server also exposes read-only resources usable via `readResource` or the `agent-ui://` URI scheme.

| URI | MIME | Session required | Description |
|---|---|---|---|
| `agent-ui://sessions` | `application/json` | No | Active session metadata (sessionId, appId, appName, capabilities, state, connectedAt, uptimeMs). |
| `agent-ui://diagnostics` | `application/json` | No | Server, listener, motion adapter tiers, native adapter inventory (SwiftUI + Compose), active session info. |
| `agent-ui://serve-sim/sessions` | `application/json` | No | Discovered serve-sim iOS Simulator preview sessions (macOS only). Read-only. |
| `agent-ui://platform-skills/index` | `text/markdown` | No | Platform skill catalog index. |
| `agent-ui://platform-skills/routing` | `text/markdown` | No | Platform skill routing rules. |
| `agent-ui://platform-skills/{name}` | `text/markdown` | No | Individual platform skill `SKILL.md` content. |

---

## MCP Prompts

Read-only, no session required. Available prompts:

| Name | Required args | Optional args |
|---|---|---|
| `choose_platform_skills` | `task` | `stage`, `platforms` |
| `plan_native_scaffold` | — | `scaffoldIntent`, `platform`, `stage` |
| `review_accessibility_semantics` | — | `platform`, `screenOrComponent`, `codeContext` |
| `prepare_visual_editor_notes` | — | `sessions`, `platforms`, `adapterCapabilities` |
| `write_agent_task_notes` | `task` | `stage`, `selectedSkills` |
| `debug_stage_failure` | `stage`, `commandOrSymptom` | `package`, `evidence` |
