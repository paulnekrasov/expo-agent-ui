# Research Prompt: Cross-Platform Adapters, Jetpack Compose, Web DOM

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior cross-platform React Native and Expo UI researcher. You are researching
future adapter paths for Agent UI beyond the core iOS/React Native implementation.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- Agent UI v0 should focus on Expo + React Native semantic runtime and optional iOS
  `@expo/ui/swift-ui` support.
- Cross-platform adapters are lower priority and should not block MVP.

Task:
Research future cross-platform adapter options.
This prompt combines these low-priority knowledge gaps:
1. Jetpack Compose adapter through `@expo/ui/jetpack-compose`.
2. Web/DOM adapter.

Primary questions to answer:
1. What does Expo UI currently provide for Jetpack Compose or Android-native UI?
2. What is the API surface, maturity, and platform support of any Compose-backed Expo UI
   components?
3. How different is the Compose adapter model from the SwiftUI adapter model?
4. What would Agent UI need to abstract to support both?
5. What is the current React Native Web / Expo web path for semantic components?
6. Can the semantic registry work on web with DOM accessibility attributes?
7. How should Agent UI map semantic props to web ARIA attributes?
8. Which cross-platform features can be shared across iOS, Android, and web?
9. Which features should remain platform-specific?
10. What should be explicitly deferred until after v0?

Source policy:
- Use official Expo UI docs first.
- Use official React Native Web / Expo web docs for web claims.
- Use Android Jetpack Compose docs only where Expo UI docs refer to Compose behavior.
- Use source/type definitions where docs are incomplete.
- Cite every claim with URL and access date.

Hard constraints:
- Do not make Android-native or web-native adapters MVP blockers.
- Do not assume Expo UI Compose support matches SwiftUI support.
- Do not recommend a custom native component layer without a clear reason.
- Do not write production implementation code.

Required output:
Write a Markdown research report intended to become:
`docs/reference/expo/cross-platform-adapters.md`

Use exactly this structure:

# Cross-Platform Adapter Research

## Executive Summary
- 5-10 bullets with future-platform decisions.

## Expo UI Android / Compose Findings
Cover:
- imports
- components
- maturity
- limitations
- source URLs

## Web / DOM Findings
Cover:
- Expo web behavior
- React Native Web accessibility mapping
- DOM/ARIA semantic opportunities
- limitations
- source URLs

## Shared Adapter Abstraction
Propose what Agent UI should keep platform-neutral and what should remain adapter-specific.

## Platform Feature Matrix
Table columns:
- Feature
- iOS SwiftUI adapter
- Android Compose adapter
- React Native fallback
- Web DOM adapter
- Recommendation

## Deferred Work
List future work and why it is not v0.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete post-v0 adapter strategy.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

