# Motion Design Principles — Cross-Platform Native Motion DNA

> **Counterpart**: Platform-specific motion _mapping_ lives in
> [`motion/swiftui-motion-mapping.md`](../motion/swiftui-motion-mapping.md) and
> [`motion/compose-motion-mapping.md`](../motion/compose-motion-mapping.md).
> This file covers the _design theory_ — when, why, and how much motion to apply.

_Read-only reference · Distilled from `native-app-design-engineering` skill_

## When to Load

| Task | Load? |
|---|---|
| Choosing spring vs tween for a new interaction | **Yes** |
| Deciding animation duration for a new component | **Yes** |
| Reviewing a PR for motion quality | **Yes** |
| Wiring a Reanimated preset to a component | No — use `motion/reanimated-4.md` |
| Mapping a SwiftUI/.spring to Reanimated | No — use `motion/swiftui-motion-mapping.md` |

---

## 1. Timing & Easing Quick Reference

| Interaction | Duration / Spring | Easing | Notes |
|---|---|---|---|
| Button tap feedback | 80–120 ms, spring ζ=0.8 | Fast, minimal overshoot | Haptic at press start |
| Toggle switch | 150–220 ms, spring ζ=0.8 | Slight overshoot OK | Match platform default |
| Modal/sheet enter | 200–250 ms | easeOut / FastOutSlowIn | Under ~250 ms |
| Modal/sheet exit | 150–200 ms | easeIn | Faster than enter |
| List item add/remove | 200–250 ms, spring ζ=0.9 | Directional + opacity | Move + alpha combo |
| Tooltip show/hide | 150 ms / 100 ms | easeOut / easeIn | Fast in, faster out |
| Success pop | 400–500 ms, bounce ≈0.25 | Low stiffness spring | Overshoot allowed; sparingly |
| Spinner/loading | 600 ms+ | Linear | Linear OK for constant motion |
| Tab/page transition | 250–350 ms | spring ζ=0.85 | Match platform conventions |

**Rule**: High-frequency actions → approach instant feedback. Rare milestones → richer, slower animation.

---

## 2. Disney Principles Applied to UI

### Squash & Stretch
- 2–5% scale for professional buttons; 10–15% for playful toggles.
- Preserve perceived volume: `scaleX * scaleY ≈ 1`.
- If a press feels flat or weightless, add subtle squash/stretch.

### Anticipation
- 60–120 ms preparatory state before the main movement.
- Use for taps, drags, reveals, destructive confirmations.
- Skip for keyboard commands and high-frequency shortcuts.

### Staging
- One focal point at a time. Dim/freeze secondary content.
- If the eye doesn't know where to look, reduce simultaneous motion.

### Follow-Through & Overlap
- Containers land first, then children stagger 20–40 ms behind.
- Modest spring overshoot on the primary moving element.

### Slow In & Slow Out
- Interactive motion must accelerate/decelerate naturally.
- Reserve linear easing for constant-rate indicators (spinners, progress bars).

### Secondary Action
- Shadows settle, ripples fade, icons shift, counters tick.
- If secondary motion is more noticeable than the state change → reduce it.

### Exaggeration
- Enterprise/professional flows: tiny exaggeration (scale 0.96–1.04).
- Celebrations/delight: larger bounce allowed.

### Appeal
- Consistent timing, springs, haptics, hierarchy across the entire app.
- Define shared motion presets before adding more animations.

---

## 3. Micro-Interactions Checklist

| Control | Must Have | Nice to Have |
|---|---|---|
| Button | Scale + opacity press feedback + haptic | Shadow depth change |
| Toggle | Spring with slight overshoot | Thumb squash on press |
| Checkbox | Fill then check stroke sequence | Bounce on check |
| Icon state swap | Scale + opacity transition | Symbol effect (iOS) |
| Badge/count | Elastic scale on meaningful change | — |
| Text field focus | Border/fill color shift | Label float animation |

**Common mistake**: No micro-feedback → users tap twice.
**Fix**: Always add at least scale or opacity feedback on press, plus haptic for critical buttons.

---

## 4. Entrance & Exit Patterns

### Entrances
- Combine alpha with a small translation (+/- 8–12 dp) in a logical direction.
- Lists: stagger with 50 ms delay per item (cap at ~10 items).
- Modals: slide up from bottom, dim background, slight scale.

### Exits
- Make exits noticeably **faster** than entrances.
- Pure fade with no direction feels abrupt → add small directional move.
- List removals: fade/scale first, then collapse spacing.

### Shared Element Transitions
- SwiftUI: `matchedGeometryEffect` — stable IDs, same Namespace, mutual exclusion.
- Compose: `SharedTransitionLayout` + `sharedElement()` / `sharedBounds()`.
- React Native: Use Reanimated shared transitions or navigation shared elements.

---

## 5. Anti-Pattern Catalog

### SwiftUI
| Anti-Pattern | Symptom | Fix |
|---|---|---|
| `.animation()` without `value:` | Random animations leak everywhere | Always pass `value:` parameter |
| Animating layout-heavy properties | Jank, frequent re-layout | Use transforms (scaleEffect, offset) |
| Overusing GeometryReader | Layout oscillations | Simpler layout + offset/scale |
| Timer-driven animation | Stuttering, drift | Use TimelineView or implicit animation |
| Ignoring Reduce Motion | Users get nauseous | Branch on `accessibilityReduceMotion` |

### Compose
| Anti-Pattern | Symptom | Fix |
|---|---|---|
| Spec allocated every recomposition | Animations restart unexpectedly | `remember { tween() }` |
| LaunchedEffect manual delay loops | Hard to interrupt, chaotic | Use `animate*AsState` or `Animatable` |
| `animate*AsState` in conditional branch | State created inconsistently | Move outside conditional |
| Animating layout modifiers | Recomposition cost spikes | Use `graphicsLayer` transforms |
| Ignoring reduced motion | Large transitions persist | Branch spec on reduce-motion setting |

### Cross-Platform
| Anti-Pattern | Symptom | Fix |
|---|---|---|
| Animating before initial layout | Elements "jump" on first appear | Gate on `didAppear` state |
| Re-triggering on every recomposition | Twitchy flickering | Tie to meaningful state only |
| No interruption handling | Animation "locks" on rapid input | Use state-driven springs |
| Fixed pixel offsets | Scale wrong on different devices | Use relative factors or container fractions |

---

## 6. Haptics Alignment

- **iOS**: `SensoryFeedback` (iOS 17+) or `UIImpactFeedbackGenerator`. Trigger at press start for taps, at peak for success.
- **Android**: `LocalHapticFeedback.current.performHapticFeedback()`. Align with state change. Avoid during infinite animations.
- **React Native**: `expo-haptics` (conditionally on iOS). Use views with built-in haptics (`Switch`, `DateTimePicker`).

---

## 7. Accessibility: Reduced Motion

Every animation decision must branch on `prefers-reduced-motion`:

- Replace large spatial moves with opacity or small-scale transitions.
- Preserve information via color, icons, and static state changes.
- Spring-based animations: increase damping to ≥0.95, reduce duration.
- Parallax and auto-playing motion: disable entirely.

---

## Skill Sources

- `native-app-design-engineering/references/native-disney-principles.md`
- `native-app-design-engineering/references/native-spring-and-easing.md`
- `native-app-design-engineering/references/native-micro-interactions.md`
- `native-app-design-engineering/references/native-entrance-exit-patterns.md`
- `native-app-design-engineering/references/native-shared-transitions.md`
- `native-app-design-engineering/references/native-anti-pattern-catalogue.md`
- `native-app-design-engineering/references/native-platform-api-inventory.md`
