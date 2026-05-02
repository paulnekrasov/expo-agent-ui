# Native Architecture Patterns — iOS & Android

_Read-only reference · Distilled from `apple-ecosystem-app-building` and `android-ecosystem-skill`_

## When to Load

| Task | Load? |
|---|---|
| Writing Expo module native code (Swift/Kotlin) | **Yes** |
| Designing Stage 7 native adapter architecture | **Yes** |
| Reviewing native module PR for structure | **Yes** |
| Building React Native JS components | No |
| Writing MCP server logic | No |

---

## 1. iOS Architecture (SwiftUI / UIKit)

### Default: MVVM with @Observable

```swift
@MainActor
@Observable final class FeedViewModel {
    var posts: [Post] = []
    var isLoading = false

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        posts = (try? await postService.fetchLatest()) ?? posts
    }
}
```

**Rules**:
- `@Observable` replaces `ObservableObject` + `@Published` (iOS 17+).
- View models are `@MainActor` when they own UI state.
- Views bind directly to `@Observable` properties — no `@ObservedObject` wrapper needed.
- Inject dependencies via init parameters, not singletons.

### When to Use TCA (The Composable Architecture)
- Large teams needing enforced unidirectional data flow.
- Apps with complex side effects requiring deterministic testing.
- When you need time-travel debugging.
- **Not for** Expo modules or lightweight adapters — too much ceremony.

### Module Boundaries
- Feature modules as SPM packages with clear public API.
- Domain models shared via a `SharedModels` package.
- Network/persistence in dedicated service packages.
- One-way dependency flow: Feature → Domain → Core.

### Navigation
- `NavigationStack` with `navigationDestination(for:)` for type-safe routing.
- Avoid deep `NavigationLink` nesting — use coordinator pattern for complex flows.
- Sheets via `.sheet(item:)` with identifiable items.

---

## 2. Android Architecture (Jetpack Compose)

### Default: MVVM with ViewModel + StateFlow

```kotlin
class FeedViewModel @Inject constructor(
    private val postRepository: PostRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val posts = postRepository.fetchLatest()
            _uiState.update { it.copy(posts = posts, isLoading = false) }
        }
    }
}

data class FeedUiState(
    val posts: List<Post> = emptyList(),
    val isLoading: Boolean = false
)
```

**Rules**:
- `StateFlow` for UI state, not `LiveData` (Compose-first).
- `viewModelScope` for coroutines that survive configuration changes.
- UI state is a single immutable data class — avoids partial-state bugs.
- Never expose `MutableStateFlow` — expose `.asStateFlow()`.
- Private mutable, public read-only (`.update {}` pattern).

### Hilt Dependency Injection

```kotlin
@HiltViewModel
class FeedViewModel @Inject constructor(
    private val postRepository: PostRepository
) : ViewModel()
```

- `@HiltViewModel` + `@Inject constructor` for all ViewModels.
- `@Singleton` for app-wide singletons (database, HTTP client).
- `@ActivityScoped` / `@ViewModelScoped` for appropriate lifecycle.
- Avoid manual `object` singletons — use Hilt modules.

### Module Boundaries
- Gradle modules per feature: `:feature:feed`, `:feature:profile`.
- `:core:data`, `:core:network`, `:core:ui` for shared infrastructure.
- Use Gradle version catalogs (`libs.versions.toml`) for dependency alignment.
- Enable Gradle build cache with `org.gradle.caching=true`.

### Navigation
- Compose Navigation with type-safe routes (Kotlin Serialization).
- Single `NavHost` with `composable<Route>` destinations.
- Nested navigation graphs for feature-scoped flows.

---

## 3. Cross-Platform Comparison

| Concept | iOS (Swift) | Android (Kotlin) |
|---|---|---|
| Architecture | MVVM + @Observable | MVVM + ViewModel + StateFlow |
| DI | Init injection / Resolver | Hilt / @Inject |
| State container | @Observable class | data class + StateFlow |
| Scoping | @MainActor | viewModelScope |
| Module system | SPM packages | Gradle modules |
| Navigation | NavigationStack | Compose Navigation |
| Async | async/await + actors | Coroutines + Flow |

---

## 4. Expo Module Architecture Implications

When building Expo native modules for Stage 7 adapters:

1. **Keep modules thin** — Expo module definition ≠ ViewModel. Module = bridge layer.
2. **Inject platform dependencies** — Don't use singletons inside module code.
3. **Respect threading** — AsyncFunction runs on background by default (see `native-concurrency.md`).
4. **Separate view from logic** — ExpoView subclass for rendering, Module for functions/events.
5. **Platform parity** — If a function exists in Swift, implement the equivalent in Kotlin.

---

## Skill Sources

- `apple-ecosystem-app-building/references/architecture-patterns.md`
- `android-ecosystem-skill/references/architecture-patterns.md`
- `apple-ecosystem-app-building/references/swiftui-patterns.md`
