# Research Prompt: React Native Accessibility As Semantic UI Foundation

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior React Native accessibility and semantic UI researcher. You are researching
how Expo Agent UI should build a machine-readable semantic UI layer that aligns with React
Native accessibility instead of inventing an incompatible parallel model.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- The real innovation is a semantic UI layer that lets agents reason by id, role, label,
  state, actions, intent, screen, and values instead of screenshots or coordinates.
- The semantic tree should enrich React Native accessibility props, not ignore them.

Task:
Research the React Native accessibility semantics needed to design the Agent UI semantic
registry and component metadata contract.
This prompt covers this high-priority knowledge gap:
1. React Native accessibility semantics across iOS and Android.

Primary questions to answer:
1. What are the current React Native accessibility props and what do they mean?
   Cover:
   - `accessible`
   - `accessibilityLabel`
   - `accessibilityHint`
   - `accessibilityRole`
   - `accessibilityState`
   - `accessibilityValue`
   - `accessibilityActions`
   - `onAccessibilityAction`
   - `accessibilityLiveRegion`
   - `importantForAccessibility`
   - `accessibilityElementsHidden`
   - `accessibilityViewIsModal`
   - `accessibilityLanguage`
   - `testID`
2. Which roles exist today, and how do they differ across iOS and Android?
3. How do accessibility state and value map to controls such as buttons, switches,
   sliders, text inputs, tabs, links, menus, and progress indicators?
4. What platform-specific differences matter for semantic introspection?
5. How should Agent UI map its semantic fields onto React Native accessibility?
   Proposed fields:
   - `id`
   - `type`
   - `label`
   - `screen`
   - `state`
   - `actions`
   - `intent`
   - `value`
   - `children`
   - `bounds`
   - `props`
6. Which semantic fields should be required for actionable controls?
7. How should `testID` relate to semantic `id`?
8. What values should be redacted from semantic snapshots?
9. How can the semantic tree preserve accessibility quality rather than only agent usability?
10. What conventions should be enforced by validation scripts?

Source policy:
- Use official React Native docs first.
- Use Apple and Android accessibility docs only to clarify platform behavior.
- Use React Native Testing Library docs only for testing implications.
- Use source/type definitions when docs are incomplete.
- Cite every claim with source URL and access date.

Hard constraints:
- Do not design a semantic layer that conflicts with accessibility.
- Do not use screenshots or coordinates as the primary model.
- Do not expose secrets or sensitive input values by default.
- Do not write production implementation code.
- Do not assume that `testID` alone is enough for semantic control.

Required output:
Write a Markdown research report intended to become:
`docs/reference/react-native/accessibility-semantics.md`

Use exactly this structure:

# React Native Accessibility And Semantic UI Research

## Executive Summary
- 5-10 bullets with concrete rules for Agent UI.

## Accessibility Prop Table
Table columns:
- Prop
- Meaning
- iOS behavior
- Android behavior
- Agent UI semantic mapping
- Source URL

## Role And Control Mapping
Table columns:
- Agent UI semantic type
- React Native component class
- Recommended accessibility role
- Recommended accessibility state/value
- Required semantic actions
- Notes

## Proposed Semantic Node Contract
Define a TypeScript-like schema. Mark each field:
- required
- optional
- dev-only
- redacted by default

## Required Metadata Rules
Specify rules for:
- stable IDs
- labels
- intents
- actions
- state
- values
- parent-child relationships
- generated IDs
- duplicate ID handling

## Privacy And Redaction Rules
List values that must never be exposed by default, such as passwords, tokens,
payment data, and personal data. Propose redaction markers.

## Validation Script Requirements
Define checks a future `validate-semantic-ids` script should run.

## Platform Caveats
Cover iOS, Android, web if relevant, screen readers, and test automation implications.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete Stage 3 semantic runtime recommendation.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

