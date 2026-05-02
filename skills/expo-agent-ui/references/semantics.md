# Semantic Node Schema & ID Conventions

Agents navigate the Agent UI semantic tree by stable ID, not by coordinates,
selectors, or visible text. This reference defines the `AgentUISemanticNode`
shape, the registry that maintains it, and the conventions that keep it
deterministic across sessions.

---

## 1. Semantic Node Shape

Every node in the semantic tree has the public shape `AgentUISemanticNode`:

```ts
interface AgentUISemanticNode {
  id: string;
  type: AgentUIPrimitiveRole | (string & {});
  label?: string;
  screen?: string;
  state: AgentUISemanticState;
  actions: AgentUISemanticActionMetadata[];
  intent?: string;
  value?: AgentUISemanticNodeValue;
  children: AgentUISemanticNode[];
  privacy?: AgentUISemanticPrivacy;
  generated?: boolean;
}
```

| Field      | Description |
|------------|-------------|
| `id`       | Stable, human-readable, dot-separated identifier (e.g. `checkout.payment.cardNumber`). When the component author omits `id`, the registry auto-generates `agent-ui.generated.<N>` and sets `generated: true`. |
| `type`     | The semantic role. Canonical values come from `AgentUIPrimitiveRole`; extensible via `(string & {})`. |
| `label`    | User-facing accessible name derived from `accessibilityLabel`, `label`, or readable text children. |
| `screen`   | The owning screen's logical name. Set explicitly via `Screen.name`/`AgentUISemanticBoundary.screen` or inferred from the nearest `Screen` ancestor. |
| `state`    | Runtime boolean flags (checked, disabled, expanded, etc.). |
| `actions`  | Array of `AgentUISemanticActionMetadata` declaring which agent actions the node supports. |
| `intent`   | Stable, locale-independent purpose string (e.g. `"submit_order"`, `"navigate_next"`). Agents should use `intent` rather than localized labels for business logic. |
| `value`    | Ranged/selected value payload (min, max, now, text, selected, checked). |
| `children` | Recursively nested `AgentUISemanticNode[]`. Built from React tree hierarchy using `AgentUISemanticBoundary` mount keys. |
| `privacy`  | Redaction level. `"none"` (default), `"redacted"`, or `"dev-only"`. |
| `generated`| `true` when the node's `id` was auto-generated because the component author omitted a stable `id`. |

---

## 2. Semantic Roles (`AgentUIPrimitiveRole`)

The canonical roles form the `type` field. Roles determine which actions are
available and how the registry exposes the node to agents.

| Role         | Description |
|-------------|-------------|
| `screen`    | Root-level semantic boundary. Its `id` doubles as the screen scope name. |
| `stack`     | Layout container (`VStack`, `HStack`, `ZStack`). |
| `spacer`    | Flexible spacer; non-interactive, accessibility-hidden. |
| `text`      | Read-only text content. |
| `button`    | Tappable control. Default actions: `activate`, `tap`. |
| `image`     | Graphic; defaults to decorative unless an `accessibilityLabel` is provided. |
| `icon`      | Glyph (SF Symbol / Material Symbol); defaults to decorative. |
| `label`     | Paired icon + text label. |
| `textInput` | Single-line or multi-line text entry (both `TextField` and `SecureField`). |
| `scroll`    | Scrollable container. Default actions: `scroll`, `observe`. |
| `list`      | Flat list container. Default action: `observe`. |
| `section`   | Grouped section with optional header/footer. Default action: `observe`. |
| `form`      | Grouped form container with automatic field spacing. Default action: `observe`. |
| `toggle`    | Boolean switch. Default actions: `toggle`, `activate`. |
| `slider`    | Adjustable numeric control. Default actions: `increment`, `decrement`, `set_value`. |
| `picker`    | Radio-group selection. Default action: `select`. |
| `stepper`   | Counter with +/- buttons. Default actions: `increment`, `decrement`, `set_value`. |

Agents can also encounter custom `type` strings via the `(string & {})` extension;
treat unknown roles conservatively.

---

## 3. Semantic Actions

### Action Names (`AgentUIPrimitiveAction`)

| Action        | Typical roles |
|---------------|---------------|
| `activate`    | `button`, `toggle` |
| `tap`         | `button` |
| `observe`     | `scroll`, `list`, `section`, `form` |
| `input`       | `textInput` |
| `focus`       | `textInput` |
| `clear`       | `textInput` |
| `submit`      | `textInput` |
| `scroll`      | `scroll` |
| `toggle`      | `toggle` |
| `increment`   | `slider`, `stepper` |
| `decrement`   | `slider`, `stepper` |
| `set_value`   | `slider`, `stepper` |
| `select`      | `picker` |

### Action Metadata (`AgentUISemanticActionMetadata`)

```ts
interface AgentUISemanticActionMetadata {
  name: AgentUIPrimitiveAction | (string & {});
  label?: string;
  destructive?: boolean;
  source?: "accessibility" | "component" | "agent-ui";
}
```

- `source` is always `"agent-ui"` for actions registered via the semantic
  primitive `actions` array. Custom action names are supported through the
  `(string & {})` extension.

### Action Dispatch Result Codes

| Code | Meaning |
|------|---------|
| `ACTION_DISPATCHED` | Action executed successfully. |
| `NODE_NOT_FOUND` | No visible node matched the given `id`. |
| `ACTION_AMBIGUOUS` | Multiple visible nodes matched the `id`. Supply a `screen` scope. |
| `ACTION_UNSUPPORTED` | The node does not declare this action in its `actions` array. |
| `ACTION_DISABLED` | The node is `disabled` or `busy`. |
| `ACTION_HANDLER_MISSING` | The node declares the action but no runtime handler is attached. |
| `ACTION_HANDLER_FAILED` | The handler threw an exception. |

---

## 4. Semantic State (`AgentUISemanticState`)

```ts
interface AgentUISemanticState {
  busy?: boolean;
  checked?: boolean | "mixed";
  disabled?: boolean;
  expanded?: boolean;
  hidden?: boolean;
  selected?: boolean;
}
```

| Field      | Source                                      |
|------------|---------------------------------------------|
| `busy`     | `busy` prop on Button, Toggle, Slider, etc. |
| `checked`  | `Toggle.value` (boolean); `checked`/`selected` on other controls. `"mixed"` is reserved for future indeterminate states. |
| `disabled` | `disabled` prop. Automatically `true` when `editable={false}` on text fields. |
| `expanded` | Reserved for disclosure controls (currently unused in v0). |
| `hidden`   | Derived from `hidden` prop. Hidden nodes are pruned from the snapshot tree by default. |
| `selected` | `Picker` with a matching `selectedValue`. Also usable on table rows, tabs, etc. |

---

## 5. Semantic Value (`AgentUISemanticNodeValue`)

```ts
interface AgentUISemanticNodeValue {
  text?: string;
  checked?: boolean;
  min?: number;
  max?: number;
  now?: number;
  step?: number;
  selected?: string;
  redaction?: AgentUISemanticPrivacy;
  hasValue?: boolean;
}
```

| Field       | Used by |
|-------------|---------|
| `text`      | Toggle (formatted on/off), Slider, Stepper, Picker (selected option label). |
| `checked`   | Toggle (`value`). |
| `min`, `max`, `now`, `step` | Slider, Stepper. |
| `selected`  | Picker (stringified selected `option.value`). |
| `hasValue`  | TextField / SecureField — `true` when the field has non-empty input, `false` when empty. |
| `redaction` | Per-node override; defaults to the node-level `privacy` field. |

---

## 6. Privacy & Redaction

```ts
type AgentUISemanticPrivacy = "none" | "redacted" | "dev-only";
```

| Level        | Behavior |
|-------------|----------|
| `none`      | Full visibility to agent tools. |
| `redacted`  | Value and text are removed from `AgentUISemanticNodeValue` before leaving the runtime. The label is still visible. Applied automatically to `SecureField`. |
| `dev-only`  | The node is excluded from snapshots outside development builds. |

- `SecureField` components always register with `privacy: "redacted"` and set
  `value.redaction = "redacted"`.
- Custom `privacy` can be set on any primitive via the `privacy` prop.
- Redaction is applied when the node is cloned via `cloneSemanticNode` for
  action handler callbacks and snapshot construction.

---

## 7. Semantic ID Conventions

Agents rely on stable, predictable IDs. Follow these rules on every screen.

### Rules

1. **Stable — never computed.** Use string literals.
   ```tsx
   // CORRECT
   <Button id="checkout.submit" />
   // WRONG — unstable across renders
   <Button id={`btn_${index}`} />
   ```

2. **Unique per screen.** No two mounted nodes may share the same `id` within the
   same screen scope. The registry warns about duplicates in development.

3. **Hierarchical, dot-separated.** Follow the pattern `screen.section.control`.
   ```
   checkout.payment.cardNumber
   checkout.payment.cvv
   checkout.shipping.address
   checkout.shipping.city
   checkout.confirmOrder
   ```

4. **Lowercase, no spaces, no special characters except dots.** Keep IDs
   machine-parseable and URL-safe.

5. **Required for all actionable components:** `Button`, `TextField`, `SecureField`,
   `Toggle`, `Slider`, `Picker`, `Stepper`. Development warnings fire at runtime if
   an actionable component is missing an `id`.

6. **Recommended for containers:** `Screen`, `Section`, `Form`, `List`, `Scroll`.
   Container IDs enable scoped tree queries and `waitFor` conditions.

7. **Intent metadata supplements IDs.** Use `intent` for the business purpose of
   an action, so agents can reason about behavior without parsing localized labels.
   ```tsx
   <Button id="checkout.submit" intent="submit_order">Submit Order</Button>
   <Button id="checkout.cancel" intent="navigate_back">Cancel</Button>
   ```

### Generated IDs

When an `id` prop is omitted, the registry assigns `agent-ui.generated.<N>`
and marks the node with `generated: true`. Agents should avoid depending on
generated IDs because they are sequential (non-semantic) and change across
sessions.

---

## 8. Registry Lifecycle

### Architecture

The semantic registry (`AgentUISemanticRegistry`) is a singleton created inside
`AgentUIProvider` via `createAgentUISemanticRegistry()`. It maintains a `Map` of
`MountedSemanticRecord` entries keyed by mount key.

```ts
interface AgentUISemanticRegistry {
  registerPrimitive(primitive: AgentUISemanticPrimitive): AgentUISemanticUnregister;
  getNodeById(id: string, options?: AgentUISemanticNodeLookupOptions): AgentUISemanticNode | undefined;
  getSnapshot(options?: SemanticSnapshotOptions): AgentUISemanticSnapshot;
  dispatchAction(id: string, action: AgentUISemanticActionName, options?): Promise<AgentUISemanticActionResult>;
  clear(): void;
}
```

### Mount / Unmount

Every component that should appear in the semantic tree calls
`useDeferredSemanticPrimitive(primitive)`:

1. **On mount:** The hook calls `runtime.registerPrimitive(primitive)`, which
   stores a `MountedSemanticRecord` in the registry map.
2. **On unmount:** The returned unregister function removes the record from the
   map (idempotent — double-calling the unregister is safe).
3. **Tree construction:** `buildSemanticTree()` (used by `getSnapshot`, `getNodeById`,
   and `dispatchAction`) reads all mounted records, sorts them by registration order,
   and wires parent-child relationships using `mountKey`/`parentMountKey`.

### Parent-Child Wiring

`AgentUISemanticBoundary` wraps a component's children and provides them with a
`parentMountKey` React context value. Each child's `useDeferredSemanticPrimitive`
reads that context and records the parent relationship. This is how the flat
registry map becomes a hierarchical tree.

```tsx
// In Button (simplified)
const mountKey = useDeferredSemanticPrimitive(semantic);
return (
  <AgentUISemanticBoundary mountKey={mountKey}>
    {children} // children inherit this mountKey as parentMountKey
  </AgentUISemanticBoundary>
);
```

### Snapshot Options

`getSnapshot()` accepts optional filters:

| Option | Effect |
|--------|--------|
| `screen` | Filter tree to a single screen scope. |
| `rootId` | Return only the subtree rooted at the given node id. |
| `maxDepth` | Limit tree depth (0 = no nodes, 1 = root only, etc.). |
| `includeHidden` | When `true`, include nodes with `state.hidden === true` (pruned by default). |

The snapshot result also includes `generatedNodeCount` and `mountedNodeCount`
for debugging.

---

## 9. Development Runtime Gating

Agent UI semantics are development-only. The system gates this through
`isDevelopmentRuntime()`:

```ts
// packages/core/src/props.ts
export function isDevelopmentRuntime(): boolean {
  return (globalThis as { __DEV__?: boolean }).__DEV__ === true;
}
```

### Effect on the Runtime

| Context | Production (`__DEV__` = false) | Development (`__DEV__` = true) |
|---------|-------------------------------|--------------------------------|
| `AgentUIProvider` | Uses `noopRuntime` — `registerPrimitive` is a no-op. | Uses the real `AgentUISemanticRegistry`. |
| `useDeferredSemanticPrimitive` | The `useEffect` early-returns; nothing registers. | Full registration lifecycle. |
| Bridge gate | Returns `DISABLED`. | Returns `REQUIRES_PAIRING` or `PAIRED`. |

### `AgentUIProvider` with Custom Runtime

```tsx
<AgentUIProvider runtime={customRegistry}>
  {/* registry is always active, regardless of __DEV__ */}
</AgentUIProvider>
```

When a `runtime` prop is provided, it is used unconditionally (development or not),
bypassing the `noopRuntime` fallback. This is intended for testing.

---

## 10. `testID` Mapping

Semantic IDs map to React Native `testID` for native test frameworks (Detox,
Maestro, XCUITest, Espresso).

```ts
// packages/core/src/props.ts
export function resolvePrimitiveTestID(
  id: string | undefined,
  testID: string | undefined
): string | undefined {
  return testID ?? id;
}
```

Every primitive resolves its `testID` as `testID ?? id`. This means:
- If you pass an explicit `testID`, it takes precedence.
- Otherwise, the semantic `id` becomes the native `testID`.
- If neither is provided, `testID` is `undefined` and the native element has
  no test identifier.

### TestID for Picker Options

Picker options receive a derived testID: `resolvedTestID` + `.` + `option.id`.
For example, a picker with `id="checkout.shipping"` and options with ids
`"standard"` and `"express"` will produce testIDs `checkout.shipping.standard`
and `checkout.shipping.express`.

### TestID for Stepper Buttons

Stepper +/- buttons receive `resolvedTestID.decrement` and
`resolvedTestID.increment`.

---

## 11. Duplicate ID Handling

The registry enforces uniqueness via `collectDuplicateStableIdKeys()`:

1. On every `registerPrimitive` call, the registry rebuilds the full semantic
   tree and scans for duplicate stable ids (non-generated, non-empty) within
   each screen scope.
2. The uniqueness key is `"<screen>\u0000<id>"` — two nodes with the same `id`
   but different `screen` values do not collide.
3. When a duplicate is found, the registry calls `warnInDevelopment()` with a
   message like:
   ```
   Duplicate Agent UI semantic id "submit" detected in screen scope "checkout".
   Stable IDs must be unique within a screen.
   ```
4. Warnings are emitted only once per unique `(screen, id)` pair to avoid log
   spam.
5. **Lookup behavior (last-write-wins):** The registry map itself is keyed by
   `mountKey`, not `id`. During `getSnapshot()` tree construction, both nodes
   appear in the tree as separate entries. When looking up by `id` (via
   `getNodeById` or `dispatchAction`), if multiple visible nodes match, the
   result is `undefined` (for `getNodeById`) or `ACTION_AMBIGUOUS` (for
   `dispatchAction`) — providing a `screen` scope resolves the ambiguity.

---

## 12. Debugging the Semantic Tree

### Runtime Warnings

Actionable components that are missing required metadata fire development
warnings:

| Component | Warning condition |
|-----------|-------------------|
| Button, TextField, SecureField, Toggle, Slider, Picker, Stepper | Missing or empty `id` |
| Button, TextField, SecureField, Toggle, Slider, Picker, Stepper | Missing or empty `accessibilityLabel` (and no readable text children) |
| Picker | Zero options, or any option with empty `id`/`label` |
| Image, Icon | Non-decorative but missing `accessibilityLabel` |
| List, Section, Form | Missing `id` or `accessibilityLabel` (soft warning) |

### Using `inspectTree` via MCP

```sh
# In your MCP client:
inspectTree({ screen: "checkout", maxDepth: 3, includeHidden: false })
```

Returns a full `AgentUISemanticSnapshot`:
```json
{
  "generatedNodeCount": 2,
  "mountedNodeCount": 14,
  "nodes": [ ... ]
}
```

### Using `getState` for a single node

```sh
getState({ id: "checkout.payment.cardNumber" })
```

### Validation Script

```sh
node skills/expo-agent-ui/scripts/validate-semantic-ids.js app/
```

Scans the project for duplicated, missing, or non-conforming semantic IDs.

### Checklist for Debugging

1. Is `__DEV__` set to `true` in the bundle? (Required for runtime to activate.)
2. Are all actionable nodes providing stable, unique `id` props?
3. Are `Screen` components setting a `name` or `id` for screen scoping?
4. Are there duplicate IDs within the same screen scope? (Check dev console.)
5. Are generated IDs (`agent-ui.generated.*`) leaking into agent flows?
   Replace with stable IDs where agent interaction is needed.
6. Is `accessibilityLabel` set on all actionable and non-decorative nodes?
   Missing labels mean `label` will be `undefined` in the node.
