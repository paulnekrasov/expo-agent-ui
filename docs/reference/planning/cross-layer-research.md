# SwiftUI Preview — Reference Data: Layers 1, 2, 4, 10
> Source: Gemini Deep Research pass — March 2026
> Status: Partial. See RESEARCH GAPS at end of each section.

---

## LAYER 1 — tree-sitter-swift Grammar

### 1.1 node-types.json location

```
Repository: https://github.com/alex-pinkus/tree-sitter-swift
File path:  src/node-types.json
```

This is the machine-generated schema describing every node type:
- `type` — exact string name of the node
- `named` — whether it is a named node (true) or anonymous token (false)
- `fields` — named field accessors on the node
- `children` — child node collections with type constraints

**Rule:** This file is the single source of truth for node type spelling and
field names. Every extractor that hardcodes a node name must derive it from
here. No guessing.

---

### 1.2 Confirmed node type names

All of the following are confirmed present in `node-types.json` with
`named: true`. These were previously listed as uncertain:

**Call and closure structure (already in Layer 1 docs):**
- `call_expression`
- `call_suffix`
- `lambda_literal`
- `value_arguments`
- `value_argument`
- `navigation_expression`
- `navigation_suffix`
- `simple_identifier`

**Control flow (previously missing — now confirmed):**
- `if_statement`
- `switch_statement`
- `for_statement`
- `ternary_expression`

**Literals (previously missing — now confirmed):**
- `integer_literal`
- `boolean_literal`
- `line_string_literal`
- `multi_line_string_literal`
- `tuple_expression`

**Extractor implication:** The remaining work for these nodes is to derive
their exact field layout and add corpus examples. The names themselves are
now confirmed — no guessing needed.

---

### 1.3 Parse tree S-expression output

**STATUS: RESEARCH GAP — HARD BLOCKER**

Gemini could not run the tree-sitter CLI in its environment because
`tree-sitter-swift` does not ship a prebuilt `src/parser.c`.

**What is still needed:** Real S-expression output from running
`tree-sitter parse` against the 5 fixture files.

**How to get it:**
```bash
npm install -g tree-sitter-cli
git clone https://github.com/alex-pinkus/tree-sitter-swift
cd tree-sitter-swift
npm install
tree-sitter generate        # builds parser.c
tree-sitter parse fixture1_simple_vstack.swift
tree-sitter parse fixture2_modifiers.swift
tree-sitter parse fixture3_list.swift
tree-sitter parse fixture4_navigation.swift
tree-sitter parse fixture5_conditional.swift
```

Paste full `(source_file ...)` output into `docs/reference/parse-trees.md`.

**Until this is done:** All extractor logic is written against assumed parse
trees. Treat as a blocking validation step before any extractor ships.

---

## LAYER 2 — SwiftUI View and Modifier Signatures

### 2.1 Stack containers

```swift
VStack(
    alignment: HorizontalAlignment = .center,
    spacing: CGFloat? = nil,
    @ViewBuilder content: () -> Content
)
// alignment — horizontal alignment of children on the cross (x) axis
// spacing   — gap between children; nil uses system-chosen spacing
// content   — @ViewBuilder closure producing the child views
```

```swift
HStack(
    alignment: VerticalAlignment = .center,
    spacing: CGFloat? = nil,
    @ViewBuilder content: () -> Content
)
// alignment — vertical alignment of children on the cross (y) axis
// spacing   — horizontal gap between children; nil uses system default
// content   — @ViewBuilder closure producing the child views
```

```swift
ZStack(
    alignment: Alignment = .center,
    @ViewBuilder content: () -> Content
)
// alignment — two-axis alignment for how children are overlaid
// content   — @ViewBuilder closure producing overlapping child views
```

---

### 2.2 Text

```swift
Text(_ key: LocalizedStringKey)
// key — compile-time localized key; string literals use this overload

Text(_ content: String)
// content — stored String, shown verbatim, no implicit localization

Text(verbatim: String)
// verbatim — String rendered exactly as given, no localization or Markdown
```

**Extractor rule:** All three map to `TextNode` with a `content` string
field. Annotate localization intent but treat the display string identically
for layout purposes.

---

### 2.3 Image

```swift
Image(_ name: String)
// name — asset catalog image name loaded from the current bundle

Image(systemName: String)
// systemName — SF Symbol identifier, e.g. "chevron.right" or "star.fill"
```

**Extractor rule:**
- `Image(systemName:)` → `SystemImageNode { symbolName: string }`
- `Image(_:)` → `AssetImageNode { assetName: string }` (stub as grey box)

---

### 2.4 Button

```swift
Button(
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
)
// action — closure executed when the button is triggered (ignored by IR)
// label  — @ViewBuilder closure producing the visual button content
```

**Extractor rule:** `action:` closure is side-effect code — ignore it.
`label:` closure is the visual content — extract as child `ViewNode`.

---

### 2.5 NavigationLink

```swift
NavigationLink(
    destination: Destination,
    @ViewBuilder label: () -> Label
)
// destination — view to present when the link is activated
// label       — @ViewBuilder closure producing the tappable row content
```

**Extractor rule:** All `NavigationLink` overloads normalize to
`NavigationLinkNode { destination: ViewNode, label: ViewNode }`.
Binding-based overloads (`isActive:`, `tag:`, `selection:`) affect
navigation state only, not layout.

---

### 2.6 Priority view list — validation status

| View | Signature | Status |
|------|-----------|--------|
| VStack | `init(alignment:spacing:content:)` | ✅ Confirmed |
| HStack | `init(alignment:spacing:content:)` | ✅ Confirmed |
| ZStack | `init(alignment:content:)` | ✅ Confirmed |
| Text | `init(_ key: LocalizedStringKey)` | ✅ Confirmed |
| Text | `init(_ content: String)` | ✅ Confirmed |
| Text | `init(verbatim:)` | ✅ Confirmed |
| Image | `init(_ name: String)` | ✅ Confirmed |
| Image | `init(systemName:)` | ✅ Confirmed |
| Button | `init(action:label:)` | ✅ Confirmed |
| NavigationLink | `init(destination:label:)` | ✅ Confirmed |
| NavigationStack | `init(path:root:)` / `init(content:)` | ⚠️ Unvalidated |
| List | `init(content:)` / `init(data:rowContent:)` | ⚠️ Unvalidated |
| ForEach | `init(_:id:content:)` | ⚠️ Unvalidated |
| Spacer | `init(minLength: CGFloat?)` | ⚠️ Unvalidated |
| ScrollView | `init(_:showsIndicators:content:)` | ⚠️ Unvalidated |

**RESEARCH GAP:** NavigationStack, List, ForEach, Spacer, ScrollView
signatures need to be validated from Xcode's SwiftUI.framework interface
(Jump to Definition) or Apple's official documentation.

---

### 2.7 Confirmed modifier signatures

```swift
.frame(
    width: CGFloat? = nil,
    height: CGFloat? = nil,
    alignment: Alignment = .center
) -> some View
// width     — fixed width; nil uses proposed width from parent
// height    — fixed height; nil uses proposed height from parent
// alignment — where view sits inside the frame when frame is larger
```

```swift
.frame(
    minWidth: CGFloat? = nil,
    idealWidth: CGFloat? = nil,
    maxWidth: CGFloat? = nil,
    minHeight: CGFloat? = nil,
    idealHeight: CGFloat? = nil,
    maxHeight: CGFloat? = nil,
    alignment: Alignment = .center
) -> some View
// minWidth / minHeight   — lower bounds the view may shrink to
// idealWidth / idealHeight — preferred size when min and max are set
// maxWidth / maxHeight   — upper bounds (use .infinity to fill available space)
// alignment              — position within any extra space
```

```swift
.padding(_ length: CGFloat) -> some View
// length — uniform padding added to all edges

.padding(
    _ edges: Edge.Set = .all,
    _ length: CGFloat? = nil
) -> some View
// edges  — which edges to pad (.top, .horizontal, .all, etc.)
// length — amount; nil uses platform default for those edges
```

```swift
.foregroundColor(_ color: Color?) -> some View
// color — Color applied to foreground content (text, SF Symbols, shapes)
```

```swift
.background(
    _ background: Background,
    alignment: Alignment = .center
) -> some View
// background — view placed behind the modified view (Color, Shape, any View)
// alignment  — how the background is aligned within the modified view's bounds
```

**RESEARCH GAP:** The following modifiers still need signatures collected:
`font()`, `fontWeight()`, `fontDesign()`, `lineLimit()`,
`multilineTextAlignment()`, `lineSpacing()`, `tracking()`, `kerning()`,
`bold()`, `italic()`, `underline()`, `strikethrough()`,
`opacity()`, `cornerRadius()`, `clipShape()`, `shadow()`,
`border()`, `tint()`, `overlay()`, `fixedSize()`,
`offset()`, `position()`, `scaleEffect()`, `rotationEffect()`,
`navigationTitle()`, `navigationBarTitleDisplayMode()`, `toolbar()`,
`listStyle()`, `listRowInsets()`, `listRowSeparator()`, `listRowBackground()`,
`onTapGesture()`, `disabled()`, `animation()`, `transition()`,
`environment()`, `preferredColorScheme()`,
`ignoresSafeArea()`, `safeAreaInset()`

---

## LAYER 4 — SF Symbols Seed List

### 4.1 Context

SF Symbols 7 contains 6,900+ symbol names. The renderer needs a curated
subset for the first pass. Unknown symbol names fall back to a generic
rounded-square placeholder with a `?` label.

Source: Public GitHub Gist dump of SF Symbols identifier list (early
SF Symbols version — names below are stable across versions).

### 4.2 50 confirmed symbol names

```
chevron.right
chevron.left
chevron.up
chevron.down
chevron.up.chevron.down
arrow.left
arrow.right
arrow.up
arrow.down
arrow.2.circlepath
plus
minus
xmark
checkmark
exclamationmark.triangle
questionmark.circle
star
star.fill
heart
heart.fill
house
house.fill
bell
bell.fill
trash
trash.fill
gear
gearshape
person
person.fill
person.circle
person.circle.fill
folder
folder.fill
doc
doc.fill
calendar
clock
magnifyingglass
paperclip
photo
photo.on.rectangle
play.fill
pause.fill
stop.fill
arrowshape.turn.up.right
square.and.arrow.up
square.and.arrow.down
list.bullet
line.horizontal.3
```

**Renderer implication:** Map these in `sfSymbols.ts`. Any
`Image(systemName:)` call whose name is not in this list renders as a
rounded square with `?` until the map is expanded.

**RESEARCH GAP:** This list is from an early SF Symbols release. Some
names may be deprecated or renamed in SF Symbols 7 (iOS 18). Validate
against the SF Symbols Mac app for the target iOS version.

---

## LAYER 10 — Test Fixtures

These 5 fixtures are the definition of "working" for Stages 1–4 and 7.
Each fixture must eventually be paired with:
1. Its real S-expression parse tree output
2. Its expected IR JSON
3. Its expected layout output (sizes and positions)

---

### FIXTURE 1 — SimpleVStack

```swift
// FIXTURE: SimpleVStack
// Exercises: Stage 1 (Parser), Stage 2 (Extractor), Stage 4 (Layout)
// Key constructs: VStack, Text, trailing @ViewBuilder body
// Expected IR:
//   VStackNode {
//     alignment: .center,
//     spacing: nil,
//     children: [TextNode("Hello"), TextNode("World")],
//     modifiers: []
//   }

import SwiftUI

struct SimpleVStack: View {
    var body: some View {
        VStack {
            Text("Hello")
            Text("World")
        }
    }
}
```

---

### FIXTURE 2 — VStackWithModifiers

```swift
// FIXTURE: VStackWithModifiers
// Exercises: Stage 1, Stage 2, Stage 3 (modifier flattening), Stage 4
// Key constructs: VStack(alignment:spacing:), modifier chain on container,
//                 font() and Spacer()
// Expected IR:
//   VStackNode {
//     alignment: .leading,
//     spacing: 8,
//     children: [
//       TextNode("Title")     { modifiers: [font(.title)] },
//       TextNode("Subtitle")  { modifiers: [font(.subheadline)] },
//       SpacerNode {}
//     ],
//     modifiers: [padding(), background(Color.blue)]
//   }

import SwiftUI

struct VStackWithModifiers: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Title")
                .font(.title)
            Text("Subtitle")
                .font(.subheadline)
            Spacer()
        }
        .padding()
        .background(Color.blue)
    }
}
```

---

### FIXTURE 3 — ListWithForEach

```swift
// FIXTURE: ListWithForEach
// Exercises: Stage 1, Stage 2, Stage 3 (ForEach stubs), Stage 4,
//            Stage 6 (device-safe List layout)
// Key constructs: List, ForEach over array with id: \.self,
//                 string interpolation in Text
// Expected IR:
//   ListNode {
//     children: ForEach(items, id: \.self) {
//       TextNode("Item \(value)")  // repeated 5 times as stub
//     }
//   }

import SwiftUI

struct ListWithForEach: View {
    let items = Array(1...5)

    var body: some View {
        List {
            ForEach(items, id: \.self) { value in
                Text("Item \(value)")
            }
        }
    }
}
```

---

### FIXTURE 4 — NavigationStackBasic

```swift
// FIXTURE: NavigationStackBasic
// Exercises: Stage 1, Stage 2 (NavigationLink extraction),
//            Stage 7 (navigation state machine)
// Key constructs: NavigationStack, NavigationLink(destination:label:),
//                 .navigationTitle() modifier
// Expected IR:
//   NavigationStackNode {
//     children: [
//       NavigationLinkNode {
//         label: TextNode("Go"),
//         destination: TextNode("Detail"),
//         modifiers: [navigationTitle("Home")]
//       }
//     ]
//   }

import SwiftUI

struct NavigationStackBasic: View {
    var body: some View {
        NavigationStack {
            NavigationLink(destination: Text("Detail")) {
                Text("Go")
            }
            .navigationTitle("Home")
        }
    }
}
```

---

### FIXTURE 5 — ConditionalViewModifierChain

```swift
// FIXTURE: ConditionalViewModifierChain
// Exercises: Stage 1, Stage 2 (if/else inside @ViewBuilder),
//            Stage 3 (modifier flattening), Stage 4
// Key constructs: @State property wrapper, if/else conditional,
//                 ternary expression inside modifier argument
// Expected IR:
//   VStackNode {
//     children: [
//       IfNode {
//         condition: isVisible,
//         thenChildren: [TextNode("Visible") { modifiers: [opacity(1)] }],
//         elseChildren: [TextNode("Hidden")  { modifiers: [opacity(0)] }]
//       }
//     ]
//   }

import SwiftUI

struct ConditionalViewModifierChain: View {
    @State private var isVisible = true

    var body: some View {
        VStack {
            if isVisible {
                Text("Visible")
                    .opacity(isVisible ? 1 : 0)
            } else {
                Text("Hidden")
                    .opacity(0)
            }
        }
    }
}
```

---

## Research Gap Summary

| Layer | Item | How to close |
|-------|------|-------------|
| 1 | Real S-expression parse trees | Run `tree-sitter parse` locally — 10 min |
| 1 | Field layout for if/switch/ternary/tuple nodes | Derive from `node-types.json` directly |
| 2 | NavigationStack, List, ForEach, Spacer, ScrollView signatures | Xcode Jump to Definition or Apple docs |
| 2 | All remaining modifier signatures (30+) | Next Perplexity session |
| 4 | SF Symbols version accuracy | Export from SF Symbols Mac app |
| 4 | Individual control visual specs (Toggle, Slider, etc.) | Next Perplexity session |
| 8 | Device safe area insets, Dynamic Island spec | Next Perplexity session |
| 9 | Navigation transition timing validation | Next Perplexity session |
| 10 | Pair fixtures with real parse trees and IR JSON | After S-expressions are captured |
