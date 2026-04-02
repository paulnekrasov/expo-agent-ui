---
name: swiftui-parser-debugging
description: >
  Debugging tools for the SwiftUI Preview VS Code extension. Use when an
  extractor returns UnknownNode, a layout size is wrong, a TypeScript type
  error appears, or you need to inspect what the tree-sitter AST looks like
  for a specific Swift construct. Load the relevant reference file for the
  specific task rather than reading all files.
---

# SwiftUI Parser Debugging Skill

## When to Load Which File

| Task | File |
|---|---|
| Need to see the tree-sitter AST for a Swift snippet | `ast-inspect.md` |
| Extractor returns wrong result or UnknownNode | `ast-inspect.md` + `stage-isolation.md` |
| Don't know which pipeline stage is broken | `stage-isolation.md` |
| ViewNode IR tree looks wrong, need to inspect it | `ir-inspect.md` |
| TypeScript strict-mode error, don't know how to fix it | `typecheck.md` |
| General bug — root cause unknown | `system-debugging/pipeline-stage-debugging.md` first |

## Rule

Always map the bug to a pipeline stage before opening code.
The stage is found in `stage-isolation.md`.
Once isolated, the fix is almost always in one file.
