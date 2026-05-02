# Native Testing Strategies — iOS & Android

_Read-only reference · Distilled from `apple-ecosystem-app-building/swift-testing.md`,
`android-ecosystem-skill/android-testing.md`, and `native-accessibility-engineering`_

## When to Load

| Task | Load? |
|---|---|
| Writing tests for Expo native module code | **Yes** |
| Setting up CI gates for native adapter verification | **Yes** |
| Validating accessibility in native adapters | **Yes** |
| Writing JS/TS unit tests | No — use `react-native/testing-and-devtools.md` |
| Configuring Maestro flows | No — use `agent/maestro-semantic-flow-adapter.md` |

---

## 1. Testing Pyramid

| Tier | iOS | Android | Speed | Trigger |
|---|---|---|---|---|
| **Unit** | Swift Testing `@Test` / `#expect` | JUnit5 + Turbine (Flow) + MockK | < 2 min | Every commit |
| **Integration** | Swift Testing + mock services | Compose UI tests + Hilt test modules | < 10 min | Every PR |
| **UI / E2E** | XCUITest (sparingly) | Espresso + Compose test rules | < 30 min | Pre-merge / nightly |
| **Accessibility** | VoiceOver manual + Accessibility Inspector | TalkBack manual + Accessibility Scanner | Per release | Release gate |

---

## 2. iOS Testing

### Swift Testing (New Standard)

```swift
import Testing

@Test func articleTitleIsNotEmpty() {
    let article = Article(title: "Swift 6 Guide", body: "...")
    #expect(!article.title.isEmpty)
}

// Async test
@Test func refreshLoadsNewArticles() async throws {
    let vm = FeedViewModel(service: MockArticleService())
    await vm.refresh()
    #expect(!vm.articles.isEmpty)
}

// Parameterized
@Test("Price formatting", arguments: [
    (0.0, "$0.00"), (9.99, "$9.99"), (1234.5, "$1,234.50"),
])
func priceFormatting(value: Double, expected: String) {
    #expect(PriceFormatter.format(value) == expected)
}
```

### Key Differences from XCTest

| XCTest | Swift Testing |
|---|---|
| `XCTAssertEqual(a, b)` | `#expect(a == b)` |
| `XCTAssertNil(x)` | `#expect(x == nil)` |
| `XCTestExpectation` + `wait` | `await confirmation("…") { … }` |
| `setUp() / tearDown()` | `init() async throws / deinit` |

### XCUITest (E2E Only)
- Use `accessibilityIdentifier` for stable queries (locale-safe).
- `waitForExistence(timeout:)` over hardcoded sleeps.
- Page Object pattern for readable test code.
- Run in dedicated scheme with clean simulator snapshot.

---

## 3. Android Testing

### Unit Tests (JVM)

```kotlin
@Test
fun `refresh loads posts`() = runTest {
    val repository = FakePostRepository(listOf(Post.mock))
    val viewModel = FeedViewModel(repository)
    viewModel.refresh()
    assertEquals(1, viewModel.uiState.value.posts.size)
}
```

### Compose UI Tests

```kotlin
@get:Rule
val composeRule = createComposeRule()

@Test
fun buttonShowsLabel() {
    composeRule.setContent {
        TactileButton(onClick = {}) { Text("Press me") }
    }
    composeRule.onNodeWithText("Press me").assertIsDisplayed()
}
```

### Flow Testing with Turbine

```kotlin
@Test
fun `search emits filtered results`() = runTest {
    val viewModel = SearchViewModel(FakeSearchService())
    viewModel.uiState.test {
        assertEquals(SearchUiState(), awaitItem()) // initial
        viewModel.search("kotlin")
        val result = awaitItem()
        assertTrue(result.results.isNotEmpty())
    }
}
```

### Screenshot Testing
- Compose Preview Screenshot Testing for visual regression.
- Paparazzi for JVM-based snapshot tests (no device needed).
- Roborazzi as an alternative snapshot framework.

---

## 4. Accessibility Testing Matrix

| Platform | AT | Automated Gate | Manual Gate |
|---|---|---|---|
| iOS | VoiceOver, Switch Control | Accessibility Inspector, UI tests | Physical device, Screen Curtain, Dynamic Type |
| Android | TalkBack, Switch Access | Accessibility Scanner, Espresso checks, Compose semantic assertions | Device with TalkBack, large font/display |
| React Native | Native AT per platform | Component tests with role/label queries | Test each target platform separately |

### Manual Screen Reader Sequence
1. Turn on target screen reader.
2. Navigate into screen from the previous screen.
3. Swipe to every element in order.
4. Confirm: name, role, state, value, hint announced correctly.
5. Activate every control.
6. Trigger all states: error, loading, success, empty, disabled, selected.
7. Open/close dialogs, sheets, menus.
8. Confirm focus moves and restores correctly.
9. Repeat for large text and contrast/motion settings.

### Severity Levels
| Level | Description |
|---|---|
| **Critical** | Blocks task completion for AT users. Data loss, payment, auth inaccessible. |
| **Serious** | Major task possible but confusing/slow. Wrong role/state. |
| **Moderate** | Extra verbosity, duplicate focus, weak grouping. |
| **Minor** | Small wording issues, polish-level ordering. |

### Release Gate
- ✅ Critical and serious issues resolved.
- ✅ Target AT tested on real devices.
- ✅ Large text and contrast settings tested for critical flows.
- ✅ Automated gates passing with narrow, documented suppressions only.

---

## 5. CI Strategy for Native Adapters

### iOS

```yaml
# Fast tier: SPM unit tests (no simulator)
xcodebuild test -scheme MyAppCore -destination "platform=iOS Simulator,name=iPhone 16"

# Medium tier: Integration + snapshot
xcodebuild test -scheme MyAppIntegration -destination "platform=iOS Simulator,name=iPhone 16"

# Slow tier: XCUITest (pre-merge only)
xcodebuild test -scheme MyAppUITests -destination "platform=iOS Simulator,name=iPhone 16"
```

### Android

```yaml
# Fast tier: JVM unit tests
./gradlew :feature:feed:testDebugUnitTest

# Medium tier: Connected Compose tests
./gradlew :feature:feed:connectedDebugAndroidTest

# Screenshot verification
./gradlew :feature:feed:verifyPaparazziDebug
```

---

## Skill Sources

- `apple-ecosystem-app-building/references/swift-testing.md`
- `android-ecosystem-skill/references/android-testing.md`
- `native-accessibility-engineering/refs/07-testing-audit-workflow.md`
- `native-accessibility-engineering/refs/01-native-principles.md`
