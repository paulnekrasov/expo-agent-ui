# React Native Accessibility

## When to Use

Load this file for React Native or Expo apps targeting iOS, Android, or both. React Native maps props to native iOS and Android accessibility APIs, but behavior differs by platform. Verify on both VoiceOver and TalkBack for production changes.

## Key Props

- `accessible`: exposes a `View`, `Text`, or touchable as an accessibility element. Touchable components are accessible by default. Avoid unnecessary parent `accessible={true}` if it hides useful children.
- `role`: preferred newer role prop when available; it communicates purpose and takes precedence over `accessibilityRole`.
- `accessibilityRole`: role such as `button`, `link`, `image`, `header`, `switch`, `checkbox`, `tab`, `search`, `progressbar`, `adjustable`, `none`.
- `accessibilityLabel`: accessible name. Use for icon-only controls, custom visuals, and cases where visible text is insufficient.
- `accessibilityHint`: outcome of activation when the label alone is not enough. Keep short and localized.
- `accessibilityState`: `disabled`, `selected`, `checked`, `busy`, `expanded`.
- `accessibilityValue`: range or text value for sliders, progress, steppers, ratings, and custom adjustable controls.
- `accessibilityActions` plus `onAccessibilityAction`: expose custom or standard actions such as activate, increment, decrement, escape, magicTap, expand, collapse, longpress, or list-item actions.
- `importantForAccessibility`: Android tree inclusion control: `auto`, `yes`, `no`, `no-hide-descendants`.
- `accessibilityElementsHidden` and `accessibilityViewIsModal`: iOS controls for hiding siblings or marking modal context.
- `accessibilityLiveRegion` or `aria-live`: Android live announcements for polite/assertive updates.
- `accessibilityLabelledBy` or `aria-labelledby`: Android association when a visible label should name a control.

## Implementation Patterns

### Icon Button

```tsx
<Pressable
  role="button"
  accessibilityLabel={t("Close")}
  accessibilityHint={t("Closes the dialog")}
  onPress={onClose}
>
  <Icon name="close" />
</Pressable>
```

Use the visible label when present. Add a label only when the control is icon-only or visual-only.

### Toggle

```tsx
<Pressable
  role="switch"
  accessibilityLabel={t("Dark mode")}
  accessibilityState={{ checked: enabled }}
  onPress={toggle}
>
  <Text>{t("Dark mode")}</Text>
</Pressable>
```

Do not encode state only in the label. Use `accessibilityState` so the platform can announce changes consistently.

### Adjustable Control

```tsx
<View
  accessible
  role="slider"
  accessibilityLabel={t("Volume")}
  accessibilityValue={{ min: 0, max: 100, now: volume }}
  accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
  onAccessibilityAction={(event) => {
    if (event.nativeEvent.actionName === "increment") increase();
    if (event.nativeEvent.actionName === "decrement") decrease();
  }}
/>
```

Use increment/decrement for custom sliders, steppers, scrubbers, quantity pickers, and rating controls.

### Swipe or Row Actions

Expose swipe-only or long-press actions through `accessibilityActions`.

```tsx
<Pressable
  role="button"
  accessibilityLabel={`${title}, ${subtitle}`}
  accessibilityActions={[
    { name: "activate", label: t("Open") },
    { name: "delete", label: t("Delete") },
  ]}
  onAccessibilityAction={handleRowAction}
>
  <Text>{title}</Text>
  <Text>{subtitle}</Text>
</Pressable>
```

Keep destructive custom action labels explicit.

### Modal

- Move initial accessibility focus to the title or first meaningful control.
- Hide or deprioritize background content while the modal is open.
- Support escape/back dismissal when the design allows dismissal.
- Restore focus to the trigger after close.

Use iOS modal props for iOS and Android focus/event strategies for Android. Test both.

## Platform Caveats

- iOS VoiceOver and Android TalkBack can disagree on nested accessible elements.
- Android emulators may not include TalkBack unless the image has Google Play.
- VoiceOver is best tested on physical iOS hardware; simulator and macOS Accessibility Inspector are useful but not equivalent.
- `accessibilityHint` behavior differs: users can disable hints on iOS, while Android behavior may differ.
- Treat RN `aria-*` aliases as convenience props, not a guarantee of web-equivalent behavior.

## Testing

- Unit/component tests: query by role, label, state, and value using the project's React Native testing library.
- E2E: verify critical flows with VoiceOver and TalkBack enabled, not only by snapshot or Detox selectors.
- Manual: swipe through all controls, activate each action, test custom actions, verify announcements, test large text, and check modal focus.
- Android: use TalkBack, Accessibility Scanner, and where native tests exist, Android accessibility checks.
- iOS: use VoiceOver on a device and Accessibility Inspector for tree inspection.

## Review Checklist

- All icon-only controls have localized labels.
- Visible labels are not duplicated by parent labels.
- Custom controls expose role, state, value, and actions.
- Gesture-only interactions have custom actions.
- Modal screens hide background content and restore focus.
- Lists do not create noisy or fragmented focus stops.
- Large text does not clip controls or hide actions.
- Both iOS and Android behavior were tested for shared components.
