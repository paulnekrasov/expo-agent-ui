# Android Testing

Load this file when designing, adding, reviewing, or fixing Android tests.

## Test Selection Matrix

| Subject | Default | Add when |
|---|---|---|
| Pure business logic | JVM unit tests | Always for non-trivial rules. |
| ViewModel state | JVM `runTest` with injected dispatchers | Loading, error, cancellation, and event paths. |
| Flow behavior | Turbine or project helper | Ordering, replay, cancellation, and backpressure matter. |
| Room DAO/migrations | Instrumented or Robolectric where supported | Schema migration or SQLite behavior is part of the contract. |
| WorkManager | WorkManager test APIs/instrumented tests | Constraints, retries, or background scheduling matter. |
| Compose UI | Compose UI test APIs | Semantics, user interaction, navigation, forms. |
| Screenshots | Paparazzi or Roborazzi | Visual regressions, design systems, theme variants. |
| Performance | Macrobenchmark and baseline profile generation | Startup, scrolling, animations, release gates. |

## ViewModel and Coroutine Tests

- Inject dispatchers; never test against real `Dispatchers.IO`.
- Use `runTest`, `StandardTestDispatcher`, and virtual time.
- Assert final states and intermediate emissions when order matters.
- Test cancellation and failure paths, not just success.

```kotlin
@Test
fun loadFailureShowsError() = runTest {
    val dispatcher = StandardTestDispatcher(testScheduler)
    val viewModel = ProductsViewModel(
        repository = failingRepository,
        dispatcher = dispatcher,
    )

    viewModel.load()
    advanceUntilIdle()

    assertThat(viewModel.uiState.value).isEqualTo(ProductsState.Error("Network"))
}
```

## Compose UI Tests

- Prefer semantic matchers over coordinates.
- Add stable test tags only where semantics cannot identify the node.
- Test disabled/loading/error states and accessibility text.
- For navigation, use a test nav controller or app-level test harness.
- Avoid screenshot-only coverage for behavior.

```kotlin
composeTestRule
    .onNodeWithText("Retry")
    .assertIsDisplayed()
    .performClick()
```

## Screenshot Testing

- Paparazzi is fast for static layout rendering through LayoutLib.
- Roborazzi is useful when Robolectric interaction, animation, or broader Android
  behavior is needed.
- Cover light/dark, font scale, compact/expanded width, locale direction, and
  loading/error/data variants.
- Keep screenshot tests deterministic: fixed clocks, fonts, images, and network
  inputs.

## Instrumented Tests

Use instrumented/device tests when the platform is the subject:

- Permissions and system intents.
- IME, insets, edge-to-edge, predictive back.
- Real Room/SQLite, WorkManager, notifications.
- CameraX, Media3, Credential Manager, Health Connect.
- End-to-end release-critical flows.

## Performance Tests

- Macrobenchmark startup and critical scroll/transition paths.
- Generate and verify baseline profiles for startup and hot flows.
- Run release or profileable builds, not debug-only builds.
- Tie budgets to the skill's performance budget unless the app has stricter
  product SLOs.

## Release Test Gate

Before broad rollout:

- JVM tests pass for domain, ViewModels, and mappers.
- Migration tests pass for every Room schema bump.
- Compose UI/integration tests cover critical flows.
- Screenshot diffs are reviewed for intended visual changes.
- Macrobenchmarks and Play vitals show no regression in startup, jank, ANR, or
  crash-free metrics.
