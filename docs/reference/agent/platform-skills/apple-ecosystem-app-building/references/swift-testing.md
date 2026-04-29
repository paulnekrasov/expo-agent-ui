# Swift Testing Reference
_Swift Testing · XCTest · XCUITest · Async Tests · CI Strategy · iOS 18+_

## Table of Contents
1. [Testing Router: When to Use What](#1-testing-router-when-to-use-what)
2. [Swift Testing Fundamentals](#2-swift-testing-fundamentals)
3. [Parameterized Tests](#3-parameterized-tests)
4. [Async Testing](#4-async-testing)
5. [TestClock & Deterministic Time](#5-testclock--deterministic-time)
6. [Tags & Test Organization](#6-tags--test-organization)
7. [Migration from XCTest](#7-migration-from-xctest)
8. [XCUITest Best Practices](#8-xcuitest-best-practices)
9. [Test Architecture & CI Strategy](#9-test-architecture--ci-strategy)
10. [Swift 6.2 / MainActor Considerations](#10-swift-62--mainactor-considerations)

---

## 1. Testing Router: When to Use What

```
New test needed?
    │
    ├─ Testing business logic, algorithms, view models?
    │       → Swift Testing (@Test, #expect)
    │
    ├─ Testing async operations, Task cancellation, actors?
    │       → Swift Testing + async @Test functions
    │
    ├─ Testing time-dependent behavior (debounce, retry, timeout)?
    │       → Swift Testing + TestClock (swift-clocks)
    │
    ├─ Testing UI user journeys (navigation, tap flows)?
    │       → XCUITest (use sparingly — slow, fragile)
    │
    ├─ Legacy code that uses XCTestCase / XCTAssert?
    │       → Keep XCTest; migrate incrementally (see §7)
    │
    └─ Verifying async callbacks / publisher emissions?
            → Swift Testing @Test + confirmation(of:) (see §4)
```

**Rule of thumb:** Swift Testing for everything new. XCUITest only for full end-to-end user flows.

---

## 2. Swift Testing Fundamentals

### Basic test
```swift
import Testing

@Test func articleTitleIsNotEmpty() {
    let article = Article(title: "Swift 6 Guide", body: "...")
    #expect(!article.title.isEmpty)
}
```

### Suites
```swift
@Suite("ArticleViewModel Tests")
struct ArticleViewModelTests {
    let viewModel: ArticleViewModel

    init() {
        viewModel = ArticleViewModel(service: MockArticleService())
    }

    @Test func loadArticlesPopulatesState() async {
        await viewModel.load()
        #expect(!viewModel.articles.isEmpty)
    }
}
```

### #expect vs #require
```swift
// #expect: records failure, continues test
#expect(result == 42)

// #require: stops test immediately on failure (like XCTAssertNil guard)
let user = try #require(await fetchUser(id: validID))
#expect(user.name == "Alice")
```

### Throwing tests
```swift
@Test func decodingInvalidJSONThrows() throws {
    let badData = Data("not json".utf8)
    #expect(throws: DecodingError.self) {
        try JSONDecoder().decode(Article.self, from: badData)
    }
}
```

---

## 3. Parameterized Tests

```swift
@Test("Price formatting", arguments: [
    (0.0, "$0.00"),
    (9.99, "$9.99"),
    (1234.5, "$1,234.50"),
    (-5.0, "-$5.00"),
])
func priceFormatting(value: Double, expected: String) {
    #expect(PriceFormatter.format(value) == expected)
}
```

Swift Testing runs each argument combination as an independent, parallelizable test case.
Failed arguments are reported individually — no need for nested loops.

### Cartesian product
```swift
@Test(arguments: [Locale(identifier: "en_US"), Locale(identifier: "de_DE")],
             [Currency.usd, .eur, .gbp])
func currencyFormatting(locale: Locale, currency: Currency) {
    // 2 × 3 = 6 independent test cases
    #expect(format(1000, locale: locale, currency: currency) != nil)
}
```

---

## 4. Async Testing

### Basic async @Test
```swift
@Test func refreshLoadsNewArticles() async throws {
    let service = MockArticleService(articles: [.mock])
    let vm = FeedViewModel(service: service)
    await vm.refresh()
    #expect(vm.articles.count == 1)
}
```

### Confirming async callbacks (replaces XCTestExpectation)
```swift
@Test func notificationPostedOnSave() async {
    await confirmation("Save notification fired") { confirm in
        let observer = NotificationCenter.default.addObserver(
            forName: .didSaveArticle, object: nil, queue: nil
        ) { _ in confirm() }
        defer { NotificationCenter.default.removeObserver(observer) }
        await saveService.save(.mock)
    }
}
```

### withMainSerialExecutor (Swift concurrency extras)
```swift
// Forces all async work onto main thread — eliminates flakiness from executor scheduling
import ConcurrencyExtras

@Test func viewModelUpdatesOnMainActor() async {
    await withMainSerialExecutor {
        let vm = CounterViewModel()
        await vm.increment()
        #expect(vm.count == 1)
    }
}
```

---

## 5. TestClock & Deterministic Time

Use `TestClock` from [swift-clocks](https://github.com/pointfreeco/swift-clocks) to control time
without real `sleep` calls.

```swift
import Clocks
import Testing

@Test func searchDebouncesThreeHundredMilliseconds() async {
    let clock = TestClock()
    let vm = SearchViewModel(clock: clock)

    vm.query = "swift"
    // Advance 299ms — results should not appear yet
    await clock.advance(by: .milliseconds(299))
    #expect(vm.results.isEmpty)

    // Advance 1ms more — debounce fires
    await clock.advance(by: .milliseconds(1))
    #expect(!vm.results.isEmpty)
}
```

### Injecting the clock
```swift
@Observable final class SearchViewModel {
    var results: [Result] = []
    private let clock: any Clock<Duration>

    init(clock: any Clock<Duration> = ContinuousClock()) {
        self.clock = clock
    }
}
```

---

## 6. Tags & Test Organization

```swift
extension Tag {
    @Tag static var networking: Self
    @Tag static var persistence: Self
    @Tag static var critical: Self
}

@Test(.tags(.critical, .networking))
func fetchUserReturnsValidData() async throws { ... }
```

### Running tagged tests
```bash
# CLI — run only critical tests
swift test --filter tag:critical

# Xcode — use test plan filters
```

### Parallel execution control
```swift
// Disable parallelism for a test that must run serially (filesystem, shared state)
@Test(.serialized)
func writesToSharedFile() { ... }

// Or at suite level
@Suite(.serialized)
struct DatabaseTests { ... }
```

---

## 7. Migration from XCTest

### Coexistence rules
- Swift Testing and XCTest **can coexist** in the same test target.
- Do **not** put `@Test` functions inside an `XCTestCase` subclass.
- Do **not** call `XCTAssert` from an `@Test` function — they don't interact.

### Mechanical migration
| XCTest | Swift Testing |
|---|---|
| `XCTAssertEqual(a, b)` | `#expect(a == b)` |
| `XCTAssertNil(x)` | `#expect(x == nil)` |
| `XCTAssertNotNil(x)` | `#expect(x != nil)` |
| `XCTAssertThrowsError(try f())` | `#expect(throws: (any Error).self) { try f() }` |
| `XCTestExpectation` + `wait` | `await confirmation("…") { … }` |
| `setUp() / tearDown()` | `init() async throws / deinit` |
| `XCTSkip("…")` | `try #require(Bool(false), "…")` or `withKnownIssue` |

### Incremental strategy
1. Write all **new** tests in Swift Testing.
2. Migrate high-churn test files (change > 3× per sprint).
3. Keep stable XCTest files until a dedicated cleanup sprint.

---

## 8. XCUITest Best Practices

### Accessibility identifiers (set in app code)
```swift
TextField("Email", text: $email)
    .accessibilityIdentifier("loginEmailField")
```

### Stable queries
```swift
// Prefer accessibilityIdentifier over label (locale-safe)
let emailField = app.textFields["loginEmailField"]
XCTAssertTrue(emailField.waitForExistence(timeout: 5))
emailField.tap()
emailField.typeText("user@example.com")
```

### Page Object pattern
```swift
struct LoginScreen {
    let app: XCUIApplication

    var emailField: XCUIElement { app.textFields["loginEmailField"] }
    var passwordField: XCUIElement { app.secureTextFields["loginPasswordField"] }
    var submitButton: XCUIElement { app.buttons["loginSubmitButton"] }

    func login(email: String, password: String) {
        emailField.tap(); emailField.typeText(email)
        passwordField.tap(); passwordField.typeText(password)
        submitButton.tap()
    }
}
```

### Reducing flakiness
- Use `waitForExistence(timeout:)` instead of hardcoded sleeps.
- Run UI tests in a dedicated scheme with a clean simulator snapshot.
- Use `launchArguments` to inject test state (skip onboarding, mock backend).

---

## 9. Test Architecture & CI Strategy

### Recommended structure
```
MyApp/
├── MyApp/                    # App target
├── MyAppCore/                # SPM package: models, services, business logic
│   └── Tests/                # Swift Testing unit tests (no Host Application)
│       └── MyAppCoreTests/
├── MyAppFeatureA/            # SPM package: feature module
│   └── Tests/
└── MyAppUITests/             # XCUITest target (Host Application: MyApp)
```

**Key principle:** Unit tests live in SPM packages with `Host Application: None` — this enables
fast parallel test runs (no simulator boot required).

### CI tiers (speed budget)
| Tier | Tests | Target Time | Trigger |
|---|---|---|---|
| Fast | Unit + Swift Testing | < 2 min | Every commit |
| Medium | Integration + snapshot | < 10 min | Every PR |
| Slow | XCUITest | < 30 min | Pre-merge / nightly |

### Xcode Cloud setup
```yaml
# ci_scripts/ci_post_clone.sh
#!/bin/sh
# Install SPM dependencies, run fast tier
xcodebuild test -scheme MyAppCore -destination "platform=iOS Simulator,name=iPhone 15"
```

---

## 10. Swift 6.2 / MainActor Considerations

Swift 6.2 changes the default isolation for `@Test` functions:

- In Swift 6.2, test functions and suite `init` methods are **nonisolated by default** (not
  `@MainActor`).
- If your view model or class under test requires `@MainActor`, annotate explicitly:

```swift
@Test @MainActor
func viewModelUpdatesUI() {
    let vm = MyViewModel()  // @MainActor class — must test on MainActor
    vm.trigger()
    #expect(vm.state == .ready)
}
```

- Use `withMainSerialExecutor` (swift-concurrency-extras) to collapse async execution onto a
  single serial queue, eliminating non-determinism in async unit tests.
