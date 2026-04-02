# docs/reference - Shared Agent Index

> Read this file at the start of every coding or research session.
> It is the shared entrypoint for Codex, Claude, Gemini, and other agents.
> Never guess a filename or source of truth; look it up here first.

## Session-start protocol

1. Read this file.
2. Map the task to a pipeline stage before touching code.
3. Open the first file listed for that stage in the table below.
4. If the task changes architecture or behavior, cross-check `docs/CLAUDE.md`.

`docs/CLAUDE.md` is the detailed project brief. Its filename is historical; use it as project guidance even when the active agent is not Claude.

## Quick-start by pipeline stage

| Starting work on... | Open first |
|---|---|
| Stage 1 - Parser (tree-sitter AST) | `layer-1-grammar/node-types.md` |
| Stage 1 - Inferred node type specs (fields, children, constraints) | `layer-1-grammar/node-type-specs.md` |
| Stage 1 - Modifier chains / trailing closures | `layer-1-grammar/corpus-examples.md` |
| Stage 1 - Edge cases (`@State`, interpolation, conditionals) | `layer-1-grammar/parsing-edge-cases.md` |
| Stage 2 - web-tree-sitter WASM API calls | `layer-2-parser-api/web-tree-sitter-api.md` |
| Stage 2 - Logging, progress, node helpers | `layer-2-parser-api/web-tree-sitter-extras.md` |
| Stage 3 - `@ViewBuilder` / result-builder transforms | `layer-3-viewbuilder/result-builder-transforms.md` |
| Stage 3 - ViewBuilder containers (`Group`, `if/else`, `switch`) | `layer-3-viewbuilder/viewbuilder-swiftui-api.md` |
| Stage 4 - `VStack` / `HStack` / `ZStack` / `Spacer` layout | `layer-4-layout/core-containers.md` |
| Stage 4 - `.frame`, `.infinity`, `fixedSize`, `GeometryReader` | `layer-4-layout/frame-fixedsize-geometry.md` |
| Stage 4 - `ScrollView` children and layout contract | `layer-4-layout/scrollview.md` |
| Stage 4 - `NavigationStack` / `TabView` layout | `layer-4-layout/navigation-tabview.md` |
| Stage 4 - `LazyVGrid` / `LazyHGrid` | `layer-4-layout/grid.md` |
| Stage 4 - Worked fixture calculations | `layer-4-layout/fixture-calculations.md` |
| Stage 4 - Overlay, background, alignment anchors | `layer-4-layout/extended-topics.md` |
| Stage 5 - iOS HIG: touch targets, typography, colors, tab bar | `layer-5-hig/touch-typography-colors.md` |
| Stage 5 - iOS HIG: nav bar, toolbars, lists, controls | `layer-5-hig/navigation-toolbars-lists.md` |
| Stage 5 - Toggle, Picker, Slider, Stepper, DatePicker chrome | `layer-5-hig/control-visual-specs.md` |
| Stage 5 - Full iOS/iPadOS UI specification | `layer-5-hig/ios-ui-specs.md` |
| Stage 5 - Canvas 2D drawing primitives | `renderer/canvas-2d-reference.md` |
| Stage 5 - SF Symbols to SVG rendering | `renderer/sf-symbols-rendering.md` |
| Stage 6 - Device frame chrome | `layer-8-device-frames/device-frames.md` |
| Stage 7 - Push/pop navigation transitions | `layer-9-animations/navigation-transitions.md` |
| Stage 7 - SwiftUI transition types to CSS equivalents | `layer-9-animations/swiftui-transitions.md` |
| IR types - `ViewNode` union, `Modifier` union | `ir/viewnode-types.md` |
| IR types - `@State` / `@Binding` / `@ObservedObject` stubs | `ir/property-wrapper-stubs.md` |
| Swift syntax - View initializer signatures | `swift-syntax/view-initializer-signatures.md` |
| Swift syntax - Modifier call signatures | `swift-syntax/modifier-signatures.md` |
| Swift syntax - Parsing edge cases | `swift-syntax/edge-cases.md` |
| VS Code extension - WebView CSP, packaging, WASM loading | `layer-6-vscode/extension-packaging-csp.md` |
| MCP server - protocol spec, tool definitions, stdio transport | `layer-7-mcp/mcp-protocol.md` |
| MCP server - packaging and agent/client configuration | `layer-7-mcp/mcp-server-packaging.md` |
| Project goals and problem statement | `planning/problem-statement.md` |
| Full pipeline design and planning | `planning/pipeline-overview.md` |
| Cross-layer confirmed findings and test strategy | `planning/cross-layer-research.md` |
| Research prompt template for dedicated research sessions | `planning/research-agent-prompt.md` |

## Node name traps - wrong to right

These are the most common mistakes. The wrong name silently returns no matches.

| Wrong (do not use) | Correct tree-sitter-swift name |
|---|---|
| `string_literal` | `line_string_literal` / `multi_line_string_literal` |
| `float_literal` | `real_literal` |
| `for_in_statement` | `for_statement` |
| `if_expression` | `if_statement` |
| `variable_declaration` | `property_declaration` |
| `trailing_closure` | `lambda_literal` as a child of `call_suffix` |
| `interpolated_string_expression` | `interpolation` |
| `function_call` | `call_expression` |
| `member_access` | `navigation_expression` or `member_modifier`, depending on context |
| `argument` | `value_argument` |
| `closure_expression` | `lambda_literal` |

Full grammar rules: `layer-1-grammar/grammar-rules.md`

Full node type specs: `layer-1-grammar/node-types.md`

## Constants every stage must use

### Layout and device dimensions

| Constant | Value | Used in |
|---|---|---|
| Default device | iPhone 16 Pro | Stages 4, 5, 6 |
| Screen logical size | 393 x 852 pt | Stage 4 layout root |
| Status bar height (Face ID) | 59 pt | Stages 4, 5 |
| Home indicator safe area | 34 pt | Stages 4, 5 |
| Navigation bar height | 44 pt | Stage 5 renderer |
| Large title bar extra height | 52 pt | Stage 5 renderer |
| Full large-title stack height | 96 pt | Stage 5 renderer |
| Tab bar height | 49 pt | Stage 5 renderer |
| Minimum touch target | 44 x 44 pt | Stage 5 renderer |
| List cell minimum height | 44 pt | Stage 5 renderer |
| List group corner radius | 10 pt | Stage 5 renderer |
| List separator left inset | 16 pt | Stage 5 renderer |

### Typography

Never use `canvas.measureText()` as the source of truth for SwiftUI sizing.

| Style | Size (pt) | Weight | Line-height multiplier |
|---|---|---|---|
| `largeTitle` | 34 | 700 | 1.21 |
| `title` | 28 | 700 | 1.21 |
| `title2` | 22 | 700 | 1.23 |
| `title3` | 20 | 600 | 1.25 |
| `headline` | 17 | 600 | 1.29 |
| `body` | 17 | 400 | 1.29 |
| `callout` | 16 | 400 | 1.31 |
| `subheadline` | 15 | 400 | 1.33 |
| `footnote` | 13 | 400 | 1.38 |
| `caption` | 12 | 400 | 1.42 |
| `caption2` | 11 | 400 | 1.45 |

### Animation timing

| Name | Curve | Duration |
|---|---|---|
| Push/pop transition | `cubic-bezier(0.42, 0, 0.58, 1.0)` | 350 ms |
| `.easeInOut` | `cubic-bezier(0.42, 0, 0.58, 1.0)` | per modifier |
| `.easeIn` | `cubic-bezier(0.42, 0, 1.0, 1.0)` | per modifier |
| `.easeOut` | `cubic-bezier(0, 0, 0.58, 1.0)` | per modifier |
| `.spring()` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | per modifier |
| `.bouncy` | `cubic-bezier(0.34, 1.8, 0.64, 1)` | per modifier |
| `.snappy` | `cubic-bezier(0.2, 0, 0, 1.0)` | short |

### Light-mode color anchors

| Token | Value |
|---|---|
| `label` | `#000000` |
| `secondaryLabel` | `rgba(60,60,67,0.6)` |
| `systemBackground` | `#ffffff` |
| `secondarySystemBackground` | `#f2f2f7` |
| `systemGroupedBackground` | `#f2f2f7` |
| `secondarySystemGroupedBackground` | `#ffffff` |
| `separator` | `rgba(60,60,67,0.29)` |
| `systemBlue` / `accentColor` | `#007aff` |
| `systemGreen` | `#34c759` |
| `systemRed` | `#ff3b30` |
| `systemGray` | `#8e8e93` |

Full light and dark color tables: `layer-5-hig/touch-typography-colors.md`

## Stub rules - quick reference

| Feature | Stub behavior |
|---|---|
| `@State` / `@Binding` | zero / `""` / `false` / `nil` |
| `@ObservedObject` / `@StateObject` | all published properties as type defaults |
| `ForEach` over dynamic data | render exactly 3 placeholder rows |
| `ForEach` over static literal array | render actual items |
| `AsyncImage` | gray box plus `photo` SF Symbol |
| `Sheet` / `FullScreenCover` | not presented |
| `Alert` / `ConfirmationDialog` | ignored entirely |
| `Animation` modifier | render final non-animated state |
| `withAnimation` block | evaluate without animation |
| `matchedGeometryEffect` | ignored; render normally |
| `PhaseAnimator` / `KeyframeAnimator` | first phase only |
| `TimelineView` | render at `t=0` |
| `Canvas` view | gray box labeled `Canvas` |
| `UIViewRepresentable` | gray box with type name |
| Custom `Layout` protocol | `VStack` fallback |

All stubs must carry the comment `// STUB: <reason>`.

Full stub contracts: `ir/property-wrapper-stubs.md`

## Error handling fallback chain

```text
Stage 1 (Parser)    -> catch all -> return UnknownNode, log to OutputChannel
Stage 2 (Extractor) -> catch all -> return UnknownNode, log to OutputChannel
Stage 3 (Resolver)  -> catch all -> return node unmodified, log warning
Stage 4 (Layout)    -> catch all -> clamp size to zero, log warning
Stage 5 (Renderer)  -> catch all -> draw red error placeholder box with message
Stage 6 (Device)    -> catch all -> render content without chrome
```

Never omit `UnknownNode` as the final fallback in any extractor.

Never throw in Stages 1-4; always degrade gracefully.

## File map

```text
docs/reference/
|- INDEX.md
|- layer-1-grammar/
|  |- node-types.md
|  |- node-type-specs.md
|  |- grammar-rules.md
|  |- parsing-edge-cases.md
|  `- corpus-examples.md
|- layer-2-parser-api/
|  |- web-tree-sitter-api.md
|  `- web-tree-sitter-extras.md
|- layer-3-viewbuilder/
|  |- result-builder-transforms.md
|  `- viewbuilder-swiftui-api.md
|- layer-4-layout/
|  |- core-containers.md
|  |- frame-fixedsize-geometry.md
|  |- scrollview.md
|  |- navigation-tabview.md
|  |- grid.md
|  |- fixture-calculations.md
|  `- extended-topics.md
|- layer-5-hig/
|  |- touch-typography-colors.md
|  |- navigation-toolbars-lists.md
|  |- control-visual-specs.md
|  `- ios-ui-specs.md
|- layer-6-vscode/
|  `- extension-packaging-csp.md
|- layer-7-mcp/
|  |- mcp-protocol.md
|  `- mcp-server-packaging.md
|- layer-8-device-frames/
|  `- device-frames.md
|- layer-9-animations/
|  |- navigation-transitions.md
|  `- swiftui-transitions.md
|- ir/
|  |- viewnode-types.md
|  `- property-wrapper-stubs.md
|- renderer/
|  |- canvas-2d-reference.md
|  `- sf-symbols-rendering.md
|- swift-syntax/
|  |- view-initializer-signatures.md
|  |- modifier-signatures.md
|  `- edge-cases.md
`- planning/
   |- problem-statement.md
   |- pipeline-overview.md
   |- research-agent-prompt.md
   `- cross-layer-research.md
```
