# Agent Catalog

This folder contains the repo-local agent definitions for the workflow described in `docs/agents/ORCHESTRATION.md`.

## Core agents

- `stage-orchestrator.md`
  Purpose: choose the next bounded task, keep the loop inside one phase and one stage, refresh live state files.

- `research-librarian.md`
  Purpose: gather and structure authoritative reference material without mixing research with production coding.

- `parser-implementer.md`
  Purpose: implement Stage 1 and Stage 2 parser or extractor work and add tests.

- `phase-reviewer.md`
  Purpose: review the active task using `docs/agents/REVIEW_CHECKLIST.md` and produce `docs/agents/REVIEW.md`.

- `issue-fixer.md`
  Purpose: resolve only actionable review findings for the active stage.

- `fixture-author.md`
  Purpose: add fixtures, expected outputs, and validation coverage for the active stage.

## Future-stage specialists

- `resolver-implementer.md`
  Purpose: Stage 3 resolver work only.

- `layout-engineer.md`
  Purpose: Stage 4 layout engine work only.

- `renderer-engineer.md`
  Purpose: Stage 5 renderer work only.

- `device-frame-engineer.md`
  Purpose: Stage 6 device chrome and safe-area work only.

- `navigation-engineer.md`
  Purpose: Stage 7 navigation and transition work only.

- `mcp-engineer.md`
  Purpose: MCP packaging and protocol work once the core preview engine is ready.

## Recommended loop

1. `stage-orchestrator`
2. `parser-implementer` or another stage-specific implementer
3. `phase-reviewer`
4. `issue-fixer`
5. `phase-reviewer`
6. `stage-orchestrator`

## Guardrails

- One writer at a time for source files.
- Research and review can run read-only in parallel.
- Do not widen a task because related future-phase work exists nearby.
- Use `docs/agents/TASK.md` and `docs/agents/REVIEW.md` as the live coordination layer.
