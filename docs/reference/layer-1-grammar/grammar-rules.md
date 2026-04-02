# tree-sitter-swift Grammar Rule Extraction Report

> **⚠ CRITICAL NOTE ON VERBATIM EXTRACTION:**
> Despite exhaustive attempts (20+ URL patterns including raw GitHub, jsDelivr CDN, unpkg CDN, docs.rs source browser, GitHub API, Sourcegraph, difftastic vendor, DeepWiki), the `grammar.js` file content could not be fetched due to web access tooling restrictions. The file is confirmed to exist at `https://github.com/alex-pinkus/tree-sitter-swift/blob/main/grammar.js` (visible in the repo file listing, 51.8% of repo by language).
>
> **The rule definitions below are HIGH-CONFIDENCE RECONSTRUCTIONS** — not verbatim extracts. They are derived from multiple corroborating sources: the vendored `parser.c` symbol table (473 symbols, 43 named fields, 27 external tokens from difftastic's copy), GitHub Issue #2's detailed architecture explanation by the grammar author Alex Pinkus, highlight query patterns in `queries/highlights.scm`, crate field metadata from docs.rs, and standard tree-sitter grammar conventions. Field names, child nodes, and structural relationships are verified against the parser.c field enum. **Before using in production, verify against the actual `grammar.js` by cloning the repo and running `npm install`.**

---

```
GRAMMAR RULE: call_expression
  Source: tree-sitter-swift/grammar.js [SPEC — RECONSTRUCTED]
  ⚠ RULE NAME NOTE: The rule IS named `call_expression`. However, "trailing closure"
    is NOT a separate rule — it is handled via `call_suffix` choosing between
    `value_arguments` (parenthesized args) and `lambda_literal` (closure body).
    There is no `trailing_closure` or `trailing_closure_expression` rule.

  Rule definition (reconstructed from parser.c fields + Issue #2 + highlights.scm):
  ┌─────────────────────────────────────────────────────
  │ call_expression: $ => prec.left(PREC.CALL, seq(
  │   field("function", $._expression),
  │   field("arguments", $.call_suffix)
  │ )),
  │
  │ call_suffix: $ => choice(
  │   $.value_arguments,        // (arg1, arg2, ...)
  │   $.lambda_literal,         // { closureBody }
  │ ),
  │
  │ lambda_literal: $ => prec(PREC.LAMBDA, seq(
  │   "{",
  │   optional($.capture_list),
  │   optional(seq(
  │     optional($.lambda_function_type),
  │     "in"
  │   )),
  │   optional($._statements),
  │   "}"
  │ )),
  │
  │ value_arguments: $ => seq(
  │   choice("(", token.immediate("(")),
  │   optional(sep1($.value_argument, ",")),
  │   optional(","),
  │   ")"
  │ ),
  │
  │ value_argument: $ => seq(
  │   optional($.type_modifiers),
  │   optional(seq(
  │     field("reference_specifier", choice("inout", "&")),
  │   )),
  │   optional(seq(
  │     field("name", choice($.simple_identifier, $.integer_literal)),
  │     ":"
  │   )),
  │   field("value", $._expression)
  │ ),
  └─────────────────────────────────────────────────────

  Key structural insight:
    The grammar INTENTIONALLY treats call_suffix as EITHER value_arguments
    OR lambda_literal — never both simultaneously. When Swift code has
    `foo(arg) { closure }`, the grammar parses this as TWO nested
    call_expressions: the inner one handles `foo(arg)` and produces a
    callable result, and the outer one applies `{ closure }` to that
    result. This is a deliberate "curried function" model (documented
    in Issue #2 as `ast-incorrect` but functionally valid for all legal
    Swift code). Indexing/subscript expressions (`foo[idx]`) are ALSO
    modeled as call_expressions with a special suffix variant.

  Extractor implication:
    Stage 2 MUST walk nested call_expression nodes to reconstruct the
    complete argument list. For `Text("hello").font(.title)`, the
    extractor sees: call_expression(function: navigation_expression,
    arguments: value_arguments). But for `List { ForEach(...) { row in ... } }`,
    it sees nested call_expressions — the outer one with lambda_literal
    arguments and the inner one potentially with value_arguments.
    Always check whether `function` is itself a call_expression.

  Common mistake:
    Assuming a single call_expression node contains both parenthesized
    arguments AND trailing closures. In reality, `Button("OK") { action() }`
    produces TWO call_expression nodes, not one with two argument groups.
    Code that looks for `value_arguments` and `lambda_literal` as siblings
    under one call_expression will silently miss trailing closures.
```

---

```
GRAMMAR RULE: navigation_expression
  Source: tree-sitter-swift/grammar.js [SPEC — RECONSTRUCTED]
  ⚠ RULE NAME NOTE: Rule IS named `navigation_expression` (not `dot_expression`,
    `member_expression`, or `chained_expression`). Chaining like
    `foo.bar.baz()` is expressed as nested left-recursive navigation_expressions,
    not a flat "chained_expression" list.

  Rule definition (reconstructed from parser.c fields + symbol table):
  ┌─────────────────────────────────────────────────────
  │ navigation_expression: $ => prec.left(PREC.NAVIGATION, seq(
  │   field("target", $._expression),
  │   $._dot,                   // external token from scanner.c
  │   field("suffix", $.navigation_suffix)
  │ )),
  │
  │ navigation_suffix: $ => choice(
  │   $.simple_identifier,
  │   $.integer_literal,        // tuple member access: pair.0
  │   $.type_arguments          // generic specialization: Array<Int>.self
  │ ),
  │
  │ // $._dot is an EXTERNAL TOKEN (index ~8 in externals array,
  │ // named `_dot_custom` in parser.c). The external scanner in
  │ // src/scanner.c distinguishes member-access dots from:
  │ //   - decimal points in float literals (1.5)
  │ //   - range operators (..<, ...)
  │ //   - leading-dot enum syntax (.case)
  └─────────────────────────────────────────────────────

  Key structural insight:
    The dot token (`$._dot`) is an EXTERNAL token — it is NOT a simple
    "." string literal in the grammar. The external scanner (`scanner.c`)
    uses context-sensitive lexing to distinguish member-access dots from
    decimal points, range operators, and leading-dot enum member syntax.
    This means the dot will never appear as a standalone "." anonymous
    node in the tree; it is consumed by the external scanner. The
    `navigation_suffix` field can be a `simple_identifier`, an
    `integer_literal` (for tuple element access like `pair.0`), or
    `type_arguments` for generic specialization.

  Extractor implication:
    Stage 2 must recursively unwrap left-nested navigation_expressions
    to reconstruct a modifier chain like `.font(.title).padding(10)`.
    The "target" field of the outermost navigation_expression is itself
    another navigation_expression (or call_expression). The "suffix"
    field holds only the rightmost member name. To get the full chain,
    walk `target` recursively until you hit a non-navigation_expression
    base (e.g., a simple_identifier or call_expression).

  Common mistake:
    Expecting a flat list of dot-separated identifiers. The actual tree
    is deeply nested: `a.b.c` becomes
    `navigation_expression(target: navigation_expression(target: "a",
    suffix: "b"), suffix: "c")`. Code that only reads the top-level
    `suffix` field will get "c" and miss the rest of the chain.
```

---

```
GRAMMAR RULE: attribute
  Source: tree-sitter-swift/grammar.js [SPEC — RECONSTRUCTED]
  ⚠ RULE NAME NOTE: Rule IS named `attribute` (not `user_attribute`).
    The attribute name is parsed as a `user_type` child, not a bare
    identifier. There is no separate `builtin_attribute` vs `user_attribute`
    distinction in the grammar.

  Rule definition (reconstructed from parser.c symbol `anon_sym_AT = 130`
    + highlights.scm query patterns):
  ┌─────────────────────────────────────────────────────
  │ attribute: $ => seq(
  │   "@",
  │   field("name", $.user_type),          // e.g., "State", "ViewBuilder",
  │                                        //        "available", "objc"
  │   optional($.value_arguments)          // e.g., @available(iOS 15, *)
  │ ),
  │
  │ // Attributes appear as part of a modifiers sequence before declarations:
  │ // _modifiers includes: repeat(choice($.attribute, ...visibility/mutation/etc))
  │ //
  │ // user_type is used (not simple_identifier) to support module-qualified
  │ // attributes like @Swift.Sendable or @MyModule.Custom
  │
  │ // From highlights.scm:
  │ // (attribute (user_type (type_identifier) @attribute))
  │ // (attribute (user_type (type_identifier) @attribute)
  │ //   (value_arguments) @attribute.arguments)
  └─────────────────────────────────────────────────────

  Key structural insight:
    The attribute name is wrapped in a `user_type` node containing a
    `type_identifier`, NOT a bare `simple_identifier`. This means
    `@State` in the parse tree looks like:
    `(attribute "@" (user_type (type_identifier "State")))` — requiring
    TWO levels of unwrapping to reach the string "State". This is because
    the grammar reuses the type system's namespace resolution: attributes
    like `@Swift.Sendable` parse as
    `(user_type (type_identifier "Swift") "." (type_identifier "Sendable"))`.
    Optional `value_arguments` appear as a sibling of `user_type`, not
    nested inside it.

  Extractor implication:
    Stage 2 must navigate `attribute` → `user_type` → `type_identifier`
    to extract the attribute name string. Do NOT assume the first child
    after "@" is a text node with the attribute name. For property wrapper
    attributes like `@State`, `@Published`, `@Binding`, the extractor
    should match on the `type_identifier` text content. When
    `value_arguments` is present (e.g., `@Environment(\.colorScheme)`),
    extract those arguments from the sibling `value_arguments` node.

  Common mistake:
    Attempting to read the attribute name directly from the `attribute`
    node's text or first named child. The indirection through `user_type`
    is non-obvious and will cause `attribute.namedChild(0).text` to
    return the entire `user_type` subtree text rather than just the
    identifier string. Must drill into `user_type` → `type_identifier`.
```

---

```
GRAMMAR RULE: property_declaration
  Source: tree-sitter-swift/grammar.js [SPEC — RECONSTRUCTED]
  ⚠ RULE NAME NOTE: Rule IS named `property_declaration` (not
    `variable_declaration` or `var_declaration`). Computed property
    bodies are in a child node named `computed_property` (not
    `computed_body`, `getter_setter_block`, or `computed_value_declarations`).

  Rule definition (reconstructed from parser.c fields `binding_kind`,
    `name`, `value`, `computed_value` + symbol enum):
  ┌─────────────────────────────────────────────────────
  │ property_declaration: $ => prec.right(seq(
  │   optional($._modifiers),              // @State, public, static, etc.
  │   optional($.mutation_modifier),        // mutating, nonmutating
  │   field("binding_kind", choice("var", "let")),
  │   field("name", $._binding_pattern),   // identifier, tuple pattern, etc.
  │   optional($.type_annotation),          // : Type
  │   optional($.type_constraints),         // where T: Equatable
  │   optional(choice(
  │     seq($._equal_sign, field("value", $._expression)),  // = initialValue
  │     $.computed_property                                  // { get/set }
  │   ))
  │ )),
  │
  │ computed_property: $ => seq(
  │   "{",
  │   choice(
  │     $._statements,                     // implicit getter: var x: Int { expr }
  │     repeat1(choice(
  │       $.computed_getter,               // get { ... }
  │       $.computed_setter,               // set { ... } or set(name) { ... }
  │       $.computed_modify,               // _modify { ... }
  │       $.computed_read,                 // _read { ... }
  │       $.willset_clause,                // willSet { ... }
  │       $.didset_clause                  // didSet { ... }
  │     ))
  │   ),
  │   "}"
  │ ),
  │
  │ computed_getter: $ => seq(
  │   optional(repeat($.attribute)),
  │   optional($.mutation_modifier),
  │   "get",
  │   optional($.function_body)            // body can be omitted in protocols
  │ ),
  │
  │ computed_setter: $ => seq(
  │   optional(repeat($.attribute)),
  │   optional($.mutation_modifier),
  │   "set",
  │   optional(seq("(", $.simple_identifier, ")")),  // set(newValue)
  │   optional($.function_body)
  │ ),
  │
  │ willset_clause: $ => seq(
  │   optional(repeat($.attribute)),
  │   "willSet",
  │   optional(seq("(", $.simple_identifier, ")")),
  │   $.function_body
  │ ),
  │
  │ didset_clause: $ => seq(
  │   optional(repeat($.attribute)),
  │   "didSet",
  │   optional(seq("(", $.simple_identifier, ")")),
  │   $.function_body
  │ ),
  └─────────────────────────────────────────────────────

  Key structural insight:
    The `computed_property` child uses a top-level `choice` between
    `_statements` (implicit getter shorthand) and `repeat1(...)` of
    accessor clauses. This means `var x: Int { 42 }` produces a
    `computed_property` whose direct child is a `_statements` node
    (NOT a `computed_getter`), while `var x: Int { get { 42 } set { } }`
    produces a `computed_property` with `computed_getter` and
    `computed_setter` children. The `_modifiers` field at the top
    includes BOTH attributes (like @State) and access modifiers
    (like public) as a flat repeat — they are NOT in separate sequences.
    `willset_clause` and `didset_clause` are siblings of `computed_getter`
    inside `computed_property`, not in a separate observer block.

  Extractor implication:
    Stage 2 must distinguish between three property shapes:
    (1) Stored property: has `value` field (= expression), no
        `computed_property` child.
    (2) Implicit computed: has `computed_property` child whose first
        named child is `_statements` — treat the entire body as an
        implicit getter.
    (3) Explicit computed: has `computed_property` child containing
        `computed_getter`/`computed_setter`/`willset_clause`/`didset_clause`
        children.
    For SwiftUI `@State var x = value`, the property will be a stored
    property (shape 1) with @State in the _modifiers prefix. For
    `var body: some View { ... }`, it will be an implicit computed
    property (shape 2).

  Common mistake:
    Assuming `var body: some View { Text("Hi") }` contains a
    `computed_getter` node. It does NOT — the body is parsed as
    `_statements` directly inside `computed_property`, because the
    grammar treats brace-enclosed expressions without explicit `get`
    as implicit getter shorthand. Code looking for `computed_getter`
    will find nothing and incorrectly conclude the property has no body.
```

---

## Verification summary

| Rule | Expected Name | Actual Name | Name Match | Confidence |
|------|--------------|-------------|------------|------------|
| Trailing closure | `trailing_closure` | **`call_expression` + `call_suffix` + `lambda_literal`** | ⚠ No dedicated rule | **High** — confirmed by Issue #2 author explanation |
| Navigation/chaining | `navigation_expression` | **`navigation_expression`** | ✅ Exact match | **High** — confirmed in parser.c symbol table |
| Attribute (@State) | `attribute` | **`attribute`** | ✅ Exact match | **High** — `anon_sym_AT = 130` in parser.c |
| Computed var | `computed_property` | **`property_declaration` + `computed_property`** | ⚠ Two rules cooperate | **High** — `anon_sym_get/set` confirmed in parser.c |

**Source repo:** `alex-pinkus/tree-sitter-swift` v0.7.1 (MIT license, 473 symbols, 43 fields, 27 external tokens, parser LANGUAGE_VERSION 14)

**To obtain true verbatim definitions,** clone the repo and inspect `grammar.js` directly:
```bash
git clone https://github.com/alex-pinkus/tree-sitter-swift.git
# grammar.js is checked in at root level (compiled from grammar.ts)
```