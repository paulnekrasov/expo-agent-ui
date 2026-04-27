# Research Prompt: Testing, DevTools, And Automation Interop

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior React Native testing and developer-tools researcher. You are researching
how Expo Agent UI should test its semantic runtime, inspect development state, and interop
with existing mobile automation tools without making them hard dependencies.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- Agent UI needs repeatable flows and reliable semantic tool results.
- It should test semantic metadata directly and may interop later with simulator/device
  automation tools.

Task:
Research testing and devtools choices for Agent UI.
This prompt combines these medium-priority knowledge gaps:
1. React Native DevTools integration options.
2. React Native Testing Library role/query behavior.
3. Maestro/Detox/Appium interop if needed later.

Primary questions to answer:
1. What is the current React Native DevTools architecture and what extension/integration
   points are available to libraries?
2. Can Agent UI expose a semantic tree to DevTools? If yes, what are plausible approaches?
3. What does React Native Testing Library currently support for querying by role, label,
   text, accessibility state, and testID?
4. How should Agent UI test semantic components?
5. How should Agent UI test the runtime registry and action dispatch without a simulator?
6. What should unit, component, integration, and end-to-end tests cover?
7. What are Maestro, Detox, and Appium good at in this context?
8. Which automation tools can interact by accessibility IDs, test IDs, labels, or native IDs?
9. How can Agent UI flows export or interoperate with these tools later?
10. Which testing/devtools integrations should be v0, and which should be deferred?

Source policy:
- Use official React Native DevTools docs first.
- Use React Native Testing Library docs first.
- Use Maestro, Detox, and Appium official docs for automation claims.
- Use source/type definitions when docs are incomplete.
- Use third-party examples only as secondary evidence.
- Cite every claim with URL and access date.

Hard constraints:
- Do not make Maestro, Detox, or Appium required for v0.
- Do not require physical devices for core unit tests.
- Do not replace React Native Testing Library.
- Do not write production implementation code.
- Do not rely on screenshot matching as the semantic test foundation.

Required output:
Write a Markdown research report intended to become:
`docs/reference/react-native/testing-and-devtools.md`

Use exactly this structure:

# Testing, DevTools, And Automation Research

## Executive Summary
- 5-10 bullets with direct test strategy decisions.

## React Native DevTools Findings
Cover:
- current DevTools capabilities
- library integration options
- limitations
- source URLs

## React Native Testing Library Findings
Table columns:
- Query / assertion type
- Accessibility dependency
- Agent UI use case
- Caveats
- Source URL

## Test Strategy Matrix
Table columns:
- Layer
- What to test
- Tool
- Runs without simulator?
- Required fixtures
- V0 or later

Layers to include:
- pure semantic registry
- component primitives
- accessibility props
- action dispatch
- flow runner
- MCP server
- example app
- native adapters

## Automation Tool Interop
For Maestro, Detox, and Appium, cover:
- strengths
- selectors supported
- platform support
- CI implications
- how Agent UI could export flows
- v0 recommendation

## Flow Validation Strategy
Define how semantic flows should be tested before device automation exists.

## Deferred Integrations
List integrations that should wait until after the semantic runtime is stable.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete testing/devtools recommendation for Stage 3 through Stage 5.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

