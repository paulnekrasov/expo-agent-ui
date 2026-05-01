# Cloud Flows And Visual Comparison Research

## Executive Summary
- Keep Agent UI v0 local-first and semantic-first; cloud execution and visual diff should be post-v0 adapters, not required runtime dependencies (Expo Agent UI rebuild plan; access date 2026-04-27).
- Expo EAS Workflows has pre-packaged `maestro` and `maestro-cloud` jobs, so the most Expo-native future cloud lane is exporting Agent UI semantic flows to Maestro YAML and running them through EAS when a team already has the required EAS and Maestro Cloud setup (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/; access date 2026-04-29).
- Maestro is the strongest fit for semantic flow export because it supports React Native, Expo Go/development builds/EAS workflows, stable `testID` selectors, screenshots, recording, and `assertScreenshot` visual checks (https://docs.maestro.dev/get-started/supported-platform/react-native; https://docs.maestro.dev/reference/commands-available/assertscreenshot; https://docs.maestro.dev/maestro-flows/workspace-management/record-your-flow; access date 2026-04-29).
- 2026-05-01 planning update: `docs/reference/agent/maestro-semantic-flow-adapter.md` is the
  dedicated reference for optional Agent UI to Maestro export, side-by-side Agent UI MCP and
  Maestro MCP usage, self-healing proposals, and Revyl-inspired local authoring/replay patterns.
- Appium remains the broadest interoperability target for commercial device clouds; Agent UI should export Appium-compatible selectors from semantic IDs but should not adopt Appium as the core control model (https://appium.io/docs/en/2.16/; https://www.browserstack.com/docs/app-automate/appium; https://docs.saucelabs.com/mobile-apps/automated-testing/appium/index.html; access date 2026-04-27).
- Visual comparison should validate rendered appearance after semantic assertions pass; it should catch layout, clipping, theming, typography, and image regressions, not prove business flow correctness (https://storybook.js.org/docs/writing-tests/visual-testing/; https://www.chromatic.com/docs/faq/chromatic-mobile-testing; access date 2026-04-27).
- EAS Build can compile iOS SwiftUI artifacts on Expo macOS cloud infrastructure, but live
  interactive preview still requires an iOS runtime. EAS cloud builds should be modeled as build
  artifact production, not as an always-on local simulator embedded in Agent UI
  (https://docs.expo.dev/build/introduction/; https://docs.expo.dev/build-reference/simulators;
  access date 2026-04-27).
- Side-by-side native adapter comparison should connect two runtime sessions, for example iOS
  SwiftUI on an iOS simulator/device/remote Mac and Android Compose on an Android
  emulator/device/cloud worker, then compare semantic trees and optional redacted screenshots.
- Screenshot baselines must be keyed by app build/update, platform, device model, OS, screen size, locale, color scheme, font scale, reduced-motion setting, and flow step to avoid false comparisons (Expo EAS Workflows and Maestro device-locale/device-model/device-os parameters: https://docs.expo.dev/eas/workflows/pre-packaged-jobs/; access date 2026-04-27).
- Sensitive inputs, tokens, PII-like labels, screenshots, logs, and event traces need redaction metadata at recording time; do not rely on later cloud-side scrubbing. Maestro's recording docs say the legacy `maestro record` path sends raw screen capture and Flow output to mobile.dev servers unless `--local` is used, so Agent UI exports should prefer local recording for sensitive flows (https://docs.maestro.dev/maestro-flows/workspace-management/record-your-flow; access date 2026-04-29).
- Chromatic is useful for web/Storybook and React Native Web approximations, but its own FAQ says it does not currently support native iOS or Android mobile testing; treat it as a design-system/web adapter, not mobile-cloud validation (https://www.chromatic.com/docs/faq/chromatic-mobile-testing; access date 2026-04-27).
- React Native Storybook plus Sherlo is a plausible future component-level visual lane for native RN stories, separate from full app flows (https://storybookjs.github.io/react-native/docs/intro/testing; https://docs.sherlo.io/; access date 2026-04-27).

## Tool Landscape
| Tool | Flow recording | Replay | Screenshot capture | Visual diff | Expo support | Device requirements | Paid/free constraint | Source URL |
|---|---|---|---|---|---|---|---|---|
| Expo EAS Workflows + Maestro jobs | No authoring recorder documented in EAS; orchestrates existing flows | Yes, through `maestro` / `maestro-cloud` workflow jobs | EAS Maestro examples document `record_screen: true`, `MAESTRO_TESTS_DIR` for `takeScreenshot` / `startRecording` assets, and a "Maestro Test Results" artifact | Via Maestro `assertScreenshot` when flows include it | Direct Expo workflow integration for builds and Maestro Cloud | EAS-hosted Android/iOS build and test infrastructure; Maestro Cloud job accepts build ID, device locale/model/OS params | EAS account; Maestro Cloud job requires Maestro Cloud account/plan and API key or `MAESTRO_CLOUD_API_KEY` | https://docs.expo.dev/eas/workflows/pre-packaged-jobs/ |
| Maestro CLI / Studio / Cloud | Studio can create flows visually; `record --local` creates MP4 recordings locally; legacy remote recording sends raw screen capture and Flow output to mobile.dev servers | Yes, local CLI and Maestro Cloud | `takeScreenshot`, `assertScreenshot`, `startRecording`, `stopRecording`, and `record` are documented | `assertScreenshot` compares against reference screenshots, with default 95% threshold and optional `cropOn` selector | Official React Native docs say Expo Go, development builds, and EAS workflows are supported; Expo Go uses `openLink` rather than custom `appId` launch | Android emulators/physical devices locally; iOS simulators locally; Cloud requires build artifacts | CLI/Studio can be free locally; Maestro Cloud requires Cloud plan | https://docs.maestro.dev/get-started/supported-platform/react-native; https://docs.maestro.dev/maestro-cloud/run-tests-on-maestro-cloud; https://docs.maestro.dev/reference/commands-available/assertscreenshot |
| Detox | No built-in no-code recorder in current docs reviewed | Yes, React Native E2E tests in CI/local runner | Artifacts include logs, screenshots, screen recordings, performance, and iOS view hierarchy snapshots | Not a primary visual diff product; screenshots can feed external diff tooling | Expo guide exists in older Detox docs; modern Expo support should be revalidated per SDK/version NEEDS_VERIFICATION | Simulators/emulators; iOS test paths generally require macOS/Xcode | Open source; CI/device infrastructure cost is external | https://wix.github.io/Detox/docs/config/artifacts/; https://wix.github.io/Detox/docs/19.x/guide/expo |
| Appium | Third-party recorders exist, but official core is WebDriver automation, not semantic recording | Yes, cross-platform UI automation through drivers/plugins | Standard screenshot commands and cloud-provider screenshots | Images plugin exposes image comparison APIs; visual service integrations also exist | Works against built Expo app binaries like any native/hybrid app, but no Expo-specific official integration found in Appium docs | Local or cloud iOS/Android devices, simulators, emulators depending driver/provider | Open source; device labs/cloud providers are separate costs | https://appium.io/docs/en/2.16/; https://appium.io/docs/en/2.5/commands/images-plugin/ |
| BrowserStack App Automate | Test Companion can generate mobile tests from app exploration; traditional App Automate replays framework scripts | Yes, Appium/Espresso/XCUITest/Detox/Maestro framework lanes | Captures screenshots, video, logs, network logs, UI hierarchy depending lane | Use App Percy for visual testing, or Appium image/plugin approaches | Expo app binaries can be uploaded as Android/iOS apps; no Expo-specific runtime integration needed | Real Android/iOS cloud devices | Commercial cloud; exact plan constraints NEEDS_VERIFICATION | https://www.browserstack.com/docs/app-automate/appium; https://www.browserstack.com/docs/test-companion/mobile-testing |
| BrowserStack App Percy | No flow recorder; integrates snapshots into existing automated tests | Reuses existing Appium/WebdriverIO/Espresso/XCUITest scripts | Yes, captures snapshots through SDK or BrowserStack integration | Yes, native mobile visual testing and review | Supports Expo indirectly through built app binaries and supported automation frameworks | BrowserStack real device infrastructure | Commercial with free-start messaging; exact quota/plan constraints NEEDS_VERIFICATION | https://www.browserstack.com/app-percy; https://www.browserstack.com/docs/app-percy/integrate/percy-with-browserstack-sdk |
| Sauce Labs Mobile + Sauce Visual | No Expo-specific flow recorder found in docs reviewed | Yes, Appium/Espresso/XCUITest automated mobile tests | Mobile cloud provides test artifacts; exact screenshot/video settings are framework/provider-specific NEEDS_VERIFICATION | Sauce Visual is a product area; exact native-mobile visual workflow needs further source verification NEEDS_VERIFICATION | Expo app binaries can be uploaded as native/hybrid apps; no Expo-specific runtime integration found | Sauce real and virtual mobile devices | Commercial cloud; exact plan constraints NEEDS_VERIFICATION | https://docs.saucelabs.com/mobile-apps/; https://docs.saucelabs.com/mobile-apps/automated-testing/appium/index.html |
| Applitools Eyes | No primary flow recorder for Agent UI scope; attaches visual checkpoints to existing tests | Reuses Appium/Espresso and other test framework execution | Yes, visual checkpoints capture screens | Yes, Visual AI baseline comparison, ignore/match regions, and mobile app support | Supports Expo indirectly through Appium/Espresso/native test execution against built binaries | Local/cloud devices through chosen execution provider | Commercial service with SDK integrations; exact plan constraints NEEDS_VERIFICATION | https://applitools.com/platform/eyes/; https://applitools.com/solutions/mobile-testing/; https://help.applitools.com/hc/en-us/articles/360007188651-How-to-build-an-Appium-test-with-Applitools-Eyes |
| Chromatic | No native mobile flow recording | Replays Storybook/Playwright/Cypress UI tests in cloud browsers | Yes, browser snapshots from Storybook/Playwright/Cypress | Yes, web visual diffs with ignore support | Native iOS/Android mobile testing is not currently supported; can test smaller web viewports | Cloud browsers, not native mobile devices | Free-start and paid usage model; native mobile support absent | https://www.chromatic.com/docs/; https://www.chromatic.com/docs/faq/chromatic-mobile-testing |
| React Native Storybook + Sherlo | Storybook stories define component states; no full app flow recorder | Sherlo runs RN Storybook stories as visual cases | Yes, captures native iOS/Android story screenshots in cloud | Yes, React Native Storybook visual testing and review | React Native and Expo compatibility depends on Storybook/app build setup; Sherlo says EAS Update can speed JS-only UI changes | iOS/Android simulators in Sherlo cloud | Sherlo lists free and paid tiers; exact limits may change | https://storybookjs.github.io/react-native/docs/intro/testing; https://docs.sherlo.io/; https://sherlo.io/ |

## Semantic Flow Export Strategy
Agent UI flows should remain the source of truth as semantic JSON, then compile outward to tool-specific formats. The stable flow model should describe intent, node IDs, semantic roles, expected state, and redaction rules before it describes coordinates or vendor commands. This preserves Agent UI's semantic-control model while allowing adapters for Maestro YAML, Appium/WebdriverIO scripts, Detox/Jest tests, Storybook story journeys, or visual-snapshot tools (Maestro React Native selectors and Expo readiness: https://docs.maestro.dev/platform-support/react-native; Appium platform model: https://appium.io/docs/en/2.16/; access date 2026-04-27).

Recommended export levels:

- `agentui.flow.json`: canonical local-first format with semantic steps such as `navigate`, `tap`, `input`, `assertState`, `assertVisible`, `snapshot`, and `collectEvents`.
- `maestro.yaml`: first external export target, mapping semantic IDs to `testID`/accessibility IDs and explicit waits. Maestro is favorable because its React Native docs recommend stable `testID` selectors and describe Expo Go, development build, and EAS workflows support (https://docs.maestro.dev/platform-support/react-native; access date 2026-04-27).
- `appium.webdriver.ts`: interoperability export for BrowserStack, Sauce Labs, and other Appium clouds. Keep this as an adapter because Appium is broad but not semantic-first (https://www.browserstack.com/docs/app-automate/appium; https://docs.saucelabs.com/mobile-apps/automated-testing/appium/index.html; access date 2026-04-27).
- `visual.snapshots.json`: snapshot manifest, not a test runner. It should name which semantic step can take a screenshot, what region to crop, what dynamic regions to ignore, and what threshold or review policy applies.

Export rules:

- Preserve `semanticId` in every generated selector comment/name even when the target tool uses `testID`, accessibility ID, visible text, XPath, or image matching.
- Prefer semantic ID and accessibility/testID selectors; visible text is acceptable for exploratory export but brittle for localization, as Maestro's React Native docs also warn by recommending `testID` for stable targeting (https://docs.maestro.dev/platform-support/react-native; access date 2026-04-27).
- Add tool capability metadata to each export: `supportsCloud`, `supportsScreenshots`, `supportsVisualDiff`, `requiresBinary`, `requiresSimulator`, `requiresPaidPlan`, and `unsupportedReasons`.
- Treat coordinate actions and image matching as fallback-only exports. Appium image comparison and image elements exist, but they rely on screenshots/reference images and should not replace semantic selectors (https://appium.io/docs/en/2.5/commands/images-plugin/; access date 2026-04-27).

## Native Adapter Preview Strategy

Native adapter preview is a multi-runtime problem. SwiftUI and Jetpack Compose are real native
rendering surfaces, but they are platform-bound. A visual editor can compare them only by
connecting to separate running sessions:

- iOS SwiftUI session: iOS Simulator, iOS device, remote Mac, or cloud iOS workflow capture.
- Android Compose session: Android Emulator, Android device, or cloud Android worker.
- Shared editor state: semantic tree, adapter capabilities, layout diagnostics, action log,
  selected semantic node, and optional screenshot/video artifacts.

EAS reduces the iOS build barrier. EAS Build produces iOS binaries on Expo macOS cloud
infrastructure, and iOS simulator builds can be created with `ios.simulator: true` and installed
through EAS CLI or Expo Orbit (https://docs.expo.dev/build/introduction/ and
https://docs.expo.dev/build-reference/simulators, access date 2026-04-27). This does not create a
persistent local iOS Simulator for Windows/Linux users. Live interaction still needs a simulator,
device, remote Mac, or a cloud workflow that can run and capture the app.

EAS Workflows provides macOS workers for iOS jobs including simulators and Linux
nested-virtualization workers for Android Emulators (https://docs.expo.dev/eas/workflows/syntax/,
access date 2026-04-27). This is a strong post-v0 lane for automated comparison artifacts:
semantic flow results, screenshots, videos, logs, and build metadata. It should not be treated as
the Stage 4 local bridge or Stage 5 MCP server.

Recommended editor contract:

```ts
type NativePreviewSession = {
  sessionId: string;
  platform: "ios" | "android" | "web";
  adapter: "react-native" | "ios-swift-ui" | "android-compose" | "web-dom";
  runtime: "local" | "device" | "remote-mac" | "eas-workflow" | "cloud-device";
  buildId?: string;
  updateId?: string;
  device?: {
    model?: string;
    osVersion?: string;
    screen?: { width: number; height: number; scale?: number };
  };
  capabilities: string[];
  unsupportedReasons?: string[];
};
```

The visual editor should never imply that a single simulator can render both native adapters. It
should make the session split visible and explain unsupported combinations with structured
diagnostics.

## Recording Schema
Future recordings should be append-only evidence bundles, not opaque videos. A recording should include enough metadata to replay locally, export to cloud tools, compare visuals, debug failures, and redact sensitive data before upload.

```json
{
  "schemaVersion": "agentui.recording.v0",
  "recordingId": "uuid",
  "createdAt": "2026-04-27T00:00:00.000Z",
  "source": {
    "agentUIVersion": "0.0.0",
    "appName": "example",
    "appVersion": "1.2.3",
    "runtime": "expo-development-build",
    "expoSdk": "NEEDS_VERIFICATION",
    "git": {
      "branch": "feature/checkout",
      "commit": "abcdef0",
      "dirty": false
    },
    "eas": {
      "buildId": "optional",
      "updateId": "optional",
      "channel": "optional"
    }
  },
  "environment": {
    "platform": "ios",
    "deviceModel": "iPhone 16 Pro",
    "osVersion": "iOS 18.2",
    "screen": { "width": 393, "height": 852, "scale": 3 },
    "locale": "en_US",
    "timeZone": "UTC",
    "colorScheme": "light",
    "fontScale": 1,
    "reducedMotion": false,
    "networkProfile": "wifi",
    "permissions": { "notifications": "denied" }
  },
  "flow": {
    "name": "checkout.happyPath",
    "semanticVersion": "1",
    "steps": [
      {
        "index": 1,
        "action": "input",
        "semanticId": "checkout.cardNumber",
        "intent": "enter_payment_card",
        "valueRef": "redacted:payment_card",
        "assertions": [
          { "kind": "state", "semanticId": "checkout.cardNumber", "equals": "redacted:payment_card" }
        ],
        "snapshot": {
          "enabled": true,
          "name": "checkout-card-entered",
          "cropToSemanticId": "checkout.form",
          "ignoreSemanticIds": ["checkout.clock", "checkout.avatar"],
          "threshold": { "kind": "percentMatch", "value": 98 }
        }
      }
    ]
  },
  "artifacts": {
    "semanticTrees": [{ "stepIndex": 1, "path": "semantic-tree-001.json", "redacted": true }],
    "screenshots": [{ "stepIndex": 1, "path": "screenshots/001.png", "redacted": true }],
    "videos": [{ "path": "recording.mp4", "redacted": false }],
    "logs": [{ "path": "logs/app.log", "redacted": true }],
    "events": [{ "path": "events.ndjson", "redacted": true }]
  },
  "privacy": {
    "classification": "internal",
    "uploadAllowed": false,
    "redactionPolicy": "strict",
    "redactedFields": [
      "flow.steps[].value",
      "semanticTree.nodes[].value",
      "logs",
      "screenshots.regions.payment"
    ],
    "retentionDays": 7
  }
}
```

Schema notes:

- Include EAS build/update identifiers because EAS workflows and build IDs are first-class in Expo cloud automation (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/; access date 2026-04-27).
- Include device locale/model/OS because EAS Maestro Cloud job parameters expose those dimensions and they materially affect screenshots (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/; access date 2026-04-27).
- Include screenshots, videos, logs, event traces, and semantic trees because Maestro Cloud and Detox both expose test evidence/artifacts, and cloud-device tools commonly provide logs/screenshots/video for debugging (https://docs.maestro.dev/maestro-cloud/run-tests-on-maestro-cloud; https://wix.github.io/Detox/docs/config/artifacts/; https://www.browserstack.com/docs/app-automate/appium; access date 2026-04-27).
- Include explicit `uploadAllowed` and redaction fields because Expo warns that secrets can leak when environment variables are exposed improperly, and Agent UI recordings may contain app state or user-entered values (https://docs.expo.dev/eas/environment-variables/faq/; access date 2026-04-27).

## Visual Comparison Strategy
Screenshots help when the question is visual: clipped text, overlapping content, incorrect spacing, broken dark mode, wrong icon, image loading failure, theme mismatch, platform chrome drift, or unexpected layout on a specific device. Screenshot evidence is also useful for debugging failed semantic flows because it shows what the user would have seen at the failure point (Maestro recording/screenshot docs: https://docs.maestro.dev/maestro-flows/workspace-management/record-your-flow; Detox artifacts: https://wix.github.io/Detox/docs/config/artifacts/; access date 2026-04-27).

Semantic assertions are better when the question is behavioral: route reached, button enabled, validation error present, form state updated, action result succeeded, selected tab changed, or API-driven status moved from loading to success. Visual diff should not be used as the only proof that checkout submitted, settings saved, or navigation state changed. This follows the rebuild plan constraint that screenshots are evidence, not the primary semantic-control model.

Thresholds:

- Start with semantic-region screenshots rather than full-screen screenshots. Maestro's `assertScreenshot` supports `cropOn`, which is a useful pattern for reducing noise around status bars, clocks, keyboards, ads, and dynamic content (https://docs.maestro.dev/reference/commands-available/assertscreenshot; access date 2026-04-27).
- Use a high default for stable component regions, for example 98% match, and lower only with documented reasons. Maestro's documented default is 95%, so an Agent UI preset above that should be treated as a stricter product default, not a universal truth (https://docs.maestro.dev/reference/commands-available/assertscreenshot; access date 2026-04-27).
- Require human review for first baselines and for threshold changes. Tools such as Percy/App Percy, Applitools, Sherlo, and Chromatic all orient around baseline review or visual change review rather than silent auto-acceptance (https://www.browserstack.com/app-percy; https://applitools.com/platform/eyes/; https://docs.sherlo.io/; https://www.chromatic.com/docs/; access date 2026-04-27).

Ignore regions:

- Always ignore OS status bar time, battery, network indicators, home indicator area, transient keyboard suggestions, loading spinners that are not under test, animated skeletons, dynamic ads, randomized avatars, timestamps, and personalized data.
- Prefer semantic ignore regions such as `ignoreSemanticIds: ["feed.ad", "profile.avatar"]` over raw pixel boxes, then compile them to crop/mask primitives for the target tool.
- Support privacy masks before upload so sensitive text is absent from stored screenshots, not only hidden in the report UI.

Device/theme/locale matrix:

- Minimum post-v0 matrix: one iOS simulator profile, one Android emulator profile, light and dark themes, default locale, and one increased font scale lane.
- Expanded matrix: representative small/large screens, RTL locale, reduced motion enabled, iOS/Android latest stable OS versions, and one older supported OS version.
- Cloud matrix should be opt-in because BrowserStack, Sauce Labs, Maestro Cloud, App Percy, Applitools, and Sherlo all introduce external account, cost, privacy, and queue-time constraints (sources in Tool Landscape; access date 2026-04-27).

Risks:

- Visual diffs are noisy when animations, clocks, personalized data, network images, maps, ads, or platform rendering vary.
- Cloud results can diverge from local results because device type, OS image, font rendering, and animation timing differ.
- Vendor screenshots may store sensitive app data; Agent UI must redact before upload where possible.
- Native-mobile visual services are moving targets. Mark adapter-specific claims with versioned docs and recheck before implementation.

## Local-First Architecture
The local architecture should have four layers:

1. Semantic flow runner: executes Agent UI actions by semantic ID against the local runtime and records semantic trees, events, logs, and optional screenshots.
2. Evidence store: writes local recording bundles with redaction metadata and deterministic naming.
3. Export adapters: compile semantic flows to Maestro YAML first, then Appium/WebdriverIO, Detox/Jest, Storybook/Sherlo, or visual-snapshot manifests later.
4. Cloud upload adapters: optional commands that upload only redacted bundles or generated test suites to a selected provider.

Suggested evolution:

- v0: local semantic flows only, with optional local screenshots for debugging.
- v0.x: `agent-ui export maestro` that maps semantic IDs to `testID` selectors and can run locally with Maestro CLI.
- v1: EAS Workflows integration that can run exported Maestro flows against EAS builds or Maestro Cloud for teams that opt in (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/; access date 2026-04-27).
- v1.x: visual snapshot manifests with `cropToSemanticId`, `ignoreSemanticIds`, threshold, and review policy.
- v1.x: multi-session visual editor comparison for local/remote iOS SwiftUI and Android Compose
  runtimes after the bridge exposes session metadata and adapter capabilities.
- v2: provider adapters for App Percy, Applitools, BrowserStack App Automate, Sauce Labs, and Sherlo after privacy and artifact contracts are stable.

This architecture keeps cloud services replaceable. It also prevents Agent UI from becoming a wrapper around screenshots, Appium, or any paid provider.

## 2026-04-29 Verification Update

`$deep-research` was attempted for this follow-up and produced an interaction stream, but the local
script exited non-zero before saving a report. The edits in this pass use directly rechecked
official/primary sources, not unsaved partial output.

Verified updates:

- EAS Workflows pre-packaged jobs document both `maestro` and `maestro-cloud` job types. The
  `maestro-cloud` job requires `build_id`, `maestro_project_id`, `flows`, and either
  `maestro_api_key` or `MAESTRO_CLOUD_API_KEY`; it also supports device locale/model/OS parameters
  and exposes result outputs such as URL, total flow count, and successful/failed counts
  (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/, accessed 2026-04-29).
- EAS Maestro job examples document `record_screen: true`, the `MAESTRO_TESTS_DIR` environment
  variable for `takeScreenshot` / `startRecording` assets, and a "Maestro Test Results" artifact.
  This resolves the previous `NEEDS_VERIFICATION` around EAS-managed screen recording and
  screenshot artifact handling (https://docs.expo.dev/eas/workflows/pre-packaged-jobs/,
  accessed 2026-04-29).
- Maestro's React Native docs recommend `testID` for stable targeting and state that Maestro maps
  it to a unique `id`; they also document Expo Go, development build, and EAS workflow lanes
  (https://docs.maestro.dev/get-started/supported-platform/react-native, accessed 2026-04-29).
- Maestro `assertScreenshot` supports `path`, `cropOn`, and `thresholdPercentage`, with a documented
  default threshold of `95.0`; this supports Agent UI's recommendation to crop by semantic region
  and require explicit threshold policy
  (https://docs.maestro.dev/reference/commands-available/assertscreenshot, accessed 2026-04-29).
- Maestro recording docs now recommend `maestro record --local`; the legacy remote path sends raw
  screen capture and Flow output to mobile.dev servers. Agent UI should therefore default any
  exported recording workflow to local recording unless the user explicitly opts into remote/cloud
  upload (https://docs.maestro.dev/maestro-flows/workspace-management/record-your-flow, accessed
  2026-04-29).
- Chromatic still states that it does not currently support iOS or Android mobile testing, so it
  remains a web/Storybook viewport tool for Agent UI rather than a native mobile validation path
  (https://www.chromatic.com/docs/faq/chromatic-mobile-testing/, accessed 2026-04-29).
- React Native Storybook docs say there is not currently built-in visual testing for React Native
  Storybook, but recommend Maestro/Detox/other tools for automating Storybook screenshots and list
  Sherlo as an external React Native Storybook visual testing/review tool
  (https://storybookjs.github.io/react-native/docs/intro/testing/, accessed 2026-04-29).

Resolved concerns:

- EAS/Maestro artifact handling is now specific enough for a future adapter design:
  `record_screen`, `MAESTRO_TESTS_DIR`, and EAS artifact output are documented.
- Maestro privacy guidance is concrete: local recording is the default recommendation for sensitive
  flows because remote rendering sends raw capture data to external servers.
- Chromatic's scope is no longer ambiguous: it is not a native iOS/Android mobile test runner.

Remaining implementation gates:

- Before implementing cloud export, create fixture flows that prove `testID` selectors from Agent
  UI primitives compile to stable Maestro `id` selectors on Expo Go and development builds.
- Before implementing Maestro export, define the canonical Agent UI semantic flow schema and keep
  Maestro YAML as generated output rather than the source of truth.
- Before implementing self-healing, define a structured proposal schema that requires human
  approval for taps, input, checkout, auth, network, payment, submit, and destructive actions.
- Before enabling cloud upload, implement redaction and an explicit `uploadAllowed` flag in the
  recording schema.
- Before adding provider adapters, recheck current plan, quota, artifact-retention, and privacy
  terms for Maestro Cloud, BrowserStack/App Percy, Sauce Labs, Applitools, and Sherlo.
- Keep EAS/Maestro export outside the core runtime package; the core remains local semantic flow
  execution and redacted evidence capture.

## Deferred Work And Anti-Goals
- Do not require Maestro Cloud, BrowserStack, Sauce Labs, App Percy, Applitools, Sherlo, or Chromatic for Agent UI v0.
- Do not require Maestro CLI or Maestro MCP for core Agent UI runtime use.
- Do not depend on Revyl. Borrow natural-language flow generation, visual replay, YAML sync,
  reusable modules, self-healing suggestions, and unified reports only as local-first Agent UI
  patterns.
- Do not make screenshot diff the primary correctness model.
- Do not add provider SDKs to the core runtime package.
- Do not store raw text inputs, tokens, payment data, auth headers, screenshots with PII, or unredacted logs in cloud recordings.
- Do not auto-upload recordings by default.
- Do not auto-approve visual baselines.
- Do not build a custom cloud device farm.
- Do not promise native iOS/Android support for web-only visual tools such as Chromatic; Chromatic's own FAQ says native mobile testing is not currently supported (https://www.chromatic.com/docs/faq/chromatic-mobile-testing; access date 2026-04-27).
- Do not implement visual AI matching before stable semantic IDs, flow schema, local replay, and redaction are mature.
- Do not rely on coordinate-only replay except as an explicitly marked fallback.
- Do not promise that EAS cloud builds provide a live local iOS Simulator on Windows/Linux.
- Do not promise one simulator or emulator can render both iOS SwiftUI and Android Compose native
  views.
- Do not build side-by-side native preview before the bridge can identify multiple runtime
  sessions and their adapter capability flags.

## Source Index
- Expo EAS Workflows pre-packaged jobs, https://docs.expo.dev/eas/workflows/pre-packaged-jobs/, access date 2026-04-27. Supports claims about EAS `maestro` / `maestro-cloud` jobs, build IDs, device locale/model/OS parameters, Maestro Cloud account/plan requirement, and workflow outputs.
- Expo EAS Build, https://docs.expo.dev/build/introduction/, access date 2026-04-27. Supports claims about hosted Android/iOS binary builds and Expo macOS cloud infrastructure for iOS builds.
- Expo iOS Simulator builds, https://docs.expo.dev/build-reference/simulators, access date 2026-04-27. Supports claims about `ios.simulator: true`, EAS simulator artifacts, installation, and development server use.
- EAS Workflows syntax, https://docs.expo.dev/eas/workflows/syntax/, access date 2026-04-27. Supports claims about macOS workers for iOS simulator jobs and Linux nested-virtualization workers for Android Emulator jobs.
- Expo EAS environment variable FAQ, https://docs.expo.dev/eas/environment-variables/faq/, access date 2026-04-27. Supports privacy guidance that secrets can be exposed when environment variables are mishandled.
- Maestro React Native platform support, https://docs.maestro.dev/platform-support/react-native, access date 2026-04-27. Supports claims about React Native support, Expo Go/development builds/EAS workflows, text selectors, and `testID` selectors.
- Maestro Cloud overview, https://docs.maestro.dev/maestro-cloud, access date 2026-04-27. Supports claims about hosted parallel mobile test execution, CI integration, device isolation, and configurable environment dimensions.
- Maestro Cloud run tests, https://docs.maestro.dev/maestro-cloud/run-tests-on-maestro-cloud, access date 2026-04-27. Supports claims about `maestro cloud`, app binary requirements, Cloud plan requirement, and results artifacts.
- Maestro `assertScreenshot`, https://docs.maestro.dev/reference/commands-available/assertscreenshot, access date 2026-04-27. Supports claims about screenshot comparison, `cropOn`, `thresholdPercentage`, and default 95% threshold.
- Maestro record your flow, https://docs.maestro.dev/maestro-flows/workspace-management/record-your-flow, access date 2026-04-27. Supports claims about MP4 test recordings and screenshot commands.
- Agent UI Maestro semantic flow adapter, docs/reference/agent/maestro-semantic-flow-adapter.md,
  access date 2026-05-01. Defines the local-first Agent UI integration rules for optional Maestro
  export/execution and Revyl-inspired UX patterns.
- Detox artifacts, https://wix.github.io/Detox/docs/config/artifacts/, access date 2026-04-27. Supports claims about screenshots, logs, videos, performance, and UI hierarchy artifacts.
- Detox Expo guide, https://wix.github.io/Detox/docs/19.x/guide/expo, access date 2026-04-27. Supports existence of Detox Expo guidance, with modern Expo compatibility marked NEEDS_VERIFICATION.
- Appium documentation, https://appium.io/docs/en/2.16/, access date 2026-04-27. Supports claims about Appium as a UI automation framework for mobile and other platforms.
- Appium images plugin, https://appium.io/docs/en/2.5/commands/images-plugin/, access date 2026-04-27. Supports claims about image comparison APIs.
- BrowserStack App Automate Appium docs, https://www.browserstack.com/docs/app-automate/appium, access date 2026-04-27. Supports claims about Appium tests on BrowserStack real Android/iOS cloud devices, parallel testing, and debugging artifacts.
- BrowserStack Test Companion mobile testing, https://www.browserstack.com/docs/test-companion/mobile-testing, access date 2026-04-27. Supports claims about AI-assisted mobile test generation using screenshots and UI hierarchy on real devices.
- BrowserStack App Percy product page, https://www.browserstack.com/app-percy, access date 2026-04-27. Supports claims about native mobile visual testing, real-device infrastructure, SDK integration, and Appium/Espresso/XCUITest support.
- BrowserStack App Percy SDK integration, https://www.browserstack.com/docs/app-percy/integrate/percy-with-browserstack-sdk, access date 2026-04-27. Supports claims about automatic and explicit screenshot capture through SDK integration.
- Sauce Labs mobile app testing, https://docs.saucelabs.com/mobile-apps/, access date 2026-04-27. Supports claims about testing native/hybrid apps on emulators, simulators, and real devices.
- Sauce Labs Appium docs, https://docs.saucelabs.com/mobile-apps/automated-testing/appium/index.html, access date 2026-04-27. Supports claims about Appium mobile automation on Sauce Labs and Appium 2 recommendation.
- Applitools Eyes, https://applitools.com/platform/eyes/, access date 2026-04-27. Supports claims about Visual AI, baseline comparison, dynamic content handling, ignore/region-style capabilities, and framework integrations.
- Applitools mobile testing, https://applitools.com/solutions/mobile-testing/, access date 2026-04-27. Supports claims about native mobile/mobile web visual testing and Appium/Espresso integration.
- Applitools Appium Eyes example, https://help.applitools.com/hc/en-us/articles/360007188651-How-to-build-an-Appium-test-with-Applitools-Eyes, access date 2026-04-27. Supports claims about adding Eyes checkpoints to Appium tests for Android/iOS.
- Chromatic docs, https://www.chromatic.com/docs/, access date 2026-04-27. Supports claims about Storybook/Playwright/Cypress cloud visual testing and browser-based snapshots.
- Chromatic mobile testing FAQ, https://www.chromatic.com/docs/faq/chromatic-mobile-testing, access date 2026-04-27. Supports claim that Chromatic does not currently support native iOS or Android mobile testing.
- Storybook visual tests, https://storybook.js.org/docs/writing-tests/visual-testing/, access date 2026-04-27. Supports claims about baseline snapshot visual testing through the official Chromatic addon.
- React Native Storybook testing, https://storybookjs.github.io/react-native/docs/intro/testing, access date 2026-04-27. Supports claims about React Native Storybook testing, portable stories, Maestro screenshot setup examples, visual testing best practices, and Sherlo as an external tool.
- Sherlo docs introduction, https://docs.sherlo.io/, access date 2026-04-27. Supports claims about Sherlo as a cloud visual testing/review tool for React Native Storybook.
- Sherlo product page, https://sherlo.io/, access date 2026-04-27. Supports claims about iOS/Android simulator cloud screenshots, review workflow, EAS Update note, and listed free/paid tiers.

## Final Recommendation
Build Agent UI's post-v0 cloud/visual path around a canonical semantic flow and recording schema. Export to Maestro first because it is the best current fit for Expo, React Native, stable `testID` targeting, local replay, EAS workflow integration, cloud execution, screenshots, recordings, and screenshot assertions. Add multi-session native preview comparison only after the bridge exposes session metadata and the SwiftUI/Compose adapters expose capability flags. Add Appium/WebdriverIO export later for BrowserStack/Sauce interoperability, then add provider-specific visual snapshot adapters for App Percy, Applitools, and Sherlo only after local semantic replay, artifact storage, and redaction are stable. Keep Chromatic limited to web/Storybook design-system coverage unless native mobile support changes.

DONE_WITH_CONCERNS
