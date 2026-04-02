# Swift Concurrency Reference
_Swift 6.x · iOS 16+ · Structured Concurrency · Actor Isolation · Migration_

## Table of Contents
1. [Project Settings Audit](#1-project-settings-audit)
2. [Migration Playbook (Swift 5.x → Swift 6)](#2-migration-playbook)
3. [Async / Await Patterns](#3-async--await-patterns)
4. [Actors & MainActor](#4-actors--mainactor)
5. [Sendable & Data-Race Safety](#5-sendable--data-race-safety)
6. [TaskGroup & Structured Parallelism](#6-taskgroup--structured-parallelism)
7. [AsyncSequence Patterns](#7-asyncsequence-patterns)
8. [Continuation Bridging (Legacy APIs)](#8-continuation-bridging-legacy-apis)
9. [Diagnostic Triage Playbook](#9-diagnostic-triage-playbook)
10. [Performance Trade-offs](#10-performance-trade-offs)
11. [Testing Concurrent Code](#11-testing-concurrent-code)

---

## 1. Project Settings Audit

Check these before any concurrency work:

```
// Package.swift — enable strict concurrency per target
.target(
    name: "MyFeature",
    swiftSettings: [
        .enableUpcomingFeature("StrictConcurrency"),       // Swift 5.10
        .enableExperimentalFeature("NonisolatedNonsendingByDefault"), // Swift 6 preview
    ]
)

// Xcode Build Settings
SWIFT_STRICT_CONCURRENCY = complete   // "minimal" → "targeted" → "complete"
```

**Migration order:** minimal → targeted → complete, one module at a time.

---

## 2. Migration Playbook

### Step-by-step: module-by-module

1. **Audit entry points** — identify all `DispatchQueue`, `OperationQueue`, completion-handler,
   and delegate APIs crossing module boundaries.
2. **Set `targeted` concurrency** — fixes most DispatchQueue.main → `@MainActor` errors without
   full strict mode noise.
3. **Annotate view models** — add `@MainActor` to any class that owns `@Published` or
   `@Observable` state read on the main thread.
4. **Audit `Sendable`** — resolve all `Non-sendable type … passed in call` warnings
   (see §5 below).
5. **Switch to `complete`** — fix remaining isolation errors, then lock in.
6. **Enable `NonisolatedNonsendingByDefault`** — opt into Swift 6.2 default isolation
   (`nonisolated` async functions no longer implicitly cross to the main actor).

### Common blockers and fixes

| Warning / Error | Fix |
|---|---|
| `Non-sendable type 'Foo' passed in implicitly asynchronous call` | Conform `Foo: Sendable` or mark `@unchecked Sendable` with a lock |
| `Main actor-isolated property cannot be referenced from a nonisolated context` | Annotate call site with `await MainActor.run { }` or make caller `@MainActor` |
| `Expression is 'async' but is not marked with 'await'` | Add `await`; or extract to `Task { }` if in sync context |
| `Core Data: Merge policy violation` | Use `NSManagedObjectContext` on a dedicated `actor` with a background context |
| `async_without_await` lint | Remove spurious `async` keyword from function that has no actual suspension point |

---

## 3. Async / Await Patterns

### URLSession networking (iOS / macOS)
```swift
// Preferred: async data task
func fetchUser(id: UUID) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)
    guard (response as? HTTPURLResponse)?.statusCode == 200 else {
        throw APIError.badStatus
    }
    return try JSONDecoder().decode(User.self, from: data)
}
```

### Task scoping in views (UIKit)
```swift
// Cancel automatically when view disappears
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    loadTask = Task {
        do {
            users = try await fetchUsers()
        } catch {
            handleError(error)
        }
    }
}

override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    loadTask?.cancel()
}
```

### Task scoping in SwiftUI
```swift
.task {
    // Automatically cancelled when view disappears
    await viewModel.load()
}
```

### Debounced search
```swift
@Observable final class SearchViewModel {
    var query = "" {
        didSet { scheduleSearch() }
    }
    private var searchTask: Task<Void, Never>?

    private func scheduleSearch() {
        searchTask?.cancel()
        searchTask = Task {
            try? await Task.sleep(for: .milliseconds(300))
            guard !Task.isCancelled else { return }
            await performSearch(query)
        }
    }
}
```

---

## 4. Actors & MainActor

### When to use an actor
- Shared mutable state accessed from multiple async contexts
- Actor-backed caches, database coordinators, token managers

### Actor-backed cache pattern
```swift
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? { cache[url] }

    func store(_ image: UIImage, for url: URL) {
        cache[url] = image
    }
}
```

### @MainActor view model
```swift
@MainActor
@Observable final class FeedViewModel {
    var posts: [Post] = []
    var isLoading = false

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        posts = try? await postService.fetchLatest() ?? posts
    }
}
```

### Minimizing actor hops
```swift
// BAD: many hops back to main actor
for item in items {
    await MainActor.run { self.process(item) }
}

// GOOD: batch on actor, then single hop
let processed = await processorActor.processAll(items)
await MainActor.run { self.results = processed }
```

---

## 5. Sendable & Data-Race Safety

### Conformance strategies

| Type | Strategy |
|---|---|
| Pure value type (`struct` with Sendable fields) | Automatic conformance |
| Class with a lock protecting all mutable state | `@unchecked Sendable` + document the lock |
| Immutable class | `@unchecked Sendable` |
| Enum with only Sendable associated values | Automatic |
| Actor | Implicitly `Sendable` |

```swift
// @unchecked with documentation
final class TokenStore: @unchecked Sendable {
    private let lock = NSLock()
    private var _token: String?

    var token: String? {
        get { lock.withLock { _token } }
        set { lock.withLock { _token = newValue } }
    }
}
```

---

## 6. TaskGroup & Structured Parallelism

```swift
// Fan-out: fetch multiple resources in parallel
func fetchAll(ids: [UUID]) async throws -> [Article] {
    try await withThrowingTaskGroup(of: Article.self) { group in
        for id in ids {
            group.addTask { try await fetchArticle(id: id) }
        }
        return try await group.reduce(into: []) { $0.append($1) }
    }
}
```

**Rules:**
- Prefer `withThrowingTaskGroup` when any child can fail.
- Use `group.next()` for streaming results rather than `reduce` when order matters.
- Set a concurrency limit with a `AsyncSemaphore` if fan-out is unbounded.

---

## 7. AsyncSequence Patterns

### NotificationCenter wrapper
```swift
extension NotificationCenter {
    func notifications(named name: NSNotification.Name) -> AsyncStream<Notification> {
        AsyncStream { continuation in
            let observer = self.addObserver(forName: name, object: nil, queue: nil) {
                continuation.yield($0)
            }
            continuation.onTermination = { _ in
                self.removeObserver(observer)
            }
        }
    }
}
```

### Consuming with cancellation
```swift
for await notification in NotificationCenter.default.notifications(named: .NSManagedObjectContextDidSave) {
    try Task.checkCancellation()
    await handleSave(notification)
}
```

---

## 8. Continuation Bridging (Legacy APIs)

### Callback → async
```swift
func fetchLegacy() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        LegacyService.shared.fetch { result in
            continuation.resume(with: result)
        }
    }
}
```

### Delegate → async (one-shot)
```swift
func requestPermission() async -> Bool {
    await withCheckedContinuation { continuation in
        permissionManager.request { granted in
            continuation.resume(returning: granted)
        }
    }
}
```

**Rule:** Never call `resume` more than once per continuation — it is a fatal error.

---

## 9. Diagnostic Triage Playbook

```
Concurrency warning/error received
    │
    ├─ "Sendable" in message → §5 Sendable conformance strategies
    ├─ "Main actor" / "@MainActor" → §4 actor isolation patterns
    ├─ "async_without_await" → remove async keyword or add suspension point
    ├─ "Core Data" / NSManagedObject → use background context actor pattern
    └─ "NonisolatedNonsendingByDefault" → update caller to explicit isolation
```

---

## 10. Performance Trade-offs

| Concern | Guidance |
|---|---|
| Task creation overhead | Each `Task { }` allocates ~300 bytes + executor queue overhead; batch small work |
| Actor re-entrancy | Long `await` inside actor suspends it; other callers proceed — protect invariants |
| `@MainActor` contention | Avoid large synchronous work on MainActor; offload to background actor then publish results |
| AsyncStream backpressure | Use `AsyncStream.init(bufferingPolicy:)` to drop or buffer on overflow |
| `@concurrent` function | Swift 6.2 — marks a nonisolated async function that must not run on caller's actor |

---

## 11. Testing Concurrent Code

See `references/swift-testing.md` §Async Testing for full details.

Quick reference:
```swift
// Deterministic time with TestClock
import Testing
import Clocks

@Test func debounceWaitsThreeHundredMilliseconds() async {
    let clock = TestClock()
    let vm = SearchViewModel(clock: clock)
    vm.query = "swift"
    await clock.advance(by: .milliseconds(299))
    #expect(vm.results.isEmpty)
    await clock.advance(by: .milliseconds(1))
    #expect(!vm.results.isEmpty)
}
```
