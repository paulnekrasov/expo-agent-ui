# Structured Patch Proposal Format

Patch proposals are plans for source-code changes, not automatic mutations. An agent proposes
a patch; a human reviews and approves it before any file is written.

## Patch Proposal JSON Schema

```json
{
  "summary": "string (human-readable description)",
  "files": [
    {
      "path": "string (file path relative to project root)",
      "changes": [
        {
          "kind": "insert_prop | remove_prop | change_prop_value | insert_element | remove_element",
          "component": "string (component name)",
          "prop": "string (prop name)",
          "value": "any (new value)",
          "reason": "string (why this change)"
        }
      ]
    }
  ]
}
```

```ts
type PatchProposal = {
  summary: string;
  files: PatchFile[];
};

type PatchFile = {
  path: string;
  changes: PatchChange[];
};

type PatchChange = {
  kind: ChangeKind;
  component: string;
  prop?: string;
  value?: unknown;
  reason: string;
};

type ChangeKind =
  | "insert_prop"
  | "remove_prop"
  | "change_prop_value"
  | "insert_element"
  | "remove_element";
```

## Principles

- **Proposals are plans, not mutations.** The agent proposes; the human approves. No source
  file is modified without explicit confirmation.
- **Minimal viable patch.** Propose the smallest change that fixes the issue. Do not refactor
  surrounding code, restyle unrelated components, or reorganize imports.
- **Every change needs a reason.** The `reason` field must explain why the change is needed,
  not just what the change does.
- **Patch proposals target individual files with a clear list of changes per file.** Multiple
  files can appear in one proposal when the fix spans files, but keep the proposal scoped to
  one semantic problem.

## When to Propose Patches

| Issue | Patch trigger |
|---|---|
| **Missing semantic ID** | A tappable component (Button, TextField, Toggle, Slider, Picker) has no `id` prop. Agent tools cannot target it. |
| **Duplicate semantic ID** | Two sibling nodes share the same `id`. The runtime warns; the agent should flag it. |
| **Inconsistent ID naming** | An ID breaks the `screen.section.control` convention. Flows referencing the old ID will fail. |
| **Missing `intent` prop** | A Button performs a meaningful action (`submit_order`, `delete_item`, `navigate_next`) but has no intent metadata. |
| **Missing accessibility label** | A control is visible but has no `accessibilityLabel`, making it invisible to screen readers and some semantic inspection tools. |
| **Wrong `privacy` level** | A `SecureField` for a password has `privacy: "none"` instead of `privacy: "private"`. |
| **Stale ID in flow file** | A semantic flow references a node ID that was renamed or removed. Patch the flow file, not the source component. |
| **Accessibility gap** | A control has `accessibilityRole` but no `accessibilityLabel`, or vice versa. |

## Change Kinds

### `insert_prop`
Add a missing prop to a component. Most common patch type.

```json
{
  "kind": "insert_prop",
  "component": "Button",
  "prop": "id",
  "value": "checkout.submitOrder",
  "reason": "Agent cannot target this button without a stable id. The submit-order button is a critical checkout step."
}
```

### `remove_prop`
Remove a harmful or incorrect prop.

```json
{
  "kind": "remove_prop",
  "component": "TextField",
  "prop": "id",
  "value": "crypto.randomUUID()",
  "reason": "Auto-generated IDs change on every render. Flows and MCP tool calls referencing this field will break. Replace with a stable literal."
}
```

Note: `remove_prop` is typically paired with an `insert_prop` for the same component when
replacing a bad value. A standalone `remove_prop` without a replacement needs an especially
strong reason (e.g., removing a prop that causes a runtime crash).

### `change_prop_value`
Fix a prop value without changing the prop's presence.

```json
{
  "kind": "change_prop_value",
  "component": "TextField",
  "prop": "privacy",
  "value": "private",
  "reason": "This field accepts a password. Current privacy level 'sensitive' still exposes the label to agent tools. Must be 'private' to fully redact."
}
```

### `insert_element`
Insert a new component into the tree. Use sparingly — prefer `insert_prop` on existing
components.

```json
{
  "kind": "insert_element",
  "component": "accessibilityLabel",
  "prop": "label",
  "value": "Delete item",
  "reason": "The delete button on each cart row has no accessibility label. Screen reader users cannot identify the action."
}
```

### `remove_element`
Remove a component from the tree. Rarely needed; most fixes are additive.

```json
{
  "kind": "remove_element",
  "component": "View",
  "prop": "pointerEvents",
  "value": "none",
  "reason": "pointerEvents='none' on a wrapping View blocks all touch events including agent taps. Children are unreachable."
}
```

## Safety: Always Ask First

The agent must never write source files without human approval. The correct flow:

1. Agent inspects the semantic tree or flow failure.
2. Agent constructs a `PatchProposal` JSON object.
3. Agent presents the proposal to the human via the MCP `proposePatch` tool (returns the
   proposal as structured output) or via a chat message with the JSON.
4. Human reviews and either approves, rejects, or modifies.
5. If approved, the agent applies the changes to the source files.

Approval is explicit. "Looks good" without reading the changes is not approval. The agent
must present enough context (the failing node, the current code, the proposed change, and the
reason) for the human to make an informed decision.

## Example: Missing Semantic IDs on Checkout Form

**Scenario:** An agent inspects a checkout screen and finds buttons and text fields without
semantic IDs. Flows cannot target these controls, and the MCP `inspectTree` output shows
unnamed nodes.

**Current source (simplified):**

```tsx
// app/checkout.tsx
<Screen id="checkout" title="Checkout">
  <VStack spacing={16}>
    <TextField label="Name" placeholder="Full name" />
    <TextField label="Email" placeholder="email@example.com" />
    <Button intent="submit_order">Place Order</Button>
  </VStack>
</Screen>
```

**Generated patch proposal:**

```json
{
  "summary": "Add stable semantic IDs to the checkout form so agent flows can target each field and the submit button.",
  "files": [
    {
      "path": "app/checkout.tsx",
      "changes": [
        {
          "kind": "insert_prop",
          "component": "TextField",
          "prop": "id",
          "value": "checkout.name",
          "reason": "Name field has no id. Flow steps need to input the customer name. ID follows screen.control convention."
        },
        {
          "kind": "insert_prop",
          "component": "TextField",
          "prop": "id",
          "value": "checkout.email",
          "reason": "Email field has no id. Flow steps need to input the customer email. ID follows screen.control convention."
        },
        {
          "kind": "insert_prop",
          "component": "Button",
          "prop": "id",
          "value": "checkout.submitOrder",
          "reason": "Submit button has no id. Flow steps and MCP tap calls cannot target it. This button triggers a gated submit_order action."
        }
      ]
    }
  ]
}
```

**After human approval, the source becomes:**

```tsx
// app/checkout.tsx
<Screen id="checkout" title="Checkout">
  <VStack spacing={16}>
    <TextField id="checkout.name" label="Name" placeholder="Full name" />
    <TextField id="checkout.email" label="Email" placeholder="email@example.com" />
    <Button id="checkout.submitOrder" intent="submit_order">Place Order</Button>
  </VStack>
</Screen>
```

## What Not to Patch

Do not propose patches for:

- **Minor style changes** (padding, color, font size). These are design decisions, not
  agent-control blockers.
- **Imports or module organization.** Keep imports as-is unless a missing import is the root
  cause of a broken semantic ID.
- **Structural refactors** (converting a VStack to a FlatList, extracting a subcomponent).
  If the structure works, patch the IDs, not the layout.
- **Non-actionable text labels.** Decorative text doesn't need an `id`. Focus on controls
  the agent must interact with.
- **Third-party component internals.** Only patch code in this project's source tree.

## Patch Validation

Before applying an approved patch:

1. Run `npx @agent-ui/cli doctor` to confirm no duplicate IDs are introduced.
2. Run the app's existing test suite to catch regressions.
3. Re-run `inspectTree` to confirm new nodes appear with the expected IDs and roles.
4. If flows reference the patched IDs, re-run those flows against the updated tree.

## Relationship to Flow Healing

Patch proposals and flow healing are related but distinct:

| | Patch Proposal | Flow Healing |
|---|---|---|
| **Target** | Source code (`.tsx`, `.ts`) | Flow files (`.json`) |
| **Trigger** | Missing IDs, duplicate IDs, wrong prop values | Stale flow step referencing a renamed/removed node ID |
| **Output** | Changes to component props in source files | Updated `targetId` or condition in the flow JSON |
| **Approval** | Human reviews and approves before source is written | Human reviews and approves before flow is rewritten |

When a flow fails, first check whether the issue is in the source (missing/wrong ID → patch
proposal) or in the flow (stale reference → flow healing). Do not propose a source patch for
a stale flow reference, and do not rewrite a flow for a missing source ID.
