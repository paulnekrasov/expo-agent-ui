  
`CORPUS: Snippet 1 — VStack with modifier chain`  

`Swift input:`  
```` ```swift ````  
`VStack(spacing: 16) {`  
    `Text("Hello, World!")`  
        `.font(.title)`  
        `.foregroundColor(.blue)`  
    `Text("Subtitle")`  
        `.font(.body)`  
`}`  
`.padding()`  
`.background(Color.white)`  
```` ``` ````

`Parse tree (EXACT tree-sitter output — do not modify or reformat):`  
```` ```text ````  
`(source_file  -`   
  `(call_expression  -`   
    `(navigation_expression  -`   
      `target: (call_expression  -`   
        `(navigation_expression  -`   
          `target: (call_expression  -`   
            `(simple_identifier  - )`  
            `(call_suffix  -`   
              `(value_arguments  -`   
                `(value_argument  -`   
                  `name: (value_argument_label  -`   
                    `(simple_identifier  - ))`  
                  `value: (integer_literal  - )))`  
              `(lambda_literal  -`   
                `(statements  -`   
                  `(call_expression  -`   
                    `(navigation_expression  -`   
                      `target: (call_expression  -`   
                        `(navigation_expression  -`   
                          `target: (call_expression  -`   
                            `(simple_identifier  - )`  
                            `(call_suffix  -`   
                              `(value_arguments  -`   
                                `(value_argument  -`   
                                  `value: (line_string_literal  -`   
                                    `text: (line_str_text  - ))))))`  
                          `suffix: (navigation_suffix  -`   
                            `suffix: (simple_identifier  - )))`  
                        `(call_suffix  -`   
                          `(value_arguments  -`   
                            `(value_argument  -`   
                              `value: (prefix_expression  -`   
                                `target: (simple_identifier  - ))))))`  
                      `suffix: (navigation_suffix  -`   
                        `suffix: (simple_identifier  - )))`  
                    `(call_suffix  -`   
                      `(value_arguments  -`   
                        `(value_argument  -`   
                          `value: (prefix_expression  -`   
                            `target: (simple_identifier  - ))))))`  
                  `(call_expression  -`   
                    `(navigation_expression  -`   
                      `target: (call_expression  -`   
                        `(simple_identifier  - )`  
                        `(call_suffix  -`   
                          `(value_arguments  -`   
                            `(value_argument  -`   
                              `value: (line_string_literal  -`   
                                `text: (line_str_text  - ))))))`  
                      `suffix: (navigation_suffix  -`   
                        `suffix: (simple_identifier  - )))`  
                    `(call_suffix  -`   
                      `(value_arguments  -`   
                        `(value_argument  -`   
                          `value: (prefix_expression  -`   
                            `target: (simple_identifier  - ))))))))))`  
          `suffix: (navigation_suffix  -`   
            `suffix: (simple_identifier  - )))`  
        `(call_suffix  -`   
          `(value_arguments  - )))`  
      `suffix: (navigation_suffix  -`   
        `suffix: (simple_identifier  - )))`  
    `(call_suffix  -`   
      `(value_arguments  -`   
        `(value_argument  -`   
          `value: (navigation_expression  -`   
            `target: (simple_identifier  - )`  
            `suffix: (navigation_suffix  -`   
              `suffix: (simple_identifier  - ))))))))`  
```` ``` ````  
`[bash:2]`

`Extractor implications:`  
``- Top-level node type: `source_file`.[bash:2]``  
``- How to locate the view name: follow `source_file → call_expression → navigation_expression.target → call_expression.navigation_expression.target → call_expression.simple_identifier` (`VStack`).[bash:2]``  
``- How to locate the argument list: from that innermost `call_expression`, take its `call_suffix` child and then `value_arguments` (`spacing: 16`).[bash:2]``  
``- How to locate trailing closure / children: the `lambda_literal` sibling of `value_arguments` inside the same `call_suffix` holds `statements` containing child `call_expression` nodes for the inner `Text` views.[bash:2]``  
``- How to locate modifiers: outer `navigation_expression` and nested `navigation_suffix`/`call_suffix` pairs wrap the base call, encoding `.padding()` and `.background(Color.white)` as successive navigation layers.[bash:2]``  
``- Any unexpected node types or structure: uses generic nodes like `navigation_expression`, `lambda_literal`, and `line_string_literal` rather than SwiftUI-specific constructs, and models `.font`/`.foregroundColor` calls as further `navigation_suffix` plus `call_suffix` chains.[bash:2]``

`---`

`CORPUS: Snippet 2 — NavigationStack with List and ForEach`  

`Swift input:`  
```` ```swift ````  
`NavigationStack {`  
    `List {`  
        `ForEach(items, id: \.self) { item in`  
            `Text(item)`  
        `}`  
    `}`  
    `.navigationTitle("Items")`  
`}`  
```` ``` ````

`Parse tree (EXACT tree-sitter output — do not modify or reformat):`  
```` ```text ````  
`(source_file  -`   
  `(call_expression  -`   
    `(simple_identifier  - )`  
    `(call_suffix  -`   
      `(lambda_literal  -`   
        `(statements  -`   
          `(call_expression  -`   
            `(navigation_expression  -`   
              `target: (call_expression  -`   
                `(simple_identifier  - )`  
                `(call_suffix  -`   
                  `(lambda_literal  -`   
                    `(statements  -`   
                      `(call_expression  -`   
                        `(simple_identifier  - )`  
                        `(call_suffix  -`   
                          `(value_arguments  -`   
                            `(value_argument  -`   
                              `value: (simple_identifier  - ))`  
                            `(value_argument  -`   
                              `name: (value_argument_label  -`   
                                `(simple_identifier  - ))`  
                              `value: (navigation_expression  -`   
                                `target: (key_path_expression  - )`  
                                `suffix: (navigation_suffix  -`   
                                  `suffix: (simple_identifier  - )))))`  
                          `(lambda_literal  -`   
                            `type: (lambda_function_type  -`   
                              `(lambda_function_type_parameters  -`   
                                `(lambda_parameter  -`   
                                  `name: (simple_identifier  - ))))`  
                            `(statements  -`   
                              `(call_expression  -`   
                                `(simple_identifier  - )`  
                                `(call_suffix  -`   
                                  `(value_arguments  -`   
                                    `(value_argument  -`   
                                      `value: (simple_identifier  - )))))))))))))`  
              `suffix: (navigation_suffix  -`   
                `suffix: (simple_identifier  - )))`  
            `(call_suffix  -`   
              `(value_arguments  -`   
                `(value_argument  -`   
                  `value: (line_string_literal  -`   
                    `text: (line_str_text  - )))))))))))`  
```` ``` ````  
`[bash:3]`

`Extractor implications:`  
``- Top-level node type: `source_file`.[bash:3]``  
``- How to locate the view name: take the `simple_identifier` child of the outermost `call_expression` (`NavigationStack`).[bash:3]``  
``- How to locate the argument list: for `ForEach`, descend via `call_expression (ForEach) → call_suffix → value_arguments` to get `items` and `id: \.self`, and for `.navigationTitle` use its `call_suffix.value_arguments` containing the string literal.[bash:3]``  
``- How to locate trailing closure / children: `NavigationStack`’s body is the `lambda_literal` in its `call_suffix`, `List`’s body is the nested `lambda_literal` under the `List` call, and `ForEach`’s row builder is the innermost `lambda_literal` with `lambda_function_type` and `statements` containing `Text(item)`. [bash:3]``  
``- How to locate modifiers: the `.navigationTitle("Items")` modifier is represented as a `navigation_expression` with a `navigation_suffix` named `navigationTitle` wrapped around the `List` call, plus a `call_suffix` that holds its arguments.[bash:3]``  
``- Any unexpected node types or structure: `ForEach`’s closure parameter is modeled via `lambda_function_type`, `lambda_function_type_parameters`, and `lambda_parameter` instead of a Swift-style parameter clause node, and the key path `\.self` appears as a `key_path_expression` within a `navigation_expression`.[bash:3]``

`---`

`CORPUS: Snippet 3 — if/else conditional content inside @ViewBuilder`  

`Swift input:`  
```` ```swift ````  
`VStack {`  
    `if isLoggedIn {`  
        `Text("Welcome back")`  
    `} else {`  
        `Button("Log in") {`  
            `login()`  
        `}`  
    `}`  
`}`  
```` ``` ````

`Parse tree (EXACT tree-sitter output — do not modify or reformat):`  
```` ```text ````  
`(source_file  -`   
  `(call_expression  -`   
    `(simple_identifier  - )`  
    `(call_suffix  -`   
      `(lambda_literal  -`   
        `(statements  -`   
          `(if_statement  -`   
            `condition: (simple_identifier  - )`  
            `(statements  -`   
              `(call_expression  -`   
                `(simple_identifier  - )`  
                `(call_suffix  -`   
                  `(value_arguments  -`   
                    `(value_argument  -`   
                      `value: (line_string_literal  -`   
                        `text: (line_str_text  - )))))))`  
            `(else  - )`  
            `(statements  -`   
              `(call_expression  -`   
                `(simple_identifier  - )`  
                `(call_suffix  -`   
                  `(value_arguments  -`   
                    `(value_argument  -`   
                      `value: (line_string_literal  -`   
                        `text: (line_str_text  - ))))`  
                  `(lambda_literal  -`   
                    `(statements  -`   
                      `(call_expression  -`   
                        `(simple_identifier  - )`  
                        `(call_suffix  -`   
                          `(value_arguments  - ))))))))))))))`  
```` ``` ````  
`[bash:4]`

`Extractor implications:`  
``- Top-level node type: `source_file`.[bash:4]``  
``- How to locate the view name: use the `simple_identifier` child of the outer `call_expression` (`VStack`).[bash:4]``  
``- How to locate the argument list: `Text("Welcome back")` and `Button("Log in")` each have a `call_suffix.value_arguments` list under their respective `call_expression` nodes.[bash:4]``  
``- How to locate trailing closure / children: `VStack`’s body is the `lambda_literal` in its `call_suffix`, and the `if_statement`’s then/else blocks are nested `statements` nodes containing the `Text` and `Button` `call_expression`s; the `Button` action is a nested `lambda_literal` with `statements` including `login()`. [bash:4]``  
``- How to locate modifiers: there are no SwiftUI-style chained modifiers here; structure is just the `call_expression`/`call_suffix` hierarchy plus the `if_statement` and its branches.[bash:4]``  
``- Any unexpected node types or structure: the `else` keyword is a standalone `else` node with its own span, and the conditional content is modeled purely via a generic `if_statement` node with `statements` children, with no special ViewBuilder node type.[bash:4]``

`---`

`CORPUS: Snippet 4 — Struct declaration with var body: some View`  

`Swift input:`  
```` ```swift ````  
`struct ContentView: View {`  
    `@State private var count: Int = 0`  
      
    `var body: some View {`  
        `VStack {`  
            `Text("Count: \(count)")`  
            `Button("Increment") {`  
                `count += 1`  
            `}`  
        `}`  
    `}`  
`}`  
```` ``` ````

`Parse tree (EXACT tree-sitter output — do not modify or reformat):`  
```` ```text ````  
`(source_file [0, 0] - [12, 0]`  
  `(class_declaration [0, 0] - [11, 1]`  
    `name: (type_identifier [0, 7] - [0, 18])`  
    `(inheritance_specifier [0, 20] - [0, 24]`  
      `inherits_from: (user_type [0, 20] - [0, 24]`  
        `(type_identifier [0, 20] - [0, 24])))`  
    `body: (class_body [0, 25] - [11, 1]`  
      `(property_declaration [1, 4] - [1, 37]`  
        `(modifiers [1, 4] - [1, 18]`  
          `(attribute [1, 4] - [1, 10]`  
            `(user_type [1, 5] - [1, 10]`  
              `(type_identifier [1, 5] - [1, 10])))`  
          `(visibility_modifier [1, 11] - [1, 18]))`  
        `(value_binding_pattern [1, 19] - [1, 22])`  
        `name: (pattern [1, 23] - [1, 28]`  
          `bound_identifier: (simple_identifier [1, 23] - [1, 28]))`  
        `(type_annotation [1, 28] - [1, 33]`  
          `name: (user_type [1, 30] - [1, 33]`  
            `(type_identifier [1, 30] - [1, 33])))`  
        `value: (integer_literal [1, 36] - [1, 37]))`  
      `(property_declaration [3, 4] - [10, 5]`  
        `(value_binding_pattern [3, 4] - [3, 7])`  
        `name: (pattern [3, 8] - [3, 12]`  
          `bound_identifier: (simple_identifier [3, 8] - [3, 12]))`  
        `(type_annotation [3, 12] - [3, 23]`  
          `name: (opaque_type [3, 14] - [3, 23]`  
            `(user_type [3, 19] - [3, 23]`  
              `(type_identifier [3, 19] - [3, 23]))))`  
        `computed_value: (computed_property [3, 24] - [10, 5]`  
          `(statements [4, 8] - [10, 4]`  
            `(call_expression [4, 8] - [9, 9]`  
              `(simple_identifier [4, 8] - [4, 14])`  
              `(call_suffix [4, 15] - [9, 9]`  
                `(lambda_literal [4, 15] - [9, 9]`  
                  `(statements [5, 12] - [9, 8]`  
                    `(call_expression [5, 12] - [5, 36]`  
                      `(simple_identifier [5, 12] - [5, 16])`  
                      `(call_suffix [5, 16] - [5, 36]`  
                        `(value_arguments [5, 16] - [5, 36]`  
                          `(value_argument [5, 17] - [5, 35]`  
                            `value: (line_string_literal [5, 17] - [5, 35]`  
                              `text: (line_str_text [5, 18] - [5, 25])`  
                              `text: (str_escaped_char [5, 25] - [5, 27])`  
                              `text: (line_str_text [5, 27] - [5, 34]))))))`  
                    `(call_expression [6, 12] - [8, 13]`  
                      `(simple_identifier [6, 12] - [6, 18])`  
                      `(call_suffix [6, 18] - [8, 13]`  
                        `(value_arguments [6, 18] - [6, 31]`  
                          `(value_argument [6, 19] - [6, 30]`  
                            `value: (line_string_literal [6, 19] - [6, 30]`  
                              `text: (line_str_text [6, 20] - [6, 29]))))`  
                        `(lambda_literal [6, 32] - [8, 13]`  
                          `(statements [7, 16] - [8, 12]`  
                            `(assignment [7, 16] - [7, 26]`  
                              `target: (directly_assignable_expression [7, 16] - [7, 21]`  
                                `(simple_identifier [7, 16] - [7, 21]))`  
                              `result: (integer_literal [7, 25] - [7, 26]))))))))))))))))`  
```` ``` ````  
`[bash:5]`

`Extractor implications:`  
``- Top-level node type: `source_file`, whose first child is a `class_declaration` for `ContentView` (the `struct` is normalized to a class-like node).[bash:5]``  
``- How to locate the view name: within `class_declaration`, use the `name` field’s `type_identifier` (`ContentView`), and its conformance is in `inheritance_specifier.user_type.type_identifier` (`View`).[bash:5]``  
``- How to locate the argument list: inside the `body`’s second `property_declaration` (the `body` property), go into `computed_value.computed_property.statements`, where `Text("Count: \(count)")` and `Button("Increment")` each have `call_suffix.value_arguments` lists under their `call_expression`s.[bash:5]``  
``- How to locate trailing closure / children: the `body`’s view tree starts at the `call_expression` with `simple_identifier` `VStack`, whose `call_suffix.lambda_literal.statements` contain the inner `Text` and `Button` expressions; the `Button` action is another `lambda_literal` containing an `assignment` statement (`count += 1`).[bash:5]``  
``- How to locate modifiers: there are no chained SwiftUI modifiers here; inside the computed property, everything is modeled as straightforward `call_expression` plus `call_suffix`/`lambda_literal` nodes without `navigation_expression` wrappers.[bash:5]``  
``- Any unexpected node types or structure: attributes like `@State` appear as an `attribute` inside `modifiers`, the `body`’s `some View` type is represented as an `opaque_type` wrapping a `user_type`, and `"Count: \(count)"` is split into `line_str_text` and `str_escaped_char` segments inside a single `line_string_literal` rather than a dedicated interpolation node.[bash:5]``

`---`

`CORPUS: Snippet 5 — Modifier chain with member access expressions`  

`Swift input:`  
```` ```swift ````  
`Text("Hello")`  
    `.frame(maxWidth: .infinity, alignment: .leading)`  
    `.padding(.horizontal, 16)`  
    `.background(Color.blue.opacity(0.1))`  
```` ``` ````

`Parse tree (EXACT tree-sitter output — do not modify or reformat):`  
```` ```text ````  
`(source_file [0, 0] - [4, 0]`  
  `(call_expression [0, 0] - [3, 40]`  
    `(navigation_expression [0, 0] - [3, 15]`  
      `target: (call_expression [0, 0] - [2, 29]`  
        `(navigation_expression [0, 0] - [2, 12]`  
          `target: (call_expression [0, 0] - [1, 52]`  
            `(navigation_expression [0, 0] - [1, 10]`  
              `target: (call_expression [0, 0] - [0, 13]`  
                `(simple_identifier [0, 0] - [0, 4])`  
                `(call_suffix [0, 4] - [0, 13]`  
                  `(value_arguments [0, 4] - [0, 13]`  
                    `(value_argument [0, 5] - [0, 12]`  
                      `value: (line_string_literal [0, 5] - [0, 12]`  
                        `text: (line_str_text [0, 6] - [0, 11]))))))`  
              `suffix: (navigation_suffix [1, 4] - [1, 10]`  
                `suffix: (simple_identifier [1, 5] - [1, 10])))`  
            `(call_suffix [1, 10] - [1, 52]`  
              `(value_arguments [1, 10] - [1, 52]`  
                `(value_argument [1, 11] - [1, 30]`  
                  `name: (value_argument_label [1, 11] - [1, 19]`  
                    `(simple_identifier [1, 11] - [1, 19]))`  
                  `value: (prefix_expression [1, 21] - [1, 30]`  
                    `target: (simple_identifier [1, 22] - [1, 30])))`  
                `(value_argument [1, 32] - [1, 51]`  
                  `name: (value_argument_label [1, 32] - [1, 41]`  
                    `(simple_identifier [1, 32] - [1, 41]))`  
                  `value: (prefix_expression [1, 43] - [1, 51]`  
                    `target: (simple_identifier [1, 44] - [1, 51]))))))`  
          `suffix: (navigation_suffix [2, 4] - [2, 12]`  
            `suffix: (simple_identifier [2, 5] - [2, 12])))`  
        `(call_suffix [2, 12] - [2, 29]`  
          `(value_arguments [2, 12] - [2, 29]`  
            `(value_argument [2, 13] - [2, 24]`  
              `value: (prefix_expression [2, 13] - [2, 24]`  
                `target: (simple_identifier [2, 14] - [2, 24])))`  
            `(value_argument [2, 26] - [2, 28]`  
              `value: (integer_literal [2, 26] - [2, 28])))))`  
      `suffix: (navigation_suffix [3, 4] - [3, 15]`  
        `suffix: (simple_identifier [3, 5] - [3, 15])))`  
    `(call_suffix [3, 15] - [3, 40]`  
      `(value_arguments [3, 15] - [3, 40]`  
        `(value_argument [3, 16] - [3, 39]`  
          `value: (call_expression [3, 16] - [3, 39]`  
            `(navigation_expression [3, 16] - [3, 34]`  
              `target: (navigation_expression [3, 16] - [3, 26]`  
                `target: (simple_identifier [3, 16] - [3, 21])`  
                `suffix: (navigation_suffix [3, 21] - [3, 26]`  
                  `suffix: (simple_identifier [3, 22] - [3, 26])))`  
              `suffix: (navigation_suffix [3, 26] - [3, 34]`  
                `suffix: (simple_identifier [3, 27] - [3, 34])))`  
            `(call_suffix [3, 34] - [3, 39]`  
              `(value_arguments [3, 34] - [3, 39]`  
                `(value_argument [3, 35] - [3, 38]`  
                  `value: (real_literal [3, 35] - [3, 38]))))))))))`  
```` ``` ````  
`[bash:6]`

`Extractor implications:`  
``- Top-level node type: `source_file`, containing a single chained `call_expression`.[bash:6]``  
``- How to locate the view name: the base view `Text` is the `simple_identifier` in the innermost `call_expression` that is the `target` of the deepest `navigation_expression` chain.[bash:6]``  
``- How to locate the argument list: for `Text("Hello")`, use that innermost `call_expression.call_suffix.value_arguments`; for `.frame` and `.padding`, use the respective outer `call_expression.call_suffix.value_arguments` nodes holding label/value pairs (`maxWidth`, `alignment`, `.horizontal`, `16`).[bash:6]``  
``- How to locate trailing closure / children: this snippet has no `lambda_literal` children; all configuration is via positional and labeled `value_arguments` only.[bash:6]``  
``- How to locate modifiers: each SwiftUI modifier (`frame`, `padding`, `background`) appears as an additional `navigation_suffix` (naming the modifier) layered around the previous call, with its own `call_suffix.value_arguments` list; `.background(Color.blue.opacity(0.1))` nests another `call_expression` for `opacity` inside the outer modifier’s argument.[bash:6]``  
``- Any unexpected node types or structure: member-like values such as `.infinity` and `.leading` are parsed as `prefix_expression` nodes wrapping `simple_identifier`s, and the numeric literal `0.1` is a `real_literal` nested inside the innermost `call_expression` for `opacity`.[bash:6]``