# AGENTS.md

Shared startup guide for Codex, Claude, Gemini, and any other agent working in this repository.

`docs/CLAUDE.md` is the detailed project brief. Its filename is historical; treat it as project guidance for all agents, not Claude-only guidance.

## Start here

1. Read `docs/reference/INDEX.md` before touching code or making assumptions.
2. Read `docs/agents/ORCHESTRATION.md` for the workflow protocol and file roles.
3. Read `docs/agents/PHASE_STATE.md`, `docs/agents/HANDOFF.md`, and `docs/agents/ROADMAP_CHECKLIST.md` before choosing work.
4. Map the task to a pipeline stage before editing anything.
5. Open the stage-specific reference file listed in the index.
6. If `docs/agents/TASK.md` exists and is populated, treat it as the active bounded task.
7. If the task changes architecture, layout, rendering, or parser behavior, also read the relevant sections in `docs/CLAUDE.md`.

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
- Do not create temporary debug artifacts, scratch build folders, or throwaway compiled-output directories unless they are strictly necessary to investigate an issue. If one is created, remove it before finishing unless the developer explicitly asks to keep it.

## Git workflow

Repository: `https://github.com/paulnekrasov/swiftui-parser`
Default branch: `master` - stable only. Never commit directly to master.
Submodule: `tree-sitter-swift` - run `git submodule update --init` after cloning.

| Branch | Scope |
|---|---|
| `master` | Stable integration - PRs only |
| `dev/parser` | Stages 1-2: tree-sitter, AST walking, IR extraction |
| `dev/resolver` | Stage 3: resolver traversal, stub injection, modifier flattening |
| `dev/renderer` | Stages 5-6: Canvas painter, iOS colors, device chrome |
| `dev/extension` | VS Code host, WebView bridge, OutputChannel |
| `dev/mcp-server` | MCP server packaging and protocol |

- Work on the branch matching your stage. See Section 3 of `docs/CLAUDE.md` for stage definitions.
- Commit messages must identify the stage: e.g. `Stage 3 (Resolver): add recursive traversal for modifier-hosted views`
- Open a PR into `master` when the branch is ready - do not merge directly.
- If a downstream stage branch depends on an unmerged upstream stage branch, it may temporarily stack on that upstream branch.
- Merge stacked branches in stage order. Example: merge `dev/parser` into `master` before merging `dev/resolver` into `master`.
- Do not enable GitHub auto-merge for a stacked PR into `master` until its upstream stage branch has already landed and the PR is conflict-free against the current `master`.

## Session rule

If `docs/reference/INDEX.md` and `docs/CLAUDE.md` appear to disagree, verify the source material before changing behavior. The index is the router; `docs/CLAUDE.md` is the fuller project brief.

## Execution memory

- `docs/swiftui_planning_full.md` is the long-form research and planning source. Do not use it as mutable session memory.
- `docs/agents/ROADMAP_CHECKLIST.md` is the distilled execution roadmap for active work.
- `docs/agents/PHASE_STATE.md` is the live project state.
- `docs/agents/HANDOFF.md` is the last agent-to-agent note.
- `docs/agents/TASK.md` is the current bounded task.
- `docs/agents/REVIEW_CHECKLIST.md` is the stage-scoped review checklist.
- `docs/agents/REVIEW.md` is the living review log for the current task.
