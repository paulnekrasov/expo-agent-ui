# Platform Frameworks Reference
_StoreKit 2 · SwiftData · CloudKit · WidgetKit · Live Activities · visionOS · Foundation Models_

## Table of Contents
1. [StoreKit 2](#1-storekit-2)
2. [SwiftData](#2-swiftdata)
3. [Core Data (CloudKit sync)](#3-core-data-cloudkit-sync)
4. [WidgetKit](#4-widgetkit)
5. [Live Activities (ActivityKit)](#5-live-activities-activitykit)
6. [visionOS Basics](#6-visionos-basics)
7. [Foundation Models (iOS 26+)](#7-foundation-models-ios-26)
8. [HealthKit Quick Patterns](#8-healthkit-quick-patterns)
9. [MapKit Modern API](#9-mapkit-modern-api)
10. [Framework Selection Matrix](#10-framework-selection-matrix)

---

## 1. StoreKit 2

### Product loading and purchase flow
```swift
import StoreKit

@Observable final class StoreViewModel {
    var products: [Product] = []
    var purchasedIDs: Set<String> = []

    func loadProducts(ids: [String]) async {
        do {
            products = try await Product.products(for: ids)
        } catch {
            print("Product load failed: \(error)")
        }
    }

    func purchase(_ product: Product) async throws {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            purchasedIDs.insert(product.id)
        case .userCancelled, .pending:
            break
        @unknown default:
            break
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw StoreError.failedVerification
        case .verified(let payload): return payload
        }
    }
}
```

### Listening to transaction updates
```swift
// In App or Scene — runs for the lifetime of the app
Task {
    for await result in Transaction.updates {
        if let transaction = try? result.payloadValue {
            await transaction.finish()
            await updatePurchasedProducts()
        }
    }
}
```

### Restoring purchases
```swift
// iOS 15+ — explicit restore is rarely needed; Transaction.currentEntitlements covers most cases
try await AppStore.sync()
```

### Entitlement check on launch
```swift
func refreshEntitlements() async {
    for await result in Transaction.currentEntitlements {
        if let transaction = try? result.payloadValue {
            purchasedIDs.insert(transaction.productID)
        }
    }
}
```

---

## 2. SwiftData

### Model definition
```swift
import SwiftData

@Model
final class Article {
    var id: UUID
    var title: String
    var body: String
    var createdAt: Date
    var tags: [Tag]

    init(title: String, body: String) {
        self.id = UUID()
        self.title = title
        self.body = body
        self.createdAt = Date()
        self.tags = []
    }
}

@Model
final class Tag {
    var name: String
    @Relationship(inverse: \Article.tags) var articles: [Article]
    init(name: String) { self.name = name }
}
```

### App setup
```swift
@main struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Article.self, Tag.self])
    }
}
```

### Querying
```swift
struct ArticleListView: View {
    @Query(sort: \Article.createdAt, order: .reverse) private var articles: [Article]
    @Environment(\.modelContext) private var context

    var body: some View {
        List(articles) { article in
            Text(article.title)
                .swipeActions { Button("Delete", role: .destructive) { context.delete(article) } }
        }
    }
}
```

### Filtered query
```swift
@Query(filter: #Predicate<Article> { $0.tags.contains { $0.name == "Swift" } },
       sort: \.createdAt)
private var swiftArticles: [Article]
```

### Background operations
```swift
// Create a background context for heavy operations
let backgroundContext = ModelContext(modelContainer)
backgroundContext.autosaveEnabled = false
// ... mutations ...
try backgroundContext.save()
```

---

## 3. Core Data (CloudKit Sync)

### NSPersistentCloudKitContainer setup
```swift
lazy var persistentContainer: NSPersistentCloudKitContainer = {
    let container = NSPersistentCloudKitContainer(name: "MyApp")
    container.loadPersistentStores { _, error in
        if let error { fatalError("Core Data failed: \(error)") }
    }
    container.viewContext.automaticallyMergesChangesFromParent = true
    container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    return container
}()
```

### Background context pattern
```swift
func importData(_ records: [Record]) async {
    let context = persistentContainer.newBackgroundContext()
    context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    await context.perform {
        for record in records {
            let entity = ManagedRecord(context: context)
            entity.update(from: record)
        }
        try? context.save()
    }
}
```

---

## 4. WidgetKit

### Timeline provider
```swift
struct ArticleProvider: TimelineProvider {
    func placeholder(in context: Context) -> ArticleEntry {
        ArticleEntry(date: Date(), article: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (ArticleEntry) -> Void) {
        Task {
            let article = try? await ArticleService.shared.fetchLatest().first
            completion(ArticleEntry(date: Date(), article: article ?? .placeholder))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ArticleEntry>) -> Void) {
        Task {
            let articles = (try? await ArticleService.shared.fetchLatest()) ?? []
            let entries = articles.prefix(5).enumerated().map { index, article in
                ArticleEntry(date: Date().addingTimeInterval(Double(index) * 3600), article: article)
            }
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }
}
```

### Widget definition
```swift
@main struct ArticleWidget: Widget {
    let kind = "ArticleWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ArticleProvider()) { entry in
            ArticleWidgetView(entry: entry)
        }
        .configurationDisplayName("Latest Articles")
        .description("Shows your most recent article.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
    }
}
```

---

## 5. Live Activities (ActivityKit)

### Define attributes
```swift
import ActivityKit

struct DeliveryAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var estimatedArrival: Date
    }
    var orderId: String
    var restaurantName: String
}
```

### Start activity
```swift
let initialState = DeliveryAttributes.ContentState(
    status: "Preparing",
    estimatedArrival: Date().addingTimeInterval(1800)
)
let content = ActivityContent(state: initialState, staleDate: Date().addingTimeInterval(3600))

let activity = try Activity.request(
    attributes: DeliveryAttributes(orderId: "123", restaurantName: "Pizza Palace"),
    content: content,
    pushType: .token
)
```

### Update activity
```swift
let updatedState = DeliveryAttributes.ContentState(status: "On the way", estimatedArrival: Date().addingTimeInterval(600))
await activity.update(ActivityContent(state: updatedState, staleDate: nil))
```

---

## 6. visionOS Basics

### RealityKit 3D content
```swift
import RealityKit
import SwiftUI

struct ImmersiveView: View {
    var body: some View {
        RealityView { content in
            let sphere = ModelEntity(
                mesh: .generateSphere(radius: 0.1),
                materials: [SimpleMaterial(color: .blue, isMetallic: true)]
            )
            sphere.position = [0, 1.5, -1]
            content.add(sphere)
        }
    }
}
```

### Window styles
```swift
@main struct VisionApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .windowStyle(.plain)          // Flat 2D window

        ImmersiveSpace(id: "MainSpace") {
            ImmersiveView()
        }
        .immersionStyle(selection: .constant(.mixed), in: .mixed)
    }
}
```

### Ornaments
```swift
.ornament(attachmentAnchor: .scene(.bottom)) {
    HStack { ... }
        .glassBackgroundEffect()
}
```

---

## 7. Foundation Models (iOS 26+)

Foundation Models provides on-device language model inference via Apple Intelligence.

```swift
import FoundationModels

// Basic text generation
let model = SystemLanguageModel.default

guard model.availability == .available else { return }

let session = LanguageModelSession()
let response = try await session.respond(to: "Summarize this article in one sentence: \(article.body)")
print(response.content)
```

### Structured output
```swift
@Generable
struct ArticleSummary {
    @Guide("A one-sentence summary of the article")
    var summary: String

    @Guide("3-5 key tags for the article")
    var tags: [String]
}

let session = LanguageModelSession()
let summary: ArticleSummary = try await session.respond(
    to: "Analyze this article: \(article.body)",
    generating: ArticleSummary.self
)
```

### Streaming responses
```swift
let stream = session.streamResponse(to: prompt)
for try await partial in stream {
    await MainActor.run { displayText += partial }
}
```

**Availability check:** Always verify `SystemLanguageModel.default.availability == .available`
before use — Foundation Models requires Apple Intelligence (iPhone 15 Pro or later, opt-in).

---

## 8. HealthKit Quick Patterns

### Request authorization
```swift
let typesToRead: Set = [HKQuantityType(.stepCount), HKQuantityType(.heartRate)]
let typesToWrite: Set = [HKQuantityType(.stepCount)]

try await HKHealthStore().requestAuthorization(toShare: typesToWrite, read: typesToRead)
```

### Query step count
```swift
let query = HKStatisticsQuery(
    quantityType: HKQuantityType(.stepCount),
    quantitySamplePredicate: HKQuery.predicateForSamples(withStart: startDate, end: Date()),
    options: .cumulativeSum
) { _, result, _ in
    let steps = result?.sumQuantity()?.doubleValue(for: .count()) ?? 0
    print("Steps: \(steps)")
}
HKHealthStore().execute(query)
```

---

## 9. MapKit Modern API

### SwiftUI Map (iOS 17+)
```swift
import MapKit

struct LocationMapView: View {
    @State private var position = MapCameraPosition.region(
        MKCoordinateRegion(center: .applePark, latitudinalMeters: 1000, longitudinalMeters: 1000)
    )

    var body: some View {
        Map(position: $position) {
            Annotation("Apple Park", coordinate: .applePark) {
                Image(systemName: "building.2")
                    .foregroundStyle(.blue)
            }
            UserAnnotation()
        }
        .mapStyle(.standard(elevation: .realistic))
        .mapControls {
            MapUserLocationButton()
            MapCompass()
        }
    }
}
```

---

## 10. Framework Selection Matrix

| Need | Framework | Notes |
|---|---|---|
| In-app purchases | StoreKit 2 | Async API, built-in verification |
| Local relational data (new app) | SwiftData | iOS 17+ only |
| Local data + iCloud sync | Core Data + NSPersistentCloudKitContainer | Mature, complex |
| Home screen widgets | WidgetKit | Timelines, families |
| Persistent notifications + Dynamic Island | ActivityKit | iOS 16.2+ |
| Spatial / immersive UI | RealityKit + SwiftUI | visionOS required for immersive spaces |
| On-device AI text generation | Foundation Models | iOS 26+, Apple Intelligence |
| Health data | HealthKit | Requires entitlement + privacy strings |
| Maps | MapKit (SwiftUI Map) | iOS 17+ for full SwiftUI API |
| Location | CoreLocation | Request `always` auth only when truly needed |
