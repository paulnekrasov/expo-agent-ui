# Review Checklist

Use this checklist during review cycles.

Important:

- Apply only the sections that match the active pipeline stage.
- Do not review Stage 4 or Stage 5 obligations during a pure Stage 2 task.
- Record findings in `docs/agents/REVIEW.md` using the approved issue classes only.

## Always

- [ ] The task stays inside one pipeline stage
- [ ] The touched files match the allowlist in `docs/agents/TASK.md`
- [ ] No unrelated architectural drift was introduced
- [ ] The relevant reference docs were followed
- [ ] Build and relevant tests were run, or the limitation is explicitly stated
- [ ] Future-stage work is not mislabeled as a current bug

## Stage 1 and Stage 2

- [ ] All tree-sitter node names match `docs/reference/layer-1-grammar/node-types.md`
- [ ] Modifier chains preserve order correctly
- [ ] `UnknownNode` fallback exists where unsupported extraction is possible
- [ ] No `any` types were introduced in touched files
- [ ] Recursive extraction degrades gracefully rather than throwing
- [ ] CRLF normalization still happens before parsing
- [ ] Windows-safe path handling remains intact
- [ ] Tests use Swift snippet fixtures rather than mocked AST structures when possible

## Stage 3

- [ ] Resolver work does not add layout or rendering behavior
- [ ] Stub rules follow `docs/reference/ir/property-wrapper-stubs.md`
- [ ] Modifier flattening preserves source order
- [ ] Resolver failures degrade gracefully and keep the node usable when possible
- [ ] Resolver tests cover the new behavior

## Stage 4

- [ ] Layout code follows the propose -> accept -> place contract
- [ ] New layout work matches the relevant layer-4 reference docs
- [ ] No view exceeds its proposal unless the documented rule allows it
- [ ] `Spacer` behavior is correct on primary and cross axes
- [ ] Font metrics come from lookup tables, not `canvas.measureText()`
- [ ] Layout fixtures or expected calculations cover the new logic

## Stage 5

- [ ] Renderer work uses semantic color tokens rather than arbitrary hardcoded values where tokens exist
- [ ] Light and dark rendering behavior is considered
- [ ] SF Symbol fallback behavior still exists for unmapped symbols
- [ ] New renderer behavior has visual or structural verification where practical

## Stage 6

- [ ] Device chrome uses the shared device constants and reference docs
- [ ] Safe-area handling is device-aware rather than ad hoc
- [ ] Device-selection persistence does not break the core preview flow

## Stage 7

- [ ] Navigation and interaction logic stays separate from pure extraction and layout concerns
- [ ] Push and pop behavior follows the documented transition references
- [ ] State-machine changes are bounded and testable

## Review output rule

Every finding in `docs/agents/REVIEW.md` must include:

- issue class,
- affected file,
- why it matters,
- the governing rule or reference,
- and a concrete fix direction.
