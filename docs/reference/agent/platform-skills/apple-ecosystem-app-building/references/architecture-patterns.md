# Architecture Patterns Reference
_MVVM · TCA · Coordinators · SPM Modularization · SwiftNavigation · Protocol-Oriented Design_

## Table of Contents
1. [Architecture Selection Guide](#1-architecture-selection-guide)
2. [MVVM with @Observable](#2-mvvm-with-observable)
3. [Protocol-Oriented API Design](#3-protocol-oriented-api-design)
4. [Composable Architecture (TCA)](#4-composable-architecture-tca)
5. [SwiftNavigation & UIKitNavigation](#5-swiftnavigation--uikitnavigation)
6. [SPM Modularization](#6-spm-modularization)
7. [Coordinator Pattern (UIKit)](#7-coordinator-pattern-uikit)
8. [Dependency Injection](#8-dependency-injection)
9. [Error Handling Strategy](#9-error-handling-strategy)

---

## 1. Architecture Selection Guide

```
What are your constraints?
    │
    ├─ New SwiftUI app, moderate complexity?
    │       → MVVM + @Observable (§2)
    │
    ├─ Large team, strict unidirectional data flow, heavy testing?
    │       → TCA (§4)
    │
    ├─ Existing UIKit codebase with navigation complexity?
    │       → Coordinator + UIKitNavigation (§5, §7)
    │
    ├─ Multi-feature app needing strict dependency boundaries?
    │       → SPM local packages + any architecture above (§6)
    │
    └─ Cross-platform (iOS + macOS + watchOS)?
            → SwiftNavigation for portable navigation primitives (§5)
```

---

## 2. MVVM with @Observable

### Standard layer separation
```
View           — SwiftUI View struct; pure rendering, no business logic
ViewModel      — @Observable class; state, actions, async coordination
Service/Repo   — Protocol-backed data layer (network, persistence)
Model          — Plain Swift value types (struct, enum)
```

### View model template
```swift
@MainActor
@Observable final class ArticleListViewModel {
    // MARK: - State
    var articles: [Article] = []
    var isLoading = false
    var error: DisplayError?

    // MARK: - Dependencies
    private let service: ArticleService

    init(service: ArticleService = LiveArticleService()) {
        self.service = service
    }

    // MARK: - Actions
    func load() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            articles = try await service.fetchLatest()
        } catch {
            self.error = DisplayError(error)
        }
    }

    func delete(_ article: Article) async {
        do {
            try await service.delete(article.id)
            articles.removeAll { $0.id == article.id }
        } catch {
            self.error = DisplayError(error)
        }
    }
}
```

### View wiring
```swift
struct ArticleListView: View {
    @State private var viewModel = ArticleListViewModel()

    var body: some View {
        List(viewModel.articles) { article in
            ArticleRow(article: article)
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .task { await viewModel.load() }
        .alert("Error", isPresented: Binding(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Text(viewModel.error?.message ?? "Unknown error")
        }
    }
}
```

---

## 3. Protocol-Oriented API Design

### Always define service protocols
```swift
protocol ArticleService: Sendable {
    func fetchLatest() async throws -> [Article]
    func fetch(id: UUID) async throws -> Article
    func delete(_ id: UUID) async throws
}

// Live implementation
final class LiveArticleService: ArticleService { ... }

// Test double
final class MockArticleService: ArticleService {
    var articlesToReturn: [Article] = []
    var deleteCalledWith: UUID?

    func fetchLatest() async throws -> [Article] { articlesToReturn }
    func fetch(id: UUID) async throws -> Article {
        articlesToReturn.first { $0.id == id } ?? { throw ServiceError.notFound }()
    }
    func delete(_ id: UUID) async throws { deleteCalledWith = id }
}
```

### Protocol constraints over inheritance
```swift
// Prefer composition
protocol Persistable: Codable, Identifiable where ID == UUID {}
protocol Syncable: Persistable {
    var lastSyncedAt: Date? { get }
}

struct Article: Syncable {
    let id: UUID
    var title: String
    var lastSyncedAt: Date?
}
```

---

## 4. Composable Architecture (TCA)

Source: https://github.com/pointfreeco/swift-composable-architecture

### Core concepts
```
Store<State, Action>  — Single source of truth for a feature
Reducer               — Pure function: (State, Action) → Effect<Action>
Effect                — Async work; returns new Actions when complete
Dependency            — Injected via @Dependency; testable, composable
```

### Feature template
```swift
import ComposableArchitecture

@Reducer
struct ArticleListFeature {
    @ObservableState
    struct State: Equatable {
        var articles: [Article] = []
        var isLoading = false
    }

    enum Action {
        case onAppear
        case articlesLoaded([Article])
        case loadFailed(Error)
        case deleteArticle(id: UUID)
    }

    @Dependency(\.articleClient) var articleClient

    var body: some Reducer<State, Action> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
                return .run { send in
                    do {
                        let articles = try await articleClient.fetchLatest()
                        await send(.articlesLoaded(articles))
                    } catch {
                        await send(.loadFailed(error))
                    }
                }
            case .articlesLoaded(let articles):
                state.articles = articles
                state.isLoading = false
                return .none
            case .loadFailed:
                state.isLoading = false
                return .none
            case .deleteArticle(let id):
                state.articles.removeAll { $0.id == id }
                return .run { _ in try? await articleClient.delete(id) }
            }
        }
    }
}
```

### TCA testing with TestStore
```swift
@Test func loadArticlesUpdatesState() async {
    let store = TestStore(initialState: ArticleListFeature.State()) {
        ArticleListFeature()
    } withDependencies: {
        $0.articleClient.fetchLatest = { [.mock] }
    }

    await store.send(.onAppear) { $0.isLoading = true }
    await store.receive(.articlesLoaded([.mock])) {
        $0.articles = [.mock]
        $0.isLoading = false
    }
}
```

### When TCA shines
- Multiple screens sharing the same domain state
- Complex side effects with cancellation requirements
- Large teams wanting uniform patterns
- Exhaustive testing of every state transition

### When TCA is overkill
- Simple apps with < 5 features
- Pure SwiftUI screens with local state
- Prototypes or MVP builds

---

## 5. SwiftNavigation & UIKitNavigation

Source: https://github.com/pointfreeco/swift-navigation

### SwiftNavigation: type-safe modals
```swift
import SwiftUINavigation

@Observable final class AppModel {
    var destination: Destination?

    enum Destination {
        case settings(SettingsModel)
        case articleDetail(Article)
        case confirmLogout
    }
}

struct RootView: View {
    @State var model = AppModel()

    var body: some View {
        NavigationStack {
            HomeView(model: model)
        }
        .sheet(item: $model.destination) { destination in
            switch destination {
            case .settings(let settingsModel):
                SettingsView(model: settingsModel)
            case .articleDetail(let article):
                ArticleDetailView(article: article)
            case .confirmLogout:
                ConfirmLogoutView { model.logout() }
            }
        }
    }
}
```

### UIKitNavigation: UIKit with bindings
```swift
import UIKitNavigation

final class ProfileViewController: UIViewController {
    @UIBinding var model: ProfileModel

    override func viewDidLoad() {
        super.viewDidLoad()
        observe { [weak self] in
            guard let self else { return }
            nameLabel.text = model.name
        }
    }
}
```

**Cross-platform navigation primitives** — `NavigationModel`, `AlertState<Action>`, and
`ConfirmationDialogState<Action>` work identically across SwiftUI, UIKit, and AppKit.

---

## 6. SPM Modularization

### Target graph for a feature-based app
```
App (executable)
    └── AppCore (shared domain)
            ├── ArticleFeature
            │       ├── ArticleUI (SwiftUI views)
            │       └── ArticleLogic (models, services, no UI)
            ├── UserFeature
            │       ├── UserUI
            │       └── UserLogic
            ├── DesignSystem (UI primitives, colors, fonts)
            └── NetworkKit (URLSession wrapper, auth)
```

### Package.swift template
```swift
// Package.swift — inside App/Packages/
let package = Package(
    name: "AppPackages",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "ArticleFeature", targets: ["ArticleUI", "ArticleLogic"]),
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.0.0"),
    ],
    targets: [
        .target(name: "ArticleLogic", dependencies: [
            .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
        ]),
        .target(name: "ArticleUI", dependencies: ["ArticleLogic"]),
        .testTarget(name: "ArticleLogicTests", dependencies: ["ArticleLogic"]),
    ]
)
```

**Rules:**
- UI targets depend on logic targets, never the reverse.
- Each feature owns its own test target.
- Shared utilities live in `NetworkKit`, `DesignSystem`, or `AppCore` — not scattered across features.

---

## 7. Coordinator Pattern (UIKit)

```swift
protocol Coordinator: AnyObject {
    var navigationController: UINavigationController { get }
    func start()
}

final class ArticleCoordinator: Coordinator {
    let navigationController: UINavigationController
    private var childCoordinators: [Coordinator] = []

    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }

    func start() {
        let vc = ArticleListViewController()
        vc.delegate = self
        navigationController.pushViewController(vc, animated: false)
    }
}

extension ArticleCoordinator: ArticleListViewControllerDelegate {
    func didSelect(article: Article) {
        let detailVC = ArticleDetailViewController(article: article)
        navigationController.pushViewController(detailVC, animated: true)
    }
}
```

---

## 8. Dependency Injection

### TCA @Dependency system (preferred for TCA apps)
```swift
// Define client
struct ArticleClient {
    var fetchLatest: @Sendable () async throws -> [Article]
    var delete: @Sendable (UUID) async throws -> Void
}

extension ArticleClient: DependencyKey {
    static let liveValue = ArticleClient(
        fetchLatest: { try await LiveArticleService().fetchLatest() },
        delete: { id in try await LiveArticleService().delete(id) }
    )
    static let testValue = ArticleClient(
        fetchLatest: { [] },
        delete: { _ in }
    )
}

extension DependencyValues {
    var articleClient: ArticleClient {
        get { self[ArticleClient.self] }
        set { self[ArticleClient.self] = newValue }
    }
}
```

### SwiftUI Environment injection (non-TCA)
```swift
// Define environment key
private struct ArticleServiceKey: EnvironmentKey {
    static let defaultValue: any ArticleService = LiveArticleService()
}
extension EnvironmentValues {
    var articleService: any ArticleService {
        get { self[ArticleServiceKey.self] }
        set { self[ArticleServiceKey.self] = newValue }
    }
}

// Inject at root
MyApp().environment(\.articleService, MockArticleService())

// Consume in view
@Environment(\.articleService) private var articleService
```

---

## 9. Error Handling Strategy

### Typed errors for domain boundaries
```swift
enum ArticleError: LocalizedError {
    case notFound(UUID)
    case unauthorized
    case networkFailure(underlying: Error)

    var errorDescription: String? {
        switch self {
        case .notFound(let id): "Article \(id) not found"
        case .unauthorized: "You don't have permission to view this article"
        case .networkFailure: "Network error — please try again"
        }
    }
}
```

### DisplayError: user-facing error model
```swift
struct DisplayError: Identifiable {
    let id = UUID()
    let title: String
    let message: String

    init(_ error: Error) {
        if let e = error as? LocalizedError {
            title = "Error"
            message = e.errorDescription ?? e.localizedDescription
        } else {
            title = "Unexpected Error"
            message = error.localizedDescription
        }
    }
}
```
