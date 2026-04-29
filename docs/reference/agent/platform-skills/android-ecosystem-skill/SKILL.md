---
name: android-ecosystem-skill
description: >
  Use when Codex is designing, implementing, reviewing, debugging, or modernizing
  native Android apps and libraries with Kotlin 2.x, Jetpack Compose, Material
  Design 3, Android architecture, coroutines and Flow, Hilt, Room, DataStore,
  WorkManager, Gradle, AGP, R8, testing, performance, platform APIs, Google Play
  release, or Android agent skills. Triggers include Android app, Jetpack
  Compose, Material 3, Kotlin coroutines, Navigation Compose, Hilt, Room,
  DataStore, AGP, R8, baseline profiles, Play Console, Android 15/16,
  edge-to-edge, Credential Manager, and Android code review.
---

# Android Ecosystem Skill

Production-grade Android engineering reference synthesized from the supplied
Android senior-engineer PDFs. Use it as the architectural umbrella; load the
reference files only when their topic is directly relevant.

## Operating Mode

1. Identify the codebase shape before editing: Compose vs XML, single-activity
   vs Fragment-heavy, target SDK, min SDK, Kotlin/AGP versions, DI, test stack,
   persistence layer, and release path.
2. Default to modern native Android: Kotlin 2.x, Jetpack Compose with Material
   Design 3, AndroidX lifecycle APIs, Hilt, Room with KSP, DataStore, WorkManager,
   Navigation Compose, R8, baseline profiles, and Google Play AAB delivery.
3. Keep host components thin. Activities and Fragments host UI and navigation;
   business logic belongs in ViewModels, domain use cases, repositories, or
   platform-specific services.
4. Require lifecycle-aware work. UI collection uses `collectAsStateWithLifecycle`
   in Compose or `repeatOnLifecycle` in Views; coroutines use scoped lifetimes
   and injected dispatchers.
5. Treat exact version and policy claims as volatile. Known baseline at creation:
   Compose April 2026 stable release with BOM `2026.04.01`, Compose core 1.11,
   and Android 16/API 36 behavior changes. Re-check live official docs before
   changing BOM, AGP, target SDK, Play policy, or platform API behavior.

## Quick Triage

| Task | First move | Load |
|---|---|---|
| Build or review Compose UI | Check state ownership, side effects, stability, semantics, list keys, and M3 theme use. | `references/compose-patterns.md`, `references/material3-theming.md` |
| Fix coroutine or Flow behavior | Verify scope, cancellation, dispatcher injection, Flow collection, and tests. | `references/kotlin-coroutines.md` |
| Decide architecture | Choose MVVM/MVI/domain/multi-module by criteria, not preference. | `references/architecture-patterns.md` |
| Add persistence or sync | Pick Room/DataStore/secure storage/cache/WorkManager by data shape and lifecycle. | `references/architecture-patterns.md`, `references/platform-apis.md` |
| Improve tests | Map tests to layer: JVM unit, Robolectric, instrumented, screenshot, macrobenchmark. | `references/android-testing.md` |
| Change build/release infrastructure | Verify Gradle/AGP/Kotlin compatibility, KSP, R8, baseline profiles, signing, AAB. | `references/gradle-build-engineering.md`, `references/observability-devops.md` |
| Diagnose production risk | Search anti-pattern symptoms before guessing. | `references/anti-patterns-catalog.md` |
| Need provenance | Check which PDF/source finding introduced a rule. | `references/source-index.md` |

## Core Defaults

- **Language:** Prefer non-null models, `val`, sealed interfaces for state and
  results, immutable UI models, explicit error types, and KSP over KAPT.
- **UI:** Compose and Material 3 are the default for new screens. XML Views,
  Fragments-as-UI, and Material 2 are legacy or migration constraints.
- **State:** ViewModels expose read-only `StateFlow<UiState>`. Composables read
  state and emit events; they do not own business logic or perform data fetches
  from the body.
- **Architecture:** Use UI, Domain, and Data layers when business rules are
  reusable, cross-feature, or test-sensitive. Keep prototypes simpler only with a
  clear migration path.
- **Concurrency:** Repositories are main-safe. Inject dispatchers; do not use
  `GlobalScope`; do not swallow `CancellationException`.
- **Data:** Use Room with Flow-returning DAOs for relational data, DataStore for
  preferences or typed settings, secure storage for secrets, WorkManager for
  guaranteed background work, and offline-first reads for resilient UX.
- **Build:** Keep Gradle deterministic with version catalogs, dependency locking,
  configuration cache where compatible, R8 validation, and baseline profiles for
  startup and hot paths.
- **Release:** Ship AABs through Play tracks with signing, Data safety, privacy
  policy, target SDK, performance vitals, crash-free, and ANR gates verified.

## Architecture Decision Rules

| Decision | Use when | Avoid when |
|---|---|---|
| MVVM with `ViewModel` + `UiState` | Default for most Compose screens with loading, data, error, and events. | The screen is a trivial stateless component. |
| MVI or MVVM plus intents | State transitions are complex, auditability matters, or reducers improve predictability. | It only adds ceremony without reducing state bugs. |
| Local state hoisting | State is ephemeral and belongs to a small UI subtree. | State must survive process death or coordinate with data/domain layers. |
| Dedicated Domain layer | Business rules are reused, test-sensitive, cross-feature, or must hide data-source details. | A small prototype only passes data through. |
| Multi-module architecture | Multiple teams, painful build times, dynamic feature delivery, or strict feature boundaries justify it. | Module boundaries are speculative and slow development. |
| Fragment interop | Migrating a large legacy app or embedding Compose islands safely. | Building new Compose-first screens. |

## Performance Budget

Treat performance as a product requirement. If a project has stricter budgets,
use those; otherwise start here and measure on representative mid-range devices.

| Budget | Target |
|---|---|
| Cold start | `<= 2s` from launcher tap to first usable frame. |
| 60 fps frame budget | `<= 16ms` per frame across UI and render work. |
| 90/120 fps frame budget | Aim for `<= 11ms`; avoid high-refresh UI unless measured. |
| Jank | Keep janky frames below `1%` on critical scroll and transition flows. |
| Main thread | No disk, network, heavy JSON, image decoding, or long CPU work; anything near `100ms` is a release blocker. |
| Memory | Keep sustained typical usage below `300-400MB` unless product requirements justify more and leak monitoring is clean. |
| ANR | Zero known ANRs in core flows; investigate Play Console vitals before broad rollout. |

## Decision Matrices

### State

| Need | Primitive | Rule |
|---|---|---|
| Screen UI state from data/domain | `StateFlow<UiState>` in ViewModel + `collectAsStateWithLifecycle()` | Default for Compose screens. |
| One-time UI events | Prefer modeling as state; otherwise `SharedFlow` or channel with explicit consumption. | Avoid LiveData event wrappers. |
| Ephemeral component state | `remember { mutableStateOf(...) }` | Resets when leaving composition. |
| Small restored local state | `rememberSaveable` | Use only for small serializable values. |
| Process-death or nav args | `SavedStateHandle` + typed route IDs | Rebuild objects from repositories. |
| Compose state to Flow | `snapshotFlow` | Use for non-UI consumers or analytics-style streams. |

### Navigation

| Scenario | Stack | Rule |
|---|---|---|
| New Compose-first app | Navigation Compose with typed routes | Use Kotlin serialization route types and pass IDs, not objects. |
| Existing Fragment app | Navigation Component plus incremental Compose destinations | Keep back stack semantics stable during migration. |
| Highly custom stack | Explicit custom state machine | Justify with requirements Navigation Compose cannot model. |
| Large screens | Adaptive navigation surfaces | Use NavigationBar, NavigationRail, or NavigationSuiteScaffold by window class. |

### Persistence

| Data | Choice | Rule |
|---|---|---|
| Relational/queryable data | Room with KSP and Flow DAOs | KAPT is legacy unless migration blocks KSP. |
| Preferences/settings | DataStore Preferences | Replaces plain SharedPreferences for normal settings. |
| Typed settings | Proto DataStore | Use when schema and type safety matter. |
| Secrets/tokens | Keystore-backed storage or EncryptedSharedPreferences | Never store secrets in plaintext. |
| Guaranteed background sync | WorkManager | Use for deferrable work with retries and constraints. |
| UI-only cache | In-memory cache in ViewModel/repository | Do not persist unless product needs it. |

### Hilt Scope

| Lifetime | Scope | Use |
|---|---|---|
| Process/app | `@Singleton` | Databases, API clients, global repositories. |
| Across configuration changes | `@ActivityRetainedScoped` | Activity-retained coordinators or use cases. |
| ViewModel | `@ViewModelScoped` | Dependencies owned by a single ViewModel graph. |
| Activity | `@ActivityScoped` | Activity-only adapters; avoid long-lived Context references. |

### Testing

| Layer | Primary test | Instrument when |
|---|---|---|
| Domain/use cases | JVM unit tests | Almost never. |
| ViewModel | `runTest` with injected dispatchers | Almost never. |
| Data | JVM tests with fakes plus Room migration tests | Room, WorkManager, or platform behavior is part of the contract. |
| Compose UI | Compose UI tests and screenshots | Real device behavior, IME, permissions, navigation, or accessibility matters. |
| Performance | Macrobenchmark, baseline profile generation, profiler traces | Startup, scrolling, and critical flows must be release-gated. |

## Senior Android Review Checklist

- [ ] Composables are stateless where possible; state is hoisted and events are lambdas.
- [ ] No business logic, network calls, or coroutine launches from Composable bodies.
- [ ] Side effects use `LaunchedEffect`, `DisposableEffect`, ViewModel work, or lifecycle APIs with stable keys.
- [ ] UI models passed to Compose are immutable and stable; no `var` constructor properties.
- [ ] Lazy lists use stable keys and content types for mixed or large lists.
- [ ] Material 3 theme, dark mode, dynamic color fallback, typography, shape, insets, and semantics are intentional.
- [ ] Accessibility uses semantic labels, roles, pane titles/live regions where needed, and 48dp touch targets.
- [ ] Repositories are main-safe and inject dispatchers.
- [ ] No `GlobalScope`; no public `MutableStateFlow`; no swallowed `CancellationException`.
- [ ] UI Flow collection is lifecycle-aware.
- [ ] ViewModels do not hold Activity/Fragment/View references.
- [ ] Navigation uses typed routes or official Navigation APIs; no complex objects in arguments.
- [ ] Room migrations, WorkManager constraints, and offline-first conflict paths are tested.
- [ ] New business logic and ViewModels have JVM tests with deterministic dispatchers.
- [ ] Critical UI, navigation, permissions, and release flows have UI/integration coverage.
- [ ] R8 rules, serialization/reflection paths, baseline profiles, and release variants are validated.
- [ ] Play policy, target SDK, Data safety, signing, crash-free, ANR, and staged rollout gates are current.

## Anti-Pattern Gate

Before claiming a bug is fixed or an architecture is production-ready, check
`references/anti-patterns-catalog.md` for matching symptoms. Prioritize these
classes: plaintext secrets, recomposition storms, coroutine lifetime leaks,
non-lifecycle Flow collection, public mutable state, string routes, main-thread
blocking, Context leaks, wrong Hilt scopes, and release-only R8 failures.

## Reference Files

| File | Load when |
|---|---|
| `references/compose-patterns.md` | Working on Compose state, side effects, stability, navigation, list performance, or XML interop. |
| `references/kotlin-coroutines.md` | Working on coroutine scopes, dispatchers, Flow, cancellation, `callbackFlow`, or tests. |
| `references/architecture-patterns.md` | Choosing MVVM/MVI/domain/multi-module, ViewModel boundaries, Hilt scope, or offline-first structure. |
| `references/material3-theming.md` | Implementing Material 3 themes, dynamic color, adaptive layouts, edge-to-edge, or accessibility. |
| `references/android-testing.md` | Designing or fixing Android, Compose, coroutine, screenshot, integration, or performance tests. |
| `references/gradle-build-engineering.md` | Updating Kotlin, Compose compiler, AGP, Gradle, KSP, R8, dependency locking, or baseline profiles. |
| `references/platform-apis.md` | Using WorkManager, Credential Manager, Play Integrity, notifications, CameraX, Media3, Health Connect, insets, large screens, or Android 15/16 behavior. |
| `references/observability-devops.md` | Preparing CI/CD, signing, Play release, Crashlytics, performance monitoring, staged rollout, or incident response. |
| `references/anti-patterns-catalog.md` | Debugging symptoms or reviewing code for known Android failure modes. |
| `references/source-index.md` | Checking which supplied PDF/source finding motivated the skill guidance. |

## Escalation Rules

Use live official documentation before applying exact values or API migration
steps when any of these are true:

1. The Compose BOM, Compose compiler, Kotlin, AGP, Gradle, AndroidX, or Hilt
   version changes.
2. The project changes `compileSdk`, `targetSdk`, Android platform version, or
   Play Console target API requirement.
3. Android 15/16+ behavior changes are relevant, especially edge-to-edge,
   predictive back, intent handling, accessibility, background work quotas,
   permissions, or large-screen rules.
4. Google Play policy, billing, Data safety, signing, developer verification, or
   rollout requirements affect the release.
5. Official Android Skills or Android CLI guidance covers the exact task; use the
   task-specific official skill as the lower-level implementation guide and this
   skill as the architecture/review frame.
