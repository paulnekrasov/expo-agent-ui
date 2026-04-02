# SwiftUI view modifier signatures: complete reference

This reference catalogs the exact initializer and modifier signatures for 40 commonly used SwiftUI view modifiers, drawn from Apple's official SwiftUI documentation. Each entry includes all overloads, parameter types, default values, availability, and deprecation status. Modifiers that live on `Text` (returning `Text`) are noted explicitly — all others are `View` extensions returning `some View`.

---

## 1–8: Typography and text layout

```swift
// 1. font(_:)
func font(_ font: Font?) -> some View
// font — The default font for text in this view; nil uses the inherited environment font.
// Availability: iOS 13.0+
```

```swift
// 2. fontWeight(_:) — View modifier
func fontWeight(_ weight: Font.Weight?) -> some View
// weight — A predefined weight (.ultraLight, .thin, .light, .regular, .medium, .semibold, .bold, .heavy, .black); nil uses the default.
// Availability: iOS 16.0+

// 2b. fontWeight(_:) — Text modifier
func fontWeight(_ weight: Font.Weight?) -> Text
// Availability: iOS 13.0+  (returns Text, enabling + concatenation)
```

```swift
// 3. fontDesign(_:)
func fontDesign(_ design: Font.Design?) -> some View
// design — The font design: .default, .serif, .rounded, .monospaced; nil uses the default.
// Availability: iOS 16.1+
```

```swift
// 4. lineLimit(_:) — four overloads + reservesSpace variant

func lineLimit(_ number: Int?) -> some View
// number — Maximum number of lines; nil removes the limit.
// Availability: iOS 13.0+

func lineLimit(_ limit: ClosedRange<Int>) -> some View
// limit — A closed range (e.g. 2...4) setting minimum and maximum line count.
// Availability: iOS 16.0+

func lineLimit(_ limit: PartialRangeFrom<Int>) -> some View
// limit — A partial range (e.g. 3...) setting a minimum line count with no upper bound.
// Availability: iOS 16.0+

func lineLimit(_ limit: PartialRangeThrough<Int>) -> some View
// limit — A partial range (e.g. ...2) setting a maximum line count.
// Availability: iOS 16.0+

func lineLimit(_ limit: Int, reservesSpace: Bool) -> some View
// limit — The line count target.
// reservesSpace — When true, the view reserves height for the specified number of lines even if content is shorter.
// Availability: iOS 16.0+
```

```swift
// 5. multilineTextAlignment(_:)
func multilineTextAlignment(_ alignment: TextAlignment) -> some View
// alignment — Alignment for multiline text: .leading, .center, or .trailing.
// Availability: iOS 13.0+
```

```swift
// 6. lineSpacing(_:)
func lineSpacing(_ lineSpacing: CGFloat) -> some View
// lineSpacing — Additional inter-line space in points beyond the font's default line height.
// Availability: iOS 13.0+
```

```swift
// 7. tracking(_:) ⚠️ Text modifier, not View modifier
func tracking(_ tracking: CGFloat) -> Text
// tracking — Additional space in points distributed between characters; pulls apart ligatures.
// Availability: iOS 13.0+
```

```swift
// 8. kerning(_:) ⚠️ Text modifier, not View modifier
func kerning(_ kerning: CGFloat) -> Text
// kerning — Additional inter-character spacing in points; preserves ligatures. Ignored if tracking is also set.
// Availability: iOS 13.0+
```

---

## 9–12: Text style modifiers (bold, italic, underline, strikethrough)

Each exists as both a **View modifier** (iOS 16+, returns `some View`) and a **Text modifier** (iOS 13+, returns `Text`).

```swift
// 9. bold — View modifier
func bold(_ isActive: Bool = true) -> some View
// isActive — Whether bold styling is applied. Default true.
// Availability: iOS 16.0+

// 9b. bold — Text modifiers
func bold() -> Text                     // iOS 13.0+
func bold(_ isActive: Bool) -> Text     // iOS 16.0+
```

```swift
// 10. italic — View modifier
func italic(_ isActive: Bool = true) -> some View
// isActive — Whether italic styling is applied. Default true.
// Availability: iOS 16.0+

// 10b. italic — Text modifiers
func italic() -> Text                    // iOS 13.0+
func italic(_ isActive: Bool) -> Text    // iOS 16.0+
```

```swift
// 11. underline — View modifier (includes pattern)
func underline(
    _ isActive: Bool = true,
    pattern: Text.LineStyle.Pattern = .solid,
    color: Color? = nil
) -> some View
// isActive — Whether the underline is drawn. Default true.
// pattern — Line pattern: .solid, .dot, .dash, .dashDot, .dashDotDot. Default .solid.
// color — Underline color; nil uses the text's foreground color.
// Availability: iOS 16.0+

// 11b. underline — Text modifier (original, no pattern)
func underline(_ isActive: Bool = true, color: Color? = nil) -> Text
// Availability: iOS 13.0+

// 11c. underline — Text modifier (with pattern)
func underline(_ isActive: Bool = true, pattern: Text.LineStyle.Pattern = .solid, color: Color? = nil) -> Text
// Availability: iOS 16.0+
```

```swift
// 12. strikethrough — View modifier (includes pattern)
func strikethrough(
    _ isActive: Bool = true,
    pattern: Text.LineStyle.Pattern = .solid,
    color: Color? = nil
) -> some View
// isActive — Whether the strikethrough is drawn. Default true.
// pattern — Line pattern: .solid, .dot, .dash, .dashDot, .dashDotDot. Default .solid.
// color — Strikethrough color; nil uses the text's foreground color.
// Availability: iOS 16.0+

// 12b. strikethrough — Text modifier (original, no pattern)
func strikethrough(_ isActive: Bool = true, color: Color? = nil) -> Text
// Availability: iOS 13.0+

// 12c. strikethrough — Text modifier (with pattern)
func strikethrough(_ isActive: Bool = true, pattern: Text.LineStyle.Pattern = .solid, color: Color? = nil) -> Text
// Availability: iOS 16.0+
```

---

## 13–16: Visual effects (opacity, clipping, shadow)

```swift
// 13. opacity(_:)
func opacity(_ opacity: Double) -> some View
// opacity — A value from 0 (fully transparent) to 1 (fully opaque).
// Availability: iOS 13.0+
```

```swift
// 14. cornerRadius(_:antialiased:)  ⚠️ DEPRECATED in iOS 17.0
func cornerRadius(_ radius: CGFloat, antialiased: Bool = true) -> some View
// radius — The corner radius applied to the view's bounding rectangle.
// antialiased — Whether to smooth the edges of the clipping rectangle. Default true.
// Availability: iOS 13.0+
// ⛔ Deprecated: iOS 17.0 / macOS 14.0. Use .clipShape(RoundedRectangle(cornerRadius:)) instead.
```

```swift
// 15. clipShape(_:style:)
func clipShape<S>(_ shape: S, style: FillStyle = FillStyle()) -> some View where S: Shape
// shape — The Shape used to clip this view (e.g., Circle(), RoundedRectangle(cornerRadius: 10), Capsule()).
// style — Fill style controlling even-odd rule and antialiasing. Default FillStyle(eoFill: false, antialiased: true).
// Availability: iOS 13.0+
// Note: In iOS 17+ the generic <S> was replaced with opaque `some Shape` syntax; behavior is identical.
```

```swift
// 16. shadow(color:radius:x:y:)
func shadow(
    color: Color = Color(.sRGBLinear, white: 0, opacity: 0.33),
    radius: CGFloat,
    x: CGFloat = 0,
    y: CGFloat = 0
) -> some View
// color — Shadow color. Default is semi-transparent black (~33% opacity in sRGB linear).
// radius — Blur radius of the shadow; larger values increase blur.
// x — Horizontal shadow offset. Default 0.
// y — Vertical shadow offset. Default 0.
// Availability: iOS 13.0+
```

---

## 17–19: Borders, tint, and overlays

```swift
// 17. border(_:width:)
func border<S>(_ content: S, width: CGFloat = 1) -> some View where S: ShapeStyle
// content — A ShapeStyle (Color, gradient, etc.) used to fill the border.
// width — Border thickness in points. Default 1.
// Availability: iOS 13.0+
```

```swift
// 18. tint(_:) — two overloads
func tint(_ tint: Color?) -> some View
// tint — The tint Color to apply; nil restores the system default.
// Availability: iOS 15.0+

func tint<S>(_ tint: S?) -> some View where S: ShapeStyle
// tint — A ShapeStyle (Color, gradient, etc.) to use as the tint; nil restores the default.
// Availability: iOS 16.0+
```

```swift
// 19. overlay(alignment:content:) — preferred ViewBuilder version
func overlay<V>(
    alignment: Alignment = .center,
    @ViewBuilder content: () -> V
) -> some View where V: View
// alignment — Positions the overlay relative to this view. Default .center.
// content — A @ViewBuilder closure producing the overlay view(s).
// Availability: iOS 15.0+

// 19b. overlay(_:alignment:) — older version (soft-deprecated)
func overlay<Overlay>(_ overlay: Overlay, alignment: Alignment = .center) -> some View where Overlay: View
// Availability: iOS 13.0+. Deprecated in favor of overlay(alignment:content:).

// 19c. overlay with ShapeStyle
func overlay<S>(_ style: S, ignoresSafeAreaEdges edges: Edge.Set = .all) -> some View where S: ShapeStyle
// Availability: iOS 15.0+
```

---

## 20–24: Layout positioning and transforms

```swift
// 20. fixedSize()
func fixedSize() -> some View
// Takes no parameters. Fixes the view at its ideal size in both dimensions.
// Equivalent to fixedSize(horizontal: true, vertical: true).
// Availability: iOS 13.0+
```

```swift
// 21. fixedSize(horizontal:vertical:)
func fixedSize(horizontal: Bool, vertical: Bool) -> some View
// horizontal — Whether to fix the view's width to its ideal width.
// vertical — Whether to fix the view's height to its ideal height.
// Both parameters are required (no defaults).
// Availability: iOS 13.0+
```

```swift
// 22. offset(x:y:)
func offset(x: CGFloat = 0, y: CGFloat = 0) -> some View
// x — Horizontal offset in points. Default 0.
// y — Vertical offset in points. Default 0.
// Note: Offset does not affect the view's layout frame — its original space is preserved.
// Availability: iOS 13.0+

// 22b. offset(_:) — CGSize variant
func offset(_ offset: CGSize) -> some View
// offset — A CGSize where width = horizontal offset, height = vertical offset.
// Availability: iOS 13.0+
```

```swift
// 23. position(x:y:)
func position(x: CGFloat = 0, y: CGFloat = 0) -> some View
// x — The x-coordinate for the center of this view. Default 0.
// y — The y-coordinate for the center of this view. Default 0.
// Note: Positions the view's center at the absolute coordinate in the parent's space.
// Availability: iOS 13.0+

// 23b. position(_:) — CGPoint variant
func position(_ position: CGPoint) -> some View
// position — A CGPoint specifying the center position.
// Availability: iOS 13.0+
```

```swift
// 24. scaleEffect — three overloads

// Uniform scale (CGFloat)
func scaleEffect(_ s: CGFloat, anchor: UnitPoint = .center) -> some View
// s — A single scale factor applied to both axes.
// anchor — The point from which scaling originates. Default .center.
// Availability: iOS 13.0+

// Non-uniform scale (CGSize)
func scaleEffect(_ scale: CGSize, anchor: UnitPoint = .center) -> some View
// scale — A CGSize where width = horizontal scale, height = vertical scale.
// anchor — The point from which scaling originates. Default .center.
// Availability: iOS 13.0+

// Explicit axes
func scaleEffect(x: CGFloat = 1.0, y: CGFloat = 1.0, anchor: UnitPoint = .center) -> some View
// x — Horizontal scale factor. Default 1.0 (no scaling).
// y — Vertical scale factor. Default 1.0 (no scaling).
// anchor — The point from which scaling originates. Default .center.
// Availability: iOS 13.0+
```

---

## 25–28: Rotation, navigation, and toolbar

```swift
// 25. rotationEffect(_:anchor:)
func rotationEffect(_ angle: Angle, anchor: UnitPoint = .center) -> some View
// angle — The rotation angle. Create with Angle.degrees(_:) or Angle.radians(_:).
// anchor — The unit point within the view about which to rotate. Default .center.
// Availability: iOS 13.0+
```

```swift
// 26. navigationTitle(_:) — four overloads

func navigationTitle(_ titleKey: LocalizedStringKey) -> some View
// titleKey — A localized string key for the navigation title.
// Availability: iOS 14.0+

func navigationTitle<S>(_ title: S) -> some View where S: StringProtocol
// title — A string (typically String) displayed as the title; no localization lookup.
// Availability: iOS 14.0+

func navigationTitle(_ title: Text) -> some View
// title — A Text view used as the title. Styling modifiers on the Text are ignored at runtime.
// Availability: iOS 14.0+

func navigationTitle(_ title: Binding<String>) -> some View
// title — A binding enabling inline title editing (requires .inline display mode).
// Availability: iOS 16.0+
```

```swift
// 27. navigationBarTitleDisplayMode(_:)
func navigationBarTitleDisplayMode(_ displayMode: NavigationBarItem.TitleDisplayMode) -> some View
// displayMode — .automatic (inherit), .inline (small centered), or .large (expanded bar).
// Availability: iOS 14.0+ (iOS only — not available on macOS/tvOS/watchOS)
```

```swift
// 28. toolbar(content:) — two content-based overloads

// ToolbarContent overload (primary)
func toolbar<Content>(@ToolbarContentBuilder content: () -> Content) -> some View where Content: ToolbarContent
// content — A @ToolbarContentBuilder closure producing ToolbarItem/ToolbarItemGroup instances.
// Availability: iOS 14.0+

// ViewBuilder overload
func toolbar<Content>(@ViewBuilder content: () -> Content) -> some View where Content: View
// content — A @ViewBuilder closure producing views placed in the default toolbar location.
// Availability: iOS 14.0+
```

---

## 29–32: List configuration

```swift
// 29. listStyle(_:)
func listStyle<S>(_ style: S) -> some View where S: ListStyle
// style — A ListStyle value: .automatic, .plain, .grouped, .inset (iOS 14+), .insetGrouped (iOS 14+), .sidebar (iOS 14+).
// Availability: iOS 13.0+
```

```swift
// 30. listRowInsets(_:)
func listRowInsets(_ insets: EdgeInsets?) -> some View
// insets — EdgeInsets (top, leading, bottom, trailing) for the row; nil restores default insets.
// Availability: iOS 13.0+
```

```swift
// 31. listRowSeparator(_:edges:)
func listRowSeparator(_ visibility: Visibility, edges: VerticalEdge.Set = .all) -> some View
// visibility — .automatic, .visible, or .hidden.
// edges — Which row edges are affected: .top, .bottom, or .all (default).
// Availability: iOS 15.0+
```

```swift
// 32. listRowBackground(_:)
func listRowBackground<V>(_ view: V?) -> some View where V: View
// view — Any View to place behind the row content; nil clears the custom background.
// Availability: iOS 13.0+
```

---

## 33–36: Interaction, animation, and transitions

```swift
// 33. onTapGesture(count:perform:)
func onTapGesture(count: Int = 1, perform action: @escaping () -> Void) -> some View
// count — Number of taps required to trigger the action. Default 1.
// action — The closure executed when the tap gesture is recognized.
// Availability: iOS 13.0+
// Note: A newer overload onTapGesture(count:coordinateSpace:perform:) providing tap location exists (iOS 16+).
```

```swift
// 34. disabled(_:)
func disabled(_ disabled: Bool) -> some View
// disabled — When true, the view and its children become non-interactive and appear dimmed.
// Availability: iOS 13.0+
```

```swift
// 35. animation(_:value:)
func animation<V>(_ animation: Animation?, value: V) -> some View where V: Equatable
// animation — The Animation to apply when value changes; nil disables animation.
// value — An Equatable value to monitor; animation triggers when this value changes.
// Availability: iOS 13.0+
// ⛔ The older func animation(_ animation: Animation?) -> some View (without value:) is deprecated in iOS 15.0.
```

```swift
// 36. transition(_:)

// Original version
func transition(_ t: AnyTransition) -> some View
// t — An AnyTransition describing how the view animates on insertion/removal (e.g., .opacity, .slide, .scale, .move(edge:)).
// Availability: iOS 13.0+

// Modern Transition protocol version
func transition<T>(_ t: T) -> some View where T: Transition
// t — A value conforming to the Transition protocol.
// Availability: iOS 17.0+
```

---

## 37–40: Environment, safe areas, and color scheme

```swift
// 37. environment(_:_:)

// KeyPath-based version
func environment<V>(_ keyPath: WritableKeyPath<EnvironmentValues, V>, _ value: V) -> some View
// keyPath — A writable key path to a property on EnvironmentValues (e.g., \.colorScheme, \.lineLimit).
// value — The new value to inject into the environment for all descendants.
// Availability: iOS 13.0+

// Observable object version (single parameter)
func environment<T>(_ object: T?) -> some View where T: AnyObject, T: Observable
// object — An @Observable class instance to place in the environment; nil clears it.
// Availability: iOS 17.0+
```

```swift
// 38. preferredColorScheme(_:)
func preferredColorScheme(_ colorScheme: ColorScheme?) -> some View
// colorScheme — .light, .dark, or nil (inherit the system/parent setting).
// Note: This sets a preference that propagates UP the hierarchy, affecting the entire presentation context.
// Availability: iOS 14.0+
// ⛔ Replaces the deprecated colorScheme(_:) modifier.
```

```swift
// 39. ignoresSafeArea(_:edges:)
func ignoresSafeArea(_ regions: SafeAreaRegions = .all, edges: Edge.Set = .all) -> some View
// regions — Which safe area regions to ignore: .container, .keyboard, or .all (default).
// edges — Which edges to extend past: .top, .bottom, .leading, .trailing, .horizontal, .vertical, .all (default).
// Availability: iOS 14.0+
// ⛔ Replaces the deprecated edgesIgnoringSafeArea(_:) from iOS 13.
```

```swift
// 40. safeAreaInset(edge:alignment:spacing:content:) — two overloads

// Vertical edge version (top/bottom)
func safeAreaInset<V>(
    edge: VerticalEdge,
    alignment: HorizontalAlignment = .center,
    spacing: CGFloat? = nil,
    @ViewBuilder content: () -> V
) -> some View where V: View
// edge — .top or .bottom.
// alignment — Horizontal alignment of the inset content. Default .center.
// spacing — Extra spacing between inset content and the main view; nil uses system default.
// content — A @ViewBuilder closure producing the inset view.
// Availability: iOS 15.0+

// Horizontal edge version (leading/trailing)
func safeAreaInset<V>(
    edge: HorizontalEdge,
    alignment: VerticalAlignment = .center,
    spacing: CGFloat? = nil,
    @ViewBuilder content: () -> V
) -> some View where V: View
// edge — .leading or .trailing.
// alignment — Vertical alignment of the inset content. Default .center.
// spacing — Extra spacing between inset content and the main view; nil uses system default.
// content — A @ViewBuilder closure producing the inset view.
// Availability: iOS 15.0+
```

---

## Deprecation summary at a glance

Five notable deprecations affect this set of modifiers:

- **`cornerRadius(_:antialiased:)`** — deprecated iOS 17.0. Replace with `.clipShape(RoundedRectangle(cornerRadius:))` or `.clipShape(.rect(cornerRadius:))`.
- **`overlay(_:alignment:)`** (non-closure form) — soft-deprecated. Replace with `overlay(alignment:content:)` (iOS 15+).
- **`animation(_:)`** (without `value:` parameter) — deprecated iOS 15.0. Replace with `animation(_:value:)` or `withAnimation`.
- **`edgesIgnoringSafeArea(_:)`** — deprecated iOS 14.5. Replaced by `ignoresSafeArea(_:edges:)`.
- **`colorScheme(_:)`** — deprecated. Replaced by `preferredColorScheme(_:)`.

## Availability tiers

Most modifiers in this set fall into three availability tiers. **iOS 13.0+** covers the original SwiftUI launch set: `font`, `lineLimit(Int?)`, `multilineTextAlignment`, `lineSpacing`, `tracking`, `kerning`, `bold()` (Text), `italic()` (Text), `underline` (Text), `strikethrough` (Text), `opacity`, `cornerRadius`, `clipShape`, `shadow`, `border`, `fixedSize`, `offset`, `position`, `scaleEffect`, `rotationEffect`, `listStyle`, `listRowInsets`, `listRowBackground`, `onTapGesture`, `disabled`, `animation(_:value:)`, and `transition`. **iOS 14.0–15.0** added `navigationTitle`, `navigationBarTitleDisplayMode`, `toolbar`, `ignoresSafeArea`, `preferredColorScheme`, `tint(Color?)`, `overlay(alignment:content:)`, `listRowSeparator`, and `safeAreaInset`. **iOS 16.0+** introduced the View-level `bold(_:)`, `italic(_:)`, `underline` (View), `strikethrough` (View), `fontWeight` (View), `fontDesign`, range-based `lineLimit` overloads, `tint(ShapeStyle?)`, and `navigationTitle(Binding<String>)`.