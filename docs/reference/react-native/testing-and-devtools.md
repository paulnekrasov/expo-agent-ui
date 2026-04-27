# Testing, DevTools, And Automation Research

## Executive Summary

- Use React Native Testing Library (RNTL) plus Jest as the v0 authority for Agent UI component, registry, action, and semantic flow tests. RNTL renders to React Test Renderer in Node and does not need a device or simulator, which matches the no-simulator core validation goal. Source: RNTL testing environment, https://callstack.github.io/react-native-testing-library/docs/advanced/testing-env, accessed 2026-04-27.
- Treat React Native accessibility props and `testID` as the compatibility contract between Agent UI semantics, RNTL tests, and later device automation. Source: React Native View props, https://reactnative.dev/docs/view, accessed 2026-04-27.
- Prefer RNTL `getByRole` with `name` for user-facing behavior, use state/value filters for accessibility state, and reserve `getByTestId` for exact semantic ID and agent action assertions. Source: RNTL queries, https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27.
- Use RNTL `userEvent` for press, type, clear, paste, and scroll interactions where supported; keep `fireEvent` for unsupported events or deliberate composite-handler unit tests. Source: RNTL user-event docs, https://callstack.github.io/react-native-testing-library/docs/api/events/user-event, accessed 2026-04-27.
- Expose live semantic-tree inspection through Expo DevTools Plugins first. React Native core DevTools is the default debugger from React Native 0.76, but core third-party extension loading is not a stable library API, while Expo documents a supported plugin messaging path. Sources: React Native 0.76 release, https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture, and Expo DevTools plugin docs, https://docs.expo.dev/debugging/create-devtools-plugins/, accessed 2026-04-27.
- Keep Maestro, Detox, and Appium optional interop targets, not v0 dependencies. They are valuable for compiled app/device validation, but the semantic runtime can be validated faster and earlier through pure registry tests and RNTL.
- Design Agent UI flow JSON so it can later compile to Maestro YAML and Detox/Appium tests by preserving stable IDs, labels, text, state assertions, waits, and scroll intent.
- Do not use screenshots or coordinates as the semantic test foundation. Maestro and Appium support coordinate/image strategies, but Agent UI should only use them as fallback interop paths.
- Status: core research is complete, with one concern: exact native mapping for React Native `testID` differs by platform and tool, so each automation export must be verified against a compiled fixture before release.

## React Native DevTools Findings

React Native 0.76 introduced React Native DevTools as the stable default debugging experience, alongside the New Architecture default. The official release describes it as Chrome-DevTools-based, with breakpoints, watch values, step-through debugging, stack inspection, console, built-in React Components Inspector, and Profiler support. Source: React Native 0.76 release, https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture, accessed 2026-04-27.

The current React Native DevTools docs include core panels such as Console, Sources, Components, Profiler, Network, Performance, and Memory, with Network and Performance documented as available since React Native 0.83. Network inspection records `fetch()`, `XMLHttpRequest`, and `<Image>` requests, while Expo still has a separate Expo Network panel for Expo-specific coverage. Source: React Native DevTools docs, https://reactnative.dev/docs/react-native-devtools, accessed 2026-04-27.

The React Native 0.76 DevTools discussion states that React Native DevTools does not ship support for loading third-party Chrome extensions as of 0.76 and points to Expo Dev Plugins as an existing alternative. This makes a core React Native DevTools extension a poor v0 target for Agent UI unless a stable extension API is documented later. Source: React Native DevTools discussion, https://github.com/react-native-community/discussions-and-proposals/discussions/819, accessed 2026-04-27.

Expo DevTools Plugins are the practical v0 integration path for Expo Agent UI. Expo documents a plugin UI plus app-side hook model using `useDevToolsPluginClient`, `sendMessage`, and `addMessageListener`, and instructs libraries to export no-op functions when the app is not running in debug mode. That is directly suitable for a development-only semantic tree inspector. Source: Expo DevTools plugin docs, https://docs.expo.dev/debugging/create-devtools-plugins/, accessed 2026-04-27.

Agent UI should expose DevTools state as a read-only diagnostic surface first:

- `semantic-tree:update` messages with redacted `SemanticTree` snapshots.
- `semantic-node:selected` messages from the plugin UI back to the app, limited to highlight/inspect behavior.
- Registry health summaries for duplicate IDs, missing actionable IDs, missing labels, unsupported roles, and stale nodes.
- No production build behavior; export no-op hooks outside debug/development mode.

Rozenite is a plausible later option because Callstack describes it as a plugin framework for React Native DevTools panels. It is not an official React Native or Expo API, so it should be tracked as a deferred integration until Agent UI's Expo DevTools Plugin surface is stable. Source: Callstack Rozenite announcement, https://www.callstack.com/blog/introducing-rozenite-a-plugin-framework-for-react-native-devtools, accessed 2026-04-27.

Limitations:

- React Native DevTools is for debugging React app concerns and is not a replacement for native IDE tooling. Source: React Native DevTools docs, https://reactnative.dev/docs/react-native-devtools, accessed 2026-04-27.
- Relying on undocumented Chrome DevTools Protocol internals would make Agent UI brittle. Use Expo's documented plugin messaging API for v0.
- NEEDS_VERIFICATION: exact message throughput and performance limits for sending large semantic trees through Expo DevTools Plugins are not documented. Use throttling, diffing, redaction, and subtree expansion by design.

## React Native Testing Library Findings

| Query / assertion type | Accessibility dependency | Agent UI use case | Caveats | Source URL |
|---|---|---|---|---|
| `getByRole`, `getAllByRole`, `queryByRole`, `findByRole` | Element must be an accessibility element. `Text`, `TextInput`, and `Switch` host elements are accessible by default; `View` needs `accessible={true}`; some touchables set it through their host view. | Primary assertion for primitives such as `Button`, `TextField`, `Toggle`, `Slider`, headings, alerts, tabs, and progress. | Agent UI wrappers must forward accessibility role to the host element an actual user can reach. Composite-only props are insufficient. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByRole(role, { name })` | Accessible name comes from accessibility label or text content. | Assert that an actionable semantic node exposes the same human-readable label to screen readers and tests. | Localized labels are allowed to change; do not use labels as the stable agent ID. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByRole` state filters: `disabled`, `selected`, `checked`, `busy`, `expanded`, `value` | Maps to `accessibilityState`, `aria-*`, or `accessibilityValue`. | Assert enabled/disabled controls, selected tabs, checked toggles, busy loading nodes, expanded sections, slider/progress values. | Missing state often matches a false filter; tests should explicitly assert positive state where ambiguity matters. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByLabelText` | Matches `accessibilityLabel` / `aria-label` or a labelled-by relationship. | Validate controls whose visible text is separate from the input host, such as icon buttons and text fields. | Prefer role plus name for user workflows when the role is known; use label queries for targeted accessibility coverage. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByText` | Matches rendered text content. | Assert copy, section titles, status text, validation messages, and list item content. | It validates visible text, not stable semantic identity; avoid using it for agent action routing. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByPlaceholderText` | Matches `TextInput` placeholder. | Smoke-test text field affordances and examples. | Placeholder is not a substitute for accessible label or semantic ID. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByDisplayValue` | Reads the current `TextInput` value in the rendered tree. | Assert form input effects after `input` flow steps. | RNTL does not execute native text input behavior; controlled/uncontrolled native edge cases still need device tests later. | https://callstack.github.io/react-native-testing-library/docs/api/queries and https://callstack.github.io/react-native-testing-library/docs/advanced/testing-env, accessed 2026-04-27 |
| `getByHintText` | Matches `accessibilityHint`. | Validate optional semantic hints for high-risk actions. | Hints are assistive copy, not command IDs. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `getByTestId` | Matches React Native `testID` in the test tree. | Exact lookup for stable Agent UI semantic IDs and action dispatch: `checkout.confirmOrder`, `settings.notifications.enabled`. | Testing Library recommends user-centric queries for behavior; Agent UI can use test IDs specifically because stable machine IDs are a product requirement. | https://callstack.github.io/react-native-testing-library/docs/api/queries and https://reactnative.dev/docs/view, accessed 2026-04-27 |
| `toBeEnabled`, `toBeDisabled`, `toBeSelected`, `toBeChecked`, `toBeBusy`, `toBeExpanded`, `toHaveAccessibilityValue` | Same accessibility state/value props used by role filters. | Express semantic state assertions without manually inspecting props. | Keep assertions aligned with public semantics rather than internal component state. | https://callstack.github.io/react-native-testing-library/docs/api/queries, accessed 2026-04-27 |
| `userEvent.press` | Requires a pressable host target reachable in the RNTL tree. | Validate `tap` tool behavior through real press event sequencing. | Minimum internal press timing can slow tests; use fake timers where needed. | https://callstack.github.io/react-native-testing-library/docs/api/events/user-event, accessed 2026-04-27 |
| `userEvent.type`, `clear`, `paste` | Supports host `TextInput` elements. | Validate `input` flow steps and semantic value updates. | Passing non-host inputs throws; Agent UI wrappers must expose a reachable host input. | https://callstack.github.io/react-native-testing-library/docs/api/events/user-event, accessed 2026-04-27 |
| `userEvent.scrollTo` | Supports host `ScrollView` and `FlatList` host scroll behavior. | Validate `scroll` tool semantics and list visibility transitions in the flow runner. | It simulates JS/runtime events, not native physics or platform scroll edge behavior. | https://callstack.github.io/react-native-testing-library/docs/api/events/user-event and https://callstack.github.io/react-native-testing-library/docs/advanced/testing-env, accessed 2026-04-27 |
| `fireEvent` / `fireEventAsync` | Can trigger event handlers on host or composite elements depending on handler traversal. | Low-level unit tests for custom events, unsupported user-event cases, and React 19/Suspense async paths. | Prefer `userEvent` for supported user interactions. `fireEventAsync` requires RNTL v13.3.0 or later. | https://callstack.github.io/react-native-testing-library/docs/api/events/fire-event, accessed 2026-04-27 |

## Test Strategy Matrix

| Layer | What to test | Tool | Runs without simulator? | Required fixtures | V0 or later |
|---|---|---|---|---|---|
| pure semantic registry | Register, update, unregister, parent-child relationships, duplicate ID warnings, stable/unstable ID flags, redaction metadata, event emission. | Jest unit tests. | Yes. | Plain `SemanticRegistration` objects and fake clock/event listener fixtures. | V0 |
| component primitives | JSX primitives emit correct React Native host props, stable `testID`, accessibility role, label, state/value, intent metadata, and registry registrations. | Jest plus RNTL. | Yes. | Minimal screens using `AgentUIProvider`, `Screen`, `VStack`, `Button`, `TextField`, `Toggle`, `Slider`, `List`, `Section`. | V0 |
| accessibility props | Role/name queries, state/value matchers, hidden/disabled behavior, text and label coverage, hints for risky actions. | RNTL queries and matchers. | Yes. | Per-primitive accessibility fixtures and localization-safe ID fixtures. | V0 |
| action dispatch | `tap`, `input`, `scroll`, `navigate` stubs, action result codes, disabled-node refusal, missing-node suggestions. | Jest plus RNTL `userEvent`; direct registry dispatch for pure cases. | Yes. | Mock semantic tree with action handlers and rendered host components. | V0 |
| flow runner | Step sequencing, waits, assertions, retries, event observation, deterministic failure payloads, redacted snapshots. | Node/Jest with in-memory registry and RNTL harness. | Yes. | JSON flow fixtures for checkout, settings, validation error, missing node, disabled action. | V0 |
| MCP server | Tool schema validation, JSON-RPC request/response shape, stdio startup, structured error codes, redaction boundaries, mock bridge session. | Node tests with MCP TypeScript SDK and mocked app bridge. | Yes. | Mock app bridge, fixture semantic trees, fixture tool calls. | V0 |
| example app | Package integration, example screen semantics, no duplicate IDs, smoke flow in RNTL, optional Expo DevTools plugin handshake in development. | RNTL plus CLI smoke tests where available. | Mostly yes; full native smoke does not. | Example Expo app screen fixtures and semantic flow fixtures. | V0 for headless; later for native. |
| native adapters | `@expo/ui/swift-ui` optional adapter behavior, Host boundary, platform fallback, native control accessibility/testID propagation. | RNTL for fallback behavior; Maestro/Detox/Appium for compiled native behavior later. | RNTL yes; native verification no. | Compiled iOS/Android fixture apps and adapter screens. | Later |

Automation-specific rows are intentionally marked later where native binaries, simulators, emulators, or devices are required. Agent 3-style automation work should consume this report's semantic ID and flow-export constraints rather than changing the v0 test authority.

## Automation Tool Interop

### Maestro

Strengths:

- Maestro is a good future export target because its flows are declarative YAML and its core selectors are text, id, index, point, and css for web. Source: Maestro core selectors, https://docs.maestro.dev/reference/selectors/core-selectors, accessed 2026-04-27.
- Maestro uses the accessibility tree by default and supports React Native on Android and iOS without app instrumentation. Source: Maestro React Native docs, https://docs.maestro.dev/get-started/supported-platform/react-native, accessed 2026-04-27.
- For React Native, Maestro can target visible text or `testID`; Maestro says `testID` maps to a stable `id` and is preferred over visible text for localization/dynamic-content stability. Source: Maestro React Native docs, https://docs.maestro.dev/get-started/supported-platform/react-native, accessed 2026-04-27.

Selectors supported:

- `text` matches visible text or accessibility label.
- `id` matches accessibility identifier; Maestro documents Android as Resource ID and iOS as `accessibilityIdentifier`.
- `point` is available but should be treated as a fallback because Agent UI is semantic-first.
- Source: Maestro core selectors, https://docs.maestro.dev/reference/selectors/core-selectors, accessed 2026-04-27.

Platform support:

- Maestro documents React Native support for both Android and iOS. Source: https://docs.maestro.dev/get-started/supported-platform/react-native, accessed 2026-04-27.
- Expo Go differs from standalone/EAS builds: Maestro says Expo Go cannot use `launchApp` with the app's own custom app id and should use `openLink` with the development URL; standalone/EAS builds use normal bundle/package launch. Source: https://docs.maestro.dev/get-started/supported-platform/react-native, accessed 2026-04-27.

CI implications:

- Maestro requires an installed simulator/emulator/device for true E2E, so it is not a no-simulator v0 validation tool.
- It is lighter to generate than Detox specs because a semantic JSON flow can map directly to YAML commands, but actual execution still belongs in optional app-level CI.

How Agent UI could export flows:

- `tap({ id })` -> `tapOn: { id }`.
- `input({ id, value })` -> tap/fill text sequence using the same `id`.
- `assertVisible({ id })` -> `assertVisible: { id }`.
- `assertText({ text })` -> `assertVisible: <text>`.
- `scroll({ id, direction })` -> `scrollUntilVisible` where the target ID/text is known.
- Redaction policy must prevent secret values from being exported by default.

V0 recommendation:

- Defer Maestro execution and YAML generation.
- Keep Agent UI flow schema Maestro-compatible by preserving stable IDs, visible labels/text, waits, assertions, and scroll intent.

### Detox

Strengths:

- Detox is a React Native E2E framework that runs against a real device or simulator and uses gray-box testing to improve control over app internals and reduce flakiness. Source: Detox getting started, https://wix.github.io/Detox/docs/introduction/getting-started/, accessed 2026-04-27.
- Detox matchers map well to Agent UI metadata: `by.id()` corresponds to React Native `testID`, `by.label()` corresponds to `accessibilityLabel`, `by.text()` matches text, and `by.traits()` is iOS-only. Source: Detox matchers, https://wix.github.io/Detox/docs/next/api/matchers/, accessed 2026-04-27.

Selectors supported:

- `by.id(id)`, `by.label(label)`, `by.text(text)`, `by.type(className)`, `by.traits([...])` on iOS, ancestor/descendant composition, `and`, and `atIndex`.
- Detox recommends unique identifiers because text/label and indexes can be flaky under copy/localization/UI changes. Source: https://wix.github.io/Detox/docs/next/api/matchers/, accessed 2026-04-27.

Platform support:

- Detox targets mobile E2E on real devices or simulators; the docs show iOS and Android app build configurations. Sources: https://wix.github.io/Detox/docs/introduction/getting-started/ and https://wix.github.io/Detox/docs/introduction/project-setup/, accessed 2026-04-27.

CI implications:

- Detox project setup requires native build commands and binary paths. The docs explicitly note Expo setup is different and point Expo users to Expo's guide. Source: Detox project setup, https://wix.github.io/Detox/docs/introduction/project-setup/, accessed 2026-04-27.
- This setup cost conflicts with Agent UI's drop-in v0 goal.

How Agent UI could export flows:

- Generate Detox `.spec.ts` files using `element(by.id(id))`, `typeText`, `tap`, and `expect(...).toBeVisible()`.
- Use Detox only after an app opts into native E2E and provides app build configuration.

V0 recommendation:

- Defer Detox integration. Do not scaffold Detox config from Agent UI v0.
- Ensure every actionable primitive has a stable `testID` so users can write Detox tests manually.

### Appium

Strengths:

- Appium is a broad WebDriver ecosystem with official platform drivers, making it useful for teams already using device farms or cross-language test stacks.
- Appium supports an `accessibility id` strategy as a recursive native element search. Source: Appium finding elements, https://appium.github.io/appium.io/docs/en/writing-running-appium/finding-elements/, accessed 2026-04-27.

Selectors supported:

- XCUITest driver supports `id`, `name`, and `accessibility id` as synonyms transformed into lookup by the element `name` attribute; it also supports class name, iOS predicate string, iOS class chain, and XPath. Source: Appium XCUITest locator strategies, https://appium.github.io/appium-xcuitest-driver/5.2/locator-strategies/, accessed 2026-04-27.
- UiAutomator2 supports `id`, `accessibilityId`, `className`, `-android uiautomator`, and XPath. Its docs state `accessibilityId` maps to native `By.desc` and that, in React Native apps, this attribute reflects `accessibilityLabel`. Source: UiAutomator2 driver docs, https://github.com/appium/appium-uiautomator2-driver, accessed 2026-04-27.

Platform support:

- Appium's official Android quickstart uses the UiAutomator2 driver. It notes Android automation requirements differ from iOS, and iOS automation requires macOS. Source: Appium UiAutomator2 quickstart, https://appium.io/docs/en/3.3/quickstart/uiauto2-driver/, accessed 2026-04-27.

CI implications:

- Appium requires an Appium server, platform drivers, SDK/toolchain setup, and target devices/simulators.
- It is too heavy for Agent UI v0 core validation, but it is an important compatibility target for enterprise teams.

How Agent UI could export flows:

- Generate WebDriver scripts or capability-neutral flow metadata keyed by `accessibility id`, `id`, and text.
- NEEDS_VERIFICATION: because Appium Android docs map React Native `accessibilityLabel` to `accessibilityId`, while Maestro/Detox strongly support `testID`-based IDs, Agent UI Appium export must validate its exact selector mapping in a compiled fixture before documenting a one-size-fits-all ID rule.

V0 recommendation:

- Defer Appium generation and server integration.
- Maintain automation readiness by emitting stable `testID`, accessible labels, roles, and state/value props.

## Flow Validation Strategy

Agent UI should validate semantic flows in memory before any device automation exists. The core idea is to exercise the same contract the MCP server will expose, while using RNTL only to drive React Native-visible user interactions.

Recommended no-simulator harness:

1. Mount a screen under `AgentUIProvider` using RNTL.
2. Capture the live `SemanticRegistry` instance from the provider or a test-only registry injection.
3. Validate initial tree shape directly: screen ID, child order where meaningful, roles, labels, actions, state, value, privacy flags, and duplicate ID diagnostics.
4. For action steps, resolve the semantic ID through the registry, then drive the corresponding host element through RNTL:
   - `tap` uses `getByTestId(id)` or role/name plus registry ID verification, then `userEvent.press`.
   - `input` uses the registered input node, then `userEvent.clear` and `userEvent.type` or `paste`.
   - `scroll` uses `userEvent.scrollTo` for host scroll containers when available.
   - `navigate` should call the navigation adapter test double in v0 and assert resulting semantic screen state.
5. Await registry events rather than arbitrary timeouts. Each step should record before/after tree hashes and action result objects.
6. Assert flow outcomes against registry state and public accessibility output, not screenshots.
7. Emit structured failures with `code`, `message`, `stepIndex`, `id`, `candidates`, and a redacted semantic subtree.

This strategy gives Agent UI three guarantees before native E2E exists:

- Components produce accessible React Native output that RNTL can query.
- The registry reflects what rendered components expose.
- Agent flow semantics and MCP tool semantics can be tested deterministically on Windows/Linux/macOS CI without iOS Simulator, Android Emulator, Xcode, or Android Studio.

Known boundaries:

- RNTL does not execute native code and does not assert against the native view hierarchy. Source: RNTL testing environment, https://callstack.github.io/react-native-testing-library/docs/advanced/testing-env, accessed 2026-04-27.
- Native adapter behavior, platform-specific accessibility tree quirks, text input edge cases, and automation selector mapping still need compiled app checks later.

## Deferred Integrations

- React Native core DevTools third-party panel integration: defer until React Native documents a stable first-party extension API.
- Rozenite panel: defer until the Expo DevTools Plugin semantic inspector is stable and there is a concrete benefit to appearing inside React Native DevTools rather than Expo DevTools.
- Maestro YAML export and CLI runner: defer until Agent UI flow schema has shipped and at least one example app flow is stable.
- Detox spec generation and project config: defer because it requires native build configuration and is not drop-in for Expo v0.
- Appium/WebDriver export: defer because platform selector mapping and server/device setup are heavier than v0 needs.
- Visual regression and screenshot matching: defer indefinitely as non-core validation. Screenshots may support diagnostics later, but not semantic correctness.
- Native adapter E2E matrix: defer until `@expo/ui/swift-ui` and any Android/native adapter surfaces have stable example screens.
- DevTools performance timeline integration: defer until the semantic runtime has real event volume to profile.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| React Native 0.76 release | https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture | 2026-04-27 | React Native 0.76 introduced React Native DevTools as stable default debugging experience and New Architecture by default. |
| React Native DevTools docs | https://reactnative.dev/docs/react-native-devtools | 2026-04-27 | Current DevTools panels, Network/Performance availability, Expo Network distinction, and scope limitations. |
| React Native DevTools 0.76 discussion | https://github.com/react-native-community/discussions-and-proposals/discussions/819 | 2026-04-27 | Core third-party Chrome extension loading was not shipped as of 0.76; Expo Dev Plugins are named as an alternative. |
| Expo debugging and profiling tools | https://docs.expo.dev/debugging/tools/ | 2026-04-27 | Expo describes React Native DevTools for Expo/RN apps and notes Expo-only Network tab behavior. |
| Expo DevTools plugin docs | https://docs.expo.dev/debugging/create-devtools-plugins/ | 2026-04-27 | `useDevToolsPluginClient`, `sendMessage`, `addMessageListener`, debug-mode/no-op plugin architecture. |
| React Native View props | https://reactnative.dev/docs/view | 2026-04-27 | `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `accessibilityValue`, `accessible`, `id`, `nativeID`, and `testID` semantics. |
| React Native Accessibility docs | https://reactnative.dev/docs/accessibility | 2026-04-27 | Accessibility role, label, state, actions, and dynamic announcement semantics. |
| RNTL queries | https://callstack.github.io/react-native-testing-library/docs/api/queries | 2026-04-27 | Query variants, role accessibility requirements, name/state/value filters, text/label/testID query behavior. |
| RNTL testing environment | https://callstack.github.io/react-native-testing-library/docs/advanced/testing-env | 2026-04-27 | RNTL uses React Test Renderer, runs in Node/Jest without device/simulator, and does not execute native code. |
| RNTL user-event | https://callstack.github.io/react-native-testing-library/docs/api/events/user-event | 2026-04-27 | More realistic press/type/clear/paste/scroll event simulation and host element caveats. |
| RNTL fire-event | https://callstack.github.io/react-native-testing-library/docs/api/events/fire-event | 2026-04-27 | `fireEvent` role for unsupported/composite events and `fireEventAsync` v13.3.0 note. |
| Maestro core selectors | https://docs.maestro.dev/reference/selectors/core-selectors | 2026-04-27 | Maestro selector types and accessibility-tree behavior; `text` and `id` mapping. |
| Maestro React Native docs | https://docs.maestro.dev/get-started/supported-platform/react-native | 2026-04-27 | React Native support, `testID` mapping to `id`, Expo Go versus standalone launch behavior. |
| Detox getting started | https://wix.github.io/Detox/docs/introduction/getting-started/ | 2026-04-27 | Detox E2E scope, device/simulator execution, and gray-box testing model. |
| Detox matchers | https://wix.github.io/Detox/docs/next/api/matchers/ | 2026-04-27 | `by.id`, `by.label`, `by.text`, `by.traits`, regex, identifier recommendations, index caveat. |
| Detox project setup | https://wix.github.io/Detox/docs/introduction/project-setup/ | 2026-04-27 | Native build/binary setup and Expo-specific setup caveat. |
| Appium finding elements | https://appium.github.io/appium.io/docs/en/writing-running-appium/finding-elements/ | 2026-04-27 | Appium locator strategies including `accessibility id`. |
| Appium XCUITest locator strategies | https://appium.github.io/appium-xcuitest-driver/5.2/locator-strategies/ | 2026-04-27 | iOS `id`, `name`, `accessibility id`, class name, predicate, class chain, XPath behavior. |
| Appium UiAutomator2 driver docs | https://github.com/appium/appium-uiautomator2-driver | 2026-04-27 | Android locator strategies, `accessibilityId` mapping, React Native `accessibilityLabel` note. |
| Appium UiAutomator2 quickstart | https://appium.io/docs/en/3.3/quickstart/uiauto2-driver/ | 2026-04-27 | Appium server/driver setup and Android versus iOS/macOS requirement note. |
| Callstack Rozenite announcement | https://www.callstack.com/blog/introducing-rozenite-a-plugin-framework-for-react-native-devtools | 2026-04-27 | Rozenite as a community React Native DevTools plugin framework and later optional integration. |

## Final Recommendation

For Stage 3 through Stage 5, Agent UI should make semantic correctness a headless contract:

- Stage 3 Semantic Runtime: build pure Jest tests for registry behavior and RNTL tests that prove primitives emit the correct accessibility and `testID` surface.
- Stage 4 Agent Tool Bridge: validate `inspect_tree`, `get_state`, `tap`, `input`, `scroll`, `navigate`, `run_flow`, `wait_for`, and `collect_events` against an in-memory RNTL harness before any simulator automation.
- Stage 5 MCP Server: test JSON-RPC schemas, stdio transport, structured errors, redaction, and mocked app bridge behavior in Node.

Use Expo DevTools Plugins for v0 live semantic inspection. Keep React Native DevTools core extension work, Rozenite, Maestro, Detox, and Appium as optional integrations after the semantic runtime and flow schema are stable. The engineering rule is: first prove semantic flows without a simulator; then export the same stable IDs and flow steps to native automation tools as opt-in verification.

DONE_WITH_CONCERNS
