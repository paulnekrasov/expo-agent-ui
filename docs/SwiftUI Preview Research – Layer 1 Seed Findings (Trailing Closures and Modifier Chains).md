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

