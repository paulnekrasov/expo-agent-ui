# HANDOFF NOTE
From: deep debugging autonomous agent (Stage 5 MCP audit)
To: next Stage 6 implementer or automated runner
Session date: 2026-05-01

## Deep Debugging Audit Summary

Ran full deep debugging loop across the recently completed Stage 5 MCP server surface. All verification gates green. No High or Medium findings. Two Low findings documented: (1) `includeBounds` accepted in inspectTree schema but not passed to bridge, (2) session resource missing `expiresAt`. Both are deferred and documented.

## Previous Handoff

From: scheduled-run coordinator (sixth Stage 5 slice - final)

## What I Did

- Completed all remaining Stage 5 MCP server items in one bounded task:
  - Registered scroll, navigate, runFlow as MCP runtime-control tools with full JSON-Schema-compliant input schemas.
  - Added read-only MCP resources for sessions (`agent-ui://sessions`) and diagnostics (`agent-ui://diagnostics`).
  - Updated manifest: all 13 tools (9 runtime-control + 4 skill-context) now implemented; deferredTools and deferredSkillTools are empty.
  - Added 9 new MCP server tests: 3 SESSION_NOT_CONNECTED tests for new tools, updated listTools to 13, 2 schema validation tests, ListResource test for sessions/diagnostics, 2 ReadResource tests.
  - Updated roadmap checklist: Stage 5 marked COMPLETE.
  - 201 total tests pass (151 example-app + 50 mcp-server).

## MCP Tool Surface (Final Stage 5)

| Category | Tools |
|---|---|
| Runtime-control (9) | inspectTree, getState, tap, input, observeEvents, waitFor, scroll, navigate, runFlow |
| Skill-context (4) | listPlatformSkills, getPlatformSkill, searchPlatformSkills, recommendPlatformSkills |

## MCP Prompts (6)

choose_platform_skills, plan_native_scaffold, review_accessibility_semantics, prepare_visual_editor_notes, write_agent_task_notes, debug_stage_failure

## MCP Resources (13)

11 platform-skill resources + 2 runtime resources (sessions, diagnostics)

## Verification Completed

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0` (all 5 packages).
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0` (all 5 packages, including Android export).
- `cmd /c npm.cmd test --workspace @agent-ui/mcp-server -- --runInBand` exited `0`; 50 tests.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; 201 total tests.
- `cmd /c npm.cmd audit --audit-level=moderate` exited `0`; 0 vulnerabilities.
- CLI standalone `--help` exited `0`.
- `git diff --check` exited `0`.

## Known Concerns

- inspectTree's includeBounds/rootId accepted but not processed by bridge dispatcher.
- Bridge-level scroll/navigate/runFlow implementation in `packages/core` is deferred (MCP server delegates via `session.sendCommand()`).
- Platform skill resources/recommendations are hardcoded; dynamic INDEX.md parsing is deferred.
- Dynamic sub-file template URIs (`agent-ui://platform-skills/{name}/references/{ref}`) deferred.
- Expo SDK at 55.0.18 vs ~55.0.19 (minor patch drift, deferred).
- Session resource returns `connected: false` with `session: null` when no app is connected (not an error).

## What The Next Agent Must Do First

1. Read `docs/PROJECT_BRIEF.md` and `docs/reference/INDEX.md`.
2. Review `docs/agents/REVIEW.md` for the latest review (sixth slice at the top).
3. Stage 5 is complete. Create the next bounded Stage 6 task from `docs/agents/ROADMAP_CHECKLIST.md` Phase 6 - Motion Layer.
4. Read `docs/reference/motion/reanimated-4.md` and `docs/reference/motion/swiftui-motion-mapping.md`.

## What The Next Agent Must Not Do

- Do not bump Expo SDK version without a dedicated dependency-management pass.
- Do not add @expo/ui, Expo Router, React Navigation, native modules, or old parser assets.
- Do not recreate old SwiftUI parser, resolver, tree-sitter, WASM, VS Code extension, or Canvas renderer assets.
- Do not remove the --forceExit from listener tests without fixing the open-handle cleanup.
