# Architecture Patterns

Load this file when deciding screen architecture, state ownership, domain/data
boundaries, Hilt scopes, navigation boundaries, modularization, or offline-first
behavior.

## Layer Contract

| Layer | Owns | Must not own |
|---|---|---|
| UI | Compose/View rendering, event emission, accessibility, navigation host glue. | Business rules, persistence details, direct networking. |
| ViewModel | Screen state, intent handling, use-case orchestration, restoration IDs. | Activity/Fragment/View references, long-lived Context, direct heavy IO. |
| Domain | Business rules, use cases, domain models, repository interfaces when needed. | Android framework APIs unless wrapped. |
| Data | Repository implementations, DAOs, network clients, sync, mappers, cache policy. | UI state formatting or navigation decisions. |
| Infrastructure | DI, Gradle modules, app startup, logging, release config. | Feature-specific business logic. |

## MVVM Default

Use MVVM when most screens fit this loop:

1. UI sends event.
2. ViewModel calls use case/repository.
3. Data/domain emits results.
4. ViewModel updates immutable `UiState`.
5. UI renders state.

```kotlin
@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val repository: ProductRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow<ProductListState>(ProductListState.Loading)
    val uiState: StateFlow<ProductListState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = repository.products()
                .fold(
                    onSuccess = { ProductListState.Loaded(it) },
                    onFailure = { ProductListState.Error(it.message ?: "Unknown error") },
                )
        }
    }
}
```

## MVI Selection

Use MVI, reducer-style state, or MVVM plus explicit intents when:

- State transitions are numerous and bugs come from unclear event ordering.
- A feature benefits from event logs, time-travel debugging, or deterministic
  reducers.
- Multiple UI events can race and must resolve through one state machine.

Do not introduce MVI just for naming consistency. If a simple ViewModel function
is clearer, use it.

## Domain Layer Rule

Introduce a domain layer when at least one is true:

- The same business rule is used by multiple screens or apps.
- Data-source details leak into UI or ViewModel logic.
- Tests need to validate rules without Android, database, or network.
- Product rules are complex enough to deserve names and independent evolution.

Keep UI-to-data direct for prototypes only when the cost of domain abstraction is
greater than the current complexity.

## Hilt Boundary Rules

- `@Singleton`: API clients, databases, repositories, app-wide services.
- `@ActivityRetainedScoped`: activity-retained coordinators that survive
  rotation but should not live for the whole process.
- `@ViewModelScoped`: dependencies specific to one ViewModel.
- Avoid injecting Activity Context into long-lived objects. Use
  `@ApplicationContext` only when the app context is truly appropriate.

## Navigation Boundaries

- New Compose apps use Navigation Compose and typed route classes.
- Feature modules expose graph registration functions or typed destinations, not
  random route strings.
- Pass IDs, filters, and small primitives. Rehydrate large objects from
  repositories in the destination ViewModel.
- Deep links and pending intents must be tested because they enter the graph
  without normal in-app setup.

## Multi-Module Criteria

Adopt feature modules when:

- More than one team edits features concurrently.
- Build time or invalidation is a real problem.
- Features need clear public APIs or dynamic delivery.
- Shared code has stable ownership and dependency direction.

Start with `:app`, `:core:*`, and `:feature:*` only when boundaries are known.
Avoid speculative modules that create dependency gymnastics without faster builds
or clearer ownership.

## Offline-First Pattern

1. UI observes local source of truth, usually Room Flow.
2. Repository coordinates local data plus network sync.
3. Writes are persisted locally first when product permits.
4. WorkManager handles retryable background sync with constraints.
5. Conflicts and rollback are explicit product states, not hidden exceptions.

Use this pattern for feeds, forms, shopping, messaging, field work, and other
flows where poor connectivity is normal.

## Migration Rule

For XML/Fragment-heavy apps, migrate by stable islands:

- Keep existing navigation stable first.
- Move leaf screens or components into Compose through `ComposeView`.
- Hoist state to ViewModels before moving rendering.
- Replace string routes, manual bundles, and duplicated state gradually.
- Verify accessibility and edge-to-edge behavior on every migrated screen.
