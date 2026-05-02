# SwiftUI Motion Mapping For Reanimated

Status: inspiration only
Product stage: Stage 6 - Motion Layer
Counterpart: `motion/compose-motion-mapping.md` (Compose / Material Motion)

The old animation research is retained here as taste guidance for Stage 6. Expo Agent UI maps
SwiftUI-like motion names to Reanimated behavior instead of emulating CSS or Core Animation.

## Motion Principles

- Prefer transform and opacity animations.
- Avoid layout-thrashing animation paths.
- Respect reduced motion.
- Keep motion presets named for intent: `smooth`, `snappy`, `bouncy`, `gentle`, `easeInOut`.
- Emit semantic motion events only when they help an agent understand flow progress.

## Mapping Sketch

```ts
motion.easeInOut({ duration: 350 })
motion.snappy()
motion.bouncy()
transition.opacity()
transition.slide({ edge: "bottom" })
layoutTransition.smooth()
```

## Preserved Ideas

- Sheets generally feel like bottom-edge movement with a dimming layer.
- Tab changes are usually subtle and should not imply spatial hierarchy unless the app explicitly
  asks for it.
- Slide transitions should be direction-aware and respect RTL/leading/trailing semantics.
- Scale transitions usually need opacity to avoid visual harshness.

## Non-Goals

- Do not port the old CSS transition renderer.
- Do not implement motion before Stage 6.
- Do not require Reanimated in the Stage 2 component primitive slice beyond peer metadata already
  established in package foundation.
