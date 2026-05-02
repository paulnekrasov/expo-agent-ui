# Maestro Semantic Flow Reference

Agent UI semantic flows are the canonical representation of UI interactions. Maestro YAML is
the preferred first external export format, leveraging React Native `testID` to Maestro `id`
selector mapping.

## Principles

- Agent UI semantic flows are the source of truth
- Maestro YAML is a generated export artifact, not the authoring format
- Flows use stable semantic IDs, not coordinates or visible text
- Maestro is optional — flows work through the Agent UI MCP server without Maestro
- Flow healing proposals use semantic metadata, not screenshots

## Flow Schema

```ts
type SemanticFlow = {
  name: string;
  description?: string;
  steps: SemanticFlowStep[];
  assertions: SemanticFlowAssertion[];
  stopOnFailure: boolean;
};

type SemanticFlowStep =
  | { type: "tap"; id: string; action?: string }
  | { type: "input"; id: string; value: string }
  | { type: "toggle"; id: string; value: boolean }
  | { type: "scroll"; id: string; direction: "up" | "down" | "left" | "right"; amount?: number }
  | { type: "navigate"; screen: string; replace?: boolean }
  | { type: "waitFor"; conditions: WaitCondition[]; timeoutMs?: number }
  | { type: "assert"; id: string; state: Record<string, unknown> }
  | { type: "observeEvents"; types?: string[]; limit?: number };

type SemanticFlowAssertion = {
  description: string;
  check: "nodeExists" | "nodeState" | "nodeVisible" | "nodeAbsent";
  nodeId: string;
  expected?: Record<string, unknown>;
};
```

## Exporting to Maestro YAML

Agent UI flows compile to Maestro YAML using semantic ID to `id` selector mapping.
Every Agent UI primitive with a stable `id` sets `testID` on the underlying React Native
view, which Maestro targets as `id`.

### Example Agent UI Flow

```ts
const loginFlow: SemanticFlow = {
  name: "User login",
  steps: [
    { type: "tap", id: "login-email-field" },
    { type: "input", id: "login-email-field", value: "test@test.com" },
    { type: "tap", id: "login-password-field" },
    { type: "input", id: "login-password-field", value: "password123" },
    { type: "tap", id: "login-submit-btn" },
    { type: "waitFor", conditions: [{ kind: "nodeVisible", nodeId: "home-screen" }], timeoutMs: 5000 }
  ],
  assertions: [
    { description: "Home screen is visible", check: "nodeVisible", nodeId: "home-screen" }
  ],
  stopOnFailure: true
};
```

### Generated Maestro YAML

```yaml
appId: com.example.app
---
- tapOn:
    id: "login-email-field"
- inputText: "test@test.com"
- tapOn:
    id: "login-password-field"
- inputText: "password123"
- tapOn:
    id: "login-submit-btn"
- assertVisible:
    id: "home-screen"
```

## Flow Healing

When an external flow (Maestro, Detox, Appium) fails, Agent UI can propose healing
using semantic metadata. The healing process:

1. Parse the failed external flow step (e.g., Maestro YAML line with `id: "old-btn-id"`)
2. Search the semantic tree for nodes with matching `label`, `role`, `intent`
3. Rank candidates by semantic similarity (role match > label match > same screen > same parent)
4. Return a patch proposal with the suggested new `id`
5. Require human approval before applying the patch

Healing proposals are separate from automatic patching. Agent UI never writes to source
files without explicit user confirmation.

## Flow Runner (Agent UI MCP)

Flows can run directly through the MCP server's `runFlow` tool without Maestro:

```json
{
  "name": "runFlow",
  "arguments": {
    "name": "User login",
    "steps": [
      { "type": "tap", "id": "login-email-field" },
      { "type": "input", "id": "login-email-field", "value": "test@test.com" },
      { "type": "tap", "id": "login-submit-btn" },
      { "type": "waitFor", "conditions": [{ "kind": "nodeVisible", "nodeId": "home-screen" }] }
    ],
    "stopOnFailure": true,
    "timeoutMs": 30000
  }
}
```

Response shape:
```json
{
  "ok": true,
  "flowName": "User login",
  "completed": true,
  "totalSteps": 4,
  "completedSteps": 4,
  "failedStep": null,
  "durationMs": 5230,
  "error": null
}
```

## CLI Export Commands

Future CLI commands for Maestro integration:

```bash
agent-ui export maestro --flow login-flow --output login-flow.yaml
agent-ui maestro run --flow login-flow.yaml
agent-ui maestro heal --flow login-flow.yaml --last-run-results results.json
agent-ui replay --flow login-flow --format json
```

## Security

- Never export sensitive field values in flow YAML
- Redact values marked as `privacy: sensitive` or `privacy: private`
- Flows with redacted values require human review before execution
- Flow results are logged locally; never auto-upload to cloud services
