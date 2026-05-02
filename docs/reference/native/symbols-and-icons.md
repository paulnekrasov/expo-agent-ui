# Symbols And Icons Reference

Status: inspiration only
Product stage: Stage 2 - Component Primitives, Stage 7 - Expo UI Adapter
Counterpart: `native/material-symbols-and-icons.md` (Material Symbols / Android)

The retired renderer included SF Symbols research. Expo Agent UI should keep the semantic idea of
icons without depending on Apple-only symbol rendering in core.

## Rules

- Core primitives should accept an icon abstraction, not a platform-specific symbol object.
- Use accessible labels for icon-only buttons.
- Do not make SF Symbols mandatory for Android or web.
- Optional adapters may map icon names to `@expo/vector-icons`, SF Symbols, or Expo UI/native
  controls when available.

## Agent Semantics

Agents should reason from labels and intent, not from glyph names alone:

```tsx
<Button id="editor.save" label="Save" intent="save_document" icon="save" />
```

## Deferred Work

- Icon package choice is deferred until primitives need a concrete implementation.
- Native SF Symbols bridging belongs behind an optional adapter boundary.
