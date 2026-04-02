# SwiftUI Preview – Full Layer 1 Grammar Reference (tree-sitter-swift)

## Session Header

Research Layer: 1 — tree-sitter-swift Grammar  
Task: Finish Layer 1 by collecting exact node types, fields, child rules, and representative corpus examples for SwiftUI-relevant constructs (calls, trailing closures, modifiers, declarations, property wrappers, member access) from `tree-sitter-swift`.  
Sources: `tree-sitter-swift` `node-types.json` and `grammar.js` on GitHub; Swift test corpus files `expressions.txt`, `functions.txt`, and `statements.txt`; Tree-sitter static node types documentation.[^1][^2][^3]
Scope: Trailing closures and `@ViewBuilder`-style bodies, modifier chains, `VStack`/`HStack`/`ZStack`-style calls, `Text`/`Image`-style calls, parameter lists, `if`/`for` statements inside closures, struct declarations with `var body: some View`, property wrapper-style attributes, and member access expressions.

***

## Node Specs – Core Call and Closure Structure

### NODE: call_expression

NODE: call_expression  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none – all information is conveyed via positional children)
  Children:
    multiple: true, required: true  
    types (subset most relevant to SwiftUI calls):
      - simple_identifier [named]
      - navigation_expression [named]
      - call_expression [named] (nested calls / chains)
      - call_suffix [named]
      - lambda_literal [named]
      - value_arguments [named]
  Notes: `call_expression` represents any function-style call, including SwiftUI view constructors (`VStack(...)`, `Text("...")`, `Image(systemName: ...)`) and chained modifiers (for example `someView.padding().background(Color.blue)`). The callee (base function or type) appears as a leading `simple_identifier` or `navigation_expression`, while argument lists and trailing closures are modeled as `call_suffix` children.[^3][^2]
  Extractor implication: Stage 2 must iterate the ordered children of `call_expression` and interpret the first `simple_identifier`/`navigation_expression` as the callee, then consume one or more `call_suffix` nodes to recover arguments and closures. For SwiftUI modifier chains, nested `call_expression` nodes encode the left-associated chain; the extractor should walk inward through nested `call_expression` targets to gather modifiers in application order, then reverse them when storing in the IR so that the first modifier in source is applied first in layout.[^3]

### NODE: call_suffix

NODE: call_suffix  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    name: simple_identifier [multiple: true, required: false, named]
  Children:
    multiple: true, required: true  
    types:
      - lambda_literal [named]
      - value_arguments [named]
  Notes: `call_suffix` groups all syntactic suffix elements of a call: argument lists and optional trailing closures. A single `call_expression` may have multiple `call_suffix` children (for example, labels in macros or complex calls), but for typical SwiftUI calls you see one suffix with `value_arguments` and optionally one `lambda_literal`.[^2][^3]
  Extractor implication: Stage 2 should treat each `call_suffix` as a logical argument segment. The `name` field (if present) carries identifier tokens that conceptually label the suffix, while a `value_arguments` child holds positional/labeled parameters and a `lambda_literal` child encodes trailing closure bodies. When reconstructing SwiftUI calls, the extractor should preserve suffix order to maintain argument semantics and should treat a trailing `lambda_literal` as the view-builder body for containers like `VStack`, `HStack`, and `NavigationStack`.

### NODE: value_arguments

NODE: value_arguments  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    multiple: true, required: false  
    types:
      - value_argument [named]
  Notes: `value_arguments` wraps a comma-separated list of `value_argument` nodes. It appears inside `call_suffix` for any call with parentheses, including SwiftUI view constructors and modifiers such as `.padding(8)` or `.frame(maxWidth: .infinity)`. An empty argument list is represented by `value_arguments` with zero children.[^3]
  Extractor implication: Stage 2 should iterate `value_arguments` children in order, mapping each `value_argument` to an IR parameter. The ordering is significant for unlabeled arguments such as `VStack(alignment: .leading, spacing: 8)` (where positional semantics are defined by the API), while labels make semantics explicit through `value_argument_label` nodes.

### NODE: value_argument

NODE: value_argument  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    name: value_argument_label [multiple: false, required: false, named]
    reference_specifier: value_argument_label [multiple: true, required: false, named]
    value: many possible expression nodes (literals, `call_expression`, `navigation_expression`, `tuple_expression`, and others) plus various operator tokens [multiple: true, required: false, mixed named/anonymous]
  Children:
    multiple: false, required: false  
    types:
      - type_modifiers [named]
  Notes: `value_argument` models a single argument in a call, optionally with an external/internal label in `name` and a rich expression in `value`. The `value` field’s union of many expression node types allows almost any Swift expression to appear as an argument, including nested view calls such as `Image(systemName: "star")` or `Color.blue`.[^3]
  Extractor implication: The extractor should unwrap `name` (if present) to obtain the argument label string (for example `alignment`, `spacing`, `systemName`) and then recursively traverse the `value` expression to construct an appropriate IR value (numeric literal, color, nested ViewNode, etc.). Operator tokens and lower-level expression nodes can typically be ignored after resolving the high-level semantic value, but the extractor must still scan through them to locate embedded `call_expression` or `navigation_expression` structures relevant to SwiftUI.

### NODE: value_argument_label

NODE: value_argument_label  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    multiple: false, required: true  
    types:
      - simple_identifier [named]
  Notes: `value_argument_label` is a small wrapper around a single `simple_identifier` and appears both as the external argument label and as a reference-specifier label in Swift argument lists.[^3]
  Extractor implication: Stage 2 should read the `simple_identifier` text and treat it as the canonical parameter label in the SwiftUI IR, avoiding leaking parser-specific node names into the TypeScript data model.

### NODE: lambda_literal

NODE: lambda_literal  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    captures: capture_list [multiple: false, required: false, named]
    type: lambda_function_type [multiple: false, required: false, named]
  Children:
    multiple: true, required: false  
    types:
      - attribute [named]
      - statements [named]
  Notes: `lambda_literal` corresponds to braces-style closures `{ ... }`, including optional capture lists, explicit function types, attributes, and a body encoded in a `statements` node. In the corpus, it appears in higher-order function examples and trailing-closure forms.[^3][^2]
  Extractor implication: For SwiftUI view-builder bodies, the extractor can generally ignore `captures` and explicit `type` information and focus on the `statements` child. Each child of `statements` that yields a view (for example `call_expression`, `if_statement`, `for_statement`) should become a child ViewNode in the IR, with conditional and looping constructs represented through dedicated IR variants.

### NODE: statements (closure body)

NODE: statements  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    multiple: true, required: false  
    types (subset most relevant in view bodies):
      - call_expression [named]
      - lambda_literal [named]
      - navigation_expression [named]
      - if_statement [named]
      - for_statement [named]
      - while_statement [named]
      - switch_statement [named]
      - integer_literal, boolean_literal, line_string_literal, multi_line_string_literal [named]
  Notes: `statements` is a generic container for sequences of statements and expressions in function bodies, closures, and other blocks. Within view-builder closures, it holds the individual view-producing expressions and control-flow constructs that SwiftUI interprets to build the view tree.[^3][^2]
  Extractor implication: When a `lambda_literal` is used as a view-builder body, Stage 2 should iterate the `statements` children in order, converting each view-producing node into a corresponding ViewNode in the IR. Non-view statements (for example local bindings) may be ignored or handled via special IR nodes per project rules.

***

## Node Specs – Member Access and Qualified Names

### NODE: navigation_expression

NODE: navigation_expression  
Source: tree-sitter-swift `node-types.json` and `grammar.js` [SPEC][^1][^2]
  Fields:
    target: many possible type/expression nodes including `_expression` and `_navigable_type_expression` [multiple: true, required: true]
    suffix: navigation_suffix [multiple: false, required: true]
    element: dictionary_type | existential_type | opaque_type [multiple: false, required: false]
  Children:
    multiple: true, required: true  
    types (subset):
      - simple_identifier [named]
      - user_type [named]
      - call_expression [named]
      - lambda_literal [named]
      - literals and type nodes
  Notes: The grammar defines `navigation_expression` as a left-associative member-access form: a `target` (expression or type) followed by a `navigation_suffix`. It covers expressions like `Color.blue`, `MyModule.MyView`, or `foo.bar().baz` and can nest recursively for longer chains.[^1][^3]
  Extractor implication: SwiftUI code uses `navigation_expression` heavily for semantic values, such as `Color.blue`, `Alignment.leading`, and chained method calls in closures. The extractor should reconstruct the full dotted path from the `target` chain and `navigation_suffix` nodes, then map well-known paths into semantic IR enums (colors, alignments, etc.) while leaving unknown paths as opaque identifiers.

### NODE: navigation_suffix

NODE: navigation_suffix  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    suffix: integer_literal | simple_identifier [multiple: false, required: true]
  Children:
    multiple: false, required: true  
    types:
      - integer_literal [named]
      - simple_identifier [named]
  Notes: `navigation_suffix` holds the last component of a navigation chain – either a property/enum-case name or an index. The grammar rule for `navigation_expression` uses it as a required field, meaning that any member access expression will include exactly one `navigation_suffix` at the end of the current segment.[^3]
  Extractor implication: When building the text representation of a member-access path, Stage 2 should append the `suffix` to the path recovered from `target`. For SwiftUI, this is how textual names like `Color.blue` or `EdgeInsets.top` are derived from the AST.

### NODE: simple_identifier

NODE: simple_identifier  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    (none – this is a leaf node)
  Notes: `simple_identifier` is the base identifier node used throughout the grammar for variable names, type names, function names, argument labels, and enum cases.[^3]
  Extractor implication: The extractor should treat `simple_identifier` text as the canonical name token and build higher-level semantics (
for example distinguishing `VStack` vs `HStack`, `Text` vs `Image`, or `NavigationStack` vs `List`) entirely from identifier strings and context, not from parser node names.

***

## Node Specs – Declarations, Body Properties, and Property Wrappers

### NODE: class_declaration (covers `struct`/`class`/`actor`/`enum`)

NODE: class_declaration  
Source: tree-sitter-swift `node-types.json` and `grammar.js` [SPEC][^1][^2]
  Fields:
    declaration_kind: "class" | "struct" | "actor" | "extension" | "enum" [multiple: false, required: true]
    name: type_identifier | user_type | other type nodes [multiple: false, required: true]
    body: class_body | enum_class_body [multiple: false, required: true]
  Children:
    multiple: true, required: false  
    types (subset):
      - modifiers [named]
      - attribute [named]
      - inheritance_specifier [named]
      - type_parameters [named]
      - type_constraints [named]
  Notes: The grammar encodes all nominal and extension declarations under `class_declaration`, with `declaration_kind` distinguishing `struct`, `class`, `actor`, `extension`, and `enum`. The `body` field references a `class_body` or `enum_class_body`, which in turn contains property and function members.[^1]
  Extractor implication: For SwiftUI, only `class_declaration` nodes with `declaration_kind: "struct"` (and possibly `"class"`/`"actor"` in advanced setups) that conform to `View` should be treated as renderable root view types. The extractor must therefore read both `declaration_kind` and `inheritance_specifier` (for example `struct MyView: View { ... }`) to decide which declarations produce previewable SwiftUI views.

### NODE: class_body

NODE: class_body  
Source: tree-sitter-swift `grammar.js` [SPEC][^1]
  Fields:
    (none)
  Children:
    multiple: false, required: false  
    types:
      - _class_member_declarations (internally expanded to members such as `property_declaration`, `function_declaration`, nested `class_declaration`)
  Notes: The grammar defines `class_body` as `{` followed by zero or more member declarations and `}`. Individual members (including `var body: some View` and `@State var count`) appear as `property_declaration` nodes inside this body.[^1]
  Extractor implication: Stage 2 must traverse `class_body` to locate the `body` property and any state-like properties with property-wrapper attributes. Each `property_declaration` encountered should be classified (view body vs. state vs. other) based on attributes, type annotations, and naming.

### NODE: property_declaration

NODE: property_declaration  
Source: tree-sitter-swift `node-types.json` and `grammar.js` [SPEC][^1][^2]
  Fields:
    name: pattern [multiple: true, required: true]
    value: expression (many possible node types and operator tokens) [multiple: true, required: false]
    computed_value: computed_property [multiple: true, required: false]
  Children:
    multiple: true, required: false  
    types:
      - modifiers [named]
      - pattern [named]
      - type_annotation [named]
      - type_constraints [named]
      - computed_property [named]
  Notes: `property_declaration` is built from a binding pattern (`let`/`var`), one or more `pattern` names, optional `type_annotation` and constraints, and either an initializer expression (`value`) or a computed-property body. `var body: some View { ... }` and `@State var count = 0` both become `property_declaration` nodes with different modifiers and initializers.[^1]
  Extractor implication: For SwiftUI, the extractor should:
  - Identify the `body` property by pattern name (`simple_identifier` text `"body"`) and treat its `type_annotation` and computed body as the root view-builder for the declaration.
  - Detect property wrappers (for example `@State`, `@Binding`) via preceding `modifiers` → `attribute` nodes and map them into IR stub rules for state handling.
  - Distinguish stored vs. computed properties using `value` vs. `computed_value` and ignore non-SwiftUI-relevant properties.

### NODE: modifiers

NODE: modifiers  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    multiple: true, required: true  
    types:
      - attribute [named]
      - function_modifier [named]
      - inheritance_modifier [named]
      - member_modifier [named]
      - mutation_modifier [named]
      - ownership_modifier [named]
      - parameter_modifier [named]
      - property_behavior_modifier [named]
      - property_modifier [named]
      - visibility_modifier [named]
  Notes: `modifiers` is a generic container for all modifiers and attributes that precede declarations, including property wrappers and access-control keywords.[^3]
  Extractor implication: Property wrappers such as `@State`, `@Binding`, and `@ObservedObject` appear as `attribute` children inside `modifiers`. Stage 2 must scan `modifiers` on `property_declaration` nodes, detect `attribute` nodes whose underlying identifier matches known wrapper names, and attach the corresponding stub rules in the IR.

### NODE: attribute (property wrappers / annotations)

NODE: attribute  
Source: tree-sitter-swift `node-types.json` and `grammar.js` [SPEC][^1][^2]
  Fields:
    (none at the field level – content is in children)
  Children:
    multiple: true, required: true  
    types (subset):
      - simple_identifier [named]
      - user_type [named]
      - call_expression and other expressions [named]
  Notes: The grammar treats `@State`, `@Binding`, and other property wrappers as `attribute` nodes, with the wrapped identifier or type appearing as a `user_type` or `simple_identifier` child. Attributes can also include argument lists via `call_expression` for more complex annotations.[^1]
  Extractor implication: Stage 2 should read the identifier text from `attribute` children (for example the `type_identifier` inside `user_type` or the `simple_identifier`) and compare it against a known set of SwiftUI wrapper names. Matching attributes should be recorded on the IR field representing that property, triggering state-handling behavior in the layout/runtime approximations.

### NODE: value_binding_pattern

NODE: value_binding_pattern  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    mutability: "let" | "var" [multiple: false, required: true]
  Children:
    (none – pattern and initializer are modeled elsewhere)
  Notes: `value_binding_pattern` records whether a property or local binding is declared as `let` or `var`. In property declarations, it precedes the `pattern` that holds the property name and optional type annotation.[^3]
  Extractor implication: SwiftUI semantics differ between `let` and `var` for `body` and state properties (for example `var body: some View` vs. constants). Stage 2 may use `mutability` to enforce expectations (for example that `body` is a `var`) or to surface diagnostics in future tooling.

### NODE: type_annotation, user_type, type_identifier

NODE: type_annotation  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    name: array_type | dictionary_type | existential_type | function_type | metatype | opaque_type | optional_type | protocol_composition_type | suppressed_constraint | tuple_type | type_pack_expansion | type_parameter_pack | user_type [multiple: false, required: true]
    type: same union plus `type_modifiers` and punctuation [multiple: true, required: true]
  Children:
    multiple: true, required: true  
    types (subset):
      - user_type [named]
      - type_modifiers [named]
  Notes: `type_annotation` encodes the explicit type on a declaration, including `some View`, `Image`, `Color`, and other SwiftUI types. `user_type` and `type_identifier` provide the leaf-level identifier pieces that make up these types.[^3]
  Extractor implication: For `var body: some View`, the extractor must read the `user_type` and any modifiers inside `type_annotation` to confirm that the property is a SwiftUI view (or an opaque `some View`). This determines whether the declaration is eligible to be rendered as a preview.

NODE: user_type  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    multiple: true, required: true  
    types:
      - type_identifier [named]
      - type_arguments [named]
  Notes: `user_type` represents named, user-defined (or framework-defined) types, possibly with generic arguments. It is used for view types (`Text`, `Image`, `NavigationStack`), protocols (`View`), and other Swift types.
  Extractor implication: Mapping type names to SwiftUI semantics (for example recognizing `View`, `Text`, `Image`, `NavigationStack`, `List`) depends on reading `user_type` and `type_identifier` content accurately.

NODE: type_identifier  
Source: tree-sitter-swift `node-types.json` [SPEC][^2]
  Fields:
    (none)
  Children:
    (none – leaf node)
  Notes: `type_identifier` is the leaf identifier used inside `user_type` and elsewhere to name types in annotations and declarations.[^3]
  Extractor implication: Similar to `simple_identifier`, this node’s text is the basis for identifying SwiftUI types in type positions.

***

## Corpus Examples – Calls, Member Access, and Trailing Closures

### CORPUS: Conjunction with Call Sites

Swift input:
  a && b()
  
  a
      && c.b()

Source: `test/corpus/expressions.txt` in `tree-sitter-swift`.[^1]

Parse tree (abridged as it appears in the corpus):
  (source_file
    (conjunction_expression
      (simple_identifier)
      (call_expression
        (simple_identifier)
        (call_suffix
          (value_arguments))))
    (conjunction_expression
      (simple_identifier)
      (call_expression
        (navigation_expression
          (simple_identifier)
          (navigation_suffix
            (simple_identifier)))
        (call_suffix
          (value_arguments)))))

Extractor implication:
  - Demonstrates how bare function calls (`b()`) and qualified calls (`c.b()`) appear as `call_expression` nodes with either `simple_identifier` or `navigation_expression` as the callee, plus a `call_suffix` containing `value_arguments`.
  - For SwiftUI, this pattern is identical to calls such as `Text("hi")` or `Color.blue.opacity(0.5)`, confirming that the extractor should always look for a callee expression followed by `call_suffix` when reconstructing view-creation calls.

### CORPUS: Higher-Order Function with Trailing Closure

Swift input:
  test(2) { $0.doSomething() }

Source: `test/corpus/functions.txt` in `tree-sitter-swift`.[^1]

Parse tree (as in the corpus):
  (source_file
    (call_expression
      (simple_identifier)
      (call_suffix
        (value_arguments
          (value_argument
            (integer_literal)))
        (lambda_literal
          (statements
            (call_expression
              (navigation_expression
                (simple_identifier)
                (navigation_suffix
                  (simple_identifier)))
              (call_suffix
                (value_arguments)))))))

Extractor implication:
  - Confirms the pattern for trailing closures: `call_expression` → `call_suffix` with both `value_arguments` and `lambda_literal` children.
  - The closure body’s `statements` node contains a nested `call_expression` with `navigation_expression` callee (`$0.doSomething()`), illustrating how view-builder bodies will encode method calls on captured values.
  - For SwiftUI, containers like `VStack { Text("A") }` follow the same structural pattern, replacing `simple_identifier: test` with `simple_identifier: VStack` and the closure body’s calls with view-producing `call_expression` nodes.

### CORPUS: Property Declaration Inside Block

Swift input (excerpt from a `do` block with local property):
  do {
      let b = 1
  } catch ...

Source: `test/corpus/statements.txt` in `tree-sitter-swift`.[^1]

Parse tree (relevant portion):
  (do_statement
    (statements
      (property_declaration
        (value_binding_pattern)
        (pattern
          (simple_identifier))
        (integer_literal)))
    ...)

Extractor implication:
  - Shows how `property_declaration` is used for both local and member properties, always combining a `value_binding_pattern`, `pattern` with `simple_identifier` name, and an initializer expression.
  - For SwiftUI, member properties like `@State var count = 0` will appear similarly inside `class_body`, with additional `modifiers`/`attribute` nodes attaching the property wrapper. Stage 2 can rely on this pattern when scanning class bodies for state-like properties.

***

## Mapping Grammar to the 14 Priority Constructs

This section ties the collected node specifications back to the project’s prioritized construct list for Layer 1.

1. Trailing closure / `@ViewBuilder` body:
   - Nodes: `call_expression`, `call_suffix`, `lambda_literal`, `statements`.[^1][^2]
   - Pattern: `call_expression` with `call_suffix` containing both `value_arguments` (optional) and a `lambda_literal` whose `statements` body encodes the view-builder content.

2. Modifier chain (nested `call_expression` wrapping):
   - Nodes: `call_expression`, `navigation_expression`, `call_suffix`, `value_arguments`.[^3][^2]
   - Pattern: Left-associated nesting of `call_expression` nodes where the callee of an outer call is itself a `call_expression`, representing source chains like `view.padding().background(Color.blue)`.

3. `VStack`, `HStack`, `ZStack` call sites with children:
   - Nodes: `call_expression` (callee `simple_identifier` `VStack`/`HStack`/`ZStack`), `call_suffix`, `value_arguments`, `lambda_literal`, `statements`.[^2]
   - Pattern: Identical to the trailing-closure corpus example; children views live as `call_expression` nodes inside the closure body’s `statements` node.

4. `Text("string")` — literal and interpolated:
   - Nodes: `call_expression`, `value_arguments`, `value_argument`, `line_string_literal` / `multi_line_string_literal` / `raw_string_literal`.[^3][^2]
   - Pattern: `call_expression` callee `simple_identifier: Text`, `call_suffix` containing `value_arguments` → `value_argument` whose `value` field holds a string-literal node. String interpolation details are fully handled inside the string literal node.

5. `Image(systemName:)` and `Image(_:)` variants:
   - Nodes: same as `Text`, plus `value_argument_label` for the labeled form (`systemName:`) and `navigation_expression` when using `Image(systemName: .someSymbol)`.[^2]
   - Pattern: `call_expression` callee `simple_identifier: Image`, `value_arguments` with one or more `value_argument` nodes, some of which carry a `name` field via `value_argument_label`.

6. `Button(action:label:)` and `Button(_ title:action:)` variants:
   - Nodes: `call_expression`, `value_arguments`, `value_argument`, `value_argument_label`, `lambda_literal`, `statements`.[^2]
   - Pattern: Buttons are ordinary calls with one or more arguments where some arguments are closures (`lambda_literal`) representing the action and/or label. In the AST, these closures appear either inside `value_arguments` or as trailing `lambda_literal` children of `call_suffix`.

7. `NavigationLink(destination:label:)` variants:
   - Nodes: same as `Button` plus `navigation_expression` for destination/label values that reference other views by type or member access.[^1][^2]
   - Pattern: Identical call/argument structure; the only difference is semantic interpretation of the callee identifier (`NavigationLink`) and specific labels.

8. `.frame()`, `.padding()`, `.foregroundColor()`, `.background()` modifiers:
   - Nodes: `call_expression`, `navigation_expression` (for dotted modifiers), `call_suffix`, `value_arguments`, `value_argument`, `value_argument_label`, `lambda_literal` (for closure-based variants such as `background { ... }`).[^3][^2]
   - Pattern: Modifiers are method-like calls chained onto a base view. In the AST, they form nested `call_expression` nodes where the callee is a `navigation_expression` with `target` set to the previous view expression and `suffix` set to the modifier name.

9. `ForEach` — static array and dynamic range variants:
   - Nodes: `call_expression` callee `simple_identifier: ForEach` or `navigation_expression`, `value_arguments`, `lambda_literal`, `statements`.[^2]
   - Pattern: Syntactically these are plain calls plus closures. The distinction between static arrays and ranges is encoded in the argument expressions (for example `0..<10` as `range_expression`) and must be interpreted at the IR level, not via special grammar nodes.

10. `if/else` conditional content inside `@ViewBuilder`:
    - Nodes: `if_statement` inside `statements`, along with nested `call_expression` nodes for each branch’s view content.[^3][^2]
    - Pattern: The `statements` node in a closure body contains `if_statement` nodes whose bodies are themselves `statements` with view-producing `call_expression` children. View-builder semantics are applied in later phases; the grammar simply encodes normal control flow.

11. Struct declaration with `var body: some View`:
    - Nodes: `class_declaration` (with `declaration_kind: "struct"`), `class_body`, `property_declaration`, `value_binding_pattern`, `pattern` (name `body`), `type_annotation` (containing `user_type`/`type_identifier` and possibly `opaque_type` for `some View`).[^1][^2]
    - Pattern: `class_declaration` → `class_body` → `property_declaration` for `body`, with optional `attribute` modifiers for macros and a computed or stored value that is a closure or expression evaluating to a view.

12. Property wrapper annotations (`@State`, `@Binding`, `@ObservedObject`):
    - Nodes: `modifiers`, `attribute`, `user_type`, `type_identifier`, `property_declaration`.[^1][^2]
    - Pattern: Property wrappers are represented as `attribute` nodes inside `modifiers` preceding a `property_declaration`. The wrapper name appears as a `user_type`/`type_identifier` or `simple_identifier` child inside `attribute`.

13. Member access expressions (`.blue`, `Color.blue`, `.infinity`):
    - Nodes: `navigation_expression`, `navigation_suffix`, `simple_identifier`, `special_literal` (for `.infinity`-like constants depending on grammar version).[^3][^2]
    - Pattern: The grammar always encodes member access using `navigation_expression` with a `target` and `navigation_suffix`, whether the target is explicit (`Color`) or implicit (context-dependent `.blue` may be represented using a suppressed target form or special casing in `_expression`).

14. `NavigationStack` and `List` call sites:
    - Nodes: `call_expression` callee `simple_identifier: NavigationStack`/`List`, `call_suffix`, `value_arguments`, `lambda_literal`, `statements`.[^2]
    - Pattern: Syntactically identical to `VStack` calls with trailing closures. The extractor distinguishes them purely by callee identifier and then applies container-specific IR and layout rules in later layers.

***

## Research Gaps and Verification Notes

- The corpus examples in `test/corpus` are primarily generic Swift constructs rather than SwiftUI-specific patterns, so there is no direct test case for `struct MyView: View { var body: some View { ... } }` or `VStack { ... }` in the upstream grammar tests.[^1]
- Nevertheless, the combination of `class_declaration`, `property_declaration`, `call_expression`, `call_suffix`, `lambda_literal`, and `statements` observed in the corpus and grammar rules is sufficient to reconstruct SwiftUI patterns mechanically once SwiftUI-specific source snippets are parsed locally.[^3][^2]
- Any additional Swift 5.9+ constructs (for example `if`/`switch` expressions used directly in view positions, macros around view bodies) should be validated against the current `tree-sitter-swift` version and its open issues, as grammar coverage may lag language evolution.[^4][^5]

RESEARCH GAP: Exact parse trees for real SwiftUI examples such as `struct MyView: View { var body: some View { VStack { Text("Hi") } } }`.  
Suggested resolution: Run the installed `tree-sitter-swift` parser against small SwiftUI snippets on a local machine using `tree-sitter parse` or language bindings, then paste the resulting S-expressions into new `CORPUS:` blocks in this document.  
Reason this is uncertain: The upstream corpus does not include SwiftUI examples, and running the parser itself is out of scope for this purely research-oriented context.

---

## References

1. [alex-pinkus/tree-sitter-swift](https://github.com/alex-pinkus/tree-sitter-swift) - This contains a tree-sitter grammar for the Swift programming language. Getting started To use this ...

2. [tree_sitter_swift - Rust](https://docs.rs/tree-sitter-swift) - This crate provides Swift language support for the tree-sitter parsing library. Typically, you will ...

3. [Static Node Types - Tree-sitter](https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types)

4. [alex-pinkus/tree-sitter-swift - Add build artifacts in repository](https://github.com/alex-pinkus/tree-sitter-swift/issues/362) - Tree-sitter grammars generally includes the parser.c and the tree_sitter directory which includes th...

5. [Show HN: Tree-sitter Integration for Swift](https://news.ycombinator.com/item?id=41301777) - A member macro derives a tree-sitter grammar and embeds the generated parser in its expansion. This ...

