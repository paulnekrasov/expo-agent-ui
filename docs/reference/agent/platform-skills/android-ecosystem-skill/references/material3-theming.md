# Material 3, Adaptive UI, and Accessibility

Load this file when implementing Material Design 3, dynamic color, dark theme,
adaptive layouts, edge-to-edge, insets, touch targets, or accessibility semantics.

## Material 3 Defaults

- Use Material 3 for new UI. Treat Material 2 components as legacy unless the
  project is in an explicit migration phase.
- Wrap the app in `MaterialTheme(colorScheme, typography, shapes)`.
- Read colors from `MaterialTheme.colorScheme`; do not hardcode app-wide colors
  inside components.
- Use dynamic color on Android 12+ when product brand permits; provide custom
  light/dark schemes as fallback.
- Define typography once through `Typography`; do not scatter font sizes and
  weights across screens.

```kotlin
@Composable
fun AppTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val dark = isSystemInDarkTheme()
    val colorScheme =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (dark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        } else {
            if (dark) DarkColors else LightColors
        }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content,
    )
}
```

## Component Migration Notes

| Area | Modern default | Legacy risk |
|---|---|---|
| Navigation | `NavigationBar`, `NavigationRail`, adaptive navigation suite. | Fixed bottom nav on large screens. |
| App bars | M3 `TopAppBar` variants with scroll behavior. | Custom bars that ignore insets. |
| Sheets | M3 bottom sheets with explicit state. | Dialog-like custom overlays with broken back behavior. |
| Inputs | M3 TextField/SearchBar/DatePicker/TimePicker. | Custom controls without semantics or error states. |
| Buttons/FAB | M3 Button/FAB variants with semantic roles. | Styled boxes without accessibility roles. |

## Adaptive Layouts

- Use window size classes or project equivalents to choose compact, medium, and
  expanded layouts.
- Compact: bottom navigation and single-pane flows are usually appropriate.
- Medium/expanded: consider navigation rail, list-detail, supporting pane, or
  canonical adaptive layouts.
- Use `GridCells.Adaptive` for responsive grids.
- Test foldables, tablets, Chromebooks, rotation, multi-window, and virtual
  displays when the product claims large-screen support.

## Edge-to-Edge and Insets

- Android 15 enforced edge-to-edge for target API 35. Android 16 target API 36
  disables the opt-out; verify live docs before changing target SDK.
- Do not hide content behind system bars. Use Compose insets APIs or project
  wrappers consistently.
- Verify IME insets, navigation bars, gesture navigation, cutouts, and waterfall
  displays.
- Legacy XML screens need the same insets review as Compose screens.

## Accessibility

- Minimum touch target: 48dp unless a platform exception is intentional.
- Provide content descriptions for meaningful icons; omit descriptions for pure
  decoration.
- Use semantic roles for buttons, switches, tabs, and headings.
- Use pane titles or live regions for important dynamic screen changes. Android
  16 deprecates disruptive accessibility announcements; prefer structured
  semantics over `announceForAccessibility`.
- Ensure text scaling, contrast, focus order, TalkBack traversal, and error
  messages work in real device tests.

## Review Questions

- Does every screen use the app theme rather than local one-off styling?
- Does dark theme preserve contrast and semantic color meaning?
- Are adaptive navigation surfaces chosen by available size, not device name?
- Does edge-to-edge content respect status, navigation, cutout, and IME insets?
- Would a TalkBack user understand each control, state, and validation error?
