# SwiftUI Preview Engine Pipeline: Deep Research Report

**The SwiftUI preview engine is a sophisticated multi-stage pipeline that compiles, injects, and renders SwiftUI views through AST extraction, dynamic library swizzling, layout negotiation, and Core Animation rendering.** All five test fixtures are syntactically valid for iOS 16+ but share a critical gap: they must use `PreviewProvider` (not `#Preview`) since the `#Preview` macro requires iOS 17+. The pipeline's four stages — AST extraction, layout, rendering, and state/binding — each have distinct behaviors and edge cases that the fixtures should stress-test more aggressively, particularly around `_ConditionalContent` branching, `NavigationPath` type-erased routing, and custom `ViewModifier` resolution.

This report covers fixture validation with corrected code, a four-stage pipeline deep dive, and recommendations for expanding the test suite to cover critical missing patterns like `GeometryReader`, `LazyVGrid`, modal presentation, and `@EnvironmentObject`.

---

## Fixture validation and critique

### Fixture 1: SimpleVStack.swift — ✅ Valid, minor gaps

All described APIs (`VStack`, `Text`, `Button`, modifier chains, `@State`) have been available since SwiftUI 1.0 (iOS 13+). No iOS 16-specific concerns. The fixture adequately stress-tests basic VStack layout and modifier chain extraction in the AST.

**Gaps identified:** No `Spacer()` usage (a critical VStack pattern that tests flexible space distribution), no nested stacks (HStack within VStack), and no accessibility modifiers. The modifier chain should include at least one compound modifier like `.background(RoundedRectangle(cornerRadius:).fill(...))` to stress nested call expressions in the AST.

**Improved implementation:**

```swift
import SwiftUI

struct SimpleVStack: View {
    @State private var count: Int = 0
    @State private var isHighlighted: Bool = false

    var body: some View {
        VStack(alignment: .center, spacing: 16) {
            Text("Counter: \(count)")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(isHighlighted ? .orange : .primary)
                .padding(.horizontal, 20)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.blue.opacity(0.1))
                )

            Spacer().frame(height: 8)

            HStack {
                Image(systemName: "hand.tap.fill")
                Text("Tap the button below")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .italic()
            }

            Button(action: {
                count += 1
                isHighlighted.toggle()
            }) {
                Label("Increment", systemImage: "plus.circle.fill")
                    .font(.headline)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
        }
        .padding()
    }
}

struct SimpleVStack_Previews: PreviewProvider {
    static var previews: some View {
        SimpleVStack()
    }
}
```

### Fixture 2: ListWithForEach.swift — ⚠️ Valid, but must use NavigationStack

The critical concern is that `NavigationView` is **deprecated in iOS 16**. This fixture must wrap its `List` in `NavigationStack`, not `NavigationView`. The `NavigationLink { destination } label: { }` trailing-closure syntax is the correct iOS 16+ pattern. `ForEach` with `id: \.name` on a tuple array stresses the key-path identity extraction in the AST.

**Gaps identified:** No `Section` within the List, no `onDelete`/`onMove` editing modifiers, no test of `ForEach` with `Identifiable` conformance (only `id:` parameter), no `.swipeActions` (iOS 15+).

**Improved implementation:**

```swift
import SwiftUI

struct ListWithForEach: View {
    private let items: [(name: String, icon: String)] = [
        ("Inbox", "tray.fill"),
        ("Sent", "paperplane.fill"),
        ("Drafts", "doc.fill"),
        ("Trash", "trash.fill"),
        ("Archive", "archivebox.fill")
    ]

    var body: some View {
        NavigationStack {
            List {
                Section("Mailboxes") {
                    ForEach(items, id: \.name) { item in
                        NavigationLink {
                            Text("Detail for \(item.name)")
                                .font(.title)
                                .navigationTitle(item.name)
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: item.icon)
                                    .foregroundColor(.accentColor)
                                    .frame(width: 28)
                                Text(item.name)
                                    .font(.body)
                            }
                            .padding(.vertical, 4)
                        }
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) { } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Mailboxes")
        }
    }
}

struct ListWithForEach_Previews: PreviewProvider {
    static var previews: some View {
        ListWithForEach()
    }
}
```

### Fixture 3: FormWithControls.swift — ✅ Valid, strongest stress-tester

This is the most complex fixture and the strongest stress-test for the pipeline. It exercises `_ConditionalContent` (the `if notificationsEnabled` branch), multiple `@State` bindings, and Form's inset-grouped layout. The combination of `Toggle`, `Slider`, `Picker`, and `TextField` covers most of SwiftUI's built-in control bindings.

**One nuance:** In iOS 16, `Picker` inside a `Form` defaults to `.menu` style. To test navigation-based picker layout, add `.pickerStyle(.navigationLink)`.

**Gaps identified:** No `Stepper`, no `DatePicker`, no `LabeledContent` (iOS 16+ static display rows), no `disabled()` modifier, and no Section `footer:` parameter.

**Improved implementation:**

```swift
import SwiftUI

struct FormWithControls: View {
    @State private var username: String = ""
    @State private var notificationsEnabled: Bool = true
    @State private var volume: Double = 0.5
    @State private var selectedColor: String = "Red"
    @State private var agreedToTerms: Bool = false

    private let themes = ["Red", "Green", "Blue", "Purple"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    TextField("Username", text: $username)
                        .textContentType(.username)
                        .autocorrectionDisabled()

                    if !username.isEmpty {
                        LabeledContent("Greeting", value: "Welcome, \(username)!")
                    }
                }

                Section("Preferences") {
                    Toggle(isOn: $notificationsEnabled) {
                        Label("Notifications", systemImage: "bell.fill")
                    }

                    if notificationsEnabled {
                        Slider(value: $volume, in: 0...1, step: 0.1) {
                            Text("Volume")
                        }
                        Text("Volume: \(Int(volume * 100))%")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Picker("Theme", selection: $selectedColor) {
                        ForEach(themes, id: \.self) { theme in
                            Text(theme).tag(theme)
                        }
                    }
                }

                Section {
                    Toggle("I agree to the terms", isOn: $agreedToTerms)
                } footer: {
                    Text("You must agree to continue.")
                        .font(.footnote)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

struct FormWithControls_Previews: PreviewProvider {
    static var previews: some View {
        FormWithControls()
    }
}
```

### Fixture 4: NavigationStackPush.swift — ✅ Valid, should add NavigationPath

All APIs are correctly iOS 16+. The fixture should use `NavigationStack(path:)` with `NavigationPath` for type-erased programmatic navigation — this is the marquee iOS 16 navigation feature and the primary reason `NavigationStack` replaced `NavigationView`.

**Gaps identified:** No `NavigationPath` usage, no `.navigationDestination(for:)` value-based routing, no `.toolbarBackground(.visible, for: .navigationBar)` (iOS 16+), no `NavigationSplitView`.

**Improved implementation:**

```swift
import SwiftUI

struct NavigationStackPush: View {
    @State private var path = NavigationPath()
    @State private var itemCount: Int = 5

    var body: some View {
        NavigationStack(path: $path) {
            List(1...itemCount, id: \.self) { index in
                NavigationLink(value: index) {
                    Label("Item \(index)", systemImage: "\(index).circle.fill")
                }
            }
            .navigationTitle("Items")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        itemCount += 1
                    } label: {
                        Image(systemName: "plus")
                    }
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    EditButton()
                }
            }
            .navigationDestination(for: Int.self) { value in
                VStack(spacing: 20) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.yellow)
                    Text("Detail for Item \(value)")
                        .font(.title)
                    Button("Pop to Root") {
                        path = NavigationPath()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .navigationTitle("Item \(value)")
                .navigationBarTitleDisplayMode(.inline)
            }
        }
    }
}

struct NavigationStackPush_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStackPush()
    }
}
```

### Fixture 5: TabViewWithBadges.swift — ✅ Valid, add selection binding + tag

The fixture correctly targets iOS 16+ APIs. The `.badge()` modifier is iOS 15+. The key improvement is adding `TabView(selection: $selectedTab)` with `.tag()` on each tab content view — this exercises the `@State` selection binding that drives programmatic tab switching and stresses the state/binding pipeline stage.

**Gaps identified:** No `TabView(selection:)` with `.tag()`, no testing of `.badge(0)` (should hide badge) vs `.badge(nil)`, no `.tabViewStyle(.page)` variant.

**Improved implementation:**

```swift
import SwiftUI

struct TabViewWithBadges: View {
    @State private var selectedTab: Int = 0
    @State private var messageCount: Int = 3
    @State private var showOverlay: Bool = false

    var body: some View {
        TabView(selection: $selectedTab) {
            ZStack {
                Color.blue.opacity(0.1).ignoresSafeArea()
                VStack {
                    Image(systemName: "house.fill")
                        .font(.largeTitle)
                    Text("Home Tab")
                        .font(.headline)
                }
            }
            .tabItem { Label("Home", systemImage: "house") }
            .tag(0)

            Text("Messages")
                .font(.title)
                .overlay(alignment: .topTrailing) {
                    if messageCount > 0 {
                        Circle()
                            .fill(.red)
                            .frame(width: 24, height: 24)
                            .overlay {
                                Text("\(messageCount)")
                                    .font(.caption2)
                                    .foregroundColor(.white)
                            }
                    }
                }
            .tabItem { Label("Messages", systemImage: "message") }
            .badge(messageCount)
            .tag(1)

            VStack {
                Text("Settings")
                Button("Reset Badges") { messageCount = 0 }
                    .buttonStyle(.bordered)
            }
            .tabItem { Label("Settings", systemImage: "gear") }
            .badge("New")
            .tag(2)
        }
    }
}

struct TabViewWithBadges_Previews: PreviewProvider {
    static var previews: some View {
        TabViewWithBadges()
    }
}
```

---

## Pipeline deep dive: AST extraction

### How trailing closures and modifier chains are represented

The Swift AST (as parsed by `SwiftSyntax`) represents every SwiftUI view constructor as a `FunctionCallExprSyntax` node. A trailing closure like `VStack { Text("Hello") }` appears with the `calledExpression` set to `DeclReferenceExprSyntax("VStack")` and the `trailingClosure` set to a `ClosureExprSyntax` containing the child views. When parentheses are omitted (no explicit parameters before the closure), both `leftParen` and `rightParen` are `nil`.

**Modifier chains are nested inside-out.** For `Text("Hello").font(.title).padding()`, the AST is:

```
FunctionCallExprSyntax (.padding())
├── calledExpression: MemberAccessExprSyntax
│   ├── base: FunctionCallExprSyntax (.font(.title))
│   │   ├── calledExpression: MemberAccessExprSyntax
│   │   │   ├── base: FunctionCallExprSyntax (Text("Hello"))
│   │   │   └── declName: "font"
│   │   └── arguments: [MemberAccessExprSyntax(.title)]
│   └── declName: "padding"
└── arguments: []
```

Each modifier call wraps the previous expression. The `MemberAccessExprSyntax` node connects the chain via its `base` property (the preceding expression) and `declName` (the modifier name). An extractor must recursively walk the `base` chain to recover the original view and all applied modifiers.

### ForEach with id: parameter vs Identifiable conformance

Both forms produce `FunctionCallExprSyntax` nodes, but with different argument structures. `ForEach(items) { item in ... }` has a single unlabeled argument in its `LabeledExprListSyntax`. `ForEach(items, id: \.self) { item in ... }` has two arguments: the unlabeled data source and a labeled `id:` argument containing a `KeyPathExprSyntax`. At the type level, both resolve to `ForEach<Data, ID, Content>` but the extractor must handle the key-path syntax (`\.self` vs `\.someProperty`) as a distinct AST node type. **SwiftSyntax operates at the syntactic level only** — it cannot resolve whether a type conforms to `Identifiable`, so the extractor must handle both argument patterns explicitly.

### Conditional views become _ConditionalContent in the AST

The `@ViewBuilder` result builder (formalized in SE-0289) transforms `if/else` branches using `buildEither(first:)` and `buildEither(second:)`, producing a return type of `_ConditionalContent<TrueContent, FalseContent>`. An `if` without `else` uses `buildOptional(_:)`, producing `Optional<Content>`. For the extractor, the critical insight is that the **source-level AST still contains `IfExprSyntax`** nodes — the result builder transformation happens during type-checking, not parsing. So a syntax-only extractor sees `if/else` branches, not `buildEither` calls. A fully type-checked AST (via SourceKit or the compiler's SIL) would show the transformed calls.

### Preview thunks and __designTimeSelection

Xcode generates `.preview-thunk.swift` derived source files that wrap **every expression** in `__designTimeSelection` and `__designTimeString`/`__designTimeFloat`/`__designTimeBoolean`/`__designTimeInteger` calls. These wrappers encode AST path identifiers (e.g., `"#7464.[1].[0].property.[0].[0]"`) that enable Xcode to target specific expressions for live editing. The compiler uses special flags: **`-enable-implicit-dynamic`** makes all functions swizzlable, and **`-enable-private-imports`** lets preview thunks access private entities. The thunk is compiled into a `.preview-thunk.dylib` loaded via `dlopen()`, using `@_dynamicReplacement(for:)` to swap the original `body` implementation.

### #Preview macro expansion

The `#Preview` macro (Swift 5.9 / Xcode 15) is a `@freestanding(declaration)` macro that expands to a `PreviewProvider`-conforming struct annotated with `@available(iOS 17.0, ...)`. This is why `#Preview` **cannot be used in projects targeting iOS 16** — the expanded code's availability annotation causes compilation errors. Apple has confirmed this as a known limitation. For iOS 16+ targeting, **`PreviewProvider` is mandatory**.

---

## Pipeline deep dive: layout engine

### The two-phase layout negotiation

SwiftUI's layout operates through **propose → report → place**. The parent proposes a `ProposedViewSize` to each child. The child chooses its own size (children **always** control their own size — the parent cannot override). The parent then places each child within its coordinate space. The `Layout` protocol (iOS 16+) formalizes this with `sizeThatFits(proposal:subviews:cache:)` and `placeSubviews(in:proposal:subviews:cache:)`.

`ProposedViewSize` encodes four semantic values through its optional `CGFloat` dimensions:

- **Concrete value** (e.g., `45.0`): "Here is exactly this much space"
- **Zero** (`0.0`): "What is your minimum size?"
- **Infinity** (`.infinity`): "What is your maximum size?"
- **nil** (`.unspecified`): "What is your ideal size?"

### How VStack distributes space

VStack and HStack use an identical algorithm (axes swapped). Children are **grouped by `layoutPriority`** (higher priority = proposed first with all remaining space). Within each priority group, children are **sorted by flexibility** — defined as `maxSize - minSize` (probed by sending `.infinity` and `0` proposals). **Least flexible children are proposed first**, each receiving `remainingSpace / remainingChildren`. After each child responds, its actual size is subtracted from remaining space. This is a **single-pass greedy algorithm**, not constraint optimization — it can produce overflow if inflexible children exceed available space. Default inter-view spacing is platform-dependent and varies by adjacent view type; `Spacer` has a minimum of **8 points** in the stack direction.

### Container-specific layout behaviors

**List** rows are self-sizing with a minimum height controlled by `defaultMinListRowHeight` (default **~44pt** on iOS, matching touch-target guidelines). The default style on iOS 15+ is `.insetGrouped`, which renders Section groups as rounded-rectangle cards with **~20pt** horizontal margins from screen edges and **~16pt** horizontal content padding inside rows.

**Form** is essentially a styled `List` with `.insetGrouped` appearance. It automatically adjusts control styling for `Toggle`, `Picker`, `Slider`, and `Button` to fit list-row appearance. Section headers render above the rounded cards in uppercase caption text.

**TabView** consumes **49pt** for the tab bar in iPhone portrait (plus home-indicator area on Face ID devices, totaling ~83pt from bottom). The tab bar height is added to the **bottom safe area inset**. Page-style TabView (`.tabViewStyle(.page)`) removes the tab bar entirely and shows page indicator dots instead. The `.badge()` modifier **does not affect content-area layout** — it only renders on the tab bar chrome itself.

**NavigationStack** adds navigation bar height to the **top safe area inset**: **44pt** for inline title, **96pt** for large title (44pt bar + 52pt large-title area). Large titles collapse to inline on scroll. `.toolbar` bottom items add **~44–49pt** to the bottom safe area.

### Modifier chain layout effects

`.frame(maxWidth: .infinity)` creates a `_FlexFrameLayout` wrapper that **accepts the full proposed width unconditionally** but does not change the child's actual size — the child is centered (by default) or positioned per the `alignment` parameter within the frame. `.padding()` subtracts padding from the proposal before forwarding to its child, then adds it back to the reported size (default **~16pt** per side on iOS). `.overlay()` **does not affect the primary view's sizing** — the overlay's proposed size equals the primary view's size, making it fundamentally different from `ZStack` where all children contribute to container size.

### Layout in previews matches live apps

The SwiftUI layout engine is **identical** in previews and production. No documented discrepancies exist. In device preview mode, the view receives the same proposed size and safe area insets as the selected simulator device. In `.sizeThatFits` preview mode, the canvas shrinks to match the view's reported size but the initial proposal is still the full device size.

---

## Pipeline deep dive: renderer and snapshot output

### How the preview renderer produces output

The preview renderer is not a simple static renderer — it runs a **lightweight simulator process**. Xcode compiles preview thunks into dynamic libraries, launches `XCPreviewAgent` (a dedicated process with bundle ID `com.apple.dt.PreviewAgent.iOS`), loads `_XCPreviewKit` at runtime, and communicates via **XPC**. The rendering follows the full SwiftUI pipeline: `@State` initialization → `body` evaluation → layout pass → diff against previous tree → mapping to `_UIHostingView`/`CALayer` → Core Animation transaction → Metal render.

In Xcode 16+, the architecture was significantly optimized with shared build artifacts via `ENABLE_DEBUG_DYLIB`. The app binary splits into a thin shell executable, `XXX.debug.dylib`, and `__preview.dylib`. A **three-tier rebuild strategy** minimizes recompilation: literal changes (no recompile, `__designTimeString` reads new values), method body changes (only thunk files recompiled), and structural changes (full rebuild).

### Static previews render exactly one pass

For the static canvas (non-interactive), SwiftUI evaluates `body` **once** using `@State` default values, performs layout, and renders to bitmap. There is no ongoing run loop. **Animations are not played** — the initial state is shown. Conditional content (`if/else` in `@ViewBuilder`) renders **only the branch matching the initial state**. If `@State var notificationsEnabled = true`, the `if notificationsEnabled` branch renders; the `else` branch literally does not exist in the rendered tree.

In **Live Preview mode**, a full run loop exists with interactive state mutation, animation interpolation, and continuous `body` re-evaluation — identical to a running app.

### How badges render in snapshots

The `.badge()` modifier on TabView items renders the badge number or string on the tab bar icon in both static and live previews. Both `.badge(Int)` and `.badge(String?)` variants work. `.badge(0)` hides the badge. The badge is rendered as part of UIKit's tab bar chrome, not as a SwiftUI overlay — it appears identically to production.

---

## Pipeline deep dive: state and binding handling

### @State initialization and lifecycle in previews

`@State` values are stored **externally** to the view struct in SwiftUI's hidden state storage, keyed by structural identity. The `wrappedValue` initial value (e.g., `@State var count = 0`) is used only for the **first creation** of the view. In static previews, this means default values always appear. Each preview refresh (triggered by code edits) creates a **brand-new view hierarchy**, resetting all `@State` to defaults.

The `@Previewable` macro (Xcode 16+) enables inline `@State` in `#Preview` blocks by auto-generating a wrapper view:

```swift
#Preview {
    @Previewable @State var count = 0
    CounterView(count: $count)
}
```

However, since `@Previewable` requires `#Preview` which requires iOS 17+, iOS 16-targeting fixtures cannot use this pattern.

### .constant() vs @State-backed bindings

**`.constant(value)` creates a read-only binding that silently discards writes.** It is implemented as `Binding(get: { value }, set: { _ in })`. Interactive controls bound to `.constant()` — Toggles, Sliders, Pickers, TextFields — appear **non-functional** even in Live Preview mode. The toggle won't toggle; the slider won't slide.

For interactive previews with iOS 16 targeting, developers must create a **wrapper view** containing `@State`:

```swift
struct FormPreviewWrapper: View {
    @State private var value = 0.5
    var body: some View {
        Slider(value: $value)
    }
}
```

### Picker with ForEach and @State selection

`Picker(selection: $selectedColor)` requires a `Binding`. The selection value must match the `.tag()` values in the picker's content. With `ForEach(themes, id: \.self) { theme in Text(theme).tag(theme) }`, each item must conform to `Hashable` (which `String` does). The `id: \.self` parameter generates a `KeyPathExprSyntax` in the AST. In static previews, the Picker shows the initial `@State` value; in Live Preview with `@State`-backed binding, selection changes work fully.

### View identity: structural vs explicit

SwiftUI uses **structural identity** by default — a view's identity is its type and position in the hierarchy. `if/else` creates `_ConditionalContent`, giving branches **different structural identities**. Switching branches **destroys and recreates** views (losing `@State`). This is why `if notificationsEnabled { Slider(...) }` in FormWithControls causes the Slider's state to reset each time the toggle changes.

**Explicit identity** via `.id(value)` or `ForEach(id:)` overrides structural identity. Changing an `.id()` value causes full view teardown and recreation. Each modifier in a chain creates a `ModifiedContent<Content, Modifier>` wrapper, producing deeply nested types like `ModifiedContent<ModifiedContent<Text, _PaddingLayout>, _BackgroundStyleModifier<Color>>`.

---

## Suggested additional fixtures

### Fixture 6: GeometryReaderScrollView.swift — Layout engine stress test

**Justification:** `GeometryReader` fundamentally changes layout behavior by acting as a greedy container that proposes its full parent size to children. Combined with `ScrollView`, it creates complex layout negotiations where the scroll content can exceed the visible area. This is one of the most error-prone patterns in SwiftUI and heavily stresses the **layout** pipeline stage.

**Pipeline stage:** Layout (primarily), AST extraction (closure with `GeometryProxy` parameter)

```swift
import SwiftUI

struct GeometryReaderScrollView: View {
    @State private var headerHeight: CGFloat = 200

    var body: some View {
        ScrollView {
            GeometryReader { proxy in
                Image(systemName: "photo.fill")
                    .resizable()
                    .scaledToFill()
                    .frame(width: proxy.size.width,
                           height: max(headerHeight - proxy.frame(in: .global).minY, 100))
                    .clipped()
            }
            .frame(height: headerHeight)

            VStack(spacing: 12) {
                ForEach(0..<10, id: \.self) { index in
                    Text("Row \(index)")
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                }
            }
            .padding()
        }
    }
}

struct GeometryReaderScrollView_Previews: PreviewProvider {
    static var previews: some View {
        GeometryReaderScrollView()
    }
}
```

### Fixture 7: LazyVGridLayout.swift — Grid layout computation stress test

**Justification:** `LazyVGrid` with mixed `GridItem` types (`.flexible()`, `.fixed()`, `.adaptive()`) exercises a fundamentally different layout model than stacks. The column computation algorithm and lazy loading behavior are critical to test. The `GridItem` array also creates a distinct AST pattern with array literal expressions.

**Pipeline stage:** Layout (grid column computation), AST extraction (GridItem array, LazyVGrid initializer)

```swift
import SwiftUI

struct LazyVGridLayout: View {
    @State private var selectedItem: Int? = nil

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(0..<20, id: \.self) { index in
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(selectedItem == index ? Color.blue : Color.gray.opacity(0.2))
                        VStack {
                            Image(systemName: "\(index % 50).circle.fill")
                                .font(.title)
                            Text("Item \(index)")
                                .font(.caption)
                        }
                        .foregroundColor(selectedItem == index ? .white : .primary)
                    }
                    .frame(height: 100)
                    .onTapGesture { selectedItem = index }
                }
            }
            .padding()
        }
    }
}

struct LazyVGridLayout_Previews: PreviewProvider {
    static var previews: some View {
        LazyVGridLayout()
    }
}
```

### Fixture 8: SheetAlertPresentation.swift — Modal rendering path stress test

**Justification:** Modal presentation (`.sheet`, `.alert`, `.confirmationDialog`) renders views **outside the normal hierarchy**. `.presentationDetents` (iOS 16+) is a marquee iOS 16 API. This stresses the **state/binding** stage (isPresented boolean) and the **renderer** (overlay/modal rendering path distinct from inline content).

**Pipeline stage:** State/binding (isPresented Bool), Rendering (modal window), AST extraction (trailing closure modifiers)

```swift
import SwiftUI

struct SheetAlertPresentation: View {
    @State private var showSheet: Bool = false
    @State private var showAlert: Bool = false
    @State private var feedbackText: String = ""

    var body: some View {
        VStack(spacing: 20) {
            Button("Show Half Sheet") { showSheet = true }
                .buttonStyle(.borderedProminent)

            Button("Show Alert") { showAlert = true }
                .buttonStyle(.bordered)
        }
        .sheet(isPresented: $showSheet) {
            VStack {
                Text("Feedback")
                    .font(.headline)
                TextField("Enter feedback", text: $feedbackText)
                    .textFieldStyle(.roundedBorder)
                    .padding()
                Button("Dismiss") { showSheet = false }
            }
            .presentationDetents([.medium, .large])
        }
        .alert("Confirm Action", isPresented: $showAlert) {
            Button("OK", role: .cancel) { }
            Button("Delete", role: .destructive) { }
        } message: {
            Text("This action cannot be undone.")
        }
    }
}

struct SheetAlertPresentation_Previews: PreviewProvider {
    static var previews: some View {
        SheetAlertPresentation()
    }
}
```

### Fixture 9: CustomViewModifierEnvironment.swift — AST modifier resolution stress test

**Justification:** Custom `ViewModifier` conformances create a separate struct the AST extractor must resolve through `.modifier()` calls or `View` extension wrappers. Combined with `@EnvironmentObject`, this fixture tests dependency injection resolution — a common source of preview crashes when environment objects aren't provided.

**Pipeline stage:** AST extraction (ViewModifier struct, View extension), State/binding (@EnvironmentObject resolution)

```swift
import SwiftUI

class AppSettings: ObservableObject {
    @Published var accentColorName: String = "Blue"
    @Published var isCompactMode: Bool = false
}

struct CardStyle: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    func body(content: Content) -> some View {
        content
            .padding()
            .background(colorScheme == .dark ? Color.gray.opacity(0.3) : Color.white)
            .cornerRadius(12)
            .shadow(radius: colorScheme == .dark ? 0 : 4)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

struct CustomViewModifierEnvironment: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: 16) {
            Text("Theme: \(settings.accentColorName)")
                .font(settings.isCompactMode ? .caption : .title)
                .cardStyle()

            Text("Scheme: \(colorScheme == .dark ? "Dark" : "Light")")
                .cardStyle()
        }
        .padding()
    }
}

struct CustomViewModifierEnvironment_Previews: PreviewProvider {
    static var previews: some View {
        CustomViewModifierEnvironment()
            .environmentObject(AppSettings())
    }
}
```

### Fixture 10: SearchableCharts.swift — External framework + modifier injection stress test

**Justification:** `.searchable(text:)` injects a search bar into the `NavigationStack` chrome without appearing in the view builder hierarchy — a fundamentally different modifier pattern. Adding `Chart` from the Charts framework (iOS 16+) tests external framework import handling and a domain-specific builder DSL (`BarMark`, `LineMark`) distinct from standard `@ViewBuilder`.

**Pipeline stage:** AST extraction (Charts DSL, separate import), Layout (search bar injection), State/binding (filtered data)

```swift
import SwiftUI
import Charts

struct SearchableCharts: View {
    @State private var searchText: String = ""

    private let data: [(category: String, value: Double)] = [
        ("Swift", 85), ("Kotlin", 72), ("Rust", 68),
        ("Python", 90), ("TypeScript", 78)
    ]

    private var filteredData: [(category: String, value: Double)] {
        searchText.isEmpty ? data : data.filter {
            $0.category.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Chart(filteredData, id: \.category) { item in
                    BarMark(
                        x: .value("Language", item.category),
                        y: .value("Score", item.value)
                    )
                    .foregroundStyle(.blue.gradient)
                }
                .frame(height: 200)

                ForEach(filteredData, id: \.category) { item in
                    LabeledContent(item.category, value: "\(Int(item.value))")
                }
            }
            .navigationTitle("Languages")
            .searchable(text: $searchText, prompt: "Filter languages")
        }
    }
}

struct SearchableCharts_Previews: PreviewProvider {
    static var previews: some View {
        SearchableCharts()
    }
}
```

---

## Recommended improvements to existing fixtures

**Critical fix across all fixtures:** Replace any `#Preview` usage with `PreviewProvider`. The `#Preview` macro expands to `@available(iOS 17.0, ...)` code and **will not compile** in projects targeting iOS 16. Apple has confirmed this as a known limitation with no current workaround.

**Strengthen modifier chain diversity.** At least one fixture should include compound background modifiers (`.background(RoundedRectangle(cornerRadius:).fill(...))`) to stress nested call-expression extraction. Add `.accessibilityLabel()` to at least one fixture — accessibility modifiers are common in production code and generate additional modifier wrapping in the AST.

**Test both ForEach identity patterns.** ListWithForEach uses `id: \.name` (explicit key path), but no fixture tests `Identifiable` protocol conformance (omitting the `id:` parameter). Adding a model struct conforming to `Identifiable` in one fixture would cover this AST variation.

**Add environment-variant previews.** Each `PreviewProvider` should include a `Group` with at least two preview configurations to test pipeline handling of multiple previews:

```swift
struct FormWithControls_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            FormWithControls()
                .previewDisplayName("Light")
            FormWithControls()
                .environment(\.colorScheme, .dark)
                .previewDisplayName("Dark")
        }
    }
}
```

**Expand NavigationStackPush with NavigationPath.** The current fixture likely uses inline `NavigationLink` destinations. Upgrading to `NavigationStack(path: $path)` with `.navigationDestination(for:)` tests the type-erased programmatic navigation that is NavigationStack's primary differentiator from the deprecated `NavigationView`.

**Add `.disabled()` and form validation.** FormWithControls should include a disabled submit button (`.disabled(!agreedToTerms)`) — this tests a modifier that changes rendering without changing layout, exercising the renderer's handling of interactive state modifiers.

---

## Known preview engine failure modes to test against

The preview engine has several documented failure modes relevant to fixture design. **Nested type resolution failures** occur when preview thunks use specific `import struct` statements that can't resolve types without full qualification — avoid referencing nested types like `ContentView.Item` without explicit paths. **Missing `@EnvironmentObject`** causes immediate crashes (not graceful degradation), so any fixture using `@EnvironmentObject` must inject it in the `PreviewProvider`. **Bundle resource failures** crash `XCPreviewAgent` when SPM resources can't be located. **Hardware-dependent APIs** (camera, LiDAR) are unavailable in the preview sandbox.

Xcode 16+ introduced a three-tier rebuild strategy that affects how different code changes trigger recompilation: **literal changes** (strings, numbers) are hot-swapped via `__designTimeString` without recompilation, **method body changes** trigger only thunk recompilation, and **structural changes** (property additions, `@State` changes) force full rebuilds. Fixtures should be designed to test each tier.

---

## References

**WWDC sessions:** WWDC 2022 "Compose custom layouts with SwiftUI" (session 10056) for the Layout protocol. WWDC 2023 "Build programmatic UI with Xcode Previews" (session 10252) for #Preview macro architecture. WWDC 2023 "Demystify SwiftUI performance" for view identity and update coalescing. WWDC 2021 "Write a DSL in Swift using result builders" (session 10253) for @ViewBuilder transformation rules. WWDC 2022 "What's new in SwiftUI" for NavigationStack introduction.

**Swift Evolution proposals:** SE-0289 (Result Builders) formalizes `@resultBuilder` including `buildBlock`, `buildEither`, `buildOptional`, and `buildLimitedAvailability`. SE-0279 (Multiple Trailing Closures) enables labeled trailing closures critical for SwiftUI APIs like `Section(header:content:)`. SE-0382 (Expression Macros) defines the `@freestanding` macro system underpinning `#Preview`.

**Engineering resources:** Guardsquare "Behind SwiftUI Previews" by Damian Malarczyk — definitive reverse-engineering of preview thunk generation and `__designTimeSelection`. fatbobman.com "Building Stable Preview Views" — Xcode 16 architecture with `ENABLE_DEBUG_DYLIB`. onee.me "How SwiftUI Preview Works Under the Hood" — three-tier rebuild strategy analysis. objc.io "How an HStack Lays out Its Children" by Chris Eidhof — canonical explanation of the flexibility-sorting algorithm. swiftui-lab.com "The SwiftUI Layout Protocol" by Javier Nigro — comprehensive `ProposedViewSize` semantics. SwiftUI Field Guide (swiftuifieldguide.com) by Chris Eidhof — interactive layout demonstrations. Swift with Majid "Structural identity in SwiftUI" — `_ConditionalContent` and view identity. swift-ast-explorer.com by @kishikawakatsumi — interactive SwiftSyntax tree visualization. NSHipster "SwiftSyntax" — syntax-only vs semantic parsing distinction.