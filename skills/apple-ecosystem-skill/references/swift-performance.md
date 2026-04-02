# Swift Performance Reference
_Swift 6.2 · iOS 18+ · ARC · COW · Noncopyable Types · Instruments · InlineArray · Span_

## Table of Contents
1. [Value vs Reference Semantics](#1-value-vs-reference-semantics)
2. [Copy-on-Write (COW)](#2-copy-on-write-cow)
3. [ARC Optimization](#3-arc-optimization)
4. [Noncopyable Types (~Copyable)](#4-noncopyable-types-copyable)
5. [InlineArray & Span (Swift 6.2)](#5-inlinearray--span-swift-62)
6. [Generics & Specialization](#6-generics--specialization)
7. [Collection Performance](#7-collection-performance)
8. [Concurrency Overhead](#8-concurrency-overhead)
9. [Memory Layout & Alignment](#9-memory-layout--alignment)
10. [Typed Throws (Swift 6)](#10-typed-throws-swift-6)
11. [Instruments Workflow](#11-instruments-workflow)
12. [Decision Matrix: Struct vs Class](#12-decision-matrix-struct-vs-class)
13. [Launch Time & Scrolling Budgets](#13-launch-time--scrolling-budgets)

---

## 1. Value vs Reference Semantics

**Default to value types (`struct`, `enum`):**
- Allocated on stack when small (≤ a few words) — zero ARC overhead.
- Copied on assignment → no aliasing bugs.
- Thread-safe without locks (each thread gets its own copy).

**Use reference types (`class`, `actor`) when:**
- Identity matters (two variables must refer to the same object).
- Inheritance is needed.
- The object is large and frequently shared (COW can mitigate this — see §2).

---

## 2. Copy-on-Write (COW)

Swift's standard collections (`Array`, `Dictionary`, `Set`, `String`) use COW automatically.
For custom value types wrapping heap storage, implement manually:

```swift
struct LargeBuffer {
    private var storage: Storage   // class wrapping heap data

    // Ensure unique copy before mutation
    private mutating func ensureUnique() {
        if !isKnownUniquelyReferenced(&storage) {
            storage = storage.copy()
        }
    }

    mutating func append(_ value: Int) {
        ensureUnique()
        storage.append(value)
    }
}
```

**Pitfall:** Storing a COW type in a `class` property defeats the COW contract — the class is
a reference type, so the COW value is shared through the class reference.

---

## 3. ARC Optimization

### Reducing retain/release traffic
- Avoid storing closures that capture `self` in long-lived containers — prefer `[weak self]`.
- Use `withExtendedLifetime(_:_:)` when C interop requires object to outlive a block.
- Profile with Instruments **Allocations** → **Retain Cycles** template.

### Unowned vs Weak
```swift
// weak: self may be nil (view models outlived by async tasks)
Task { [weak self] in
    guard let self else { return }
    await self.refresh()
}

// unowned: self is guaranteed alive for the closure's lifetime
// Use rarely — a wrong unowned causes an immediate crash
```

### Avoid unnecessary boxing
```swift
// BAD: Array of Any boxes value types
var items: [Any] = [1, "hello", 3.14]

// GOOD: typed array avoids boxing
var numbers: [Int] = [1, 2, 3]
```

---

## 4. Noncopyable Types (~Copyable)

Introduced Swift 5.9, matured in Swift 6.

```swift
struct FileHandle: ~Copyable {
    private let fd: Int32

    init(path: String) throws {
        fd = open(path, O_RDONLY)
        guard fd >= 0 else { throw POSIXError(.ENOENT) }
    }

    consuming func close() {
        Darwin.close(fd)
    }

    deinit { Darwin.close(fd) }
}

// Compiler enforces: can't accidentally copy and double-close
func read(from handle: consuming FileHandle) { ... }
```

**When to use `~Copyable`:**
- Wrapping system resources (file descriptors, locks, hardware handles).
- Security-sensitive objects where duplicates would be dangerous (keys, tokens).
- Ensuring linear ownership of expensive objects.

---

## 5. InlineArray & Span (Swift 6.2)

### InlineArray — fixed-size stack-allocated array
```swift
// No heap allocation, size known at compile time
var matrix: InlineArray<9, Float> = .init(repeating: 0)
matrix[0] = 1.0

// Ideal for: physics simulation, SIMD buffers, small fixed buffers
```

### Span — safe non-owning view into contiguous memory
```swift
func processBuffer(_ span: Span<UInt8>) {
    for byte in span { ... }
}

var data: [UInt8] = [0x01, 0x02, 0x03]
data.withSpan { processBuffer($0) }
```

**Span guarantees:** non-escaping by default (lifetime tied to source), bounds-checked, zero-cost
abstraction over raw memory — use instead of `UnsafeBufferPointer` for most cases.

---

## 6. Generics & Specialization

### Enable specialization
```swift
// @inlinable exposes implementation to callers across module boundaries
@inlinable
public func sum<T: AdditiveArithmetic>(_ values: [T]) -> T {
    values.reduce(.zero, +)
}
```

### Avoid existential boxing in hot paths
```swift
// BAD: `any Drawable` boxes into an existential container
func drawAll(_ shapes: [any Drawable]) { ... }

// GOOD: generic — compiler can specialize per concrete type
func drawAll<S: Drawable>(_ shapes: [S]) { ... }

// When mixed types are required, use opaque types or enum wrappers instead
```

### Opaque return types
```swift
// 'some View' is opaque — no boxing, compiler-resolved at call site
var body: some View { Text("Hello") }
```

---

## 7. Collection Performance

| Operation | Array | Set | Dictionary |
|---|---|---|---|
| Append | O(1) amortized | O(1) avg | O(1) avg |
| Contains | O(n) | O(1) avg | O(1) avg |
| Remove at index | O(n) | O(1) avg | O(1) avg |
| Sorted iteration | O(n log n) | O(n log n) | O(n log n) |

### Tips
- Reserve capacity when size is known: `array.reserveCapacity(1000)`
- Use `ContiguousArray<T>` when storing class references in a tight loop (avoids ObjC bridging).
- `Dictionary(grouping:by:)` over manual grouping loops.
- Prefer `lazy` chains for one-pass transformations that don't require a materialized result.

---

## 8. Concurrency Overhead

| Pattern | Cost |
|---|---|
| `await` at suspension point | ~nanoseconds (cooperative thread pool hop) |
| Task creation (`Task { }`) | ~300 bytes heap + executor enqueue |
| Actor hop | Two context switches (send + receive) |
| `@MainActor` hop from background | Serialize on main thread — avoid in tight loops |

**Guidance:**
- Batch small async operations — don't `await` inside a tight loop over thousands of items.
- Prefer `@concurrent` for pure-computation functions in Swift 6.2 that must not run on caller's actor.
- Use `withTaskGroup` to bound the number of concurrent tasks (avoid spawning thousands).

---

## 9. Memory Layout & Alignment

```swift
// Inspect struct layout
MemoryLayout<CGPoint>.size       // 16 bytes
MemoryLayout<CGPoint>.alignment  // 8 bytes
MemoryLayout<CGPoint>.stride     // 16 bytes

// Field ordering matters — group same-size fields to reduce padding
struct Optimized {
    var x: Double   // 8 bytes
    var y: Double   // 8 bytes
    var flag: Bool  // 1 byte + 7 bytes padding if last field
}
// Total: 24 bytes. Rearranging Bool first wastes more — Double alignment forces padding anyway.
```

---

## 10. Typed Throws (Swift 6)

```swift
// Typed throws: callers know exactly which errors to handle
enum NetworkError: Error { case timeout, unauthorized, serverError(Int) }

func fetchUser(id: UUID) throws(NetworkError) -> User { ... }

// Call site — exhaustive catch without generic Error catch-all
do {
    let user = try fetchUser(id: id)
} catch .timeout {
    retry()
} catch .unauthorized {
    refreshToken()
} catch .serverError(let code):
    log(code)
}
```

---

## 11. Instruments Workflow

### Launch time analysis
1. **Xcode → Profile → Time Profiler** — record cold launch.
2. Look for work in `+[AppDelegate application:didFinishLaunchingWithOptions:]` > 100ms.
3. Defer non-critical initialization to first use (lazy properties, background Tasks).

### Memory leaks
1. **Instruments → Leaks** — run, then navigate through the app.
2. Supplement with **Memory Graph Debugger** (pause → Debug Memory Graph).
3. Look for cycles: ViewController → ViewModel → Closure → ViewController.

### Scrolling performance (Hangs & Hitches)
1. **Instruments → Animation Hitches** — find commit/render hitches.
2. Commit hitches: heavy work in layout pass — move to background.
3. Render hitches: complex view hierarchies — use `drawingGroup()` or simplify.

### Key Instruments for iOS Performance
| Instrument | Use |
|---|---|
| Time Profiler | CPU hot paths, launch time |
| Allocations | Heap usage, retain cycles |
| Leaks | Leaked objects |
| Animation Hitches | Frame drops, render budget |
| Network | URLSession timing, latency |
| Energy Log | Background CPU/network battery impact |

---

## 12. Decision Matrix: Struct vs Class

| Criterion | Prefer Struct | Prefer Class |
|---|---|---|
| Identity needed? | No | Yes |
| Inheritance needed? | No | Yes |
| Shared mutable state? | No | Yes |
| Thread safety via copy? | Yes | No (use actor) |
| Large, frequently shared? | Use COW struct | Class if no COW |
| Objective-C interop required? | No | Yes |
| Used in SwiftUI as state? | Yes (@Observable struct or enum) | Prefer @Observable class |

---

## 13. Launch Time & Scrolling Budgets

| Metric | Target | Regression Threshold |
|---|---|---|
| Cold launch (to first frame) | < 400 ms | > 600 ms |
| Warm launch | < 200 ms | > 300 ms |
| Frame render time (60 fps) | < 16.7 ms | Any hitch |
| Frame render time (120 fps ProMotion) | < 8.3 ms | Any hitch |
| Memory at launch | < 50 MB | > 100 MB |
| App binary size (download) | < 30 MB | > 50 MB |

### Apple Case Study Reference
Apple's Password Monitoring service Swift rewrite (WWDC) achieved:
- 2× throughput improvement using noncopyable types and InlineArray.
- Eliminated all heap allocations in the hot path via Span.
