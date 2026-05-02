# Material Symbols And Icons Reference

Status: inspiration only
Product stage: Stage 2 - Component Primitives, Stage 7 - Expo UI Adapter
Counterpart: `native/symbols-and-icons.md` (iOS SF Symbols)
Skill source: `agent/platform-skills/android-ecosystem-skill/SKILL.md`,
`agent/platform-skills/native-app-design-engineering/SKILL.md`

The iOS symbols reference established the semantic icon abstraction. This covers the
Android/Material side and the cross-platform icon contract.

## Rules

- Core primitives accept an icon abstraction, not a platform-specific icon object.
- On Android, icons resolve through Material Icons, `@expo/vector-icons`, or the Compose
  adapter's native icon mapping.
- Use accessible content descriptions for icon-only buttons. Set `contentDescription = null`
  for purely decorative icons.
- Do not require Material Symbols on iOS or web.
- Optional adapters map icon names to Material Symbols (Android), SF Symbols (iOS), or
  `@expo/vector-icons` (shared fallback).

## Cross-Platform Icon Mapping

| Intent | SF Symbol (iOS) | Material Icon (Android) | Agent UI |
|---|---|---|---|
| Close | `xmark` | `Icons.Filled.Close` | `icon="close"` |
| Back | `chevron.left` | `Icons.AutoMirrored.Filled.ArrowBack` | `icon="back"` |
| Save | `square.and.arrow.down` | `Icons.Filled.Save` | `icon="save"` |
| Share | `square.and.arrow.up` | `Icons.Filled.Share` | `icon="share"` |
| Settings | `gear` | `Icons.Filled.Settings` | `icon="settings"` |
| Search | `magnifyingglass` | `Icons.Filled.Search` | `icon="search"` |
| Add | `plus` | `Icons.Filled.Add` | `icon="add"` |
| Delete | `trash` | `Icons.Filled.Delete` | `icon="delete"` |
| Favorite | `heart` / `heart.fill` | `Icons.Filled.Favorite` | `icon="favorite"` |

## Agent Semantics

Agents reason from labels and intent, not from glyph names:

```tsx
<Button id="editor.save" label="Save" intent="save_document" icon="save" />
```

## Deferred Work

- Icon package choice deferred until primitives need a concrete implementation.
- Native Material Symbols bridging belongs behind the optional Compose adapter boundary.
- Variable font icon rendering is a future Android adapter enhancement.
