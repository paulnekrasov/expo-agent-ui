# MCP Tool Reference

The Agent UI MCP server exposes two categories of tools: runtime-control and skill-context.

## Server Startup

```bash
npx @expo-agent-ui/mcp-server --token YOUR_PAIRING_TOKEN
```

The server runs over stdio. Pairing info and errors go to stderr. MCP protocol on stdout.

## Runtime-Control Tools

All runtime-control tools require a connected app session. Without a session, they return
`SESSION_NOT_CONNECTED`.

### inspectTree

Inspect the semantic tree of the running app.

```json
{
  "name": "inspectTree",
  "arguments": {
    "screen": "settings-screen",
    "includeHidden": false,
    "maxDepth": 3
  }
}
```

Parameters: `screen` (optional filter), `includeHidden` (default false), `includeBounds`,
`maxDepth` (default unlimited), `rootId` (start from specific node).

### getState

Get the current state of a semantic node by ID.

```json
{
  "name": "getState",
  "arguments": {
    "id": "settings-notifications-toggle"
  }
}
```

Parameters: `id` (required), `includeChildren` (default false).

### tap

Trigger a tap action on a semantic node.

```json
{
  "name": "tap",
  "arguments": {
    "id": "settings-save-btn",
    "action": "primary"
  }
}
```

Parameters: `id` (required), `action` (optional, default "primary").

### input

Set text value on an input field.

```json
{
  "name": "input",
  "arguments": {
    "id": "profile-email-field",
    "value": "user@example.com"
  }
}
```

Parameters: `id` (required), `value` (required).

### observeEvents

Observe semantic events from the running app.

```json
{
  "name": "observeEvents",
  "arguments": {
    "types": ["tap", "state_change"],
    "limit": 10
  }
}
```

Parameters: `since` (ISO timestamp), `types` (event type filter), `limit`, `waitMs`.

### waitFor

Wait for a semantic condition to be satisfied.

```json
{
  "name": "waitFor",
  "arguments": {
    "conditions": [
      {
        "kind": "nodeVisible",
        "nodeId": "welcome-screen"
      }
    ],
    "timeoutMs": 5000
  }
}
```

Condition kinds: `nodeExists`, `nodeVisible`, `nodeState`, `nodeAbsent`.

### scroll

Scroll to a node or in a direction.

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

### navigate

Navigate to a screen or route.

```json
{
  "name": "navigate",
  "arguments": {
    "screen": "settings",
    "replace": false
  }
}
```

### runFlow

Execute a sequence of steps as a flow.

```json
{
  "name": "runFlow",
  "arguments": {
    "name": "login-flow",
    "steps": [
      { "type": "tap", "id": "login-email-btn" },
      { "type": "input", "id": "login-email-field", "value": "test@test.com" },
      { "type": "tap", "id": "login-submit-btn" },
      { "type": "waitFor", "conditions": [{ "kind": "nodeVisible", "nodeId": "home-screen" }] }
    ],
    "stopOnFailure": true
  }
}
```

## Skill-Context Tools

These tools require NO app session. They provide read-only access to platform skill documentation.

### listPlatformSkills

List available platform skills.

```json
{
  "name": "listPlatformSkills",
  "arguments": {}
}
```

### getPlatformSkill

Read a specific platform skill's SKILL.md content.

```json
{
  "name": "getPlatformSkill",
  "arguments": {
    "name": "systematic-debugging"
  }
}
```

### searchPlatformSkills

Search across platform skill descriptions and keywords.

```json
{
  "name": "searchPlatformSkills",
  "arguments": {
    "query": "accessibility voiceover"
  }
}
```

### recommendPlatformSkills

Get platform skill recommendations for a task.

```json
{
  "name": "recommendPlatformSkills",
  "arguments": {
    "task": "Build an iOS settings screen with native SwiftUI toggle",
    "stage": "Stage 7"
  }
}
```

## Error Codes

| Code | Meaning |
|---|---|
| `SESSION_NOT_CONNECTED` | No active app session — connect the app bridge first |
| `NODE_NOT_FOUND` | The requested semantic ID does not exist in the tree |
| `INVALID_ARGUMENT` | A required or malformed argument was provided |
| `INVALID_CONDITION` | A waitFor condition kind is unrecognized |
| `CONDITIONS_REQUIRED` | waitFor called without conditions array |
| `COMMAND_FAILED` | The bridge dispatched but the app returned an error |
| `TREE_UNAVAILABLE` | The semantic tree could not be retrieved |
| `SKILL_NOT_FOUND` | The requested platform skill does not exist |
| `SKILL_INDEX_UNAVAILABLE` | The platform skill index could not be loaded |

## Resources

The MCP server also exposes read-only resources:

| URI | Content |
|---|---|
| `agent-ui://sessions` | Active session metadata (app ID, uptime, state) |
| `agent-ui://diagnostics` | Server health, listener status, adapter inventory |
| `agent-ui://platform-skills/index` | Platform skill catalog |
| `agent-ui://platform-skills/routing` | Platform skill routing rules |
| `agent-ui://platform-skills/expo` | Expo platform skill |
| `agent-ui://platform-skills/react-native` | React Native platform skill |
| `agent-ui://platform-skills/composition` | Composition patterns skill |
| `agent-ui://platform-skills/native-accessibility` | Accessibility engineering skill |
| `agent-ui://platform-skills/native-design` | Native design engineering skill |
| `agent-ui://platform-skills/android` | Android ecosystem skill |
| `agent-ui://platform-skills/apple` | Apple ecosystem skill |
| `agent-ui://platform-skills/context-prompt-engineering` | Context engineering skill |
| `agent-ui://platform-skills/systematic-debugging` | Systematic debugging skill |
