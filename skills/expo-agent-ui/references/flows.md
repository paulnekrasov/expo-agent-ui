# Semantic Flow Schema & Usage Guide

Agent UI semantic flows are the canonical, local-first representation of UI interaction
sequences. Flows use stable semantic IDs, not coordinates, selectors, or visible text.

## Flow JSON Schema

```ts
// Canonical flow shape
type SemanticFlow = {
  name: string;             // flow identifier, e.g. "checkout.happyPath"
  steps: SemanticFlowStep[];
  stopOnFailure: boolean;   // true = halt on first failure
  timeoutMs?: number;       // per-step timeout (default 5000)
};

type SemanticFlowStep = {
  type: "tap" | "input" | "scroll" | "navigate" | "waitFor" | "assert" | "observeEvents";
  targetId?: string;        // semantic node id (required for tap, input, scroll)
  value?: string;           // input value (required for input; use $FIXTURE for secrets)
  conditions?: WaitCondition[];  // for waitFor, assert
  screen?: string;          // for navigate
  direction?: "up" | "down" | "left" | "right";  // for scroll
  amount?: number;          // for scroll
};

type WaitCondition = {
  kind: "nodeExists" | "nodeVisible" | "nodeState" | "nodeAbsent";
  nodeId: string;
  expected?: Record<string, unknown>;
};
```

## Step Types

### `tap` — Press a semantic node (button, toggle, list item, tappable control).
`{ "type": "tap", "targetId": "checkout.submitOrder" }`

### `input` — Fill a text or secure field. Use `$FIXTURE` references for secret values.
`{ "type": "input", "targetId": "checkout.email", "value": "test@example.com" }`
Secrets: `{ "type": "input", "targetId": "checkout.cardNumber", "value": "$CARD_FIXTURE" }`

### `scroll` — Scroll a container by direction and optional amount.
`{ "type": "scroll", "targetId": "checkout.form", "direction": "down", "amount": 200 }`

### `navigate`
Navigate to a named screen or route. The runtime delegates to the active router.

```json
{ "type": "navigate", "screen": "orderConfirmation" }
```

### `waitFor`
Pause execution until conditions are met. Useful after navigation or async operations.

```json
{
  "type": "waitFor",
  "conditions": [
    { "kind": "nodeVisible", "nodeId": "orderConfirmation.screen" },
    { "kind": "nodeState", "nodeId": "orderConfirmation.statusLabel", "expected": { "label": "Confirmed" } }
  ]
}
```

Condition kinds:
- `nodeExists` — Node is present in the semantic tree (may or may not be visible).
- `nodeVisible` — Node is mounted and not hidden/obscured.
- `nodeState` — Node state matches expected values (disabled, busy, checked, expanded, selected, active, focused, error).
- `nodeAbsent` — Node is not present in the semantic tree.

### `assert`
Verify expected state. Fails the step if the assertion does not hold. Assertions use the same
condition kinds as `waitFor` but check immediately with no retry.

```json
{
  "type": "assert",
  "conditions": [
    { "kind": "nodeVisible", "nodeId": "checkout.priceTotal" },
    { "kind": "nodeState", "nodeId": "checkout.submitOrder", "expected": { "disabled": false } }
  ]
}
```

### `observeEvents`
Read the bridge event log. Used for verification that a side effect fired.

```json
{ "type": "observeEvents", "value": "tap,submit" }
```

The `value` field is an optional comma-separated list of event type filters.

## Execution Model

The flow runner executes steps sequentially. Execution is single-pass; it does not branch or
loop. The `stopOnFailure` field controls failure behavior:

| `stopOnFailure` | Behavior |
|---|---|
| `true` (default) | Execution halts on the first failed step. The runner returns the failed step index and error details. |
| `false` | The runner continues past failed steps and reports all failures at the end. Useful for smoke tests and audit scans. |

The `timeoutMs` field (default 5000) applies per-step. If a step does not complete within the
timeout, it fails.

## Flow Runner Response

The MCP `runFlow` tool returns:

```json
{
  "ok": false,
  "flowName": "checkout.happyPath",
  "completed": false,
  "totalSteps": 8,
  "completedSteps": 3,
  "failedStep": 4,
  "failedStepType": "assert",
  "durationMs": 12450,
  "error": "nodeVisible condition failed for 'orderConfirmation.screen'"
}
```

## Semantic IDs, Not Coordinates

Flows reference nodes by stable semantic ID. The runtime resolves IDs to native views through
the semantic registry. This means:

- Flows survive layout changes, font scaling, and localization.
- Flows do not depend on screen coordinates, view hierarchy depth, or visible text.
- A single flow can run on iOS and Android without modification if semantic IDs match.

Never write flow steps that reference `x`, `y`, `width`, `height`, or visible label text as
the primary selector.

## Maestro Export (Optional External Adapter)

Maestro is an optional external execution adapter. Agent UI semantic flows are the source of
truth. Maestro YAML is a generated export artifact.

Export pipeline:

1. Author the flow as Agent UI semantic JSON.
2. Compile to Maestro YAML via the adapter, mapping semantic IDs to `testID` selectors.
3. Run through Maestro CLI or Maestro MCP only when Maestro is installed.
4. Compare results against the Agent UI semantic tree for healing proposals.

Maestro is not a dependency. If Maestro is unavailable, flows still execute through the Agent UI
MCP `runFlow` tool. The CLI command `agent-ui export maestro` fails with `MAESTRO_UNAVAILABLE`
when Maestro is not installed.

```bash
agent-ui export maestro --flow checkout.happyPath --output checkout-flow.yaml
agent-ui maestro run --flow checkout-flow.yaml
agent-ui maestro heal --flow checkout-flow.yaml --last-run-results results.json
```

## Security Gate

Agents must never auto-apply flows whose steps mutate checkout, auth, account, network,
payment, or destructive state without explicit human approval. The runner validates these
gates at the step level:

- `tap` on a node with `intent: "submit_order"` → requires approval.
- `input` on a `SecureField` node → requires approval.
- `navigate` away from a form with unsaved changes → requires approval.

Approval is signaled through the MCP tool call's `approved` field or an interactive prompt,
depending on the agent host. The runner returns `APPROVAL_REQUIRED` if a gated step is
encountered without prior approval.

Environmental safety rules:

- Gate behind `__DEV__`. Agent control must not be available in production builds.
- Redact sensitive field values before they leave the app process. The `privacy` field on
  semantic nodes controls redaction level (`none`, `sensitive`, `private`).
- Never export raw secure input values in flow JSON. Use value references or fixture values.
- Do not auto-upload flow results, screenshots, or logs to cloud services.

## Example: Checkout Happy Path

```json
{
  "name": "checkout.happyPath",
  "stopOnFailure": true,
  "timeoutMs": 15000,
  "steps": [
    {
      "type": "navigate",
      "screen": "checkout"
    },
    {
      "type": "waitFor",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "checkout.screen" }
      ]
    },
    {
      "type": "assert",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "checkout.cartSummary" },
        { "kind": "nodeVisible", "nodeId": "checkout.form" }
      ]
    },
    {
      "type": "input",
      "targetId": "checkout.name",
      "value": "Alex Rivera"
    },
    {
      "type": "input",
      "targetId": "checkout.email",
      "value": "alex@example.com"
    },
    {
      "type": "input",
      "targetId": "checkout.address",
      "value": "123 Main St, Springfield"
    },
    {
      "type": "scroll",
      "targetId": "checkout.form",
      "direction": "down",
      "amount": 300
    },
    {
      "type": "waitFor",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "checkout.cardNumber" }
      ]
    },
    {
      "type": "input",
      "targetId": "checkout.cardNumber",
      "value": "$CARD_FIXTURE"
    },
    {
      "type": "tap",
      "targetId": "checkout.reviewOrder"
    },
    {
      "type": "waitFor",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "checkout.confirmOrder" },
        { "kind": "nodeState", "nodeId": "checkout.priceTotal", "expected": { "label": "$42.97" } }
      ]
    },
    {
      "type": "tap",
      "targetId": "checkout.confirmOrder"
    },
    {
      "type": "waitFor",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "orderConfirmation.screen" }
      ]
    },
    {
      "type": "assert",
      "conditions": [
        { "kind": "nodeVisible", "nodeId": "orderConfirmation.statusLabel" },
        { "kind": "nodeState", "nodeId": "orderConfirmation.statusLabel", "expected": { "label": "Confirmed" } }
      ]
    }
  ]
}
```

Key patterns: `waitFor` after `navigate`; `$CARD_FIXTURE` for secure fields; confirm tap is
gated behind approval (carries `intent: "submit_order"`).

Authoring workflow: Inspect → Draft → Validate → Dry-run → Export → Review. Validate with
`npx @agent-ui/cli validate-flow <flow.json>`.
