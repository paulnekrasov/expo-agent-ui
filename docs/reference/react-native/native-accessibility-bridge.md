# Native Platform Accessibility Bridge

Status: active reference
Product stage: Stage 2, Stage 3, Stage 7
Skill source: `agent/platform-skills/native-accessibility-engineering/SKILL.md`,
`refs/01-native-principles.md`, `refs/02-react-native.md`,
`refs/03-jetpack-compose.md`, `refs/04-ios-swiftui-uikit.md`

This document bridges the React Native accessibility semantics (defined in
`react-native/accessibility-semantics.md`) with platform-specific native accessibility
patterns from the native-accessibility-engineering skill. Load it when working on Stage 7
adapters or when platform-specific accessibility behavior matters.

## When To Load

| Task | Load This + |
|---|---|
| Compose adapter accessibility | This file + `accessibility-semantics.md` |
| SwiftUI adapter accessibility | This file + `accessibility-semantics.md` |
| Cross-platform accessibility audit | This file + `accessibility-semantics.md` |
| TalkBack/VoiceOver-specific behavior | This file only |

## Core Contract: React Native → Native Platform

Agent UI's semantic tree derives from React Native accessibility props. Each platform maps
these differently. The adapters must preserve the semantic contract while respecting native
accessibility conventions.

### Compose (Android / TalkBack)

| React Native Prop | Compose Equivalent | Notes |
|---|---|---|
| `accessible={true}` | `Modifier.semantics {}` + focusability | Creates accessibility node |
| `accessibilityLabel` | `contentDescription` | Short, localized, no role in text |
| `accessibilityHint` | Hint text in semantics | TalkBack reads after label |
| `accessibilityRole` / `role` | `Role.*` in semantics | `button`, `switch`, `checkbox`, etc. |
| `accessibilityState.disabled` | Disabled state | Via `enabled` param or semantics |
| `accessibilityState.checked` | `toggleableState` | `On`, `Off`, `Indeterminate` |
| `accessibilityState.selected` | `selected = true` | Via `selectable` modifier |
| `accessibilityState.expanded` | `expand` / `collapse` semantics | Custom semantics |
| `accessibilityState.busy` | No direct; use `stateDescription` | Announce "loading" state |
| `accessibilityValue` | `progressBarRangeInfo` or `stateDescription` | Range or text |
| `accessibilityActions` | `customActions` | Swipe, dismiss, reorder |
| `accessibilityLiveRegion` | `liveRegion` | `polite` or `assertive` |
| `importantForAccessibility` | `hideFromAccessibility()` / `clearAndSetSemantics` | Visibility control |
| `testID` | Compose test tag | `Modifier.testTag("...")` |

### SwiftUI (iOS / VoiceOver)

| React Native Prop | SwiftUI Equivalent | Notes |
|---|---|---|
| `accessible={true}` | `isAccessibilityElement` (automatic for controls) | Focus boundary |
| `accessibilityLabel` | `.accessibilityLabel(...)` | Short, localized |
| `accessibilityHint` | `.accessibilityHint(...)` | Action consequence |
| `accessibilityRole` / `role` | `.accessibilityAddTraits(...)` | `.isButton`, `.isHeader`, etc. |
| `accessibilityState.disabled` | Not enabled state (automatic) | Via `disabled()` modifier |
| `accessibilityState.checked` | `.accessibilityValue("on"/"off")` | For toggles/checkboxes |
| `accessibilityState.selected` | `.accessibilityAddTraits(.isSelected)` | Selection state |
| `accessibilityState.expanded` | `.accessibilityValue("expanded"/"collapsed")` | For disclosure |
| `accessibilityState.busy` | No direct; use announcement | Post `.layoutChanged` |
| `accessibilityValue` | `.accessibilityValue(...)` | Current value for adjustable |
| `accessibilityActions` | `.accessibilityAction(...)` + `.accessibilityAdjustableAction` | Custom and adjustable |
| `accessibilityViewIsModal` / `aria-modal` | Automatic for `.sheet` / `.fullScreenCover` | Modal scope |
| `accessibilityElementsHidden` | `.accessibilityHidden(true)` | Hide branch |
| `testID` | `accessibilityIdentifier` | For UI testing |

## Platform-Specific Patterns

### Compose Patterns (from 03-jetpack-compose.md)

- **Grouping**: `Modifier.semantics(mergeDescendants = true) {}` to merge a row.
- **Custom toggle**: Use `toggleable(value, role = Role.Switch, onValueChange)`.
- **Custom actions**: `customActions = listOf(CustomAccessibilityAction(...))`.
- **Headings**: `heading()` in semantics block.
- **Live regions**: `liveRegion = LiveRegionMode.Polite` or `.Assertive`.
- **Pane titles**: `paneTitle` for sheets, dialogs, panes.
- **Error**: `error("message")` in semantics.
- **Testing**: `composeTestRule.onRoot().printToLog()` for tree inspection.
- **Automated checks**: `ui-test-junit4-accessibility` (Compose 1.8.0+).

### SwiftUI Patterns (from 04-ios-swiftui-uikit.md)

- **Grouping**: `.accessibilityElement(children: .combine)` for single focus stop.
- **Custom actions**: `.accessibilityAction(named:) {}`.
- **Adjustable**: `.accessibilityAdjustableAction { direction in ... }`.
- **Focus management**: `@AccessibilityFocusState`.
- **Announcements**: `UIAccessibility.post(notification: .screenChanged)`.
- **Dynamic Type**: Use standard text styles; test at all sizes including accessibility.
- **VoiceOver order**: `.accessibilitySortPriority(...)` only when view order won't work.

## Cross-Platform Accessibility Convergence

| Accessibility Concept | iOS Guidance | Android Guidance | Agent UI Default |
|---|---|---|---|
| Minimum touch target | 44×44 pt | 48×48 dp | 48×48 dp |
| Screen reader | VoiceOver | TalkBack | Both must work |
| Switch input | Switch Control | Switch Access | Both supported |
| Text scaling | Dynamic Type | Font scale | Test at max sizes |
| Reduced motion | Reduce Motion | Animator duration scale | Respect both |
| High contrast | Increase Contrast | High contrast text | Respect both |
| Focus after navigation | Move to title/first element | Move to title/first element | Consistent behavior |
| Modal scope | `accessibilityViewIsModal` | `paneTitle` / framework | Prune siblings |

## Audit Workflow (from 07-testing-audit-workflow.md)

1. **Map** the screen: controls, labels, images, gestures, states, modals, lists.
2. **Define** semantic contract: name, role, state, value, action, focus, grouping.
3. **Implement** platform-first: standard controls, then explicit semantics on custom.
4. **Test** with actual AT: screen reader, keyboard, switch, text scaling, contrast.
5. **Report** precisely: impact, platform, AT, element, expected, actual, fix, verify.

## Severity Triage

| Severity | Definition |
|---|---|
| Critical | User blocked; cannot complete core task |
| Serious | Significant difficulty or confusion; workaround exists but poor |
| Moderate | Annoyance or inefficiency; task completable with effort |
| Minor | Polish issue; does not block or confuse |

## Non-Goals

- Do not duplicate the full platform skill accessibility references here.
- Do not implement native accessibility bridges before Stage 7 adapters exist.
- Do not override React Native accessibility semantics from the core layer.
- For deep platform accessibility, load the full skill at
  `agent/platform-skills/native-accessibility-engineering/`.
