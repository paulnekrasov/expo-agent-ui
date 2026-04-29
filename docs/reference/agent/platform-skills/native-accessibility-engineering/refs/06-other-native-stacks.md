# Other Native and Cross-Platform Stacks

## Flutter

Use Flutter's semantics layer when standard widgets do not expose enough meaning.

Core tools:

- `Semantics`: add label, value, hint, role-like flags, state, and actions.
- `MergeSemantics`: treat descendants as one logical element.
- `ExcludeSemantics`: remove decorative or redundant descendants.
- `BlockSemantics`: prevent previous route/sibling semantics from being exposed behind modal-like UI.
- `Focus`, `Shortcuts`, and `Actions`: support keyboard and non-touch operation.

Pattern:

```dart
Semantics(
  label: 'Play',
  button: true,
  enabled: true,
  onTap: onPlay,
  child: IconButton(
    icon: const Icon(Icons.play_arrow),
    onPressed: onPlay,
  ),
)
```

Prefer built-in Material/Cupertino widgets first. Add `Semantics` for custom paint, icon-only controls, custom gestures, merged cards, and charts. Test with TalkBack, VoiceOver, large text, bold text, contrast, and platform inspectors.

## .NET MAUI

Prefer semantic properties over older automation properties.

Core tools:

- `SemanticProperties.Description`: spoken name or description.
- `SemanticProperties.Hint`: extra context for action or purpose.
- `SemanticProperties.HeadingLevel`: heading structure.
- `SetSemanticFocus()`: move screen reader focus.
- `SemanticScreenReader.Default.Announce(...)`: announce important status changes.
- `AutomationProperties`: legacy/Xamarin.Forms-style fallback; many members are superseded or deprecated.

Platform behavior is not identical across iOS, Android, Windows, and macOS. Test each target platform with its native screen reader. Avoid setting descriptions on parent controls in ways that make children unreachable, especially on iOS.

## Windows, WinUI, WPF, and UI Automation

Windows accessibility primarily flows through UI Automation.

Core contract:

- `Name`: accessible name.
- `ControlType`: button, edit, checkbox, list item, tab, window, and related roles.
- `IsKeyboardFocusable`: keyboard reachability.
- `LabeledBy`: relationship to visible label.
- `HelpText`: additional guidance.
- `AutomationId`: test identifier, not a user-facing name.
- Patterns: Invoke, Toggle, Selection, ExpandCollapse, Grid, Table, Text, Value, RangeValue, Scroll.

Use standard WinUI controls when possible because they expose UIA behavior. For custom controls, implement the needed automation peer and patterns. Test with Narrator, Accessibility Insights for Windows, keyboard-only navigation, high contrast themes, text scaling, and focus visuals.

## TV, Wearable, Automotive, and Gamepad Native UI

- Treat focus movement as a first-class interaction, not an afterthought.
- Verify D-pad, remote, rotary, controller, keyboard, and switch navigation.
- Avoid small clustered targets and focus traps.
- Keep current focus and selected state visually clear.
- Provide non-gesture alternatives for scrub, drag, reorder, and long press.
- For wearables, keep labels short and preserve screen reader order across compact layouts.
- For automotive, follow platform distraction and voice interaction guidelines in addition to accessibility.

## Embedded WebView

Review both native and web layers:

- Native wrapper exposes the WebView with a meaningful label only when needed.
- Web content has semantic HTML, focus order, headings, labels, and ARIA where appropriate.
- Native back, escape, and modal behavior work correctly.
- Text scaling and zoom do not break the embedded page.
- Screen reader focus can enter and exit the WebView predictably.

Do not assume a native shell can compensate for inaccessible web content.
