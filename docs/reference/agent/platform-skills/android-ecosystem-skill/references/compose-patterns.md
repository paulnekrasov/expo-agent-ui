# Compose Patterns

Load this file when building, reviewing, migrating, or debugging Jetpack Compose
UI. Default to Compose-first UI with Material 3 unless the project is explicitly
in a legacy migration phase.

## Design Rules

- Keep Composables deterministic: inputs are immutable state, outputs are UI and
  event callbacks.
- Keep business logic out of Composable bodies. Use ViewModels, use cases, and
  repositories for data fetching, validation, and side effects.
- Hoist state until the owner has the right lifetime. Child Composables should be
  stateless whenever practical.
- Prefer small Composables that match product semantics, not generic wrappers
  that hide state, semantics, or layout behavior.
- Use previews for representative states, but do not treat previews as tests.

## State Selection

| Need | Use | Notes |
|---|---|---|
| Local ephemeral state | `remember { mutableStateOf(...) }` | Input focus, expansion, local animation toggles. |
| Local restored state | `rememberSaveable` | Small values that can serialize through Bundle. |
| Screen state | `ViewModel` + `StateFlow<UiState>` | Default for screen-level data and loading/error states. |
| Derived expensive state | `derivedStateOf` | Only when it reduces recomposition or expensive recalculation. |
| Compose state as Flow | `snapshotFlow` | Bridge to non-UI consumers or analytics-style observation. |
| External lifecycle Flow | `collectAsStateWithLifecycle()` | Default collection API in Compose UI. |

## State Hoisting Example

```kotlin
@Composable
fun Counter(value: Int, onChange: (Int) -> Unit) {
    Button(onClick = { onChange(value + 1) }) {
        Text("Count: $value")
    }
}

@Composable
fun CounterScreen() {
    var count by rememberSaveable { mutableIntStateOf(0) }
    Counter(value = count, onChange = { count = it })
}
```

Use ViewModel state when the value is loaded, saved, shared across UI regions, or
must survive process death beyond a small saveable value.

## Side Effects

| API | Use for | Avoid |
|---|---|---|
| `LaunchedEffect(key)` | Lifecycle-bound suspend work tied to composition. | Re-running because the key is unstable. |
| `DisposableEffect(key)` | Register/unregister listeners. | Work that does not need cleanup. |
| `rememberCoroutineScope()` | Launching from event handlers, such as clicks. | Automatic work on composition entry. |
| `SideEffect` | Publishing committed Compose state to non-Compose objects. | Network, database, or expensive work. |
| `produceState` | Converting non-Compose async data into state. | Replacing ViewModel state for screen data. |

Never call `viewModel.load()`, `launch {}`, network APIs, or repository methods
directly from the top level of a Composable body.

## Stability and Recomposition

- Prefer immutable data classes with `val` properties for UI models.
- Use `@Immutable` for stable value models and `@Stable` only when mutable
  behavior follows Compose stability contracts.
- Do not pass large mutable collections directly. Prefer immutable snapshots or
  stable state holders.
- Avoid allocating new lambdas or objects in hot list item paths when it causes
  measurable recomposition churn.
- Use Layout Inspector recomposition counters and Compose compiler reports before
  optimizing by intuition.
- Treat `var` constructor properties in UI models as a red flag.

## Lists and Grids

- Use `LazyColumn`, `LazyRow`, `LazyVerticalGrid`, or paging integrations for
  dynamic lists; do not re-create RecyclerView adapter patterns in Compose.
- Provide stable `key` values when items can move, insert, or delete.
- Provide `contentType` for heterogeneous lists to improve item reuse.
- Keep item Composables small and stable; pass IDs/events, not entire mutable
  graph objects.
- Test scroll performance with representative data, images, and device classes.

## Navigation

- Prefer typed Navigation Compose routes for new Compose-first screens.
- Pass IDs or compact arguments through navigation; load full objects in the
  destination ViewModel through repositories.
- Keep `NavHost` setup close to the app shell, but extract feature graph builders
  when graphs grow.
- Use `SavedStateHandle.toRoute()` or the project equivalent for typed route
  retrieval in ViewModels.
- Use `TestNavHostController` or equivalent for navigation tests.

## XML and View Interop

- Use Compose islands to migrate safely: a legacy Activity/Fragment hosts
  `ComposeView`, while new screen UI moves to Compose.
- Use `AndroidView` only for missing platform views, complex legacy widgets, or
  SDK components without Compose equivalents.
- Keep interop boundaries narrow and lifecycle-aware. Do not mix mutable View
  state with Compose state without a single source of truth.

## Debug Checklist

- Are repeated effects caused by unstable keys?
- Is recomposition driven by mutable models, fresh lambdas, or state at the wrong
  owner?
- Are lists missing stable keys or content types?
- Is UI collecting Flow without lifecycle awareness?
- Are accessibility semantics, pane titles, live regions, and touch target sizes
  still correct after refactor?
