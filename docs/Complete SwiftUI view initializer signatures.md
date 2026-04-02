# Complete SwiftUI view initializer signatures

Every signature below is sourced from the **`SwiftUI.swiftinterface`** file in the iOS SDK (the canonical compiler-level declarations) and cross-referenced with Apple's developer.apple.com documentation descriptions. Types are shown without module-qualified prefixes (e.g., `Binding` instead of `SwiftUI.Binding`) for readability; the raw interface uses fully-qualified names throughout.

---

## 1. NavigationStack

```swift
@available(iOS 16.0, macOS 13.0, tvOS 16.0, watchOS 9.0, *)
public struct NavigationStack<Data, Root> : View where Root : View
```

**init(root:)** — manages its own navigation state

```swift
public init(
    @ViewBuilder root: () -> Root
) where Data == NavigationPath
```

**init(path:root:)** — heterogeneous path via `NavigationPath`

```swift
public init(
    path: Binding<NavigationPath>,
    @ViewBuilder root: () -> Root
) where Data == NavigationPath
```

**init(path:root:)** — homogeneous typed collection path

```swift
public init(
    path: Binding<Data>,
    @ViewBuilder root: () -> Root
) where Data : MutableCollection,
        Data : RandomAccessCollection,
        Data : RangeReplaceableCollection,
        Data.Element : Hashable
```

All three inits are available **iOS 16.0+, macOS 13.0+, tvOS 16.0+, watchOS 9.0+**. The `root` closure is annotated `@ViewBuilder`. No parameters carry default values.

---

## 2. List

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct List<SelectionValue, Content> : View
    where SelectionValue : Hashable, Content : View
```

**init(content:)** — static content, no selection

```swift
// extension where SelectionValue == Never
public init(@ViewBuilder content: () -> Content)
```

**init(_:rowContent:)** — Identifiable data, no selection

```swift
// extension where SelectionValue == Never
public init<Data, RowContent>(
    _ data: Data,
    @ViewBuilder rowContent: @escaping (Data.Element) -> RowContent
) where Content == ForEach<Data, Data.Element.ID, HStack<RowContent>>,
        Data : RandomAccessCollection,
        RowContent : View,
        Data.Element : Identifiable
```

**init(_:id:rowContent:)** — explicit ID key path, no selection

```swift
// extension where SelectionValue == Never
public init<Data, ID, RowContent>(
    _ data: Data,
    id: KeyPath<Data.Element, ID>,
    @ViewBuilder rowContent: @escaping (Data.Element) -> RowContent
) where Content == ForEach<Data, ID, HStack<RowContent>>,
        Data : RandomAccessCollection,
        ID : Hashable,
        RowContent : View
```

Selection-bearing variants mirror the above with an added `selection: Binding<Set<SelectionValue>>?` or `selection: Binding<SelectionValue?>?` parameter. All forms are **iOS 13.0+, macOS 10.15+, tvOS 13.0+, watchOS 6.0+**. The `rowContent` closure is both `@ViewBuilder` and `@escaping`; the static `content` closure is `@ViewBuilder` only (non-escaping).

---

## 3. ForEach

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct ForEach<Data, ID, Content>
    where Data : RandomAccessCollection, ID : Hashable
```

**init(_:content:)** — Identifiable data

```swift
// extension where ID == Data.Element.ID, Content : View, Data.Element : Identifiable
public init(
    _ data: Data,
    @ViewBuilder content: @escaping (Data.Element) -> Content
)
```

**init(_:id:content:)** — explicit ID key path

```swift
// extension where Content : View
public init(
    _ data: Data,
    id: KeyPath<Data.Element, ID>,
    @ViewBuilder content: @escaping (Data.Element) -> Content
)
```

**init(_:content:)** — constant `Range<Int>`

```swift
// extension where Data == Range<Int>, ID == Int, Content : View
public init(
    _ data: Range<Int>,
    @ViewBuilder content: @escaping (Int) -> Content
)
```

All three are **iOS 13.0+**. Every `content` parameter is `@ViewBuilder @escaping`. The range-based form requires a **constant** range (enforced by `@_semantics("swiftui.requires_constant_range")` internally).

---

## 4. Spacer

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
@frozen public struct Spacer {
    public var minLength: CGFloat?

    @inlinable public init(minLength: CGFloat? = nil)
}
```

Single initializer. **Default value:** `nil` (uses the system-default spacing when nil). **iOS 13.0+, macOS 10.15+, tvOS 13.0+, watchOS 6.0+**.

---

## 5. ScrollView

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct ScrollView<Content> : View where Content : View
```

**init(_:showsIndicators:content:)**

```swift
public init(
    _ axes: Axis.Set = .vertical,
    showsIndicators: Bool = true,
    @ViewBuilder content: () -> Content
)
```

**Default values:** `axes` is `.vertical`, `showsIndicators` is `true`. **iOS 13.0+**. This initializer carries a future-deprecation annotation (`deprecated: 100000.0, renamed: "ScrollView.init(_:content:)"`) — Apple now recommends the `.scrollIndicators(_:axes:)` modifier instead of the `showsIndicators` parameter.

---

## 6. Form

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct Form<Content> : View where Content : View {
    public init(@ViewBuilder content: () -> Content)
}
```

Single initializer. `content` is `@ViewBuilder`, non-escaping. **iOS 13.0+, macOS 10.15+, tvOS 13.0+, watchOS 6.0+**.

---

## 7. Section

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct Section<Parent, Content, Footer>
```

**init(header:footer:content:)** — with header and footer views

```swift
// extension where Parent : View, Content : View, Footer : View
public init(
    header: Parent,
    footer: Footer,
    @ViewBuilder content: () -> Content
)
```

Note: `header` and `footer` are **direct view values**, not `@ViewBuilder` closures. This form is soft-deprecated in favor of `init(content:header:footer:)` below.

**init(header:content:)** — header only

```swift
// extension where Parent : View, Content : View, Footer == EmptyView
public init(
    header: Parent,
    @ViewBuilder content: () -> Content
)
```

**init(footer:content:)** — footer only

```swift
// extension where Parent == EmptyView, Content : View, Footer : View
public init(
    footer: Footer,
    @ViewBuilder content: () -> Content
)
```

**init(content:)** — no header or footer

```swift
// extension where Parent == EmptyView, Content : View, Footer == EmptyView
public init(@ViewBuilder content: () -> Content)
```

All four are **iOS 13.0+**. Starting in **iOS 15.0+, macOS 12.0+**, Apple added a replacement form where all three parameters are `@ViewBuilder` closures:

```swift
// iOS 15.0+
public init(
    @ViewBuilder content: () -> Content,
    @ViewBuilder header: () -> Parent,
    @ViewBuilder footer: () -> Footer
)
```

---

## 8. LazyVStack

```swift
@available(iOS 14.0, macOS 11.0, tvOS 14.0, watchOS 7.0, *)
public struct LazyVStack<Content> : View where Content : View
```

```swift
public init(
    alignment: HorizontalAlignment = .center,
    spacing: CGFloat? = nil,
    pinnedViews: PinnedScrollableViews = .init(),
    @ViewBuilder content: () -> Content
)
```

**Default values:** `alignment` is `.center` (horizontal), `spacing` is `nil` (system default), `pinnedViews` is empty (`.init()`). The `PinnedScrollableViews` option set supports `.sectionHeaders` and `.sectionFooters`. **iOS 14.0+, macOS 11.0+, tvOS 14.0+, watchOS 7.0+**.

---

## 9. LazyHStack

```swift
@available(iOS 14.0, macOS 11.0, tvOS 14.0, watchOS 7.0, *)
public struct LazyHStack<Content> : View where Content : View
```

```swift
public init(
    alignment: VerticalAlignment = .center,
    spacing: CGFloat? = nil,
    pinnedViews: PinnedScrollableViews = .init(),
    @ViewBuilder content: () -> Content
)
```

Identical structure to LazyVStack except `alignment` is **`VerticalAlignment`** (not `HorizontalAlignment`). Same defaults and availability.

---

## 10. TabView

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct TabView<SelectionValue, Content> : View
    where SelectionValue : Hashable, Content : View
```

**init(selection:content:)**

```swift
public init(
    selection: Binding<SelectionValue>?,
    @ViewBuilder content: () -> Content
)
```

The `selection` binding is **optional** (`Binding<SelectionValue>?`). Passing `nil` lets SwiftUI manage tab state internally. **iOS 13.0+** (watchOS support added in watchOS 7.0). No default values.

A no-selection convenience also exists (added later, where `SelectionValue == Never`):
```swift
public init(@ViewBuilder content: () -> Content)
    where SelectionValue == Never  // iOS 14.0+ / watchOS 7.0+
```

---

## 11. Toggle

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct Toggle<Label> : View where Label : View
```

**init(isOn:label:)** — custom label

```swift
public init(
    isOn: Binding<Bool>,
    @ViewBuilder label: () -> Label
)
```

**Convenience text inits** (where `Label == Text`):

```swift
public init(_ titleKey: LocalizedStringKey, isOn: Binding<Bool>)

@_disfavoredOverload
public init<S>(_ title: S, isOn: Binding<Bool>) where S : StringProtocol
```

All are **iOS 13.0+, macOS 10.15+, tvOS 13.0+, watchOS 6.0+**.

---

## 12. TextField

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct TextField<Label> : View where Label : View
```

**init(_:text:…)** — `LocalizedStringKey` title (where `Label == Text`)

```swift
public init(
    _ titleKey: LocalizedStringKey,
    text: Binding<String>,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    onCommit: @escaping () -> Void = {}
)
```

**init(_:text:…)** — `StringProtocol` title (where `Label == Text`)

```swift
@_disfavoredOverload
public init<S>(
    _ title: S,
    text: Binding<String>,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    onCommit: @escaping () -> Void = {}
) where S : StringProtocol
```

Both `onEditingChanged` and `onCommit` default to no-ops. These callbacks were **soft-deprecated in iOS 15.0** (replaced by `.onSubmit` and `focused` modifiers), at which point clean two-parameter forms `init(_:text:)` effectively became the recommended call site. **iOS 13.0+, macOS 10.15+, tvOS 13.0+, watchOS 6.0+**.

There is **no `init(label:text:)` form**. The label-as-trailing-closure form added in iOS 15.0+ uses the parameter order `init(text:prompt:label:)`:

```swift
// iOS 15.0+, where Label : View (not constrained to Text)
public init(
    text: Binding<String>,
    prompt: Text? = nil,
    @ViewBuilder label: () -> Label
)
```

---

## 13. Slider

```swift
@available(iOS 13.0, macOS 10.15, *)
@available(tvOS, unavailable)
@available(watchOS, unavailable)
public struct Slider<Label, ValueLabel> : View
    where Label : View, ValueLabel : View
```

**init(value:in:step:onEditingChanged:)** — no labels (`Label == EmptyView, ValueLabel == EmptyView`)

```swift
// extension where Label == EmptyView, ValueLabel == EmptyView
public init<V>(
    value: Binding<V>,
    in bounds: ClosedRange<V> = 0...1,
    step: V.Stride? = nil,
    onEditingChanged: @escaping (Bool) -> Void = { _ in }
) where V : BinaryFloatingPoint, V.Stride : BinaryFloatingPoint
```

**init(value:in:step:onEditingChanged:label:)** — with custom label (`ValueLabel == EmptyView`)

```swift
// extension where ValueLabel == EmptyView
public init<V>(
    value: Binding<V>,
    in bounds: ClosedRange<V> = 0...1,
    step: V.Stride? = nil,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    @ViewBuilder label: () -> Label
) where V : BinaryFloatingPoint, V.Stride : BinaryFloatingPoint
```

**init(value:in:step:onEditingChanged:minimumValueLabel:maximumValueLabel:label:)** — full form

```swift
public init<V>(
    value: Binding<V>,
    in bounds: ClosedRange<V> = 0...1,
    step: V.Stride? = nil,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    minimumValueLabel: ValueLabel,
    maximumValueLabel: ValueLabel,
    @ViewBuilder label: () -> Label
) where V : BinaryFloatingPoint, V.Stride : BinaryFloatingPoint
```

**Key detail:** **`step` is `V.Stride?` with a default of `nil`** (not `V.Stride = 1`). When `nil`, the slider moves continuously. The `bounds` default to **`0...1`**. All forms are **iOS 13.0+, macOS 10.15+** (tvOS and watchOS unavailable).

---

## 14. Picker

```swift
@available(iOS 13.0, macOS 10.15, tvOS 13.0, watchOS 6.0, *)
public struct Picker<Label, SelectionValue, Content> : View
    where Label : View, SelectionValue : Hashable, Content : View
```

**init(selection:label:content:)** — original form (now soft-deprecated)

```swift
public init(
    selection: Binding<SelectionValue>,
    label: Label,
    @ViewBuilder content: () -> Content
)
```

Note: `label` is a **direct view value**, not a `@ViewBuilder` closure. Apple recommends the reordered form below.

**Convenience text inits** (where `Label == Text`):

```swift
public init(
    _ titleKey: LocalizedStringKey,
    selection: Binding<SelectionValue>,
    @ViewBuilder content: () -> Content
)

@_disfavoredOverload
public init<S>(
    _ title: S,
    selection: Binding<SelectionValue>,
    @ViewBuilder content: () -> Content
) where S : StringProtocol
```

All original forms are **iOS 13.0+**. The modern replacement uses `@ViewBuilder` closures for both label and content:

```swift
// iOS 16.0+, macOS 13.0+
public init(
    selection: Binding<SelectionValue>,
    @ViewBuilder content: () -> Content,
    @ViewBuilder label: () -> Label
)
```

---

## 15. Stepper

```swift
@available(iOS 13.0, macOS 10.15, *)
@available(tvOS, unavailable)
@available(watchOS, unavailable)
public struct Stepper<Label> : View where Label : View
```

### Label-based forms (generic `Label`)

**Callback form:**

```swift
public init(
    onIncrement: (() -> Void)?,
    onDecrement: (() -> Void)?,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    @ViewBuilder label: () -> Label
)
```

**Value binding without bounds:**

```swift
public init<V>(
    value: Binding<V>,
    step: V.Stride = 1,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    @ViewBuilder label: () -> Label
) where V : Strideable
```

**Value binding with bounds:**

```swift
public init<V>(
    value: Binding<V>,
    in bounds: ClosedRange<V>,
    step: V.Stride = 1,
    onEditingChanged: @escaping (Bool) -> Void = { _ in },
    @ViewBuilder label: () -> Label
) where V : Strideable
```

### Text convenience forms (where `Label == Text`)

**Callback forms:**

```swift
public init(
    _ titleKey: LocalizedStringKey,
    onIncrement: (() -> Void)?,
    onDecrement: (() -> Void)?,
    onEditingChanged: @escaping (Bool) -> Void = { _ in }
)

@_disfavoredOverload
public init<S>(
    _ title: S,
    onIncrement: (() -> Void)?,
    onDecrement: (() -> Void)?,
    onEditingChanged: @escaping (Bool) -> Void = { _ in }
) where S : StringProtocol
```

**Value binding with bounds:**

```swift
public init<V>(
    _ titleKey: LocalizedStringKey,
    value: Binding<V>,
    in bounds: ClosedRange<V>,
    step: V.Stride = 1,
    onEditingChanged: @escaping (Bool) -> Void = { _ in }
) where V : Strideable

@_disfavoredOverload
public init<S, V>(
    _ title: S,
    value: Binding<V>,
    in bounds: ClosedRange<V>,
    step: V.Stride = 1,
    onEditingChanged: @escaping (Bool) -> Void = { _ in }
) where S : StringProtocol, V : Strideable
```

All Stepper forms share these defaults: **`step` is `1`**, **`onEditingChanged` is `{ _ in }`**. The `onIncrement` and `onDecrement` closures are **optional** (pass `nil` to disable that direction). All are **iOS 13.0+, macOS 10.15+** (tvOS and watchOS unavailable).

---

## 16. DatePicker

```swift
@available(iOS 13.0, macOS 10.15, *)
@available(tvOS, unavailable)
@available(watchOS, unavailable)
public struct DatePicker<Label> : View where Label : View
```

### Label-based forms (generic `Label`)

**Unbounded:**

```swift
public init(
    selection: Binding<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date],
    @ViewBuilder label: () -> Label
)
```

**ClosedRange:**

```swift
public init(
    selection: Binding<Date>,
    in range: ClosedRange<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date],
    @ViewBuilder label: () -> Label
)
```

**PartialRangeFrom:**

```swift
public init(
    selection: Binding<Date>,
    in range: PartialRangeFrom<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date],
    @ViewBuilder label: () -> Label
)
```

**PartialRangeThrough:**

```swift
public init(
    selection: Binding<Date>,
    in range: PartialRangeThrough<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date],
    @ViewBuilder label: () -> Label
)
```

### Text convenience forms (where `Label == Text`)

Each label-based form above has a `LocalizedStringKey` and a `@_disfavoredOverload StringProtocol` counterpart. The unbounded form:

```swift
public init(
    _ titleKey: LocalizedStringKey,
    selection: Binding<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date]
)

@_disfavoredOverload
public init<S>(
    _ title: S,
    selection: Binding<Date>,
    displayedComponents: DatePicker<Label>.Components = [.hourAndMinute, .date]
) where S : StringProtocol
```

The ranged forms follow the identical pattern, adding `in range: ClosedRange<Date>`, `PartialRangeFrom<Date>`, or `PartialRangeThrough<Date>` — **8 text convenience inits total** (4 range variants × 2 string types).

`DatePicker.Components` is an `OptionSet` with members **`.date`** and **`.hourAndMinute`**. The default for `displayedComponents` is **`[.hourAndMinute, .date]`** across every overload. All forms are **iOS 13.0+, macOS 10.15+** (tvOS and watchOS unavailable).

---

## How these signatures were verified

All declarations originate from the **`SwiftUI.swiftinterface`** file shipped inside the iOS SDK frameworks (specifically `iPhoneOS13.0.sdk` for iOS 13-era views and `iPhoneOS16.x.sdk` for NavigationStack). This file is the compiler's canonical public API surface — it is what Xcode's "Jump to Definition" renders and what the Swift compiler type-checks against. The iOS 13 interface was read from the `xybp888/iOS-SDKs` GitHub mirror; NavigationStack and Lazy*Stack declarations were cross-verified against Apple's developer.apple.com documentation page descriptions and the NavigationBackport open-source library that replicates the exact generics.

Annotations like `@MainActor @preconcurrency` (iOS 16+ views) or `nonisolated` (post–Swift 6 concurrency migration) prefix some declarations in newer SDK versions but are omitted here because they are concurrency annotations rather than part of the logical API contract. The `@_disfavoredOverload` attribute on `StringProtocol` variants is an internal Swift compiler hint that prefers the `LocalizedStringKey` overload during type-checking.