# EAS Native Preview And Adapter Comparison Research

## Executive Summary

- EAS Build can compile iOS artifacts on Expo macOS cloud infrastructure, so contributors do not
  need a local Mac merely to produce an iOS SwiftUI build.
- EAS cloud build output is not the same thing as a persistent live iOS Simulator embedded in
  Agent UI's local visual editor.
- iOS SwiftUI preview requires an iOS runtime: iOS Simulator, physical iOS device, or a remote
  macOS/simulator session. Android Compose preview requires an Android runtime: emulator,
  physical device, or cloud Android test worker.
- The correct native comparison model is multi-session: one connected iOS SwiftUI runtime and one
  connected Android Compose runtime, both reporting semantic state to the same editor.
- A local Windows developer can run Android Emulator locally and use EAS to build iOS artifacts,
  but live iOS interaction still needs a Mac-hosted simulator/device or cloud capture workflow.
- EAS Workflows can run jobs on macOS workers for iOS simulator jobs and nested-virtualization
  Linux workers for Android Emulator jobs, which makes automated screenshot/video/test capture
  possible after semantic flows exist.
- Agent UI should treat side-by-side native preview as Stage 9+ visual-editor work, built on
  Stage 4 bridge sessions, Stage 5 MCP resources, and Stage 7 native adapters.
- The visual editor must compare semantic IDs, roles, labels, state, actions, layout diagnostics,
  and optional screenshots; screenshots remain evidence, not the control model.

## Source Facts

| Area | Current fact | Product meaning | Source |
|---|---|---|---|
| SwiftUI rendering | Expo UI brings SwiftUI primitives to React Native and uses `Host` to cross from React Native/UIKit into SwiftUI through `UIHostingController`. | Agent UI can build a real iOS SwiftUI adapter behind an explicit adapter boundary. | https://docs.expo.dev/guides/expo-ui-swift-ui/, accessed 2026-04-27 |
| EAS cloud build | EAS Build is a hosted service that builds Android and iOS app binaries. Android builds run on Linux runners; iOS builds run on Expo macOS cloud infrastructure. | iOS SwiftUI adapter builds can be produced from non-macOS developer machines through EAS. | https://docs.expo.dev/build/introduction/ and https://docs.expo.dev/build-reference/infrastructure/, accessed 2026-04-27 |
| iOS simulator artifacts | EAS supports iOS Simulator builds with `ios.simulator: true`; simulator builds can be installed with EAS CLI or Expo Orbit and then paired with `npx expo start` for development builds. | EAS can produce the `.app` artifact for an iOS simulator lane, but an iOS Simulator host is still needed to run it interactively. | https://docs.expo.dev/build-reference/simulators and https://docs.expo.dev/tutorial/eas/ios-development-build-for-simulators/, accessed 2026-04-27 |
| EAS Workflows workers | EAS Workflows custom jobs include macOS workers that run iOS jobs including simulators, and Linux nested-virtualization workers for Android Emulators. | Cloud-based automated preview/test capture is plausible, but it is a workflow lane, not a free local live editor session. | https://docs.expo.dev/eas/workflows/syntax/, accessed 2026-04-27 |
| Android native adapter | Expo UI Jetpack Compose is a separate Android entrypoint from SwiftUI, with its own `Host` and modifier namespace. | Android native preview must run in an Android runtime and use a separate adapter path. | https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/, accessed 2026-04-27 |

## Runtime Modes

| Mode | What it gives | What it does not give | Agent UI use |
|---|---|---|---|
| React Native fallback, local | Fast cross-platform preview on Expo/RN without `@expo/ui`. | Native SwiftUI/Compose visual fidelity. | Core development and v0 correctness. |
| iOS SwiftUI development build from EAS | Real iOS native SwiftUI artifact, built on Expo cloud macOS infrastructure. | A persistent local iOS Simulator on Windows/Linux. | Install/run on Mac-hosted simulator, iOS device, or remote runtime. |
| Android Compose development build | Real Android-native Compose artifact. | iOS SwiftUI rendering. | Run locally on Android Emulator or Android device; later cloud Android lane. |
| EAS Workflow simulator/emulator job | Automated run/capture on cloud worker classes. | Always-on interactive visual editor unless extra remote streaming tooling exists. | Post-v0 screenshots, recordings, and semantic flow validation. |
| Remote Mac session | Interactive iOS Simulator controlled through a remote machine. | Android Compose in the same iOS simulator. | Optional live side-by-side editor lane. |

## Adapter Switching Rules

- Adapter switching is a product/editor control over which renderer a running app session uses; it
  cannot make one OS render another OS's native UI.
- On iOS, a session may switch between React Native fallback and `ios-swift-ui`.
- On Android, a session may switch between React Native fallback and `android-compose`.
- In the visual editor, "side by side" means two sessions, not one simulator:
  - iOS session: iOS Simulator/device/remote Mac with the SwiftUI adapter.
  - Android session: Android Emulator/device/cloud Android worker with the Compose adapter.
- The editor should normalize comparison through semantic session metadata:
  - `sessionId`
  - `platform`
  - `adapter`
  - `buildId`
  - `runtimeVersion`
  - `device`
  - `screen`
  - `semanticTree`
  - `capabilities`
  - `unsupportedReasons`

## Visual Editor Implications

The future visual editor should be a development-only host surface, likely an Expo DevTools
Plugin or separate local web UI. It should connect to one or more app runtime bridge sessions and
render their semantic trees, selected node details, action logs, and optional preview artifacts.

Minimum useful side-by-side comparison:

- left/right runtime panes keyed by `sessionId`;
- adapter badge: `react-native`, `ios-swift-ui`, `android-compose`, or `web-dom`;
- semantic tree diff keyed by stable IDs;
- action availability diff;
- accessibility label/role/state diff;
- layout diagnostics from each runtime where available;
- screenshot or video evidence only when explicitly captured and redacted.

The editor must not become a screenshot-first controller. Agent actions should still target
semantic IDs and adapter capabilities. Visual evidence helps diagnose why two native adapters look
different after the semantic flow has reached the same state.

## Research Gaps

- NEEDS_VERIFICATION: whether EAS Workflows can provide enough simulator/emulator artifacts for
  near-live visual comparison, or only post-run screenshots/videos/logs.
- NEEDS_VERIFICATION: current Expo/Orbit support for installing and launching latest EAS simulator
  builds in fully scripted workflows.
- NEEDS_VERIFICATION: secure remote Mac options for teams that want interactive iOS preview from a
  Windows/Linux workstation.
- NEEDS_VERIFICATION: how much native accessibility metadata from Expo UI SwiftUI and Jetpack
  Compose can be inspected through Agent UI's JavaScript wrapper versus external automation tools.
- NEEDS_VERIFICATION: cost, queue-time, artifact-retention, and privacy constraints for EAS
  Workflows, Maestro Cloud, and other provider lanes immediately before implementation.

## Implementation Placement

- Stage 4: bridge sessions need stable `sessionId`, capabilities, platform, adapter, device, and
  build metadata.
- Stage 5: MCP resources can expose connected sessions and adapter capabilities.
- Stage 7: SwiftUI and Compose adapters must declare explicit capability flags and fallback paths.
- Stage 9: visual editor and side-by-side comparison can consume multi-session bridge data and
  optional screenshot/video artifacts.
- Stage 10: publish docs should explain local Android, EAS-built iOS, remote Mac, and cloud
  workflow preview lanes separately.

## Source Index

- Building SwiftUI apps with Expo UI, https://docs.expo.dev/guides/expo-ui-swift-ui/, accessed
  2026-04-27. Supports claims about Expo UI SwiftUI primitives, `Host`, and `UIHostingController`.
- EAS Build, https://docs.expo.dev/build/introduction/, accessed 2026-04-27. Supports claims
  about hosted Android/iOS binary builds and iOS builds on Expo macOS cloud infrastructure.
- EAS Build infrastructure, https://docs.expo.dev/build-reference/infrastructure/, accessed
  2026-04-27. Supports claims about Android Linux runners, macOS runners, and build images.
- Build for iOS Simulators, https://docs.expo.dev/build-reference/simulators, accessed
  2026-04-27. Supports claims about `ios.simulator: true`, simulator artifact installation, and
  development-server use for development builds.
- Create and run a cloud build for iOS Simulator,
  https://docs.expo.dev/tutorial/eas/ios-development-build-for-simulators/, accessed 2026-04-27.
  Supports claims about the EAS iOS simulator build profile and install/run flow.
- EAS Workflows syntax, https://docs.expo.dev/eas/workflows/syntax/, accessed 2026-04-27.
  Supports claims about macOS workers for iOS jobs including simulators and Linux
  nested-virtualization workers for Android Emulators.
- Expo UI Jetpack Compose, https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/,
  accessed 2026-04-27. Supports claims about Android-native Compose entrypoints and platform
  boundaries.

## Final Recommendation

Document Agent UI as cross-platform and multi-runtime, not single-simulator. Use EAS cloud Macs to
remove the iOS build barrier, but keep live iOS preview tied to an iOS runtime. Build the visual
editor around multiple connected runtime sessions so iOS SwiftUI and Android Compose can be
viewed side by side through shared semantic IDs and adapter capability metadata. Keep cloud
simulator/emulator capture optional and post-v0 until semantic flows, redaction, and native
adapter boundaries are stable.

DONE_WITH_CONCERNS
