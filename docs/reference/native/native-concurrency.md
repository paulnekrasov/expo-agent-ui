# Native Concurrency Contracts — Swift & Kotlin

_Read-only reference · Distilled from `apple-ecosystem-app-building/swift-concurrency.md` and
`android-ecosystem-skill/kotlin-coroutines.md`_

## When to Load

| Task | Load? |
|---|---|
| Writing AsyncFunction in an Expo module | **Yes** |
| Debugging threading issues in native code | **Yes** |
| Reviewing native adapter for concurrency safety | **Yes** |
| Writing JS/TS-only components | No |
| Configuring MCP transport | No |

---

## 1. Swift Concurrency (iOS)

### Core Rules

1. **@MainActor for UI state** — Any class owning `@Observable` or `@Published` state must be `@MainActor`.
2. **Sendable everything** — Types crossing async boundaries must be `Sendable`. Pure value types get automatic conformance.
3. **Structured concurrency preferred** — Use `Task { }` and `TaskGroup` over unstructured `DispatchQueue`.
4. **Never resume a continuation twice** — Fatal error in `withCheckedContinuation`.

### Expo Module Patterns

```swift
// AsyncFunction runs on background thread by default
AsyncFunction("fetchData") { (url: URL) -> String in
    let data = try Data(contentsOf: url)
    return String(data: data, encoding: .utf8) ?? ""
}

// Force main queue for UI work
AsyncFunction("updateUI") { () -> Void in
    // UI mutations
}.runOnQueue(.main)
```

### Actor-Based Caching

```swift
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? { cache[url] }
    func store(_ image: UIImage, for url: URL) { cache[url] = image }
}
```

### Sendable Strategies

| Type | Strategy |
|---|---|
| Pure value type (struct with Sendable fields) | Automatic conformance |
| Class with lock protecting all mutable state | `@unchecked Sendable` + document the lock |
| Immutable class | `@unchecked Sendable` |
| Actor | Implicitly `Sendable` |

### Minimizing Actor Hops

```swift
// BAD: many hops
for item in items {
    await MainActor.run { self.process(item) }
}

// GOOD: batch then single hop
let processed = await processorActor.processAll(items)
await MainActor.run { self.results = processed }
```

### Migration Path

`minimal` → `targeted` → `complete` concurrency checking, one module at a time. Enable `StrictConcurrency` in Swift settings.

---

## 2. Kotlin Coroutines (Android)

### Core Rules

1. **viewModelScope for VM work** — Automatically cancelled when ViewModel is cleared.
2. **lifecycleScope for UI work** — Tied to Activity/Fragment lifecycle. Use `repeatOnLifecycle` for Flow collection.
3. **Never use GlobalScope** — Leaks coroutines. Use structured scope injection.
4. **Dispatchers discipline** — `Dispatchers.IO` for disk/network, `Dispatchers.Default` for CPU, `Dispatchers.Main` for UI.
5. **Inject dispatchers** — Don't hardcode. Accept `CoroutineDispatcher` in constructors.

### Expo Module Patterns

```kotlin
// Coroutine support in Expo Modules
AsyncFunction("fetchData") Coroutine { url: java.net.URL ->
    withContext(Dispatchers.IO) {
        url.readText()
    }
}
```

### Scope Rules

| Scope | Lifecycle | Use For |
|---|---|---|
| `viewModelScope` | ViewModel cleared | Data fetching, state updates |
| `lifecycleScope` | Activity/Fragment destroyed | UI-triggered one-shot work |
| `rememberCoroutineScope()` | Composable leaves composition | Compose-local async |
| Custom `SupervisorJob()` scope | Manual management | Long-lived services |

### Flow Collection (Compose)

```kotlin
// In ViewModel
val uiState: StateFlow<UiState> = combine(
    repository.items,
    searchQuery
) { items, query ->
    UiState(items = items.filter { it.matches(query) })
}.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

// In Composable
val state by viewModel.uiState.collectAsStateWithLifecycle()
```

### Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| `GlobalScope.launch` | Use `viewModelScope` or injected scope |
| Hardcoded `Dispatchers.IO` | Inject dispatcher via constructor |
| `flow.collect` in Composable (no lifecycle) | `collectAsStateWithLifecycle()` |
| `runBlocking` on main thread | Use `suspend` function + appropriate scope |
| Public `MutableStateFlow` | Expose `.asStateFlow()` read-only |

---

## 3. Cross-Platform Comparison

| Concept | Swift | Kotlin |
|---|---|---|
| Async function | `async throws -> T` | `suspend fun(): T` |
| Cancellation | `Task.isCancelled` / `Task.checkCancellation()` | `isActive` / `ensureActive()` |
| Structured concurrency | `TaskGroup` | `coroutineScope { }` |
| Thread safety | Actors | `Mutex` / `Channel` / atomic |
| UI thread marker | `@MainActor` | `Dispatchers.Main` |
| Background work | Automatic (async functions) | `withContext(Dispatchers.IO)` |
| Lifecycle scoping | `.task { }` modifier | `lifecycleScope.repeatOnLifecycle` |
| Data stream | `AsyncSequence` / `AsyncStream` | `Flow` / `StateFlow` |

---

## 4. Expo Module Threading Rules

1. **`Function` (synchronous)** — Blocks the JS thread. Keep fast (<1ms). No network, no disk.
2. **`AsyncFunction`** — Returns Promise. Runs on background thread by default.
3. **`.runOnQueue(.main)`** — Force main thread for UIKit/AppKit operations.
4. **`Coroutine` (Kotlin)** — Use `withContext(Dispatchers.IO)` for blocking operations.
5. **Events** — `sendEvent` can be called from any thread; delivery is serialized to JS thread.
6. **View props** — Always set on main thread (view hierarchy mutation).

---

## Skill Sources

- `apple-ecosystem-app-building/references/swift-concurrency.md`
- `android-ecosystem-skill/references/kotlin-coroutines.md`
- `android-ecosystem-skill/references/anti-patterns-catalog.md`
- `expo-skill/references/expo-module.md` (threading section)
