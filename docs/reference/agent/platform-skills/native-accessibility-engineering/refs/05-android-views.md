# Android Views Accessibility

## When to Use

Load this file for Android XML layouts, ViewBinding, custom `View`, RecyclerView, legacy Android UI, or hybrid View plus Compose screens.

## Core Attributes and APIs

- `android:contentDescription`: label meaningful images, image buttons, and custom visual controls.
- `android:labelFor`: associate visible `TextView` labels with editable fields.
- `android:importantForAccessibility`: include, exclude, or hide descendants.
- `android:hint`: provide input examples or expected values for edit controls.
- `android:accessibilityHeading`: mark headings where supported.
- `android:stateDescription`: provide state text when default state is unclear.
- `android:accessibilityLiveRegion`: announce changing content.
- `ViewCompat.setAccessibilityDelegate`: customize accessibility info for custom views.
- `AccessibilityNodeInfoCompat`: set class name, role-like behavior, state, range info, collection info, and actions.
- `ViewCompat.addAccessibilityAction`: expose custom actions.

## Labels

Label interactive controls with useful, unique, localized text.

```xml
<TextView
    android:id="@+id/emailLabel"
    android:text="@string/email"
    android:labelFor="@+id/emailInput" />

<EditText
    android:id="@+id/emailInput"
    android:hint="@string/email_hint" />
```

Use `contentDescription` for icon-only buttons and meaningful images. Set decorative views to `importantForAccessibility="no"` or remove their descriptions.

## Custom Views

Custom-drawn controls need explicit node information.

```kotlin
ViewCompat.setAccessibilityDelegate(view, object : AccessibilityDelegateCompat() {
    override fun onInitializeAccessibilityNodeInfo(
        host: View,
        info: AccessibilityNodeInfoCompat
    ) {
        super.onInitializeAccessibilityNodeInfo(host, info)
        info.text = host.context.getString(R.string.volume)
        info.stateDescription = "${value}%"
        info.className = SeekBar::class.java.name
        info.addAction(AccessibilityNodeInfoCompat.ACTION_SCROLL_FORWARD)
        info.addAction(AccessibilityNodeInfoCompat.ACTION_SCROLL_BACKWARD)
    }
})
```

For complex custom drawing, implement virtual children rather than exposing one giant unlabeled canvas.

## Actions

Expose gesture-only operations as accessibility actions.

```kotlin
ViewCompat.addAccessibilityAction(
    row,
    context.getString(R.string.archive)
) { _, _ ->
    archiveItem()
    true
}
```

Use this for swipe actions, drag-and-drop, dismiss, reveal actions, reorder, expand/collapse, and secondary row actions.

## Focus, Keyboard, and Touch

- Use natural XML order where possible.
- Avoid manually forcing focus order unless the layout cannot be corrected.
- Make all controls keyboard, D-pad, TalkBack, Switch Access, and Voice Access reachable.
- Use at least 48x48 dp touch targets.
- Ensure focused and selected states are visually distinct.
- Do not trap focus in custom containers.

## Dynamic Content

- Use live regions for important status changes.
- Move accessibility focus after major navigation or dialog display.
- Associate field errors with fields and make error text reachable.
- Avoid continuous announcements for countdowns or progress ticks.

## Testing

- Use Accessibility Scanner for quick local findings.
- Add Espresso `AccessibilityChecks.enable()` for View-based UI tests.
- Use `setRunChecksFromRootView(true)` when broad screen coverage is needed.
- Suppress only narrow, temporary, known findings.
- Test manually with TalkBack, Switch Access, Voice Access, large font, display size, color inversion/high contrast, and hardware keyboard where relevant.

## Review Checklist

- Every meaningful icon button and image has a label.
- Decorative images are hidden.
- Edit fields have visible labels or label associations.
- Custom views expose role, state, value, and actions.
- Gesture-only actions are available to accessibility services.
- RecyclerView rows avoid noisy duplicate focus.
- Dialogs and bottom sheets do not expose inactive background actions.
- Espresso checks and TalkBack manual tests were run for critical flows.
