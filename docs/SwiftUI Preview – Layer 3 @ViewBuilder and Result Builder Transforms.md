# SwiftUI Preview – Layer 3 @ViewBuilder and Result Builder Transforms

## Session Header

Research Layer: 3 — SwiftUI @ViewBuilder and Result Builders  
Task: Capture the formal result-builder transformation rules from SE-0289 and specialize them for SwiftUI’s `@ViewBuilder`, focusing on how `if`/`else`, `switch`, and `for` in view bodies desugar into builder calls and conditional container types, plus the extractor implications for the `tree-sitter-swift` AST.  
Sources: Swift Evolution SE‑0289 “Result builders” (formal transform specification), WWDC 2019 Session 226 “Data Flow Through SwiftUI” slides for state/data-flow context, secondary explanations of `@ViewBuilder` behavior and examples.[^1][^2][^3][^4]
Scope: Generic result-builder methods (`buildBlock`, `buildExpression`, `buildOptional`, `buildEither`, `buildArray`, `buildLimitedAvailability`, `buildFinalResult`), their statement-wise transforms, and how SwiftUI’s `ViewBuilder` uses them for: plain lists of views, `if` without `else`, `if`/`else` and `switch`, `for` loops in view builders, and `if #available`.

***

## TRANSFORM: Plain @ViewBuilder Block (No Control Flow)

Input Swift (conceptual SwiftUI example):
```swift
@ViewBuilder
var body: some View {
    Text("Hello")
    Image(systemName: "star")
}
```

Desugared to (result-builder form, per SE‑0289):[^1]
```swift
var body: some View {
    // transform each expression statement into a partial result
    let _a = ViewBuilder.buildExpression(Text("Hello"))
    let _b = ViewBuilder.buildExpression(Image(systemName: "star"))

    // combine partial results for the block
    let _block = ViewBuilder.buildBlock(_a, _b)

    // finalize top-level result (if ViewBuilder defines buildFinalResult)
    return ViewBuilder.buildFinalResult(_block)
}
```

AST implication:
- In Swift’s formal transform, each statement becomes a local `let` bound to a partial result, then all partials are passed to `buildBlock`, optionally wrapped in `buildFinalResult`.[^1]
- In `tree-sitter-swift`, the closure or body is still just a sequence of normal statements (for SwiftUI, a `lambda_literal` → `statements` with `call_expression` children); the builder work is a *semantic* transform performed by the compiler, not visible as extra AST nodes.[^1]

Extractor rule:
- Stage 2 should continue to treat a `@ViewBuilder` body as an ordered list of child view expressions (`call_expression` and friends) inside the `statements` node, with no expectation of additional builder-call nodes; the Layer 1 grammar is already sufficient.[^1]
- When building IR, treat each top-level, view-producing statement as a sibling ViewNode in order, mirroring how `buildBlock` conceptually aggregates them.

***

## TRANSFORM: `if` Without `else` in @ViewBuilder

Input Swift (optional child view):
```swift
@ViewBuilder
var body: some View {
    Text("Always here")
    if condition {
        Text("Sometimes here")
    }
}
```

Desugared to (based on SE‑0289 selection rules):[^1]
```swift
var body: some View {
    let _a = ViewBuilder.buildExpression(Text("Always here"))

    var _case: ViewBuilder.Component?  // optional partial result
    if condition {
        let _thenExpr = ViewBuilder.buildExpression(Text("Sometimes here"))
        let _thenBlock = ViewBuilder.buildBlock(_thenExpr)
        _case = ViewBuilder.buildOptional(.some(_thenBlock))
    } else {
        _case = ViewBuilder.buildOptional(.none)
    }

    let _b = _case!  // conceptually, now a Component
    let _block = ViewBuilder.buildBlock(_a, _b)
    return ViewBuilder.buildFinalResult(_block)
}
```

AST implication:
- The source contains a normal `if_statement` node inside `statements`, with its own nested `statements` for the `then` branch and (in source) no `else` branch.[^1]
- The compiler injects a synthetic `else` path and wraps the optional branch with `buildOptional`, but this is *not* represented as extra AST nodes; at the AST level, it is just an `if_statement` whose `then` body may or may not contain view expressions.[^1]

Extractor rule:
- When encountering an `if_statement` in a `@ViewBuilder` body with no `else`, Stage 2 should model this as “optional content”: a conditional child branch that may disappear at runtime.[^1]
- In the IR, represent this as something like `IfNode(condition: Expr, thenChildren: [ViewNode], elseChildren: [])`, relying on later layout/runtime stages to respect the optionality; it is unnecessary (and impossible from AST alone) to reconstruct the internal `buildOptional` calls.

***

## TRANSFORM: `if` / `else` in @ViewBuilder

Input Swift:
```swift
@ViewBuilder
var body: some View {
    if flag {
        Text("A")
    } else {
        Text("B")
    }
}
```

Desugared to (simplified from SE‑0289 “Selection statements”):[^1]
```swift
var body: some View {
    let _merged: ViewBuilder.Component

    if flag {
        let _a = ViewBuilder.buildExpression(Text("A"))
        let _aBlock = ViewBuilder.buildBlock(_a)
        _merged = ViewBuilder.buildEither(first: _aBlock)
    } else {
        let _b = ViewBuilder.buildExpression(Text("B"))
        let _bBlock = ViewBuilder.buildBlock(_b)
        _merged = ViewBuilder.buildEither(second: _bBlock)
    }

    let _block = ViewBuilder.buildBlock(_merged)
    return ViewBuilder.buildFinalResult(_block)
}
```

In SwiftUI’s internal `ViewBuilder`, the result of `buildEither(first:)` / `buildEither(second:)` is typically an internal `_ConditionalContent<TrueContent, FalseContent>` value that tracks which branch is active.[^3][^1]

AST implication:
- The AST remains a plain `if_statement` with `then` and `else` `statements` blocks; there is no explicit `_ConditionalContent` type or `buildEither` call in the syntax tree.[^1]
- The branching structure is therefore fully recoverable from the AST (`if_statement` nesting), but the exact SwiftUI internal types are not.

Extractor rule:
- Model an `if_statement` with both `then` and `else` in a `@ViewBuilder` context as a conditional IR node with two non-optional child lists, e.g. `IfNode(condition: Expr, thenChildren: [ViewNode], elseChildren: [ViewNode])`.[^1]
- Downstream, layering can approximate SwiftUI’s `_ConditionalContent` by treating this IR node as a single view whose layout delegates to exactly one of the two child lists depending on runtime evaluation.

***

## TRANSFORM: `switch` in @ViewBuilder

Input Swift (conceptual):
```swift
@ViewBuilder
var body: some View {
    switch mode {
    case .a:
        Text("A")
    case .b:
        Text("B")
    default:
        Text("Other")
    }
}
```

Desugared pattern (from SE‑0289 injection-tree description, simplified):[^1]
```swift
var body: some View {
    let _merged: ViewBuilder.Component

    if case .a = mode {
        let _a = ViewBuilder.buildExpression(Text("A"))
        let _aBlock = ViewBuilder.buildBlock(_a)
        _merged = ViewBuilder.buildEither(first: _aBlock)
    } else if case .b = mode {
        let _b = ViewBuilder.buildExpression(Text("B"))
        let _bBlock = ViewBuilder.buildBlock(_b)
        _merged = ViewBuilder.buildEither(second:
                   ViewBuilder.buildEither(first: _bBlock))
    } else {
        let _c = ViewBuilder.buildExpression(Text("Other"))
        let _cBlock = ViewBuilder.buildBlock(_c)
        _merged = ViewBuilder.buildEither(second:
                   ViewBuilder.buildEither(second: _cBlock))
    }

    let _block = ViewBuilder.buildBlock(_merged)
    return ViewBuilder.buildFinalResult(_block)
}
```

AST implication:
- The AST contains an ordinary `switch_statement` with `switch_case` children, each with their own `statements` blocks.[^1]
- How the compiler chooses the binary injection tree (`buildEither(first:)`/`second:` nesting) is an implementation detail and not present in the AST.

Extractor rule:
- Represent `switch_statement` inside a `@ViewBuilder` body as a `SwitchNode` in IR with:
  - a discriminant expression, and
  - per-case child view lists (mirroring `if`/`else` handling but for multiple branches).[^1]
- Do **not** attempt to serialize the `_ConditionalContent` type structure; instead, maintain a higher-level IR that captures the branch semantics and let later stages approximate layout by delegating to exactly one active case at runtime.

***

## TRANSFORM: `for .. in` in @ViewBuilder

Input Swift:
```swift
@ViewBuilder
var body: some View {
    ForEach(items) { item in
        Text(item.title)
    }
}
```

At the result-builder level (for a general `for` in a result-builder body):[^1]
```swift
for item in items {
    Text(item.title)
}
```

Desugared pattern (SE‑0289 `for .. in`):[^1]
```swift
var body: some View {
    var _array: [ViewBuilder.Component] = []

    for item in items {
        // transform loop body into a partial result
        let _iterExpr = ViewBuilder.buildExpression(Text(item.title))
        let _iterBlock = ViewBuilder.buildBlock(_iterExpr)
        _array.append(_iterBlock)
    }

    let _loopCombined = ViewBuilder.buildArray(_array)
    let _block = ViewBuilder.buildBlock(_loopCombined)
    return ViewBuilder.buildFinalResult(_block)
}
```

SwiftUI’s `ViewBuilder` uses `buildArray` to combine the per-iteration components into a single container representing a repetition, which is then wrapped in higher-level types like `ForEach` or `TupleView` internally.[^2][^5]

AST implication:
- A user-written `for` loop **inside** a view-builder body becomes a regular `for_statement` node with its own `statements` body containing the per-iteration view content; the `buildArray` usage is not present in the AST.[^1]
- In practice, SwiftUI uses higher-level constructs (like the `ForEach` view type) rather than raw `for` loops for dynamic repetition, but the transform rules still apply for any result-builder that supports loops.

Extractor rule:
- For SwiftUI, repetition is usually modeled explicitly via `call_expression` to `ForEach`, which the grammar already encodes as a normal call plus closure; treat that primarily as a view-level repetition construct.[^6]
- If you later support raw `for` loops inside `@ViewBuilder` bodies, represent `for_statement` as a `ForNode` in IR with:
  - loop binding and range expression, and
  - a body view list (from the nested `statements`).
  Downstream, layout/runtime stages can approximate `buildArray` semantics by repeating the child subtree for each iteration.

***

## TRANSFORM: `if #available` in @ViewBuilder (buildLimitedAvailability)

SwiftUI often needs to use newer views like `LazyVStack` while remaining deployable to older OS versions. SE‑0289 describes `buildLimitedAvailability` for this case.[^1]

Input Swift (simplified from SE‑0289 example):
```swift
ScrollView {
    if #available(iOS 14.0, *) {
        LazyVStack { /* rows */ }
    } else {
        VStack { /* rows */ }
    }
}
```

Desugared pattern (SE‑0289):[^1]
```swift
let _merged: ViewBuilder.Component
if #available(iOS 14.0, *) {
    let v0 = LazyVStack { /* ... */ }
    let v1 = ViewBuilder.buildBlock(v0)
    let v2 = ViewBuilder.buildLimitedAvailability(v1)
    _merged = ViewBuilder.buildEither(first: v2)
} else {
    let v3 = VStack { /* ... */ }
    let v4 = ViewBuilder.buildBlock(v3)
    _merged = ViewBuilder.buildEither(second: v4)
}

let _block = ViewBuilder.buildBlock(_merged)
return ViewBuilder.buildFinalResult(_block)
```

Here `buildLimitedAvailability` is typically implemented as something like:[^1]
```swift
static func buildLimitedAvailability<Content: View>(_ content: Content) -> AnyView {
    AnyView(content)
}
```

AST implication:
- The AST only contains an `if` with a special availability condition (`if #available`) plus its `then` and `else` `statements`; there is no explicit `buildLimitedAvailability` node.[^1]

Extractor rule:
- Treat `if #available` inside a `@ViewBuilder` body as just another conditional view region in IR; there is no need to special-case `buildLimitedAvailability` at the AST/extractor level.[^1]
- If you eventually represent type erasure in IR (for example an `AnyView`-like wrapper), this can be modeled when lowering to a more SwiftUI-semantic IR layer; for now, it is enough to maintain both branches as alternative child lists and let a later stage decide how aggressively to erase their static types.

***

## TRANSFORM: Result-Builder Attribute Positions Relevant to SwiftUI

SE‑0289 allows result-builder attributes in two key positions:[^1]

1. **On a function, getter, or subscript**:
   ```swift
   @ViewBuilder
   var body: some View { ... }  // transform applied to body statements
   ```

2. **On a function-type parameter**:
   ```swift
   init(@ViewBuilder content: () -> Content) { ... }
   ```

AST implication:
- The `@ViewBuilder` attribute itself appears as an `attribute` node in the Swift AST (and in `tree-sitter-swift` as `attribute` plus `user_type`/`simple_identifier`), but it does *not* alter the grammar for the body; the body remains a standard function/closure body.[^1]

Extractor rule:
- At the SwiftUI Preview level, “@ViewBuilder context” should be tracked by semantic information (from a symbol index or a pre-scan of attributes), not by expecting special AST node types.[^3]
- Once a body or closure parameter is known to be a view-builder, Stage 2 can switch into “view extraction mode” for its `statements`, applying all of the conditional/loop IR rules above.

***

## Summary of Result-Builder Methods vs. SwiftUI Extraction Needs

From SE‑0289’s reference builder, the key methods and their impact are:[^1]

- `buildBlock(_ components: Component...)` — combines per-statement partial results into a single component; maps to “children array” in IR.
- `buildExpression(_ expression: Expression)` — lifts arbitrary expressions into the internal `Component` currency; not visible in AST.
- `buildOptional(_ component: Component?)` — enables `if` without `else`; IR should treat such conditionals as having an empty else-branch.
- `buildEither(first:)` / `buildEither(second:)` — power `if`/`else` and `switch`; IR must preserve branching structure, not binary-tree implementation details.
- `buildArray(_ components: [Component])` — powers `for` loops; in SwiftUI practice, repetition is usually modeled more directly through views like `ForEach`.
- `buildLimitedAvailability(_ component:)` — allows `if #available` uses to erase type information; relevant mainly to type-level semantics, not AST structure.
- `buildFinalResult(_ component:)` — distinguishes the type used for internal components from the final returned type; not directly relevant to AST extraction.

Extractor rule (global for Layer 3):
- The SwiftUI Preview extractor should assume that all builder machinery is *semantic* and not present in the parsed tree. It must derive view structure purely from standard Swift control-flow nodes (`if_statement`, `switch_statement`, `for_statement`, `lambda_literal`, `call_expression`, etc.) and then map them into a high-level IR mirroring the builder transforms described above.[^1]
- This keeps Layer 2 (web-tree-sitter API) and Layer 1 (grammar facts) as the only contracts with the syntax tree, and keeps Layer 3 focused on semantic reshaping that happens later in the pipeline.

---

## References

1. [swift-evolution/proposals/0289-result-builders.md at main](https://github.com/apple/swift-evolution/blob/main/proposals/0289-result-builders.md) - This proposal describes result builders, a new feature which allows certain functions (specially-ann...

2. [Result builders in Swift explained with code examples](https://www.avanderlee.com/swift/result-builders/) - Result builders in Swift allow you to combine build components into a single outcome value. Code exa...

3. [The power of @ViewBuilder in SwiftUI](https://swiftwithmajid.com/2019/12/18/the-power-of-viewbuilder-in-swiftui/) - Last week we started a series of posts about developing interactive components using SwiftUI, where ...

4. [WWDC19](https://devstreaming-cdn.apple.com/videos/wwdc/2019/226mq9pvm28zqfqer2a/226/226_data_flow_through_swiftui.pdf?dl=1) - Luca Bernardi, SwiftUI Engineer. Raj Ramamurthy, SwiftUI Engineer. •Data Flow Through SwiftUI. Page ...

5. [Swift Result Builders: Getting Started](https://www.kodeco.com/39798703-swift-result-builders-getting-started) - Initially, the expected official name was @functionBuilder . However, after revising the proposal (S...

6. [@ViewBuilder in Swift](https://dev.to/0xwdg/viewbuilder-in-swift-44e2) - SwiftUI, Apple's declarative framework for building user interfaces, introduces several powerful...

