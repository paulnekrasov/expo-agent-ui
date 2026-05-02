# TASK SPECIFICATION
Created by: scheduled-run coordinator
Date: 2026-05-02
Roadmap Phase: Phase 10 - Publish Readiness
Product Stage: Stage 10 - Publish Readiness
Research Area: Platform skill routing, MCP surface, package foundation, EAS native preview, deployment/updates, compatibility decisions from research status

## Objective

Produce every publish-readiness asset: a comprehensive README walkthrough, compatibility matrix, installation guide, MCP configuration snippets, troubleshooting guide, and release checklist.

## Acceptance Criteria

### README.md (Comprehensive Walkthrough) — DONE
- [x] Project identity, north star, and what this is / is not
- [x] Full architecture diagram (ASCII)
- [x] Step-by-step installation walkthrough
- [x] Component catalog: all 19 primitives with usage examples
- [x] Semantic runtime walkthrough
- [x] Agent tool bridge
- [x] MCP server: 15 tools, config snippets, CLI flags
- [x] Agent skill
- [x] Flow runner: 7 step types, approval gates
- [x] Maestro YAML export
- [x] Patch proposals
- [x] Native preview comparison
- [x] Motion layer: presets, transitions, adapter contracts
- [x] Native adapters (SwiftUI + Jetpack Compose)
- [x] Platform skills: routing, MCP tools
- [x] Security model
- [x] Full MCP tool reference table

### Compatibility Matrix — DONE
- [x] docs/COMPATIBILITY.md (75 lines)

### Installation Guide — DONE
- [x] docs/INSTALL.md (194 lines)

### MCP Configuration — DONE
- [x] docs/MCP_CONFIG.md (480 lines)

### Troubleshooting Guide — DONE
- [x] docs/TROUBLESHOOTING.md (434 lines)

### Release Checklist — DONE
- [x] docs/RELEASE_CHECKLIST.md (369 lines)

## File Allowlist

- `README.md` (rewritten — 1405 lines)
- `docs/COMPATIBILITY.md` (created — 75 lines)
- `docs/INSTALL.md` (created — 194 lines)
- `docs/MCP_CONFIG.md` (created — 480 lines)
- `docs/TROUBLESHOOTING.md` (created — 434 lines)
- `docs/RELEASE_CHECKLIST.md` (created — 369 lines)
- `packages/core/src/index.ts` (fixed stale manifest)
- `packages/cli/src/index.ts` (fixed stale manifest)
- `docs/agents/TASK.md` (this file)
- `docs/agents/REVIEW.md` (updated — deep debugging report)
- `docs/agents/HANDOFF.md` (updated)
- `docs/agents/PHASE_STATE.md` (updated)
- `docs/agents/ROADMAP_CHECKLIST.md` (updated)
- `docs/agents/runtime-prompts/RUNTIME_STATUS.md` (updated)
- `C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md` (updated)

## Verification Commands

```powershell
cmd /c npm.cmd run typecheck --workspaces --if-present
cmd /c npm.cmd run build --workspaces --if-present
cmd /c npm.cmd test --workspaces --if-present
cmd /c npm.cmd audit --audit-level=moderate
git diff --check
```

## Status

DONE — All Stage 10 deliverables created via 4 parallel agents. Deep debugging audit found 8 findings (1 High, 3 Medium fixed, 4 Low deferred). All 473 tests pass. All verification gates green.
