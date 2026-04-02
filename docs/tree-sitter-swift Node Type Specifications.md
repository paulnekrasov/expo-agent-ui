# tree-sitter-swift Node Type Specifications

**Repository**: `alex-pinkus/tree-sitter-swift` v0.7.1 (latest as of March 2026)

**Critical note on source availability**: The `node-types.json` file is **auto-generated and NOT checked into the `main` branch** of the repository. It exists in the published npm/crates.io packages and on the `with-generated-files` branch. The crate source on `docs.rs` at `docs.rs/crate/tree-sitter-swift/latest/source/src/src/` confirms `node-types.json` is included in the Rust crate. The specifications below are **[INFERRED]** from the grammar.ts/grammar.js source analysis, corroborated against Helix editor queries, nvim-treesitter integration, Emacs swift-ts-mode, and release notes. Exact JSON field structures follow tree-sitter node-types.json schema conventions.

---

## STEP 2–3: Node type specifications

```
NODE: if_statement
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    condition: _if_condition_sequence_item [required] [named]
               (multiple conditions possible with comma-separated sequence)
    consequence: function_body [required] [named]
    alternative: choice(function_body, if_statement) [optional] [named]

  Named children:
    - _if_condition_sequence_item [required] (condition — can be expression, 
      binding_pattern with let/var, or availability_condition)
    - function_body [required] (the "then" body block)
    - function_body | if_statement [optional] (the "else" block or chained else-if)

  Anonymous children (literal tokens):
    - "if" at position 0
    - "," between multiple conditions
    - "else" before alternative (handled by external scanner as _else)

  Notes:
    - Swift treats if as both statement AND expression (Swift 5.9 SE-0380).
      There is NO separate `if_expression` node — the same `if_statement` node
      covers both usages.
    - The "else" keyword is managed by the external scanner (_else token) for
      context-sensitive newline handling.
    - Condition can include optional binding (if let x = ...) via 
      _if_condition_sequence_item which wraps binding_pattern, expression, or
      availability_condition.
    - prec.right() is used on the rule to handle else-if chaining.

  Extractor implication:
    Stage 2 must access field "condition" for the guard/binding check, 
    field "consequence" for the then-block body, and optionally field 
    "alternative" for the else branch. When alternative is another 
    if_statement, recursively extract the chain. Condition may be a comma-
    separated list of _if_condition_sequence_item nodes (e.g., 
    `if let x = a, let y = b`).

  Failure mode if missed:
    If the extractor looks for `if_expression` instead of `if_statement`, it 
    will silently miss ALL if-expressions in Swift 5.9+ code. If it ignores 
    the comma-separated condition list, it will lose optional-binding chains.
```

---

```
NODE: for_statement
  Source: tree-sitter-swift/grammar.js [INFERRED]
  ⚠ NAME MISMATCH: `for_in_statement` does NOT exist. The actual name is `for_statement`.

  Fields:
    item: _binding_pattern_no_expr [required] [named]
    type_annotation: type_annotation [optional] [named]
    collection: _expression [required] [named]
    where_clause: where_clause [optional] [named]
    body: function_body [required] [named]

  Named children:
    - _binding_pattern_no_expr [required] (loop variable/pattern, e.g. `item` or `(key, value)`)
    - type_annotation [optional]
    - _expression [required] (the iterable collection)
    - where_clause [optional] (filtering clause)
    - function_body [required] (loop body)

  Anonymous children (literal tokens):
    - "for" at position 0
    - "case" [optional] after "for" (for pattern-matching for-in)
    - "in" between item and collection
    - "{" and "}" around body (within function_body)

  Notes:
    - Swift has NO C-style for loops — only `for-in`. This single node covers all for-in variants.
    - Supports `for case let .foo(x) in collection` pattern matching.
    - May include try/await modifiers before the item pattern.
    - The `in` keyword is handled by the external scanner (_in token).

  Extractor implication:
    Stage 2 must access field "item" for the loop variable, "collection" for
    the iterable, and "body" for the loop body. Check for optional "case" 
    keyword child and "where_clause" field. The item field may contain a 
    tuple_pattern for destructuring (e.g., `for (key, value) in dict`).

  Failure mode if missed:
    If the extractor searches for `for_in_statement`, it will find ZERO for-loops
    in the AST. All for-loop extraction will silently fail.
```

---

```
NODE: switch_statement
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    expr: _expression [required] [named]

  Named children:
    - _expression [required] (the value being switched on, via field "expr")
    - switch_entry [multiple] [optional] (the case/default clauses)

  Anonymous children (literal tokens):
    - "switch" at position 0
    - "{" after the expression
    - "}" at end

  Notes:
    - Like if_statement, there is NO separate `switch_expression` — the same
      `switch_statement` handles both statement and expression contexts (Swift 5.9+).
    - Each switch_entry contains:
        - "case" keyword + switch_pattern (possibly comma-separated) + optional where_clause
        - OR "default" keyword
        - ":" separator
        - optional statements (body)
    - switch_pattern nodes hold the actual pattern matching logic.

  Extractor implication:
    Stage 2 must access field "expr" for the switched value, then iterate
    over switch_entry children. Each switch_entry has switch_pattern children
    for the patterns and optional statements for the case body. Check for
    "default" vs "case" anonymous children to distinguish default case.

  Failure mode if missed:
    If the extractor looks for `switch_expression`, it will miss all switch
    constructs. If it fails to iterate switch_entry children, case bodies
    and patterns will be silently lost.
```

---

```
NODE: line_string_literal
  Source: tree-sitter-swift/grammar.js [INFERRED]
  ⚠ NAME MISMATCH: `string_literal` does NOT exist as a node type.
    The actual types are `line_string_literal` (single-line) and 
    `multi_line_string_literal` (multi-line """-delimited).

  Fields:
    none

  Named children:
    - _line_str_text [multiple] [optional] (raw string text segments — external scanner token)
    - str_escaped_char [multiple] [optional] (escape sequences like \n, \t — external scanner token)
    - interpolation [multiple] [optional] (string interpolation \(...) expressions)

  Anonymous children (literal tokens):
    - "\"" at position 0 (opening quote)
    - "\"" at last position (closing quote)

  Notes:
    - String text content (_line_str_text) and escape chars (str_escaped_char) are
      handled entirely by the external scanner (src/scanner.c), NOT by grammar rules.
    - A string WITHOUT interpolation contains only _line_str_text children.
    - A string WITH interpolation contains interleaved _line_str_text and 
      interpolation children.
    - Extended string delimiters (#"..."#) are also handled by the external scanner
      via _open_raw_string_delimiter / _close_raw_string_delimiter tokens.
    - The hidden rules _line_str_text and str_escaped_char may not appear in 
      node-types.json as named nodes (they use underscore prefix = hidden).

  Extractor implication:
    Stage 2 MUST search for `line_string_literal` and `multi_line_string_literal`
    instead of `string_literal`. To reconstruct the full string, iterate all 
    children: _line_str_text children provide literal text segments, 
    interpolation children provide embedded expressions.

  Failure mode if missed:
    If the extractor searches for `string_literal`, it will find ZERO strings
    in the AST. ALL string extraction will silently fail.
```

---

```
NODE: multi_line_string_literal
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    none

  Named children:
    - _multi_line_str_text [multiple] [optional] (raw multiline text — external scanner)
    - str_escaped_char [multiple] [optional] (escape sequences — external scanner)
    - interpolation [multiple] [optional] (string interpolation expressions)

  Anonymous children (literal tokens):
    - "\"\"\"" at position 0 (opening triple-quote)
    - "\"\"\"" at last position (closing triple-quote)

  Notes:
    - Structurally identical to line_string_literal but uses triple-quote delimiters.
    - The _multi_line_str_text external token handles multiline whitespace/newline rules.

  Extractor implication:
    Stage 2 must handle this identically to line_string_literal but recognize 
    the triple-quote delimiters. Both node types can contain interpolation children.

  Failure mode if missed:
    Multi-line strings (common in SwiftUI) will be silently dropped.
```

---

```
NODE: interpolation
  Source: tree-sitter-swift/grammar.js [INFERRED]
  ⚠ NAME MISMATCH: `interpolated_string_expression` does NOT exist.
    `string_interpolation` does NOT exist. The actual name is `interpolation`.

  Fields:
    none

  Named children:
    - _expression [required] (the interpolated expression, e.g. a variable name,
      function call, or complex expression)

  Anonymous children (literal tokens):
    - "\(" at position 0 (interpolation open — actually "\\(" in the grammar)
    - ")" at position 2 (interpolation close)

  Notes:
    - This node appears as a child of line_string_literal or multi_line_string_literal.
    - Contains exactly one _expression child (which can be any Swift expression).
    - For raw strings (#"...\#(expr)..."#), the interpolation start is handled
      by the external scanner token _raw_str_interpolation_start.
    - The opening "\(" is a single anonymous token, not a backslash + parenthesis.

  Extractor implication:
    Stage 2 must find interpolation nodes inside string literal nodes. The single
    named child is the interpolated expression. To reconstruct a template string:
    iterate the parent string's children in order, converting _line_str_text 
    to literal text and interpolation nodes to expression placeholders.

  Failure mode if missed:
    If the extractor looks for `interpolated_string_expression` or 
    `string_interpolation`, it will find nothing. String interpolation will be
    silently treated as plain text, producing incorrect string values like
    "Hello, \(name)!" instead of a template with variable reference.
```

---

```
NODE: integer_literal
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    none

  Named children:
    none (this is a terminal/leaf token node)

  Anonymous children (literal tokens):
    none (the entire node is a single token)

  Notes:
    - Defined as token(choice(...)) — a pure lexical token, not a grammar rule
      with children.
    - Matches: decimal ([0-9][0-9_]*), hex (0x[0-9a-fA-F][0-9a-fA-F_]*),
      octal (0o[0-7][0-7_]*), binary (0b[01][01_]*).
    - Supports underscore separators (e.g., 1_000_000).
    - The node's text() gives the full literal string including prefix.

  Extractor implication:
    Stage 2 reads node.text() directly. No field access needed. Parse the
    prefix (0x, 0o, 0b, or none) to determine the radix.

  Failure mode if missed:
    Integer literals will be silently omitted from extracted data.
```

---

```
NODE: boolean_literal
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    none

  Named children:
    none (leaf node)

  Anonymous children (literal tokens):
    - "true" or "false" (one of these is the single anonymous child)

  Notes:
    - Defined as choice("true", "false") in the grammar.
    - The node itself is named; the "true"/"false" text is an anonymous child
      OR the node.text() gives the value directly (depending on grammar structure).
    - In practice, check node.text() == "true" or "false".

  Extractor implication:
    Stage 2 reads node.text() to determine true/false.

  Failure mode if missed:
    Boolean values silently omitted. May be confused with identifiers named
    `true`/`false` if not properly distinguished.
```

---

```
NODE: real_literal
  Source: tree-sitter-swift/grammar.js [INFERRED]
  ⚠ NAME MISMATCH: `float_literal` does NOT exist. The actual name is `real_literal`.

  Fields:
    none

  Named children:
    none (this is a terminal/leaf token node)

  Anonymous children (literal tokens):
    none (single token)

  Notes:
    - Defined as token(choice(...)) — pure lexical token.
    - Matches: decimal float ([0-9][0-9_]*.[0-9][0-9_]*), 
      scientific notation ([0-9]...[eE][+-]?[0-9]...),
      hex float with binary exponent (0x...[pP][+-]?[0-9]...).
    - Supports underscore separators.

  Extractor implication:
    Stage 2 reads node.text() directly. MUST search for `real_literal`,
    NOT `float_literal`.

  Failure mode if missed:
    If the extractor searches for `float_literal`, it will find ZERO floating-
    point numbers. All float extraction silently fails.
```

---

```
NODE: computed_property
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    none (children are accessed positionally/by type)

  Named children:
    - statements [optional] (implicit getter — just code in braces)
    - computed_getter [multiple] [optional] (explicit get { } block)
    - computed_setter [multiple] [optional] (explicit set { } or set(newValue) { })
    - computed_modify [multiple] [optional] (_modify accessor)
    - computed_property_observer [multiple] [optional] (willSet/didSet blocks)

  Anonymous children (literal tokens):
    - "{" at position 0
    - "}" at last position

  Notes:
    - This node appears as a child of property_declaration.
    - An implicit getter is represented as a statements child (no get keyword).
    - Explicit getter/setter are computed_getter/computed_setter children.
    - willSet/didSet observers are computed_property_observer children
      (confirmed by PR #374 "Add willSet/didSet to indents").
    - A property can have EITHER statements (implicit getter) OR a mix of
      computed_getter/computed_setter/computed_property_observer.
    - There is NO `computed_property_declaration` node type. The declaration
      is property_declaration; computed_property is the accessor block.

  Extractor implication:
    Stage 2 must check if the computed_property has a statements child
    (implicit getter) or computed_getter/computed_setter children (explicit 
    accessors). For willSet/didSet, look for computed_property_observer children.

  Failure mode if missed:
    Computed properties silently treated as simple stored properties.
    Getter/setter logic lost. willSet/didSet observers silently dropped.
```

---

```
NODE: property_declaration
  Source: tree-sitter-swift/grammar.js [INFERRED]

  Fields:
    name: _binding_pattern_no_expr [required] [named]
    type: type_annotation [optional] [named]
    value: _expression [optional] [named]

  Named children:
    - modifiers [optional] (visibility, mutation modifiers etc.)
    - _binding_pattern_no_expr [required] (the property name/pattern, via field "name")
    - type_annotation [optional] (via field "type")
    - _expression [optional] (initial value, via field "value")
    - computed_property [optional] (getter/setter/observer block)
    - type_constraints [optional]

  Anonymous children (literal tokens):
    - "let" or "var" keyword (choice between the two)
    - "=" before initial value (handled by external scanner as _eq)

  Notes:
    - This is the PRIMARY declaration node for both stored and computed properties.
    - There is NO separate `variable_declaration` node in this grammar.
      Both local variables and type-level properties use property_declaration.
    - The "let"/"var" distinction is an anonymous child keyword.
    - A stored property: has field "value" but no computed_property child.
    - A computed property: has a computed_property child (may or may not have "value").
    - A property with observers: has computed_property child containing 
      computed_property_observer (willSet/didSet).

  Extractor implication:
    Stage 2 accesses field "name" for the property name, field "type" for
    type annotation, field "value" for initial value. Check for computed_property
    named child to determine if it's computed. Check the anonymous "let"/"var"
    child to determine mutability.

  Failure mode if missed:
    If extractor looks for `variable_declaration`, it finds nothing. All
    property/variable extraction silently fails.
```

---

## STEP 4: String interpolation corpus example

```
CORPUS: Text with string interpolation
  Swift input:
    Text("Hello, \(name)!")

  Expected node hierarchy:
    (source_file
      (call_expression
        function: (simple_identifier)        ;; "Text"
        arguments: (call_suffix
          (value_arguments
            (value_argument
              value: (line_string_literal     ;; "Hello, \(name)!"
                (_line_str_text)              ;; "Hello, " (raw text segment)
                (interpolation               ;; \(name)
                  (simple_identifier))        ;; "name" — the expression
                (_line_str_text)))))))        ;; "!" (raw text segment)

  Extractor implication:
    To extract the template string and interpolated variable name:
    1. Find the line_string_literal node
    2. Iterate its children IN ORDER:
       - _line_str_text children → raw text segments (may be hidden/unnamed)
       - interpolation children → embedded expressions
    3. For each interpolation child, access its single _expression child
       (here: simple_identifier "name")
    4. Reconstruct template: "Hello, " + ${name} + "!"
    
    IMPORTANT: _line_str_text nodes may be hidden (underscore prefix) and 
    not appear as named children. Use node.child() with index iteration
    or named_child traversal plus anonymous child traversal to capture 
    both text segments and interpolation nodes.

    For extracting JUST the interpolated variable name:
      line_string_literal
        → child of type "interpolation"
          → first named child (the expression)
            → node.text() gives "name"
```

---

## STEP 5: Nodes NOT found

```
NODE NOT FOUND: string_literal — closest match: line_string_literal, multi_line_string_literal
  ⚠ NAME MISMATCH: The grammar splits strings into two node types.
  Stage 2 must search for BOTH line_string_literal and multi_line_string_literal.

NODE NOT FOUND: interpolated_string_expression — closest match: interpolation
  ⚠ NAME MISMATCH: Interpolation is a CHILD node inside string literals, not a top-level expression type.
  Stage 2 must find interpolation nodes as children of string literal nodes.

NODE NOT FOUND: string_interpolation — closest match: interpolation
  ⚠ NAME MISMATCH: The node is simply called "interpolation".

NODE NOT FOUND: float_literal — closest match: real_literal
  ⚠ NAME MISMATCH: The grammar uses "real_literal" (following Swift's naming conventions).
  Stage 2 must search for real_literal.

NODE NOT FOUND: for_in_statement — closest match: for_statement
  ⚠ NAME MISMATCH: Swift only has for-in loops, but the node is just called "for_statement".

NODE NOT FOUND: if_expression — closest match: if_statement
  Note: if_statement covers both statement and expression usage (Swift 5.9+ SE-0380).

NODE NOT FOUND: switch_expression — closest match: switch_statement
  Note: switch_statement covers both statement and expression usage (Swift 5.9+).

NODE NOT FOUND: computed_property_declaration — closest match: property_declaration + computed_property
  Note: Computed properties are property_declaration nodes that contain a computed_property child.

NODE NOT FOUND: variable_declaration — closest match: property_declaration
  Note: Both local variables and type-level properties use property_declaration.
  The let/var distinction is an anonymous keyword child within property_declaration.
```

---

## Summary: name mapping table

| Searched Name | Actual Node Type | Status |
|---|---|---|
| `if_statement` | **`if_statement`** | ✅ Exact match |
| `if_expression` | **`if_statement`** | ⚠ Handled by if_statement |
| `for_statement` | **`for_statement`** | ✅ Exact match |
| `for_in_statement` | **`for_statement`** | ⚠ NAME MISMATCH |
| `switch_statement` | **`switch_statement`** | ✅ Exact match |
| `switch_expression` | **`switch_statement`** | ⚠ Handled by switch_statement |
| `string_literal` | **`line_string_literal`** / **`multi_line_string_literal`** | ⚠ NAME MISMATCH — split into two types |
| `interpolated_string_expression` | **`interpolation`** | ⚠ NAME MISMATCH — child of string, not top-level |
| `string_interpolation` | **`interpolation`** | ⚠ NAME MISMATCH |
| `interpolation` | **`interpolation`** | ✅ Exact match |
| `integer_literal` | **`integer_literal`** | ✅ Exact match |
| `boolean_literal` | **`boolean_literal`** | ✅ Exact match |
| `float_literal` | **`real_literal`** | ⚠ NAME MISMATCH |
| `computed_property` | **`computed_property`** | ✅ Exact match |
| `computed_property_declaration` | **`property_declaration`** + **`computed_property`** | ⚠ Two nodes, not one |
| `property_declaration` | **`property_declaration`** | ✅ Exact match |
| `variable_declaration` | **`property_declaration`** | ⚠ NAME MISMATCH — uses property_declaration |

---

## Data source and confidence assessment

All specifications above are marked **[INFERRED]** from grammar.js analysis, corroborated by:

- **Helix editor** (`runtime/queries/swift/highlights.scm`) — uses these exact node type names for syntax highlighting
- **nvim-treesitter** — uses the `with-generated-files` branch and these node names
- **Emacs swift-ts-mode** (`rechsteiner/swift-ts-mode`) — explicitly compatible with alex-pinkus/tree-sitter-swift
- **Release notes** — PRs #374 (willSet/didSet), #375 (init constructors), #380 (distributed modifier) confirm node naming
- **docs.rs crate** — tree-sitter-swift v0.7.1 publishes `NODE_TYPES` constant containing the full node-types.json

**To obtain the exact [SPEC] JSON**: Download the crate from crates.io (`cargo download tree-sitter-swift==0.7.1`) and extract `src/node-types.json`, or access `docs.rs/tree-sitter-swift/latest/tree_sitter_swift/constant.NODE_TYPES.html` in a browser. The node-types.json was confirmed present in the crate source at `docs.rs/crate/tree-sitter-swift/latest/source/src/src/` listing `tree_sitter/`, `grammar.json`, and `node-types.json`.

**Confidence level**: HIGH for node type names (5+ independent corroborating sources). MEDIUM for exact field structures (inferred from grammar rules, not directly from node-types.json). The field names and child types follow standard tree-sitter conventions and match the grammar.ts rule definitions.