# AGENTS.md

Shared startup guide for Codex, Claude, Gemini, and any other agent working in this repository.

`docs/CLAUDE.md` is the detailed project brief. Its filename is historical; treat it as project guidance for all agents, not Claude-only guidance.

## Start here

1. Read `docs/reference/INDEX.md` before touching code or making assumptions.
2. Map the task to a pipeline stage before editing anything.
3. Open the stage-specific reference file listed in the index.
4. If the task changes architecture, layout, rendering, or parser behavior, also read the relevant sections in `docs/CLAUDE.md`.

## Fast entrypoints

- Parser / tree-sitter work: `docs/reference/layer-1-grammar/node-types.md`
- web-tree-sitter API work: `docs/reference/layer-2-parser-api/web-tree-sitter-api.md`
- ViewBuilder / extractor work: `docs/reference/layer-3-viewbuilder/result-builder-transforms.md`
- Layout engine work: `docs/reference/layer-4-layout/core-containers.md`
- Renderer / HIG work: `docs/reference/layer-5-hig/touch-typography-colors.md`
- VS Code WebView / packaging work: `docs/reference/layer-6-vscode/extension-packaging-csp.md`
- MCP work: `docs/reference/layer-7-mcp/mcp-protocol.md`
- Device chrome work: `docs/reference/layer-8-device-frames/device-frames.md`
- Navigation / transitions work: `docs/reference/layer-9-animations/navigation-transitions.md`
- IR and stubs: `docs/reference/ir/viewnode-types.md` and `docs/reference/ir/property-wrapper-stubs.md`

## Non-negotiables

- Do not guess tree-sitter node names. Use the exact names from `docs/reference/layer-1-grammar/node-types.md`.
- Keep stage boundaries clean. Parser code does not do layout; layout code does not render.
- Preserve `UnknownNode` as the final fallback in extraction.
- Do not throw in Stages 1-4; degrade gracefully.
- Use Windows-safe path handling only.
- Do not introduce a Swift runtime, remote Mac dependency, React, or a WebView framework.
- Use the shared constants and stub rules from `docs/reference/INDEX.md`.

## Git workflow

Repository: `https://github.com/paulnekrasov/swiftui-parser`
Default branch: `master` — stable only. Never commit directly to master.
Submodule: `tree-sitter-swift` — run `git submodule update --init` after cloning.

| Branch | Scope |
|---|---|
| `master` | Stable integration — PRs only |
| `dev/parser` | Stages 1–2: tree-sitter, AST walking, IR extraction |
| `dev/renderer` | Stages 5–6: Canvas painter, iOS colors, device chrome |
| `dev/extension` | VS Code host, WebView bridge, OutputChannel |
| `dev/mcp-server` | MCP server packaging and protocol |

- Work on the branch matching your stage. See Section 3 of `docs/CLAUDE.md` for stage definitions.
- Commit messages must identify the stage: e.g. `Stage 2 (Extractor): add HStack child collection`
- Open a PR into `master` when the branch is ready — do not merge directly.

## Session rule

If `docs/reference/INDEX.md` and `docs/CLAUDE.md` appear to disagree, verify the source material before changing behavior. The index is the router; `docs/CLAUDE.md` is the fuller project brief.
