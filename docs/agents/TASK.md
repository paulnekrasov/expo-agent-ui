# TASK SPECIFICATION
Created by: workflow bootstrap
Date: 2026-04-16
Roadmap Phase: Phase 1 - Parser Foundation
Pipeline Stage: Stage 2 - Extractor
Research Layer: Layer 1 and Layer 2

## Objective

Implement `NavigationStack` and `NavigationLink` extraction so navigation containers and link rows stop degrading to `UnknownNode` in Phase 1 parser output.

## Acceptance criteria

- [x] Extract `NavigationStack { ... }` as `NavigationStackNode`
- [x] Extract `NavigationLink(destination:label:)` as `NavigationLinkNode`
- [x] Extract the multiple-trailing-closure `NavigationLink { destination } label: { label }` form
- [x] Preserve Stage 2 fallback behavior: unknown children still become `UnknownNode`, never dropped
- [x] Add tests using Swift snippet fixtures rather than mocked AST nodes
- [x] Keep the task inside Stage 2 only; no layout, device, or navigation-state work

## Files to touch

- `src/parser/extractors/views/index.ts`
- `src/parser/extractors/views/navigation.ts`
- `src/ir/builders.ts`
- `src/ir/types.ts`
- `tests/parser/extractors/navigation.test.ts`

## Reference docs to read before starting

- `docs/reference/layer-1-grammar/node-types.md`
- `docs/reference/layer-1-grammar/corpus-examples.md`
- `docs/reference/swift-syntax/view-initializer-signatures.md`
- `docs/reference/planning/pipeline-overview.md`

## Known traps

- Multiple trailing closures must treat `label:` as visual content and destination closure as the pushed content
- Keep stage boundaries clean: extraction only, no navigation animation or layout logic
- Built-in SwiftUI view names already route through fallback logic in `src/parser/extractors/views/index.ts`; extend that path rather than bypassing it

## Out of scope

- `List`, `Section`, `ForEach`, `Form`, `Toggle`
- Resolver or property-wrapper stubbing
- Layout engine, renderer, device chrome, navigation state machine
