# React Native Accessibility And Semantic UI Research

## Executive Summary

- Agent UI must enrich React Native accessibility metadata, not replace it. Semantic `type`, `label`, `state`, `value`, `actions`, and visibility should derive from React Native accessibility props wherever possible.
- Every actionable Agent UI node needs a stable semantic `id`, a human-readable accessible name, a concrete role, explicit supported actions, and synchronized disabled/busy/selected/checked/expanded state.
- `testID` should map from semantic `id` for deterministic E2E and agent targeting, but `accessibilityLabel` must remain a localized user-facing label, not an automation selector.
- Prefer React Native `role` and ARIA aliases when an app uses them because React Native documents `role` and several ARIA props as taking precedence over older accessibility props.
- Preserve accessibility-tree boundaries: `accessible={true}` creates a focusable accessibility element, hidden subtrees should be hidden from semantic snapshots, and modal subtrees should become the active semantic scope.
- Use `accessibilityValue` and ARIA value aliases for sliders, progress indicators, steppers, and other range controls; do not infer values from rendered text when explicit values exist.
- Use `accessibilityActions` and `onAccessibilityAction` as the accessibility-aligned action contract; map Agent UI actions onto these names where possible.
- Redact sensitive values by default. Secure text, credentials, tokens, payment data, health data, precise location, and personal identifiers must not appear in agent-readable snapshots unless explicitly allowed in development.
- Validation should mirror React Native Testing Library behavior: role/name/state/value queries should work for interactive nodes, while test IDs are reserved for deterministic E2E and agent control.

## Accessibility Prop Table

| Prop | Meaning | iOS behavior | Android behavior | Agent UI semantic mapping | Source URL |
|---|---|---|---|---|---|
| `accessible` | Marks a component as an accessibility element. | React Native maps it to native `isAccessibilityElement`. | React Native maps it to native `focusable`. | Defines a semantic node boundary for focusable/actionable elements. Preserve child aggregation behavior for labels. | https://reactnative.dev/docs/0.84/accessibility |
| `accessibilityLabel` | Human-readable accessible name. If omitted, React Native may build a label from text descendants. | Maps to UIKit accessibility label; Apple says labels should identify the element and not include the control type. | Maps to the Android accessible label/content description path. | Maps to semantic `label`. Never use it as the primary stable agent selector. | https://reactnative.dev/docs/0.84/accessibility; https://developer.apple.com/documentation/UIKit/UIAccessibilityElement/accessibilityLabel |
| `accessibilityHint` | Describes what will happen when the user performs the action. | VoiceOver reads the hint after the label when hints are enabled. | TalkBack reads the hint after the label; React Native notes Android hints cannot currently be turned off. | Optional `hint`/`description`; useful for action consequence, not a replacement for `intent`. | https://reactnative.dev/docs/0.84/accessibility |
| `accessibilityRole` | Communicates component purpose to assistive technology. | Bridges to native accessibility traits/semantics. | Bridges to Android accessibility role/class semantics where supported. | Maps to semantic `type` unless `role` is present. | https://reactnative.dev/docs/0.84/accessibility |
| `role` | Newer role prop with ARIA-style names. React Native says it has precedence over `accessibilityRole`. | Supported through React Native's accessibility mapping. | Supported through React Native's accessibility mapping. | Preferred source for semantic `type` when present; normalize aliases such as `heading` to `header` if the schema needs canonical names. | https://reactnative.dev/docs/0.84/accessibility; https://reactnative.dev/docs/view.html |
| `accessibilityState` | Object describing `disabled`, `selected`, `checked`, `busy`, and `expanded`. | Exposes state to VoiceOver and native accessibility. | Exposes state to TalkBack and native accessibility. | Maps directly to semantic `state`. Must stay synchronized with visual/control state. | https://reactnative.dev/docs/0.84/accessibility |
| `accessibilityValue` | Text or range value for controls such as sliders and progress bars. | Maps to the accessibility value announced by VoiceOver. | Maps to Android accessibility value/range information. | Maps to semantic `value`; redact when sensitive. | https://reactnative.dev/docs/0.84/accessibility |
| `accessibilityActions` | List of standard or custom actions supported by the component. | Includes iOS-specific standard actions such as `magicTap` and `escape`; adjustable controls use increment/decrement gestures. | Includes Android-specific standard actions such as `longpress`, `expand`, and `collapse`; TalkBack can trigger increment/decrement. | Maps to semantic `actions`. Agent actions should dispatch only declared and enabled actions. | https://reactnative.dev/docs/0.84/accessibility |
| `onAccessibilityAction` | Handler invoked when assistive technology requests an action. | Receives the action name from VoiceOver-triggered actions. | Receives the action name from TalkBack-triggered actions. | Agent UI can bind semantic dispatch to the same action names or to component callbacks that mirror them. | https://reactnative.dev/docs/0.84/accessibility; https://reactnative.dev/docs/view.html |
| `accessibilityLiveRegion` | Announces dynamic content changes. | Not the React Native prop's target platform. | Android-only; values are `none`, `polite`, and `assertive`. | Maps to semantic observation policy for status/toast/loading nodes. | https://reactnative.dev/docs/0.84/accessibility |
| `aria-live` | ARIA alias for dynamic updates. | Not the React Native prop's target platform. | Android-only; values are `off`, `polite`, and `assertive`. | Preferred over `accessibilityLiveRegion` when present; normalize `off` to no live updates. | https://reactnative.dev/docs/view.html |
| `importantForAccessibility` | Controls whether a view and descendants are reported to Android accessibility services. | Android-only prop. | Values are `auto`, `yes`, `no`, and `no-hide-descendants`; `no-hide-descendants` hides the branch. | Controls semantic visibility on Android; prune `no-hide-descendants` from active snapshots. | https://reactnative.dev/docs/0.84/accessibility; https://reactnative.dev/docs/view.html |
| `accessibilityElementsHidden` | Hides an element and contained accessibility elements. | iOS-only; hidden branches are ignored by VoiceOver. | Use `importantForAccessibility="no-hide-descendants"` instead. | Prune hidden branches from semantic snapshots unless explicitly debugging hidden nodes. | https://reactnative.dev/docs/0.84/accessibility |
| `accessibilityViewIsModal` | Indicates that VoiceOver should ignore sibling views outside the receiver. | iOS-only modal focus behavior. | Not the primary Android modal mechanism. | Treat the modal subtree as the active semantic scope. | https://reactnative.dev/docs/0.84/accessibility |
| `aria-modal` | ARIA alias for modal focus. React Native says it has precedence over `accessibilityViewIsModal`. | iOS-only behavior in React Native. | Not the primary Android modal mechanism. | Preferred modal signal when present. | https://reactnative.dev/docs/view.html |
| `accessibilityLanguage` | Sets the language used by the screen reader for label, value, and hint. | iOS-only; value must follow BCP 47. | Not documented as Android behavior in React Native. | Optional `language`; useful for localized labels and NLP, not required for action dispatch. | https://reactnative.dev/docs/0.84/accessibility |
| `testID` | Identifier for E2E tests. | Used by native test tooling; React Native also warns it disables layout-only view removal. | Used by native test tooling; React Native also warns it disables layout-only view removal. | Default mapping target for semantic `id`. Do not use it as a user-facing label. | https://reactnative.dev/docs/view.html |

## Role And Control Mapping

| Agent UI semantic type | React Native component class | Recommended accessibility role | Recommended accessibility state/value | Required semantic actions | Notes |
|---|---|---|---|---|---|
| `button` | `Pressable`, `TouchableOpacity`, `Button` | `button` | `disabled`, `busy` when applicable | `activate`/`tap` | Use explicit label for icon-only buttons. |
| `imageButton` | `Pressable` wrapping `Image` | `imagebutton` or `role="button"` plus image semantics | `disabled`, `busy` when applicable | `activate`/`tap` | Prefer one accessible node with a clear label. |
| `link` | `Text`, `Pressable` | `link` | `disabled` if unavailable | `activate`/`tap`, optional `navigate` | Use for external links and deep links. |
| `toggle` / `switch` | `Switch`, custom `Pressable` | `switch` or `togglebutton` | `checked`; `disabled` | `toggle` or `activate` | Keep visual on/off state synchronized with `accessibilityState.checked`. |
| `checkbox` | Custom control or native/Expo UI checkbox | `checkbox` | `checked: true`, `false`, or `"mixed"` | `toggle` or `activate` | Mixed state must be explicit. |
| `radio` | Custom radio | `radio` inside `radiogroup` | `checked` or `selected`; `disabled` | `select`/`activate` | Group membership matters for semantics. |
| `textInput` | `TextInput` | Default text input semantics; `search` or `role="searchbox"` for search | current text only when non-sensitive; `disabled` | `input`, `focus`, `clear`, `submit` when supported | Redact secure and sensitive values by default. |
| `slider` | Slider component | `adjustable` or `role="slider"` | `value.min`, `value.max`, `value.now`, optional `value.text`; `disabled` | `increment`, `decrement`, `set_value` | Do not dispatch out-of-range values. |
| `stepper` / `spinbutton` | Custom increment/decrement control | `spinbutton` | `value.min`, `value.max`, `value.now`; `disabled` | `increment`, `decrement`, `set_value` | Expose numeric constraints. |
| `progress` | `ActivityIndicator`, progress bar | `progressbar` | `busy`; optional range value | none, or `observe` | Read-only unless the component has explicit actions. |
| `tab` | Tab button | `tab` within `tablist` | `selected`; `disabled` | `activate`/`tap` | Agent navigation can target selected state. |
| `menuItem` | Menu item row/button | `menuitem` | `disabled`, optional `expanded` | `activate`/`tap` | Menus should also expose parent `menu`/`menubar` when modeled. |
| `alert` / `status` | Text/status surface | `alert` or live region | `busy` for loading; live region if dynamic | none, or `observe` | Agent should wait on live/status updates, not tap them. |
| `image` | `Image` | `image` or `role="img"` | none | none | Decorative images should not become actionable semantic nodes. |
| `header` | `Text` heading | `header` or `role="heading"` | none | none | Useful for screen structure and agent navigation. |
| `grid` / `list` | `ScrollView`, `FlatList`, `SectionList`, virtualized list | `grid`, `list`, `listitem` where supported | selection and disabled state on children | `scroll`, child actions | For virtualized lists, visible semantic children may be a subset. |

## Proposed Semantic Node Contract

```ts
type Redaction = "none" | "redacted" | "dev-only";

type SemanticState = {
  disabled?: boolean;      // optional
  selected?: boolean;      // optional
  checked?: boolean | "mixed"; // optional
  busy?: boolean;          // optional
  expanded?: boolean;      // optional
  hidden?: boolean;        // optional, derived from accessibility visibility
};

type SemanticValue = {
  min?: number;            // optional
  max?: number;            // optional
  now?: number;            // optional, redacted when sensitive
  text?: string;           // optional, redacted when sensitive
  redaction?: Redaction;   // required when value is omitted for privacy
};

type SemanticAction = {
  name: "activate" | "tap" | "input" | "focus" | "clear" | "scroll" |
    "increment" | "decrement" | "set_value" | "expand" | "collapse" | string; // required
  label?: string;          // optional, localized when exposed to users
  source?: "accessibility" | "component" | "agent-ui"; // optional
  destructive?: boolean;   // optional
};

type SemanticNode = {
  id: string;              // required for actionable nodes; maps to testID
  type: string;            // required for actionable nodes; derived from role/accessibilityRole
  label: string;           // required for actionable nodes; maps to accessible name
  screen?: string;         // required at screen roots and recommended on actionable descendants
  state: SemanticState;    // required, empty object allowed
  actions: SemanticAction[]; // required, empty for read-only nodes
  intent?: string;         // required for high-value app actions, optional for passive nodes
  value?: SemanticValue;   // optional; redacted by default for sensitive controls
  children: SemanticNode[]; // required
  bounds?: { x: number; y: number; width: number; height: number }; // dev-only, fallback/debug only
  props?: Record<string, unknown>; // dev-only, allowlisted, redacted by default
  accessibility?: {
    role?: string;
    accessibilityRole?: string;
    label?: string;
    hint?: string;
    liveRegion?: "none" | "off" | "polite" | "assertive";
    modal?: boolean;
    language?: string;
  };                       // optional audit metadata
  generated?: boolean;     // optional; true means unstable and not valid for durable flows
};
```

Field policy:

- Required: `id`, `type`, `label`, `screen`, `state`, `actions`, and `children` for actionable nodes; screen roots require `id`, `type`, `screen`, `children`, and `state`.
- Optional: `intent`, `value`, `accessibility`, `generated`.
- Dev-only: `bounds`, raw `props`, source component names, file paths, and debug owner stacks.
- Redacted by default: `value.text`, `props.value`, `props.defaultValue`, text input contents, headers, cookies, tokens, credentials, payment data, and personal data.

## Required Metadata Rules

- Stable IDs: every actionable node must have a static semantic `id` that is unique within the mounted app or at least within its screen namespace. Recommended format: `screen.section.control`.
- Labels: every actionable node must have an accessible name from `accessibilityLabel`, text content, `aria-label`, or `aria-labelledby`/`accessibilityLabelledBy`. Labels are user-facing and localized.
- Intents: high-impact controls such as submit, delete, purchase, sign in, share, and navigation actions should declare a stable `intent` so agents do not infer business meaning from labels alone.
- Actions: semantic actions must be explicit. For accessibility-backed actions, map to `activate`, `increment`, `decrement`, `expand`, `collapse`, `longpress`, `escape`, or `magicTap` when appropriate.
- State: disabled, busy, selected, checked, expanded, and hidden state must match React Native accessibility state or ARIA aliases.
- Values: range controls must expose min/max/now or equivalent ARIA value aliases. Sensitive text input values must be represented by redaction markers, not plaintext.
- Parent-child relationships: semantic hierarchy should reflect React ownership, accessibility grouping, modal scope, and list virtualization. A node with `accessible={true}` can be treated as a single accessibility element even if React children exist.
- Generated IDs: generated IDs are acceptable for debugging but must be marked `generated: true` and rejected by durable agent flows.
- Duplicate IDs: development builds should warn immediately; validation should fail for duplicate actionable IDs in one screen/scope.
- Visibility: hidden, clipped, unmounted, or offscreen virtualized nodes must indicate visibility accurately. Agent tools should not act on absent nodes unless the action supports scrolling or navigation to reveal them.

## Privacy And Redaction Rules

- Never expose by default: passwords, one-time codes, API keys, OAuth tokens, session cookies, authorization headers, private keys, payment card data, bank data, government IDs, health data, precise location, contacts, messages, and freeform personal data entered by users.
- Redact secure inputs: any `TextInput` with `secureTextEntry`, password-like `textContentType`, sensitive `autoComplete`, or an id/intent/name matching credential/payment/token patterns must emit `{ redaction: "redacted" }`.
- Redact raw props: semantic snapshots should never dump arbitrary props. Only allowlisted accessibility and semantic fields should be exported.
- Use stable markers: `[REDACTED:password]`, `[REDACTED:token]`, `[REDACTED:payment]`, `[REDACTED:personal-data]`, `[REDACTED:secure-text]`, and `[REDACTED:unknown-sensitive]`.
- Prefer derived state: expose `hasValue: true`, validation status, length buckets, or last-four display strings only when the app already shows them to the user.
- Separate dev and agent channels: bounds and debug props may be useful in development but should require explicit opt-in and should not be part of the default MCP response.

## Validation Script Requirements

- Find actionable components without stable `id`/`testID` mapping.
- Detect duplicate semantic IDs in a screen or mounted semantic snapshot.
- Reject generated IDs in checked-in flow definitions.
- Require a role or normalized semantic type for every actionable node.
- Require an accessible label for every actionable node, especially icon-only buttons and image buttons.
- Verify `accessibilityState` or ARIA state aliases for controls with selected, checked, disabled, busy, or expanded visual state.
- Verify `accessibilityValue` or ARIA value aliases for sliders, progress bars, steppers, and spinbuttons.
- Require `intent` for high-impact actions such as submit, delete, purchase, sign-in, sign-out, and destructive menu items.
- Flag `accessibilityLabel` values that look like IDs, selectors, file paths, or untranslated implementation names.
- Flag semantic values or props that appear to contain passwords, tokens, card numbers, email addresses, phone numbers, precise addresses, or other personal data.
- Ensure modal nodes prune or scope sibling semantic nodes.
- Ensure hidden subtrees are not exposed by default.
- Recommend RNTL-accessible queries: role plus name/state/value should resolve for interactive nodes; `getByTestId` remains acceptable for E2E and agent ID checks.

## Platform Caveats

- iOS: `accessible` maps to `isAccessibilityElement`; `accessibilityViewIsModal` and `aria-modal` affect VoiceOver sibling traversal; `accessibilityElementsHidden` hides a branch. UIKit guidance says labels should be short, localized, and not include the control type.
- Android: `accessible` maps to focusability; `importantForAccessibility` controls reporting to services, with `no-hide-descendants` hiding a branch; live regions are Android-focused in React Native.
- Role names diverge: `accessibilityRole` uses React Native names such as `adjustable`, `header`, and `image`, while `role` uses ARIA-like names such as `slider`, `heading`, and `img`. Agent UI should normalize but retain the original source values for audit.
- ARIA aliases can override legacy props: React Native documents precedence for `role`, `aria-modal`, and ARIA value props. The semantic runtime should resolve precedence before publishing snapshots.
- Web: Expo web should map semantic fields to DOM ARIA where possible, but web support should be validated separately because React Native native accessibility props and DOM roles are not identical.
- Testing: React Native Testing Library `*ByRole` requires the element to be an accessibility element; `Text`, `TextInput`, and `Switch` are accessibility elements by default, while `View` needs `accessible={true}` and common touchables already render accessible host views.
- E2E: `testID` is appropriate for deterministic test and agent lookup, but it does not replace accessible role/name/state checks. It also disables React Native layout-only view removal, so do not add it to every passive layout node.
- Virtualized lists: not all logical children are mounted. Semantic snapshots should distinguish mounted visible rows from total data count when known.
- Coordinates and bounds: bounds are useful for diagnostics and fallback automation only. They should never be the primary semantic control contract.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| React Native 0.84 Accessibility | https://reactnative.dev/docs/0.84/accessibility | 2026-04-27 | Defines `accessible`, labels, hints, live regions, roles, state, value, modal and hidden behavior, accessibility actions, and platform-specific props. |
| React Native View Props | https://reactnative.dev/docs/view.html | 2026-04-27 | Defines `testID`, `role` precedence, ARIA aliases, `importantForAccessibility`, `onAccessibilityAction`, `experimental_accessibilityOrder`, and layout-only view removal warnings. |
| Apple UIKit `accessibilityLabel` | https://developer.apple.com/documentation/UIKit/UIAccessibilityElement/accessibilityLabel | 2026-04-27 | Labels should succinctly identify elements and not include the control type. |
| Apple UIKit UIAccessibility protocol | https://developer.apple.com/documentation/UIKit/uiaccessibility-protocol | 2026-04-27 | UIKit accessibility properties include label, value, hint, traits, language, hidden elements, modal behavior, and grouping/custom actions. |
| Android `AccessibilityNodeInfo` | https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.html | 2026-04-27 | Android accessibility nodes expose labels, live regions, input type, values, parent relationships, and accessibility service information. |
| React Native Testing Library Queries | https://callstack.github.io/react-native-testing-library/docs/api/queries | 2026-04-27 | Documents role/name/state/value queries, accessibility element matching rules, `getByTestId`, and guidance that test IDs are mainly for cases where user-like queries do not fit. |

## Final Recommendation

Build the Stage 3 semantic runtime as an `AgentUIProvider` plus registry that resolves React Native accessibility metadata first, then overlays Agent UI-specific `id`, `intent`, privacy, and action metadata. Agent UI primitives should emit both accessibility props and semantic registration data from the same source so accessibility quality and agent controllability cannot drift apart.

For actionable controls, require stable `id`, accessible `label`, normalized `type`, explicit `actions`, synchronized `state`, and privacy-reviewed `value`. Map `id` to `testID` for deterministic E2E and agent lookup, but keep screen-reader labels human-readable. Treat screenshots, coordinates, and raw native view dumps as fallback diagnostics only.

DONE
