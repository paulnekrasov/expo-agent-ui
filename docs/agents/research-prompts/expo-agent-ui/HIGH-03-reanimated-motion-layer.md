# Research Prompt: Reanimated Motion Layer

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a staff React Native animation engineer specializing in Reanimated and Expo. You are
researching the motion layer for Expo Agent UI: a SwiftUI-inspired animation API implemented
on top of Reanimated, not a new animation engine.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- The new product must use Reanimated for high-fidelity motion.
- It should expose SwiftUI-inspired presets such as `spring`, `bouncy`, `snappy`,
  `easeInOut`, transitions, layout transitions, and gesture-driven interactions.
- Motion should remain agent-observable where useful.

Task:
Research the current Reanimated 4 + Expo motion surface needed for Agent UI.
This prompt combines these high-priority knowledge gaps:
1. Reanimated 4 API details for layout transitions, gestures, reduced motion, and worklets.
2. Expo installation and version constraints for Reanimated and `react-native-worklets`.
3. How to map SwiftUI-style motion presets onto Reanimated APIs safely.

Primary questions to answer:
1. What Reanimated version is bundled or recommended by the current Expo SDK?
2. What install steps are currently required in Expo managed apps?
   Include `react-native-worklets`, Babel config, Metro config, and plugin requirements if any.
3. What are the core Reanimated 4 APIs Agent UI should use?
   Cover:
   - `useSharedValue`
   - `useAnimatedStyle`
   - `withSpring`
   - `withTiming`
   - `withSequence`
   - `withDelay`
   - `useDerivedValue`
   - `runOnJS`
   - layout transitions
   - entering/exiting animations
   - reduced motion APIs
4. What is the current recommended gesture integration path?
   Cover Reanimated + Gesture Handler if relevant.
5. How should Agent UI map these SwiftUI-like presets?
   - `motion.spring()`
   - `motion.bouncy()`
   - `motion.snappy()`
   - `motion.easeInOut({ duration })`
   - `transition.opacity`
   - `transition.slide`
   - `transition.scale`
   - `layoutTransition.smooth`
6. Which animated properties are safe and performant in React Native?
   Identify transform/opacity guidance and any layout-animation caveats.
7. How should reduced motion be detected and honored?
8. What runtime events can Agent UI realistically emit to the semantic layer?
   Examples: animation started, animation completed, transition interrupted.
9. What are web, Android, iOS, Expo Go, dev build, and New Architecture caveats?
10. What should be deferred until after v0?

Source policy:
- Use official Reanimated docs and Expo SDK docs first.
- Use React Native Gesture Handler docs where gestures are involved.
- Use source/type definitions when docs are incomplete.
- Use third-party performance guidance only as secondary evidence.
- Cite every API claim with source URL and access date.

Hard constraints:
- Do not invent animation APIs that Reanimated cannot support.
- Do not recommend layout-thrashing animations as defaults.
- Do not ignore reduced motion.
- Do not write production implementation code.
- Do not treat SwiftUI timing names as exact behavioral parity. They are taste mappings.

Required output:
Write a Markdown research report intended to become:
`docs/reference/motion/reanimated-4.md`

Use exactly this structure:

# Reanimated Motion Layer Research

## Executive Summary
- 5-10 bullets with direct implementation decisions.

## Version And Install Matrix
Table columns:
- Package
- Current version / range
- Required install step
- Expo managed behavior
- Bare workflow behavior
- Source URL

## Core API Findings
For each relevant API, include:
- purpose
- minimal example shape, if official docs provide one
- constraints
- Agent UI use case
- source URL

## SwiftUI-Style Preset Mapping
Table columns:
- Agent UI preset
- Reanimated primitive
- Recommended config
- Reduced motion behavior
- Caveats
- Source URL

## Layout Transition Strategy
Explain:
- when to use Reanimated layout transitions
- when to avoid them
- entering/exiting animation strategy
- list and form caveats
- semantic event hooks

## Gesture Strategy
Explain:
- required packages
- tap/press/drag/swipe support
- integration with semantic actions
- edge cases

## Platform Caveats
Cover iOS, Android, web, Expo Go, dev builds, New Architecture, and low-power/reduced-motion concerns.

## Deferred Work
List non-v0 motion capabilities and why they are deferred.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete Stage 6 motion implementation recommendation.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

