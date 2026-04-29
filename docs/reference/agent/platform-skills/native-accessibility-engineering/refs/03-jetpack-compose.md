# Jetpack Compose Accessibility

## When to Use

Load this file for native Android UI built with Jetpack Compose. Compose exposes accessibility through the semantics tree. Material, Compose UI, and Foundation components include useful defaults, but custom composables, graphics, gestures, complex list rows, and dynamic panes often need explicit semantics.

## Core APIs

- `Modifier.semantics { ... }`: add semantic properties.
- `contentDescription`: describe meaningful images and icons; use localized strings.
- `contentDescription = null`: mark decorative `Image` or `Icon` content as decorative when the composable supports it.
- `Role`: button, switch, checkbox, radio button, tab, image, dropdown list, and other control roles.
- `stateDescription`: override default state wording when the default is too generic.
- `toggleableState`: represent checked, unchecked, or indeterminate.
- `progressBarRangeInfo`: expose progress/range values.
- `heading()`: mark headings for navigation.
- `liveRegion`: announce important content changes.
- `paneTitle`: identify bottom sheets, dialogs, and other window-like changes.
- `error(...)`: attach expanded error context.
- `customActions`: expose swipe, dismiss, drag, reorder, or secondary actions.
- `collectionInfo` and `collectionItemInfo`: describe custom collections where useful.

## Defaults and Overrides

Prefer Material components because they set many semantics automatically. Add or override semantics when:

- An icon or image has meaning.
- A custom row should be one focus stop.
- A visual state is not exposed as state.
- A gesture has no screen-reader equivalent.
- A custom drawing or canvas has no text equivalent.
- A bottom sheet, pane, or alert needs a boundary.

Do not add semantics that duplicate text already exposed by child composables.

## Images and Icons

```kotlin
Icon(
    imageVector = Icons.Filled.Share,
    contentDescription = stringResource(R.string.label_share)
)
```

Use `contentDescription = null` for decorative images. If an image is also a button, put the label on the actionable control, not on both the icon and parent.

## Grouping and Tree Control

Use grouping to match how users understand a component.

```kotlin
Row(Modifier.semantics(mergeDescendants = true) {}) {
    Text(title)
    Text(subtitle)
}
```

Use `clearAndSetSemantics` only when replacing a subtree's semantics is intentional. It removes previous semantics from accessibility, autofill, and testing consumers. Use `hideFromAccessibility()` for purely decorative or redundant content.

## Custom Toggle

```kotlin
Row(
    modifier = Modifier
        .toggleable(
            value = selected,
            role = Role.Switch,
            onValueChange = onChange
        )
        .semantics {
            stateDescription = if (selected) "Enabled" else "Disabled"
        }
) {
    Text(text = label)
}
```

Prefer `toggleable` or `selectable` because they set interaction semantics. Add state descriptions only when the default announcement is not meaningful enough.

## Custom Actions

```kotlin
Modifier.semantics {
    customActions = listOf(
        CustomAccessibilityAction(
            label = stringResource(R.string.remove_article),
            action = {
                removeArticle()
                true
            }
        )
    )
}
```

Use custom actions for swipe-to-dismiss, reveal actions, reorder, archive, favorite, drag, and secondary list-item operations.

## Touch, Text, and Motion

- Ensure touch targets are at least 48x48 dp.
- Use scalable typography and test with increased font size.
- Avoid fixed-height containers that clip at large font scale.
- Respect animator duration scale and reduce nonessential motion where possible.
- Do not rely on color alone for state or validation.

## Inspection and Testing

- Use Layout Inspector to inspect merged and unmerged semantics trees.
- Use `composeTestRule.onRoot().printToLog()` for tree debugging.
- Use semantic matchers such as `onNodeWithContentDescription`, `hasRole`, `assertIsSelected`, and `assertIsOn`.
- For Compose 1.8.0 and later, enable automated checks with `ui-test-junit4-accessibility`, `enableAccessibilityChecks()`, and `tryPerformAccessibilityChecks()`.
- Combine automated checks with TalkBack and Switch Access testing.

## Review Checklist

- Material/default semantics are used where possible.
- Meaningful graphics have localized descriptions.
- Decorative graphics are hidden.
- Composite rows have sensible merge behavior.
- Child buttons inside rows remain reachable when independently actionable.
- Bottom sheets/dialogs use `paneTitle` or framework equivalents.
- Error content is programmatically attached.
- Custom gestures have custom actions.
- Large font scale and TalkBack traversal were manually verified.
