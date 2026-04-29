# Native Accessibility Principles

## Core Contract

Every meaningful UI element needs a correct accessibility contract:

- Name: short, localized, specific, and stable enough for voice control.
- Role: native control type, trait, or semantic role.
- State: selected, checked, expanded, disabled, busy, invalid, current, or hidden.
- Value: current text, range, progress, count, position, or formatted data.
- Action: activate, adjust, dismiss, expand/collapse, custom actions, or escape/back.
- Order: traversal matches visual reading order and task order.
- Grouping: related visual parts are combined when the user thinks of them as one item.

## Priority Order

1. Use native controls and standard framework components.
2. Fix visible labels, structure, and interaction design.
3. Add platform semantics to fill gaps.
4. Add custom accessibility actions for gestures or complex controls.
5. Add announcements only for dynamic changes that the user needs to know.

Avoid solving a design or control choice problem with excessive metadata. A native `Button`,
`Switch`, `TextField`, `Slider`, `List`, or `NavigationLink` usually carries more correct
behavior than a custom view with a label added later.

## Labels and Descriptions

- Do not include the role in the label: use "Save", not "Save button".
- Do not use "image of" or "button to" unless the phrase is part of visible content.
- Localize labels, hints, values, error text, empty states, and action names.
- Keep hints for outcomes that are not obvious from the label.
- Avoid duplicate announcements caused by visible text plus a matching custom label on a parent.
- Do not label decorative elements; hide or omit them from the accessibility tree.

## Structure

- Mark headings on information-heavy screens.
- Represent dialogs, bottom sheets, popovers, panes, drawers, and menus as boundaries.
- Group list cells when title, subtitle, metadata, and status describe one item.
- Preserve child controls inside grouped cells when those controls have independent actions.
- Provide collection metadata where the framework supports it for custom lists or grids.

## Input

- Touch targets: use at least 44x44 pt on Apple platforms and 48x48 dp on Android.
- Keyboard and D-pad: every actionable control must be reachable and visibly focused.
- Switch/Voice Access: every task must have a discrete actionable target or custom action.
- Gesture-only features: expose swipe, drag, reorder, dismiss, zoom, or scrub through accessible alternatives.
- Adjustable controls: expose increment/decrement behavior and the current value.

## Visual and System Settings

- Support text scaling and large text without clipping, overlap, or lost actions.
- Respect Reduce Motion and avoid essential information conveyed only through animation.
- Respect high contrast/increase contrast where supported.
- Do not rely on color alone for selected, invalid, warning, success, or disabled states.
- Keep focus indicators and selected states visible in high contrast modes.

## Dynamic Changes

Announce only changes that affect the user's task or orientation:

- Navigation target changed
- Modal, sheet, or alert opened
- Validation failed or succeeded
- Async work completed or failed
- Progress/state changed because of the user's action

Avoid repeating frequent updates such as timers, rapidly changing counters, or every small progress tick.

## WebView and Hybrid Screens

A native wrapper cannot make inaccessible web content accessible. When a WebView displays app-critical UI, review both layers:

- Native focus entry and exit
- Web document semantics
- Keyboard and screen reader behavior inside the WebView
- Native back/dismiss behavior
- Text scaling and zoom behavior

## Common Native Failure Modes

- Icon-only buttons without labels
- Clickable rows whose child controls vanish from the accessibility tree
- Duplicate focus stops for one logical item
- Custom canvas/chart UI with no semantic representation
- Swipe-only delete, drag-only reorder, or pinch-only zoom
- Errors shown visually but not associated with fields
- Modal content exposed behind the active modal
- Text clipped at large accessibility sizes
- Automated tests passing while TalkBack or VoiceOver flow is still confusing
