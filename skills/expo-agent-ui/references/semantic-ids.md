# Semantic ID Reference

Semantic IDs are the stable addressing mechanism for Agent UI primitives. Agents navigate the
semantic tree by ID, not by coordinates, selectors, or visible text.

## Design Rules

### Always
- Use kebab-case, hierarchical, human-readable IDs: `"settings-save-btn"`, `"profile-email-field"`
- Prefix with screen scope: `"settings-*"`, `"profile-*"`, `"checkout-*"`
- Make IDs unique within a screen (the runtime warns about duplicates in development)
- Every actionable primitive (Button, TextField, Toggle, Slider, Picker, SecureField) must have an `id`

### Never
- Use auto-generated IDs (crypto.randomUUID() in production code)
- Use array indices as IDs
- Expose internal data (user IDs, email addresses) in semantic IDs
- Change an ID without updating flow files, tests, and MCP tool calls that reference it

## Semantic Node Shape

```ts
type SemanticNode = {
  id: string;
  type: SemanticRole;
  label?: string;
  screen?: string;
  state: SemanticState;
  actions: SemanticAction[];
  intent?: string;
  value?: unknown;
  children: SemanticNode[];
  bounds?: Rect;
  props?: Record<string, unknown>;
  privacy?: SemanticPrivacy;
};
```

### SemanticRole

The UI role of the node: `button`, `textInput`, `toggle`, `slider`, `picker`, `image`,
`text`, `list`, `section`, `form`, `screen`, `stack`, `scroll`, `spacer`.

### SemanticState

Runtime state: `disabled`, `busy`, `checked`, `expanded`, `selected`, `active`,
`focused`, `error`.

### SemanticAction

Named actions available on the node: `tap`, `input`, `toggle`, `scroll`,
`navigate`, `select`.

### SemanticPrivacy

Redaction level: `none` (full visibility), `sensitive` (redacted value, visible label),
`private` (fully redacted to agent tools).

## Stable ID Patterns

### Screen-level prefixing

```
settings-screen
├── settings-theme-picker
├── settings-notifications-toggle
├── settings-volume-slider
└── settings-save-btn
```

### Form grouping

```
checkout-form
├── checkout-email-field
├── checkout-name-field
├── checkout-address-field
└── checkout-submit-btn
```

### List items

```
chat-list
├── chat-item-0
├── chat-item-1
└── chat-item-2
```

## Redaction

Mark sensitive fields with `privacy` metadata:

```tsx
<TextField
  id="payment-card-field"
  accessibilityLabel="Card number"
  // Component registers privacy in semantic metadata
/>
```

The semantic runtime supports per-field redaction:
- `none` — Full value visible to agent tools
- `sensitive` — Value redacted, label visible
- `private` — Fully hidden from agent tools

Redaction happens before any semantic tree leaf leaves the app runtime. Agent tools
receive redacted data; original values stay inside the app process.
