# Roadmap Checklist

This is the distilled execution roadmap.

Use this file to choose the next bounded task.

Do not use it as a research dump.
Do not replace `docs/swiftui_planning_full.md` with it.

`docs/swiftui_planning_full.md` remains the long-form planning and research source.

## Phase 1 - Parser Foundation
Pipeline Stages: Stage 1 Parser, Stage 2 Extractor
Status: Complete in the current worktree (required build verification remains externally blocked)

### Foundations

- [x] web-tree-sitter runtime initialization
- [x] Windows-safe WASM path resolution
- [x] CRLF normalization before parsing
- [x] AST depth-first walker
- [x] OutputChannel IR output from the extension command

### Core view extraction

- [x] `VStack`
- [x] `HStack`
- [x] `ZStack`
- [x] `Text`
- [x] `Button`
- [x] `Image`
- [x] `Spacer`
- [x] `if_statement` to `ConditionalContent`
- [x] `CustomViewNode` fallback for custom view call sites
- [x] `NavigationStack`
- [x] `NavigationLink`
- [x] `List`
- [x] `Section`
- [x] `ForEach`
- [x] `ScrollView`
- [x] `GeometryReader`
- [x] `Form`
- [x] `Toggle`
- [x] `TextField`
- [x] `SecureField`
- [x] `LazyVGrid`
- [x] `LazyHGrid`

### Core modifier extraction

- [x] `.font`
- [x] `.foregroundColor`
- [x] `.padding`
- [x] `.frame`
- [x] `.background`
- [x] `.cornerRadius`
- [x] `.opacity`
- [x] `.navigationTitle`
- [x] `.disabled`
- [x] `.overlay`
- [x] `.toolbar`
- [x] `.navigationDestination`
- [x] `.listStyle`
- [x] `.listRowInsets`
- [x] `.listRowSeparator`
- [x] `.fixedSize`
- [x] `.offset`
- [x] `.position`

### Validation and fixtures

- [x] repo-level parser integration test
- [x] build passes
- [x] per-extractor test files under `tests/parser/extractors`
- [x] broaden Swift snippet fixtures to cover navigation, lists, forms, and grids
- [x] add expected IR fixtures for major view families

## Phase 2 - Resolver
Pipeline Stage: Stage 3 Resolver
Status: In progress

- [ ] Add resolver module structure under `src/resolver`
- [ ] Implement state and binding stub injection per `docs/reference/ir/property-wrapper-stubs.md`
- [ ] Harden modifier flattening contracts
- [ ] Add resolver tests

### Recommended next bounded tasks

- [ ] Add the bounded Stage 3 resolver module scaffold plus focused smoke tests

## Phase 3 - Layout Foundation
Pipeline Stage: Stage 4 Layout
Status: Not started

- [ ] Add layout engine scaffolding
- [ ] Implement `Text` sizing from lookup tables
- [ ] Implement `VStack`, `HStack`, `ZStack`
- [ ] Implement `Spacer`
- [ ] Implement `.frame`
- [ ] Implement `.padding`
- [ ] Add layout fixtures and expected calculations

## Phase 4 - Renderer Foundation
Pipeline Stage: Stage 5 Renderer
Status: Not started

- [ ] Add renderer module scaffolding
- [ ] Add theme tokens and iOS semantic color usage
- [ ] Render text, shapes, backgrounds, and images
- [ ] Add SF Symbols seed map
- [ ] Build WebView preview bootstrap

## Phase 5 - Device and Interaction
Pipeline Stages: Stage 6 Device Frame, Stage 7 Interaction
Status: Not started

- [ ] Device selector and persistence
- [ ] iPhone 16 Pro chrome
- [ ] safe-area handling
- [ ] navigation state machine
- [ ] push and pop transitions

## Phase 6 - MCP Surface
Pipeline Stage: external integration
Status: Not started

- [ ] define MCP tool contract
- [ ] package stdio server
- [ ] expose render tool output
- [ ] document agent installation flow

## Review rule

When choosing work from this checklist:

- convert only one bullet cluster into `docs/agents/TASK.md`,
- keep the task inside one pipeline stage,
- treat unchecked later-phase items as future work, not defects in the current stage.
