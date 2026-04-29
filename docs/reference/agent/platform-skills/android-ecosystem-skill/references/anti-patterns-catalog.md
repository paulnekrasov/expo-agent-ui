# Anti-Patterns Catalogue

Load this file when debugging symptoms, reviewing Android code, or checking a
claim that a change is production-ready. Each entry is symptom -> root cause ->
corrected implementation.

## Plaintext Tokens in SharedPreferences

Symptom: session theft risk on compromised devices or through backups.

Root cause: copying web local-storage patterns into Android and storing long-lived
tokens in normal `SharedPreferences`.

Corrected implementation:

```kotlin
// Anti-pattern
val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
prefs.edit().putString("SESSION_TOKEN", token).apply()

// Corrected
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
)
encryptedPrefs.edit().putString("SESSION_TOKEN", token).apply()
```

Prefer short-lived tokens, refresh rotation, server-side revocation, and platform
Credential Manager where applicable.

## Imperative Work in Composable Body

Symptom: repeated network/search calls, recomposition storms, dropped frames.

Root cause: mutating state and launching heavy work directly from UI callbacks or
the top level of a Composable.

```kotlin
// Anti-pattern
@Composable
fun SearchScreen() {
    var query by remember { mutableStateOf("") }
    TextField(
        value = query,
        onValueChange = {
            query = it
            performHeavySearch(it)
        },
    )
}

// Corrected
@Composable
fun SearchScreen(viewModel: SearchViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    TextField(
        value = state.query,
        onValueChange = { viewModel.onIntent(SearchIntent.UpdateQuery(it)) },
    )
}
```

## GlobalScope

Symptom: work continues after logout/screen close; leaks; unpredictable app exit.

Root cause: launching unowned work.

```kotlin
// Anti-pattern
GlobalScope.launch { repo.sync() }

// Corrected
@HiltViewModel
class SyncViewModel @Inject constructor(
    private val repo: Repo,
) : ViewModel() {
    fun sync() = viewModelScope.launch { repo.sync() }
}
```

For app-wide work, inject an application scope or use WorkManager.

## Hardcoded Dispatchers

Symptom: flaky tests, hidden main-thread blocking, hard-to-control scheduling.

Root cause: `Dispatchers.IO` scattered through methods instead of injected.

```kotlin
// Anti-pattern
class UserRepository {
    suspend fun load() = withContext(Dispatchers.IO) { loadFromDisk() }
}

// Corrected
class UserRepository(
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun load() = withContext(ioDispatcher) { loadFromDisk() }
}
```

## Non-Lifecycle Flow Collection

Symptom: duplicate collectors after rotation, wasted CPU, memory leaks.

Root cause: collecting Flow from UI without `repeatOnLifecycle` or
`collectAsStateWithLifecycle`.

```kotlin
// Anti-pattern
lifecycleScope.launch {
    viewModel.uiState.collect { render(it) }
}

// Corrected
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { render(it) }
    }
}
```

## Public Mutable State

Symptom: any layer can mutate UI state; invariants break under race conditions.

Root cause: exposing `MutableStateFlow` directly.

```kotlin
// Anti-pattern
val uiState = MutableStateFlow(UiState())

// Corrected
private val _uiState = MutableStateFlow(UiState())
val uiState: StateFlow<UiState> = _uiState.asStateFlow()
```

## Mutable UI Models

Symptom: excessive recomposition because Compose cannot infer stability.

Root cause: `var` properties or mutable collections in models passed through UI.

```kotlin
// Anti-pattern
data class UserUiModel(var name: String, var email: String)

// Corrected
@Immutable
data class UserUiModel(val name: String, val email: String)
```

## Coroutine Launched from Composition

Symptom: work restarts on recomposition.

Root cause: invoking work from the Composable body.

```kotlin
// Anti-pattern
@Composable
fun Screen(viewModel: VM) {
    viewModel.load()
}

// Corrected
@Composable
fun Screen(viewModel: VM) {
    LaunchedEffect(Unit) {
        viewModel.load()
    }
}
```

Prefer starting data loading in ViewModel `init` when it is truly screen-start
work.

## String Routes and Complex Navigation Arguments

Symptom: runtime crashes, brittle deep links, oversized bundles, broken restore.

Root cause: manual string concatenation and passing full objects.

```kotlin
// Anti-pattern
navController.navigate("profile/${user.id}/${user.name}")

// Corrected
@Serializable
data class ProfileRoute(val userId: String)

navController.navigate(ProfileRoute(userId = user.id))
```

Load full objects in the destination ViewModel by ID.

## Activity Context Leak

Symptom: memory leak after rotation or navigation.

Root cause: storing Activity, Fragment, View, or Activity Context in singletons,
repositories, or ViewModels.

Corrected implementation:

- Use `@ApplicationContext` only when app context is correct.
- Keep UI references inside UI layer lifetimes.
- Pass callbacks/events instead of storing Views.
- Use LeakCanary or profiler to confirm leak fixes.

## Main-Thread Blocking

Symptom: jank, ANR, slow input, Play vitals regression.

Root cause: disk, database, network, JSON parsing, crypto, image work, or
expensive mapping on main thread.

Corrected implementation:

- Make repositories main-safe with injected dispatchers.
- Use Room suspend/Flow APIs correctly.
- Move heavy startup work behind App Startup, lazy init, or background loading.
- Add macrobenchmark or profiler evidence for critical flows.

## Wrong Hilt Scope

Symptom: stale state, leaked Context, duplicate expensive objects, or shared state
across users/screens.

Root cause: using `@Singleton` for screen-owned dependencies or injecting
short-lived Context into long-lived objects.

Corrected implementation:

- Scope dependencies to the smallest correct lifetime.
- Use `@ViewModelScoped` for ViewModel-owned collaborators.
- Use `@ActivityRetainedScoped` only for activity-retained needs.
- Use `@Singleton` for stateless/global infrastructure.

## XML or Material 2 Presented as Modern Default

Symptom: new code accumulates legacy UI debt.

Root cause: treating XML-first, Fragment-heavy, or Material 2 examples as the
modern default without Compose/M3 context.

Corrected implementation:

- New UI uses Compose and Material 3.
- Legacy UI migration uses Compose islands and thin host components.
- Material 2 components are labeled legacy and migrated deliberately.
