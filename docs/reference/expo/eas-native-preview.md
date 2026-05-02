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
- EAS Android build profiles that compile the Compose adapter should enable Gradle cache with
  `EAS_GRADLE_CACHE=1` where available; cache hits are verified in the Run Gradle step through
  `FROM CACHE` task output.
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
| Android Gradle cache | EAS can enable Gradle build cache with `EAS_GRADLE_CACHE=1`; Expo says subsequent builds reuse task outputs when inputs match and cached Gradle tasks appear as `FROM CACHE` in build logs. | Android Compose build lanes should document the env setting and log check, especially for development builds with native UI dependencies. | https://expo.dev/changelog/gradle-cache, accessed 2026-04-30 |

## Runtime Modes

| Mode | What it gives | What it does not give | Agent UI use |
|---|---|---|---|
| React Native fallback, local | Fast cross-platform preview on Expo/RN without `@expo/ui`. | Native SwiftUI/Compose visual fidelity. | Core development and v0 correctness. |
| iOS SwiftUI development build from EAS | Real iOS native SwiftUI artifact, built on Expo cloud macOS infrastructure. | A persistent local iOS Simulator on Windows/Linux. | Install/run on Mac-hosted simulator, iOS device, or remote runtime. |
| Android Compose development build | Real Android-native Compose artifact. | iOS SwiftUI rendering. | Run locally on Android Emulator or Android device; enable EAS Gradle cache for repeated EAS Android builds when using the cloud lane. |
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
- Stage 7: Android Compose build docs should include an `eas.json` env example for
  `EAS_GRADLE_CACHE=1` and tell implementers to verify `FROM CACHE` in Run Gradle logs.
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
- Gradle cache for Android builds, https://expo.dev/changelog/gradle-cache, accessed
  2026-04-30. Supports `EAS_GRADLE_CACHE=1`, lockfile-derived cache keys, and `FROM CACHE` log
  verification.

## Final Recommendation

Document Agent UI as cross-platform and multi-runtime, not single-simulator. Use EAS cloud Macs to
remove the iOS build barrier, but keep live iOS preview tied to an iOS runtime. Build the visual
editor around multiple connected runtime sessions so iOS SwiftUI and Android Compose can be
viewed side by side through shared semantic IDs and adapter capability metadata. Keep cloud
simulator/emulator capture optional and post-v0 until semantic flows, redaction, and native
adapter boundaries are stable. For Android Compose EAS build lanes, document `EAS_GRADLE_CACHE=1`
as the default cache opt-in and require `FROM CACHE` log evidence before claiming cache behavior.

DONE_WITH_CONCERNS

## EAS Development Build Configuration

### iOS SwiftUI Development Build

The iOS SwiftUI adapter requires a development build profile in `eas.json` that targets the
simulator. This profile builds a `.app` bundle suitable for iOS Simulator installation.

**Prerequisites:** `@expo/ui` must already be installed in the project via
`npx expo install @expo/ui`.

```json
{
  "build": {
    "ios-swiftui-dev": {
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "image": "latest"
      },
      "channel": "development",
      "developmentClient": true,
      "env": {
        "EXPO_UI_SWIFTUI_ENABLED": "1"
      }
    }
  }
}
```

Key points for this profile:

| Aspect | Detail |
|---|---|
| `ios.simulator: true` | Produces a simulator-targeted `.app` bundle instead of a device IPA |
| `developmentClient: true` | Includes `expo-dev-client` for live refresh via `npx expo start` |
| `distribution: "internal"` | Makes the build available for internal distribution only |
| `channel: "development"` | Binds the build to the development update channel |
| `EXPO_UI_SWIFTUI_ENABLED` | Environment flag read by the adapter at runtime to confirm native SwiftUI is active |

**Installation and running:**

- Install the simulator build: `eas build:run` or drag the `.app` into Expo Orbit
- iOS Simulator requires a macOS host to run interactively; EAS only produces the artifact
- Once installed on a Mac-hosted simulator, connect with `npx expo start --dev-client` for live JS refresh
- EAS cloud macOS workers compile the SwiftUI adapter regardless of the developer's local OS

### Android Compose Development Build

The Android Compose adapter uses a standard Android development build profile. Enabling Gradle
cache significantly speeds up repeated EAS cloud builds when native dependencies are stable.

```json
{
  "build": {
    "android-compose-dev": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "image": "latest"
      },
      "channel": "development",
      "env": {
        "EAS_GRADLE_CACHE": "1"
      }
    }
  }
}
```

Key points for this profile:

| Aspect | Detail |
|---|---|
| `android.buildType: "apk"` | Produces a debug APK (no Play Store signing needed) |
| `developmentClient: true` | Includes `expo-dev-client` for live refresh via `npx expo start` |
| `EAS_GRADLE_CACHE: "1"` | Enables Gradle build cache on EAS cloud workers |
| `distribution: "internal"` | Internal distribution; no Play Store listing required |
| `image: "latest"` | Uses the latest EAS Android build image |

**Prerequisites:** `npx expo install @expo/ui` must be completed before the first build.

**Installation and running:**

- Download the APK from the EAS dashboard or via `eas build:run`
- Install on Android Emulator or physical device
- Connect to `npx expo start --dev-client` for live JS refresh and hot reload

### Development Build Requirements

Before triggering any EAS development build with `@expo/ui`, the following must be in place:

| # | Requirement | Command / Action |
|---|---|---|
| 1 | `@expo/ui` installed | `npx expo install @expo/ui` |
| 2 | `expo-dev-client` installed | `npx expo install expo-dev-client` |
| 3 | `eas.json` with a development build profile | Create or update `eas.json` with at least one dev profile |
| 4 | iOS: Apple Developer account configured for EAS | Register device UDID, configure provisioning in EAS dashboard |
| 5 | Android: no special account for debug APK builds | Debug APK builds do not require Play Store credentials |
| 6 | Both: `eas build` can be triggered from any OS | EAS cloud workers handle platform-specific compilation |

### Verifying Gradle Cache

When `EAS_GRADLE_CACHE=1` is set in the Android build profile, EAS caches Gradle task outputs
between builds. Verification steps:

| Build | What to look for in EAS logs |
|---|---|
| First build with cache enabled | No `FROM CACHE` markers — the cache is being populated. All tasks run normally. |
| Subsequent builds, same inputs | Most Gradle tasks show `FROM CACHE` in the "Run Gradle" step. The build log output for cached tasks includes the `FROM-CACHE` tag. |
| Inputs changed (dependency version, Gradle config) | Tasks with changed inputs show normal execution. Unchanged tasks still show `FROM CACHE`. |

If tasks show `UP-TO-DATE` instead of `FROM CACHE`, the Gradle cache key changed, meaning build
inputs differ from the previous run (different dependency versions, modified Gradle files,
or a different EAS build image).

Example log excerpt for a cached task:

```text
> Task :expo-modules-core:compileReleaseKotlin FROM-CACHE
```

> **Note:** Gradle configuration cache (`EAS_GRADLE_CONFIGURATION_CACHE=1`) is separate from the
> task output cache and may require additional EAS build environment support. Verify against the
> current Expo changelog before enabling.
