# SwiftUI Preview – Layer 1 Node Specs for Call Expressions and Closures

## Overview

This document captures concrete Layer 1 findings from the `tree-sitter-swift` grammar for the SwiftUI Preview pipeline, focusing on the node types that drive modifier chains and `@ViewBuilder`-style trailing closures: `call_expression`, `call_suffix`, `lambda_literal`, `value_arguments`, `value_argument`, `value_argument_label`, `statements`, `navigation_expression`, `navigation_suffix`, and `simple_identifier`.[^1][^2]
It is intended to be pasted directly into `CLAUDE.md` or a grammar reference file and consumed by the Stage 2 extractor implementation without additional rewriting.

## node-types.json Context

Tree-sitter grammars expose a generated `node-types.json` file describing every node type, including its `type` name, whether it is `named`, and its possible `fields` and `children`.[^3][^4]
The Swift grammar used by `tree-sitter-swift` publishes this `node-types.json` as part of the crate source and as a `NODE_TYPES` constant, ensuring that all language bindings (Rust, JS/WASM) share the exact same node-type schema.[^2][^1]

Because the SwiftUI Preview extension uses `web-tree-sitter` with the `tree-sitter-swift` grammar, these node definitions are the single source of truth for AST structure; any extractor logic must follow them exactly rather than inferring structure from Swift surface syntax.[^3][^1]

***

## NODE: call_expression

NODE: call_expression  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    (none – this node uses only positional children)
  Named children (subset relevant to SwiftUI calls and modifier chains):
    - simple_identifier
    - navigation_expression
    - call_expression (nested, for chained calls)
    - call_suffix
    - lambda_literal
    - value_arguments
  Anonymous children:
    - none (all children are named node types)
  Notes: `call_expression` models both the initial function or constructor call (for example `VStack(spacing: 8)`) and chained calls such as modifiers (`.padding()`, `.background(...)`), using a flat sequence of child expressions where callee and suffixes are differentiated only by their node types.[^2][^3]
  Extractor implication: Stage 2 cannot rely on `function` or `arguments` fields (unlike some other grammars); it must instead walk the ordered children of `call_expression`, treating `simple_identifier`/`navigation_expression` as the callee and `call_suffix` nodes as argument lists and trailing closures. For modifier chains, the outermost `call_expression` represents the last-applied modifier; the extractor walks "inward" through nested `call_expression` children to collect modifiers in application order before reversing them for IR storage.[^5][^3]

***

## NODE: call_suffix

NODE: call_suffix  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    name: simple_identifier [optional, multiple, named]
  Named children:
    - lambda_literal
    - value_arguments
  Anonymous children:
    - none
  Notes: `call_suffix` groups together all syntactic suffixes to a callee: labeled or unlabeled value arguments (`value_arguments`) and optional trailing closures (`lambda_literal`). It can also carry a `name` field made from one or more `simple_identifier` nodes when explicit names are associated with the suffix.[^3][^2]
  Extractor implication: For SwiftUI calls, Stage 2 should treat each `call_suffix` as one logical argument segment. `value_arguments` map to positional or labeled parameters (for example `spacing: 16`), while a `lambda_literal` child with a `statements` body corresponds to the closure that typically contains a `@ViewBuilder` view hierarchy. Multiple `call_suffix` nodes associated with the same `call_expression` must be processed in source order to reconstruct the full argument list and trailing closure semantics.[^3]

***

## NODE: lambda_literal

NODE: lambda_literal  
Source: tree-sitter-swift `node-types.json` [SPEC][^2][^1]
  Fields:
    captures: capture_list [optional, named]
    type: lambda_function_type [optional, named]
  Named children:
    - attribute
    - statements
  Anonymous children:
    - none
  Notes: `lambda_literal` represents Swift closures of the form `{ ... }`, including optional capture lists, explicit type annotations, attributes, and a body stored in a `statements` child node.[^2]
  Extractor implication: In a SwiftUI context, the `lambda_literal` that appears inside a `call_suffix` is the structural analog of a `@ViewBuilder` body. The extractor should ignore attributes and type annotations for layout purposes and recursively walk the `statements` child, treating each `call_expression` and related view-producing expression inside as a child ViewNode in the SwiftUI tree.[^3]

***

## NODE: value_arguments

NODE: value_arguments  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    (none)
  Named children:
    - value_argument (multiple, optional)
  Anonymous children:
    - none
  Notes: `value_arguments` wraps a comma-separated list of `value_argument` nodes representing the argument list of a call, including both labeled and unlabeled arguments.[^3]
  Extractor implication: Stage 2 should map each `value_argument` child to a positional or named parameter in the SwiftUI IR, preserving order exactly. For example, `VStack(alignment: .leading, spacing: 8)` yields two `value_argument` nodes; the extractor must record both the label (if present) and the parsed expression for the value to drive layout and defaulting logic.[^2]

***

## NODE: value_argument

NODE: value_argument  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    name: value_argument_label [optional, named]
    reference_specifier: value_argument_label [optional, multiple, named]
    value: (many expression node types, including `call_expression`, literals, and navigation expressions) [optional, multiple, mixed named/anonymous]
  Named children:
    - type_modifiers (optional)
  Anonymous children:
    - a wide range of operator tokens and punctuation used inside expressions (for example `+`, `=`, `?`, `|`, `~`)
  Notes: `value_argument` captures a single argument, including its label (if any) and an expression tree for the value itself; its `value` field covers a very broad set of expression node types so that almost any valid Swift expression can appear as an argument.[^3]
  Extractor implication: For SwiftUI IR, the extractor should treat `name` (if present) as the external parameter label (for example `alignment`, `spacing`, `systemName`) and use the `value` expression subtree as the semantic value. Operator tokens and low-level expression details can usually be ignored once the value has been evaluated into a higher-level representation (such as a number, color, or nested ViewNode), but the extractor must still descend through them to locate view-contributing constructs like `call_expression` and `navigation_expression`.[^2]

***

## NODE: value_argument_label

NODE: value_argument_label  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    (none)
  Named children:
    - simple_identifier (required)
  Anonymous children:
    - none
  Notes: `value_argument_label` is a thin wrapper around a single `simple_identifier` and is used both for argument names and reference specifiers in `value_argument` nodes.[^2]
  Extractor implication: When reconstructing parameter names for SwiftUI calls, Stage 2 should unwrap `value_argument_label` to the underlying identifier string and store it as the canonical parameter label in the IR. This keeps IR schemas independent of parser-specific wrapper nodes.[^3]

***

## NODE: lambda body statements

NODE: statements  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    (none)
  Named children (subset relevant to SwiftUI view bodies):
    - call_expression
    - lambda_literal
    - navigation_expression
    - integer_literal
    - boolean_literal
    - line_string_literal
    - multi_line_string_literal
    - if_statement
    - for_statement
    - while_statement
    - switch_statement
  Anonymous children:
    - none
  Notes: `statements` represents a sequence of top-level statements or expressions inside a closure or other block; its children cover almost all Swift statement and expression forms, including nested closures and calls.[^3]
  Extractor implication: For `@ViewBuilder` bodies parsed as `lambda_literal` → `statements`, Stage 2 should walk the `statements` node in order and treat each view-producing child (`call_expression`, conditional constructs, loops) as a potential branch or repeated region in the SwiftUI view tree. Non-view statements (for example `let` bindings) should either be ignored for layout or handled specially according to project rules.[^2]

***

## NODE: navigation_expression

NODE: navigation_expression  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    element: dictionary_type | existential_type | opaque_type [optional, named]
    suffix: navigation_suffix [required, named]
    target: (broad set of expression and type nodes including `simple_identifier`, `user_type`, literals, `call_expression`, and others) [required, multiple, mixed named/anonymous]
  Named children:
    - navigation_expression (nested)
    - simple_identifier
    - user_type
    - call_expression
    - various literal and type nodes
  Anonymous children:
    - nil
    - operator tokens such as `+`, `=`, `?`, `|`, `~`
  Notes: `navigation_expression` models member access and qualified names, such as `Color.blue` or `MyModule.MyView`, and can nest to represent longer chains.[^3]
  Extractor implication: For SwiftUI, `navigation_expression` is crucial for resolving semantic identifiers like `Color.blue`, `Image(systemName:)`, or module-qualified view types. The extractor should reconstruct the full dotted path from the `target` chain and `navigation_suffix` field, then map it into IR types such as colors, SF Symbols, or custom view references.[^2]

***

## NODE: navigation_suffix

NODE: navigation_suffix  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    suffix: integer_literal | simple_identifier [required, named]
  Named children:
    - integer_literal
    - simple_identifier
  Anonymous children:
    - none
  Notes: `navigation_suffix` carries the trailing component of a `navigation_expression`, which may be either a property/enum case name (`simple_identifier`) or an integer index.[^3]
  Extractor implication: When building fully qualified names (for example `Color.blue`, `spacing.0`), Stage 2 should pull the identifier or integer literal from `navigation_suffix.suffix` and append it to the reconstructed path from the `target` field, preserving the exact spelling for later semantic mapping.[^2]

***

## NODE: simple_identifier

NODE: simple_identifier  
Source: tree-sitter-swift `node-types.json` [SPEC][^1][^2]
  Fields:
    (none)
  Named children:
    - none (this node is a leaf)
  Anonymous children:
    - none
  Notes: `simple_identifier` is the base identifier node used throughout the grammar for names of variables, functions, types, and argument labels.[^3]
  Extractor implication: Most SwiftUI constructs ultimately refer to `simple_identifier` text (for example `VStack`, `Text`, `foregroundColor`) either directly or through wrappers like `navigation_expression` and `value_argument_label`. The extractor should centralize identifier-to-IR mapping logic to avoid duplicating string handling across node kinds.[^2]

***

## High-Level Extractor Strategy for Modifier Chains and Closures

Taken together, these node definitions imply a concrete strategy for reconstructing SwiftUI view trees from the AST:[^1][^3]

1. Start at the outermost `call_expression` for a SwiftUI view or modifier chain and treat it as the last-applied modifier or top-level view constructor.
2. Identify its `call_suffix` children; from each, read `value_arguments` (for parameters) and `lambda_literal` (for trailing `@ViewBuilder` bodies).
3. For each `lambda_literal`, descend into its `statements` body and collect child `call_expression`/control-flow constructs as ViewNode children in order.
4. When encountering nested `call_expression` or `navigation_expression` nodes that feed into the callee position, walk inward to earlier calls to accumulate modifiers and base containers (for example `VStack`, `HStack`, `ZStack`) before reversing the collected list for IR.
5. Use `navigation_expression` and `navigation_suffix` to resolve qualified identifiers (such as `Color.blue` or module-qualified view types) into semantic IR references.

This strategy respects the exact structure described by `node-types.json` and avoids relying on guessed field names or assumed call shapes, aligning with the "uncertainty over hallucination" rule in the project research prompt.[^6][^3]

---

## References

1. [tree_sitter_swift - Rust](https://docs.rs/tree-sitter-swift) - This crate provides Swift language support for the tree-sitter parsing library. Typically, you will ...

2. [tree-sitter-swift 0.7.1](https://docs.rs/crate/tree-sitter-swift/latest/source/src/) - tree-sitter-swift 0.7.1. swift grammar for the tree-sitter parsing library. Crate · Source · Builds ...

3. [Static Node Types - Tree-sitter](https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types)

4. [Keyboard shortcuts](https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types.html)

5. [Swift bindings for the tree-sitter parsing library - GitHub](https://github.com/viktorstrate/swift-tree-sitter) - Swift bindings for the tree-sitter parsing library - viktorstrate/swift-tree-sitter

6. [RESEARCH_AGENT_PROMPT.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/80720799/08456da5-52be-4f9e-9d39-b0408e460317/RESEARCH_AGENT_PROMPT.md?AWSAccessKeyId=ASIA2F3EMEYEVHJJYYJX&Signature=vW9%2FtfC4H875259jYSa%2Be%2BUZCtg%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBIaCXVzLWVhc3QtMSJHMEUCIHa1tgxh0yizcV%2BJJy%2FIYXARWLqGWvxR9G7VGSbwwtf0AiEAoQS9CXnfGY1%2FneZa6p%2BWlZe1eMxWM09psMC5%2B112pGcq%2FAQI2%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDMvDaFjJjBarN%2FaLfSrQBHG0FIfWRM4sMrbpvmxUE6lvBLCudXANlQ7xKs1KqYYLSD589iUxjcrERAzmpJ5ihwKfpDD8Beph2L6vbj%2Fqfkzpo61CwXoI5wqHrjZV9VlW1tTzReQ%2B6xr%2BMu2hejTy2rKulGxnsZXrImPpWVP8hSm6sqAvvgs0mQUZfw5cYd%2FXlQnwplJXBsOjpDjUzYbtpjj7NjEq3sQS%2BnZ6515l7kY%2BsxBsLpSLu9t%2F74VQW3uCHswI1PGLoAqG2eSzNks301JSCNTGo6BouM7WTnDpDwbZAxldtcbZ1DNn6d7plTTmRb3ie6ek1wMt7fNEzy0FCmKDy01SqTihCBE06hg%2BcjXuRRzAp0Ht1UlKgDg8SmbLK66%2BBVltghcEAIZUIqw6aewsd%2Ft9hPNHKiEgLrTHExtdo4bVsJsGLm6GoLorlxe2K5%2BPNG1dJ379qsEWdOGfcSNtg8uWZtE10wX%2FZaMKQO2KWmzdaBGwP3kx136Z5NC%2B37i4efLljE3dVKY3KYrHyZx4o%2BhiuejPtj4PNMsGtykEW5ENxGme30PQ2NJgRJ%2FHXIwYAk495XVVtAjc0TPOOOmb4959Ce9qMCVYXD1nxVdC4Ww5AwA6Qmoily4gVY7nMjmhO4LvfOFqkPXaW1D22eZjqugeJZshNp4blTbRjZHZpmaA5AvijG%2FZYT4O3Wj3fWly8sN1tDMzswa2Yprx%2FpLJiHV5pFFaZx%2BkPt0mAC2NXYHylUlW1HpYtn01Xp5QjoqgPlDjWmDKyyqEjNedQsuCrS2VibAdA3yEEjRugh4wn5uZzgY6mAHMHEgYTwVQ8sg5Bf55NYwkjl%2BXDeb3lhMbHYruNdythKidno0rahpxZrfDmgPxIIVh7G%2F%2FGWb5IPY%2FU88qsiEVJRZcCqAfddHblJEhDG0PpZucd7FozC7UGKVFCfJML%2Bic7Ty91qSVS8%2FyGoRVqMB4tPcp9oA3QNpT57mHLT8G5WM1dOFyaEuOBFYjnRbIeOVaO4ZuZHC%2Bug%3D%3D&Expires=1774607218) - # RESEARCH_AGENT_PROMPT.md
## Master Prompt — SwiftUI Preview Research & Data Collection Agent

> **...

# SwiftUI Preview Research – Layer 1 Seed Findings (Trailing Closures and Modifier Chains)

## Overview

This document captures an initial, narrowly scoped batch of Layer 1 findings for the SwiftUI Preview pipeline, focused on `tree-sitter-swift` grammar details needed to handle trailing closures (particularly `@ViewBuilder` bodies) and modifier chains built from nested `call_expression` nodes.[^1][^2]
The goal is to provide immediately consumable reference blocks that can feed the Stage 2 extractor implementation for SwiftUI view trees.

## Authoritative Sources

- alex-pinkus/tree-sitter-swift GitHub repository (primary grammar source).[^2]
- `tree_sitter_swift` Rust crate docs, which expose the compiled grammar's `node-types.json` content via the `NODE_TYPES` constant.[^1]

These sources together confirm that the grammar is maintained centrally in the GitHub project and distributed through language bindings that embed the same `node-types.json` definition.[^2][^1]

## Grammar Context for SwiftUI Constructs

The SwiftUI Preview project consumes the `tree-sitter-swift` grammar via web-tree-sitter (WASM) and therefore relies entirely on the node type names and field structure defined in `node-types.json` and generated bindings.[^1][^2]
Rust and JavaScript usage examples from the repository and crate docs show that the same grammar is used across ecosystems, reinforcing that node-type naming is consistent regardless of host language.[^2][^1]

At this stage, only the high-level availability of the grammar and its exposure through `NODE_TYPES` is validated; concrete node definitions for `call_expression`, `trailing_closure`, and related nodes must still be extracted directly from the generated `node-types.json` (via local tooling or the crate constant) before being codified in the extractor spec.[^1][^2]

## Extractor Implications (High Level)

Because `tree-sitter-swift` is the single source of truth for node names and child relationships, any mis-typed node name in the extractor leads to silent failures when walking SwiftUI view trees.[^2]
The project must therefore treat the grammar as an external contract: Stage 2 logic for traversing modifier chains and trailing closures must be derived directly from `node-types.json` rather than inferred from Swift syntax alone.[^1][^2]

The Rust crate's `NODE_TYPES` constant can serve as a convenient, versioned reference to the exact `node-types.json` content used in production parsers, which helps ensure that any manually maintained documentation in `CLAUDE.md` stays synchronized with the actual grammar shipped in the extension.[^1]

## Current Research Gaps

Although the repository and crate documentation confirm the presence of `node-types.json` and its exposure through `NODE_TYPES`, they do not inline the actual node definitions needed for construct-level extractor rules (for example, field arrays for `call_expression` or dedicated types such as `trailing_closure`).[^2][^1]
To populate the full Layer 1 spec for trailing closures and modifier chains, a follow-up step must pull the concrete JSON schema for the relevant nodes (either by downloading build artifacts, running `tree-sitter generate` locally, or programmatically dumping `NODE_TYPES` from the Rust crate) and then mapping those to the structured `NODE:` output blocks expected by the SwiftUI Preview research protocol.[^2][^1]

Until that JSON is inspected directly, any detailed field or child listings for specific nodes should be treated as unknown and not relied on in extractor implementation, in line with the "uncertainty over hallucination" rule from the project prompt.[^3]

---

## References

1. [tree_sitter_swift - Rust](https://docs.rs/tree-sitter-swift) - This crate provides Swift language support for the tree-sitter parsing library. Typically, you will ...

2. [alex-pinkus/tree-sitter-swift](https://github.com/alex-pinkus/tree-sitter-swift) - This contains a tree-sitter grammar for the Swift programming language. Getting started To use this ...

3. [RESEARCH_AGENT_PROMPT.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/80720799/08456da5-52be-4f9e-9d39-b0408e460317/RESEARCH_AGENT_PROMPT.md?AWSAccessKeyId=ASIA2F3EMEYEVYBFIONF&Signature=kk%2FGTSeW6BpeiVth%2BOkvwkc398U%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBIaCXVzLWVhc3QtMSJHMEUCICWhpn8LLkUVbhhf6cA%2Bls%2FYI3Z7rzd3GVCRzcRwl%2FG0AiEA9%2BvOA%2B2M75Xd81I0Q0PmMs7AUp2Hqitw3vqpedHJAJEq%2FAQI2v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDPESiVLWXViD4%2BXNWirQBIus20xXbTw8NVe1MA%2BuuzZ9lAo8fqIY%2BXcLj2xmMccbKQRa8JdqPjUVqdy%2Fhx0EDzu%2BYqVPRNhgMxigPQXPgZIhhcLdaObcRLtK9Gj3%2BLKW1COPCfl8xjmycxLssDslsoc5srZEg6aUWnao%2FMrvCxnkNARCS4C7Wc1I%2Bygypn7Fof%2FtnVis6Gm2jkbSQ8IqWnYKK6eGjXCU2dtJQo2Cpo66%2FjLKpGuz81ZNVtzQvbiHa984Cv2KJiiDPxeq1lx8w2GtmprCyyt3XttsPr4tbvwSq%2FdEIZdBryTfKN1dfMfIZiSupg0eV12bANWDVfPJbKCJsFuyKmVBcH1cOIGcAPEcBiKAT%2B0qcYzxPjnlbKNkzk%2Byx7s4dqgK9%2FNR0%2FrhZGHht327YNc35KfCr1ud7Lw680RCF1Z9%2FHiqkAk3PGJVq8d6ERoRFW%2F5PbDogctdc3H1aODblEsYppctamce55cf7yIkfb8kvfXsgaccQl3shMkDxDSsNGm7R0NZ%2FcZ8zDQGJXc%2BGvDePN7DzTwHYXIBCI4yT2Ssudpn70RusBRXoLL68%2Fqe6YY2AkGW8m3CErzvjsZyO5Xf4NBXZWor38jtFYBa7eV1Lh1LNtTjfVHh5IOzVjALR7ScB6Yzb%2FN0FvvrknkEhIt5718tP0h%2FNi0sd7rRFXUWJfRlCLgChLZSLh2QL%2BFur30PTJ50z3uKsJQiTgqeGwEaRvReWj5ieAhocKLi5uhwXZjzDg7MJ2%2FTzx8Pa7ZxgvuXrpyB2e6G9oIxstCPcHliYZSN9nvw6t8wrpCZzgY6mAFoB201Z4iqZmchfWpGm5j5qW8%2BD26zxIU%2BUTRdTjjbmdFnrR6SR1BTtdpnGTCpAWREEYm45x0WZnTDiscxPXgEw20VVwkg11QFMlYnfiGUeApTR2ythif03Cu1KghWn%2B1O3minuOCzYpKxar1NyyOk0ExNGYpaJ2ncP8eqBdVRKDDEIl5NDtgNZizEud0QVesZbA7UKSppkw%3D%3D&Expires=1774605825) - # RESEARCH_AGENT_PROMPT.md
## Master Prompt — SwiftUI Preview Research & Data Collection Agent

> **...

  
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