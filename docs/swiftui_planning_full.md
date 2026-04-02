
## LAYER 1 — THE PARSER (tree-sitter)

### tree-sitter-swift grammar node types
This is the most critical piece of reference material in the entire project. I need to know the **exact node type names** the grammar produces — not what I assume they are, not abstract descriptions.

**What to feed me:**
- The full `grammar.js` file from `https://github.com/alex-pinkus/tree-sitter-swift`
- The `node-types.json` file generated from that grammar — this is the machine-readable schema of every node type, field name, and child relationship
- Any `corpus/` test files in the repo — these show real Swift snippets and their expected parse trees, which teach me exactly how tricky constructs parse

**Why it matters:** If I call a node `function_call_expression` but the grammar names it `call_expression`, every extractor breaks silently. The node type names are the contract between the grammar and everything downstream.

**How to get it:**
```bash
# Clone the grammar
git clone https://github.com/alex-pinkus/tree-sitter-swift
# The files you need:
# - grammar.js (the grammar definition)
# - src/node-types.json (generated schema)
# - test/corpus/*.txt (parse tree examples)
```

Feed me `node-types.json` and 5-10 corpus files covering: function calls, trailing closures, modifier chains, member expressions, if/else blocks, struct declarations.

---

### web-tree-sitter API
I need the exact TypeScript API surface — method names, parameter types, how to init the parser, load a language, query nodes.

**What to feed me:**
- The `web-tree-sitter` README from npm
- The TypeScript type definitions: `node_modules/web-tree-sitter/tree-sitter.d.ts`
- Specifically: how `Parser.init()` works, how WASM is loaded, `node.children`, `node.namedChildren`, `node.childForFieldName()`, `node.text`, `node.type`, `node.startPosition`, `node.endPosition`, tree cursor API

---

## LAYER 2 — THE IR AND EXTRACTOR

### SwiftUI @ViewBuilder result builder behavior
The single hardest parsing problem. I need to understand exactly how `@ViewBuilder` transforms a closure body into a view.

**What to feed me:**
- Apple's SE-0289 proposal: "Result builders" (the Swift Evolution proposal that formally specifies how `@ViewBuilder` works)
- The Swift Evolution proposal SE-0258: "Property Wrappers"
- WWDC 2019 Session 226: "Data Flow Through SwiftUI" — covers `@State`, `@Binding`, `@ObservedObject`
- The SwiftUI source headers (the public API declarations) — these ship with Xcode but you can also find them in the open-source SwiftUI documentation on developer.apple.com

**Why it matters:** Without understanding result builders, I won't know that `if condition { ViewA() } else { ViewB() }` produces a `_ConditionalContent<ViewA, ViewB>` in real SwiftUI, and I need to stub-render it correctly.

---

### Every SwiftUI view's initializer signatures
For each view type in the IR, I need to know what arguments it accepts and what they mean.

**What to feed me:** The Apple developer documentation pages (or the generated DocC output) for each view. Priority order:

**Containers:** `VStack`, `HStack`, `ZStack` (alignment + spacing params), `ScrollView` (axes param), `GeometryReader`, `Group`, `LazyVStack`, `LazyHStack`, `LazyVGrid`, `LazyHGrid`, `Section`

**Navigation:** `NavigationStack`, `NavigationView` (deprecated but common), `NavigationLink` (both label+destination and value-based forms)

**Lists:** `List` (all init forms — static content, ForEach, dynamic data), `ForEach` (id:, range:, data: forms)

**Forms + Controls:** `Form`, `TextField` (label + binding), `SecureField`, `Toggle` (isOn:), `Picker` (selection:), `Slider` (value:in:step:), `Stepper`, `DatePicker`, `Button` (action:label:)

**Content:** `Text` (all init forms including attributed string), `Image` (systemName:, named:), `AsyncImage`, `Label`, `Link`, `Spacer`, `Divider`

**Shapes:** `Rectangle`, `Circle`, `Capsule`, `RoundedRectangle` (cornerRadius:), `Ellipse`, `Path`

**Presentation:** `TabView`, `Sheet` (modifier), `FullScreenCover` (modifier), `Alert`, `ConfirmationDialog`

**Toolbars:** `ToolbarItem`, `ToolbarItemGroup`

The best source: `https://developer.apple.com/documentation/swiftui` — you can copy-paste the initializer signatures for each view. I don't need the prose, just the signatures.

---

### Every SwiftUI modifier's signature and behavior
Same deal. I need signatures for every modifier in the Modifier union in CLAUDE.md, plus any I missed.

**Priority modifiers to document:**

Layout: `.frame(width:height:alignment:)`, `.frame(minWidth:idealWidth:maxWidth:minHeight:idealHeight:maxHeight:alignment:)`, `.padding(_:)`, `.padding(_:_:)`, `.fixedSize()`, `.fixedSize(horizontal:vertical:)`, `.offset(x:y:)`, `.position(x:y:)`, `.layoutPriority(_:)`

Appearance: `.foregroundColor(_:)`, `.foregroundStyle(_:)`, `.background(_:alignment:)`, `.background(_:ignoresSafeAreaEdges:)`, `.overlay(_:alignment:)`, `.opacity(_:)`, `.cornerRadius(_:)` (deprecated but everywhere), `.clipShape(_:style:)`, `.shadow(color:radius:x:y:)`, `.border(_:width:)`, `.tint(_:)`

Typography: `.font(_:)`, `.fontWeight(_:)`, `.fontDesign(_:)`, `.fontWidth(_:)`, `.lineLimit(_:)`, `.lineLimit(_:reservesSpace:)`, `.multilineTextAlignment(_:)`, `.lineSpacing(_:)`, `.tracking(_:)`, `.kerning(_:)`, `.textCase(_:)`, `.bold()`, `.italic()`, `.underline()`, `.strikethrough()`

List/Form specific: `.listStyle(_:)`, `.listRowInsets(_:)`, `.listRowSeparator(_:)`, `.listRowBackground(_:)`, `.listSectionSeparator(_:)`, `.formStyle(_:)`, `.labelStyle(_:)`

Navigation: `.navigationTitle(_:)`, `.navigationBarTitleDisplayMode(_:)`, `.navigationBarHidden(_:)`, `.toolbar(_:)`, `.toolbarBackground(_:for:)`, `.navigationDestination(for:destination:)`

Interaction: `.onTapGesture(count:perform:)`, `.onLongPressGesture(perform:)`, `.disabled(_:)`, `.allowsHitTesting(_:)`, `.contentShape(_:)`

Animation: `.animation(_:value:)`, `.transition(_:)`, `.scaleEffect(_:anchor:)`, `.rotationEffect(_:anchor:)`, `.blur(radius:opaque:)`, `.brightness(_:)`, `.contrast(_:)`, `.saturation(_:)`, `.hueRotation(_:)`, `.colorMultiply(_:)`

Environment: `.environment(_:_:)`, `.environmentObject(_:)`, `.preferredColorScheme(_:)`

---

## LAYER 3 — THE LAYOUT ENGINE

This is the most intellectually demanding layer. I need authoritative reference material.

### WWDC sessions — mandatory

**WWDC 2019 Session 237: "Building Custom Views with SwiftUI"**
This is the original session where Chris Eidhof explains the propose-accept-place algorithm. It's foundational. Feed me a transcript or detailed notes.

**WWDC 2022 Session 10056: "Compose custom layouts with SwiftUI"**
This formalizes the `Layout` protocol and makes the size negotiation contract explicit. This is the session that makes implementing the layout engine tractable. Feed me a transcript.

**WWDC 2022 Session 10058: "SwiftUI on iPad: Add toolbars, titles, and more"**
Covers navigation, toolbars, and layout in detail for complex screens.

**What to feed me:** The transcripts. These are available on the Apple Developer website and can be copied. They're the closest thing to a formal specification of SwiftUI's layout behavior.

---

### objc.io "The SwiftUI Layout System" series
Chris Eidhof's deep-dive series is the single best external reference for implementing the layout engine. It's an 11-episode video series on objc.io, but the book "Thinking in SwiftUI" covers the same material in text form.

**What to feed me:**
- The "Thinking in SwiftUI" book chapters covering layout — if you have access, copy-paste the relevant sections
- The free blog posts on objc.io covering layout: `https://www.objc.io/blog/2020/12/24/swiftui-layout-explained/`
- Their articles on specific layout behaviors: `alignmentGuide`, `GeometryReader`, `ViewThatFits`

---

### swiftui-lab.com deep-dive articles
Javier (swiftui-lab.com) has documented SwiftUI internals more thoroughly than anyone outside Apple. Specific articles I need:

- "Alignment Guides in SwiftUI" — `https://swiftui-lab.com/alignment-guides/`
- "GeometryReader to the Rescue" — `https://swiftui-lab.com/geometryreader-to-the-rescue/`
- "The Layout Protocol" (Part 1 + 2) — `https://swiftui-lab.com/layout-protocol-part-1/`
- "Fixed Size Modifier" — `https://swiftui-lab.com/fixed-size-modifier/`
- "Frame Modifier Deep Dive" — `https://swiftui-lab.com/frame-modifier-deep-dive/`
- "ScrollView — Pull to Refresh"
- "Inspecting the View Tree" series

**What to feed me:** Copy-paste the full text of each article into a context file. These are long but dense with exactly the behavioral edge cases that determine whether the layout engine is correct.

---

### HackingWithSwift layout articles
Paul Hudson's explanations are more practical and example-heavy:
- "How layout works in SwiftUI"
- "How to give a view a custom frame"
- "How padding works in SwiftUI"
- "How to use GeometryReader without breaking SwiftUI layout"

`https://www.hackingwithswift.com/books/ios-swiftui/how-layout-works-in-swiftui`

---

### The SwiftUI Field Guide
`https://www.swiftuifieldguide.com/` — interactive visualizations of layout behavior. More useful as a reference during debugging than as feed material, but the written explanations are worth copying.

---

### Specific layout behaviors to document precisely

For each of these, I need the exact rules — not a rough description:

**Spacer:** Takes all available space on the primary axis. Minimum size is 0 when the parent has no space to give. In HStack, expands horizontally. In VStack, expands vertically. Has a `minLength` parameter defaulting to the system minimum (usually 8pt).

**Text wrapping:** Single line vs multiline behavior. How `lineLimit` interacts with `fixedSize`. How Text proposes its own ideal width. The difference between `Text("hello")` in a constrained vs unconstrained width.

**Image:** Resizable vs non-resizable. How `.resizable()` changes layout behavior completely. `.scaledToFit()` vs `.scaledToFill()`. What size a non-resizable Image proposes.

**ZStack:** How it calculates its own size (max of all children on each axis). How alignment anchors work.

**Lazy containers:** How LazyVStack/LazyHStack differ from their eager counterparts for layout purposes (they don't actually differ much for static analysis — treat as equivalent).

**GeometryReader:** The one view that inverts the layout flow — it takes all the proposed space and gives the full size to its children. This is a critical special case.

**`.frame(maxWidth: .infinity)`:** This is everywhere in real apps. The exact behavior: it tells the view to take as much width as the parent proposes.

---

## LAYER 4 — THE RENDERER

### iOS Human Interface Guidelines
**What to feed me:** The HIG sections on:
- Typography — exact font sizes, weights, line heights for each text style
- Color — the full semantic color system, not just hex values but when to use each
- Layout — safe areas, margins, spacing system
- Navigation bars — height, title display modes, button placement
- Tab bars — height, icon sizes, safe area insets
- Lists — row heights, separator insets, section header/footer sizing
- Buttons — minimum tap target (44×44pt), default styles
- Forms — grouped vs inset grouped styling
- Controls — Toggle dimensions, Slider track height, Picker styles

URL: `https://developer.apple.com/design/human-interface-guidelines/`

---

### iOS system color definitions — both light and dark
The CLAUDE.md already has these, but I need confirmation they're current for iOS 18. Feed me the official Apple documentation page for `UIColor` system colors or the SwiftUI `Color` documentation that lists all semantic colors.

Also needed: the adaptive color behavior — how `Color.primary` maps differently in light vs dark mode.

---

### SF Symbols reference
**What to feed me:**
- The list of the most common 100 SF Symbols with their exact names
- The naming convention (e.g., `.fill` suffix, `.circle` suffix, number suffixes like `1.circle`)
- The weight/scale system — how symbol weight maps to font weight
- Which symbols require specific iOS versions

The SF Symbols app (macOS) is the canonical reference. If you have access, export the SVG paths for the 40-50 most common symbols and feed them to me directly. These become the `sfSymbols.ts` map.

---

### Font metrics lookup table validation
The CLAUDE.md has a lookup table for font sizes, weights, and line height multipliers. Feed me the Apple documentation that validates these values:

- `https://developer.apple.com/design/human-interface-guidelines/typography`
- The exact pixel/point values for each Dynamic Type text style (largeTitle through caption2)
- How these scale with accessibility sizes (you'll need to stub accessibility sizes, but knowing the base values is essential)

---

### Canvas 2D API reference
I'll be using the browser Canvas 2D API inside the VS Code WebView. Feed me:
- The MDN Canvas 2D context API documentation (the full method list)
- Specifically: `fillText`, `strokeText`, `measureText` (even though we won't use it for SwiftUI sizing, we need it for dynamic text), `fillRect`, `strokeRect`, `arc`, `bezierCurveTo`, `roundRect`, `createLinearGradient`, `save`/`restore`, `clip`, `transform`
- The `backdrop-filter: blur()` CSS property — needed for navigation bar frosted glass effect

---

## LAYER 5 — THE VS CODE EXTENSION

### VS Code Extension API
**What to feed me:**
- The VS Code Extension API documentation for: `WebviewPanel`, `WebviewView`, `Uri`, `workspace`, `window`, `commands`, `ExtensionContext`
- Specifically the WebView message passing API: `webview.postMessage()`, `webview.onDidReceiveMessage`
- How `vscode.Uri.joinPath` works for WASM loading (the Windows-safe path issue)
- `createFileSystemWatcher` API for watching `.swift` file changes
- `workspace.getConfiguration()` for persisting settings
- `window.onDidChangeActiveColorTheme` for theme sync

URL: `https://code.visualstudio.com/api/references/vscode-api`

**Feed me the sections on:** WebviewPanel, ExtensionContext, FileSystemWatcher, ColorTheme, workspace namespace, window namespace.

---

### VS Code WebView security model
The WebView has a Content Security Policy that restricts what you can load. Feed me:
- The VS Code WebView security documentation
- Specifically how to configure CSP to allow WASM execution, local font loading, and canvas operations
- How `webview.asWebviewUri()` works for loading local assets

---

### esbuild configuration for WASM assets
The build tool must copy the tree-sitter WASM binary into the extension output. Feed me:
- The esbuild documentation on `loader: { '.wasm': 'file' }` or `copy`
- How VS Code extensions structure their `out/` directory
- The `package.json` `contributes.commands` and `activationEvents` schema

---

## LAYER 6 — THE MCP SERVER

### MCP protocol specification
**What to feed me:**
- The full MCP specification: `https://spec.modelcontextprotocol.io`
- Specifically: the tool definition schema, the `CallToolRequest` and `CallToolResult` types, the stdio transport protocol
- The `@modelcontextprotocol/sdk` TypeScript package README and type definitions
- How to define a tool that returns an image (base64 encoded content)
- How Claude Code discovers and loads MCP servers from config

---

### MCP TypeScript SDK
Feed me the TypeScript types from `@modelcontextprotocol/sdk`:
- `Server` class API
- `Tool` definition interface
- `CallToolResult` with `content` array (text, image types)
- How `StdioServerTransport` works
- The `npx`-runnable server pattern (how to structure `package.json` so `npx swiftui-preview-mcp` works)

---

## LAYER 7 — SWIFT SYNTAX EDGE CASES

These are the specific parsing challenges that will break the extractor if I don't have explicit documentation.

### Property wrappers in view declarations
Feed me examples of how these appear in real source files:
```swift
@State private var isOn: Bool = false
@State private var count: Int = 0
@Binding var text: String
@ObservedObject var viewModel: MyViewModel
@StateObject private var vm = MyViewModel()
@Environment(\.colorScheme) var colorScheme
@EnvironmentObject var settings: AppSettings
```

For each: what the tree-sitter AST looks like (the node types and structure), and what stub value I should inject.

---

### ViewBuilder closure patterns
Feed me the AST structure for:
```swift
// Trailing closure (most common)
VStack {
    Text("Hello")
    Text("World")
}

// With parameters
VStack(alignment: .leading, spacing: 8) {
    Text("Hello")
}

// Conditional
VStack {
    if showDetails {
        DetailView()
    } else {
        SummaryView()
    }
}

// ForEach patterns
ForEach(items) { item in
    Text(item.title)
}

ForEach(0..<5) { index in
    Text("Item \(index)")
}

ForEach(items, id: \.self) { item in
    Text(item)
}
```

The key question for each: what are the tree-sitter node types and how do I identify the children of the ViewBuilder closure?

---

### Modifier chain AST structure
This is where most extractors fail. Feed me the exact AST for:
```swift
Text("Hello")
    .font(.title)
    .foregroundColor(.blue)
    .padding()
    .background(Color.red)
```

The tree-sitter parse tree for a modifier chain is a nested structure where each `.modifier()` wraps the previous expression as a `call_expression`. I need to know the exact field names and nesting order so I can walk the chain correctly and reverse it.

---

### Color literal patterns
Feed me examples of every way a color appears in SwiftUI source:
```swift
.foregroundColor(.blue)                    // implicit Color. member
.foregroundColor(Color.blue)               // explicit Color. member
.foregroundColor(.init(red: 1, green: 0, blue: 0))  // Color init
.foregroundColor(Color(hex: "#FF0000"))    // custom init (treat as unknown)
.foregroundColor(.primary)                 // semantic color
.foregroundColor(.accentColor)             // accent
.background(Color.red.opacity(0.5))        // chained modifier on Color
```

And the corresponding tree-sitter node types for each.

---

### Custom view call sites
```swift
// No-argument custom view
MyCustomRow()

// With labeled arguments  
ProfileCard(user: user, isSelected: true)

// With trailing closure
CustomContainer {
    Text("child")
}
```

I need to know how to distinguish a custom view call from a built-in view call, and how to extract the argument labels and values for `CustomViewNode`.

---

## LAYER 8 — DEVICE FRAME REFERENCE

### Physical device dimensions
Feed me the confirmed logical point dimensions (not physical pixels) for every device in the device selector:
- iPhone 16 Pro: 393 × 852 pt
- iPhone 16: 390 × 844 pt
- iPhone 16 Pro Max: 430 × 932 pt
- iPhone 15: 390 × 844 pt
- iPhone SE 3rd gen: 375 × 667 pt
- iPad Pro 13": 1024 × 1366 pt
- iPad mini: 744 × 1133 pt

Source: `https://www.screensizes.app` or Apple's official HIG device table.

Also needed: safe area insets for each device (top/bottom), Dynamic Island dimensions (iPhone 16 Pro), notch dimensions (older iPhones), status bar heights.

---

### Dynamic Island specification
The iPhone 16 Pro has a Dynamic Island, not a notch. Feed me:
- Its exact dimensions in points (approximately 126 × 37 pt)
- Its exact position (centered, 11pt from top)
- The corner radius
- How the status bar wraps around it

---

## LAYER 9 — NAVIGATION TRANSITIONS

### iOS navigation push/pop animation specification
The exact values used in iOS navigation transitions:

Feed me documentation or blog posts that have measured the actual iOS navigation animation curves. The best source is the `swiftui-lab.com` articles on transitions, or iOS developer blog posts that have reverse-engineered the timing.

Key values I need confirmed:
- Total push duration (approximately 350ms)
- The cubic-bezier curve (approximately 0.42, 0, 0.58, 1.0 for the main content)
- How far the outgoing screen translates (approximately 30% left)
- The opacity fade of the outgoing screen
- The navigation title cross-fade timing
- The back button fade-in timing

---

## LAYER 10 — TESTING FIXTURES

### Real SwiftUI files to test against
The most valuable thing you can feed me is **actual SwiftUI view files from your own project** — the real iOS app you're building. These become the test fixtures.

For each file, the expected output is "it should render something that looks like this screen." That's the ground truth.

**Priority files to feed me:**
- Your simplest view (a single Text or VStack with a few children)
- A List with a ForEach
- A Form with multiple sections and controls
- A NavigationStack with NavigationLink rows
- A view with custom colors and styling
- A TabView

Feed these as the files in `tests/fixtures/` from day one.

---

## HOW TO ACTUALLY FEED ME THIS MATERIAL

### Option A — In CLAUDE.md
For small reference tables (font sizes, device dimensions, color values, SF Symbol names), paste them directly into CLAUDE.md under a new Section 16: "Reference Data."

### Option B — Separate reference files in the repo
Create a `docs/reference/` directory:
```
docs/reference/
  swiftui-layout-contract.md     ← WWDC transcripts + objc.io notes
  swiftui-modifiers.md           ← all modifier signatures
  swiftui-views.md               ← all view init signatures
  tree-sitter-swift-nodes.md     ← node types from node-types.json
  ios-colors.md                  ← full semantic color table
  device-dimensions.md           ← all device specs
  sf-symbols.md                  ← symbol names + SVG paths
  ast-examples.md                ← tree-sitter parse trees for tricky Swift
```

Claude Code reads files you point it at. At the start of a session working on the layout engine, you say "read docs/reference/swiftui-layout-contract.md before starting." I read it and build against the actual spec rather than my training data.

### Option C — Feed per-session for deep work
When working on a specific stage, paste the relevant documentation directly into the chat. Working on Text layout? Paste the Typography HIG section. Working on modifier extraction? Paste the tree-sitter node types for call expressions.

---

## PRIORITY ORDER — WHAT TO COLLECT FIRST

If you're starting Phase 1 tomorrow, collect in this order:

1. `node-types.json` from tree-sitter-swift — **cannot start the extractor without this**
2. 10-15 corpus test files from tree-sitter-swift showing modifier chains, trailing closures, if/else — **needed for every extractor**
3. The `web-tree-sitter` TypeScript type definitions — **needed for treeSitterSetup.ts**
4. Your own actual `.swift` files as test fixtures — **needed to know if anything works**
5. WWDC 2019 Session 237 transcript — **needed before touching the layout engine**
6. WWDC 2022 Session 10056 transcript — **needed before touching the layout engine**
7. The objc.io layout blog post — **needed before touching the layout engine**
8. The swiftui-lab.com frame modifier and fixed-size articles — **needed for `.frame()` and `Spacer`**
9. The full Apple HIG typography table — **needed for the font metrics table**
10. The full Apple HIG device dimensions table — **needed for the device frame system**\
