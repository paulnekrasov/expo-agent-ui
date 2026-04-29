# Native Accessibility Testing and Audit Workflow

## Testing Matrix

Create a matrix for every release-critical flow:

| Platform | Assistive Technology | Automated Gate | Manual Gate |
| --- | --- | --- | --- |
| iOS/iPadOS | VoiceOver, Switch Control | Accessibility Inspector, unit/UI tests where available | Physical device, Screen Curtain, Dynamic Type |
| Android | TalkBack, Switch Access, Voice Access | Accessibility Scanner, Espresso checks, Compose checks | Device/emulator with TalkBack, large font/display size |
| Windows | Narrator, keyboard | Accessibility Insights, UIA checks | Keyboard-only and Narrator walkthrough |
| Flutter/RN/MAUI | Native AT per platform | Framework tests plus native checks | Test each target platform, not only one shared code path |

## Manual Screen Reader Sequence

1. Turn on the target screen reader.
2. Start from the previous screen and navigate into the target screen.
3. Swipe or move to every element in order.
4. Confirm each element announces name, role, state, value, and hint/action as expected.
5. Activate every control.
6. Perform custom actions.
7. Trigger validation errors, loading, success, empty, disabled, and selected states.
8. Open and close dialogs, sheets, menus, and navigation.
9. Confirm focus moves and restores correctly.
10. Repeat for large text and relevant contrast/motion settings.

## Non-Touch Input Sequence

Verify task completion with:

- Hardware keyboard or D-pad where supported.
- Switch Access or equivalent scanning.
- Voice Access or voice control where relevant.
- Screen reader custom actions for gesture-only operations.

Every critical task must have an accessible path without precise touch gestures.

## Automated Gates

Automated tools catch important failures but not enough to prove quality. Use them as regression gates.

Android Views:

- Add Espresso `AccessibilityChecks.enable()`.
- Use root-view checks when screen-wide coverage is needed.
- Suppress only narrowly scoped known issues with a ticket and expiration.

Jetpack Compose:

- Use semantic assertions in Compose tests.
- Enable Compose accessibility checks when the project version supports them.
- Print merged/unmerged semantics trees when debugging.

React Native:

- Query components by role, label, state, and value in component tests.
- Pair framework tests with native Android/iOS accessibility checks where possible.

iOS:

- Use Accessibility Inspector and UI tests as support tools.
- Do not replace physical VoiceOver verification with simulator-only checks.

Windows:

- Use Accessibility Insights and UI Automation inspection.
- Verify keyboard focus order and control patterns.

## Severity

Critical:

- Blocks completion of a critical task for screen reader, keyboard, switch, or voice users.
- Data loss, payment, authentication, safety, or consent cannot be completed accessibly.
- Modal or navigation creates a trap.

Serious:

- Major task is possible but confusing, slow, or unreliable.
- Incorrect role/state/value causes wrong operation.
- Dynamic errors or success states are not announced.

Moderate:

- Extra verbosity, duplicate focus, weak grouping, poor order, or missing secondary metadata.
- Large text causes layout degradation but not total task failure.

Minor:

- Small wording issues, noncritical decorative exposure, polish-level ordering issues.

## Finding Template

```markdown
Severity: [Critical / Serious / Moderate / Minor]
Platform: [iOS / Android / Windows / shared]
Stack: [React Native / Compose / SwiftUI / UIKit / Android Views / Flutter / MAUI / WinUI]
Assistive technology: [VoiceOver / TalkBack / Narrator / Switch Access / keyboard / etc.]
Location: [screen, component, file, element]
Observed: [actual behavior]
Expected: [accessible behavior]
Impact: [who is affected and how]
Fix: [specific code/design remediation]
Verify: [manual and automated steps]
WCAG: [optional mapping]
```

## Release Gate

Do not sign off on accessibility until:

- Critical and serious issues are resolved or formally accepted with a dated risk owner.
- Target assistive technologies were tested on real target platforms.
- Large text and contrast/motion settings were tested for critical flows.
- Automated gates are passing or have narrow, documented suppressions.
- The report avoids claiming full compliance beyond tested scope.
