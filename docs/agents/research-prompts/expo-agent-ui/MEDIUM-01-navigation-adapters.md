# Research Prompt: Expo Router And React Navigation Adapters

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior React Native navigation architecture researcher. You are researching how
Expo Agent UI should expose semantic navigation tools without replacing Expo Router or
React Navigation.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- Agent UI needs tools such as `navigate(screen)`, `inspectTree({ screen })`, and
  flow steps that move between screens.
- The project must sit on top of Expo Router and React Navigation. It must not build a
  replacement navigation framework.

Task:
Research navigation adapter design for Expo Agent UI.
This prompt combines these medium-priority knowledge gaps:
1. Expo Router route tree introspection APIs.
2. React Navigation adapter strategy.

Primary questions to answer:
1. What is the current Expo Router API surface for reading route state, navigating,
   linking, layouts, route segments, params, and root navigation state?
2. Does Expo Router expose a route tree or route metadata that Agent UI can inspect?
3. How should Agent UI attach semantic screen IDs to Expo Router routes?
4. How can Agent UI implement `navigate(screen)` over Expo Router without bypassing
   normal app navigation?
5. What is the current React Navigation API for reading navigation state, route names,
   params, navigation containers, linking config, and imperative navigation refs?
6. How should Agent UI support React Navigation apps that do not use Expo Router?
7. How should semantic screen metadata be represented?
   Proposed fields:
   - `screenId`
   - `routeName`
   - `path`
   - `params`
   - `title`
   - `isFocused`
   - `parent`
   - `children`
8. What edge cases matter?
   Cover nested navigators, tabs, stacks, modals, dynamic routes, deep links,
   protected routes, redirects, route groups, and stale route params.
9. What adapter API should `packages/core` expose?
10. What should be v0, and what can be deferred?

Source policy:
- Use official Expo Router docs first.
- Use official React Navigation docs first for React Navigation claims.
- Use type definitions/source only when docs are incomplete.
- Use third-party examples only as secondary evidence.
- Cite every claim with URL and access date.

Hard constraints:
- Do not replace Expo Router or React Navigation.
- Do not depend on private APIs unless clearly marked risky.
- Do not assume every app has route names that are stable enough for agents.
- Do not write production implementation code.
- Do not make navigation depend on screenshots.

Required output:
Write a Markdown research report intended to become:
`docs/reference/react-native/navigation-adapters.md`

Use exactly this structure:

# Navigation Adapter Research

## Executive Summary
- 5-10 bullets with concrete adapter decisions.

## Expo Router Findings
Cover:
- route state APIs
- navigation APIs
- segment/path APIs
- params
- route groups
- layouts
- limitations
- source URLs

## React Navigation Findings
Cover:
- navigation container state
- refs
- route names
- params
- linking
- nested navigators
- limitations
- source URLs

## Semantic Screen Contract
Define a schema for screen metadata and mark fields required/optional.

## Adapter API Recommendation
Propose public APIs for:
- registering a screen
- reading current screen
- navigating by semantic screen ID
- mapping screen IDs to routes
- handling params
- collecting navigation diagnostics

## Edge Cases
List all relevant edge cases and recommended behavior.

## V0 Scope
Classify features as:
- v0 required
- v0 optional
- post-v0
- avoid

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete Stage 4 navigation tool adapter recommendation.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

