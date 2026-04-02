CLAUDE.md — Global Rules for SwiftUI Preview VS Code Extension
> This file is the single source of truth for Claude's behavior on this project.
> Place at the root of the repository. Claude Code reads it automatically every session.
> Every decision, constraint, and architectural rule in here came from explicit conversations
> with the developer. Do not override or "improve" these decisions unless the developer asks.
---
1. PROJECT IDENTITY
What this is
A personal VS Code extension that parses SwiftUI source files and renders a live, interactive,
Apple-native-feeling preview inside a WebView panel — without requiring macOS, Xcode, or any
Apple runtime. The developer is building real Swift/SwiftUI apps on Windows and needs fast,
accurate UI feedback during development.
The developer's exact situation
OS: Windows (not Linux, not macOS — Windows specifically)
Goal: use this tool until a Mac is purchased — this is time-bounded personal tooling
Not building a product or startup — this is purely a personal development aid
Building real SwiftUI apps using pure Apple frameworks only (no third-party Swift packages)
UI types being built: custom layouts, animations, navigation flows, data-heavy lists,
forms, settings screens — and anything else SwiftUI supports. The scope is the entire
SwiftUI surface area, not a subset.
The north star
> Parse any SwiftUI file → extract the full view tree → render an approximate but
> visually faithful, Apple-native-feeling preview in HTML/Canvas with device frame chrome.
> The developer should be able to look at the preview and trust it as a reasonable
> representation of what their app looks like on a real iPhone.
What this is NOT
Not a simulator. Never executes Swift code.
Not a replacement for Xcode long-term.
Not a product for other users.
Not trying to achieve pixel-perfect fidelity — approximate native feel is the goal.
Not connected to macOS, Xcode, or any remote machine in this codebase.
---
2. TECHNICAL STACK — LOCKED
Do not suggest alternatives to any of these unless the developer explicitly opens the question.
Do not add npm packages without justification. Every dependency must earn its place.
Layer	Technology	Notes
Swift parser	`web-tree-sitter` (WASM) + `tree-sitter-swift` grammar	Real AST, zero Swift runtime
Extension host	TypeScript + VS Code Extension API	Native to VS Code
Preview panel	VS Code WebView (HTML + Canvas 2D + CSS)	Runs inside editor
IR format	TypeScript discriminated union types	Type-safe, JSON-serializable
Theming	CSS custom properties — two complete theme sets	Light + dark, iOS-accurate colors
Font approximation	Inter (loaded in WebView) with size lookup table	SF Pro substitute
SF Symbols	SVG icon map built into the extension	Approximate, not exact
Build tool	esbuild	Fast, handles WASM assets correctly
Package manager	npm	No switching
Platform	Windows	All path handling via Node `path` module only
Never suggest:
Running Swift locally (no Swift runtime on Windows)
Connecting to a remote Mac (future phase, explicitly out of scope for this entire codebase)
Python for any part of this pipeline
Electron APIs directly
Replacing tree-sitter with a hand-rolled parser
React, Vue, or any frontend framework inside the WebView — vanilla HTML/Canvas/CSS only
---
3. ARCHITECTURE — THE FULL PIPELINE
Every piece of code maps to exactly one stage. Never mix stage concerns.
When answering questions or writing code, always state which stage you are in.
```
Swift source file (.swift)  [Windows path, CRLF normalized]
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 1: PARSER                            │
│  web-tree-sitter + tree-sitter-swift WASM   │
│  Input:  raw Swift source string            │
│  Output: tree-sitter SyntaxNode tree        │
│  Rules:  never throw — return UnknownNode   │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 2: EXTRACTOR                         │
│  AST Walker + per-view-type extractors      │
│  Input:  SyntaxNode tree                    │
│  Output: ViewNode IR (typed TS objects)     │
│  Rules:  pure functions, no side effects    │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 3: RESOLVER                          │
│  Modifier flattener, stub injector          │
│  Input:  raw ViewNode tree                  │
│  Output: resolved ViewNode tree             │
│  Rules:  inject stubs for @State/@Binding   │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 4: LAYOUT ENGINE                     │
│  SwiftUI propose → accept → place algorithm │
│  Input:  resolved ViewNode tree             │
│  Output: LayoutResult tree (pos + sizes)    │
│  Rules:  implement SwiftUI contract exactly │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 5: RENDERER                          │
│  HTML Canvas 2D painter                     │
│  Input:  LayoutResult tree + active theme   │
│  Output: pixels in WebView canvas           │
│  Rules:  Apple-native feel, fully themed    │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 6: DEVICE FRAME                      │
│  Device chrome overlay                      │
│  Input:  rendered canvas + selected device  │
│  Output: preview inside device mockup       │
│  Rules:  iPhone 16 Pro default, dropdown    │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│  STAGE 7: INTERACTION                       │
│  Input events → navigation state machine    │
│  NavigationLink taps → push transition      │
│  Back button → pop transition               │
└─────────────────────────────────────────────┘
```
---
4. THE IR — CORE DATA STRUCTURE (SINGLE SOURCE OF TRUTH)
`src/ir/types.ts` is the most important file in the codebase.
All stages communicate through these types. Never bypass them.
Extend when new view types are needed. Never remove existing variants.
Complete ViewNode union
```typescript
export type ViewNode =
  // Layout containers
  | VStackNode | HStackNode | ZStackNode
  | ScrollViewNode | GeometryReaderNode
  // Navigation
  | NavigationStackNode | NavigationLinkNode | NavigationViewNode
  // Lists and collections
  | ListNode | ForEachNode | LazyVStackNode | LazyHStackNode
  | LazyVGridNode | LazyHGridNode | SectionNode
  // Forms and controls
  | FormNode | GroupNode
  | TextFieldNode | SecureFieldNode
  | ToggleNode | PickerNode
  | SliderNode | StepperNode | DatePickerNode
  | ButtonNode | MenuNode | ContextMenuNode
  // Content
  | TextNode | ImageNode | AsyncImageNode
  | LabelNode | LinkNode
  | SpacerNode | DividerNode
  // Shapes
  | RectangleNode | CircleNode | CapsuleNode
  | RoundedRectangleNode | EllipseNode | PathNode
  // Special
  | TabViewNode | TabItemNode
  | SheetNode | AlertNode | ConfirmationDialogNode
  | ToolbarNode | ToolbarItemNode
  | CustomViewNode   // unresolved custom view reference
  | UnknownNode      // ALWAYS the final fallback — never omit this

export interface BaseNode {
  kind: string
  modifiers: Modifier[]
  id: string
  sourceRange?: { start: number; end: number }
}
```
Complete Modifier union
```typescript
export type Modifier =
  // Layout
  | { kind: "frame"; width?: SizeValue; height?: SizeValue;
      minWidth?: SizeValue; maxWidth?: SizeValue;
      minHeight?: SizeValue; maxHeight?: SizeValue;
      alignment?: Alignment }
  | { kind: "padding"; edges: EdgeSet; amount: SizeValue }
  | { kind: "offset"; x: number; y: number }
  | { kind: "position"; x: number; y: number }
  | { kind: "fixedSize"; horizontal: boolean; vertical: boolean }
  // Appearance
  | { kind: "foregroundColor"; color: ColorValue }
  | { kind: "foregroundStyle"; style: ShapeStyle }
  | { kind: "background"; content: ViewNode | ColorValue }
  | { kind: "overlay"; content: ViewNode; alignment: Alignment }
  | { kind: "opacity"; value: number }
  | { kind: "cornerRadius"; radius: number }
  | { kind: "clipShape"; shape: string }
  | { kind: "shadow"; color: ColorValue; radius: number; x: number; y: number }
  | { kind: "border"; color: ColorValue; width: number }
  // Typography
  | { kind: "font"; style: FontStyle; custom?: string }
  | { kind: "fontWeight"; weight: FontWeight }
  | { kind: "fontDesign"; design: FontDesign }
  | { kind: "lineLimit"; value: number | null }
  | { kind: "multilineTextAlignment"; alignment: TextAlignment }
  | { kind: "lineSpacing"; value: number }
  | { kind: "tracking"; value: number }
  | { kind: "kerning"; value: number }
  // Interaction
  | { kind: "onTapGesture"; stub: true }
  | { kind: "onLongPressGesture"; stub: true }
  | { kind: "disabled"; value: boolean }
  | { kind: "contentShape"; shape: string }
  // Navigation and presentation
  | { kind: "navigationTitle"; title: string }
  | { kind: "navigationBarTitleDisplayMode"; mode: string }
  | { kind: "toolbar"; items: ViewNode[] }
  | { kind: "sheet"; isPresented: string; content: ViewNode }
  | { kind: "fullScreenCover"; isPresented: string; content: ViewNode }
  | { kind: "alert"; title: string; stub: true }
  // List and form
  | { kind: "listStyle"; style: ListStyle }
  | { kind: "listRowInsets"; insets: EdgeInsets }
  | { kind: "listRowSeparator"; visibility: string }
  | { kind: "formStyle"; style: string }
  // Animation
  | { kind: "animation"; type: AnimationType; stub: true }
  | { kind: "transition"; type: TransitionType; stub: true }
  | { kind: "scaleEffect"; x: number; y: number; anchor: Alignment }
  | { kind: "rotationEffect"; angle: number }
  // Fallback
  | { kind: "unknown"; name: string; rawArgs: string }
```
Critical modifier rules
Order is sacred. `.padding().background()` produces a different layout than
`.background().padding()`. Always store as an ordered array. Never flatten into an object.
Unknown modifiers go into `{ kind: "unknown", name, rawArgs }` — never dropped, never thrown.
Modifier chains in the AST appear as nested call expressions where the outermost call
is the last modifier applied. Walk right-to-left, collect into array, then reverse before storing.
---
5. THE LAYOUT ENGINE — DEEP IMPLEMENTATION
The developer explicitly wants a deep, complete, correct implementation of the SwiftUI layout
algorithm. This is a personal intellectual goal, not a pragmatic shortcut to be optimized away.
Do not suggest simplified approximations for the layout engine. Implement it properly.
The SwiftUI layout contract (sacred)
```
1. Parent proposes a ProposedSize to the child
   (.infinity on an axis means "take as much as you want")
2. Child returns the ConcreteSize it needs
   (never larger than proposed UNLESS it has a fixed .frame modifier)
3. Parent places the child at a Point within its own coordinate space
```
Every view node must implement:
```typescript
interface LayoutView {
  layout(proposed: ProposedSize, env: LayoutEnvironment): ConcreteSize
  place(origin: Point, size: ConcreteSize): LayoutResult
}

type ProposedSize = {
  width: number | "infinity" | "unspecified"
  height: number | "infinity" | "unspecified"
}
```
Layout implementation priority order
Implement strictly in this sequence. Each phase must have passing unit tests before moving on.
Phase A — Foundation
`Text` — single line, wrapping, font metrics from lookup table
`VStack` — flexible children, fixed children, spacing, alignment axes
`HStack` — same contract on the perpendicular axis
`ZStack` — overlay, alignment anchors
`Spacer` — greedy on primary axis, zero on cross axis
`.frame()` modifier — fixed, min/max, maxWidth: .infinity variants
`.padding()` modifier — all edges, specific edges, EdgeInsets
Phase B — Scrolling and Lists
8. `ScrollView` — proposes .infinity on scroll axis to child
9. `List` — inset grouped style, row height inference, section headers/footers
10. `ForEach` — stub rules below
11. `LazyVStack` / `LazyHStack` — treat as VStack/HStack in preview
12. `Section` — header + content + footer layout
Phase C — Navigation
13. `NavigationStack` — renders nav bar chrome + current destination
14. `NavigationLink` — renders as tappable row with chevron.right
15. Push transition — slide animation (see Section 7)
Phase D — Forms and Controls
16. `Form` — inset grouped iOS chrome
17. `TextField` / `SecureField` — text input appearance, placeholder
18. `Toggle` — iOS switch chrome, ON/OFF states
19. `Picker` — inline, wheel, menu variants
20. `Slider` — track + thumb chrome
21. `Stepper` — +/- button chrome
22. `DatePicker` — compact mode only
Phase E — Shapes and Effects
23. `Rectangle`, `Circle`, `RoundedRectangle`, `Capsule`, `Ellipse`
24. `.shadow()`, `.blur()`, `.cornerRadius()`, `.clipShape()`
25. `.scaleEffect()`, `.rotationEffect()`, `.offset()`
Phase F — Advanced
26. `GeometryReader` — inverts layout flow: gives child full proposed size
27. `TabView` — tab bar chrome + active tab content
28. `.overlay()` and `.background()` with view content (not just color)
29. `CustomViewNode` — look up definition in same file and inline it
Stub rules — exhaustive and explicit
SwiftUI Feature	Stub Behavior
`@State` var	Render with zero / empty string / false / nil default
`@Binding` var	Same as @State stub
`@ObservedObject` / `@StateObject`	All published properties as type defaults
`@Environment`	Use iOS default environment values
`ForEach` over dynamic data	Render exactly 3 placeholder rows
`ForEach` over static literal array	Render actual items from the array
`AsyncImage`	Gray placeholder box + SF Symbol `photo`
`Sheet` / `FullScreenCover`	Not presented by default
`Alert` / `ConfirmationDialog`	Ignored entirely
`Animation` modifier	Render final non-animated state
`Transition` modifier	Render as if transition completed
Custom `Layout` protocol	Render children in VStack fallback
`Canvas` view	Gray box labeled "Canvas"
`UIViewRepresentable`	Gray box with type name
`DatePicker` full calendar	Compact display mode only
`withAnimation` blocks	Evaluate without animation
`matchedGeometryEffect`	Ignored — render normally
`PhaseAnimator` / `KeyframeAnimator`	Render first phase only
`TimelineView`	Render with zero time
All stubs must include a comment: `// STUB: <reason>`
Font metrics lookup table — never use canvas.measureText()
```typescript
export const SWIFTUI_FONT_SIZES: Record<FontStyle, number> = {
  largeTitle: 34, title: 28, title2: 22, title3: 20,
  headline: 17, body: 17, callout: 16, subheadline: 15,
  footnote: 13, caption: 12, caption2: 11,
}

export const SWIFTUI_FONT_WEIGHTS: Record<FontStyle, number> = {
  largeTitle: 700, title: 700, title2: 700, title3: 600,
  headline: 600, body: 400, callout: 400, subheadline: 400,
  footnote: 400, caption: 400, caption2: 400,
}

export const SWIFTUI_LINE_HEIGHT_MULTIPLIERS: Record<FontStyle, number> = {
  largeTitle: 1.21, title: 1.21, title2: 1.23, title3: 1.25,
  headline: 1.29, body: 1.29, callout: 1.31, subheadline: 1.33,
  footnote: 1.38, caption: 1.42, caption2: 1.45,
}
```
---
6. APPLE NATIVE FEEL — RENDERING RULES
The developer explicitly wants the preview to feel like iOS. This is a first-class requirement.
Every rendered component should look like it belongs in an iOS app, not a web app.
iOS System Colors — complete, both themes
```typescript
export const IOS_COLORS = {
  light: {
    label:              "#000000",
    secondaryLabel:     "rgba(60,60,67,0.6)",
    tertiaryLabel:      "rgba(60,60,67,0.3)",
    quaternaryLabel:    "rgba(60,60,67,0.18)",
    systemFill:         "rgba(120,120,128,0.2)",
    secondarySystemFill:"rgba(120,120,128,0.16)",
    tertiarySystemFill: "rgba(118,118,128,0.12)",
    quaternarySystemFill:"rgba(116,116,128,0.08)",
    systemBackground:                  "#ffffff",
    secondarySystemBackground:         "#f2f2f7",
    tertiarySystemBackground:          "#ffffff",
    systemGroupedBackground:           "#f2f2f7",
    secondarySystemGroupedBackground:  "#ffffff",
    tertiarySystemGroupedBackground:   "#f2f2f7",
    separator:        "rgba(60,60,67,0.29)",
    opaqueSeparator:  "#c6c6c8",
    systemBlue:   "#007aff", systemGreen:  "#34c759",
    systemIndigo: "#5856d6", systemOrange: "#ff9500",
    systemPink:   "#ff2d55", systemPurple: "#af52de",
    systemRed:    "#ff3b30", systemTeal:   "#5ac8fa",
    systemYellow: "#ffcc00", systemGray:   "#8e8e93",
    systemGray2:  "#aeaeb2", systemGray3:  "#c7c7cc",
    systemGray4:  "#d1d1d6", systemGray5:  "#e5e5ea",
    systemGray6:  "#f2f2f7", accentColor:  "#007aff",
  },
  dark: {
    label:              "#ffffff",
    secondaryLabel:     "rgba(235,235,245,0.6)",
    tertiaryLabel:      "rgba(235,235,245,0.3)",
    quaternaryLabel:    "rgba(235,235,245,0.18)",
    systemFill:         "rgba(120,120,128,0.36)",
    secondarySystemFill:"rgba(120,120,128,0.32)",
    tertiarySystemFill: "rgba(118,118,128,0.24)",
    quaternarySystemFill:"rgba(116,116,128,0.18)",
    systemBackground:                  "#000000",
    secondarySystemBackground:         "#1c1c1e",
    tertiarySystemBackground:          "#2c2c2e",
    systemGroupedBackground:           "#000000",
    secondarySystemGroupedBackground:  "#1c1c1e",
    tertiarySystemGroupedBackground:   "#2c2c2e",
    separator:        "rgba(84,84,88,0.6)",
    opaqueSeparator:  "#38383a",
    systemBlue:   "#0a84ff", systemGreen:  "#30d158",
    systemIndigo: "#5e5ce6", systemOrange: "#ff9f0a",
    systemPink:   "#ff375f", systemPurple: "#bf5af2",
    systemRed:    "#ff453a", systemTeal:   "#64d2ff",
    systemYellow: "#ffd60a", systemGray:   "#8e8e93",
    systemGray2:  "#636366", systemGray3:  "#48484a",
    systemGray4:  "#3a3a3c", systemGray5:  "#2c2c2e",
    systemGray6:  "#1c1c1e", accentColor:  "#0a84ff",
  }
}
```
Theme sync
When VS Code is in a dark theme → use `IOS_COLORS.dark`
When VS Code is in a light theme → use `IOS_COLORS.light`
Listen for `vscode.window.onDidChangeActiveColorTheme` and re-render on change
The developer can also manually toggle light/dark in the preview panel toolbar
SF Symbols
Maintain `src/renderer/sfSymbols.ts` — a map of symbol name → SVG path data
Prioritize the most common symbols first: `chevron.right`, `chevron.left`,
`plus`, `minus`, `xmark`, `checkmark`, `star`, `star.fill`, `heart`, `heart.fill`,
`person`, `person.fill`, `house`, `house.fill`, `gear`, `magnifyingglass`,
`bell`, `bell.fill`, `trash`, `trash.fill`, `pencil`, `square.and.arrow.up`,
`photo`, `camera`, `location`, `arrow.left`, `arrow.right`, `ellipsis`
Unknown symbols → render a rounded square with a `?` inside
Symbol rendering weight inherits from surrounding font context
Never substitute emoji for SF Symbols
Font rendering
Load `Inter` font in the WebView HTML (from Google Fonts CDN or bundled)
Map weights: `.headline` → 600, `.title` → 700, `.body` → 400, `.caption` → 400
`FontDesign.monospaced` → `'SF Mono', 'Fira Code', monospace`
`FontDesign.serif` → `'New York', Georgia, serif`
`FontDesign.rounded` → Inter with slight letter-spacing adjustment
iOS Chrome — must feel native
Navigation bar:
Height: 44pt (plus 44pt status bar safe area = 88pt top inset total)
Large title mode: additional 52pt section, 34pt bold text
Inline mode: 17pt semibold, centered
Back button: `chevron.left` symbol + truncated previous screen title or "Back"
Background: `systemBackground` at 85% opacity + `backdrop-filter: blur(20px)`
Tab bar:
Height: 49pt + 34pt home indicator safe area
Selected: `accentColor` tint on icon and label
Unselected: `systemGray`
List / Form inset grouped style:
Page background: `systemGroupedBackground`
Cell background: `secondarySystemGroupedBackground`
Group corner radius: 10pt
Cell separator: 1px `separator` color, inset 16pt from left edge
Minimum cell height: 44pt
Section header: 13pt uppercase `secondaryLabel`, 6pt gap above group
Section footer: 13pt `secondaryLabel`, 6pt gap below group
Toggle:
Track: 51 × 31pt, cornerRadius 15.5pt
ON state: `systemGreen` track, white circle thumb at right
OFF state: `systemGray3` track, white circle thumb at left
TextField:
Rounded rect style: `systemFill` background, cornerRadius 10pt, 16pt horizontal padding
Plain style: bottom separator line only
Placeholder: `tertiaryLabel` color
---
7. NAVIGATION — PUSH TRANSITION
Navigation is a first-class feature. The developer explicitly wants push transitions, not flat rendering.
NavigationStack rendering
Always render a native nav bar chrome at the top
Root view = `NavigationStack`'s root content
`NavigationLink` = tappable list row with `chevron.right` disclosure indicator
Tapping a `NavigationLink` in the preview triggers a push transition
Push transition spec
```
Duration: 350ms
Easing:   cubic-bezier(0.42, 0, 0.58, 1.0)  — matches iOS spring

Current screen:     translateX(0)      → translateX(-30%)  + fade to 0.7 opacity
Destination screen: translateX(100%)   → translateX(0)     + fade to 1.0 opacity
Nav bar title:      cross-fade, 150ms delay
Back button:        fade in on destination, 150ms delay
```
Pop transition (back button)
Reverse of push. Back button appears in nav bar as `chevron.left` + previous title.
Navigation state (lives in WebView)
```typescript
interface NavigationState {
  stack: ViewNode[]
  currentIndex: number
  isAnimating: boolean
  animationDirection: "push" | "pop" | null
}
```
---
8. ANIMATIONS — APPROXIMATED, NOT SKIPPED
The developer wants approximated iOS animations, not completely ignored ones.
Animation curves
SwiftUI	CSS equivalent
`.easeInOut(duration:)`	`cubic-bezier(0.42, 0, 0.58, 1.0)`
`.easeIn(duration:)`	`cubic-bezier(0.42, 0, 1.0, 1.0)`
`.easeOut(duration:)`	`cubic-bezier(0, 0, 0.58, 1.0)`
`.linear(duration:)`	`linear`
`.spring()`	`cubic-bezier(0.34, 1.56, 0.64, 1)`
`.bouncy`	`cubic-bezier(0.34, 1.8, 0.64, 1)`
`.snappy`	`cubic-bezier(0.2, 0, 0, 1.0)` short duration
`.interactiveSpring`	Same as `.spring()`
Transition implementations
SwiftUI Transition	Implementation
`.opacity`	CSS opacity 0→1
`.slide`	translateX(-100%) → 0
`.scale`	scale(0.85) + opacity 0 → scale(1) + opacity 1
`.move(edge: .leading)`	translateX(-100%) → 0
`.move(edge: .trailing)`	translateX(100%) → 0
`.move(edge: .top)`	translateY(-100%) → 0
`.move(edge: .bottom)`	translateY(100%) → 0
`.push(from:)`	slide + slight scale
`.asymmetric`	separate in/out curves
What stays fully stubbed (render final state only)
`withAnimation` blocks affecting `@State`
`matchedGeometryEffect`
`PhaseAnimator`
`KeyframeAnimator`
`TimelineView`
---
9. DEVICE FRAME SYSTEM
Default device: iPhone 16 Pro
All layout calculations default to iPhone 16 Pro logical dimensions: 393 × 852 pt
Device dropdown
The developer explicitly wants a dropdown selector in the preview panel UI.
```typescript
export const SUPPORTED_DEVICES: Device[] = [
  // iPhones — primary
  { id: "iphone16pro",     name: "iPhone 16 Pro",       w: 393,  h: 852,  platform: "ios",     r: 55 },
  { id: "iphone16",        name: "iPhone 16",            w: 390,  h: 844,  platform: "ios",     r: 55 },
  { id: "iphone16promax",  name: "iPhone 16 Pro Max",    w: 430,  h: 932,  platform: "ios",     r: 55 },
  { id: "iphone15",        name: "iPhone 15",            w: 390,  h: 844,  platform: "ios",     r: 55 },
  { id: "iphoneSE3",       name: "iPhone SE 3rd gen",    w: 375,  h: 667,  platform: "ios",     r: 40 },
  // iPads
  { id: "ipadPro13",       name: "iPad Pro 13\"",        w: 1024, h: 1366, platform: "ios",     r: 20 },
  { id: "ipadMini",        name: "iPad mini",            w: 744,  h: 1133, platform: "ios",     r: 20 },
  // Android — secondary
  { id: "pixel9",          name: "Pixel 9",              w: 412,  h: 917,  platform: "android", r: 40 },
  { id: "pixel9pro",       name: "Pixel 9 Pro",          w: 412,  h: 917,  platform: "android", r: 40 },
  { id: "galaxyS25",       name: "Samsung Galaxy S25",   w: 360,  h: 780,  platform: "android", r: 40 },
  { id: "galaxyS25ultra",  name: "Galaxy S25 Ultra",     w: 384,  h: 824,  platform: "android", r: 40 },
]
```
Dropdown UI
Position: top-right corner of preview panel
Persists selection to VS Code workspace state (survives extension reload)
Default: `iphone16pro`
Shows device name + small icon indicating form factor
Device chrome details
iPhone 16 Pro / Max: Dynamic Island cutout at top center
iPhone 15 and older notched models: notch cutout
iPhone SE 3: traditional top bezel + home button at bottom
Status bar height: 44pt for Face ID iPhones, 20pt for SE
Home indicator bar: 5 × 134pt rounded pill, 8pt from bottom
Physical buttons drawn on frame as decorative outlines (non-interactive)
Android devices: render with Material You style chrome when selected
---
10. WINDOWS-SPECIFIC RULES
These apply throughout the entire codebase. No exceptions.
File paths: Always use Node's `path` module. Never concatenate with `/` or `\`.
Use `path.join()` and `path.resolve()` everywhere.
WASM loading: Construct the tree-sitter WASM file path using `vscode.Uri.joinPath`
relative to `context.extensionUri` — never a raw string path.
File watching: Use `vscode.workspace.createFileSystemWatcher` — handles Windows
NTFS events correctly. Do not use Node's `fs.watch` directly.
Line endings: Swift files on Windows may have CRLF. Always normalize before parsing:
```typescript
  const normalized = source.replace(/\r\n/g, '\n')
  ```
Shell commands: There are none. This extension never calls `exec` or `spawn`.
No Swift compiler, no Xcode, no shell scripts.
---
11. CODING STANDARDS
TypeScript config
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```
No `any`. Use `unknown` and narrow with type guards. No exceptions.
Error handling — the fallback hierarchy
```
Stage 1 (Parser)    → catch all → return UnknownNode, log to OutputChannel
Stage 2 (Extractor) → catch all → return UnknownNode, log to OutputChannel
Stage 3 (Resolver)  → catch all → return node unmodified, log warning
Stage 4 (Layout)    → catch all → clamp size to zero, log warning
Stage 5 (Renderer)  → catch all → draw red error placeholder box with message
Stage 6 (Device)    → catch all → render content without chrome
Extension host      → surface to user via VS Code error notification
```
One broken view must never prevent sibling views from rendering.
Wrap every recursive call in try/catch at the per-view level.
Naming conventions (mandatory)
```typescript
parseXxx(node: SyntaxNode): ViewNode
resolveXxx(node: ViewNode, env: Env): ViewNode
layoutXxx(node: ViewNode, proposed: ProposedSize): LayoutResult
renderXxx(result: LayoutResult, ctx: CanvasRenderingContext2D): void
```
File structure (canonical)
```
CLAUDE.md
src/
  extension/
    extension.ts           ← VS Code entry, panel lifecycle
    webviewBridge.ts       ← host ↔ webview message passing
    outputChannel.ts       ← centralized logging
  parser/
    index.ts               ← public API: parseSwiftFile(src) → ViewNode[]
    treeSitterSetup.ts     ← WASM init, grammar loading, Windows-safe paths
    astWalker.ts           ← depth-first traversal, visitor dispatch
    extractors/
      views/               ← one file per view type
      modifiers/           ← one file per modifier group
  ir/
    types.ts               ← ALL types (single source of truth)
    builders.ts            ← factory functions
    guards.ts              ← isXxxNode() type guards
  resolver/
    index.ts
    stateStubber.ts
    modifierFlattener.ts
  layout/
    engine.ts
    environment.ts
    fontMetrics.ts
    views/                 ← one file per view type
    modifiers/
  renderer/
    index.ts
    canvas.ts
    iosColors.ts
    sfSymbols.ts
    fonts.ts
    components/            ← iOS chrome components
  device/
    index.ts
    devices.ts
    chrome.ts
    selector.ts
  navigation/
    stateMachine.ts
    transition.ts
  webview/
    index.html
    preview.ts
    themeSync.ts
tests/
  parser/
  layout/
  fixtures/                ← .swift snippet files
```
---
12. WHAT CLAUDE MUST ALWAYS DO
## Reference library
All research is organized in `docs/reference/`. Read `docs/reference/INDEX.md` before
working on any stage — it maps every topic to its exact file and contains the node name
traps table, constants, and stub rules.
At session start for parser work:  `docs/reference/layer-1-grammar/node-types.md`
At session start for layout work:  `docs/reference/layer-4-layout/core-containers.md`
At session start for renderer work: `docs/reference/layer-5-hig/touch-typography-colors.md`

State the stage at the start of every code response: "Working in Stage 2 (Extractor)..."
Use real tree-sitter node type names from the `tree-sitter-swift` grammar — never abstract descriptions
Write complete, runnable TypeScript — no pseudocode, no "you'd do something like..."
Cite SwiftUI layout authority when making layout decisions:
objc.io "The SwiftUI Layout System"
swiftui-lab.com
WWDC 2019 Session 237
WWDC 2022 Session 10056
Mark every stub in code: `// STUB: <reason>`
Use Windows-safe path handling in every file touching the filesystem
Normalize CRLF to LF before any Swift source reaches tree-sitter
Extend existing IR types rather than creating parallel type systems
Wrap recursive layout/render calls in try/catch at the per-view level
---
13. WHAT CLAUDE MUST NEVER DO
Never suggest running Swift locally — there is no Swift runtime on Windows
Never suggest a remote Mac connection — out of scope for this entire codebase
Never use `any` type as a shortcut
Never throw in Stages 1–4 — always degrade gracefully
Never mix stage concerns — parser does not layout, layout does not render
Never hardcode path separators — always `path.join()`
Never use `canvas.measureText()` for SwiftUI font sizing — use the lookup table
Never use emoji as SF Symbol substitutes
Never add a new npm package without asking first
Never use React or any frontend framework in the WebView
Never omit the `UnknownNode` fallback in any extractor function
Never implement state reactivity until the static layout engine has passing tests
Never talk the developer out of the deep layout engine — it is an explicit goal
---
14. CURRENT BUILD PHASE
> The developer updates this section manually as work progresses.
Current phase: PHASE 1 — Parser Foundation
Active tasks
[ ] `treeSitterSetup.ts` — init web-tree-sitter WASM, load Swift grammar, Windows-safe path
[ ] `astWalker.ts` — depth-first traversal with visitor dispatch table
[ ] Core view extractors: `VStack`, `HStack`, `ZStack`, `Text`, `Button`, `Image`, `Spacer`
[ ] Core modifier extractors: `.font`, `.foregroundColor`, `.padding`, `.frame`,
`.background`, `.cornerRadius`, `.opacity`, `.navigationTitle`
[ ] Output IR as pretty-printed JSON to VS Code OutputChannel (no rendering yet)
[ ] Unit tests: Swift snippet string → assert correct ViewNode JSON shape
Not started yet
Layout engine (Phase 2)
Renderer / Canvas (Phase 3)
Device frame chrome (Phase 3)
Navigation state machine (Phase 4)
Animations (Phase 5)
Form controls (Phase 4)
Known hard problems in Phase 1
1. Result builder children
SwiftUI view bodies use `@ViewBuilder`. Children appear as statements inside a trailing
closure body, not as array arguments. The walker must collect all `call_expression` and
`if_expression` / `switch_expression` statements from the closure body as children.
2. Modifier chains
Each `.modifier()` wraps the previous expression as a nested `call_expression`.
The outermost call in the AST is the last modifier applied.
Walk right-to-left, collect modifiers into an array, then reverse before storing in the IR.
3. Property references as arguments
`.foregroundColor(.blue)` → member expression `.blue` on implicit `Color`
`.foregroundColor(Color.blue)` → navigation expression `Color.blue`
Both must resolve to `{ kind: "foregroundColor", color: { kind: "system", name: "blue" } }`
4. String interpolation in Text
`Text("Hello \(name)")` → extract as `{ content: "Hello ${name}", isDynamic: true }`
with stub substitution. Do not try to evaluate `name`.
5. Custom view call sites
`MyCustomRow(title: "Hello", value: 42)` → extract as:
`{ kind: "CustomViewNode", name: "MyCustomRow", args: { title: "Hello", value: 42 } }`
Do not attempt to resolve the custom view definition in Phase 1.
6. Conditional views
`if condition { ViewA() } else { ViewB() }` → extract both branches,
render the `else` branch as the stub default (condition evaluates to false).
---
15. SESSION STARTUP PROTOCOL
At the start of every Claude Code session:
Re-read this entire CLAUDE.md
Check Section 14 to understand where work left off
Ask: "We're in Phase [X] — what are you working on today?" — never assume
Confirm which specific file is being worked on before writing any code
Treat every session as stateless — carry no assumptions from previous sessions
When the developer describes a feature, map it to a stage before writing any code
---
Last updated: 2026-03-23
Developer OS: Windows
Project type: Personal tool — not a product
Primary target device: iPhone 16 Pro (393 × 852 pt)
Scope: Entire SwiftUI surface area — ultimate parser, not a subset