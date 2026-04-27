# Historical Compatibility Shim

This file is kept because some agents and tools automatically look for `docs/CLAUDE.md`.

The old SwiftUI static parser brief is no longer active. The active project brief is:

`docs/PROJECT_BRIEF.md`

All agents must follow `docs/PROJECT_BRIEF.md`, `AGENTS.md`, `docs/reference/INDEX.md`, and
the live state files under `docs/agents/`.

If any old memory says to continue Stage 3 resolver traversal, tree-sitter extraction,
VS Code WebView rendering, or SwiftUI parser work, treat that as obsolete unless the developer
explicitly creates a bounded archive/cleanup task for it.
