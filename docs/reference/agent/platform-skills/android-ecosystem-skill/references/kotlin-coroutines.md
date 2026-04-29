# Kotlin Coroutines and Flow on Android

Load this file when working with async work, lifecycle collection, Flow,
repositories, ViewModels, `callbackFlow`, WorkManager handoff, or coroutine
tests.

## Scope Rules

| Lifetime | Scope |
|---|---|
| Screen/ViewModel work | `viewModelScope` |
| Activity/Fragment UI collection | `lifecycleScope` + `repeatOnLifecycle` |
| Compose UI collection | `collectAsStateWithLifecycle()` |
| App-wide work | Inject an application `CoroutineScope` with explicit ownership |
| Guaranteed deferrable work | WorkManager, not an arbitrary coroutine |

Do not use `GlobalScope`. If work must outlive a screen, model the lifetime
explicitly with an injected scope or WorkManager.

## Dispatcher Discipline

- Repository and data APIs must be main-safe: callers can invoke them from
  `Dispatchers.Main` without blocking UI.
- Inject dispatchers for testability. A constructor default is acceptable:

```kotlin
class UserRepository(
    private val api: UserApi,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun loadUser(id: UserId): User =
        withContext(ioDispatcher) { api.fetchUser(id) }
}
```

- Use `flowOn(ioDispatcher)` for upstream Flow work, but keep ownership clear;
  do not bury thread shifts where callers cannot reason about them.
- Never run disk, network, large JSON parsing, image decoding, or cryptographic
  work on the main thread.

## Flow Type Selection

| Need | Use | Notes |
|---|---|---|
| Current observable state | `StateFlow` | Has a current value; ideal for `UiState`. |
| Broadcast events | `SharedFlow` | Configure replay/buffer deliberately. |
| Single consumer pipeline | `Channel` | Use sparingly; document delivery semantics. |
| Database observation | Room DAO returning `Flow<T>` | Keep UI reactive to local changes. |
| Callback API bridge | `callbackFlow` | Close resources in `awaitClose`. |

Prefer durable UI state over transient events when a message, dialog, or
navigation outcome must survive configuration changes.

## State Encapsulation

```kotlin
private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()
```

Do not expose `MutableStateFlow` or `MutableSharedFlow` outside the owner. All
mutations should flow through explicit functions or reducers.

## Lifecycle Collection

Fragment/View:

```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state -> render(state) }
    }
}
```

Compose:

```kotlin
@Composable
fun Screen(viewModel: ScreenViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScreenContent(state = state, onIntent = viewModel::onIntent)
}
```

## Cancellation and Errors

- Do not catch broad `Exception` without rethrowing `CancellationException`.
- Use `supervisorScope` only when child failure isolation is intentional.
- Prefer typed domain errors or `Result`-like wrappers at layer boundaries.
- For retrying sync, use WorkManager or a clearly owned retry policy; do not
  spin custom infinite retry loops in ViewModels.

## Callback Flow

```kotlin
fun locationUpdates(client: LocationClient): Flow<Location> = callbackFlow {
    val listener = LocationListener { location -> trySend(location) }
    client.addListener(listener)
    awaitClose { client.removeListener(listener) }
}
```

Always unregister callbacks in `awaitClose`. Use `trySend` and handle failure if
dropping values is not acceptable.

## Testing

- Use `runTest` and injected `TestDispatcher` values.
- Prefer `StandardTestDispatcher` for deterministic scheduling unless a project
  explicitly uses another dispatcher.
- Advance time with `advanceUntilIdle()` or virtual-time APIs.
- Assert Flow emissions with Turbine or a small project-local helper.
- Do not rely on real `Dispatchers.IO`, sleeps, or wall-clock timing in unit
  tests.

```kotlin
@Test
fun emitsLoadedState() = runTest {
    val dispatcher = StandardTestDispatcher(testScheduler)
    val viewModel = ProductViewModel(repo = fakeRepo, dispatcher = dispatcher)

    viewModel.load()
    advanceUntilIdle()

    assertThat(viewModel.uiState.value).isEqualTo(UiState.Loaded(products))
}
```
