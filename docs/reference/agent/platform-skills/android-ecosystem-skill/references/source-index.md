# Source Index and Synthesis Notes

Load this file when provenance matters: why a rule exists, which supplied PDF
introduced it, or which external source class should be checked before updating
the skill.

## Supplied PDFs

- `C:\Users\Asus\Downloads\Android Senior Engineer Skill Synthesis.pdf`
- `C:\Users\Asus\Downloads\[ROLE]_You are a Principal Android Engineer and Go.pdf`

Both PDFs converged on a unified Android senior-engineer skill covering Kotlin,
Jetpack Compose, Material 3, Android architecture, coroutines, data, testing,
build/performance, platform APIs, release readiness, anti-patterns, reference
files, and escalation rules.

## Highest-Value Skill Inputs Identified in the PDFs

| Source skill or repo | Main contribution |
|---|---|
| `software-mobile` | Cross-platform mobile architecture, offline-first, persistence, networking, performance, release checklist. |
| `kotlin-android` | Kotlin Android MVVM, Hilt ViewModel, StateFlow UiState, Compose collection, typed navigation. |
| `android-coroutines` | Dispatcher injection, main-safety, lifecycle Flow collection, `GlobalScope` ban, cancellation, tests. |
| `compose-navigation` | Typed Navigation Compose routes, nested graphs, deep links, `SavedStateHandle`, tests. |
| `mobile-android-design` | Material 3, Compose layout, dynamic color, typography, adaptive layouts, accessibility. |
| `senior-mobile` | Senior mobile patterns with Android examples, performance, and architecture framing. |
| Official `android/skills` | AGP upgrades, XML-to-Compose migration, Navigation 3, R8 analyzer, Play Billing, edge-to-edge. |
| `android-native-dev` | General native Android, Material 3, accessibility, configuration, build troubleshooting. |

The PDFs noted that `albermonte/android-skills` could not be fully retrieved in
their source run. This skill therefore treats it as a referenced but not
individually indexed source and does not invent file-level claims from it.

## Direct Guidance Synthesized

- Compose and Material 3 are defaults for new UI.
- Kotlin 2.x and KSP are preferred; KAPT is legacy unless required by a library.
- ViewModel + immutable `UiState` + read-only `StateFlow` is the default screen
  architecture.
- Lifecycle-aware Flow collection is mandatory.
- Typed Navigation Compose routes replace fragile string routes for new Compose
  navigation.
- Room, DataStore, WorkManager, Credential Manager, Play Integrity, and baseline
  profiles are core modern Android building blocks.
- Build and release work must account for AGP/Gradle compatibility, R8, signing,
  target SDK, Data safety, Play rollout, and performance vitals.

## Negative Findings Preserved

- Web-style plaintext local token storage becomes an Android security flaw when
  copied into `SharedPreferences`.
- UI logic embedded in Activities/Fragments or Composables creates lifecycle and
  recomposition bugs.
- Imperative work in Composable bodies causes repeated side effects.
- `GlobalScope`, hardcoded dispatchers, public mutable Flow, and non-lifecycle
  collection create leaks or flaky behavior.
- XML-first or Material 2 guidance must be labeled legacy in modern Android work.

See `anti-patterns-catalog.md` for corrected implementations.

## Official Sources to Prefer for Volatile Facts

Use official sources for current facts before changing code:

- Android Developers behavior changes for target/current Android versions.
- Jetpack Compose BOM mapping and release notes.
- Compose compiler and Kotlin 2 setup docs.
- AndroidX release notes for Navigation, Room, WorkManager, Lifecycle, Hilt.
- Android Gradle Plugin and Gradle compatibility documentation.
- Google Play Console policy and target API requirements.
- Official Android Skills repository for task-specific lower-level skills.

## Link Map

| Topic | URL |
|---|---|
| Official Android Skills repository | `https://github.com/android/skills` |
| Android Skills docs | `https://developer.android.com/tools/agents/android-skills` |
| Android 16 behavior changes for all apps | `https://developer.android.com/about/versions/16/behavior-changes-all` |
| Android 16 behavior changes for target 16/API 36 apps | `https://developer.android.com/about/versions/16/behavior-changes-16` |
| Compose BOM | `https://developer.android.com/jetpack/compose/bom` |
| Compose release notes | `https://developer.android.com/jetpack/androidx/releases/compose` |
| Compose setup and compiler | `https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler` |
| Compose side effects | `https://developer.android.com/develop/ui/compose/side-effects` |
| Compose performance | `https://developer.android.com/develop/ui/compose/performance` |
| Android architecture recommendations | `https://developer.android.com/topic/architecture/recommendations` |
| Lifecycle-aware coroutines | `https://developer.android.com/topic/libraries/architecture/coroutines` |
| DataStore | `https://developer.android.com/topic/libraries/architecture/datastore` |
| Room migrations | `https://developer.android.com/training/data-storage/room/migrating-db-versions` |
| Navigation type safety | `https://developer.android.com/guide/navigation/design/type-safety` |
| Baseline profiles | `https://developer.android.com/topic/performance/baselineprofiles/measure-baselineprofile` |
| Macrobenchmark | `https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview` |
| Google Play App Signing | `https://support.google.com/googleplay/android-developer/answer/9842756` |

## Version-Sensitive Updates Verified During Creation

On 2026-04-29, official Android sources indicated:

- Android 16/API 36 behavior-change docs are active and include all-app and
  target-36 behavior changes.
- Compose April 2026 stable release uses BOM `2026.04.01` and Compose core 1.11.
- The Compose Compiler Gradle Plugin is available from Kotlin 2.0+.

Do not rely on these as future-current values. They are included to explain the
skill's creation baseline.
