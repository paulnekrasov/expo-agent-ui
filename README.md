# Expo Agent UI

Work in progress.

This repository is being rebuilt into a lightweight Expo + React Native toolkit for
SwiftUI-inspired screens, semantic UI metadata, local agent control tools, an MCP server, and a
reusable agent skill.

The previous VS Code SwiftUI parser/preview project has been retired from active development.

Core Agent UI is React Native-first and cross-platform. Native SwiftUI and Jetpack Compose are
optional platform-bound adapters: EAS can build iOS SwiftUI artifacts on cloud Macs, but live iOS
preview still needs an iOS runtime; Android Compose preview needs an Android runtime. Future
side-by-side preview is planned as a multi-session visual editor, not a single-simulator feature.

The agent skill layer can route to Expo, React Native, composition, native accessibility, native
design, Apple, Android, and context-engineering knowledge only when a task needs it. That knowledge
stays in the hidden agent workflow and does not become visible mobile UI. Repo-local copies of those
skills live under `docs/reference/agent/platform-skills/` so agents do not depend on a particular
global skill install.

The future MCP server may expose those skills as read-only resources, scoped prompts, and lookup
tools. Runtime-control tools remain separate and require implemented app bridge capabilities.

## Current Status

- Repo reset and cleanup are complete.
- Initial npm workspace/package scaffolding is in place.
- Next active work: React Native component primitives in `packages/core`.

## Start Here

- `AGENTS.md`
- `docs/PROJECT_BRIEF.md`
- `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`
- `docs/reference/agent/platform-skill-routing.md`
- `docs/reference/agent/platform-skill-mcp-surface.md`
- `docs/reference/agent/platform-skills/INDEX.md`
