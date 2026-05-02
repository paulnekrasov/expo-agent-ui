# Material Design 3 Tokens For Expo Agent UI

Status: inspiration only
Product stage: Stage 2 - Component Primitives, Stage 7 - Expo UI Adapter
Counterpart: `design/ios-tokens.md` (iOS)
Skill source: `agent/platform-skills/android-ecosystem-skill/references/material3-theming.md`,
`agent/platform-skills/native-app-design-engineering/SKILL.md`

The iOS tokens reference collected Apple-specific visual guidance. This companion document
collects Material Design 3 guidance for the Android Compose adapter and cross-platform
defaults.

## Touch Targets

- Interactive controls must provide at least `48 × 48` dp of tappable area.
- This is stricter than iOS (44×44 pt). Agent UI should use 48×48 dp as the cross-platform
  minimum when targeting both platforms.
- Icon-only controls may have smaller visible glyphs, but hit area must meet the target.
- Compose `Modifier.minimumInteractiveComponentSize()` enforces this automatically for
  Material components.

## Typography

- Material 3 defines a type scale with semantic roles: `displayLarge`…`displaySmall`,
  `headlineLarge`…`headlineSmall`, `titleLarge`…`titleSmall`, `bodyLarge`…`bodySmall`,
  `labelLarge`…`labelSmall`.
- Agent UI should map to semantic text style variants, not pixel sizes.
- Test with system font scaling on Android. Avoid fixed-height containers that clip at large
  font sizes.
- Compose typography uses `Typography()` class; do not scatter font weights across screens.

## Material 3 Color Roles

Material 3 defines semantic color roles through dynamic color schemes:

| M3 Color Role | Agent UI Mapping | Purpose |
|---|---|---|
| `primary` | `tint` | Brand accent, prominent buttons, active states |
| `onPrimary` | (text on tint) | Text/icons on primary surfaces |
| `primaryContainer` | (variant) | Less-prominent primary surfaces |
| `secondary` | (secondary tint) | Secondary actions, chips, filters |
| `surface` | `surface` | Cards, sheets, dialogs |
| `surfaceVariant` | (surface variant) | Differentiated surface levels |
| `background` | `background` | App background |
| `error` | `destructive` | Errors, destructive actions |
| `onSurface` | `text` | Primary text on surface |
| `onSurfaceVariant` | `secondaryText` | Secondary text, icons |
| `outline` | `separator` | Borders, dividers |
| `outlineVariant` | (light separator) | Subtle borders |
| `inverseSurface` | (inverse) | Snackbar, tooltip backgrounds |
| `surfaceDim` / `surfaceBright` | (adaptive surface) | Android 14+ surface tones |

## Dynamic Color

- Android 12+ supports dynamic color from the user's wallpaper.
- When the product brand permits, prefer `dynamicDarkColorScheme()` / `dynamicLightColorScheme()`.
- Always provide custom light/dark schemes as fallback for pre-Android 12.
- Agent UI should treat dynamic color as an optional enhancement, not a requirement.

## First Token Surface (Cross-Platform Convergence)

The Stage 2 primitive layer defines a shared token vocabulary. The Android mapping:

```ts
// From ios-tokens.md:
type AgentUIColorRole =
  | "background"     // M3: background
  | "surface"        // M3: surface
  | "text"           // M3: onSurface
  | "secondaryText"  // M3: onSurfaceVariant
  | "separator"      // M3: outline / outlineVariant
  | "tint"           // M3: primary
  | "destructive"    // M3: error
  | "disabled";      // M3: onSurface @ 38% opacity (M3 convention)
```

## Dark Mode

- Material 3 provides paired light and dark color schemes by default.
- `isSystemInDarkTheme()` in Compose detects system preference.
- Surface elevation in dark mode uses tonal elevation (color shifts), not shadow.
- Test both modes; ensure semantic color roles are used consistently.

## Shape System

- Material 3 defines shape tokens: `extraSmall`, `small`, `medium`, `large`, `extraLarge`,
  `full`.
- Use semantic shape tokens, not raw corner radius values.
- Concentric radius rule applies: `outerRadius = innerRadius + padding`.

## Cross-Platform Token Convergence

| Concept | iOS Guidance | Material 3 Guidance | Agent UI Default |
|---|---|---|---|
| Minimum touch target | 44×44 pt | 48×48 dp | 48×48 dp |
| Text styles | System styles (title, body, caption) | M3 type scale (headline, body, label) | Semantic variants |
| Color approach | Semantic roles + system colors | Dynamic color + semantic roles | Semantic roles |
| Dark mode | System appearance | `isSystemInDarkTheme()` | Follow system |
| Shape tokens | Continuous corners | `ShapeDefaults` | Semantic shape tokens |

## Non-Goals

- Do not require Material 3 theming in core Agent UI. It belongs behind the Compose adapter.
- Do not hardcode Material 3 color values into cross-platform primitives.
- Do not replicate the full M3 token system; distill to the shared semantic vocabulary.
