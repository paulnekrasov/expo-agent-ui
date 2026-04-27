# Agent Catalog - Expo Agent UI

Repo-local agents are role prompts for the Expo Agent UI rebuild. They are optional helpers, not
durable state. Durable state lives in `docs/agents/*`.

## Core Workflow Roles

- `stage-orchestrator.md`: chooses or refreshes one bounded product-stage task.
- `phase-reviewer.md`: reviews the active task against the task spec and checklist.
- `issue-fixer.md`: fixes only actionable current-stage review findings.
- `research-librarian.md`: gathers or organizes authoritative references without production edits.

## Product-Stage Specialists

- `package-foundation-implementer.md`: Stage 1 package/workspace work.
- `component-primitives-implementer.md`: Stage 2 React Native-first primitive work.
- `semantic-runtime-engineer.md`: Stage 3 semantic registry and tree inspection.
- `agent-bridge-engineer.md`: Stage 4 local app bridge and tool dispatch.
- `mcp-server-engineer.md`: Stage 5 stdio MCP server.
- `motion-engineer.md`: Stage 6 Reanimated motion layer.
- `expo-ui-adapter-engineer.md`: Stage 7 optional `@expo/ui` adapter.
- `skill-author.md`: Stage 8 reusable agent skill.
- `cleanup-archivist.md`: dedicated cleanup/archive passes only.

## Removed Old Roles

Parser, resolver, layout renderer, device frame, Swift fixture, and VS Code extension roles were
retired during the Expo Agent UI cleanup. Do not recreate them unless a future archive task
explicitly asks for historical analysis.
