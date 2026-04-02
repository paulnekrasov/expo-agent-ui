# SwiftUI Patterns Reference
_SwiftUI · iOS 16–26+ · macOS 14+ · State Management · Navigation · Charts · Liquid Glass_

## Table of Contents
1. [State Wrapper Selection](#1-state-wrapper-selection)
2. [View Composition & Architecture](#2-view-composition--architecture)
3. [Navigation (iOS 16+)](#3-navigation-ios-16)
4. [Sheets, Popovers & Alerts](#4-sheets-popovers--alerts)
5. [Performance Patterns](#5-performance-patterns)
6. [Layout Best Practices](#6-layout-best-practices)
7. [Swift Charts](#7-swift-charts)
8. [Accessibility](#8-accessibility)
9. [macOS Scenes](#9-macos-scenes)
10. [iOS 26 Liquid Glass & New APIs](#10-ios-26-liquid-glass--new-apis)
11. [Code Review Checklist](#11-code-review-checklist)

---

## 1. State Wrapper Selection

| Wrapper | Scope | Mutates | When to Use |
|---|---|---|---|
| `@State` | Local to view | Yes | Transient UI state (isPresented, selectedTab) |
| `@Binding` | Passed in | Yes | Two-way child↔parent channel |
| `@Environment` | Injected by ancestor | No (unless @Observable) | App-wide services, theme, locale |
| `@Observable` | ViewModel / Model | Yes | Complex app state; replaces ObservableObject |
| `@ObservableObject` | ViewModel (Combine) | Yes | Existing Combine-based code |
| `@AppStorage` | UserDefaults-backed | Yes | Simple persistent preferences |
| `@SceneStorage` | Scene-scoped restore | Yes | UI state across app launches |

### @Observable migration from ObservableObject
```swift
// Before (ObservableObject)
class FeedViewModel: ObservableObject {
    @Published var posts: [Post] = []
}

// After (@Observable — Swift 5.9+)
@Observable final class FeedViewModel {
    var posts: [Post] = []   // No @Published needed
}

// Usage in view — no @StateObject / @ObservedObject needed
struct FeedView: View {
    @State private var viewModel = FeedViewModel()
    var body: some View { ... }
}
```

---

## 2. View Composition & Architecture

### Rules
- Keep `View.body` ≤ ~40 lines; extract logical groups into private `var` computed props or
  dedicated `View` structs.
- No networking, no CoreData fetch, no heavy computation inside `body`.
- All side-effect triggers go via `.task`, `.onAppear` (sparingly), or `.onChange`.

### Preferred structure
```swift
struct ArticleDetailView: View {
    @State private var viewModel: ArticleDetailViewModel

    var body: some View {
        ScrollView {
            headerSection
            bodySection
            relatedSection
        }
        .task { await viewModel.load() }
        .navigationTitle(viewModel.title)
    }

    private var headerSection: some View { ... }
    private var bodySection: some View { ... }
    private var relatedSection: some View { ... }
}
```

### @Animatable custom views
```swift
struct ScoreRing: View, Animatable {
    var animatableData: Double
    var progress: Double {
        get { animatableData }
        set { animatableData = newValue }
    }
    var body: some View {
        Circle().trim(from: 0, to: progress).stroke(lineWidth: 8)
    }
}
```

---

## 3. Navigation (iOS 16+)

### NavigationStack (preferred)
```swift
@Observable final class Router {
    var path = NavigationPath()
}

struct RootView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView()
                .navigationDestination(for: Article.self) { ArticleDetailView(article: $0) }
                .navigationDestination(for: UserProfile.self) { ProfileView(profile: $0) }
        }
        .environment(router)
    }
}
```

### Deep-linking
```swift
.onOpenURL { url in
    guard let destination = router.destination(from: url) else { return }
    router.path.append(destination)
}
```

### Tab navigation (iOS 18+)
```swift
TabView(selection: $selectedTab) {
    Tab("Home", systemImage: "house", value: .home) { HomeView() }
    Tab("Search", systemImage: "magnifyingglass", value: .search) { SearchView() }
}
```

---

## 4. Sheets, Popovers & Alerts

### Type-safe sheet state (SwiftUINavigation — Point-Free)
```swift
import SwiftUINavigation

@Observable final class ListViewModel {
    var destination: Destination?

    enum Destination {
        case detail(Article)
        case confirmDelete(Article)
    }
}

struct ListView: View {
    @State var model = ListViewModel()

    var body: some View {
        List { ... }
        .sheet(item: $model.destination) { destination in
            switch destination {
            case .detail(let article): ArticleDetailView(article: article)
            case .confirmDelete(let article): ConfirmDeleteView(article: article)
            }
        }
    }
}
```

### Alert with actions
```swift
.alert("Delete Article?", isPresented: $showDeleteAlert, presenting: articleToDelete) { article in
    Button("Delete", role: .destructive) { viewModel.delete(article) }
    Button("Cancel", role: .cancel) { }
} message: { article in
    Text(""\(article.title)" will be permanently removed.")
}
```

---

## 5. Performance Patterns

### Equatable to prevent re-renders
```swift
struct ExpensiveRowView: View, Equatable {
    let item: Item
    var body: some View { ... }
}
// SwiftUI skips body re-evaluation when item is unchanged
```

### Lazy containers for large data
```swift
// Use LazyVStack/LazyHStack for > ~20 items
ScrollView {
    LazyVStack(spacing: 12) {
        ForEach(articles) { ArticleRowView(article: $0) }
    }
}
// Use List for built-in diff-based updates and cell reuse
List(articles) { ArticleRowView(article: $0) }
```

### Avoiding identity changes
```swift
// BAD: new closure instance on each render causes identity diff
.onTapGesture { viewModel.toggle() }   // OK — SwiftUI doesn't diff closures

// BAD: inline computed container
var body: some View {
    VStack { ... }  // VStack is value type, identity is stable
}
// Avoid computed property that returns a new container type each time
```

### drawingGroup() for complex 2D
```swift
// Composites the view hierarchy into a Metal texture
complexAnimationView
    .drawingGroup()
```

---

## 6. Layout Best Practices

### Prefer `.frame` with alignment over explicit sizing
```swift
// Flexible width, fixed height
.frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
```

### Dynamic Type support
```swift
// Always support Dynamic Type
Text(article.title)
    .font(.headline)
    .lineLimit(nil)    // Don't clamp accessibility sizes

// For custom fonts
@ScaledMetric private var iconSize: CGFloat = 24
```

### Safe area and keyboard avoidance
```swift
.ignoresSafeArea(.keyboard, edges: .bottom)  // Only when intentional
.safeAreaInset(edge: .bottom) { BottomBar() }
```

---

## 7. Swift Charts

```swift
import Charts

Chart(salesData) { point in
    BarMark(
        x: .value("Month", point.month),
        y: .value("Revenue", point.revenue)
    )
    .foregroundStyle(by: .value("Category", point.category))
}
.chartXAxis {
    AxisMarks(values: .stride(by: .month)) { value in
        AxisGridLine()
        AxisTick()
        AxisValueLabel(format: .dateTime.month(.abbreviated))
    }
}
.chartYAxis {
    AxisMarks(position: .leading)
}
.chartLegend(position: .top)
```

### Scrollable chart (iOS 17+)
```swift
Chart { ... }
    .chartScrollableAxes(.horizontal)
    .chartXVisibleDomain(length: 7 * 24 * 3600)  // 7-day window
```

---

## 8. Accessibility

**Non-negotiable modifiers:**
```swift
Image(systemName: "heart.fill")
    .accessibilityLabel("Like")
    .accessibilityAddTraits(.isButton)

Button(action: submit) {
    Text("Submit")
}
.accessibilityHint("Submits the form and navigates to confirmation")

// Group decorative elements
HStack {
    Image(systemName: "star.fill").accessibilityHidden(true)
    Text("Favorites")
}
.accessibilityElement(children: .combine)
```

**VoiceOver navigation order:**
```swift
.accessibilitySortPriority(1)  // higher = read first
```

**Dynamic Type audit:**
- Test with "Accessibility Inspector → Font size" at smallest and largest settings.
- Any `font(.system(size:))` with a fixed size is a regression unless `.relativeTo:` is specified.

---

## 9. macOS Scenes

```swift
@main struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 1000, height: 700)
        .commands {
            CommandGroup(after: .newItem) {
                Button("Import…") { openImport() }.keyboardShortcut("I")
            }
        }

        Settings {
            SettingsView()
        }
    }
}
```

### Multiple windows
```swift
@Environment(\.openWindow) private var openWindow

Button("Open Inspector") {
    openWindow(id: "inspector")
}
```

---

## 10. iOS 26 Liquid Glass & New APIs

### Liquid Glass material (iOS 26+)
```swift
// Apply Liquid Glass background
.glassBackgroundEffect()

// Custom glass container
ZStack {
    content
}
.containerBackground(.glass, for: .navigation)
```

### Adaptive presentation (iOS 26+)
- Use `.presentationSizing(.form)` for form sheets that adapt between phone and iPad.
- `NavigationSplitView` adapts automatically; prefer it over manual split logic.

### Important: Deprecation-aware API choices
| Deprecated | Modern Replacement |
|---|---|
| `NavigationView` | `NavigationStack` / `NavigationSplitView` |
| `@StateObject` with ObservableObject | `@State` with `@Observable` |
| `.onChange(of:)` (iOS 16 form) | `.onChange(of:initial:)` (iOS 17+) |
| `List.init(_:id:)` with closure | `List(_:)` with `Identifiable` |

---

## 11. Code Review Checklist

- [ ] `@State` not used to hold reference types that should be `@Observable`
- [ ] No `AnyView` type-erased containers in hot paths (breaks diffing)
- [ ] `ForEach` always has a stable `id` — never `\.self` on mutable types
- [ ] No `.environmentObject` (legacy) mixed with `.environment` (`@Observable`) without intent
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Charts have `.chartAccessibilityLabel` or `accessibilityHidden(true)` with a text summary
- [ ] Navigation destinations are type-safe (not string-based)
- [ ] Sheets/alerts use `item:` binding (not Boolean + optional) for safety
