# Research Prompt: Expo UI SwiftUI Adapter

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior Expo UI and native component researcher. You are researching how the
new Expo Agent UI project should integrate with `@expo/ui/swift-ui` while remaining a
thin layer on top of Expo and React Native.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- The new project provides SwiftUI-inspired React Native primitives with semantic metadata.
- It should use `@expo/ui/swift-ui` where it helps, but must not require it for every component.
- The core package must not become a new framework or a clone of SwiftUI.

Task:
Research the current `@expo/ui/swift-ui` API surface and decide how Agent UI should wrap it.
This prompt combines these high-priority knowledge gaps:
1. Current `@expo/ui/swift-ui` component and modifier API surface.
2. Whether `@expo/ui/swift-ui` is safe as a peer dependency or must remain optional.
3. How `Host`, modifiers, native platform constraints, and fallback behavior should shape
   the adapter design.

Primary questions to answer:
1. What is the current package name, install command, and supported Expo SDK range for Expo UI?
2. What imports are available from:
   - `@expo/ui`
   - `@expo/ui/swift-ui`
   - `@expo/ui/swift-ui/modifiers`
   - any Jetpack Compose or shared namespaces
3. What is `Host`? When is it required? What limitations does it introduce?
4. Which SwiftUI-backed components exist today?
   Build an API table with component names, props, platform support, and important caveats.
5. Which modifiers exist today?
   Build an API table with modifier names, inputs, supported components, and limitations.
6. What are the platform support boundaries?
   Cover iOS, Android, web, Expo Go, dev builds, managed workflow, and bare workflow.
7. How stable or experimental is Expo UI today?
   Identify wording from official docs, changelogs, or release notes.
8. Should Agent UI make `@expo/ui`:
   - a required dependency,
   - an optional peer dependency,
   - an adapter package dependency,
   - or not part of v0?
   Give a recommendation with tradeoffs.
9. Which Agent UI primitives should delegate to Expo UI in v0?
   Consider `Button`, `TextField`, `Picker`, `Slider`, `Toggle`, `List`, `Form`,
   `Menu`, `ContextMenu`, and native presentation controls.
10. How should fallback work on Android or web when a SwiftUI-backed primitive is unavailable?
11. How should semantic metadata wrap Expo UI components without breaking native behavior?

Source policy:
- Use official Expo UI docs and Expo SDK docs first.
- Use Expo source code, type definitions, package exports, and changelogs when docs are incomplete.
- Use issue trackers only to identify risks, and label them as secondary.
- Cite every API claim with source URL and access date.

Hard constraints:
- Do not invent components or modifiers.
- Do not assume `@expo/ui` is universal unless official docs say so.
- Do not recommend building custom native clones when a React Native fallback is sufficient.
- Do not write production implementation code.
- Do not produce a marketing summary. Produce an engineering decision document.

Required output:
Write a Markdown research report intended to become:
`docs/reference/expo/expo-ui-swift-ui.md`

Use exactly this structure:

# Expo UI SwiftUI Adapter Research

## Executive Summary
- 5-10 bullets with direct implications for Agent UI.

## Package And Version Facts
Table columns:
- Package / import
- Current status
- Install command
- Supported platform(s)
- Source URL

## Host Model
Explain:
- what `Host` does
- when it is required
- nesting constraints
- interaction with React Native layout
- implications for semantic registration

## Component API Table
Table columns:
- Component
- Import path
- Key props
- Platform support
- Agent UI primitive mapping
- Caveats
- Source URL

## Modifier API Table
Table columns:
- Modifier
- Import path
- Inputs
- Applies to
- Agent UI modifier mapping
- Caveats
- Source URL

## Optional Dependency Decision
Compare:
- required dependency
- optional peer
- separate adapter package
- deferred integration

Make a recommendation for v0 and explain why.

## Adapter Design Recommendation
Specify:
- package boundary
- public imports
- fallback behavior
- tree-shaking expectations
- semantic metadata wrapping
- testing strategy

## Unsupported Or Unknown Areas
List missing components, platform gaps, unstable APIs, and blockers.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete adapter strategy for Stage 7.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

