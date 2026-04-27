# Control Chrome Reference

Status: inspiration only
Product stage: Stage 2 - Component Primitives

This document preserves useful control-shape knowledge from the old renderer research. Expo Agent
UI should use it to guide defaults, not to build a Canvas clone of iOS controls.

## Useful Defaults

- Buttons need clear pressed, disabled, loading, and focused states.
- Toggles should expose binary state through both accessibility state and semantic metadata.
- Sliders should expose minimum, maximum, current value, and step where available.
- Steppers and pickers can wait until after the first primitive slice unless a consuming app needs
  them immediately.
- Lists and forms should use stable section/row structure because agents rely on hierarchy.

## Semantic Requirements

Every actionable control should make these properties easy to provide:

```ts
{
  id: "settings.notifications.enabled",
  type: "toggle",
  label: "Notifications",
  state: "enabled",
  actions: ["toggle"],
  intent: "set_notifications"
}
```

## Visual Guidance

- Preserve compact, native-feeling density.
- Do not nest cards inside cards.
- Use separators and spacing to organize repeated rows.
- Use icon buttons for common tool actions when a recognizable icon exists.
- Keep disabled controls visibly muted and semantically disabled.

## Non-Goals

- Do not hard-code UIKit pixel metrics into core primitives.
- Do not implement wheel picker, iOS stepper, or custom slider rendering before the primitive and
  semantic runtime layers exist.
