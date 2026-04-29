# Research Prompt: Expo Agent UI Research Coordinator

Copy and paste this whole prompt into a fresh coordinator agent.

```text
Role / context:
You are the research coordinator for the Expo Agent UI rebuild. Your job is to run or assign
the research prompt library in priority order, verify that each output satisfies its prompt,
and produce a single gap-tracking summary without mixing unverified claims into the plan.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`.
- Read `docs/agents/research-prompts/expo-agent-ui/README.md`.
- The old SwiftUI parser project is no longer the strategic target.
- The new target is a lightweight Expo + React Native package, optional Expo config plugin,
  semantic runtime, MCP-style local agent tools, and agent skill.

Task:
Coordinate the full research program from high priority to low priority.

Research sequence:
1. Run all high-priority prompts first:
   - `HIGH-01-expo-package-foundation.md`
   - `HIGH-02-expo-ui-swiftui-adapter.md`
   - `HIGH-03-reanimated-motion-layer.md`
   - `HIGH-04-react-native-accessibility-semantics.md`
   - `HIGH-05-agent-bridge-mcp-transport.md`
2. Review the high-priority outputs for contradictions, missing citations, and blockers.
3. Only then run medium-priority prompts:
   - `MEDIUM-01-navigation-adapters.md`
   - `MEDIUM-02-testing-devtools-automation.md`
   - `MEDIUM-03-security-privacy-agent-control.md`
   - `MEDIUM-04-eas-native-preview-workflows.md`
4. Review medium-priority outputs for contradictions, missing citations, and blockers.
5. Run low-priority prompts only after high and medium are captured:
   - `LOW-01-cross-platform-adapters.md`
   - `LOW-02-figma-design-system-import.md`
   - `LOW-03-cloud-flows-visual-comparison.md`
6. Produce a consolidated research status report.

Quality gates for every research output:
- Official or primary sources are used for every current API claim.
- Every temporally unstable claim includes source URL and access date.
- Version numbers are explicit and not inferred from memory.
- Unverified claims are marked `NEEDS_VERIFICATION`.
- Each prompt ends with the required status token.
- The output path named in the prompt is respected.
- The output is a distilled engineering reference, not a raw link dump.

Hard constraints:
- Do not implement source code.
- Do not rewrite project state files unless explicitly asked.
- Do not treat low-priority future ideas as MVP blockers.
- Do not let one research task silently override another; record contradictions.
- Do not remove old project files in this coordinator pass.

Required output:
Write a Markdown coordination report intended to become:
`docs/agents/research-prompts/expo-agent-ui/RESEARCH_STATUS.md`

Use exactly this structure:

# Expo Agent UI Research Status

## Executive Summary
- 5-10 bullets about what is ready, blocked, or still unknown.

## Prompt Completion Matrix
Table columns:
- Priority
- Prompt file
- Output file
- Status token
- Key decision produced
- Blockers / concerns

## Cross-Prompt Decisions
List decisions that require combining more than one research output.
Examples:
- package dependency strategy
- `@expo/ui` optional peer strategy
- JS-only v0 feasibility
- runtime transport choice
- semantic/accessibility contract
- security default policy

## Contradictions To Resolve
For each contradiction:
- conflicting sources or reports
- why it matters
- recommended resolver prompt or next action

## MVP Blockers
List only blockers that prevent Stage 1 through Stage 5 implementation.
Do not include future low-priority ideas.

## Non-Blocking Future Research
List future research items that can wait.

## Reference Files Ready To Create
List the future `docs/reference/**` files that now have enough research backing.

## Recommended Next Bounded Task
Write the next implementation or documentation task in this format:
- Goal
- Non-goals
- Files affected
- Verification
- Acceptance criteria

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```
