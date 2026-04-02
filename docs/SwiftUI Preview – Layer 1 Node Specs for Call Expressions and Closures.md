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

