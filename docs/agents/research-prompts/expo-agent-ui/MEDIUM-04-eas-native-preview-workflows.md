# Research Prompt: EAS Native Preview And Multi-Session Adapter Comparison

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a senior Expo, EAS, and mobile developer tooling researcher. You are researching how
Agent UI should support native adapter preview, EAS-built iOS SwiftUI artifacts, Android Compose
preview, and side-by-side visual comparison without violating the semantic-first architecture.

Current date: 2026-04-27.

Repository context:
- Read `docs/PROJECT_BRIEF.md`.
- Read `docs/reference/INDEX.md`.
- Read `docs/reference/expo/expo-ui-swift-ui.md`.
- Read `docs/reference/expo/cross-platform-adapters.md`.
- Read `docs/reference/agent/cloud-flows-visual-comparison.md`.
- Agent UI core is React Native-first and JS-only for v0.
- `@expo/ui/swift-ui` and `@expo/ui/jetpack-compose` are optional adapter surfaces.
- Screenshots and simulator automation are evidence/interop, not the primary control model.

Task:
Research the EAS and runtime workflow needed for future native adapter preview and visual editor
comparison.

Primary questions to answer:
1. What can EAS Build currently do for iOS SwiftUI artifacts, including simulator builds and
   development builds?
2. What does EAS Build not provide by itself for live interactive iOS preview?
3. Which workflows let a Windows/Linux developer build iOS artifacts, and which workflows still
   require an iOS runtime such as an iOS Simulator, device, remote Mac, or cloud test capture?
4. What can EAS Workflows run for iOS simulator jobs and Android Emulator jobs?
5. How should Agent UI model side-by-side native comparison between:
   - iOS SwiftUI adapter runtime
   - Android Jetpack Compose adapter runtime
   - React Native fallback runtime
6. What metadata should each connected preview session expose?
   Include platform, adapter, build ID, update ID, runtime type, device, screen, capabilities,
   unsupported reasons, semantic tree, and redaction state.
7. What visual editor UX should be considered later, and what must remain out of v0?
8. What claims need implementation-time verification, especially around Expo Orbit, EAS Workflow
   artifacts, cloud screenshot/video capture, remote Mac options, and provider cost/privacy?
9. How should these findings modify Stage 7, Stage 9, and Stage 10 docs?

Source policy:
- Use official Expo and EAS documentation first.
- Use official `@expo/ui` docs for SwiftUI and Jetpack Compose claims.
- Use provider docs only for optional remote/cloud runtime claims.
- Cite every changing claim with URL and access date.
- Mark uncertain or provider-specific conclusions as `NEEDS_VERIFICATION`.

Hard constraints:
- Do not make native preview or visual editor work a v0 blocker.
- Do not claim one simulator can render both SwiftUI and Jetpack Compose.
- Do not treat screenshots or coordinates as the primary agent-control model.
- Do not recommend paid cloud infrastructure as a core dependency.
- Do not write production implementation code.

Required output:
Write a Markdown research report intended to become:
`docs/reference/expo/eas-native-preview.md`

Use exactly this structure:

# EAS Native Preview And Adapter Comparison Research

## Executive Summary
- 6-10 bullets with product decisions.

## Source Facts
Table columns:
- Area
- Current fact
- Product meaning
- Source

## Runtime Modes
Table columns:
- Mode
- What it gives
- What it does not give
- Agent UI use

## Adapter Switching Rules
Define what adapter switching can and cannot mean per platform.

## Visual Editor Implications
Describe the future multi-session editor surface and required session metadata.

## Research Gaps
List all `NEEDS_VERIFICATION` items.

## Implementation Placement
Map findings to Stage 4, Stage 5, Stage 7, Stage 9, and Stage 10.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete recommendation for Agent UI's native preview architecture.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

