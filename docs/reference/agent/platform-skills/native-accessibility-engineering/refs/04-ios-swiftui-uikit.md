# iOS, iPadOS, macOS: SwiftUI and UIKit Accessibility

## When to Use

Load this file for SwiftUI, UIKit, AppKit-adjacent, or Apple platform accessibility work. Standard controls usually provide a strong baseline. Custom views, composite cells, charts, gestures, dynamic content, and custom drawing need explicit accessibility.

## SwiftUI Essentials

- `.accessibilityLabel(...)`: short accessible name.
- `.accessibilityHint(...)`: result of activating the element when unclear.
- `.accessibilityValue(...)`: current value for sliders, steppers, progress, ratings, and custom values.
- `.accessibilityAddTraits(...)` and `.accessibilityRemoveTraits(...)`: adjust role-like traits.
- `.accessibilityElement(children: .combine)`: merge child elements into one logical element.
- `.accessibilityElement(children: .contain)`: create a parent that contains accessible children.
- `.accessibilityElement(children: .ignore)`: replace children with the parent element.
- `.accessibilityHidden(true)`: hide decorative or unavailable content.
- `.accessibilityAction(...)`: expose secondary actions.
- `.accessibilityAdjustableAction(...)`: support increment/decrement controls.
- `.accessibilitySortPriority(...)`: adjust order only when view structure cannot express the desired order.
- `@AccessibilityFocusState`: manage accessibility focus when needed.

## SwiftUI Patterns

### Icon Button

```swift
Button(action: close) {
    Image(systemName: "xmark")
}
.accessibilityLabel("Close")
```

### Composite Row

```swift
VStack(alignment: .leading) {
    Text(accountName)
    Text(balance)
}
.accessibilityElement(children: .combine)
```

Use `.combine` when the row is one logical item. Do not combine child buttons that need independent focus.

### Adjustable Control

```swift
Text("Rating \(rating)")
    .accessibilityLabel("Rating")
    .accessibilityValue("\(rating) out of 5")
    .accessibilityAdjustableAction { direction in
        switch direction {
        case .increment: rating = min(rating + 1, 5)
        case .decrement: rating = max(rating - 1, 0)
        default: break
        }
    }
```

## UIKit Essentials

- `isAccessibilityElement`: expose custom views or hide containers.
- `accessibilityLabel`: short accessible name.
- `accessibilityHint`: consequence of action when unclear.
- `accessibilityValue`: current value or state.
- `accessibilityTraits`: button, link, header, selected, notEnabled, adjustable, image, and related traits.
- `accessibilityCustomActions`: expose secondary actions through VoiceOver.
- `UIAccessibility.post(notification:argument:)`: announce changes or move accessibility focus.
- `UIAccessibilityElement` and containers: represent sub-elements inside custom drawing.

Use `UIAccessibilityCustomAction` for actions that are otherwise gesture-only, hidden behind swipe, or difficult with motor impairments.

## Focus and Announcements

- After navigation or modal presentation, move focus to the screen title or first meaningful element.
- After validation, move focus to the first error or announce a concise summary.
- Use `.screenChanged` for major context changes, `.layoutChanged` for partial updates, and `.announcement` for status text.
- Restore focus to the trigger after dismissing a sheet, popover, or modal when possible.
- Avoid repeated announcements for rapidly changing content.

## Dynamic Type and Visual Settings

- Use standard text styles and scalable layout.
- Test all Dynamic Type sizes, including accessibility sizes.
- Avoid fixed heights that clip labels or buttons.
- Preserve functionality with Bold Text, Increase Contrast, Reduce Motion, Reduce Transparency, Button Shapes, and Differentiate Without Color.
- Keep tappable targets at least 44x44 pt.

## VoiceOver and Switch Control

- Test on physical hardware for release-critical flows.
- Use Screen Curtain to catch visual dependency during VoiceOver testing.
- Ensure every task works without custom gestures.
- Expose custom actions for swipe, drag, reorder, delete, favorite, share, and more actions.
- Check rotor navigation for headings, links, form controls, and custom rotors where relevant.

## Review Checklist

- Labels are short, localized, and do not include role names.
- State and value are separate from labels.
- Custom views are exposed as useful elements or containers.
- Composite rows are grouped intentionally.
- Child buttons remain independently reachable.
- Gesture-only actions have custom actions.
- Dynamic Type does not clip content.
- Motion-sensitive users can complete the flow.
- VoiceOver order matches visual/task order.
