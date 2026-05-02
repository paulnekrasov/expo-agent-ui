# iOS-Inspired Tokens For Expo Agent UI

Status: inspiration only
Product stage: Stage 2 - Component Primitives, Stage 7 - Expo UI Adapter
Counterpart: `design/android-tokens.md` (Material Design 3 tokens)

The old parser project collected iOS visual guidance for touch targets, typography, and semantic
colors. Expo Agent UI should keep the useful taste-level rules while implementing them through
React Native styles and optional Expo UI adapters.

## Touch Targets

- Interactive controls should target at least `44 x 44` points of tappable area.
- Icon-only controls may have smaller visible glyphs, but their hit area must remain large enough
  for touch.
- Agent-facing metadata should expose disabled/busy state so automation does not tap controls that
  are not actionable.

## Typography

- Prefer platform text styles and semantic variants over hard-coded font details.
- Use compact headings inside panels, forms, and tool surfaces.
- Avoid viewport-scaled font sizes.
- Preserve readable line heights and wrapping behavior on narrow screens.

## Semantic Color Principles

- Use semantic roles such as background, surface, label, secondary label, separator, tint,
  destructive, success, warning, and disabled.
- Resolve concrete colors through a theme layer rather than embedding raw colors in primitives.
- Support light and dark modes from the start.
- Treat iOS color values as inspiration, not mandatory cross-platform output.

## First Token Surface

The Stage 2 primitive layer may expose a small token vocabulary:

```ts
type AgentUIColorRole =
  | "background"
  | "surface"
  | "text"
  | "secondaryText"
  | "separator"
  | "tint"
  | "destructive"
  | "disabled";
```

Do not expand this into a full design system until primitives and semantic registration prove the
need.
