# Research Prompt: Cloud Flows, Replay, Screenshots, Visual Comparison

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior mobile QA infrastructure researcher. You are researching future cloud
recording, replay, screenshots, and visual comparison capabilities for Agent UI.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- Agent UI v0 should be local, semantic, and free for core agent control.
- Cloud recording and visual diff are low-priority future capabilities.
- Screenshots are useful evidence, but not the primary semantic-control model.

Task:
Research future cloud and visual validation options.
This prompt combines these low-priority knowledge gaps:
1. Cloud recording of flows.
2. Visual screenshot comparison.

Primary questions to answer:
1. What existing mobile/cloud QA tools are relevant to flow recording, replay, and visual diff?
   Consider Expo/EAS, Maestro Cloud, Detox in CI, Appium grids, BrowserStack, Sauce Labs,
   Percy, Chromatic-style tools, and any React Native-specific visual testing options.
2. Which tools support Expo apps directly?
3. Which tools require native builds, simulators, emulators, physical devices, or paid plans?
4. How should Agent UI semantic flows export to external test tools later?
5. What data should a cloud flow record contain?
   Consider semantic steps, app version, device, OS, screen size, locale, theme,
   accessibility settings, screenshots, logs, and event traces.
6. How should screenshot comparison be used without replacing semantic assertions?
7. What visual diff thresholds or ignore regions might be needed for mobile UI?
8. How should sensitive values be redacted from recordings?
9. What future architecture would support local-first flows with optional cloud recording?
10. What should be out of scope until the local semantic runtime is mature?

Source policy:
- Use official docs for each tool first.
- Use pricing/plan docs only to identify constraints; do not make business claims beyond them.
- Use third-party comparisons only as secondary context.
- Cite every claim with URL and access date.

Hard constraints:
- Do not make cloud services required for v0.
- Do not make screenshot diff the primary correctness model.
- Do not ignore privacy/redaction.
- Do not write production implementation code.
- Do not recommend a paid dependency as a core requirement.

Required output:
Write a Markdown research report intended to become:
`docs/reference/agent/cloud-flows-visual-comparison.md`

Use exactly this structure:

# Cloud Flows And Visual Comparison Research

## Executive Summary
- 5-10 bullets with future validation decisions.

## Tool Landscape
Table columns:
- Tool
- Flow recording
- Replay
- Screenshot capture
- Visual diff
- Expo support
- Device requirements
- Paid/free constraint
- Source URL

## Semantic Flow Export Strategy
Define how Agent UI flows could export to external tools without losing semantic intent.

## Recording Schema
Propose a future recording schema with privacy/redaction fields.

## Visual Comparison Strategy
Explain:
- when screenshots help
- when semantic assertions are better
- thresholds
- ignore regions
- device/theme/locale matrix
- risks

## Local-First Architecture
Describe how v0 local flows can evolve into optional cloud recording later.

## Deferred Work And Anti-Goals
List what not to build until after local semantic tools are stable.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete post-v0 cloud/visual validation strategy.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

